import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Briefcase, Image, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  monitoring_enabled: boolean;
  alert_settings: Record<string, any>;
  created_at: string;
  artwork_count?: number;
}

interface Artwork {
  id: string;
  title: string;
  category: string;
  status: string;
}

export function PortfolioManager() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isArtworkDialogOpen, setIsArtworkDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newPortfolio, setNewPortfolio] = useState({
    name: '',
    description: '',
    monitoring_enabled: true
  });

  useEffect(() => {
    fetchPortfolios();
    fetchArtworks();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get artwork counts for each portfolio
      const portfoliosWithCounts = await Promise.all(
        (data || []).map(async (portfolio) => {
          const { count } = await supabase
            .from('portfolio_items')
            .select('*', { count: 'exact', head: true })
            .eq('portfolio_id', portfolio.id)
            .eq('is_active', true);
          
          return {
            ...portfolio,
            alert_settings: (portfolio.alert_settings as Record<string, any>) || {},
            artwork_count: count || 0
          };
        })
      );

      setPortfolios(portfoliosWithCounts);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from('artwork')
        .select('id, title, category, status')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArtworks(data || []);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  const createPortfolio = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('portfolios')
        .insert([{ ...newPortfolio, user_id: user.user.id }])
        .select()
        .single();

      if (error) throw error;

      const portfolioWithDefaults = {
        ...data,
        alert_settings: (data.alert_settings as Record<string, any>) || {},
        artwork_count: 0
      };

      setPortfolios([portfolioWithDefaults, ...portfolios]);
      setIsCreateDialogOpen(false);
      setNewPortfolio({ name: '', description: '', monitoring_enabled: true });
      
      toast({
        title: "Success",
        description: "Portfolio created successfully",
      });
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to create portfolio",
        variant: "destructive",
      });
    }
  };

  const updatePortfolio = async (portfolio: Portfolio) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .update({
          name: portfolio.name,
          description: portfolio.description,
          is_active: portfolio.is_active,
          monitoring_enabled: portfolio.monitoring_enabled
        })
        .eq('id', portfolio.id);

      if (error) throw error;

      setPortfolios(portfolios.map(p => p.id === portfolio.id ? portfolio : p));
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Portfolio updated successfully",
      });
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to update portfolio",
        variant: "destructive",
      });
    }
  };

  const deletePortfolio = async (portfolioId: string) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      if (error) throw error;

      setPortfolios(portfolios.filter(p => p.id !== portfolioId));
      
      toast({
        title: "Success",
        description: "Portfolio deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to delete portfolio",
        variant: "destructive",
      });
    }
  };

  const addArtworkToPortfolio = async (portfolioId: string, artworkId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .insert([{ portfolio_id: portfolioId, artwork_id: artworkId }]);

      if (error) throw error;

      await fetchPortfolios(); // Refresh to update counts
      
      toast({
        title: "Success",
        description: "Artwork added to portfolio",
      });
    } catch (error) {
      console.error('Error adding artwork to portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to add artwork to portfolio",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Management</h2>
          <p className="text-muted-foreground">Create and manage your artwork portfolios</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Portfolio</DialogTitle>
              <DialogDescription>
                Group your artworks into a portfolio for organized monitoring
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Portfolio Name</Label>
                <Input
                  id="name"
                  value={newPortfolio.name}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })}
                  placeholder="Enter portfolio name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPortfolio.description}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                  placeholder="Describe this portfolio"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="monitoring"
                  checked={newPortfolio.monitoring_enabled}
                  onCheckedChange={(checked) => setNewPortfolio({ ...newPortfolio, monitoring_enabled: checked })}
                />
                <Label htmlFor="monitoring">Enable monitoring</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createPortfolio} disabled={!newPortfolio.name}>
                  Create Portfolio
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPortfolio(portfolio);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePortfolio(portfolio.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{portfolio.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Artworks</span>
                  <Badge variant="outline">{portfolio.artwork_count || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={portfolio.is_active ? "default" : "secondary"}>
                    {portfolio.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monitoring</span>
                  <Badge variant={portfolio.monitoring_enabled ? "default" : "outline"}>
                    {portfolio.monitoring_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPortfolio(portfolio);
                      setIsArtworkDialogOpen(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Image className="w-3 h-3" />
                    Add Artwork
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {portfolios.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No portfolios yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first portfolio to organize and monitor your artworks
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Portfolio
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Portfolio Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Portfolio</DialogTitle>
            <DialogDescription>Update portfolio details and settings</DialogDescription>
          </DialogHeader>
          {selectedPortfolio && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Portfolio Name</Label>
                <Input
                  id="edit-name"
                  value={selectedPortfolio.name}
                  onChange={(e) => setSelectedPortfolio({ ...selectedPortfolio, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedPortfolio.description}
                  onChange={(e) => setSelectedPortfolio({ ...selectedPortfolio, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={selectedPortfolio.is_active}
                  onCheckedChange={(checked) => setSelectedPortfolio({ ...selectedPortfolio, is_active: checked })}
                />
                <Label htmlFor="edit-active">Portfolio active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-monitoring"
                  checked={selectedPortfolio.monitoring_enabled}
                  onCheckedChange={(checked) => setSelectedPortfolio({ ...selectedPortfolio, monitoring_enabled: checked })}
                />
                <Label htmlFor="edit-monitoring">Enable monitoring</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => updatePortfolio(selectedPortfolio)}>
                  Update Portfolio
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Artwork Dialog */}
      <Dialog open={isArtworkDialogOpen} onOpenChange={setIsArtworkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Artwork to Portfolio</DialogTitle>
            <DialogDescription>Select artworks to add to this portfolio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{artwork.title}</h4>
                  <p className="text-sm text-muted-foreground">{artwork.category}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedPortfolio) {
                      addArtworkToPortfolio(selectedPortfolio.id, artwork.id);
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            ))}
            {artworks.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No artworks available. Upload artworks first.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}