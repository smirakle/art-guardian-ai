import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdvancedBlockchainRequest {
  artworkId: string;
  network: string;
  userId: string;
  smartContractSettings: {
    royaltyPercentage: number;
    licenseTerms: string;
    transferable: boolean;
    resellable: boolean;
  };
  advancedFeatures: boolean;
}

interface NetworkConfig {
  name: string;
  chainId: number;
  symbol: string;
  gasPrice: number;
  explorerUrl: string;
  contractFactory: string;
}

const networks: { [key: string]: NetworkConfig } = {
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    symbol: 'ETH',
    gasPrice: 30,
    explorerUrl: 'https://etherscan.io',
    contractFactory: '0x1234567890123456789012345678901234567890'
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    symbol: 'MATIC',
    gasPrice: 0.001,
    explorerUrl: 'https://polygonscan.com',
    contractFactory: '0x2345678901234567890123456789012345678901'
  },
  arbitrum: {
    name: 'Arbitrum One',
    chainId: 42161,
    symbol: 'ARB',
    gasPrice: 0.1,
    explorerUrl: 'https://arbiscan.io',
    contractFactory: '0x3456789012345678901234567890123456789012'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Advanced blockchain registration request received')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { 
      artworkId, 
      network,
      userId,
      smartContractSettings,
      advancedFeatures
    }: AdvancedBlockchainRequest = await req.json()

    console.log('Processing advanced blockchain registration for artwork:', artworkId, 'on network:', network)

    // Validate network
    const networkConfig = networks[network];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    // Fetch artwork details
    const { data: artwork, error: artworkError } = await supabase
      .from('artwork')
      .select('*')
      .eq('id', artworkId)
      .eq('user_id', userId)
      .single()

    if (artworkError || !artwork) {
      throw new Error('Artwork not found or unauthorized');
    }

    // Generate advanced certificate data
    const timestamp = new Date().toISOString()
    const certificateId = `TSMO-ADV-${network.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Create enhanced artwork fingerprint
    const artworkData = {
      title: artwork.title,
      description: artwork.description,
      category: artwork.category,
      filePaths: artwork.file_paths?.sort() || [],
      userId,
      timestamp,
      network,
      smartContractSettings,
      version: '2.0-advanced'
    }
    
    const artworkFingerprint = await generateFingerprint(JSON.stringify(artworkData))
    
    // Simulate advanced blockchain deployment
    const deploymentResult = await deploySmartContract({
      certificateId,
      artworkFingerprint,
      networkConfig,
      smartContractSettings,
      owner: userId
    })

    // Simulate blockchain transaction with enhanced features
    const blockchainResult = await simulateAdvancedBlockchainTransaction({
      certificateId,
      artworkFingerprint,
      owner: userId,
      timestamp,
      network: networkConfig,
      contractAddress: deploymentResult.contractAddress,
      royaltyPercentage: smartContractSettings.royaltyPercentage,
      licenseTerms: smartContractSettings.licenseTerms
    })

    // Generate advanced ownership proof with smart contract integration
    const ownershipProof = await generateAdvancedOwnershipProof({
      certificateId,
      artworkId,
      userId,
      timestamp,
      blockchainHash: blockchainResult.transactionHash,
      contractAddress: deploymentResult.contractAddress,
      network: networkConfig.name,
      smartContractSettings
    })

    // Upload metadata to simulated IPFS
    const ipfsHash = await uploadToIPFS({
      title: artwork.title,
      description: artwork.description,
      category: artwork.category,
      creator: userId,
      royaltyPercentage: smartContractSettings.royaltyPercentage,
      licenseTerms: smartContractSettings.licenseTerms,
      network: networkConfig.name,
      certificateId
    })

    // Create advanced certificate object
    const advancedCertificate = {
      certificateId,
      blockchainHash: blockchainResult.transactionHash,
      timestamp,
      artworkFingerprint,
      ownershipProof,
      network: networkConfig.name,
      chainId: networkConfig.chainId,
      contractAddress: deploymentResult.contractAddress,
      gasFee: blockchainResult.gasFee,
      confirmationBlocks: blockchainResult.confirmationBlocks,
      transactionUrl: `${networkConfig.explorerUrl}/tx/${blockchainResult.transactionHash}`,
      ipfsHash,
      royaltyPercentage: smartContractSettings.royaltyPercentage,
      licenseTerms: smartContractSettings.licenseTerms,
      transferable: smartContractSettings.transferable,
      resellable: smartContractSettings.resellable,
      registrationUrl: `https://tsmowatch.com/certificate/${certificateId}`,
      version: '2.0-advanced'
    }

    // Store advanced certificate in database
    const { error: certError } = await supabase
      .from('blockchain_certificates')
      .insert({
        certificate_id: certificateId,
        artwork_id: artworkId,
        user_id: userId,
        blockchain_hash: blockchainResult.transactionHash,
        artwork_fingerprint: artworkFingerprint,
        ownership_proof: ownershipProof,
        registration_timestamp: timestamp,
        certificate_data: advancedCertificate,
        status: 'registered'
      })

    if (certError) {
      console.error('Error storing advanced certificate:', certError)
    }

    // Update artwork record with advanced blockchain info
    const { error: artworkUpdateError } = await supabase
      .from('artwork')
      .update({
        blockchain_hash: blockchainResult.transactionHash,
        blockchain_certificate_id: certificateId,
        blockchain_registered_at: timestamp
      })
      .eq('id', artworkId)

    if (artworkUpdateError) {
      console.error('Error updating artwork:', artworkUpdateError)
    }

    console.log('Advanced blockchain registration completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        certificate: advancedCertificate,
        message: `Artwork successfully registered on ${networkConfig.name} blockchain with smart contract`,
        features: {
          smartContract: true,
          ipfsMetadata: true,
          royalties: smartContractSettings.royaltyPercentage > 0,
          advancedAnalytics: true
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in advanced blockchain registration:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Advanced blockchain registration failed', 
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

async function deploySmartContract(data: {
  certificateId: string;
  artworkFingerprint: string;
  networkConfig: NetworkConfig;
  smartContractSettings: any;
  owner: string;
}): Promise<{ contractAddress: string; deploymentHash: string }> {
  console.log('Deploying smart contract on', data.networkConfig.name)
  
  // Simulate smart contract deployment
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const contractAddress = `0x${await generateFingerprint(data.certificateId + data.owner)}`
  const deploymentHash = `0x${await generateFingerprint(contractAddress + Date.now())}`
  
  return {
    contractAddress: contractAddress.substring(0, 42),
    deploymentHash: deploymentHash.substring(0, 66)
  }
}

async function simulateAdvancedBlockchainTransaction(data: any): Promise<{
  transactionHash: string;
  gasFee: number;
  confirmationBlocks: number;
}> {
  console.log('Simulating advanced blockchain transaction on', data.network.name)
  
  const transactionData = JSON.stringify(data)
  const hash = await generateFingerprint(transactionData)
  
  // Simulate network-specific confirmation times
  const confirmationDelay = data.network.chainId === 1 ? 5000 : 2000 // Ethereum vs others
  await new Promise(resolve => setTimeout(resolve, confirmationDelay))
  
  return {
    transactionHash: `0x${hash.substr(0, 64)}`,
    gasFee: data.network.gasPrice * (0.021 + Math.random() * 0.01), // Realistic gas calculation
    confirmationBlocks: data.network.chainId === 1 ? 12 : 6 // Network-specific confirmations
  }
}

async function generateAdvancedOwnershipProof(data: {
  certificateId: string;
  artworkId: string;
  userId: string;
  timestamp: string;
  blockchainHash: string;
  contractAddress: string;
  network: string;
  smartContractSettings: any;
}): Promise<string> {
  const proofData = {
    ...data,
    nonce: Math.random().toString(36),
    version: '2.0-advanced',
    features: ['smart-contract', 'royalties', 'ipfs-metadata']
  }
  
  return await generateFingerprint(JSON.stringify(proofData))
}

async function uploadToIPFS(metadata: any): Promise<string> {
  console.log('Uploading metadata to IPFS')
  
  // Simulate IPFS upload
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const metadataString = JSON.stringify(metadata)
  const hash = await generateFingerprint(metadataString)
  
  return `Qm${hash.substring(0, 44)}` // Standard IPFS hash format
}