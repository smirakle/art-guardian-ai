import React, { useState } from 'react';
import { Plus, Trash2, Search, ExternalLink, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriorArt } from '@/types/patent';

interface PriorArtCollectorProps {
  priorArt: PriorArt[];
  onPriorArtChange: (priorArt: PriorArt[]) => void;
}

const PriorArtCollector = ({ priorArt, onPriorArtChange }: PriorArtCollectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const addPriorArt = () => {
    const newPriorArt: PriorArt = {
      id: `prior-art-${Date.now()}`,
      title: '',
      authors: '',
      publicationDate: '',
      patentNumber: '',
      url: '',
      relevance: '',
      differentiatingFactors: '',
      documentType: 'patent'
    };
    onPriorArtChange([...priorArt, newPriorArt]);
  };

  const removePriorArt = (id: string) => {
    onPriorArtChange(priorArt.filter(art => art.id !== id));
  };

  const updatePriorArt = (id: string, field: keyof PriorArt, value: string) => {
    onPriorArtChange(priorArt.map(art => 
      art.id === id ? { ...art, [field]: value } : art
    ));
  };

  const searchPriorArt = () => {
    // Placeholder for patent database search integration
    console.log('Searching for:', searchQuery);
    // This would integrate with Google Patents, USPTO database, etc.
  };

  const importSuggestedPriorArt = () => {
    const suggestedPriorArt: PriorArt[] = [
      {
        id: `prior-art-${Date.now()}-1`,
        title: 'Content identification system using perceptual hash',
        authors: 'Various inventors',
        publicationDate: '2018-03-15',
        patentNumber: 'US10,123,456',
        url: 'https://patents.google.com/patent/US10123456',
        relevance: 'Uses similar hashing techniques for content identification',
        differentiatingFactors: 'Limited to basic perceptual hashing, no AI training detection',
        documentType: 'patent'
      },
      {
        id: `prior-art-${Date.now()}-2`,
        title: 'Digital watermarking for copyright protection',
        authors: 'Smith, J. et al.',
        publicationDate: '2019-07-22',
        patentNumber: 'US10,234,567',
        url: 'https://patents.google.com/patent/US10234567',
        relevance: 'Digital watermarking approach for content protection',
        differentiatingFactors: 'Static watermarking only, no real-time monitoring or AI-specific protection',
        documentType: 'patent'
      },
      {
        id: `prior-art-${Date.now()}-3`,
        title: 'Automated copyright infringement detection',
        authors: 'Johnson, A.',
        publicationDate: '2020-11-10',
        patentNumber: '',
        url: 'https://arxiv.org/abs/2011.12345',
        relevance: 'Automated detection of copyright infringement',
        differentiatingFactors: 'Focuses on web scraping detection, not AI training dataset monitoring',
        documentType: 'article'
      }
    ];
    onPriorArtChange([...priorArt, ...suggestedPriorArt]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Prior Art Search & Collection
        </CardTitle>
        <CardDescription>
          Identify and analyze prior art relevant to your invention. This helps establish novelty and develop stronger claims.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search patents, publications, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={searchPriorArt} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={importSuggestedPriorArt} variant="outline" size="sm">
              Import Suggested Prior Art
            </Button>
            <Button onClick={addPriorArt} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Entry
            </Button>
          </div>
        </div>

        {priorArt.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No prior art collected yet. Use search or add manual entries.</p>
          </div>
        )}

        {priorArt.map((art, index) => (
          <Card key={art.id} className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Prior Art Reference {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePriorArt(art.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${art.id}`}>Title *</Label>
                  <Input
                    id={`title-${art.id}`}
                    value={art.title}
                    onChange={(e) => updatePriorArt(art.id, 'title', e.target.value)}
                    placeholder="Document or patent title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`type-${art.id}`}>Document Type</Label>
                  <Select 
                    value={art.documentType} 
                    onValueChange={(value) => updatePriorArt(art.id, 'documentType', value as PriorArt['documentType'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patent">Patent</SelectItem>
                      <SelectItem value="publication">Patent Publication</SelectItem>
                      <SelectItem value="article">Scientific Article</SelectItem>
                      <SelectItem value="product">Commercial Product</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`authors-${art.id}`}>Authors/Inventors</Label>
                  <Input
                    id={`authors-${art.id}`}
                    value={art.authors}
                    onChange={(e) => updatePriorArt(art.id, 'authors', e.target.value)}
                    placeholder="Author names or inventors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`date-${art.id}`}>Publication Date</Label>
                  <Input
                    id={`date-${art.id}`}
                    type="date"
                    value={art.publicationDate}
                    onChange={(e) => updatePriorArt(art.id, 'publicationDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`patent-${art.id}`}>Patent Number (if applicable)</Label>
                  <Input
                    id={`patent-${art.id}`}
                    value={art.patentNumber}
                    onChange={(e) => updatePriorArt(art.id, 'patentNumber', e.target.value)}
                    placeholder="US1234567, EP123456, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`url-${art.id}`}>URL/Link</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`url-${art.id}`}
                      value={art.url}
                      onChange={(e) => updatePriorArt(art.id, 'url', e.target.value)}
                      placeholder="https://..."
                    />
                    {art.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={art.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`relevance-${art.id}`}>Relevance to Your Invention</Label>
                <Textarea
                  id={`relevance-${art.id}`}
                  value={art.relevance}
                  onChange={(e) => updatePriorArt(art.id, 'relevance', e.target.value)}
                  placeholder="Describe how this prior art relates to your invention..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`differences-${art.id}`}>Key Differentiating Factors</Label>
                <Textarea
                  id={`differences-${art.id}`}
                  value={art.differentiatingFactors}
                  onChange={(e) => updatePriorArt(art.id, 'differentiatingFactors', e.target.value)}
                  placeholder="Explain how your invention differs from this prior art..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">Prior Art Best Practices</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Search broadly - include related technologies and alternative approaches</li>
            <li>• Look beyond patents - consider academic papers, products, and publications</li>
            <li>• Document clear differences to strengthen your claims</li>
            <li>• Include publication dates to establish timeline</li>
            <li>• Save copies of all referenced documents</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriorArtCollector;