import React, { createContext, useContext, ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/lib/blockchain/config'

interface BlockchainContextType {
  isConnected: boolean
  address?: string
  chainId?: number
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  switchNetwork: (chainId: number) => Promise<void>
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
})

interface BlockchainProviderProps {
  children: ReactNode
}

export function BlockchainProvider({ children }: BlockchainProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BlockchainContextProvider>
          {children}
        </BlockchainContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function BlockchainContextProvider({ children }: BlockchainProviderProps) {
  // This would contain the actual blockchain context logic
  // For now, providing a basic structure
  const contextValue: BlockchainContextType = {
    isConnected: false,
    connect: async () => {},
    disconnect: async () => {},
    switchNetwork: async () => {},
  }

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  )
}

export function useBlockchain() {
  const context = useContext(BlockchainContext)
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider')
  }
  return context
}

export { BlockchainContext }