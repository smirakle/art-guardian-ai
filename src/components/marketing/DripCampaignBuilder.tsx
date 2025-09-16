import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Mail, Clock, Users, Play, Pause, Copy, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DripSequence {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  is_active: boolean;
  created_at: string;
  steps?: DripStep[];
}

interface DripStep {
  id?: string;
  step_order: number;
  delay_days: number;
  delay_hours: number;
  subject_template: string;
  content_template: string;
  template_id?: string;
  is_active: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
}

export const DripCampaignBuilder = () => {
  const [sequences, setSequences] = useState<DripSequence[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<DripSequence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  // New sequence form
  const [newSequence, setNewSequence] = useState({
    name: '',
    description: '',
    trigger_type: 'manual'
  });

  // Steps for the selected sequence
  const [steps, setSteps] = useState<DripStep[]>([]);

  useEffect(() => {
    fetchSequences();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedSequence) {
      fetchSequenceSteps(selectedSequence.id);
    }
  }, [selectedSequence]);

  const fetchSequences = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_drip_sequences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSequences(data || []);
    } catch (error) {
      console.error('Error fetching drip sequences:', error);
      toast({
        title: "Error",
        description: "Failed to fetch drip sequences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject, html_content')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchSequenceSteps = async (sequenceId: string) => {
    try {
      const { data, error } = await supabase
        .from('email_drip_steps')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('step_order');

      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error('Error fetching sequence steps:', error);
    }
  };

  const handleCreateSequence = async () => {
    if (!newSequence.name.trim()) {
      toast({
        title: "Error",
        description: "Sequence name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('email_drip_sequences')
        .insert({
          user_id: userData.user.id,
          name: newSequence.name,
          description: newSequence.description,
          trigger_type: newSequence.trigger_type
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Drip sequence created successfully.",
      });

      setShowCreateDialog(false);
      setNewSequence({ name: '', description: '', trigger_type: 'manual' });
      fetchSequences();
      setSelectedSequence(data);

    } catch (error) {
      console.error('Error creating sequence:', error);
      toast({
        title: "Error",
        description: "Failed to create drip sequence.",
        variant: "destructive",
      });
    }
  };

  const addStep = () => {
    const newStep: DripStep = {
      step_order: steps.length + 1,
      delay_days: 1,
      delay_hours: 0,
      subject_template: '',
      content_template: '',
      is_active: true
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (index: number, field: keyof DripStep, value: any) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setSteps(updatedSteps);
  };

  const removeStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    // Reorder step numbers
    updatedSteps.forEach((step, i) => {
      step.step_order = i + 1;
    });
    setSteps(updatedSteps);
  };

  const handleTemplateSelect = (stepIndex: number, templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      updateStep(stepIndex, 'template_id', templateId);
      updateStep(stepIndex, 'subject_template', template.subject);
      updateStep(stepIndex, 'content_template', template.html_content);
    }
  };

  const saveSequenceSteps = async () => {
    if (!selectedSequence) return;

    try {
      // Delete existing steps
      await supabase
        .from('email_drip_steps')
        .delete()
        .eq('sequence_id', selectedSequence.id);

      // Insert new steps
      if (steps.length > 0) {
        const stepsToInsert = steps.map(step => ({
          sequence_id: selectedSequence.id,
          step_order: step.step_order,
          delay_days: step.delay_days,
          delay_hours: step.delay_hours,
          subject_template: step.subject_template,
          content_template: step.content_template,
          template_id: step.template_id,
          is_active: step.is_active
        }));

        const { error } = await supabase
          .from('email_drip_steps')
          .insert(stepsToInsert);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Drip sequence steps saved successfully.",
      });

    } catch (error) {
      console.error('Error saving sequence steps:', error);
      toast({
        title: "Error",
        description: "Failed to save sequence steps.",
        variant: "destructive",
      });
    }
  };

  const toggleSequenceStatus = async (sequenceId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('email_drip_sequences')
        .update({ is_active: !isActive })
        .eq('id', sequenceId);

      if (error) throw error;

      setSequences(prev => 
        prev.map(seq => 
          seq.id === sequenceId ? { ...seq, is_active: !isActive } : seq
        )
      );

      if (selectedSequence?.id === sequenceId) {
        setSelectedSequence(prev => 
          prev ? { ...prev, is_active: !isActive } : null
        );
      }

      toast({
        title: "Success",
        description: `Sequence ${!isActive ? 'activated' : 'deactivated'} successfully.`,
      });

    } catch (error) {
      console.error('Error updating sequence status:', error);
      toast({
        title: "Error",
        description: "Failed to update sequence status.",
        variant: "destructive",
      });
    }
  };

  const duplicateSequence = async (sequence: DripSequence) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data: newSequence, error } = await supabase
        .from('email_drip_sequences')
        .insert({
          user_id: userData.user.id,
          name: `${sequence.name} (Copy)`,
          description: sequence.description,
          trigger_type: sequence.trigger_type,
          is_active: false
        })
        .select()
        .single();

      if (error) throw error;

      // Copy steps if they exist
      const { data: originalSteps } = await supabase
        .from('email_drip_steps')
        .select('*')
        .eq('sequence_id', sequence.id);

      if (originalSteps && originalSteps.length > 0) {
        const stepsToInsert = originalSteps.map(step => ({
          sequence_id: newSequence.id,
          step_order: step.step_order,
          delay_days: step.delay_days,
          delay_hours: step.delay_hours,
          subject_template: step.subject_template,
          content_template: step.content_template,
          template_id: step.template_id,
          is_active: step.is_active
        }));

        await supabase
          .from('email_drip_steps')
          .insert(stepsToInsert);
      }

      toast({
        title: "Success",
        description: "Sequence duplicated successfully.",
      });

      fetchSequences();

    } catch (error) {
      console.error('Error duplicating sequence:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate sequence.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Drip Campaign Builder</h2>
          <Button disabled>Loading...</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Drip Campaign Builder</h2>
          <p className="text-muted-foreground">
            Create automated email sequences that nurture your subscribers
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Sequence
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Drip Sequence</DialogTitle>
              <DialogDescription>
                Set up a new automated email sequence for your subscribers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sequenceName">Sequence Name</Label>
                <Input
                  id="sequenceName"
                  placeholder="Welcome Series"
                  value={newSequence.name}
                  onChange={(e) => setNewSequence(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="sequenceDescription">Description</Label>
                <Textarea
                  id="sequenceDescription"
                  placeholder="A series of emails to welcome new subscribers"
                  value={newSequence.description}
                  onChange={(e) => setNewSequence(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="triggerType">Trigger Type</Label>
                <Select 
                  value={newSequence.trigger_type} 
                  onValueChange={(value) => setNewSequence(prev => ({ ...prev, trigger_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="signup">New Signup</SelectItem>
                    <SelectItem value="purchase">After Purchase</SelectItem>
                    <SelectItem value="abandoned_cart">Abandoned Cart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateSequence} className="w-full">
                Create Sequence
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sequences List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Drip Sequences</CardTitle>
            <CardDescription>
              Your automated email sequences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sequences.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No sequences created yet</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  Create Your First Sequence
                </Button>
              </div>
            ) : (
              sequences.map(sequence => (
                <div 
                  key={sequence.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-accent ${
                    selectedSequence?.id === sequence.id ? 'border-primary bg-accent' : ''
                  }`}
                  onClick={() => setSelectedSequence(sequence)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{sequence.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSequenceStatus(sequence.id, sequence.is_active);
                        }}
                      >
                        {sequence.is_active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSequence(sequence);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{sequence.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded ${
                      sequence.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sequence.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-muted-foreground">{sequence.trigger_type}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sequence Builder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedSequence ? `Edit: ${selectedSequence.name}` : 'Select a Sequence'}
            </CardTitle>
            <CardDescription>
              {selectedSequence ? 'Build your email sequence steps' : 'Choose a sequence to edit from the left'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedSequence ? (
              <div className="text-center py-12">
                <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  Select a sequence from the left to start building
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Sequence Info */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{selectedSequence.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedSequence.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Trigger: {selectedSequence.trigger_type}</span>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Email Steps</h4>
                    <Button onClick={addStep} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Step
                    </Button>
                  </div>

                  {steps.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <ArrowDown className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground mb-4">No steps added yet</p>
                      <Button onClick={addStep}>Add First Step</Button>
                    </div>
                  ) : (
                    steps.map((step, index) => (
                      <Card key={index} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                {step.step_order}
                              </div>
                              <span className="font-medium">Step {step.step_order}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStep(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label>Delay</Label>
                              <div className="flex space-x-2">
                                <Input
                                  type="number"
                                  placeholder="Days"
                                  value={step.delay_days}
                                  onChange={(e) => updateStep(index, 'delay_days', parseInt(e.target.value) || 0)}
                                />
                                <Input
                                  type="number"
                                  placeholder="Hours"
                                  value={step.delay_hours}
                                  onChange={(e) => updateStep(index, 'delay_hours', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Wait {step.delay_days} days {step.delay_hours} hours before sending
                              </p>
                            </div>

                            <div>
                              <Label>Use Template (optional)</Label>
                              <Select 
                                value={step.template_id || ''} 
                                onValueChange={(value) => handleTemplateSelect(index, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select template" />
                                </SelectTrigger>
                                <SelectContent>
                                  {templates.map(template => (
                                    <SelectItem key={template.id} value={template.id}>
                                      {template.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="md:col-span-2">
                              <Label>Subject Line</Label>
                              <Input
                                placeholder="Email subject..."
                                value={step.subject_template}
                                onChange={(e) => updateStep(index, 'subject_template', e.target.value)}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <Label>Email Content</Label>
                              <Textarea
                                placeholder="Email content (HTML allowed)..."
                                value={step.content_template}
                                onChange={(e) => updateStep(index, 'content_template', e.target.value)}
                                rows={4}
                              />
                            </div>
                          </div>
                        </CardContent>
                        {index < steps.length - 1 && (
                          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                            <ArrowDown className="h-6 w-6 text-muted-foreground bg-background rounded-full p-1" />
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>

                {steps.length > 0 && (
                  <div className="flex justify-end">
                    <Button onClick={saveSequenceSteps}>
                      Save Sequence
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};