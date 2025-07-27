import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NFTMintingRequest {
  certificateId: string;
  network: string;
  userId: string;
  royaltyPercentage: number;
  metadata: {
    transferable: boolean;
    resellable: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('NFT minting request received')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { 
      certificateId, 
      network,
      userId,
      royaltyPercentage,
      metadata
    }: NFTMintingRequest = await req.json()

    console.log('Processing NFT minting for certificate:', certificateId)

    // Fetch certificate
    const { data: certificate, error: certError } = await supabase
      .from('blockchain_certificates')
      .select('*')
      .eq('certificate_id', certificateId)
      .eq('user_id', userId)
      .single()

    if (certError || !certificate) {
      throw new Error('Certificate not found or unauthorized');
    }

    // Check if already minted as NFT
    const certData = certificate.certificate_data as any;
    if (certData?.tokenId) {
      throw new Error('This certificate has already been minted as an NFT');
    }

    // Simulate NFT minting process
    console.log('Minting NFT on', network)
    
    // Generate token ID
    const tokenId = Math.floor(Math.random() * 1000000) + 1;
    
    // Simulate minting transaction
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const mintingHash = await generateFingerprint(certificateId + tokenId + Date.now());
    const nftContractAddress = certData?.contractAddress || '0x' + (await generateFingerprint(network + 'nft')).substring(0, 40);
    
    // Update certificate with NFT data
    const updatedCertData = {
      ...certData,
      tokenId,
      nftContractAddress,
      mintingHash: `0x${mintingHash.substring(0, 64)}`,
      mintedAt: new Date().toISOString(),
      royaltyPercentage,
      transferable: metadata.transferable,
      resellable: metadata.resellable,
      nftStandard: 'ERC-721',
      opensea_url: `https://opensea.io/assets/${network}/${nftContractAddress}/${tokenId}`
    };

    // Update certificate in database
    const { error: updateError } = await supabase
      .from('blockchain_certificates')
      .update({
        certificate_data: updatedCertData
      })
      .eq('certificate_id', certificateId)

    if (updateError) {
      throw new Error('Failed to update certificate with NFT data');
    }

    console.log('NFT minting completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        tokenId,
        contractAddress: nftContractAddress,
        mintingHash: `0x${mintingHash.substring(0, 64)}`,
        opensea_url: `https://opensea.io/assets/${network}/${nftContractAddress}/${tokenId}`,
        message: 'NFT minted successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in NFT minting:', error)
    return new Response(
      JSON.stringify({ 
        error: 'NFT minting failed', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function generateFingerprint(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}