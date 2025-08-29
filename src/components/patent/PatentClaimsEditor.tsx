import React, { useState } from 'react';
import { Plus, Trash2, Copy, ArrowDown, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PatentClaim } from '@/types/patent';

interface PatentClaimsEditorProps {
  claims: PatentClaim[];
  onClaimsChange: (claims: PatentClaim[]) => void;
}

const PatentClaimsEditor = ({ claims, onClaimsChange }: PatentClaimsEditorProps) => {
  const [suggestedClaims] = useState<PatentClaim[]>([
    {
      id: 'suggested-1',
      claimNumber: 1,
      claimType: 'independent',
      claimText: 'A computer-implemented method for protecting digital content from unauthorized use in artificial intelligence training, comprising:\n• generating a multi-modal fingerprint of digital content using visual, structural, and metadata elements;\n• storing the fingerprint in a distributed database with blockchain verification;\n• continuously monitoring AI training datasets for matches against protected fingerprints;\n• detecting violations using pattern recognition algorithms trained on AI training behaviors;\n• automatically generating legal responses upon violation detection.',
      isNew: true
    },
    {
      id: 'suggested-2',
      claimNumber: 2,
      claimType: 'dependent',
      dependsOn: 1,
      claimText: 'The method of claim 1, wherein the multi-modal fingerprinting comprises:\n• extracting visual features using convolutional neural networks;\n• generating structural hashes based on composition geometry;\n• including temporal metadata for versioning protection;\n• applying adversarial robustness transformations to resist bypass attempts.',
      isNew: true
    },
    {
      id: 'suggested-3',
      claimNumber: 3,
      claimType: 'dependent',
      dependsOn: 1,
      claimText: 'The method of claim 1, wherein the AI training detection comprises:\n• real-time API monitoring of machine learning platforms;\n• statistical analysis of content access patterns;\n• behavioral anomaly detection in dataset composition;\n• confidence scoring based on multiple violation indicators.',
      isNew: true
    }
  ]);

  const addClaim = (type: 'independent' | 'dependent' = 'independent') => {
    const newClaimNumber = Math.max(0, ...claims.map(c => c.claimNumber)) + 1;
    const newClaim: PatentClaim = {
      id: `claim-${Date.now()}`,
      claimNumber: newClaimNumber,
      claimType: type,
      claimText: '',
      isNew: true
    };
    onClaimsChange([...claims, newClaim]);
  };

  const removeClaim = (id: string) => {
    onClaimsChange(claims.filter(claim => claim.id !== id));
  };

  const updateClaim = (id: string, field: keyof PatentClaim, value: string | number) => {
    onClaimsChange(claims.map(claim => 
      claim.id === id ? { ...claim, [field]: value } : claim
    ));
  };

  const duplicateClaim = (claim: PatentClaim) => {
    const newClaimNumber = Math.max(0, ...claims.map(c => c.claimNumber)) + 1;
    const duplicatedClaim: PatentClaim = {
      ...claim,
      id: `claim-${Date.now()}`,
      claimNumber: newClaimNumber,
      isNew: true
    };
    onClaimsChange([...claims, duplicatedClaim]);
  };

  const importSuggestedClaims = () => {
    const nextClaimNumber = Math.max(0, ...claims.map(c => c.claimNumber)) + 1;
    const importedClaims = suggestedClaims.map((claim, index) => ({
      ...claim,
      id: `imported-${Date.now()}-${index}`,
      claimNumber: nextClaimNumber + index
    }));
    onClaimsChange([...claims, ...importedClaims]);
  };

  const reorderClaims = () => {
    const reorderedClaims = claims
      .sort((a, b) => {
        if (a.claimType === 'independent' && b.claimType === 'dependent') return -1;
        if (a.claimType === 'dependent' && b.claimType === 'independent') return 1;
        return a.claimNumber - b.claimNumber;
      })
      .map((claim, index) => ({ ...claim, claimNumber: index + 1 }));
    
    onClaimsChange(reorderedClaims);
  };

  const independentClaims = claims.filter(c => c.claimType === 'independent');
  const dependentClaims = claims.filter(c => c.claimType === 'dependent');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Patent Claims Editor
        </CardTitle>
        <CardDescription>
          Draft and refine your patent claims. Claims define the scope of protection for your invention.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => addClaim('independent')} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Independent Claim
          </Button>
          <Button onClick={() => addClaim('dependent')} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Dependent Claim
          </Button>
          <Button onClick={importSuggestedClaims} variant="outline" size="sm">
            Import Suggested Claims
          </Button>
          <Button onClick={reorderClaims} variant="outline" size="sm">
            <ArrowDown className="h-4 w-4 mr-2" />
            Reorder Claims
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Claims Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Independent Claims:</span>
                  <Badge variant="outline">{independentClaims.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Dependent Claims:</span>
                  <Badge variant="outline">{dependentClaims.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Claims:</span>
                  <Badge>{claims.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {claims.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No claims added yet. Start with an independent claim.</p>
              </div>
            )}

            <div className="space-y-4">
              {claims
                .sort((a, b) => a.claimNumber - b.claimNumber)
                .map((claim) => (
                <Card key={claim.id} className={`border-l-4 ${
                  claim.claimType === 'independent' ? 'border-l-blue-500' : 'border-l-green-500'
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">Claim {claim.claimNumber}</CardTitle>
                        <Badge variant={claim.claimType === 'independent' ? 'default' : 'secondary'}>
                          {claim.claimType}
                        </Badge>
                        {claim.isNew && <Badge variant="outline" className="text-green-600">New</Badge>}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateClaim(claim)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeClaim(claim.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {claim.claimType === 'dependent' && (
                      <div className="space-y-2">
                        <Label htmlFor={`depends-${claim.id}`}>Depends on Claim</Label>
                        <Select 
                          value={claim.dependsOn?.toString()} 
                          onValueChange={(value) => updateClaim(claim.id, 'dependsOn', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent claim" />
                          </SelectTrigger>
                          <SelectContent>
                            {claims
                              .filter(c => c.id !== claim.id && c.claimNumber < claim.claimNumber)
                              .map((parentClaim) => (
                                <SelectItem key={parentClaim.id} value={parentClaim.claimNumber.toString()}>
                                  Claim {parentClaim.claimNumber} ({parentClaim.claimType})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor={`text-${claim.id}`}>Claim Text</Label>
                      <Textarea
                        id={`text-${claim.id}`}
                        value={claim.claimText}
                        onChange={(e) => updateClaim(claim.id, 'claimText', e.target.value)}
                        placeholder={
                          claim.claimType === 'independent' 
                            ? "A [system/method/apparatus] for [brief description], comprising:\n• [first element];\n• [second element];\n• [third element]."
                            : "The [system/method/apparatus] of claim [X], wherein [additional limitation]."
                        }
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>

                    {claim.claimText.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Character count: {claim.claimText.length}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-2">Claims Writing Guidelines</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Independent claims stand alone and define the core invention</li>
                <li>• Dependent claims add specific features and narrow the scope</li>
                <li>• Use clear, precise language - avoid vague terms</li>
                <li>• Each claim should be a single sentence</li>
                <li>• Start broad with independent claims, get specific with dependent claims</li>
                <li>• Ensure all claims are supported by your specification</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatentClaimsEditor;