import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, FileImage, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';

interface ProtectionRecord {
  id: string;
  original_filename: string;
  protection_level: string;
  content_type: string;
  created_at: string;
  artwork_id: string | null;
  metadata: {
    thumbnailPath?: string;
    [key: string]: unknown;
  };
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
            <ThumbnailCard key={record.id} record={record} getProtectionLevelColor={getProtectionLevelColor} />
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

// Separate component for thumbnail loading
const ThumbnailCard = ({ 
  record, 
  getProtectionLevelColor 
}: { 
  record: ProtectionRecord; 
  getProtectionLevelColor: (level: string) => string;
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThumbnail = async () => {
      const thumbnailPath = record.metadata?.thumbnailPath;
      
      if (thumbnailPath && typeof thumbnailPath === 'string') {
        try {
          const { data, error } = await supabase.storage
            .from('artwork')
            .createSignedUrl(thumbnailPath, 3600);
          
          if (data?.signedUrl) {
            setThumbnailUrl(data.signedUrl);
          }
          if (error) {
            console.error('Failed to create signed URL:', error);
          }
        } catch (error) {
          console.error('Failed to load thumbnail:', error);
        }
      }
      setIsLoading(false);
    };

    loadThumbnail();
  }, [record.metadata?.thumbnailPath]);

  // Get file extension for display
  const fileExt = record.original_filename?.split('.').pop()?.toUpperCase() || 'IMG';

  const levelColors: Record<string, string> = {
    maximum: 'text-purple-600 dark:text-purple-400',
    standard: 'text-green-600 dark:text-green-400',
    basic: 'text-blue-600 dark:text-blue-400',
    light: 'text-blue-600 dark:text-blue-400',
    pro: 'text-purple-600 dark:text-purple-400',
  };
  const levelBgColors: Record<string, string> = {
    maximum: 'bg-purple-500/10',
    standard: 'bg-green-500/10',
    basic: 'bg-blue-500/10',
    light: 'bg-blue-500/10',
    pro: 'bg-purple-500/10',
  };
  const level = record.protection_level?.toLowerCase() || 'standard';

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {isLoading ? (
          <div className="animate-pulse w-full h-full bg-muted" />
        ) : thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={record.original_filename}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setThumbnailUrl(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-muted to-muted/30">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <FileImage className="h-7 w-7 text-primary/50" />
            </div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{fileExt}</span>
            <span className="text-[9px] text-muted-foreground/60 mt-0.5">Protected Locally</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Protection badge */}
        <div className="absolute top-2.5 right-2.5">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md shadow-lg ${getProtectionLevelColor(record.protection_level)}`}>
            <Shield className="h-3 w-3 text-white" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wide">
              {record.protection_level || 'Protected'}
            </span>
          </div>
        </div>
        {/* Filename on image */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-semibold text-sm text-white truncate drop-shadow-md">{record.original_filename}</p>
        </div>
      </div>
      {/* Protection Stats */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <Shield className={`h-3.5 w-3.5 ${levelColors[level] || 'text-green-600'}`} />
          <span className={`text-xs font-semibold capitalize ${levelColors[level] || 'text-green-600'}`}>
            {level} Protection
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${levelBgColors[level] || 'bg-green-500/10'} ${levelColors[level] || 'text-green-600'}`}>
            AI Shield
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
            Plugin
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(record.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};
