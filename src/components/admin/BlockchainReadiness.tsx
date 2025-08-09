import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

const Row = ({ label, value, ok }: { label: string; value?: string; ok?: boolean }) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      {value && <span className="font-mono">{value}</span>}
      {ok !== undefined && (
        <Badge variant="outline" className={ok ? 'text-green-600' : 'text-red-600'}>
          {ok ? 'OK' : 'Check'}
        </Badge>
      )}
    </div>
  </div>
)

export default function BlockchainReadiness() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const { toast } = useToast()

  const runCheck = async () => {
    setLoading(true)
    setData(null)
    const { data, error } = await supabase.functions.invoke('blockchain-readiness-check')
    setLoading(false)
    if (error) {
      toast({ title: 'Readiness check failed', description: error.message, variant: 'destructive' })
    } else {
      setData(data)
      toast({
        title: data.status === 'ok' ? 'Blockchain: Ready' : 'Blockchain: Needs attention',
        description: data.status === 'ok' ? 'All core checks passed' : 'See details below',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blockchain Readiness Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runCheck} disabled={loading}>
          {loading ? 'Running…' : 'Run mainnet readiness check'}
        </Button>

        {data && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Network</h4>
              <Row label="Chain ID" value={String(data.network?.chainId)} />
              <Row label="Block" value={String(data.network?.blockNumber)} />
            </div>
            <div>
              <h4 className="font-medium mb-2">Wallet</h4>
              <Row label="Address" value={data.wallet?.address} />
              <Row label="Balance (ETH)" value={data.wallet?.balanceEth} />
              <Row label="Nonce" value={String(data.wallet?.nonce)} />
            </div>
            <div>
              <h4 className="font-medium mb-2">Fee Data</h4>
              <Row label="Gas Price" value={data.feeData?.gasPrice} />
              <Row label="Max Fee Per Gas" value={data.feeData?.maxFeePerGas} />
              <Row label="Max Priority Fee" value={data.feeData?.maxPriorityFeePerGas} />
            </div>
            <div>
              <h4 className="font-medium mb-2">Checks</h4>
              {(data.result?.checks || []).map((c: any, i: number) => (
                <Row key={i} label={c.name} value={c.details ? JSON.stringify(c.details) : undefined} ok={c.ok} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
