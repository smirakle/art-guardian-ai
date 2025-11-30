import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  GraduationCap, 
  Award,
  Clock,
  DollarSign
} from 'lucide-react';

interface IPLawyer {
  id: string;
  name: string;
  law_firm: string;
  email: string;
  phone?: string;
  website?: string;
  specialties: string[];
  location: string;
  state: string;
  city: string;
  years_experience?: number;
  bar_admissions?: string[];
  description?: string;
  hourly_rate_range?: string;
  languages?: string[];
  is_verified: boolean;
  accepts_new_clients: boolean;
}

const IPLawyersDirectory = () => {
  const [lawyers, setLawyers] = useState<IPLawyer[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<IPLawyer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      const { data, error } = await supabase
        .from('ip_lawyers')
        .select('*')
        .eq('is_verified', true)
        .eq('accepts_new_clients', true)
        .order('name');

      if (error) throw error;
      
      setLawyers(data || []);
      setFilteredLawyers(data || []);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = lawyers;

    if (searchTerm) {
      filtered = filtered.filter(lawyer => 
        lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.law_firm.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedState && selectedState !== 'all') {
      filtered = filtered.filter(lawyer => lawyer.state === selectedState);
    }

    if (selectedSpecialty && selectedSpecialty !== 'all') {
      filtered = filtered.filter(lawyer => 
        lawyer.specialties.includes(selectedSpecialty)
      );
    }

    setFilteredLawyers(filtered);
  }, [searchTerm, selectedState, selectedSpecialty, lawyers]);

  const uniqueStates = [...new Set(lawyers.map(lawyer => lawyer.state))].sort();
  const uniqueSpecialties = [...new Set(lawyers.flatMap(lawyer => lawyer.specialties))].sort();

  const handleContact = (lawyer: IPLawyer) => {
    const subject = encodeURIComponent(`IP Legal Consultation Request - ${lawyer.name}`);
    const body = encodeURIComponent(`Dear ${lawyer.name},\n\nI am reaching out regarding IP legal services for my creative work. I found your contact information through the TSMO legal directory.\n\nI would like to schedule a consultation to discuss:\n- Copyright protection for my digital artwork\n- Potential IP infringement issues\n- Legal protection strategies\n\nPlease let me know your availability for a consultation.\n\nBest regards,`);
    
    window.open(`mailto:${lawyer.email}?subject=${subject}&body=${body}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading IP lawyers directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">IP Lawyers Directory</h2>
        <p className="text-muted-foreground text-lg mb-4">
          Connect with verified intellectual property attorneys specializing in creative work protection
        </p>
        
        {/* Disclaimer */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This directory is provided for informational purposes only. TSMO Technology Inc is not in partnership with, affiliated with, or endorsing any of the law firms or attorneys listed. We recommend conducting your own due diligence when selecting legal representation.
          </p>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lawyers or specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {uniqueStates.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger>
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {uniqueSpecialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setSelectedState('all');
              setSelectedSpecialty('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredLawyers.length} of {lawyers.length} verified IP lawyers
        </p>
      </div>

      {/* Lawyers Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredLawyers.map((lawyer) => (
          <Card key={lawyer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{lawyer.name}</CardTitle>
                    {lawyer.is_verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Award className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-base font-medium text-foreground">
                    {lawyer.law_firm}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{lawyer.location}</span>
                {lawyer.years_experience && (
                  <>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{lawyer.years_experience} years experience</span>
                  </>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Description */}
              {lawyer.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {lawyer.description}
                </p>
              )}
              
              {/* Specialties */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {lawyer.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                {lawyer.hourly_rate_range && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{lawyer.hourly_rate_range}</span>
                  </div>
                )}
                
                {lawyer.bar_admissions && lawyer.bar_admissions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{lawyer.bar_admissions.join(', ')}</span>
                  </div>
                )}
              </div>
              
              {/* Languages */}
              {lawyer.languages && lawyer.languages.length > 1 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Languages: {lawyer.languages.join(', ')}
                  </p>
                </div>
              )}
              
              {/* Contact Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleContact(lawyer)}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                
                {lawyer.phone && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(`tel:${lawyer.phone}`, '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                )}
                
                {lawyer.website && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(lawyer.website, '_blank')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredLawyers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No lawyers found matching your criteria. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default IPLawyersDirectory;