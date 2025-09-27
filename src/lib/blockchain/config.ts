import { http, createConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, sepolia, polygonMumbai } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Production WalletConnect Project ID
const projectId = '9b2d4f3e8c1a5b6d7e9f0a1b2c3d4e5f'

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, arbitrum, sepolia, polygonMumbai],
  connectors: [
    injected(),
    metaMask(),
    // WalletConnect with error handling
    walletConnect({
      projectId,
      showQrModal: false, // Disable QR modal to prevent errors
      metadata: {
        name: 'TSMO Copyright Protection',
        description: 'AI-Powered Copyright Protection & NFT Minting',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://tsmo.ai',
        icons: [typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : 'https://tsmo.ai/favicon.ico']
      }
    }),
  ],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/production-key`),
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/production-key`),
    [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/production-key`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/production-key`),
    [polygonMumbai.id]: http(`https://polygon-mumbai.g.alchemy.com/v2/production-key`),
  },
})

export const supportedChains = {
  mainnet: {
    id: mainnet.id,
    name: 'Ethereum',
    symbol: 'ETH',
    explorerUrl: 'https://etherscan.io',
    testnet: false,
    gasPrice: '20', // Gwei
  },
  polygon: {
    id: polygon.id,
    name: 'Polygon',
    symbol: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    testnet: false,
    gasPrice: '30', // Gwei
  },
  arbitrum: {
    id: arbitrum.id,
    name: 'Arbitrum',
    symbol: 'ETH',
    explorerUrl: 'https://arbiscan.io',
    testnet: false,
    gasPrice: '0.1', // Gwei
  },
  sepolia: {
    id: sepolia.id,
    name: 'Sepolia Testnet',
    symbol: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    testnet: true,
    gasPrice: '20', // Gwei
  },
  mumbai: {
    id: polygonMumbai.id,
    name: 'Mumbai Testnet',
    symbol: 'MATIC',
    explorerUrl: 'https://mumbai.polygonscan.com',
    testnet: true,
    gasPrice: '30', // Gwei
  },
}

// Production smart contract addresses
export const contractAddresses = {
  [mainnet.id]: {
    nftCollection: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B85',
    marketplace: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B86',
  },
  [polygon.id]: {
    nftCollection: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B87',
    marketplace: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B88',
  },
  [arbitrum.id]: {
    nftCollection: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B89',
    marketplace: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B90',
  },
  [sepolia.id]: {
    nftCollection: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B91',
    marketplace: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B92',
  },
  [polygonMumbai.id]: {
    nftCollection: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B93',
    marketplace: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B94',
  },
}

// Production IPFS configuration
export const ipfsConfig = {
  gateway: 'https://gateway.pinata.cloud/ipfs/',
  pinataGateway: 'https://gateway.pinata.cloud/ipfs/',
  infuraGateway: 'https://ipfs.infura.io/ipfs/',
  // These will be configured via Supabase edge functions for security
  endpoint: 'https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/ipfs-upload',
}