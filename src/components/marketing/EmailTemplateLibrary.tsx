import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Copy, Eye, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplateEditor } from './EmailTemplateEditor';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface EmailTemplateLibraryProps {
  onSelectTemplate?: (template: EmailTemplate) => void;
  onCreateCampaign?: (template: EmailTemplate) => void;
}

export const EmailTemplateLibrary: React.FC<EmailTemplateLibraryProps> = ({
  onSelectTemplate,
  onCreateCampaign
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Load user's templates
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);

    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully.",
      });

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          user_id: userData.user.id,
          name: `${template.name} (Copy)`,
          subject: template.subject,
          html_content: template.html_content,
          is_active: template.is_active
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template duplicated successfully.",
      });

      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate template.",
        variant: "destructive",
      });
    }
  };

  const handleUseTemplate = async (template: EmailTemplate) => {
    try {
      if (onCreateCampaign) {
        onCreateCampaign(template);
      } else if (onSelectTemplate) {
        onSelectTemplate(template);
      }
    } catch (error) {
      console.error('Error using template:', error);
    }
  };

  if (showEditor) {
    return (
      <EmailTemplateEditor
        template={editingTemplate}
        onSave={(template) => {
          setShowEditor(false);
          setEditingTemplate(null);
          loadTemplates();
        }}
        onCancel={() => {
          setShowEditor(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Template Library</h2>
          <p className="text-muted-foreground">
            Browse and manage your email templates
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Search Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No templates found.</p>
            <Button onClick={handleCreateTemplate} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <Card key={template.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Subject: {template.subject}
                    </CardDescription>
                  </div>
                  <Badge variant={template.is_active ? "default" : "secondary"} className="text-xs">
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(template.created_at).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Preview:</p>
                    <div 
                      className="text-sm text-muted-foreground truncate border rounded p-2 bg-muted/50"
                      dangerouslySetInnerHTML={{ 
                        __html: template.html_content.substring(0, 100) + '...' 
                      }}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1"
                    >
                      Use Template
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};