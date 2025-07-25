import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Search, Globe, Shield, Eye, ImageIcon, FileText, Video, ExternalLink } from 'lucide-react'
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface WebScan {
  id: string
  content_type: string
  search_terms: string[]
  include_deep_web: boolean
  status: string
  sources_scanned: number
  matches_found: number
  started_at: string
  completed_at: string | null
}

interface WebScanResult {
  id: string
  source_domain: string
  source_url: string
  content_title: string
  content_description: string
  confidence_score: number
  threat_level: string
  detection_type: string
  content_type: string
  thumbnail_url: string | null
  artifacts_detected: string[]
  detected_at: string
}

export const ComprehensiveWebScanner = () => {
  const { user } = useAuth()
  const [contentType, setContentType] = useState<'photo' | 'article' | 'video'>('photo')
  const [contentUrl, setContentUrl] = useState('')
  const [contentText, setContentText] = useState('')
  const [searchTerms, setSearchTerms] = useState('')
  const [includeDeepWeb, setIncludeDeepWeb] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scans, setScans] = useState<WebScan[]>([])
  const [results, setResults] = useState<WebScanResult[]>([])
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadScans()
    }
  }, [user])

  useEffect(() => {
    if (selectedScanId) {
      loadResults(selectedScanId)
    }
  }, [selectedScanId])

  const loadScans = async () => {
    try {
      const { data, error } = await supabase
        .from('web_scans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setScans(data || [])
      
      if (data && data.length > 0 && !selectedScanId) {
        setSelectedScanId(data[0].id)
      }
    } catch (error) {
      console.error('Error loading scans:', error)
      toast.error('Failed to load scan history')
    }
  }

  const loadResults = async (scanId: string) => {
    try {
      const { data, error } = await supabase
        .from('web_scan_results')
        .select('*')
        .eq('scan_id', scanId)
        .order('confidence_score', { ascending: false })

      if (error) throw error
      setResults(data || [])
    } catch (error) {
      console.error('Error loading results:', error)
      toast.error('Failed to load scan results')
    }
  }

  const startScan = async () => {
    if (!user) {
      toast.error('Please log in to start scanning')
      return
    }

    if (!searchTerms.trim()) {
      toast.error('Please enter search terms')
      return
    }

    if (contentType !== 'photo' && !contentUrl && !contentText) {
      toast.error('Please provide content URL or text for analysis')
      return
    }

    setIsScanning(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('comprehensive-web-scanner', {
        body: {
          contentType,
          contentUrl: contentUrl || undefined,
          contentText: contentText || undefined,
          searchTerms: searchTerms.split(',').map(term => term.trim()).filter(Boolean),
          includeDeepWeb,
          userId: user.id
        }
      })

      if (error) throw error

      toast.success(`Started ${contentType} scan across ${includeDeepWeb ? 'surface and dark web' : 'surface web only'}`)
      
      // Reload scans to show the new one
      loadScans()
      
      // Clear form
      setContentUrl('')
      setContentText('')
      setSearchTerms('')
      
    } catch (error) {
      console.error('Error starting scan:', error)
      toast.error('Failed to start scan')
    } finally {
      setIsScanning(false)
    }
  }

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'running': return 'text-blue-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Comprehensive Web Scanner
          </CardTitle>
          <CardDescription>
            Scan the surface web and dark web for unauthorized use of your photos, articles, and videos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Type Selection */}
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select value={contentType} onValueChange={(value: 'photo' | 'article' | 'video') => setContentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Photo/Image
                  </div>
                </SelectItem>
                <SelectItem value="article">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Article/Text
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content URL */}
          {(contentType === 'photo' || contentType === 'video') && (
            <div className="space-y-2">
              <Label>Content URL</Label>
              <Input
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://example.com/your-content.jpg"
                type="url"
              />
            </div>
          )}

          {/* Content Text */}
          {contentType === 'article' && (
            <div className="space-y-2">
              <Label>Article Text (optional)</Label>
              <Textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Paste your article content here for similarity analysis..."
                rows={4}
              />
            </div>
          )}

          {/* Search Terms */}
          <div className="space-y-2">
            <Label>Search Terms</Label>
            <Input
              value={searchTerms}
              onChange={(e) => setSearchTerms(e.target.value)}
              placeholder="Enter search terms separated by commas"
            />
            <p className="text-sm text-muted-foreground">
              Enter keywords, phrases, or identifiers related to your content
            </p>
          </div>

          {/* Deep Web Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include Dark Web Scanning</Label>
              <p className="text-sm text-muted-foreground">
                Scan hidden services and dark web marketplaces (legal monitoring only)
              </p>
            </div>
            <Switch
              checked={includeDeepWeb}
              onCheckedChange={setIncludeDeepWeb}
            />
          </div>

          {includeDeepWeb && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Dark web scanning is performed within legal boundaries for copyright protection purposes only.
              </p>
            </div>
          )}

          {/* Start Scan Button */}
          <Button
            onClick={startScan}
            disabled={isScanning || !searchTerms.trim()}
            className="w-full"
            size="lg"
          >
            <Search className="h-4 w-4 mr-2" />
            {isScanning ? 'Starting Scan...' : `Start ${includeDeepWeb ? 'Deep Web' : 'Surface Web'} Scan`}
          </Button>
        </CardContent>
      </Card>

      {/* Scan Results */}
      <Tabs value={selectedScanId || ''} onValueChange={setSelectedScanId}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Scan History & Results</h3>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All Scans</TabsTrigger>
            <TabsTrigger value="running">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>

        <div className="space-y-4 mt-4">
          {scans.map((scan) => (
            <Card
              key={scan.id}
              className={`cursor-pointer transition-colors ${
                selectedScanId === scan.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedScanId(scan.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {scan.content_type === 'photo' && <ImageIcon className="h-4 w-4" />}
                      {scan.content_type === 'article' && <FileText className="h-4 w-4" />}
                      {scan.content_type === 'video' && <Video className="h-4 w-4" />}
                      <span className="font-medium capitalize">{scan.content_type} Scan</span>
                      {scan.include_deep_web && (
                        <Badge variant="secondary">Deep Web</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {scan.search_terms.join(', ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Started: {formatDate(scan.started_at)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={getStatusColor(scan.status)}>
                      {scan.status}
                    </Badge>
                    <p className="text-sm">
                      {scan.sources_scanned} sources • {scan.matches_found} matches
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {scans.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No scans yet</h3>
                <p className="text-muted-foreground">
                  Start your first comprehensive web scan to monitor for unauthorized use of your content.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results for Selected Scan */}
        {selectedScanId && results.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Scan Results</CardTitle>
              <CardDescription>
                Found {results.length} potential matches across the web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{result.content_title}</h4>
                          <Badge variant={getThreatColor(result.threat_level)}>
                            {result.threat_level} threat
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(result.confidence_score * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {result.content_description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{result.source_domain}</span>
                          <span>•</span>
                          <span>{result.detection_type}</span>
                          <span>•</span>
                          <span>{formatDate(result.detected_at)}</span>
                        </div>
                        {result.artifacts_detected.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {result.artifacts_detected.map((artifact, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {artifact}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {result.thumbnail_url && (
                          <img
                            src={result.thumbnail_url}
                            alt="Thumbnail"
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(result.source_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  )
}