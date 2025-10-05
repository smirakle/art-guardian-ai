import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Globe, Search, Settings, Upload, Volume2 } from 'lucide-react';

interface SearchParameters {
  query: string;
  searchType: 'text' | 'image' | 'phonetic' | 'semantic';
  jurisdictions: string[];
  classifications: string[];
  similarityThreshold: number;
  platforms: string[];
  includeExpired: boolean;
  fuzzyMatching: boolean;
  searchDepth: 'surface' | 'deep' | 'comprehensive';
}

interface AdvancedTrademarkSearchProps {
  onSearch: (params: SearchParameters) => void;
  isSearching: boolean;
}

const AdvancedTrademarkSearch: React.FC<AdvancedTrademarkSearchProps> = ({ onSearch, isSearching }) => {
  const [searchParams, setSearchParams] = useState<SearchParameters>({
    query: '',
    searchType: 'text',
    jurisdictions: ['US'],
    classifications: [],
    similarityThreshold: 0.7,
    platforms: [],
    includeExpired: false,
    fuzzyMatching: true,
    searchDepth: 'deep'
  });

  const jurisdictions = [
    { value: 'US', label: 'United States' },
    { value: 'EU', label: 'European Union' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'JP', label: 'Japan' },
    { value: 'KR', label: 'South Korea' },
    { value: 'CN', label: 'China' },
    { value: 'IN', label: 'India' },
    { value: 'BR', label: 'Brazil' }
  ];

  const platforms = [
    { value: 'USPTO', label: 'USPTO Database' },
    { value: 'EUIPO', label: 'EUIPO Database' },
    { value: 'WIPO', label: 'WIPO Global Brand Database' },
    { value: 'Amazon', label: 'Amazon Marketplace' },
    { value: 'eBay', label: 'eBay Marketplace' },
    { value: 'Alibaba', label: 'Alibaba Platform' },
    { value: 'Social Media', label: 'Social Media Platforms' },
    { value: 'Domain Names', label: 'Domain Registrations' },
    { value: 'App Stores', label: 'Mobile App Stores' }
  ];

  const trademarkClasses = [
    { value: '1', label: 'Class 1: Chemicals' },
    { value: '9', label: 'Class 9: Scientific/Computer' },
    { value: '25', label: 'Class 25: Clothing' },
    { value: '35', label: 'Class 35: Advertising/Business' },
    { value: '42', label: 'Class 42: Scientific/Technology' }
  ];

  const handleJurisdictionToggle = (jurisdiction: string) => {
    setSearchParams(prev => ({
      ...prev,
      jurisdictions: prev.jurisdictions.includes(jurisdiction)
        ? prev.jurisdictions.filter(j => j !== jurisdiction)
        : [...prev.jurisdictions, jurisdiction]
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setSearchParams(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleClassificationToggle = (classification: string) => {
    setSearchParams(prev => ({
      ...prev,
      classifications: prev.classifications.includes(classification)
        ? prev.classifications.filter(c => c !== classification)
        : [...prev.classifications, classification]
    }));
  };

  const handleSearch = () => {
    if (!searchParams.query.trim()) return;
    onSearch(searchParams);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Comprehensive Trademark Search
              </CardTitle>
              <CardDescription className="mt-2">
                Search across USPTO, EUIPO, WIPO, and 200+ global platforms using AI-powered similarity detection
              </CardDescription>
            </div>
            <Badge variant="outline" className="hidden md:flex">
              AI-Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={searchParams.searchType} onValueChange={(value) => setSearchParams(prev => ({ ...prev, searchType: value as any }))}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Image
              </TabsTrigger>
              <TabsTrigger value="phonetic" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Phonetic
              </TabsTrigger>
              <TabsTrigger value="semantic" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Semantic
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="query">Trademark Search Query</Label>
                <Input
                  id="query"
                  placeholder="Enter trademark name, slogan, or brand identifier..."
                  value={searchParams.query}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Upload trademark logo or image for visual similarity search</p>
                <Button variant="outline" className="mt-4">Choose Image</Button>
              </div>
            </TabsContent>

            <TabsContent value="phonetic" className="space-y-4">
              <div>
                <Label htmlFor="phonetic-query">Phonetic Search</Label>
                <Input
                  id="phonetic-query"
                  placeholder="Enter trademark for sound-alike matches..."
                  value={searchParams.query}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Finds trademarks that sound similar when spoken
                </p>
              </div>
            </TabsContent>

            <TabsContent value="semantic" className="space-y-4">
              <div>
                <Label htmlFor="semantic-query">Semantic Search</Label>
                <Input
                  id="semantic-query"
                  placeholder="Enter trademark for meaning-based matches..."
                  value={searchParams.query}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  AI-powered search for trademarks with similar meanings or concepts
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium">Jurisdictions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {jurisdictions.map((jurisdiction) => (
                  <div key={jurisdiction.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={jurisdiction.value}
                      checked={searchParams.jurisdictions.includes(jurisdiction.value)}
                      onCheckedChange={() => handleJurisdictionToggle(jurisdiction.value)}
                    />
                    <Label htmlFor={jurisdiction.value} className="text-sm">
                      {jurisdiction.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Search Platforms</Label>
              <div className="space-y-2 mt-2">
                {platforms.map((platform) => (
                  <div key={platform.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform.value}
                      checked={searchParams.platforms.includes(platform.value)}
                      onCheckedChange={() => handlePlatformToggle(platform.value)}
                    />
                    <Label htmlFor={platform.value} className="text-sm">
                      {platform.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Trademark Classifications</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {trademarkClasses.map((cls) => (
                <Badge
                  key={cls.value}
                  variant={searchParams.classifications.includes(cls.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleClassificationToggle(cls.value)}
                >
                  {cls.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">
                Similarity Threshold: {Math.round(searchParams.similarityThreshold * 100)}%
              </Label>
              <Slider
                value={[searchParams.similarityThreshold]}
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, similarityThreshold: value[0] }))}
                max={1}
                min={0.1}
                step={0.05}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher threshold = more exact matches, Lower threshold = broader search
              </p>
            </div>

            <div>
              <Label htmlFor="search-depth">Search Depth</Label>
              <Select value={searchParams.searchDepth} onValueChange={(value) => setSearchParams(prev => ({ ...prev, searchDepth: value as any }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surface">Surface - Quick scan</SelectItem>
                  <SelectItem value="deep">Deep - Comprehensive analysis</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive - Full spectrum search</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fuzzy-matching"
                checked={searchParams.fuzzyMatching}
                onCheckedChange={(checked) => setSearchParams(prev => ({ ...prev, fuzzyMatching: checked as boolean }))}
              />
              <Label htmlFor="fuzzy-matching">Enable fuzzy matching</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-expired"
                checked={searchParams.includeExpired}
                onCheckedChange={(checked) => setSearchParams(prev => ({ ...prev, includeExpired: checked as boolean }))}
              />
              <Label htmlFor="include-expired">Include expired trademarks</Label>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              onClick={handleSearch} 
              disabled={!searchParams.query.trim() || isSearching}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {isSearching ? (
                <>
                  <Settings className="mr-2 h-5 w-5 animate-spin" />
                  Scanning Global Databases...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Start Comprehensive Search
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Searches across USPTO, EUIPO, WIPO, marketplaces, social media, and domain registrations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedTrademarkSearch;