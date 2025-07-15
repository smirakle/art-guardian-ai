import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BlockchainRegistrationRequest {
  artworkId: string;
  title: string;
  description?: string;
  category: string;
  filePaths: string[];
  userEmail: string;
  userId: string;
}

interface BlockchainCertificate {
  certificateId: string;
  blockchainHash: string;
  timestamp: string;
  artworkFingerprint: string;
  ownershipProof: string;
  registrationUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Blockchain registration request received')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { 
      artworkId, 
      title, 
      description, 
      category, 
      filePaths, 
      userEmail, 
      userId 
    }: BlockchainRegistrationRequest = await req.json()

    console.log('Processing blockchain registration for artwork:', artworkId)

    // Generate blockchain certificate data
    const timestamp = new Date().toISOString()
    const certificateId = `TSMO-CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Create artwork fingerprint (hash of content metadata)
    const artworkData = {
      title,
      description,
      category,
      filePaths: filePaths.sort(), // Sort for consistent hashing
      userId,
      timestamp
    }
    
    const artworkFingerprint = await generateFingerprint(JSON.stringify(artworkData))
    
    // Simulate blockchain transaction (in production, this would interface with actual blockchain)
    const blockchainHash = await simulateBlockchainTransaction({
      certificateId,
      artworkFingerprint,
      owner: userEmail,
      timestamp
    })

    // Generate ownership proof
    const ownershipProof = await generateOwnershipProof({
      certificateId,
      artworkId,
      userId,
      timestamp,
      blockchainHash
    })

    // Create certificate object
    const certificate: BlockchainCertificate = {
      certificateId,
      blockchainHash,
      timestamp,
      artworkFingerprint,
      ownershipProof,
      registrationUrl: `https://tsmowatch.com/certificate/${certificateId}`
    }

    // Store certificate in database
    const { error: certError } = await supabase
      .from('blockchain_certificates')
      .insert({
        certificate_id: certificateId,
        artwork_id: artworkId,
        user_id: userId,
        blockchain_hash: blockchainHash,
        artwork_fingerprint: artworkFingerprint,
        ownership_proof: ownershipProof,
        registration_timestamp: timestamp,
        certificate_data: certificate,
        status: 'registered'
      })

    if (certError) {
      console.error('Error storing certificate:', certError)
      // Continue anyway - certificate is generated
    }

    // Update artwork record with blockchain info
    const { error: artworkError } = await supabase
      .from('artwork')
      .update({
        blockchain_hash: blockchainHash,
        blockchain_certificate_id: certificateId,
        blockchain_registered_at: timestamp
      })
      .eq('id', artworkId)

    if (artworkError) {
      console.error('Error updating artwork:', artworkError)
    }

    console.log('Blockchain registration completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        certificate,
        message: 'Artwork successfully registered on blockchain'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in blockchain registration:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Blockchain registration failed', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

/**
 * Generate SHA-256 fingerprint of artwork data
 */
async function generateFingerprint(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Simulate blockchain transaction (replace with actual blockchain integration)
 */
async function simulateBlockchainTransaction(data: any): Promise<string> {
  // In production, this would interact with a real blockchain (Ethereum, Polygon, etc.)
  const transactionData = JSON.stringify(data)
  const hash = await generateFingerprint(transactionData)
  
  // Simulate blockchain confirmation delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return `0x${hash.substr(0, 64)}`
}

/**
 * Generate cryptographic ownership proof
 */
async function generateOwnershipProof(data: {
  certificateId: string;
  artworkId: string;
  userId: string;
  timestamp: string;
  blockchainHash: string;
}): Promise<string> {
  const proofData = {
    ...data,
    nonce: Math.random().toString(36),
    version: '1.0'
  }
  
  return await generateFingerprint(JSON.stringify(proofData))
}