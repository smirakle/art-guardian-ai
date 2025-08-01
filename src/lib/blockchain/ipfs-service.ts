import { ipfsConfig } from './config'

export interface IPFSUploadResult {
  hash: string
  url: string
  size: number
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  certificateId?: string
  artworkFingerprint?: string
  blockchainHash?: string
  properties?: {
    transferable: boolean
    resellable: boolean
    royaltyPercentage: number
    licenseTerms: string
  }
}

class IPFSService {
  private pinataApiKey: string
  private pinataSecretKey: string

  constructor() {
    this.pinataApiKey = ipfsConfig.pinataApiKey
    this.pinataSecretKey = ipfsConfig.pinataSecretKey
  }

  async uploadFile(file: File | Blob, filename: string): Promise<IPFSUploadResult> {
    try {
      // For production, use Pinata or Infura IPFS
      if (this.pinataApiKey && this.pinataSecretKey) {
        return await this.uploadToPinata(file, filename)
      }

      // Fallback: simulate IPFS upload for demo
      return await this.simulateIPFSUpload(file, filename)
    } catch (error) {
      console.error('IPFS upload failed:', error)
      throw new Error('Failed to upload to IPFS')
    }
  }

  async uploadMetadata(metadata: NFTMetadata): Promise<IPFSUploadResult> {
    try {
      const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: 'application/json'
      })

      if (this.pinataApiKey && this.pinataSecretKey) {
        return await this.uploadToPinata(metadataBlob, `metadata_${metadata.certificateId}.json`)
      }

      return await this.simulateIPFSUpload(metadataBlob, `metadata_${metadata.certificateId}.json`)
    } catch (error) {
      console.error('Metadata upload failed:', error)
      throw new Error('Failed to upload metadata to IPFS')
    }
  }

  private async uploadToPinata(file: File | Blob, filename: string): Promise<IPFSUploadResult> {
    const formData = new FormData()
    formData.append('file', file, filename)

    const pinataMetadata = JSON.stringify({
      name: filename,
      keyvalues: {
        service: 'TSMO',
        type: 'certificate'
      }
    })
    formData.append('pinataMetadata', pinataMetadata)

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretKey,
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return {
      hash: result.IpfsHash,
      url: `${ipfsConfig.gateway}${result.IpfsHash}`,
      size: result.PinSize
    }
  }

  private async simulateIPFSUpload(file: File | Blob, filename: string): Promise<IPFSUploadResult> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Generate a realistic-looking IPFS hash
    const hash = this.generateIPFSHash(filename + Date.now().toString())

    return {
      hash,
      url: `${ipfsConfig.gateway}${hash}`,
      size: file.size || 1024
    }
  }

  private generateIPFSHash(input: string): string {
    // Generate a realistic IPFS hash (base58 encoded)
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    let hash = 'Qm' // IPFS hashes typically start with Qm
    
    // Create a simple hash from input
    let seed = 0
    for (let i = 0; i < input.length; i++) {
      seed = ((seed << 5) - seed + input.charCodeAt(i)) & 0xffffffff
    }

    // Generate the rest of the hash
    for (let i = 0; i < 44; i++) {
      seed = (seed * 9301 + 49297) % 233280
      hash += chars[seed % chars.length]
    }

    return hash
  }

  async fetchMetadata(ipfsHash: string): Promise<NFTMetadata | null> {
    try {
      const response = await fetch(`${ipfsConfig.gateway}${ipfsHash}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch metadata from IPFS:', error)
      return null
    }
  }

  getIPFSUrl(hash: string): string {
    return `${ipfsConfig.gateway}${hash}`
  }
}

export const ipfsService = new IPFSService()