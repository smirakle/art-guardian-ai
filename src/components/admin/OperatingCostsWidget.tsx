import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Calculator, Plus, Edit2, PieChart, BarChart3 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OperatingCost {
  id: string;
  category: string;
  subcategory: string | null;
  monthly_amount: number;
  annual_amount: number;
  currency: string;
  description: string | null;
  is_variable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CostSummary {
  total_monthly: number;
  total_annual: number;
  fixed_monthly: number;
  variable_monthly: number;
  cost_breakdown: any;
}

const OperatingCostsWidget: React.FC = () => {
  const [costs, setCosts] = useState<OperatingCost[]>([]);
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<OperatingCost | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    monthly_amount: '',
    description: '',
    is_variable: false
  });

  useEffect(() => {
    loadOperatingCosts();
    loadCostSummary();
  }, []);

  const loadOperatingCosts = async () => {
    try {
      const { data, error } = await supabase
        .from('operating_costs')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setCosts(data || []);
    } catch (error) {
      console.error('Error loading operating costs:', error);
      toast({
        title: "Error",
        description: "Failed to load operating costs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCostSummary = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_total_operating_costs');

      if (error) throw error;
      if (data && data.length > 0) {
        setSummary(data[0]);
      }
    } catch (error) {
      console.error('Error loading cost summary:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const costData = {
        category: formData.category,
        subcategory: formData.subcategory || null,
        monthly_amount: parseInt(formData.monthly_amount) * 100, // Convert to cents
        description: formData.description || null,
        is_variable: formData.is_variable
      };

      let error;
      if (editingCost) {
        ({ error } = await supabase
          .from('operating_costs')
          .update(costData)
          .eq('id', editingCost.id));
      } else {
        ({ error } = await supabase
          .from('operating_costs')
          .insert([costData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Operating cost ${editingCost ? 'updated' : 'added'} successfully`,
      });

      setIsAddDialogOpen(false);
      setEditingCost(null);
      setFormData({
        category: '',
        subcategory: '',
        monthly_amount: '',
        description: '',
        is_variable: false
      });
      
      loadOperatingCosts();
      loadCostSummary();
    } catch (error) {
      console.error('Error saving operating cost:', error);
      toast({
        title: "Error",
        description: "Failed to save operating cost",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (cost: OperatingCost) => {
    setEditingCost(cost);
    setFormData({
      category: cost.category,
      subcategory: cost.subcategory || '',
      monthly_amount: (cost.monthly_amount / 100).toString(),
      description: cost.description || '',
      is_variable: cost.is_variable
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('operating_costs')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Operating cost deleted successfully",
      });

      loadOperatingCosts();
      loadCostSummary();
    } catch (error) {
      console.error('Error deleting operating cost:', error);
      toast({
        title: "Error",
        description: "Failed to delete operating cost",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'infrastructure': return '🏗️';
      case 'api services': return '🔌';
      case 'legal': return '⚖️';
      case 'operations': return '⚙️';
      case 'development': return '💻';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Operating Costs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Operating Costs
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingCost(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Cost
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCost ? 'Edit Operating Cost' : 'Add Operating Cost'}
                </DialogTitle>
                <DialogDescription>
                  {editingCost ? 'Update the operating cost details.' : 'Add a new operating cost item.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="API Services">API Services</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    placeholder="e.g., Supabase Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="monthly_amount">Monthly Amount ($)</Label>
                  <Input
                    id="monthly_amount"
                    type="number"
                    value={formData.monthly_amount}
                    onChange={(e) => setFormData({...formData, monthly_amount: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of this cost"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_variable"
                    checked={formData.is_variable}
                    onCheckedChange={(checked) => setFormData({...formData, is_variable: checked})}
                  />
                  <Label htmlFor="is_variable">Variable Cost</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCost ? 'Update' : 'Add'} Cost
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            {summary && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Monthly Total</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summary.total_monthly)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Annual Total</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summary.total_annual)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Fixed Costs</span>
                  </div>
                  <div className="text-lg font-semibold text-primary">
                    {formatCurrency(summary.fixed_monthly)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Variable Costs</span>
                  </div>
                  <div className="text-lg font-semibold text-accent">
                    {formatCurrency(summary.variable_monthly)}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            {summary?.cost_breakdown && Object.entries(summary.cost_breakdown).map(([category, data]: [string, any]) => (
              <div key={category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <h4 className="font-semibold">{category}</h4>
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(data.monthly_total)}
                  </div>
                </div>
                <div className="space-y-2">
                  {data.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{item.subcategory}</span>
                        {item.is_variable && <Badge variant="secondary" className="text-xs">Variable</Badge>}
                      </div>
                      <span className="font-medium">{formatCurrency(item.monthly_amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-3">
              {costs.map((cost) => (
                <div key={cost.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{getCategoryIcon(cost.category)}</span>
                      <span className="font-medium">{cost.subcategory || cost.category}</span>
                      {cost.is_variable && <Badge variant="outline" className="text-xs">Variable</Badge>}
                    </div>
                    {cost.description && (
                      <p className="text-sm text-muted-foreground">{cost.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(cost.monthly_amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(cost.annual_amount)}/year
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(cost)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(cost.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OperatingCostsWidget;