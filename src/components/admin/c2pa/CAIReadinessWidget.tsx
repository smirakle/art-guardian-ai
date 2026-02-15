import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'

const Row = ({ label, ok }: { label: string; ok: boolean }) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <Badge variant="outline" className={ok ? 'text-green-600' : 'text-red-600'}>
      {ok ? 'OK' : 'Missing'}
    </Badge>
  </div>
)

export default function CAIReadinessWidget() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const { toast } = useToast()

  const runCheck = async () => {
    setLoading(true)
    setData(null)
    const { data: resp, error } = await supabase.functions.invoke('c2pa-readiness-check')
    setLoading(false)
    if (error) {
      toast({ title: 'CAI readiness check failed', description: error.message, variant: 'destructive' })
    } else {
      setData(resp)
      toast({
        title: resp.status === 'ok' ? 'CAI: Ready for Submission' : 'CAI: Action Required',
        description: resp.message,
      })
    }
  }

  const ready = data?.status === 'ok'

  return (
    <Card>
      <CardHeader>
        <CardTitle>CAI Certification Readiness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runCheck} disabled={loading}>
          {loading ? 'Checking…' : 'Run Readiness Check'}
        </Button>

        {data && (
          <>
            <Alert className={ready ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'}>
              {ready ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-yellow-600" />}
              <AlertTitle className={ready ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}>
                {ready ? 'Ready for Submission' : 'Action Required'}
              </AlertTitle>
              <AlertDescription className="text-muted-foreground text-sm">
                {data.message}
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Checks</h4>
                {(data.checks || []).map((c: any, idx: number) => (
                  <Row key={idx} label={c.name} ok={c.ok} />
                ))}
              </div>
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {(data.recommendations || []).map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {!ready && (
              <a
                href="https://supabase.com/dashboard/project/utneaqmbyjwxaqrrarpc/settings/functions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Manage Edge Function Secrets
              </a>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
