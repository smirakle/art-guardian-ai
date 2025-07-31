import React, { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Coins, 
  Zap, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  Shield, 
  Network,
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { mainnet, polygon, arbitrum, sepolia, polygonMumbai } from 'viem/chains'
import WalletConnection from './WalletConnection'
import { walletService, MintResult } from '@/lib/blockchain/wallet-service'
import { ipfsService, NFTMetadata } from '@/lib/blockchain/ipfs-service'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface Certificate {
  id: string
  certificate_id: string
  artwork_id: string
  certificate_data: any
  created_at: string
}

interface RealNFTMintingProps {
  onMintSuccess?: (result: MintResult) => void
}

export function RealNFTMinting({ onMintSuccess }: RealNFTMintingProps) {
  const { user } = useAuth()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [mintingStatus, setMintingStatus] = useState<Record<string, boolean>>({})
  const [nftData, setNftData] = useState<Record<string, MintResult>>({})
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10)
  const [transferable, setTransferable] = useState(true)
  const [resellable, setResellable] = useState(true)
  const [loading, setLoading] = useState(true)
  const [estimatedCost, setEstimatedCost] = useState<string>('0')

  useEffect(() => {
    if (user) {
      fetchCertificates()
    }
  }, [user])

  useEffect(() => {
    if (isConnected && certificates.length > 0) {
      estimateMintingCosts()
    }
  }, [isConnected, chainId, certificates])

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('blockchain_certificates')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCertificates(data || [])
      
      // Extract existing NFT data from certificates
      const nftDataMap: Record<string, MintResult> = {}
      data?.forEach(cert => {
        const certData = cert.certificate_data as any
        if (certData?.tokenId) {
          nftDataMap[cert.id] = {
            tokenId: certData.tokenId,
            contractAddress: certData.contractAddress,
            transactionHash: certData.transactionHash,
            blockNumber: certData.blockNumber,
            gasUsed: certData.gasUsed,
            gasPriceGwei: certData.gasPriceGwei,
            ipfsHash: certData.ipfsHash,
            tokenURI: certData.tokenURI,
            opensea_url: certData.opensea_url,
            explorer_url: certData.explorer_url
          }
        }
      })
      setNftData(nftDataMap)
    } catch (error) {
      console.error('Error fetching certificates:', error)
      toast.error('Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const estimateMintingCosts = async () => {
    if (!isConnected || certificates.length === 0) return

    try {
      const firstCert = certificates[0]
      const cost = await walletService.estimateMintingCost(
        chainId as any,
        firstCert.certificate_id,
        'https://ipfs.io/ipfs/placeholder',
        royaltyPercentage
      )
      setEstimatedCost(cost.gasCostEth)
    } catch (error) {
      console.error('Failed to estimate costs:', error)
    }
  }

  const mintRealNFT = async (certificate: Certificate) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    setMintingStatus(prev => ({ ...prev, [certificate.id]: true }))

    try {
      // Prepare NFT metadata
      const metadata: NFTMetadata = {
        name: `TSMO Certificate #${certificate.certificate_id}`,
        description: `Blockchain certificate of authenticity for digital asset protection by TSMO`,
        image: `https://utneaqmbyjwxaqrrarpc.supabase.co/storage/v1/object/public/artwork/certificates/${certificate.id}.png`,
        external_url: `https://tsmo.art/certificates/${certificate.certificate_id}`,
        attributes: [
          {
            trait_type: 'Certificate Type',
            value: 'Blockchain Authenticity'
          },
          {
            trait_type: 'Issuer',
            value: 'TSMO'
          },
          {
            trait_type: 'Registration Date',
            value: new Date(certificate.created_at).toLocaleDateString()
          },
          {
            trait_type: 'Network',
            value: getChainName(chainId)
          }
        ],
        certificateId: certificate.certificate_id,
        artworkFingerprint: certificate.certificate_data?.artworkFingerprint || '',
        blockchainHash: certificate.certificate_data?.blockchainHash || '',
        properties: {
          transferable,
          resellable,
          royaltyPercentage,
          licenseTerms: 'standard'
        }
      }

      // Mint the NFT using the wallet service
      const result = await walletService.mintNFT(
        chainId as any,
        certificate.certificate_id,
        metadata,
        royaltyPercentage
      )

      // Update local state
      setNftData(prev => ({
        ...prev,
        [certificate.id]: result
      }))

      // Update certificate in database with NFT data
      const { error: updateError } = await supabase
        .from('blockchain_certificates')
        .update({
          certificate_data: {
            ...certificate.certificate_data,
            ...result,
            mintedAt: new Date().toISOString(),
            royaltyPercentage,
            transferable,
            resellable,
            network: getChainName(chainId)
          }
        })
        .eq('id', certificate.id)

      if (updateError) {
        console.error('Failed to update certificate:', updateError)
      }

      onMintSuccess?.(result)
      toast.success('🚀 NFT minted successfully on blockchain!')

    } catch (error: any) {
      console.error('Error minting NFT:', error)
      toast.error(`Failed to mint NFT: ${error.message}`)
    } finally {
      setMintingStatus(prev => ({ ...prev, [certificate.id]: false }))
    }
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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Real Blockchain NFT Minting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Real Blockchain NFT Minting
          </CardTitle>
          <CardDescription>
            Mint your certificates as NFTs on real blockchain networks with full ownership and provenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Wallet Connection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Wallet Connection</Label>
            <WalletConnection 
              compact={isConnected}
              onConnect={() => toast.success('Wallet connected! You can now mint NFTs.')}
            />
          </div>

          {isConnected && (
            <>
              {/* Minting Settings */}
              <Separator />
              <div className="space-y-4">
                <Label className="text-base font-medium">Minting Settings</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="royalty">Royalty Percentage (%)</Label>
                    <Select 
                      value={royaltyPercentage.toString()} 
                      onValueChange={(value) => setRoyaltyPercentage(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 2.5, 5, 7.5, 10, 15, 20].map(percent => (
                          <SelectItem key={percent} value={percent.toString()}>
                            {percent}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="transferable"
                      checked={transferable}
                      onCheckedChange={setTransferable}
                    />
                    <Label htmlFor="transferable">Transferable</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="resellable"
                      checked={resellable}
                      onCheckedChange={setResellable}
                    />
                    <Label htmlFor="resellable">Resellable</Label>
                  </div>
                </div>

                {/* Cost Estimation */}
                <Alert>
                  <TrendingUp className="w-4 h-4" />
                  <AlertDescription>
                    Estimated minting cost: ~{estimatedCost} {getChainName(chainId) === 'Polygon' ? 'MATIC' : 'ETH'} per NFT
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Certificates List */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Available Certificates</CardTitle>
            <CardDescription>
              Select certificates to mint as NFTs on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            {certificates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No blockchain certificates available for minting</p>
                <p className="text-sm">Upload and register artwork to create NFTs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {certificates.map(certificate => {
                  const isNFT = nftData[certificate.id]
                  const isMinting = mintingStatus[certificate.id]

                  return (
                    <div key={certificate.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{certificate.certificate_id}</h4>
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(certificate.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {isNFT ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Minted as NFT
                          </Badge>
                        ) : (
                          <Button 
                            onClick={() => mintRealNFT(certificate)}
                            disabled={isMinting}
                            size="sm"
                          >
                            {isMinting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Minting...
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 mr-2" />
                                Mint as NFT
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {isNFT && (
                        <>
                          <Separator />
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Token ID:</span>
                              <p className="font-mono">#{isNFT.tokenId}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Contract:</span>
                              <p className="font-mono">{formatAddress(isNFT.contractAddress)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Block:</span>
                              <p className="font-mono">#{isNFT.blockNumber?.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Network:</span>
                              <p>{getChainName(chainId)}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 flex-wrap">
                            {isNFT.opensea_url && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open(isNFT.opensea_url, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                OpenSea
                              </Button>
                            )}
                            
                            {isNFT.explorer_url && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open(isNFT.explorer_url, '_blank')}
                              >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Explorer
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RealNFTMinting