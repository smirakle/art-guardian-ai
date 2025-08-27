import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HardDrive, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StorageUsage {
  storage_used_bytes: number;
  storage_limit_bytes: number;
  artwork_count: number;
  storage_used_gb: string;
  storage_limit_gb: string;
  usage_percentage: number;
  active_addons: any[];
  is_near_limit: boolean;
  is_over_limit: boolean;
}

export const StorageWidget = () => {
  const [storageData, setStorageData] = useState<StorageUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const { toast } = useToast();

  const storageOptions = [
    { value: "1", label: "1GB", price: "$2.99/month" },
    { value: "5", label: "5GB", price: "$9.99/month" },
    { value: "10", label: "10GB", price: "$15.99/month" },
    { value: "25", label: "25GB", price: "$29.99/month" },
    { value: "50", label: "50GB", price: "$49.99/month" },
    { value: "100", label: "100GB", price: "$79.99/month" }
  ];

  const fetchStorageData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-user-storage');
      
      if (error) throw error;
      
      setStorageData(data);
    } catch (error) {
      console.error('Error fetching storage data:', error);
      toast({
        title: "Error",
        description: "Failed to load storage information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageData();
  }, []);

  const handlePurchaseStorage = async () => {
    if (!selectedStorage) {
      toast({
        title: "Error",
        description: "Please select a storage amount",
        variant: "destructive"
      });
      return;
    }

    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('purchase-storage-addon', {
        body: {
          storage_amount_gb: parseInt(selectedStorage),
          addon_type: 'extra_storage'
        }
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      window.open(data.url, '_blank');
      setIsUpgradeOpen(false);
      
      toast({
        title: "Redirecting to checkout",
        description: "You'll be redirected to complete your purchase"
      });
    } catch (error) {
      console.error('Error purchasing storage:', error);
      toast({
        title: "Error",
        description: "Failed to initiate storage purchase",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!storageData) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Error</div>
          <p className="text-xs text-muted-foreground">Failed to load storage data</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (storageData.is_over_limit) return "destructive";
    if (storageData.is_near_limit) return "secondary";
    return "default";
  };

  const getStatusIcon = () => {
    if (storageData.is_over_limit) return <AlertTriangle className="h-4 w-4" />;
    if (storageData.is_near_limit) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {storageData.is_over_limit ? "Over Limit" : 
             storageData.is_near_limit ? "Near Limit" : "Good"}
          </Badge>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {storageData.storage_used_gb}GB / {storageData.storage_limit_gb}GB
        </div>
        <Progress 
          value={storageData.usage_percentage} 
          className="mt-2"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {storageData.artwork_count} files • {storageData.usage_percentage}% used
          </p>
          {storageData.active_addons.length > 0 && (
            <Badge variant="outline" className="text-xs">
              +{storageData.active_addons.reduce((sum, addon) => sum + addon.storage_amount_gb, 0)}GB
            </Badge>
          )}
        </div>
        
        {(storageData.is_near_limit || storageData.is_over_limit) && (
          <div className="mt-4">
            <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Upgrade Storage
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add More Storage</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select additional storage:</label>
                    <Select value={selectedStorage} onValueChange={setSelectedStorage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose storage amount" />
                      </SelectTrigger>
                      <SelectContent>
                        {storageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} - {option.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handlePurchaseStorage} 
                    disabled={purchasing || !selectedStorage}
                    className="w-full"
                  >
                    {purchasing ? "Processing..." : "Purchase Storage"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};