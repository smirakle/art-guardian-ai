import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { AITPTestingPanel } from '@/components/ai-protection/AITPTestingPanel'

const Row = ({ label, ok }: { label: string; ok: boolean }) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <Badge variant="outline" className={ok ? 'text-green-600' : 'text-red-600'}>
      {ok ? 'OK' : 'Missing'}
    </Badge>
  </div>
)

export default function AITPReadiness() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const { toast } = useToast()

  const runCheck = async () => {
    setLoading(true)
    setData(null)
    const { data: resp, error } = await supabase.functions.invoke('aitp-readiness-check')
    setLoading(false)
    if (error) {
      toast({ title: 'AITP readiness failed', description: error.message, variant: 'destructive' })
    } else {
      setData(resp)
      toast({
        title: resp.status === 'ok' ? 'AI Training Protection: Ready' : 'AI Training Protection: Needs attention',
        description: resp.message,
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Training Protection Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runCheck} disabled={loading}>
            {loading ? 'Checking…' : 'Run readiness check'}
          </Button>
          {data && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Checks</h4>
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

      <AITPTestingPanel />
    </div>
  )
}
