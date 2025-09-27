import { hardwareWalletService, type TransactionRequest } from './hardware-wallet'
import { blockchainExplorerService } from './blockchain-explorer'

interface GasEstimate {
  gasLimit: string
  gasPrice: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  estimatedCost: string
  estimatedTime: number // seconds
  confidence: 'low' | 'medium' | 'high'
}

interface TransactionOptions {
  gasSpeed: 'slow' | 'standard' | 'fast' | 'instant'
  gasLimit?: string
  gasPrice?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  nonce?: number
}

interface PendingTransaction {
  id: string
  hash?: string
  status: 'pending' | 'confirming' | 'confirmed' | 'failed'
  type: 'send' | 'contract' | 'approve' | 'swap'
  from: string
  to: string
  value: string
  chainId: number
  gasUsed?: string
  effectiveGasPrice?: string
  confirmations: number
  createdAt: Date
  confirmedAt?: Date
  error?: string
}

interface TransactionBatch {
  id: string
  transactions: TransactionRequest[]
  status: 'pending' | 'executing' | 'completed' | 'failed'
  completedCount: number
  totalCount: number
  createdAt: Date
}

class TransactionManager {
  private pendingTransactions = new Map<string, PendingTransaction>()
  private transactionBatches = new Map<string, TransactionBatch>()
  private gasEstimateCache = new Map<string, { estimate: GasEstimate; timestamp: number }>()
  private readonly CACHE_DURATION = 30000 // 30 seconds

  async estimateGas(
    transaction: Omit<TransactionRequest, 'gasLimit' | 'gasPrice' | 'nonce'>,
    speed: 'slow' | 'standard' | 'fast' | 'instant' = 'standard'
  ): Promise<GasEstimate> {
    const cacheKey = `${transaction.to}-${transaction.value}-${transaction.data}-${speed}-${transaction.chainId}`
    const cached = this.gasEstimateCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.estimate
    }

    try {
      const estimate = await this.calculateGasEstimate(transaction, speed)
      
      this.gasEstimateCache.set(cacheKey, {
        estimate,
        timestamp: Date.now()
      })
      
      return estimate
    } catch (error) {
      console.error('Error estimating gas:', error)
      return this.getFallbackGasEstimate(transaction.chainId, speed)
    }
  }

  private async calculateGasEstimate(
    transaction: Omit<TransactionRequest, 'gasLimit' | 'gasPrice' | 'nonce'>,
    speed: string
  ): Promise<GasEstimate> {
    // Get current gas prices from the network
    const gasPrices = await this.getCurrentGasPrices(transaction.chainId)
    const gasLimit = await this.estimateGasLimit(transaction)
    
    const speedMultipliers = {
      slow: 0.8,
      standard: 1.0,
      fast: 1.3,
      instant: 1.6
    }

    const multiplier = speedMultipliers[speed as keyof typeof speedMultipliers] || 1.0
    
    const isEIP1559 = this.supportsEIP1559(transaction.chainId)
    
    if (isEIP1559) {
      const maxFeePerGas = Math.floor(gasPrices.maxFeePerGas * multiplier).toString()
      const maxPriorityFeePerGas = Math.floor(gasPrices.maxPriorityFeePerGas * multiplier).toString()
      
      return {
        gasLimit,
        gasPrice: '0', // Not used in EIP-1559
        maxFeePerGas,
        maxPriorityFeePerGas,
        estimatedCost: this.calculateTransactionCost(gasLimit, maxFeePerGas),
        estimatedTime: this.getEstimatedConfirmationTime(speed, transaction.chainId),
        confidence: this.getConfidenceLevel(multiplier)
      }
    } else {
      const gasPrice = Math.floor(gasPrices.gasPrice * multiplier).toString()
      
      return {
        gasLimit,
        gasPrice,
        estimatedCost: this.calculateTransactionCost(gasLimit, gasPrice),
        estimatedTime: this.getEstimatedConfirmationTime(speed, transaction.chainId),
        confidence: this.getConfidenceLevel(multiplier)
      }
    }
  }

  private async getCurrentGasPrices(chainId: number): Promise<any> {
    // Mock implementation - would fetch from gas station APIs
    const basePrices: any = {
      1: { // Ethereum
        gasPrice: 20000000000, // 20 gwei
        maxFeePerGas: 30000000000, // 30 gwei
        maxPriorityFeePerGas: 2000000000 // 2 gwei
      },
      137: { // Polygon
        gasPrice: 30000000000, // 30 gwei
        maxFeePerGas: 40000000000, // 40 gwei
        maxPriorityFeePerGas: 30000000000 // 30 gwei
      },
      42161: { // Arbitrum
        gasPrice: 100000000, // 0.1 gwei
        maxFeePerGas: 200000000, // 0.2 gwei
        maxPriorityFeePerGas: 10000000 // 0.01 gwei
      }
    }

    return basePrices[chainId] || basePrices[1]
  }

  private async estimateGasLimit(
    transaction: Omit<TransactionRequest, 'gasLimit' | 'gasPrice' | 'nonce'>
  ): Promise<string> {
    try {
      // Mock gas estimation - would call eth_estimateGas
      if (transaction.data && transaction.data !== '0x') {
        // Contract interaction
        return '150000' // 150k gas
      } else {
        // Simple transfer
        return '21000' // 21k gas
      }
    } catch (error) {
      console.error('Error estimating gas limit:', error)
      return '21000' // Fallback to basic transfer
    }
  }

  private supportsEIP1559(chainId: number): boolean {
    // EIP-1559 support by chain
    return [1, 137, 42161, 11155111, 80001].includes(chainId)
  }

  private calculateTransactionCost(gasLimit: string, gasPrice: string): string {
    const cost = BigInt(gasLimit) * BigInt(gasPrice)
    return cost.toString()
  }

  private getEstimatedConfirmationTime(speed: string, chainId: number): number {
    const baseTimes: any = {
      1: { slow: 300, standard: 180, fast: 60, instant: 15 }, // Ethereum (seconds)
      137: { slow: 10, standard: 5, fast: 2, instant: 1 }, // Polygon
      42161: { slow: 5, standard: 2, fast: 1, instant: 1 } // Arbitrum
    }

    const chainTimes = baseTimes[chainId] || baseTimes[1]
    return chainTimes[speed] || chainTimes.standard
  }

  private getConfidenceLevel(multiplier: number): 'low' | 'medium' | 'high' {
    if (multiplier >= 1.5) return 'high'
    if (multiplier >= 1.2) return 'medium'
    return 'low'
  }

  private getFallbackGasEstimate(chainId: number, speed: string): GasEstimate {
    return {
      gasLimit: '21000',
      gasPrice: '20000000000', // 20 gwei
      estimatedCost: '420000000000000', // 0.00042 ETH
      estimatedTime: this.getEstimatedConfirmationTime(speed, chainId),
      confidence: 'low'
    }
  }

  async sendTransaction(
    transaction: TransactionRequest,
    options: TransactionOptions = { gasSpeed: 'standard' }
  ): Promise<string> {
    try {
      // Generate transaction ID
      const txId = this.generateTransactionId()
      
      // Get gas estimates if not provided
      if (!options.gasLimit || !options.gasPrice) {
        const gasEstimate = await this.estimateGas(transaction, options.gasSpeed)
        transaction.gasLimit = options.gasLimit || gasEstimate.gasLimit
        transaction.gasPrice = options.gasPrice || gasEstimate.gasPrice
      }

      // Get nonce if not provided
      if (options.nonce === undefined) {
        transaction.nonce = await this.getNextNonce(transaction.to, transaction.chainId)
      } else {
        transaction.nonce = options.nonce
      }

      // Create pending transaction record
      const pendingTx: PendingTransaction = {
        id: txId,
        status: 'pending',
        type: this.detectTransactionType(transaction),
        from: transaction.to, // Would be the sender address in real implementation
        to: transaction.to,
        value: transaction.value,
        chainId: transaction.chainId,
        confirmations: 0,
        createdAt: new Date()
      }

      this.pendingTransactions.set(txId, pendingTx)

      // Sign and send transaction
      const signedTx = await hardwareWalletService.signTransaction('default-wallet', transaction)
      const txHash = await this.broadcastTransaction(signedTx.rawTransaction, transaction.chainId)

      // Update pending transaction with hash
      pendingTx.hash = txHash
      pendingTx.status = 'confirming'
      this.pendingTransactions.set(txId, pendingTx)

      // Start monitoring transaction
      this.monitorTransaction(txId, txHash, transaction.chainId)

      return txHash
    } catch (error) {
      console.error('Error sending transaction:', error)
      throw error
    }
  }

  private generateTransactionId(): string {
    return 'tx_' + Math.random().toString(36).substr(2, 9)
  }

  private detectTransactionType(transaction: TransactionRequest): PendingTransaction['type'] {
    if (transaction.data && transaction.data !== '0x') {
      return 'contract'
    }
    return 'send'
  }

  private async getNextNonce(address: string, chainId: number): Promise<number> {
    try {
      // Mock implementation - would call eth_getTransactionCount
      return Math.floor(Math.random() * 100)
    } catch (error) {
      console.error('Error getting nonce:', error)
      return 0
    }
  }

  private async broadcastTransaction(rawTransaction: string, chainId: number): Promise<string> {
    // Mock implementation - would broadcast to network
    await new Promise(resolve => setTimeout(resolve, 1000))
    return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  }

  private async monitorTransaction(txId: string, txHash: string, chainId: number): Promise<void> {
    const maxAttempts = 60 // Monitor for up to 5 minutes
    let attempts = 0

    const checkTransaction = async () => {
      try {
        attempts++
        const receipt = await this.getTransactionReceipt(txHash, chainId)
        const pendingTx = this.pendingTransactions.get(txId)

        if (!pendingTx) return

        if (receipt) {
          pendingTx.status = receipt.status === '1' ? 'confirmed' : 'failed'
          pendingTx.confirmations = receipt.confirmations
          pendingTx.gasUsed = receipt.gasUsed
          pendingTx.effectiveGasPrice = receipt.effectiveGasPrice
          pendingTx.confirmedAt = new Date()

          if (receipt.status !== '1') {
            pendingTx.error = 'Transaction reverted'
          }

          this.pendingTransactions.set(txId, pendingTx)
        } else if (attempts < maxAttempts) {
          // Continue monitoring
          setTimeout(checkTransaction, 5000)
        } else {
          // Timeout
          pendingTx.status = 'failed'
          pendingTx.error = 'Transaction monitoring timeout'
          this.pendingTransactions.set(txId, pendingTx)
        }
      } catch (error) {
        console.error('Error monitoring transaction:', error)
      }
    }

    // Start monitoring
    setTimeout(checkTransaction, 5000)
  }

  private async getTransactionReceipt(txHash: string, chainId: number): Promise<any> {
    // Mock implementation - would call eth_getTransactionReceipt
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate transaction confirmation
    if (Math.random() > 0.3) {
      return {
        status: '1',
        confirmations: Math.floor(Math.random() * 10) + 1,
        gasUsed: '21000',
        effectiveGasPrice: '20000000000'
      }
    }
    
    return null // Transaction still pending
  }

  async createTransactionBatch(transactions: TransactionRequest[]): Promise<string> {
    const batchId = 'batch_' + Math.random().toString(36).substr(2, 9)
    
    const batch: TransactionBatch = {
      id: batchId,
      transactions,
      status: 'pending',
      completedCount: 0,
      totalCount: transactions.length,
      createdAt: new Date()
    }

    this.transactionBatches.set(batchId, batch)
    return batchId
  }

  async executeBatch(batchId: string, options: TransactionOptions = { gasSpeed: 'standard' }): Promise<void> {
    const batch = this.transactionBatches.get(batchId)
    if (!batch) {
      throw new Error('Batch not found')
    }

    batch.status = 'executing'
    this.transactionBatches.set(batchId, batch)

    try {
      for (const transaction of batch.transactions) {
        await this.sendTransaction(transaction, options)
        batch.completedCount++
        this.transactionBatches.set(batchId, batch)
        
        // Small delay between transactions
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      batch.status = 'completed'
      this.transactionBatches.set(batchId, batch)
    } catch (error) {
      batch.status = 'failed'
      this.transactionBatches.set(batchId, batch)
      throw error
    }
  }

  getPendingTransactions(): PendingTransaction[] {
    return Array.from(this.pendingTransactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getTransactionStatus(txId: string): PendingTransaction | undefined {
    return this.pendingTransactions.get(txId)
  }

  getBatchStatus(batchId: string): TransactionBatch | undefined {
    return this.transactionBatches.get(batchId)
  }

  async cancelTransaction(txId: string): Promise<boolean> {
    const pendingTx = this.pendingTransactions.get(txId)
    if (!pendingTx || pendingTx.status !== 'pending') {
      return false
    }

    try {
      // Replace transaction with higher gas price and 0 value to same address
      const cancelTx: TransactionRequest = {
        to: pendingTx.from, // Send to self
        value: '0',
        gasLimit: '21000',
        gasPrice: (BigInt(pendingTx.gasUsed || '21000') * BigInt(2)).toString(), // Double the gas price
        nonce: 0, // Same nonce as original transaction
        chainId: pendingTx.chainId
      }

      await this.sendTransaction(cancelTx, { gasSpeed: 'instant' })
      return true
    } catch (error) {
      console.error('Error cancelling transaction:', error)
      return false
    }
  }

  async speedUpTransaction(txId: string): Promise<boolean> {
    const pendingTx = this.pendingTransactions.get(txId)
    if (!pendingTx || pendingTx.status !== 'confirming') {
      return false
    }

    try {
      // Replace transaction with higher gas price
      const speedUpTx: TransactionRequest = {
        to: pendingTx.to,
        value: pendingTx.value,
        gasLimit: pendingTx.gasUsed || '21000',
        gasPrice: (BigInt(pendingTx.gasUsed || '21000') * BigInt(2)).toString(), // Double the gas price
        nonce: 0, // Same nonce as original transaction
        chainId: pendingTx.chainId
      }

      await this.sendTransaction(speedUpTx, { gasSpeed: 'instant' })
      return true
    } catch (error) {
      console.error('Error speeding up transaction:', error)
      return false
    }
  }
}

export const transactionManager = new TransactionManager()
export type { 
  GasEstimate, 
  TransactionOptions, 
  PendingTransaction, 
  TransactionBatch 
}