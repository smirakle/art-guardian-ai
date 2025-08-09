import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

const Row = ({ label, ok }: { label: string; ok: boolean }) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <Badge variant="outline" className={ok ? 'text-green-600' : 'text-red-600'}>
      {ok ? 'OK' : 'Missing'}
    </Badge>
  </div>
)

export default function MonitoringReadiness() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const { toast } = useToast()

  const runCheck = async () => {
    setLoading(true)
    setData(null)
    const { data: resp, error } = await supabase.functions.invoke('monitoring-readiness-check')
    setLoading(false)
    if (error) {
      toast({ title: 'Readiness check failed', description: error.message, variant: 'destructive' })
    } else {
      setData(resp)
      toast({
        title: resp.status === 'ok' ? 'Monitoring: Ready' : 'Monitoring: Needs attention',
        description: resp.message,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Monitoring Readiness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runCheck} disabled={loading}>
          {loading ? 'Checking…' : 'Run readiness check'}
        </Button>
        {data && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Secrets</h4>
              {(data.checks || []).map((c: any, idx: number) => (
                <Row key={idx} label={c.name} ok={c.ok} />
              ))}
            </div>
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {(data.recommendations || []).map((r: string, idx: number) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
