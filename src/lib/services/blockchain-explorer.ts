import { supportedChains } from '@/lib/blockchain/config'

export interface Transaction {
  id: string
  type: 'send' | 'receive' | 'mint' | 'approve' | 'swap'
  amount: string
  token: string
  hash: string
  timestamp: string
  status: 'confirmed' | 'pending' | 'failed'
  to?: string
  from?: string
  gasUsed?: string
  gasPrice?: string
  value?: string
  blockNumber?: number
}

export interface TokenBalance {
  token: string
  symbol: string
  balance: string
  decimals: number
  contractAddress?: string
  priceUsd?: number
  valueUsd?: number
}

class BlockchainExplorerService {
  private getApiUrl(chainId: number): string {
    switch (chainId) {
      case 1: // Ethereum
        return 'https://api.etherscan.io/api'
      case 137: // Polygon
        return 'https://api.polygonscan.com/api'
      case 42161: // Arbitrum
        return 'https://api.arbiscan.io/api'
      case 11155111: // Sepolia
        return 'https://api-sepolia.etherscan.io/api'
      case 80001: // Mumbai
        return 'https://api-testnet.polygonscan.com/api'
      default:
        return 'https://api.etherscan.io/api'
    }
  }

  private getApiKey(chainId: number): string {
    // In production, these would be stored in Supabase secrets
    return 'YourApiKeyHere' // Placeholder
  }

  async getTransactionHistory(address: string, chainId: number, limit: number = 10): Promise<Transaction[]> {
    try {
      const apiUrl = this.getApiUrl(chainId)
      const apiKey = this.getApiKey(chainId)
      
      // Get normal transactions
      const normalTxResponse = await fetch(
        `${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&page=1&offset=${limit}&apikey=${apiKey}`
      )
      
      if (!normalTxResponse.ok) {
        throw new Error('Failed to fetch transaction history')
      }
      
      const normalTxData = await normalTxResponse.json()
      
      // Get internal transactions
      const internalTxResponse = await fetch(
        `${apiUrl}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&sort=desc&page=1&offset=${limit}&apikey=${apiKey}`
      )
      
      const internalTxData = internalTxResponse.ok ? await internalTxResponse.json() : { result: [] }
      
      // Get ERC20 token transfers
      const tokenTxResponse = await fetch(
        `${apiUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&page=1&offset=${limit}&apikey=${apiKey}`
      )
      
      const tokenTxData = tokenTxResponse.ok ? await tokenTxResponse.json() : { result: [] }
      
      // Combine and format transactions
      const allTransactions = [
        ...(normalTxData.result || []),
        ...(internalTxData.result || []),
        ...(tokenTxData.result || [])
      ]
      
      return allTransactions
        .slice(0, limit)
        .map((tx: any) => this.formatTransaction(tx, address, chainId))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
    } catch (error) {
      console.error('Failed to fetch transaction history:', error)
      return this.getFallbackTransactions(address)
    }
  }

  async getTokenBalances(address: string, chainId: number): Promise<TokenBalance[]> {
    try {
      const apiUrl = this.getApiUrl(chainId)
      const apiKey = this.getApiKey(chainId)
      
      const response = await fetch(
        `${apiUrl}?module=account&action=tokenlist&address=${address}&apikey=${apiKey}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch token balances')
      }
      
      const data = await response.json()
      
      return (data.result || []).map((token: any) => ({
        token: token.name || 'Unknown Token',
        symbol: token.symbol || 'UNK',
        balance: (parseFloat(token.balance) / Math.pow(10, parseInt(token.decimals || '18'))).toFixed(6),
        decimals: parseInt(token.decimals || '18'),
        contractAddress: token.contractAddress,
        priceUsd: 0, // Would fetch from price API
        valueUsd: 0
      }))
      
    } catch (error) {
      console.error('Failed to fetch token balances:', error)
      return []
    }
  }

  async getGasPrice(chainId: number): Promise<{ standard: string; fast: string; instant: string }> {
    try {
      const apiUrl = this.getApiUrl(chainId)
      const apiKey = this.getApiKey(chainId)
      
      const response = await fetch(
        `${apiUrl}?module=gastracker&action=gasoracle&apikey=${apiKey}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch gas price')
      }
      
      const data = await response.json()
      
      return {
        standard: data.result?.SafeGasPrice || '20',
        fast: data.result?.ProposeGasPrice || '25',
        instant: data.result?.FastGasPrice || '30'
      }
      
    } catch (error) {
      console.error('Failed to fetch gas price:', error)
      const chain = Object.values(supportedChains).find(c => c.id === chainId)
      const defaultGas = chain?.gasPrice || '20'
      return {
        standard: defaultGas,
        fast: (parseFloat(defaultGas) * 1.2).toString(),
        instant: (parseFloat(defaultGas) * 1.5).toString()
      }
    }
  }

  private formatTransaction(tx: any, userAddress: string, chainId: number): Transaction {
    const isReceived = tx.to?.toLowerCase() === userAddress.toLowerCase()
    const timestamp = new Date(parseInt(tx.timeStamp) * 1000).toISOString()
    
    let type: Transaction['type'] = isReceived ? 'receive' : 'send'
    
    // Detect transaction type based on input data or method calls
    if (tx.methodId) {
      if (tx.methodId.startsWith('0xa9059cbb')) type = 'send' // transfer
      if (tx.methodId.startsWith('0x40c10f19')) type = 'mint' // mint
      if (tx.methodId.startsWith('0x095ea7b3')) type = 'approve' // approve
    }
    
    const value = tx.value ? (parseFloat(tx.value) / 1e18).toFixed(6) : '0'
    
    return {
      id: tx.hash,
      type,
      amount: tx.tokenSymbol ? 
        (parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal || '18'))).toFixed(6) : 
        value,
      token: tx.tokenSymbol || 'ETH',
      hash: tx.hash,
      timestamp,
      status: tx.txreceipt_status === '1' ? 'confirmed' : 'failed',
      to: tx.to,
      from: tx.from,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice ? (parseFloat(tx.gasPrice) / 1e9).toFixed(2) : undefined,
      value,
      blockNumber: parseInt(tx.blockNumber)
    }
  }

  private getFallbackTransactions(address: string): Transaction[] {
    // Fallback mock data when API fails
    return [
      {
        id: '0x1234...5678',
        type: 'mint',
        amount: '0.002',
        token: 'ETH',
        hash: '0x1234567890abcdef1234567890abcdef12345678',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'confirmed',
        to: address
      },
      {
        id: '0x5678...9012',
        type: 'receive',
        amount: '0.1',
        token: 'ETH',
        hash: '0x5678901234abcdef5678901234abcdef56789012',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'confirmed',
        from: '0xabcd...ef01'
      }
    ]
  }
}

export const blockchainExplorerService = new BlockchainExplorerService()