import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, Code, Palette, Type, Image, Link, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
}

interface EmailTemplateEditorProps {
  template?: EmailTemplate | null;
  onSave?: (template: EmailTemplate) => void;
  onCancel?: () => void;
}

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'marketing',
    subject_template: '',
    content_template: '',
    is_public: false,
    tags: [] as string[],
    variables: [] as Array<{ name: string; placeholder: string; required: boolean }>
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newVariable, setNewVariable] = useState({ name: '', placeholder: '', required: false });
  const { toast } = useToast();

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        category: template.category,
        subject_template: template.subject_template,
        content_template: template.content_template,
        is_public: template.is_public,
        tags: template.tags,
        variables: template.variables
      });
    }
  }, [template]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject_template.trim() || !formData.content_template.trim()) {
      toast({
        title: "Error",
        description: "Name, subject, and content are required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      let result;
      if (template) {
        // Update existing template
        const { data, error } = await supabase
          .from('email_templates')
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            subject_template: formData.subject_template,
            content_template: formData.content_template,
            is_public: formData.is_public,
            tags: formData.tags,
            variables: formData.variables
          })
          .eq('id', template.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('email_templates')
          .insert({
            user_id: userData.user.id,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            subject_template: formData.subject_template,
            content_template: formData.content_template,
            is_public: formData.is_public,
            tags: formData.tags,
            variables: formData.variables
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      toast({
        title: "Success",
        description: `Template ${template ? 'updated' : 'created'} successfully!`,
      });

      if (onSave) {
        onSave(result);
      }

    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: `Failed to ${template ? 'update' : 'create'} template.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addVariable = () => {
    if (newVariable.name.trim() && newVariable.placeholder.trim()) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable }]
      }));
      setNewVariable({ name: '', placeholder: '', required: false });
    }
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const insertVariable = (variableName: string) => {
    const placeholder = `{{${variableName}}}`;
    setFormData(prev => ({
      ...prev,
      content_template: prev.content_template + placeholder
    }));
  };

  const previewContent = () => {
    let preview = formData.content_template;
    formData.variables.forEach(variable => {
      const regex = new RegExp(`{{${variable.name}}}`, 'g');
      preview = preview.replace(regex, variable.placeholder);
    });
    return preview;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {template ? 'Edit Template' : 'Create Email Template'}
          </h2>
          <p className="text-muted-foreground">
            Design professional email templates with variables and styling
          </p>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {template ? 'Update' : 'Create'} Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="design" className="space-y-6">
        <TabsList>
          <TabsTrigger value="design">
            <Palette className="w-4 h-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="variables">
            <Code className="w-4 h-4 mr-2" />
            Variables
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Info */}
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
                <CardDescription>Basic template details and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Welcome Email Template"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Template description..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="transactional">Transactional</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                  />
                  <Label htmlFor="is_public">Make template public</Label>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Add tags to organize your templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Content */}
          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
              <CardDescription>Design your email subject and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject Template</Label>
                <Input
                  id="subject"
                  value={formData.subject_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject_template: e.target.value }))}
                  placeholder="Welcome to {{company_name}}, {{first_name}}!"
                />
              </div>

              <div>
                <Label htmlFor="content">Content Template</Label>
                <Textarea
                  id="content"
                  value={formData.content_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_template: e.target.value }))}
                  placeholder="Hi {{first_name}},&#10;&#10;Welcome to {{company_name}}! We're excited to have you on board.&#10;&#10;Best regards,&#10;The {{company_name}} Team"
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>
                Define variables that can be customized when using this template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Variable Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div>
                  <Label htmlFor="var-name">Variable Name</Label>
                  <Input
                    id="var-name"
                    value={newVariable.name}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="first_name"
                  />
                </div>
                <div>
                  <Label htmlFor="var-placeholder">Placeholder</Label>
                  <Input
                    id="var-placeholder"
                    value={newVariable.placeholder}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, placeholder: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="var-required"
                      checked={newVariable.required}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, required: e.target.checked }))}
                    />
                    <Label htmlFor="var-required">Required</Label>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={addVariable} size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Variables List */}
              <div className="space-y-2">
                {formData.variables.map((variable, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {`{{${variable.name}}}`}
                      </code>
                      <span className="text-sm text-muted-foreground">
                        Placeholder: {variable.placeholder}
                      </span>
                      {variable.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => insertVariable(variable.name)}
                      >
                        Insert
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeVariable(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
              <CardDescription>
                Preview how your email will look with placeholder values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white">
                <div className="border-b pb-4 mb-4">
                  <h3 className="font-semibold text-lg">Subject:</h3>
                  <p className="text-muted-foreground">{formData.subject_template}</p>
                </div>
                <div className="prose max-w-none">
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: previewContent().replace(/\n/g, '<br />') 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};