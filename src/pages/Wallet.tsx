import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { WalletConnection } from '@/components/blockchain/WalletConnection';
import { walletService } from '@/lib/blockchain/wallet-service';
import { supportedChains } from '@/lib/blockchain/config';
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
  Info
} from 'lucide-react';

interface TransactionHistory {
  id: string;
  type: 'send' | 'receive' | 'mint' | 'approve';
  amount: string;
  token: string;
  hash: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  to?: string;
  from?: string;
}

interface NetworkStats {
  chainId: number;
  name: string;
  balance: string;
  transactions: number;
  lastActivity: string;
}

export default function Wallet() {
  const { user } = useAuth();
  const { isConnected, address, chainId, balance, refreshBalance, switchNetwork, disconnectWallet } = useBlockchain();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkBalances, setNetworkBalances] = useState<Record<number, string>>({});
  const [transactions] = useState<TransactionHistory[]>([
    {
      id: '1',
      type: 'mint',
      amount: '0.002',
      token: 'ETH',
      hash: '0x1234...5678',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'confirmed',
      to: address || ''
    },
    {
      id: '2',
      type: 'receive',
      amount: '0.1',
      token: 'ETH',
      hash: '0x5678...9012',
      timestamp: '2024-01-14T15:45:00Z',
      status: 'confirmed',
      from: '0xabcd...ef01'
    }
  ]);

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

  // Fetch balances for all supported networks
  useEffect(() => {
    const fetchNetworkBalances = async () => {
      if (!isConnected) return;
      
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
    };

    if (isConnected) {
      fetchNetworkBalances();
    }
  }, [isConnected, chainId]);

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
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

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Activity
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
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Wallet Connection</h3>
                      <p className="text-sm text-muted-foreground">Your wallet is securely connected</p>
                    </div>
                    <Badge variant="default">Secure</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Network Security</h3>
                      <p className="text-sm text-muted-foreground">Connected to verified network</p>
                    </div>
                    <Badge variant="default">Verified</Badge>
                  </div>

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