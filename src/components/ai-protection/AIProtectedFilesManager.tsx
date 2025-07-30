import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileText, Image, Music, Video, Search, Filter, CheckSquare, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ProtectedFile {
  id: string;
  original_filename: string;
  protected_file_path: string;
  protection_level: string;
  protection_methods: string[];
  applied_at: string;
  artwork_id: string;
  user_id: string;
  file_fingerprint: string;
  protection_id: string;
  metadata: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const AIProtectedFilesManager = () => {
  const [files, setFiles] = useState<ProtectedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProtectedFiles();
    }
  }, [user]);

  const loadProtectedFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_protection_records')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      const transformedFiles = (data || []).map(item => ({
        ...item,
        protection_methods: Array.isArray(item.protection_methods) 
          ? item.protection_methods.map(method => String(method))
          : typeof item.protection_methods === 'string'
            ? [item.protection_methods]
            : []
      }));
      setFiles(transformedFiles);
    } catch (error) {
      console.error('Error loading protected files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load protected files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (file: ProtectedFile) => {
    if (!file.protected_file_path) {
      toast({
        title: 'Error',
        description: 'Protected file not found in storage',
        variant: 'destructive',
      });
      return;
    }

    try {
      setDownloading(prev => new Set(prev).add(file.id));

      const { data, error } = await supabase.storage
        .from('ai-protected-files')
        .download(file.protected_file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: `Downloaded ${file.original_filename}`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    } finally {
      setDownloading(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const downloadSelectedFiles = async () => {
    const filesToDownload = files.filter(file => selectedFiles.has(file.id));
    
    for (const file of filesToDownload) {
      await downloadFile(file);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setSelectedFiles(new Set());
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(file => file.id)));
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return <Image className="h-4 w-4" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext || '')) {
      return <Video className="h-4 w-4" />;
    }
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext || '')) {
      return <Music className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getProtectionStrength = (methods: string[]) => {
    return methods.length * 20; // Simple calculation based on number of methods
  };

  const filteredFiles = files.filter(file =>
    file.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Protected Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          AI Protected Files ({files.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {selectedFiles.size > 0 && (
            <Button
              onClick={downloadSelectedFiles}
              className="whitespace-nowrap"
            >
              Download Selected ({selectedFiles.size})
            </Button>
          )}
        </div>

        {filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {files.length === 0 ? 'No protected files found' : 'No files match your search'}
          </div>
        ) : (
          <>
            {/* Select all toggle */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-b pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className="h-auto p-1"
              >
                {selectedFiles.size === filteredFiles.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </Button>
              <span>
                {selectedFiles.size > 0 
                  ? `${selectedFiles.size} of ${filteredFiles.length} selected`
                  : `${filteredFiles.length} files`
                }
              </span>
            </div>

            {/* Files list */}
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFileSelection(file.id)}
                    className="h-auto p-1"
                  >
                    {selectedFiles.has(file.id) ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="text-muted-foreground">
                    {getFileIcon(file.original_filename)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">
                        {file.original_filename}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {file.protection_level}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Protection: {getProtectionStrength(file.protection_methods)}%
                      </span>
                      <span>
                        {format(new Date(file.applied_at), 'MMM d, yyyy')}
                      </span>
                      <span>
                        {file.protection_methods.length} method{file.protection_methods.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-1">
                      {file.protection_methods.slice(0, 3).map((method, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                      {file.protection_methods.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{file.protection_methods.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => downloadFile(file)}
                    disabled={downloading.has(file.id)}
                    size="sm"
                    className="shrink-0"
                  >
                    {downloading.has(file.id) ? (
                      'Downloading...'
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};