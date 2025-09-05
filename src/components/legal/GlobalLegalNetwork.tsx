import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Scale, Globe, FileText, Users, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';

interface LegalProfessional {
  id: string;
  full_name: string;
  law_firm: string | null;
  email: string;
  specialties: string[];
  jurisdictions: string[];
  languages: string[];
  years_experience: number | null;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  rating: number | null;
  review_count: number;
  verified_status: string;
  accepts_new_clients: boolean;
}

interface LegalCase {
  id: string;
  case_type: string;
  status: string;
  jurisdiction: string;
  created_at: string;
  professional_assigned: string | null;
  estimated_cost: number | null;
  user_id: string;
  description?: string;
}

const SUPPORTED_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Japan', 'South Korea', 'Singapore', 'Hong Kong', 'New Zealand', 'Ireland',
  'Belgium', 'Austria', 'Italy', 'Spain', 'Portugal', 'Czech Republic', 'Poland'
];

export function GlobalLegalNetwork() {
  const [professionals, setProfessionals] = useState<LegalProfessional[]>([]);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    fetchLegalProfessionals();
    fetchUserCases();
  }, []);

  const fetchLegalProfessionals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_professionals')
        .select('*')
        .eq('verified_status', 'verified')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(20);

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Failed to fetch legal professionals:', error);
      toast.error('Failed to load legal network');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCases = async () => {
    // Mock implementation for demo - replace with actual backend integration
    setCases([]);
  };

  const initiateLegalAction = async (country: string, caseType: string) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('global-legal-network', {
        body: {
          action: 'initiate_legal_action',
          jurisdiction: country,
          case_type: caseType,
          user_id: user.id
        }
      });

      if (error) throw error;

      toast.success(`Legal action initiated in ${country}`);
      fetchUserCases();
    } catch (error) {
      console.error('Failed to initiate legal action:', error);
      toast.error('Failed to initiate legal action');
    } finally {
      setLoading(false);
    }
  };

  const getCountryLegalStatus = (country: string) => {
    const supportedCountries = SUPPORTED_COUNTRIES;
    const isSupported = supportedCountries.includes(country);
    
    return {
      supported: isSupported,
      professionals: professionals.filter(p => p.jurisdictions.includes(country)).length,
      avgResponseTime: isSupported ? '24-48 hours' : 'Not available',
      costEstimate: isSupported ? '$150-500/hour' : 'Varies'
    };
  };

  const filteredProfessionals = professionals.filter(p => {
    const countryMatch = !selectedCountry || p.jurisdictions.includes(selectedCountry);
    const specialtyMatch = !selectedSpecialty || p.specialties.includes(selectedSpecialty);
    return countryMatch && specialtyMatch;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Global Legal Network
          </CardTitle>
          <CardDescription>
            Access to 25+ countries with verified IP lawyers and automated legal action capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{SUPPORTED_COUNTRIES.length}</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-emerald-500">{professionals.length}</div>
              <div className="text-sm text-muted-foreground">Verified Lawyers</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{cases.length}</div>
              <div className="text-sm text-muted-foreground">Active Cases</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-500">24-48h</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="network" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="network">Legal Network</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="cases">My Cases</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <div className="flex gap-4 mb-6">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Countries</option>
              {SUPPORTED_COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Specialties</option>
              <option value="intellectual_property">Intellectual Property</option>
              <option value="copyright">Copyright Law</option>
              <option value="trademark">Trademark Law</option>
              <option value="digital_rights">Digital Rights</option>
              <option value="entertainment">Entertainment Law</option>
            </select>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Loading legal professionals...</div>
                </CardContent>
              </Card>
            ) : filteredProfessionals.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    No legal professionals found for the selected criteria.
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredProfessionals.map((professional) => (
                <Card key={professional.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                          <Scale className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{professional.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{professional.law_firm}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {professional.verified_status === 'verified' && (
                          <Badge variant="default" className="bg-emerald-500">
                            <CheckCircle className="w-3 h-3 mr-1" />Verified
                          </Badge>
                        )}
                        {professional.accepts_new_clients && (
                          <Badge variant="secondary">Available</Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Specialties</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {professional.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty.replace('_', ' ')}
                            </Badge>
                          ))}
                          {professional.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{professional.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Jurisdictions</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {professional.jurisdictions.slice(0, 2).map((jurisdiction) => (
                            <Badge key={jurisdiction} variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {jurisdiction}
                            </Badge>
                          ))}
                          {professional.jurisdictions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{professional.jurisdictions.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Rate & Experience</label>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm">
                            ${professional.hourly_rate_min}-${professional.hourly_rate_max}/hour
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {professional.years_experience} years experience
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{professional.rating}/5.0</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-xs ${
                                  star <= (professional.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({professional.review_count} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        {professional.accepts_new_clients && (
                          <Button size="sm">
                            Contact Lawyer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="countries" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUPPORTED_COUNTRIES.map((country) => {
              const status = getCountryLegalStatus(country);
              return (
                <Card key={country}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{country}</h3>
                      <Badge variant={status.supported ? "default" : "secondary"}>
                        {status.supported ? "Active" : "Limited"}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lawyers:</span>
                        <span>{status.professionals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response:</span>
                        <span>{status.avgResponseTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost:</span>
                        <span>{status.costEstimate}</span>
                      </div>
                    </div>
                    {status.supported && (
                      <Button 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => initiateLegalAction(country, 'copyright_infringement')}
                      >
                        Initiate Action
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          {cases.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  No active legal cases. Start by initiating an action from the Quick Actions tab.
                </div>
              </CardContent>
            </Card>
          ) : (
            cases.map((case_) => (
              <Card key={case_.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold capitalize">
                        {case_.case_type.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">{case_.jurisdiction}</p>
                    </div>
                    <Badge variant={
                      case_.status === 'active' ? 'default' :
                      case_.status === 'pending' ? 'secondary' :
                      case_.status === 'resolved' ? 'default' : 'destructive'
                    }>
                      {case_.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-sm">{new Date(case_.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estimated Cost</label>
                      <p className="text-sm">${case_.estimated_cost || 'TBD'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Professional</label>
                      <p className="text-sm">{case_.professional_assigned || 'Assigning...'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Copyright Infringement</CardTitle>
                <CardDescription>
                  Take immediate action against copyright violations worldwide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => initiateLegalAction('United States', 'copyright_infringement')}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  File DMCA Takedown
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trademark Protection</CardTitle>
                <CardDescription>
                  Protect your brand and trademark rights globally
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => initiateLegalAction('European Union', 'trademark_infringement')}
                >
                  <Scale className="w-4 h-4 mr-2" />
                  File Trademark Claim
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cease & Desist</CardTitle>
                <CardDescription>
                  Send formal legal notices to stop infringement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => initiateLegalAction('Canada', 'cease_and_desist')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Send Notice
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Legal Consultation</CardTitle>
                <CardDescription>
                  Get expert advice from verified IP lawyers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Book Consultation
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}