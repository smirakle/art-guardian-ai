import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Search, Globe, Brain, Image, Shield, Zap } from "lucide-react";

interface AdvancedSearchProps {
  onSearch: (params: SearchParameters) => void;
  isSearching: boolean;
}

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

const jurisdictions = [
  { id: 'us', name: 'United States (USPTO)', flag: '🇺🇸' },
  { id: 'eu', name: 'European Union (EUIPO)', flag: '🇪🇺' },
  { id: 'wipo', name: 'WIPO Madrid Protocol', flag: '🌍' },
  { id: 'ca', name: 'Canada (CIPO)', flag: '🇨🇦' },
  { id: 'uk', name: 'United Kingdom (UKIPO)', flag: '🇬🇧' },
  { id: 'jp', name: 'Japan (JPO)', flag: '🇯🇵' },
  { id: 'cn', name: 'China (CNIPA)', flag: '🇨🇳' },
  { id: 'au', name: 'Australia (IP Australia)', flag: '🇦🇺' }
];

const niceClassifications = [
  { id: '1', name: 'Class 1: Chemicals' },
  { id: '9', name: 'Class 9: Scientific instruments, computers' },
  { id: '25', name: 'Class 25: Clothing, footwear, headgear' },
  { id: '35', name: 'Class 35: Advertising, business management' },
  { id: '41', name: 'Class 41: Education, entertainment' },
  { id: '42', name: 'Class 42: Scientific and technological services' },
  { id: '45', name: 'Class 45: Legal services' }
];

const platforms = [
  { id: 'uspto', name: 'USPTO Database', icon: '🏛️' },
  { id: 'google', name: 'Google Search', icon: '🔍' },
  { id: 'amazon', name: 'Amazon Marketplace', icon: '📦' },
  { id: 'social', name: 'Social Media', icon: '📱' },
  { id: 'domains', name: 'Domain Registries', icon: '🌐' },
  { id: 'marketplaces', name: 'E-commerce Sites', icon: '🛒' },
  { id: 'apps', name: 'App Stores', icon: '📲' },
  { id: 'news', name: 'News & Media', icon: '📰' }
];

export const AdvancedTrademarkSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  isSearching
}) => {
  const [searchParams, setSearchParams] = useState<SearchParameters>({
    query: '',
    searchType: 'text',
    jurisdictions: ['us'],
    classifications: [],
    similarityThreshold: 80,
    platforms: ['uspto', 'google', 'amazon'],
    includeExpired: false,
    fuzzyMatching: true,
    searchDepth: 'comprehensive'
  });

  const handleSearch = () => {
    if (!searchParams.query.trim()) return;
    onSearch(searchParams);
  };

  const updateSearchParams = (updates: Partial<SearchParameters>) => {
    setSearchParams(prev => ({ ...prev, ...updates }));
  };

  const toggleJurisdiction = (jurisdictionId: string) => {
    const current = searchParams.jurisdictions;
    const updated = current.includes(jurisdictionId)
      ? current.filter(id => id !== jurisdictionId)
      : [...current, jurisdictionId];
    updateSearchParams({ jurisdictions: updated });
  };

  const togglePlatform = (platformId: string) => {
    const current = searchParams.platforms;
    const updated = current.includes(platformId)
      ? current.filter(id => id !== platformId)
      : [...current, platformId];
    updateSearchParams({ platforms: updated });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI-Powered Trademark Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="search-query">Trademark Query</Label>
          <Input
            id="search-query"
            placeholder="Enter trademark name, logo description, or upload image..."
            value={searchParams.query}
            onChange={(e) => updateSearchParams({ query: e.target.value })}
            className="text-lg"
          />
        </div>

        {/* Search Type */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { type: 'text', icon: Search, label: 'Text Search' },
            { type: 'image', icon: Image, label: 'Image Search' },
            { type: 'phonetic', icon: Zap, label: 'Phonetic' },
            { type: 'semantic', icon: Brain, label: 'AI Semantic' }
          ].map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              variant={searchParams.searchType === type ? "default" : "outline"}
              onClick={() => updateSearchParams({ searchType: type as any })}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>

        {/* Similarity Threshold */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Similarity Threshold</Label>
            <Badge variant="outline">{searchParams.similarityThreshold}%</Badge>
          </div>
          <Slider
            value={[searchParams.similarityThreshold]}
            onValueChange={([value]) => updateSearchParams({ similarityThreshold: value })}
            max={100}
            min={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Loose Match (50%)</span>
            <span>Exact Match (100%)</span>
          </div>
        </div>

        {/* Jurisdictions */}
        <div className="space-y-3">
          <Label>Search Jurisdictions</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {jurisdictions.map((jurisdiction) => (
              <div
                key={jurisdiction.id}
                className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                  searchParams.jurisdictions.includes(jurisdiction.id)
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleJurisdiction(jurisdiction.id)}
              >
                <Checkbox
                  checked={searchParams.jurisdictions.includes(jurisdiction.id)}
                />
                <span className="text-lg">{jurisdiction.flag}</span>
                <span className="text-sm font-medium truncate">{jurisdiction.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Coverage */}
        <div className="space-y-3">
          <Label>Search Platforms</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                  searchParams.platforms.includes(platform.id)
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => togglePlatform(platform.id)}
              >
                <Checkbox
                  checked={searchParams.platforms.includes(platform.id)}
                />
                <span>{platform.icon}</span>
                <span className="text-sm font-medium">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search Depth */}
        <div className="space-y-3">
          <Label>Search Depth & Intelligence</Label>
          <Select
            value={searchParams.searchDepth}
            onValueChange={(value) => updateSearchParams({ searchDepth: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="surface">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>Surface Scan (Fast)</span>
                </div>
              </SelectItem>
              <SelectItem value="deep">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Deep Analysis (Thorough)</span>
                </div>
              </SelectItem>
              <SelectItem value="comprehensive">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span>AI Comprehensive (Best)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Options */}
        <div className="space-y-3 pt-4 border-t">
          <Label>Advanced Options</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={searchParams.fuzzyMatching}
                onCheckedChange={(checked) => updateSearchParams({ fuzzyMatching: !!checked })}
              />
              <Label className="text-sm">Fuzzy Matching</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={searchParams.includeExpired}
                onCheckedChange={(checked) => updateSearchParams({ includeExpired: !!checked })}
              />
              <Label className="text-sm">Include Expired</Label>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          disabled={isSearching || !searchParams.query.trim()}
          className="w-full h-12 text-lg"
        >
          {isSearching ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing with AI...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-5 w-5" />
              Start Advanced Search
            </>
          )}
        </Button>

        {/* Search Progress */}
        {isSearching && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Search Progress</span>
              <span>Scanning platforms...</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedTrademarkSearch;