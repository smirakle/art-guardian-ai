import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, FileImage, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface ProtectionRecord {
  id: string;
  original_filename: string;
  protection_level: string;
  content_type: string;
  created_at: string;
  artwork_id: string | null;
  metadata: Record<string, unknown>;
}

export const ProtectedItemsGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch AI protection records that are NOT linked to artwork (plugin-protected items)
  const { data: protectionRecords, isLoading } = useQuery({
    queryKey: ['plugin-protection-records', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ai_protection_records')
        .select('id, original_filename, protection_level, content_type, created_at, artwork_id, metadata')
        .eq('user_id', user.id)
        .eq('content_type', 'image')
        .is('artwork_id', null) // Only unlinked (plugin-protected) items
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) {
        console.error('Error fetching protection records:', error);
        return [];
      }
      
      return (data || []) as ProtectionRecord[];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Plugin Protected Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render if no plugin-protected items
  if (!protectionRecords || protectionRecords.length === 0) {
    return null;
  }

  const getProtectionLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'maximum':
        return 'bg-purple-600';
      case 'standard':
        return 'bg-primary';
      case 'basic':
      case 'light':
      default:
        return 'bg-green-600';
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Plugin Protected Items
          <Badge variant="secondary" className="ml-2">
            {protectionRecords.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {protectionRecords.map((record) => (
            <div key={record.id} className="relative group">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <FileImage className="h-12 w-12 text-muted-foreground" />
              </div>
              <Badge 
                className={`absolute top-2 right-2 ${getProtectionLevelColor(record.protection_level)}`}
              >
                {record.protection_level || 'Protected'}
              </Badge>
              <p className="mt-2 font-medium truncate text-sm">
                {record.original_filename}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(record.created_at), { addSuffix: true })}
              </p>
            </div>
          ))}
          <button
            onClick={() => navigate('/protection-hub')}
            className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-muted/50 transition-colors"
          >
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium">Protect More</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
