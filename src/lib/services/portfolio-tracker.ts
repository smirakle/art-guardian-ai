import { blockchainExplorerService } from './blockchain-explorer'

interface TokenBalance {
  tokenAddress: string
  name: string
  symbol: string
  decimals: number
  balance: string
  balanceFormatted: string
  priceUsd: number
  valueUsd: number
  logoUrl?: string
  change24h?: number
}

interface NFTAsset {
  tokenAddress: string
  tokenId: string
  name: string
  description?: string
  imageUrl?: string
  collectionName: string
  floorPrice?: number
  lastSalePrice?: number
  rarity?: number
}

interface ProtocolPosition {
  protocol: string
  platform: string
  category: 'lending' | 'liquidity' | 'staking' | 'farming'
  totalValueUsd: number
  positions: Array<{
    type: 'supplied' | 'borrowed' | 'staked' | 'rewards'
    token: string
    amount: string
    valueUsd: number
    apy?: number
  }>
}

interface PortfolioSummary {
  totalValueUsd: number
  change24hUsd: number
  change24hPercent: number
  tokens: TokenBalance[]
  nfts: NFTAsset[]
  defiPositions: ProtocolPosition[]
  lastUpdated: Date
}

interface PriceData {
  [address: string]: {
    usd: number
    usd_24h_change: number
  }
}

class PortfolioTracker {
  private priceCache = new Map<string, { price: number; timestamp: number }>()
  private readonly CACHE_DURATION = 60000 // 1 minute
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3'
  private readonly MORALIS_API = 'https://deep-index.moralis.io/api/v2.2'

  async getPortfolioSummary(address: string, chainIds: number[]): Promise<PortfolioSummary> {
    try {
      const [tokenBalances, nftAssets, defiPositions] = await Promise.all([
        this.getTokenBalances(address, chainIds),
        this.getNFTAssets(address, chainIds),
        this.getDeFiPositions(address, chainIds)
      ])

      const totalValueUsd = tokenBalances.reduce((sum, token) => sum + token.valueUsd, 0) +
                           defiPositions.reduce((sum, pos) => sum + pos.totalValueUsd, 0)

      const change24hUsd = tokenBalances.reduce((sum, token) => {
        const change = token.change24h || 0
        return sum + (token.valueUsd * change / 100)
      }, 0)

      return {
        totalValueUsd,
        change24hUsd,
        change24hPercent: totalValueUsd > 0 ? (change24hUsd / totalValueUsd) * 100 : 0,
        tokens: tokenBalances,
        nfts: nftAssets,
        defiPositions,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error getting portfolio summary:', error)
      return this.getEmptyPortfolio()
    }
  }

  private async getTokenBalances(address: string, chainIds: number[]): Promise<TokenBalance[]> {
    const allBalances: TokenBalance[] = []

    for (const chainId of chainIds) {
      try {
        const balances = await this.getTokenBalancesForChain(address, chainId)
        allBalances.push(...balances)
      } catch (error) {
        console.error(`Error getting balances for chain ${chainId}:`, error)
      }
    }

    // Get prices for all tokens
    const priceData = await this.getTokenPrices(allBalances.map(b => b.tokenAddress))
    
    return allBalances.map(balance => {
      const price = priceData[balance.tokenAddress.toLowerCase()]
      return {
        ...balance,
        priceUsd: price?.usd || 0,
        valueUsd: parseFloat(balance.balanceFormatted) * (price?.usd || 0),
        change24h: price?.usd_24h_change || 0
      }
    })
  }

  private async getTokenBalancesForChain(address: string, chainId: number): Promise<TokenBalance[]> {
    try {
      // Get native token balance (ETH, MATIC, etc.)
      const nativeBalance = await blockchainExplorerService.getTokenBalances(address, chainId)
      const balances: TokenBalance[] = []

      // Add native token
      const nativeToken = this.getNativeTokenInfo(chainId)
      if (nativeBalance.length > 0) {
        balances.push({
          tokenAddress: '0x0000000000000000000000000000000000000000',
          name: nativeToken.name,
          symbol: nativeToken.symbol,
          decimals: 18,
          balance: nativeBalance[0].balance,
          balanceFormatted: nativeBalance[0].balance, // Use balance as formatted for now
          priceUsd: 0, // Will be set later
          valueUsd: 0, // Will be calculated later
          logoUrl: nativeToken.logoUrl
        })
      }

      // Get ERC-20 token balances
      const erc20Balances = await this.getERC20Balances(address, chainId)
      balances.push(...erc20Balances)

      return balances.filter(b => parseFloat(b.balanceFormatted) > 0)
    } catch (error) {
      console.error(`Error getting token balances for chain ${chainId}:`, error)
      return []
    }
  }

  private async getERC20Balances(address: string, chainId: number): Promise<TokenBalance[]> {
    // Mock implementation - would use Moralis, Alchemy, or similar API
    const mockTokens = this.getMockTokensForChain(chainId)
    
    return mockTokens.map(token => ({
      tokenAddress: token.address,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      balance: token.mockBalance,
      balanceFormatted: (parseInt(token.mockBalance) / Math.pow(10, token.decimals)).toFixed(6),
      priceUsd: 0,
      valueUsd: 0,
      logoUrl: token.logoUrl
    }))
  }

  private getMockTokensForChain(chainId: number) {
    const tokens: any = {
      1: [ // Ethereum
        {
          address: '0xA0b86a33E6441c6C509e0829c0E8C6e4c45f3Eca',
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6,
          mockBalance: '1500000000', // 1,500 USDC
          logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
        },
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          name: 'Tether USD',
          symbol: 'USDT',
          decimals: 6,
          mockBalance: '2000000000', // 2,000 USDT
          logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png'
        }
      ],
      137: [ // Polygon
        {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          name: 'USD Coin (PoS)',
          symbol: 'USDC',
          decimals: 6,
          mockBalance: '750000000', // 750 USDC
          logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
        }
      ]
    }

    return tokens[chainId] || []
  }

  private getNativeTokenInfo(chainId: number) {
    const nativeTokens: any = {
      1: { name: 'Ethereum', symbol: 'ETH', logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
      137: { name: 'Polygon', symbol: 'MATIC', logoUrl: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png' },
      42161: { name: 'Ethereum', symbol: 'ETH', logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
      11155111: { name: 'Sepolia ETH', symbol: 'ETH', logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
      80001: { name: 'Mumbai MATIC', symbol: 'MATIC', logoUrl: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png' }
    }

    return nativeTokens[chainId] || { name: 'Unknown', symbol: 'UNK', logoUrl: '' }
  }

  private async getNFTAssets(address: string, chainIds: number[]): Promise<NFTAsset[]> {
    const allNFTs: NFTAsset[] = []

    for (const chainId of chainIds) {
      try {
        const nfts = await this.getNFTsForChain(address, chainId)
        allNFTs.push(...nfts)
      } catch (error) {
        console.error(`Error getting NFTs for chain ${chainId}:`, error)
      }
    }

    return allNFTs
  }

  private async getNFTsForChain(address: string, chainId: number): Promise<NFTAsset[]> {
    // Mock implementation - would use Moralis, OpenSea API, etc.
    return [
      {
        tokenAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        tokenId: '1234',
        name: 'Bored Ape #1234',
        description: 'A unique Bored Ape NFT',
        imageUrl: 'https://via.placeholder.com/400x400?text=NFT',
        collectionName: 'Bored Ape Yacht Club',
        floorPrice: 15.5,
        lastSalePrice: 18.2,
        rarity: 85
      }
    ]
  }

  private async getDeFiPositions(address: string, chainIds: number[]): Promise<ProtocolPosition[]> {
    const allPositions: ProtocolPosition[] = []

    for (const chainId of chainIds) {
      try {
        const positions = await this.getDeFiPositionsForChain(address, chainId)
        allPositions.push(...positions)
      } catch (error) {
        console.error(`Error getting DeFi positions for chain ${chainId}:`, error)
      }
    }

    return allPositions
  }

  private async getDeFiPositionsForChain(address: string, chainId: number): Promise<ProtocolPosition[]> {
    // Mock implementation - would use DeFiLlama, Zapper, etc.
    return [
      {
        protocol: 'Aave',
        platform: 'Ethereum',
        category: 'lending',
        totalValueUsd: 5000,
        positions: [
          {
            type: 'supplied',
            token: 'USDC',
            amount: '3000',
            valueUsd: 3000,
            apy: 3.5
          },
          {
            type: 'supplied',
            token: 'ETH',
            amount: '1',
            valueUsd: 2000,
            apy: 2.8
          }
        ]
      }
    ]
  }

  private async getTokenPrices(addresses: string[]): Promise<PriceData> {
    if (addresses.length === 0) return {}

    try {
      // Check cache first
      const cachedPrices: PriceData = {}
      const uncachedAddresses: string[] = []

      addresses.forEach(address => {
        const cached = this.priceCache.get(address.toLowerCase())
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
          cachedPrices[address.toLowerCase()] = {
            usd: cached.price,
            usd_24h_change: 0 // Mock change
          }
        } else {
          uncachedAddresses.push(address)
        }
      })

      if (uncachedAddresses.length === 0) {
        return cachedPrices
      }

      // Mock price data - would fetch from CoinGecko or similar
      const mockPrices: PriceData = {}
      uncachedAddresses.forEach(address => {
        const price = Math.random() * 100 + 1 // Random price between 1-101
        mockPrices[address.toLowerCase()] = {
          usd: price,
          usd_24h_change: (Math.random() - 0.5) * 20 // Random change between -10% to +10%
        }
        
        // Cache the price
        this.priceCache.set(address.toLowerCase(), {
          price,
          timestamp: Date.now()
        })
      })

      return { ...cachedPrices, ...mockPrices }
    } catch (error) {
      console.error('Error fetching token prices:', error)
      return {}
    }
  }

  async getHistoricalPortfolioValue(
    address: string, 
    chainIds: number[], 
    days: number = 30
  ): Promise<Array<{ date: string; value: number }>> {
    // Mock implementation - would fetch historical data
    const data = []
    const today = new Date()
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Generate mock historical values with some trend
      const baseValue = 50000
      const trend = (days - i) * 100 // Slight upward trend
      const volatility = (Math.random() - 0.5) * 5000 // Random volatility
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: baseValue + trend + volatility
      })
    }
    
    return data
  }

  async getTopGainersLosers(
    address: string, 
    chainIds: number[]
  ): Promise<{ gainers: TokenBalance[]; losers: TokenBalance[] }> {
    const portfolio = await this.getPortfolioSummary(address, chainIds)
    
    const gainers = portfolio.tokens
      .filter(token => (token.change24h || 0) > 0)
      .sort((a, b) => (b.change24h || 0) - (a.change24h || 0))
      .slice(0, 5)

    const losers = portfolio.tokens
      .filter(token => (token.change24h || 0) < 0)
      .sort((a, b) => (a.change24h || 0) - (b.change24h || 0))
      .slice(0, 5)

    return { gainers, losers }
  }

  private getEmptyPortfolio(): PortfolioSummary {
    return {
      totalValueUsd: 0,
      change24hUsd: 0,
      change24hPercent: 0,
      tokens: [],
      nfts: [],
      defiPositions: [],
      lastUpdated: new Date()
    }
  }

  // Real-time updates via WebSocket
  async subscribeToRealTimeUpdates(
    address: string, 
    chainIds: number[], 
    callback: (update: PortfolioSummary) => void
  ): Promise<() => void> {
    // Mock implementation - would connect to WebSocket for real-time prices
    const interval = setInterval(async () => {
      const portfolio = await this.getPortfolioSummary(address, chainIds)
      callback(portfolio)
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }
}

export const portfolioTracker = new PortfolioTracker()
export type { 
  TokenBalance, 
  NFTAsset, 
  ProtocolPosition, 
  PortfolioSummary 
}