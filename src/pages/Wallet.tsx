import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { WalletConnection } from '@/components/blockchain/WalletConnection';
import { FundsManager } from '@/components/wallet/FundsManager';
import { walletService } from '@/lib/blockchain/wallet-service';
import { supportedChains } from '@/lib/blockchain/config';
import { blockchainExplorerService, Transaction } from '@/lib/services/blockchain-explorer';
import { securityMonitorService, SecurityMetrics } from '@/lib/services/security-monitor';
import { hardwareWalletService, HardwareWallet } from '@/lib/services/hardware-wallet';
import { portfolioTracker, PortfolioSummary } from '@/lib/services/portfolio-tracker';
import { transactionManager, PendingTransaction } from '@/lib/services/transaction-manager';
import { toast } from 'sonner';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Shield, 
  Network, 
  History, 
  Settings,
  ExternalLink,
  Copy,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Info,
  HardDrive,
  DollarSign,
  Clock,
  TrendingDown
} from 'lucide-react';

// Remove local interface, using imported Transaction type instead

interface NetworkStats {
  chainId: number;
  name: string;
  balance: string;
  transactions: number;
  lastActivity: string;
}

export default function WalletPage() {
  const { user } = useAuth();
  const { isConnected, address, chainId, balance, refreshBalance, switchNetwork, disconnectWallet } = useBlockchain();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkBalances, setNetworkBalances] = useState<Record<number, string>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
  const [hardwareWallets, setHardwareWallets] = useState<HardwareWallet[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioSummary | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
      toast.success('Balance updated successfully');
    } catch (error) {
      toast.error('Failed to refresh balance');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSwitchNetwork = async (newChainId: number) => {
    try {
      await switchNetwork(newChainId);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getChainName = (id: number) => {
    const chainValues = Object.values(supportedChains);
    const chain = chainValues.find(c => c.id === id);
    return chain?.name || 'Unknown Network';
  };

  const getExplorerUrl = (hash: string) => {
    if (!chainId) return '#';
    // Simplified explorer URL logic
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      137: 'https://polygonscan.com',
      42161: 'https://arbiscan.io',
      11155111: 'https://sepolia.etherscan.io'
    };
    return `${explorers[chainId] || 'https://etherscan.io'}/tx/${hash}`;
  };

  // Fetch real transaction history and security data
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!isConnected || !address || !chainId) return;
      
      // Fetch network balances
      const balances: Record<number, string> = {};
      for (const chain of Object.values(supportedChains)) {
        try {
          const balance = await walletService.getWalletBalance(chain.id as any);
          balances[chain.id] = balance;
        } catch (error) {
          console.error(`Failed to fetch balance for ${chain.name}:`, error);
          balances[chain.id] = '0';
        }
      }
      setNetworkBalances(balances);
      
      // Fetch transaction history
      setIsLoadingTransactions(true);
      try {
        const txHistory = await blockchainExplorerService.getTransactionHistory(address, chainId, 20);
        setTransactions(txHistory);
      } catch (error) {
        console.error('Failed to fetch transaction history:', error);
        toast.error('Failed to load transaction history');
      } finally {
        setIsLoadingTransactions(false);
      }
      
      // Fetch security metrics
      setIsLoadingSecurity(true);
      try {
        const metrics = await securityMonitorService.scanWalletSecurity(address, chainId);
        setSecurityMetrics(metrics);
      } catch (error) {
        console.error('Failed to fetch security metrics:', error);
        toast.error('Failed to load security analysis');
      } finally {
        setIsLoadingSecurity(false);
      }
      
      // Fetch hardware wallets
      try {
        const wallets = await hardwareWalletService.detectWallets();
        setHardwareWallets(wallets);
      } catch (error) {
        console.error('Failed to detect hardware wallets:', error);
      }
      
      // Fetch portfolio data
      try {
        const portfolio = await portfolioTracker.getPortfolioSummary(address, [chainId]);
        setPortfolioData(portfolio);
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      }
      
      // Fetch pending transactions
      const pending = transactionManager.getPendingTransactions();
      setPendingTransactions(pending);
    };

    if (isConnected && address && chainId) {
      fetchWalletData();
      
      // Set up real-time portfolio updates
      const unsubscribe = portfolioTracker.subscribeToRealTimeUpdates(address, [chainId], (update) => {
        setPortfolioData(update);
      });
      
      return () => {
        unsubscribe.then(unsub => unsub());
      };
    }
  }, [isConnected, address, chainId]);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground text-center">
              Please sign in to access your wallet management features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WalletIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Wallet Management</h1>
        </div>
        {isConnected && (
          <Button 
            onClick={handleRefreshBalance} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WalletConnection 
            showBalance={true}
            showNetwork={true}
            onConnect={() => toast.success('Wallet connected!')}
            onDisconnect={() => toast.success('Wallet disconnected!')}
          />
        </CardContent>
      </Card>

      {isConnected ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="hardware">Hardware</TabsTrigger>
            <TabsTrigger value="networks">Networks</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Wallet Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{balance} ETH</div>
                  <p className="text-xs text-muted-foreground">
                    On {getChainName(chainId || 1)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Network</CardTitle>
                  <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getChainName(chainId || 1)}</div>
                  <p className="text-xs text-muted-foreground">
                    Chain ID: {chainId}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wallet Address</CardTitle>
                  <Copy 
                    className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary" 
                    onClick={() => address && copyToClipboard(address)}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-mono">{address ? formatAddress(address) : 'Not connected'}</div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-xs"
                    onClick={() => address && copyToClipboard(address)}
                  >
                    Copy full address
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Add Funds Section */}
            <FundsManager onFundingComplete={handleRefreshBalance} />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Activity
                  {isLoadingTransactions && (
                    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary animate-spin rounded-full ml-2" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 3).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          tx.type === 'receive' ? 'bg-green-100 text-green-600' :
                          tx.type === 'send' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {tx.type === 'receive' ? <ArrowDownLeft className="w-4 h-4" /> :
                           tx.type === 'send' ? <ArrowUpRight className="w-4 h-4" /> :
                           <Shield className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{tx.type} {tx.amount} {tx.token}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                          {tx.status}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(getExplorerUrl(tx.hash), '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Pending Transactions */}
            {pendingTransactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pending Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingTransactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            tx.status === 'confirmed' ? 'bg-green-500' :
                            tx.status === 'failed' ? 'bg-red-500' :
                            'bg-yellow-500 animate-pulse'
                          }`} />
                          <div>
                            <p className="font-medium">{tx.type.toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">
                              {tx.hash ? `${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}` : 'Pending...'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            tx.status === 'confirmed' ? 'default' :
                            tx.status === 'failed' ? 'destructive' :
                            'secondary'
                          }>
                            {tx.status}
                          </Badge>
                          {tx.confirmations > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {tx.confirmations} confirmations
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Portfolio Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolioData ? (
                    <div className="space-y-6">
                      {/* Total Value */}
                      <div className="text-center p-6 border rounded-lg">
                        <div className="text-3xl font-bold mb-2">
                          ${portfolioData.totalValueUsd.toLocaleString()}
                        </div>
                        <div className={`text-lg flex items-center justify-center gap-2 ${
                          portfolioData.change24hPercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {portfolioData.change24hPercent >= 0 ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <TrendingDown className="h-5 w-5" />
                          )}
                          {portfolioData.change24hPercent.toFixed(2)}% (24h)
                        </div>
                      </div>

                      {/* Token Holdings */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Token Holdings</h3>
                        <div className="space-y-3">
                          {portfolioData.tokens.map((token, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  {token.logoUrl ? (
                                    <img src={token.logoUrl} alt={token.symbol} className="w-8 h-8 rounded-full" />
                                  ) : (
                                    <span className="text-sm font-bold">{token.symbol[0]}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{token.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {parseFloat(token.balanceFormatted).toFixed(4)} {token.symbol}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${token.valueUsd.toFixed(2)}</p>
                                <p className={`text-sm ${(token.change24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {(token.change24h || 0).toFixed(2)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* DeFi Positions */}
                      {portfolioData.defiPositions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">DeFi Positions</h3>
                          <div className="space-y-3">
                            {portfolioData.defiPositions.map((position, index) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-medium">{position.protocol}</h4>
                                    <p className="text-sm text-muted-foreground">{position.category}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">${position.totalValueUsd.toFixed(2)}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {position.positions.map((pos, posIndex) => (
                                    <div key={posIndex} className="flex justify-between text-sm">
                                      <span>{pos.type} {pos.token}</span>
                                      <div className="text-right">
                                        <span>${pos.valueUsd.toFixed(2)}</span>
                                        {pos.apy && <span className="text-green-600 ml-2">{pos.apy}% APY</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Loading portfolio data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hardware" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Hardware Wallets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hardwareWallets.length > 0 ? (
                    hardwareWallets.map((wallet, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full ${wallet.isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <div>
                            <h3 className="font-medium">{wallet.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {wallet.type.toUpperCase()} • Firmware: {wallet.firmware}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Supports {wallet.supportedChains.length} networks
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={wallet.isConnected ? "secondary" : "default"}
                            size="sm"
                            onClick={async () => {
                              if (wallet.isConnected) {
                                await hardwareWalletService.disconnectWallet(wallet.id);
                                // Refresh the list
                                const wallets = await hardwareWalletService.detectWallets();
                                setHardwareWallets(wallets);
                              } else {
                                const success = await hardwareWalletService.connectWallet(wallet.id);
                                if (success) {
                                  toast.success('Hardware wallet connected');
                                  const wallets = await hardwareWalletService.detectWallets();
                                  setHardwareWallets(wallets);
                                } else {
                                  toast.error('Failed to connect hardware wallet');
                                }
                              }
                            }}
                          >
                            {wallet.isConnected ? 'Disconnect' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <HardDrive className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Hardware Wallets Detected</h3>
                      <p className="text-muted-foreground mb-4">
                        Connect your Ledger or Trezor device to get started with enhanced security.
                      </p>
                      <Button
                        onClick={async () => {
                          try {
                            const wallets = await hardwareWalletService.detectWallets();
                            setHardwareWallets(wallets);
                            if (wallets.length === 0) {
                              toast.info('No hardware wallets found. Make sure your device is connected and unlocked.');
                            }
                          } catch (error) {
                            toast.error('Failed to detect hardware wallets');
                          }
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Scan for Devices
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="networks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Supported Networks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.values(supportedChains).map((chain) => {
                    const isActive = chainId === chain.id;
                    const balance = networkBalances[chain.id] || '0';
                    
                    return (
                      <div 
                        key={chain.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          isActive ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div>
                              <h3 className="font-medium">{chain.name}</h3>
                              <p className="text-sm text-muted-foreground">Chain ID: {chain.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">{balance} ETH</p>
                              <p className="text-sm text-muted-foreground">Balance</p>
                            </div>
                            {!isActive && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSwitchNetwork(chain.id)}
                              >
                                Switch
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          tx.type === 'receive' ? 'bg-green-100 text-green-600' :
                          tx.type === 'send' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {tx.type === 'receive' ? <ArrowDownLeft className="w-5 h-5" /> :
                           tx.type === 'send' ? <ArrowUpRight className="w-5 h-5" /> :
                           <Shield className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-medium capitalize">{tx.type}</h3>
                          <p className="text-sm text-muted-foreground">
                            {tx.amount} {tx.token} • {new Date(tx.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">{tx.hash}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                          {tx.status}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(getExplorerUrl(tx.hash), '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Wallet Security
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                {securityMetrics ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Risk Score</h3>
                            <p className="text-2xl font-bold text-primary">{securityMetrics.riskScore}%</p>
                          </div>
                          <Badge variant={securityMetrics.riskScore < 30 ? 'default' : securityMetrics.riskScore < 70 ? 'secondary' : 'destructive'}>
                            {securityMetrics.riskScore < 30 ? 'Low Risk' : securityMetrics.riskScore < 70 ? 'Medium Risk' : 'High Risk'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <div>
                          <h3 className="font-medium">Threats Detected</h3>
                          <p className="text-2xl font-bold text-destructive">{securityMetrics.threatsDetected}</p>
                        </div>
                      </div>
                    </div>
                    
                    {securityMetrics.vulnerabilities.length > 0 && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h3 className="font-medium text-amber-900 mb-2">Security Vulnerabilities</h3>
                        <ul className="text-sm text-amber-800 space-y-1">
                          {securityMetrics.vulnerabilities.map((vuln, index) => (
                            <li key={index}>• {vuln}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Security Recommendations</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {securityMetrics.recommendations.slice(0, 4).map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : isLoadingSecurity ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary animate-spin rounded-full" />
                    <span className="ml-2">Analyzing wallet security...</span>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-900">Security Best Practices</h3>
                        <ul className="text-sm text-blue-800 mt-2 space-y-1">
                          <li>• Never share your private keys or seed phrase</li>
                          <li>• Always verify transaction details before signing</li>
                          <li>• Keep your wallet software updated</li>
                          <li>• Use hardware wallets for large amounts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                  <Button 
                    variant="destructive" 
                    onClick={disconnectWallet}
                    className="w-full"
                  >
                    Disconnect Wallet
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WalletIcon className="w-16 h-16 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Connect your wallet to access comprehensive wallet management features including 
              balance tracking, transaction history, and security settings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}