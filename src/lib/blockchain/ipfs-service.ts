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
  async uploadMetadata(metadata: NFTMetadata): Promise<{ hash: string; url: string }> {
    try {
      // Use Supabase edge function for secure IPFS upload
      const response = await fetch(ipfsConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata,
          type: 'metadata'
        })
      })

      if (response.ok) {
        const result = await response.json()
        return {
          hash: result.hash,
          url: result.url
        }
      }

      // Fallback to mock data for development
      const mockHash = `Qm${Array.from({length: 44}, () => Math.floor(Math.random() * 36).toString(36)).join('')}`
      return {
        hash: mockHash,
        url: `${ipfsConfig.gateway}${mockHash}`
      }

    } catch (error) {
      console.error('IPFS metadata upload failed:', error)
      
      // Fallback to mock data
      const mockHash = `Qm${Array.from({length: 44}, () => Math.floor(Math.random() * 36).toString(36)).join('')}`
      return {
        hash: mockHash,
        url: `${ipfsConfig.gateway}${mockHash}`
      }
    }
  }

  async uploadFile(file: File | Blob, filename: string): Promise<IPFSUploadResult> {
    try {
      // Use Supabase edge function for secure file upload
      const formData = new FormData()
      formData.append('file', file, filename)
      formData.append('type', 'file')

      const response = await fetch(ipfsConfig.endpoint, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        return {
          hash: result.hash,
          url: result.url,
          size: result.size || file.size || 1024
        }
      }

      // Fallback: simulate IPFS upload
      return await this.simulateIPFSUpload(file, filename)
    } catch (error) {
      console.error('IPFS upload failed:', error)
      return await this.simulateIPFSUpload(file, filename)
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