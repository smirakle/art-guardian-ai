import React, { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, ChevronDown, ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supportedChains } from '@/lib/blockchain/config'
import { formatEther } from 'viem'
import { mainnet, polygon, arbitrum, sepolia, polygonMumbai } from 'viem/chains'

interface WalletConnectionProps {
  onConnect?: () => void
  onDisconnect?: () => void
  showBalance?: boolean
  showNetwork?: boolean
  compact?: boolean
}

export function WalletConnection({ 
  onConnect, 
  onDisconnect, 
  showBalance = true, 
  showNetwork = true,
  compact = false 
}: WalletConnectionProps) {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isOpen, setIsOpen] = useState(false)

  const handleConnect = async (connectorToUse: any) => {
    try {
      await connect({ connector: connectorToUse })
      setIsOpen(false)
      onConnect?.()
      toast.success('Wallet connected successfully!')
    } catch (error: any) {
      toast.error(`Failed to connect: ${error.message}`)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      onDisconnect?.()
      toast.success('Wallet disconnected')
    } catch (error: any) {
      toast.error(`Failed to disconnect: ${error.message}`)
    }
  }

  const handleSwitchNetwork = async (newChainId: number) => {
    try {
      await switchChain({ chainId: newChainId })
      toast.success('Network switched successfully!')
    } catch (error: any) {
      toast.error(`Failed to switch network: ${error.message}`)
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard!')
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getChainName = (id: number) => {
    switch (id) {
      case mainnet.id: return 'Ethereum'
      case polygon.id: return 'Polygon'
      case arbitrum.id: return 'Arbitrum'
      case sepolia.id: return 'Sepolia'
      case polygonMumbai.id: return 'Mumbai'
      default: return 'Unknown'
    }
  }

  const getChainColor = (id: number) => {
    switch (id) {
      case mainnet.id: return 'bg-blue-500'
      case polygon.id: return 'bg-purple-500'
      case arbitrum.id: return 'bg-blue-400'
      case sepolia.id: return 'bg-yellow-500'
      case polygonMumbai.id: return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const isTestnet = chainId === sepolia.id || chainId === polygonMumbai.id

  if (!isConnected) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Your Wallet</DialogTitle>
            <DialogDescription>
              Choose a wallet to connect to the TSMO blockchain platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleConnect(connector)}
                disabled={!connector.id}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{connector.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {connector.id === 'metaMask' && 'Most popular wallet'}
                    {connector.id === 'walletConnect' && 'Mobile & desktop'}
                    {connector.id === 'injected' && 'Browser extension'}
                  </div>
                </div>
              </Button>
            ))}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {error.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>By connecting, you agree to our Terms of Service</p>
              <p>We support Ethereum, Polygon, and Arbitrum networks</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {showNetwork && (
          <Badge variant="outline" className="gap-1">
            <div className={`w-2 h-2 rounded-full ${getChainColor(chainId)}`} />
            {getChainName(chainId)}
          </Badge>
        )}
        <Button variant="outline" size="sm" onClick={copyAddress} className="gap-2">
          <Wallet className="w-3 h-3" />
          {formatAddress(address!)}
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Wallet Connected
        </CardTitle>
        <CardDescription>
          Connected via {connector?.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">Address</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
              {address}
            </code>
            <Button size="sm" variant="outline" onClick={copyAddress}>
              <Copy className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Network */}
        {showNetwork && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Network</label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="gap-2">
                <div className={`w-3 h-3 rounded-full ${getChainColor(chainId)}`} />
                {getChainName(chainId)}
                {isTestnet && (
                  <span className="text-xs text-orange-600">(Testnet)</span>
                )}
              </Badge>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Switch Network</DialogTitle>
                    <DialogDescription>
                      Choose the blockchain network to use
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    {[mainnet, polygon, arbitrum, sepolia, polygonMumbai].map((chain) => (
                      <Button
                        key={chain.id}
                        variant={chainId === chain.id ? "default" : "outline"}
                        className="w-full justify-start gap-3"
                        onClick={() => handleSwitchNetwork(chain.id)}
                        disabled={chainId === chain.id}
                      >
                        <div className={`w-3 h-3 rounded-full ${getChainColor(chain.id)}`} />
                        {chain.name}
                        {(chain.id === sepolia.id || chain.id === polygonMumbai.id) && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Testnet
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>

        {isTestnet && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              You're connected to a testnet. Transactions use test tokens with no real value.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default WalletConnection