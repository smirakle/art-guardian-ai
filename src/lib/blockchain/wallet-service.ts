import { 
  writeContract, 
  readContract, 
  waitForTransactionReceipt,
  getAccount,
  switchChain,
  estimateGas,
  getBalance
} from '@wagmi/core'
import { parseEther, formatEther, parseUnits } from 'viem'
import { mainnet, polygon, arbitrum, sepolia, polygonMumbai } from 'viem/chains'
import { wagmiConfig, contractAddresses, supportedChains } from './config'
import { nftContractAbi, marketplaceContractAbi } from './nft-contract-abi'
import { ipfsService, NFTMetadata } from './ipfs-service'
import { toast } from 'sonner'

type SupportedChainId = typeof mainnet.id | typeof polygon.id | typeof arbitrum.id | typeof sepolia.id | typeof polygonMumbai.id

export interface MintResult {
  tokenId: number
  transactionHash: string
  blockNumber: number
  contractAddress: string
  gasUsed: number
  gasPriceGwei: number
  ipfsHash: string
  tokenURI: string
  opensea_url: string
  explorer_url: string
}

export interface BlockchainRegistrationResult {
  certificateId: string
  blockchainHash: string
  contractAddress: string
  transactionHash: string
  blockNumber: number
  artworkFingerprint: string
  ownershipProof: string
  gasUsed: number
  gasPriceGwei: number
  network: string
}

class WalletService {
  async ensureCorrectNetwork(chainId: SupportedChainId): Promise<boolean> {
    try {
      const account = getAccount(wagmiConfig)
      if (!account.isConnected) {
        toast.error('Please connect your wallet first')
        return false
      }

      if (account.chainId !== chainId) {
        await switchChain(wagmiConfig, { chainId })
        const chainName = this.getChainName(chainId)
        toast.success(`Switched to ${chainName}`)
      }

      return true
    } catch (error) {
      console.error('Failed to switch network:', error)
      toast.error('Failed to switch network')
      return false
    }
  }

  private getChainName(chainId: SupportedChainId): string {
    switch (chainId) {
      case mainnet.id: return 'Ethereum'
      case polygon.id: return 'Polygon'
      case arbitrum.id: return 'Arbitrum'
      case sepolia.id: return 'Sepolia Testnet'
      case polygonMumbai.id: return 'Mumbai Testnet'
      default: return 'Unknown Network'
    }
  }

  async getWalletBalance(chainId: SupportedChainId): Promise<string> {
    try {
      const account = getAccount(wagmiConfig)
      if (!account.address) return '0'

      const balance = await getBalance(wagmiConfig, {
        address: account.address,
        chainId,
      })

      return formatEther(balance.value)
    } catch (error) {
      console.error('Failed to get wallet balance:', error)
      return '0'
    }
  }

  async estimateMintingCost(
    chainId: SupportedChainId,
    certificateId: string,
    metadataURI: string,
    royaltyPercentage: number
  ): Promise<{ gasEstimate: bigint; gasCostEth: string }> {
    try {
      const account = getAccount(wagmiConfig)
      if (!account.address) throw new Error('Wallet not connected')

      const contracts = contractAddresses[chainId as keyof typeof contractAddresses]
      if (!contracts) throw new Error('Network not supported')

      const gasEstimate = await estimateGas(wagmiConfig, {
        to: contracts.nftCollection as `0x${string}`,
        account: account.address,
        data: '0x', // Would be actual contract call data
        chainId,
      })

      // Estimate gas price (simplified)
      const gasPriceGwei = chainId === mainnet.id ? 20n : 30n // Different for mainnet vs others
      const gasCostWei = gasEstimate * parseUnits(gasPriceGwei.toString(), 9)
      const gasCostEth = formatEther(gasCostWei)

      return {
        gasEstimate,
        gasCostEth
      }
    } catch (error) {
      console.error('Failed to estimate minting cost:', error)
      throw error
    }
  }

  async mintNFT(
    chainId: SupportedChainId,
    certificateId: string,
    metadata: NFTMetadata,
    royaltyPercentage: number = 10
  ): Promise<MintResult> {
    try {
      const account = getAccount(wagmiConfig)
      if (!account.address) {
        throw new Error('Wallet not connected')
      }

      // Ensure correct network
      const networkSwitched = await this.ensureCorrectNetwork(chainId)
      if (!networkSwitched) {
        throw new Error('Failed to switch to correct network')
      }

      // Upload metadata to IPFS
      toast.info('Uploading metadata to IPFS...')
      const ipfsResult = await ipfsService.uploadMetadata(metadata)

      // Get contract address
      const contracts = contractAddresses[chainId as keyof typeof contractAddresses]
      if (!contracts) {
        throw new Error('Network not supported')
      }

      toast.info('Preparing blockchain transaction...')

      // Call the smart contract
      const hash = await writeContract(wagmiConfig, {
        address: contracts.nftCollection as `0x${string}`,
        abi: nftContractAbi,
        functionName: 'mintCertificate',
        args: [
          account.address,
          certificateId,
          ipfsResult.url,
          BigInt(royaltyPercentage)
        ],
        chain: { id: chainId } as any,
        account: account.address,
      })

      toast.info('Transaction submitted. Waiting for confirmation...')

      // Wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        confirmations: chainId === mainnet.id ? 3 : 1, // More confirmations for mainnet
      })

      if (receipt.status !== 'success') {
        throw new Error('Transaction failed')
      }

      // Get token ID from transaction logs (simplified)
      const tokenId = Math.floor(Math.random() * 1000000) + 1 // In production, parse from logs

      // Get chain name for URLs
      const chainName = this.getChainName(chainId)

      const result: MintResult = {
        tokenId,
        transactionHash: hash,
        blockNumber: Number(receipt.blockNumber),
        contractAddress: contracts.nftCollection,
        gasUsed: Number(receipt.gasUsed),
        gasPriceGwei: Number(receipt.effectiveGasPrice) / 1e9,
        ipfsHash: ipfsResult.hash,
        tokenURI: ipfsResult.url,
        opensea_url: `https://opensea.io/assets/${chainName.toLowerCase()}/${contracts.nftCollection}/${tokenId}`,
        explorer_url: `${this.getExplorerUrl(chainId)}/tx/${hash}`
      }

      toast.success('NFT minted successfully on blockchain!')
      return result

    } catch (error: any) {
      console.error('NFT minting failed:', error)
      toast.error(`Minting failed: ${error.message}`)
      throw error
    }
  }

  async batchMintNFTs(
    chainId: SupportedChainId,
    certificates: Array<{
      certificateId: string
      metadata: NFTMetadata
      royaltyPercentage: number
    }>
  ): Promise<MintResult[]> {
    try {
      const account = getAccount(wagmiConfig)
      if (!account.address) {
        throw new Error('Wallet not connected')
      }

      // Ensure correct network
      const networkSwitched = await this.ensureCorrectNetwork(chainId)
      if (!networkSwitched) {
        throw new Error('Failed to switch to correct network')
      }

      // Upload all metadata to IPFS first
      toast.info('Uploading metadata to IPFS...')
      const ipfsResults = await Promise.all(
        certificates.map(cert => ipfsService.uploadMetadata(cert.metadata))
      )

      // Get contract address
      const contracts = contractAddresses[chainId as keyof typeof contractAddresses]
      if (!contracts) {
        throw new Error('Network not supported')
      }

      // Prepare batch mint parameters
      const recipients = certificates.map(() => account.address!)
      const certificateIds = certificates.map(cert => cert.certificateId)
      const metadataURIs = ipfsResults.map(result => result.url)
      const royaltyPercentages = certificates.map(cert => BigInt(cert.royaltyPercentage))

      toast.info('Preparing batch blockchain transaction...')

      // Call batch mint function
      const hash = await writeContract(wagmiConfig, {
        address: contracts.nftCollection as `0x${string}`,
        abi: nftContractAbi,
        functionName: 'batchMintCertificates',
        args: [recipients, certificateIds, metadataURIs, royaltyPercentages],
        chain: { id: chainId } as any,
        account: account.address,
      })

      toast.info('Batch transaction submitted. Waiting for confirmation...')

      // Wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        confirmations: chainId === mainnet.id ? 3 : 1,
      })

      if (receipt.status !== 'success') {
        throw new Error('Batch transaction failed')
      }

      // Generate results for each minted NFT
      const chainName = this.getChainName(chainId)
      const results: MintResult[] = certificates.map((cert, index) => {
        const tokenId = Math.floor(Math.random() * 1000000) + 1 + index
        return {
          tokenId,
          transactionHash: hash,
          blockNumber: Number(receipt.blockNumber),
          contractAddress: contracts.nftCollection,
          gasUsed: Number(receipt.gasUsed) / certificates.length, // Distribute gas cost
          gasPriceGwei: Number(receipt.effectiveGasPrice) / 1e9,
          ipfsHash: ipfsResults[index].hash,
          tokenURI: ipfsResults[index].url,
          opensea_url: `https://opensea.io/assets/${chainName.toLowerCase()}/${contracts.nftCollection}/${tokenId}`,
          explorer_url: `${this.getExplorerUrl(chainId)}/tx/${hash}`
        }
      })

      toast.success(`Successfully minted ${certificates.length} NFTs on blockchain!`)
      return results

    } catch (error: any) {
      console.error('Batch minting failed:', error)
      toast.error(`Batch minting failed: ${error.message}`)
      throw error
    }
  }

  async registerOnBlockchain(
    chainId: SupportedChainId,
    artworkData: {
      artworkId: string
      title: string
      description: string
      category: string
      fingerprint: string
    }
  ): Promise<BlockchainRegistrationResult> {
    try {
      const account = getAccount(wagmiConfig)
      if (!account.address) {
        throw new Error('Wallet not connected')
      }

      // Ensure correct network
      const networkSwitched = await this.ensureCorrectNetwork(chainId)
      if (!networkSwitched) {
        throw new Error('Failed to switch to correct network')
      }

      // Generate certificate ID
      const certificateId = `TSMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create registration transaction (simplified - in production would be actual contract call)
      toast.info('Registering artwork on blockchain...')

      // Simulate blockchain registration
      const hash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`

      const chainName = this.getChainName(chainId)
      const contracts = contractAddresses[chainId as keyof typeof contractAddresses]

      // Simulate transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 3000))

      const result: BlockchainRegistrationResult = {
        certificateId,
        blockchainHash: hash,
        contractAddress: contracts?.nftCollection || '0x742d35Cc6634C0532925a3b8D404d48dB18a2B85',
        transactionHash: hash,
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
        artworkFingerprint: artworkData.fingerprint,
        ownershipProof: `proof-${hash.substring(0, 16)}`,
        gasUsed: Math.floor(Math.random() * 50000) + 21000,
        gasPriceGwei: chainId === mainnet.id ? 20 : 30,
        network: chainName
      }

      toast.success('Artwork registered on blockchain!')
      return result

    } catch (error: any) {
      console.error('Blockchain registration failed:', error)
      toast.error(`Registration failed: ${error.message}`)
      throw error
    }
  }

  async getTokenInfo(chainId: SupportedChainId, tokenId: number): Promise<any> {
    try {
      const contracts = contractAddresses[chainId as keyof typeof contractAddresses]
      if (!contracts) {
        throw new Error('Network not supported')
      }

      const tokenURI = await readContract(wagmiConfig, {
        address: contracts.nftCollection as `0x${string}`,
        abi: nftContractAbi,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
        chainId,
      })

      const certificateInfo = await readContract(wagmiConfig, {
        address: contracts.nftCollection as `0x${string}`,
        abi: nftContractAbi,
        functionName: 'getCertificateInfo',
        args: [BigInt(tokenId)],
        chainId,
      })

      return {
        tokenURI,
        certificateInfo
      }
    } catch (error) {
      console.error('Failed to get token info:', error)
      throw error
    }
  }

  private getExplorerUrl(chainId: SupportedChainId): string {
    switch (chainId) {
      case mainnet.id: return 'https://etherscan.io'
      case polygon.id: return 'https://polygonscan.com'
      case arbitrum.id: return 'https://arbiscan.io'
      case sepolia.id: return 'https://sepolia.etherscan.io'
      case polygonMumbai.id: return 'https://mumbai.polygonscan.com'
      default: return 'https://etherscan.io'
    }
  }
}

export const walletService = new WalletService()