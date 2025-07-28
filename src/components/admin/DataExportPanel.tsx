import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  Download, 
  Database, 
  Users,
  Shield,
  Activity,
  FileText,
  Calendar as CalendarIcon,
  Filter,
  Loader2
} from "lucide-react";

interface ExportOptions {
  users: boolean;
  artwork: boolean;
  scans: boolean;
  matches: boolean;
  alerts: boolean;
  audit: boolean;
  social: boolean;
  blockchain: boolean;
}

const DataExportPanel = () => {
  const [selectedOptions, setSelectedOptions] = useState<ExportOptions>({
    users: false,
    artwork: false,
    scans: false,
    matches: false,
    alerts: false,
    audit: false,
    social: false,
    blockchain: false
  });
  
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const exportConfigs = [
    {
      key: 'users' as keyof ExportOptions,
      label: 'User Data',
      description: 'User profiles, roles, and subscription info',
      icon: Users,
      table: 'profiles',
      color: 'bg-blue-500'
    },
    {
      key: 'artwork' as keyof ExportOptions,
      label: 'Artwork Registry',
      description: 'All registered artworks and metadata',
      icon: FileText,
      table: 'artwork',
      color: 'bg-green-500'
    },
    {
      key: 'scans' as keyof ExportOptions,
      label: 'Monitoring Scans',
      description: 'Scan history and results',
      icon: Activity,
      table: 'monitoring_scans',
      color: 'bg-purple-500'
    },
    {
      key: 'matches' as keyof ExportOptions,
      label: 'Copyright Matches',
      description: 'Detected copyright infringements',
      icon: Shield,
      table: 'copyright_matches',
      color: 'bg-red-500'
    },
    {
      key: 'alerts' as keyof ExportOptions,
      label: 'System Alerts',
      description: 'All monitoring alerts',
      icon: Activity,
      table: 'monitoring_alerts',
      color: 'bg-yellow-500'
    },
    {
      key: 'audit' as keyof ExportOptions,
      label: 'Security Audit',
      description: 'Security and audit logs',
      icon: Shield,
      table: 'security_audit_log',
      color: 'bg-orange-500'
    }
  ];

  const handleExportSelection = (key: keyof ExportOptions, checked: boolean) => {
    setSelectedOptions(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportData = async () => {
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    if (selectedCount === 0) {
      toast.error('Please select at least one data type to export');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      let completed = 0;
      const total = selectedCount;

      for (const config of exportConfigs) {
        if (!selectedOptions[config.key]) continue;

        let query = supabase.from(config.table as any).select('*');
        
        if (dateRange.from) {
          query = query.gte('created_at', dateRange.from.toISOString());
        }
        if (dateRange.to) {
          query = query.lte('created_at', dateRange.to.toISOString());
        }

        const { data, error } = await query;
        
        if (error) {
          throw new Error(`Failed to export ${config.label}: ${error.message}`);
        }

        if (data && data.length > 0) {
          downloadCSV(data, config.table);
          toast.success(`Exported ${data.length} ${config.label} records`);
        } else {
          toast.info(`No ${config.label} data found for the selected period`);
        }

        completed++;
        setExportProgress((completed / total) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success('Data export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedOptions).every(Boolean);
    const newState = !allSelected;
    
    setSelectedOptions({
      users: newState,
      artwork: newState,
      scans: newState,
      matches: newState,
      alerts: newState,
      audit: newState,
      social: newState,
      blockchain: newState
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Data Export Center
          </h1>
          <p className="text-muted-foreground">
            Export system data for analysis, backup, or compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSelectAll} variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Select All
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {dateRange.from && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="w-4 h-4" />
              Export data from {format(dateRange.from, 'MMM dd, yyyy')} 
              {dateRange.to && ` to ${format(dateRange.to, 'MMM dd, yyyy')}`}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exportConfigs.map((config) => {
          const Icon = config.icon;
          const isSelected = selectedOptions[config.key];
          
          return (
            <Card 
              key={config.key}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => handleExportSelection(config.key, !isSelected)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color} text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-lg">{config.label}</CardTitle>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => 
                      handleExportSelection(config.key, checked === true)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{config.description}</p>
                {isSelected && (
                  <Badge variant="secondary" className="mt-2">
                    Selected for export
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isExporting && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Exporting data...</span>
              <span className="text-sm text-muted-foreground">{Math.round(exportProgress)}%</span>
            </div>
            <Progress value={exportProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {Object.values(selectedOptions).filter(Boolean).length} data type(s) selected
              </span>
            </div>
            <Button 
              onClick={exportData}
              disabled={isExporting || Object.values(selectedOptions).every(v => !v)}
              className="min-w-[120px]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p><strong>Format:</strong> CSV files with UTF-8 encoding</p>
            <p><strong>File naming:</strong> table_name_YYYY-MM-DD.csv</p>
            <p><strong>Data privacy:</strong> All exports are logged for security audit</p>
            <p><strong>Size limits:</strong> Large datasets will be automatically paginated</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExportPanel;