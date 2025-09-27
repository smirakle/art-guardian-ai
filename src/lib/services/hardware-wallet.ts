interface HardwareWallet {
  id: string
  name: string
  type: 'ledger' | 'trezor' | 'keystone'
  isConnected: boolean
  supportedChains: number[]
  firmware: string
}

interface TransactionRequest {
  to: string
  value: string
  data?: string
  gasLimit: string
  gasPrice: string
  nonce: number
  chainId: number
}

interface SignedTransaction {
  rawTransaction: string
  hash: string
  r: string
  s: string
  v: string
}

class HardwareWalletService {
  private connectedWallets: Map<string, HardwareWallet> = new Map()
  private isWebUSBSupported = false

  constructor() {
    this.checkWebUSBSupport()
  }

  private checkWebUSBSupport() {
    this.isWebUSBSupported = typeof (navigator as any).usb !== 'undefined' && typeof (navigator as any).hid !== 'undefined'
  }

  async detectWallets(): Promise<HardwareWallet[]> {
    if (!this.isWebUSBSupported) {
      console.warn('WebUSB not supported in this browser')
      return []
    }

    const wallets: HardwareWallet[] = []

    try {
      // Check for Ledger devices
      const ledgerDevices = await this.detectLedgerDevices()
      wallets.push(...ledgerDevices)

      // Check for Trezor devices  
      const trezorDevices = await this.detectTrezorDevices()
      wallets.push(...trezorDevices)

      // Check for Keystone devices
      const keystoneDevices = await this.detectKeystoneDevices()
      wallets.push(...keystoneDevices)

    } catch (error) {
      console.error('Error detecting hardware wallets:', error)
    }

    return wallets
  }

  private async detectLedgerDevices(): Promise<HardwareWallet[]> {
    try {
      // Ledger device detection via WebUSB
      const devices = await (navigator as any).usb.getDevices()
      const ledgerDevices = devices.filter((device: any) => 
        device.vendorId === 0x2c97 // Ledger vendor ID
      )

      return ledgerDevices.map((device, index) => ({
        id: `ledger-${index}`,
        name: `Ledger ${device.productName || 'Device'}`,
        type: 'ledger' as const,
        isConnected: true,
        supportedChains: [1, 137, 42161, 11155111, 80001], // ETH, Polygon, Arbitrum, Sepolia, Mumbai
        firmware: '2.1.0' // Mock version, would be detected from device
      }))
    } catch (error) {
      console.error('Error detecting Ledger devices:', error)
      return []
    }
  }

  private async detectTrezorDevices(): Promise<HardwareWallet[]> {
    try {
      // Trezor device detection via WebUSB
      const devices = await (navigator as any).usb.getDevices()
      const trezorDevices = devices.filter((device: any) => 
        device.vendorId === 0x534c || device.vendorId === 0x1209 // Trezor vendor IDs
      )

      return trezorDevices.map((device, index) => ({
        id: `trezor-${index}`,
        name: `Trezor ${device.productName || 'Device'}`,
        type: 'trezor' as const,
        isConnected: true,
        supportedChains: [1, 137, 42161, 11155111, 80001],
        firmware: '2.5.3' // Mock version
      }))
    } catch (error) {
      console.error('Error detecting Trezor devices:', error)
      return []
    }
  }

  private async detectKeystoneDevices(): Promise<HardwareWallet[]> {
    // Keystone uses QR code communication, not USB
    // This would check for Keystone app connectivity
    return []
  }

  async connectWallet(walletId: string): Promise<boolean> {
    try {
      const wallet = Array.from(this.connectedWallets.values())
        .find(w => w.id === walletId)

      if (!wallet) {
        console.error('Wallet not found:', walletId)
        return false
      }

      // Request device permissions
      if (wallet.type === 'ledger') {
        await this.requestLedgerPermission()
      } else if (wallet.type === 'trezor') {
        await this.requestTrezorPermission()
      }

      wallet.isConnected = true
      this.connectedWallets.set(walletId, wallet)
      
      return true
    } catch (error) {
      console.error('Error connecting to wallet:', error)
      return false
    }
  }

  private async requestLedgerPermission(): Promise<void> {
    try {
      await (navigator as any).usb.requestDevice({
        filters: [{ vendorId: 0x2c97 }]
      })
    } catch (error) {
      throw new Error('User denied Ledger device access')
    }
  }

  private async requestTrezorPermission(): Promise<void> {
    try {
      await (navigator as any).usb.requestDevice({
        filters: [
          { vendorId: 0x534c },
          { vendorId: 0x1209 }
        ]
      })
    } catch (error) {
      throw new Error('User denied Trezor device access')
    }
  }

  async getAccounts(walletId: string, chainId: number): Promise<string[]> {
    const wallet = this.connectedWallets.get(walletId)
    if (!wallet || !wallet.isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      if (wallet.type === 'ledger') {
        return await this.getLedgerAccounts(chainId)
      } else if (wallet.type === 'trezor') {
        return await this.getTrezorAccounts(chainId)
      }
      
      return []
    } catch (error) {
      console.error('Error getting accounts:', error)
      return []
    }
  }

  private async getLedgerAccounts(chainId: number): Promise<string[]> {
    // Mock implementation - would use @ledgerhq/hw-app-eth
    // Simulate deriving first 5 accounts
    const baseAddress = '0x742d35Cc6634C0532925a3b8D404d48dB18a2B'
    return Array.from({ length: 5 }, (_, i) => `${baseAddress}${String(i).padStart(2, '0')}`)
  }

  private async getTrezorAccounts(chainId: number): Promise<string[]> {
    // Mock implementation - would use @trezor/connect
    const baseAddress = '0x853f43j5Hh6634C0532925a3b8D404d48dB18a3C'
    return Array.from({ length: 5 }, (_, i) => `${baseAddress}${String(i).padStart(2, '0')}`)
  }

  async signTransaction(
    walletId: string, 
    transaction: TransactionRequest
  ): Promise<SignedTransaction> {
    const wallet = this.connectedWallets.get(walletId)
    if (!wallet || !wallet.isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      if (wallet.type === 'ledger') {
        return await this.signWithLedger(transaction)
      } else if (wallet.type === 'trezor') {
        return await this.signWithTrezor(transaction)
      }
      
      throw new Error('Unsupported wallet type')
    } catch (error) {
      console.error('Error signing transaction:', error)
      throw error
    }
  }

  private async signWithLedger(transaction: TransactionRequest): Promise<SignedTransaction> {
    // Mock implementation - would use Ledger's ETH app
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate user confirmation

    return {
      rawTransaction: '0x' + 'a'.repeat(200), // Mock signed transaction
      hash: '0x' + 'b'.repeat(64),
      r: '0x' + 'c'.repeat(64),
      s: '0x' + 'd'.repeat(64),
      v: '0x1c'
    }
  }

  private async signWithTrezor(transaction: TransactionRequest): Promise<SignedTransaction> {
    // Mock implementation - would use Trezor Connect
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate user confirmation

    return {
      rawTransaction: '0x' + 'e'.repeat(200), // Mock signed transaction  
      hash: '0x' + 'f'.repeat(64),
      r: '0x' + '1'.repeat(64),
      s: '0x' + '2'.repeat(64),
      v: '0x1b'
    }
  }

  async verifyAddress(walletId: string, address: string, chainId: number): Promise<boolean> {
    const wallet = this.connectedWallets.get(walletId)
    if (!wallet || !wallet.isConnected) {
      return false
    }

    try {
      // This would display address on device for user verification
      if (wallet.type === 'ledger') {
        await this.verifyAddressOnLedger(address, chainId)
      } else if (wallet.type === 'trezor') {
        await this.verifyAddressOnTrezor(address, chainId)
      }
      
      return true
    } catch (error) {
      console.error('Error verifying address:', error)
      return false
    }
  }

  private async verifyAddressOnLedger(address: string, chainId: number): Promise<void> {
    // Mock implementation - would display address on Ledger device
    console.log('Displaying address on Ledger device:', address)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  private async verifyAddressOnTrezor(address: string, chainId: number): Promise<void> {
    // Mock implementation - would display address on Trezor device
    console.log('Displaying address on Trezor device:', address)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  async disconnectWallet(walletId: string): Promise<void> {
    const wallet = this.connectedWallets.get(walletId)
    if (wallet) {
      wallet.isConnected = false
      this.connectedWallets.delete(walletId)
    }
  }

  getConnectedWallets(): HardwareWallet[] {
    return Array.from(this.connectedWallets.values())
      .filter(wallet => wallet.isConnected)
  }

  isWalletSupported(type: string): boolean {
    return ['ledger', 'trezor', 'keystone'].includes(type) && this.isWebUSBSupported
  }

  async getFirmwareVersion(walletId: string): Promise<string> {
    const wallet = this.connectedWallets.get(walletId)
    return wallet?.firmware || 'Unknown'
  }

  async updateFirmware(walletId: string): Promise<boolean> {
    // Mock implementation - would trigger firmware update process
    console.log('Starting firmware update for wallet:', walletId)
    return false // Updates typically done through manufacturer apps
  }
}

export const hardwareWalletService = new HardwareWalletService()
export type { HardwareWallet, TransactionRequest, SignedTransaction }