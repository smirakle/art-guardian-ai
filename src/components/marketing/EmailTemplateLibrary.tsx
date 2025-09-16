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
  description?: string;
  category: string;
  subject_template: string;
  content_template: string;
  thumbnail_url?: string;
  is_public: boolean;
  usage_count: number;
  tags: string[];
  variables: Array<{ name: string; placeholder: string; required: boolean }>;
  created_at: string;
  updated_at: string;
  user_id: string;
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory, selectedTags]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Load user's templates and public templates
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .or(`user_id.eq.${userData.user.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
      
      // Extract all unique tags
      const tags = new Set<string>();
      data?.forEach(template => {
        template.tags?.forEach((tag: string) => tags.add(tag));
      });
      setAllTags(Array.from(tags));

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
        template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(template =>
        selectedTags.some(tag => template.tags.includes(tag))
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
          description: template.description,
          category: template.category,
          subject_template: template.subject_template,
          content_template: template.content_template,
          is_public: false,
          tags: template.tags,
          variables: template.variables
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
      // Increment usage count
      await supabase.rpc('increment_template_usage', { 
        template_id_param: template.id 
      });

      if (onCreateCampaign) {
        onCreateCampaign(template);
      } else if (onSelectTemplate) {
        onSelectTemplate(template);
      }
    } catch (error) {
      console.error('Error using template:', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'transactional', label: 'Transactional' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'welcome', label: 'Welcome' },
    { value: 'custom', label: 'Custom' }
  ];

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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Filter by tags:</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
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
                    {template.description && (
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    )}
                  </div>
                  {template.is_public && (
                    <Badge variant="secondary" className="text-xs">
                      Public
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Used {template.usage_count} times
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Subject:</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {template.subject_template}
                    </p>
                  </div>
                  
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

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