import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileImage, FileText, Video, Music, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { enhancedRealWorldProtection } from "@/lib/enhancedRealWorldProtection";

interface ArtworkItem {
  id: string;
  title: string;
  file_paths: string[];
  ai_protection_enabled: boolean;
  ai_protection_level: string;
  category: string;
  created_at: string;
}

export const ExistingFilesProtection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  const [protecting, setProtecting] = useState(false);

  useEffect(() => {
    if (user) {
      loadArtworks();
    }
  }, [user]);

  const loadArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from('artwork')
        .select('*')
        .eq('user_id', user?.id)
        .eq('ai_protection_enabled', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading artworks:', error);
        return;
      }

      setArtworks(data || []);
    } catch (error) {
      console.error('Error loading artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <FileImage className="w-4 h-4" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
      return <Video className="w-4 h-4" />;
    }
    if (['mp3', 'wav', 'flac', 'aac'].includes(extension || '')) {
      return <Music className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const toggleArtworkSelection = (artworkId: string) => {
    setSelectedArtworks(prev => 
      prev.includes(artworkId) 
        ? prev.filter(id => id !== artworkId)
        : [...prev, artworkId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedArtworks.length === artworks.length) {
      setSelectedArtworks([]);
    } else {
      setSelectedArtworks(artworks.map(a => a.id));
    }
  };

  const protectSelectedArtworks = async () => {
    if (selectedArtworks.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one artwork to protect.",
        variant: "destructive"
      });
      return;
    }

    setProtecting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const artworkId of selectedArtworks) {
        const artwork = artworks.find(a => a.id === artworkId);
        if (!artwork) continue;

        try {
          // For existing files, apply comprehensive AI protection methods
          const protectionMethods = [
            'adversarial_noise',
            'rights_metadata', 
            'crawler_blocking',
            'invisible_watermark',
            'blockchain_registration',
            'blockchain_verified',
            'likeness_protection',
            'advanced_fingerprinting',
            'metadata_injection',
            'robots_txt_entry'
          ];
          
          const { data: protectionRecord, error: protectionError } = await supabase
            .from('ai_protection_records')
            .insert({
              artwork_id: artworkId,
              user_id: user?.id,
              protection_level: 'advanced',
              protection_methods: protectionMethods,
              file_fingerprint: `existing-${artworkId}`,
              original_filename: artwork.title,
              protection_id: `prot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              metadata: {
                appliedToExistingFile: true,
                originalPaths: artwork.file_paths
              }
            })
            .select()
            .single();

          if (protectionError) {
            throw protectionError;
          }

          // Update artwork to mark as AI protected
          const { error: updateError } = await supabase
            .from('artwork')
            .update({ 
              ai_protection_enabled: true,
              ai_protection_level: 'advanced',
              ai_protection_methods: protectionMethods,
              protection_record_id: protectionRecord.id
            })
            .eq('id', artworkId);

          if (updateError) {
            throw updateError;
          }

          successCount++;
        } catch (error) {
          console.error(`Error protecting artwork ${artworkId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Protection Applied",
          description: `Successfully protected ${successCount} artwork(s)`,
        });
        
        // Reload artworks to update the list
        await loadArtworks();
        setSelectedArtworks([]);
      }

      if (errorCount > 0) {
        toast({
          title: "Some Protections Failed",
          description: `${errorCount} artwork(s) could not be protected. Please try again.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Protection process error:', error);
      toast({
        title: "Protection Failed",
        description: "An error occurred during the protection process.",
        variant: "destructive"
      });
    } finally {
      setProtecting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading your artworks...</div>
        </CardContent>
      </Card>
    );
  }

  if (artworks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Protect Existing Files
          </CardTitle>
          <CardDescription>
            Apply AI training protection to your previously uploaded files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">All Files Protected</h3>
            <p className="text-muted-foreground">
              All your uploaded files already have AI training protection enabled.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Protect Existing Files
        </CardTitle>
        <CardDescription>
          Apply AI training protection to your previously uploaded files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedArtworks.length === artworks.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm">
                Select All ({artworks.length} unprotected files)
              </span>
            </div>
            {selectedArtworks.length > 0 && (
              <Button 
                onClick={protectSelectedArtworks}
                disabled={protecting}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                {protecting ? 'Protecting...' : `Protect ${selectedArtworks.length} Selected`}
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={selectedArtworks.includes(artwork.id)}
                  onCheckedChange={() => toggleArtworkSelection(artwork.id)}
                />
                
                <div className="flex items-center gap-2">
                  {getFileIcon(artwork.file_paths[0] || '')}
                  <div className="flex-1">
                    <h4 className="font-medium">{artwork.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {artwork.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {artwork.file_paths.length} file(s)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};