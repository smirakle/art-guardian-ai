import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAccount, useChainId, useConnect, useDisconnect } from 'wagmi'
import { walletService } from '@/lib/blockchain/wallet-service'
import { toast } from 'sonner'

interface BlockchainContextType {
  isConnected: boolean
  address: string | undefined
  chainId: number | undefined
  balance: string
  connectWallet: () => void
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => void
  refreshBalance: () => Promise<void>
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined)

interface BlockchainProviderProps {
  children: ReactNode
}

export function BlockchainProvider({ children }: BlockchainProviderProps) {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [balance, setBalance] = useState('0')

  useEffect(() => {
    if (isConnected && chainId) {
      refreshBalance()
    }
  }, [isConnected, chainId, address])

  const connectWallet = async () => {
    try {
      const injectedConnector = connectors.find(c => c.type === 'injected')
      if (injectedConnector) {
        await connect({ connector: injectedConnector })
        toast.success('Wallet connected successfully!')
      } else {
        toast.error('No wallet found. Please install MetaMask or another wallet.')
      }
    } catch (error: any) {
      toast.error(`Failed to connect wallet: ${error.message}`)
    }
  }

  const disconnectWallet = async () => {
    try {
      await disconnect()
      setBalance('0')
      toast.success('Wallet disconnected')
    } catch (error: any) {
      toast.error(`Failed to disconnect: ${error.message}`)
    }
  }

  const switchNetwork = async (newChainId: number) => {
    try {
      await walletService.ensureCorrectNetwork(newChainId as any)
    } catch (error: any) {
      toast.error(`Failed to switch network: ${error.message}`)
    }
  }

  const refreshBalance = async () => {
    if (!isConnected || !chainId) return
    
    try {
      const walletBalance = await walletService.getWalletBalance(chainId as any)
      setBalance(walletBalance)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }

  const contextValue: BlockchainContextType = {
    isConnected,
    address,
    chainId,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance
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