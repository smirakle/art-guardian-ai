import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TipTapEditor } from '@/components/admin/TipTapEditor';

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
    subject: '',
    html_content: '',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        html_content: template.html_content,
        is_active: template.is_active
      });
    }
  }, [template]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.html_content.trim()) {
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
            subject: formData.subject,
            html_content: formData.html_content,
            is_active: formData.is_active
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
            subject: formData.subject,
            html_content: formData.html_content,
            is_active: formData.is_active
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

      <Card>
        <CardHeader>
          <CardTitle>Email Template</CardTitle>
          <CardDescription>Create and edit your email template</CardDescription>
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
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Welcome to our platform!"
            />
          </div>

          <div>
            <Label htmlFor="content">Email Content</Label>
            <TipTapEditor
              value={formData.html_content}
              onChange={(content) => setFormData(prev => ({ ...prev, html_content: content }))}
              placeholder="Write your email content..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            />
            <Label htmlFor="is_active">Template is active</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};