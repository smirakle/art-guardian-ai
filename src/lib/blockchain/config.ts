import { http, createConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, sepolia, polygonMumbai } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Project ID for WalletConnect - using environment variable or fallback
const projectId = process.env.VITE_WALLETCONNECT_PROJECT_ID || '4f7c4cdea7ab57a51ef3b8c5b0c5f8c1'

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
    [mainnet.id]: http(`https://mainnet.infura.io/v3/demo`), // Using demo for now
    [polygon.id]: http(`https://polygon-rpc.com`),
    [arbitrum.id]: http(`https://arb1.arbitrum.io/rpc`),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/demo`), // Using demo for now
    [polygonMumbai.id]: http(`https://rpc-mumbai.maticvigil.com`),
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

// Smart contract addresses (would be deployed contracts)
export const contractAddresses = {
  [mainnet.id]: {
    nftCollection: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B85', // Example - replace with real
    marketplace: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B86', // Example - replace with real
  },
  [polygon.id]: {
    nftCollection: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B87', // Example - replace with real
    marketplace: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B88', // Example - replace with real
  },
  [arbitrum.id]: {
    nftCollection: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B89', // Example - replace with real
    marketplace: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B90', // Example - replace with real
  },
  [sepolia.id]: {
    nftCollection: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B91', // Example - replace with real
    marketplace: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B92', // Example - replace with real
  },
  [polygonMumbai.id]: {
    nftCollection: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B93', // Example - replace with real
    marketplace: '0x742d35Cc6634C0532925a3b8D404d48dB18a2B94', // Example - replace with real
  },
}

// IPFS configuration
export const ipfsConfig = {
  gateway: 'https://ipfs.io/ipfs/',
  pinataApiKey: '', // Will be configured via Supabase secrets
  pinataSecretKey: '', // Will be configured via Supabase secrets
  infuraProjectId: '', // Will be configured via Supabase secrets
  infuraSecret: '', // Will be configured via Supabase secrets
}