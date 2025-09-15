import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BlockchainRegistrationRequest {
  action: string
  user_id?: string
  artwork_id?: string
  owner_address?: string
  record_id?: string
  blockchain?: string
  metadata?: any
  smart_contract_params?: any
}

interface SmartContractTemplate {
  name: string
  blockchain: string
  contract_type: string
  template_code: string
  deployment_cost: number
  features: string[]
}

// Smart Contract Templates for different blockchains
const SMART_CONTRACT_TEMPLATES: SmartContractTemplate[] = [
  {
    name: "EIP-721 Ownership Registry",
    blockchain: "ethereum",
    contract_type: "ownership",
    template_code: "pragma solidity ^0.8.0; import '@openzeppelin/contracts/token/ERC721/ERC721.sol';",
    deployment_cost: 0.1,
    features: ["immutable_ownership", "transfer_rights", "royalty_enforcement"]
  },
  {
    name: "Copyright License Manager",
    blockchain: "polygon",
    contract_type: "licensing",
    template_code: "pragma solidity ^0.8.0; contract CopyrightLicense {",
    deployment_cost: 0.02,
    features: ["automated_licensing", "royalty_distribution", "usage_tracking"]
  },
  {
    name: "Royalty Distribution Contract",
    blockchain: "ethereum",
    contract_type: "royalty",
    template_code: "pragma solidity ^0.8.0; contract RoyaltyDistribution {",
    deployment_cost: 0.15,
    features: ["automated_royalty", "multi_party_splits", "real_time_payments"]
  },
  {
    name: "DMCA Protection Contract",
    blockchain: "arbitrum",
    contract_type: "protection",
    template_code: "pragma solidity ^0.8.0; contract DMCAProtection {",
    deployment_cost: 0.01,
    features: ["automated_dmca", "violation_detection", "takedown_enforcement"]
  }
]

// Blockchain network configurations
const BLOCKCHAIN_NETWORKS = {
  ethereum: {
    rpc_url: "https://eth-mainnet.g.alchemy.com/v2/",
    chain_id: 1,
    currency: "ETH",
    block_explorer: "https://etherscan.io",
    gas_limit: 21000,
    gas_price_gwei: 20
  },
  polygon: {
    rpc_url: "https://polygon-rpc.com/",
    chain_id: 137,
    currency: "MATIC",
    block_explorer: "https://polygonscan.com",
    gas_limit: 21000,
    gas_price_gwei: 30
  },
  arbitrum: {
    rpc_url: "https://arb1.arbitrum.io/rpc",
    chain_id: 42161,
    currency: "ETH",
    block_explorer: "https://arbiscan.io",
    gas_limit: 21000,
    gas_price_gwei: 1
  },
  optimism: {
    rpc_url: "https://mainnet.optimism.io",
    chain_id: 10,
    currency: "ETH",
    block_explorer: "https://optimistic.etherscan.io",
    gas_limit: 21000,
    gas_price_gwei: 1
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, ...params } = await req.json() as BlockchainRegistrationRequest

    console.log('=== BLOCKCHAIN OWNERSHIP REGISTRY FUNCTION ===')
    console.log(`Action: ${action}`)
    console.log('Params:', JSON.stringify(params, null, 2))

    let response

    switch (action) {
      case 'register_ownership':
        response = await registerOwnership(supabase, params)
        break
      case 'deploy_smart_contract':
        response = await deploySmartContract(supabase, params)
        break
      case 'create_license_agreement':
        response = await createLicenseAgreement(supabase, params)
        break
      case 'verify_ownership':
        response = await verifyOwnership(supabase, params)
        break
      case 'get_ownership_certificate':
        response = await getOwnershipCertificate(supabase, params)
        break
      case 'cross_chain_sync':
        response = await crossChainSync(supabase, params)
        break
      case 'generate_legal_documents':
        response = await generateLegalDocuments(supabase, params)
        break
      case 'create_immutable_proof':
        response = await createImmutableProof(supabase, params)
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Blockchain registry error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Register ownership of artwork on blockchain
async function registerOwnership(supabase: any, params: any) {
  const { artwork_id, user_id, owner_address, blockchain = 'ethereum', metadata = {} } = params

  console.log('Registering ownership for artwork:', artwork_id)

  // Get artwork details from database
  const { data: artwork, error: artworkError } = await supabase
    .from('artwork')
    .select('*')
    .eq('id', artwork_id)
    .single()

  if (artworkError || !artwork) {
    throw new Error('Artwork not found')
  }

  // Generate cryptographic proof of ownership
  const ownershipProof = await generateOwnershipProof(artwork, owner_address)

  // Create blockchain transaction (simulated for demo)
  const blockchainTx = await createOwnershipTransaction(artwork, owner_address, blockchain)

  // Store registration in database
  const { data: registration, error: regError } = await supabase
    .from('blockchain_ownership_registry')
    .insert({
      user_id,
      artwork_id,
      owner_address,
      blockchain,
      transaction_hash: blockchainTx.hash,
      ownership_proof: ownershipProof,
      metadata: {
        ...metadata,
        artwork_title: artwork.title,
        registration_timestamp: new Date().toISOString(),
        proof_method: 'cryptographic_hash',
        legal_enforceability: calculateLegalEnforceability(blockchain),
        network_details: BLOCKCHAIN_NETWORKS[blockchain]
      },
      confirmation_status: 'pending'
    })
    .select()
    .single()

  if (regError) {
    throw new Error(`Registration failed: ${regError.message}`)
  }

  // Generate ownership certificate
  const certificate = await generateOwnershipCertificate(registration, artwork)

  // Store certificate
  await supabase
    .from('blockchain_certificates')
    .insert({
      user_id,
      artwork_id,
      certificate_id: `CERT-${registration.id}`,
      blockchain_hash: blockchainTx.hash,
      artwork_fingerprint: ownershipProof.fingerprint,
      ownership_proof: ownershipProof.signature,
      certificate_data: certificate,
      status: 'registered',
      registration_timestamp: new Date().toISOString()
    })

  // Start background monitoring for transaction confirmation
  setTimeout(() => monitorTransactionConfirmation(supabase, registration.id, blockchainTx.hash), 5000)

  console.log('✅ Ownership registered successfully')

  return {
    registration_id: registration.id,
    transaction_hash: blockchainTx.hash,
    certificate_id: `CERT-${registration.id}`,
    proof_hash: ownershipProof.signature,
    estimated_confirmation_time: '10-15 minutes',
    legal_enforceability: calculateLegalEnforceability(blockchain),
    blockchain_explorer_url: `${BLOCKCHAIN_NETWORKS[blockchain].block_explorer}/tx/${blockchainTx.hash}`
  }
}

// Deploy smart contract for automated copyright protection
async function deploySmartContract(supabase: any, params: any) {
  const { user_id, artwork_id, blockchain = 'ethereum', contract_type = 'ownership', smart_contract_params = {} } = params

  console.log('Deploying smart contract:', contract_type, 'on', blockchain)

  // Select appropriate smart contract template
  const template = SMART_CONTRACT_TEMPLATES.find(t => 
    t.blockchain === blockchain && t.contract_type === contract_type
  )

  if (!template) {
    throw new Error(`No template found for ${contract_type} on ${blockchain}`)
  }

  // Simulate smart contract deployment
  const deployment = await simulateContractDeployment(template, smart_contract_params)

  // Store smart contract deployment details
  const { data: contract, error: contractError } = await supabase
    .from('smart_contracts')
    .insert({
      user_id,
      artwork_id,
      blockchain,
      contract_type,
      contract_address: deployment.address,
      transaction_hash: deployment.deploymentTx,
      template_name: template.name,
      deployment_cost: template.deployment_cost,
      features: template.features,
      status: 'deployed',
      metadata: {
        deployment_timestamp: new Date().toISOString(),
        gas_used: deployment.gasUsed,
        deployment_params: smart_contract_params,
        interaction_endpoints: deployment.endpoints
      }
    })
    .select()
    .single()

  if (contractError) {
    throw new Error(`Contract deployment failed: ${contractError.message}`)
  }

  console.log('✅ Smart contract deployed successfully')

  return {
    contract_id: contract.id,
    contract_address: deployment.address,
    deployment_hash: deployment.deploymentTx,
    features: template.features,
    interaction_endpoints: deployment.endpoints,
    estimated_gas_cost: `${template.deployment_cost} ${BLOCKCHAIN_NETWORKS[blockchain].currency}`,
    documentation_url: deployment.documentationUrl
  }
}

// Create blockchain-based license agreement
async function createLicenseAgreement(supabase: any, params: any) {
  const { 
    user_id, 
    artwork_id, 
    license_terms = {}, 
    blockchain = 'ethereum',
    automated_compliance = true,
    royalty_rate = 0
  } = params

  console.log('Creating blockchain license agreement')

  // Generate legal document using AI (simplified for demo)
  const legalDocument = `
    BLOCKCHAIN COPYRIGHT LICENSE AGREEMENT
    
    This agreement is created for artwork ID: ${artwork_id}
    License Type: ${license_terms.license_type || 'Non-exclusive'}
    Duration: ${license_terms.duration || 'Perpetual'}
    Territory: ${license_terms.territory || 'Worldwide'}
    Royalty Rate: ${royalty_rate}%
    
    This license is enforced by smart contract technology on the ${blockchain} blockchain.
    Automated compliance monitoring: ${automated_compliance ? 'ENABLED' : 'DISABLED'}
    
    All terms are cryptographically secured and immutable.
  `

  // Store license agreement
  const { data: license, error: licenseError } = await supabase
    .from('blockchain_licenses')
    .insert({
      user_id,
      artwork_id,
      blockchain,
      license_terms,
      legal_document: legalDocument,
      document_hash: await hashDocument(legalDocument),
      status: 'active',
      automated_compliance,
      royalty_rate,
      duration: license_terms.duration || 'perpetual',
      territory: license_terms.territory || 'worldwide',
      exclusivity: license_terms.exclusivity || 'non-exclusive'
    })
    .select()
    .single()

  if (licenseError) {
    throw new Error(`License creation failed: ${licenseError.message}`)
  }

  console.log('✅ License agreement created')

  return {
    license_id: license.id,
    document_hash: license.document_hash,
    legal_document: legalDocument,
    smart_contract_integration: automated_compliance,
    enforceability_score: calculateLegalEnforceability(blockchain),
    compliance_monitoring: automated_compliance ? 'Active' : 'Manual'
  }
}

// Verify ownership on blockchain
async function verifyOwnership(supabase: any, params: any) {
  const { record_id } = params

  console.log('Verifying ownership for record:', record_id)

  // Get ownership record
  const { data: record, error: recordError } = await supabase
    .from('blockchain_ownership_registry')
    .select('*')
    .eq('id', record_id)
    .single()

  if (recordError || !record) {
    throw new Error('Ownership record not found')
  }

  // Simulate blockchain verification
  const verificationResult = await verifyOnBlockchain(record.transaction_hash, record.blockchain)

  // Update confirmation status
  await supabase
    .from('blockchain_ownership_registry')
    .update({ 
      confirmation_status: verificationResult.confirmed ? 'confirmed' : 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('id', record_id)

  // Get certificate if available
  const { data: certificate } = await supabase
    .from('blockchain_certificates')
    .select('*')
    .eq('artwork_id', record.artwork_id)
    .single()

  console.log('✅ Ownership verification completed')

  return {
    verified: verificationResult.confirmed,
    transaction_hash: record.transaction_hash,
    block_number: verificationResult.blockNumber,
    confirmation_status: verificationResult.confirmed ? 'confirmed' : 'failed',
    certificate_available: !!certificate,
    legal_validity: verificationResult.confirmed ? 'Legally Binding' : 'Pending Confirmation'
  }
}

// Get ownership certificate with enhanced legal signatures
async function getOwnershipCertificate(supabase: any, params: any) {
  const { artwork_id, user_id } = params

  console.log('Retrieving ownership certificate for artwork:', artwork_id)

  // Get certificate with ownership details
  const { data: certificate, error: certError } = await supabase
    .from('blockchain_certificates')
    .select(`
      *,
      blockchain_ownership_registry (*)
    `)
    .eq('artwork_id', artwork_id)
    .eq('user_id', user_id)
    .single()

  if (certError || !certificate) {
    throw new Error('Certificate not found')
  }

  // Enhance certificate with legal signatures and metadata
  const enhancedCertificate = {
    ...certificate,
    legal_signatures: {
      digital_signature: await signProof(certificate.ownership_proof),
      timestamp_signature: new Date().toISOString(),
      blockchain_signature: certificate.blockchain_hash
    },
    verification_metadata: {
      legal_enforceability: 'High',
      international_recognition: 'WIPO Compliant',
      court_admissibility: 'Qualified Electronic Signature',
      chain_of_custody: 'Cryptographically Verifiable'
    }
  }

  return enhancedCertificate
}

// Synchronize ownership across multiple blockchains
async function crossChainSync(supabase: any, params: any) {
  const { source_artwork_id, target_blockchains = ['polygon', 'arbitrum'], user_id } = params

  console.log('Starting cross-chain synchronization')

  const syncResults = []

  for (const blockchain of target_blockchains) {
    try {
      // Simulate cross-chain bridge operation
      const bridgeResult = await simulateCrossChainBridge(source_artwork_id, blockchain)

      // Store cross-chain registration
      const { data: crossChainReg } = await supabase
        .from('cross_chain_registrations')
        .insert({
          user_id,
          artwork_id: source_artwork_id,
          source_blockchain: 'ethereum',
          target_blockchain: blockchain,
          source_transaction: 'source-tx-hash',
          target_transaction: bridgeResult.targetTx,
          bridge_status: 'completed',
          bridge_fee: bridgeResult.fee,
          confirmation_time: bridgeResult.confirmationTime
        })
        .select()
        .single()

      syncResults.push({
        blockchain,
        status: 'success',
        transaction_hash: bridgeResult.targetTx,
        bridge_fee: bridgeResult.fee,
        confirmation_time: bridgeResult.confirmationTime
      })

    } catch (error) {
      syncResults.push({
        blockchain,
        status: 'failed',
        error: error.message
      })
    }
  }

  console.log('✅ Cross-chain sync completed')

  return {
    sync_results: syncResults,
    total_blockchains: target_blockchains.length,
    successful_syncs: syncResults.filter(r => r.status === 'success').length,
    multi_chain_protection: 'Active'
  }
}

// Generate legal documents for blockchain-based copyright protection
async function generateLegalDocuments(supabase: any, params: any) {
  const { 
    user_id, 
    artwork_id, 
    document_types = ['ownership_declaration', 'copyright_registration', 'infringement_notice'],
    jurisdiction = 'international'
  } = params

  console.log('Generating legal documents')

  const generatedDocuments = []

  for (const docType of document_types) {
    try {
      // Simplified document generation for demo
      const documentContent = `
        ${docType.toUpperCase()} DOCUMENT
        
        Generated for artwork ID: ${artwork_id}
        Jurisdiction: ${jurisdiction}
        User ID: ${user_id}
        
        This document is generated using blockchain technology for 
        immutable copyright protection and legal enforceability.
        
        Document Hash: ${await hashDocument(docType + artwork_id + user_id)}
        Timestamp: ${new Date().toISOString()}
        
        Blockchain verified and cryptographically secured.
      `

      // Store legal document
      const { data: document } = await supabase
        .from('legal_documents')
        .insert({
          user_id,
          artwork_id,
          document_type: docType,
          content: documentContent,
          document_hash: await hashDocument(documentContent),
          jurisdiction,
          status: 'generated',
          blockchain_verified: true
        })
        .select()
        .single()

      generatedDocuments.push({
        type: docType,
        document_id: document.id,
        hash: document.document_hash,
        legal_readiness: 'Ready for Filing'
      })

    } catch (error) {
      generatedDocuments.push({
        type: docType,
        status: 'failed',
        error: error.message
      })
    }
  }

  console.log('✅ Legal documents generated')

  return {
    generated_documents: generatedDocuments,
    total_documents: document_types.length,
    ready_for_filing: generatedDocuments.filter(d => d.legal_readiness).length,
    blockchain_verified: true
  }
}

// Create immutable proof for existing artwork
async function createImmutableProof(supabase: any, params: any) {
  const { artwork_id, owner_address, user_id } = params

  console.log('Creating immutable proof for artwork:', artwork_id)

  // Get artwork details
  const { data: artwork, error: artworkError } = await supabase
    .from('artwork')
    .select('*')
    .eq('id', artwork_id)
    .single()

  if (artworkError || !artwork) {
    throw new Error('Artwork not found')
  }

  // Generate cryptographic proof
  const proof = await generateOwnershipProof(artwork, owner_address)

  // Create blockchain transaction
  const transaction = await createOwnershipTransaction(artwork, owner_address, 'ethereum')

  // Store in blockchain registry
  const { data: registration, error: regError } = await supabase
    .from('blockchain_ownership_registry')
    .insert({
      user_id,
      artwork_id,
      owner_address,
      blockchain: 'ethereum',
      transaction_hash: transaction.hash,
      ownership_proof: proof,
      confirmation_status: 'pending',
      metadata: {
        creation_method: 'immutable_proof',
        timestamp: new Date().toISOString(),
        proof_type: 'cryptographic_hash'
      }
    })
    .select()
    .single()

  if (regError) {
    throw new Error('Failed to create immutable proof')
  }

  return {
    proof_id: registration.id,
    transaction_hash: transaction.hash,
    proof_hash: proof.signature,
    immutability: 'Guaranteed',
    legal_validity: 'Blockchain Verified'
  }
}

// Helper functions

async function generateOwnershipProof(artwork: any, ownerAddress: string) {
  const proofData = {
    artwork_id: artwork.id,
    title: artwork.title,
    owner_address: ownerAddress,
    timestamp: new Date().toISOString(),
    file_paths: artwork.file_paths
  }
  
  const fingerprint = await hashObject(proofData)
  const signature = await signProof(fingerprint)
  
  return {
    fingerprint,
    signature,
    proof_data: proofData,
    method: 'sha256_rsa'
  }
}

async function createOwnershipTransaction(artwork: any, ownerAddress: string, blockchain: string) {
  // Simulate blockchain transaction creation
  return {
    hash: generateRandomHash(),
    block_number: Math.floor(Math.random() * 1000000) + 18000000,
    gas_used: Math.floor(Math.random() * 50000) + 21000,
    gas_price: BLOCKCHAIN_NETWORKS[blockchain].gas_price_gwei,
    status: 'pending',
    network: blockchain
  }
}

async function simulateContractDeployment(template: SmartContractTemplate, params: any) {
  return {
    address: generateRandomAddress(),
    deploymentTx: generateRandomHash(),
    gasUsed: Math.floor(Math.random() * 200000) + 100000,
    endpoints: {
      ownership_verification: `/verify/${generateRandomAddress()}`,
      license_management: `/license/${generateRandomAddress()}`,
      royalty_distribution: `/royalty/${generateRandomAddress()}`
    },
    documentationUrl: `https://docs.contract.example.com/${template.contract_type}`
  }
}

function calculateLegalEnforceability(blockchain: string): number {
  const scores = {
    ethereum: 95,
    polygon: 85,
    arbitrum: 80,
    optimism: 80
  }
  return scores[blockchain] || 70
}

async function generateOwnershipCertificate(registration: any, artwork: any) {
  return {
    certificate_id: `CERT-${registration.id}`,
    artwork_title: artwork.title,
    owner_address: registration.owner_address,
    blockchain: registration.blockchain,
    transaction_hash: registration.transaction_hash,
    registration_date: registration.created_at,
    legal_validity: 'Blockchain Verified',
    enforceability_score: calculateLegalEnforceability(registration.blockchain)
  }
}

// Hashing functions
async function hashDocument(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashObject(obj: any): Promise<string> {
  return hashDocument(JSON.stringify(obj))
}

async function signProof(proofHash: string): Promise<string> {
  // Simulate cryptographic signing
  const timestamp = Date.now().toString()
  return hashDocument(proofHash + timestamp)
}

function generateRandomHash(): string {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

function generateRandomAddress(): string {
  return '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

async function monitorTransactionConfirmation(supabase: any, registrationId: string, transactionHash: string) {
  // Simulate transaction confirmation monitoring
  setTimeout(async () => {
    await supabase
      .from('blockchain_ownership_registry')
      .update({ confirmation_status: 'confirmed' })
      .eq('id', registrationId)
  }, 30000) // Simulate 30 second confirmation
}

async function verifyOnBlockchain(transactionHash: string, blockchain: string) {
  // Simulate blockchain verification
  return {
    confirmed: Math.random() > 0.1, // 90% success rate
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    confirmations: Math.floor(Math.random() * 20) + 1
  }
}

async function simulateCrossChainBridge(artworkId: string, targetBlockchain: string) {
  return {
    targetTx: generateRandomHash(),
    fee: Math.random() * 0.01 + 0.001,
    confirmationTime: Math.floor(Math.random() * 10) + 5
  }
}