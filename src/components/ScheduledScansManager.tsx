import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar as CalendarIcon,
  Clock, 
  Play, 
  Pause, 
  Trash2, 
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

interface ScheduledScan {
  id: string;
  artwork_id: string;
  scan_type: string;
  schedule_type: string;
  scheduled_time: string;
  next_execution: string | null;
  is_active: boolean;
  last_executed: string | null;
  recurrence_pattern: any;
}

interface MonitoringSchedule {
  id: string;
  schedule_name: string;
  scan_types: string[];
  artwork_ids: string[] | null;
  frequency_minutes: number;
  is_24_7_enabled: boolean;
  monitoring_hours: any;
  alert_settings: any;
  is_active: boolean;
}

interface Artwork {
  id: string;
  title: string;
  status: string;
}

const ScheduledScansManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scheduledScans, setScheduledScans] = useState<ScheduledScan[]>([]);
  const [monitoringSchedules, setMonitoringSchedules] = useState<MonitoringSchedule[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMonitoringDialogOpen, setIsMonitoringDialogOpen] = useState(false);

  // Form states
  const [selectedArtwork, setSelectedArtwork] = useState('');
  const [scanType, setScanType] = useState('monitoring');
  const [scheduleType, setScheduleType] = useState('once');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');

  // 24/7 Monitoring form states
  const [scheduleName, setScheduleName] = useState('');
  const [selectedScanTypes, setSelectedScanTypes] = useState(['monitoring']);
  const [frequencyMinutes, setFrequencyMinutes] = useState(60);
  const [is247Enabled, setIs247Enabled] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user's artworks
      const { data: artworkData, error: artworkError } = await supabase
        .from('artwork')
        .select('id, title, status')
        .eq('user_id', user!.id);

      if (artworkError) throw artworkError;
      setArtworks(artworkData || []);

      // Load scheduled scans
      const { data: scanData, error: scanError } = await supabase
        .from('scheduled_scans')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (scanError) throw scanError;
      setScheduledScans(scanData || []);

      // Load monitoring schedules
      const { data: monitoringData, error: monitoringError } = await supabase
        .from('monitoring_schedules')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (monitoringError) throw monitoringError;
      setMonitoringSchedules(monitoringData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load scheduling data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createScheduledScan = async () => {
    if (!selectedArtwork) {
      toast({
        title: "Error",
        description: "Please select an artwork",
        variant: "destructive"
      });
      return;
    }

    try {
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from('scheduled_scans')
        .insert({
          user_id: user!.id,
          artwork_id: selectedArtwork,
          scan_type: scanType,
          schedule_type: scheduleType,
          scheduled_time: scheduledDateTime.toISOString(),
          next_execution: scheduleType === 'once' ? scheduledDateTime.toISOString() : null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scheduled scan created successfully"
      });

      setIsDialogOpen(false);
      loadData();
      
      // Reset form
      setSelectedArtwork('');
      setScanType('monitoring');
      setScheduleType('once');
      setSelectedDate(new Date());
      setSelectedTime('12:00');

    } catch (error) {
      console.error('Error creating scheduled scan:', error);
      toast({
        title: "Error",
        description: "Failed to create scheduled scan",
        variant: "destructive"
      });
    }
  };

  const create247Monitoring = async () => {
    if (!scheduleName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a schedule name",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('monitoring_schedules')
        .insert({
          user_id: user!.id,
          schedule_name: scheduleName,
          scan_types: selectedScanTypes,
          artwork_ids: null, // Monitor all artworks
          frequency_minutes: frequencyMinutes,
          is_24_7_enabled: is247Enabled,
          monitoring_hours: { start: "00:00", end: "23:59", timezone: "UTC" },
          alert_settings: { email: true, webhook: false, severity_threshold: "medium" }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "24/7 monitoring schedule created successfully"
      });

      setIsMonitoringDialogOpen(false);
      loadData();
      
      // Reset form
      setScheduleName('');
      setSelectedScanTypes(['monitoring']);
      setFrequencyMinutes(60);
      setIs247Enabled(false);

    } catch (error) {
      console.error('Error creating 24/7 monitoring:', error);
      toast({
        title: "Error",
        description: "Failed to create 24/7 monitoring schedule",
        variant: "destructive"
      });
    }
  };

  const toggleScanActive = async (scanId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduled_scans')
        .update({ is_active: !isActive })
        .eq('id', scanId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Scan ${!isActive ? 'activated' : 'deactivated'} successfully`
      });

      loadData();
    } catch (error) {
      console.error('Error toggling scan:', error);
      toast({
        title: "Error",
        description: "Failed to update scan status",
        variant: "destructive"
      });
    }
  };

  const toggleMonitoringActive = async (scheduleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('monitoring_schedules')
        .update({ is_active: !isActive })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Monitoring ${!isActive ? 'activated' : 'deactivated'} successfully`
      });

      loadData();
    } catch (error) {
      console.error('Error toggling monitoring:', error);
      toast({
        title: "Error",
        description: "Failed to update monitoring status",
        variant: "destructive"
      });
    }
  };

  const deleteScan = async (scanId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scheduled scan deleted successfully"
      });

      loadData();
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast({
        title: "Error",
        description: "Failed to delete scan",
        variant: "destructive"
      });
    }
  };

  const deleteMonitoringSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('monitoring_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Monitoring schedule deleted successfully"
      });

      loadData();
    } catch (error) {
      console.error('Error deleting monitoring schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete monitoring schedule",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (scan: ScheduledScan) => {
    if (!scan.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (scan.schedule_type === 'once' && scan.last_executed) {
      return <Badge variant="outline">Completed</Badge>;
    }
    
    const now = new Date();
    const nextExecution = scan.next_execution ? new Date(scan.next_execution) : null;
    
    if (nextExecution && nextExecution <= now) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    return <Badge variant="default">Scheduled</Badge>;
  };

  const getScanTypeLabel = (type: string) => {
    const types = {
      'monitoring': 'Copyright Monitoring',
      'deep-scan': 'Deep Web Scan',
      'social-media': 'Social Media Scan',
      'comprehensive': 'Comprehensive Scan'
    };
    return types[type] || type;
  };

  const getScheduleTypeLabel = (type: string) => {
    const types = {
      'once': 'One-time',
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'continuous': 'Continuous'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Scans & 24/7 Monitoring
          </CardTitle>
          <CardDescription>
            Schedule scans for future execution and set up continuous 24/7 monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scheduled" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scheduled">Scheduled Scans</TabsTrigger>
              <TabsTrigger value="continuous">24/7 Monitoring</TabsTrigger>
            </TabsList>

            {/* Scheduled Scans Tab */}
            <TabsContent value="scheduled" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Scheduled Scans</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Scan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Schedule New Scan</DialogTitle>
                      <DialogDescription>
                        Set up a scan to run at a specific time or on a recurring schedule
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="artwork">Artwork</Label>
                        <Select value={selectedArtwork} onValueChange={setSelectedArtwork}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select artwork to scan" />
                          </SelectTrigger>
                          <SelectContent>
                            {artworks.map((artwork) => (
                              <SelectItem key={artwork.id} value={artwork.id}>
                                {artwork.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="scanType">Scan Type</Label>
                        <Select value={scanType} onValueChange={setScanType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monitoring">Copyright Monitoring</SelectItem>
                            <SelectItem value="deep-scan">Deep Web Scan</SelectItem>
                            <SelectItem value="social-media">Social Media Scan</SelectItem>
                            <SelectItem value="comprehensive">Comprehensive Scan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="scheduleType">Schedule Type</Label>
                        <Select value={scheduleType} onValueChange={setScheduleType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">One-time</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => date && setSelectedDate(date)}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                        />
                      </div>

                      <Button onClick={createScheduledScan} className="w-full">
                        Schedule Scan
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {scheduledScans.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No scheduled scans yet. Create your first scheduled scan above.</p>
                  </div>
                ) : (
                  scheduledScans.map((scan) => {
                    const artwork = artworks.find(a => a.id === scan.artwork_id);
                    return (
                      <Card key={scan.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{artwork?.title || 'Unknown Artwork'}</h4>
                                {getStatusBadge(scan)}
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-4">
                                  <span>Type: {getScanTypeLabel(scan.scan_type)}</span>
                                  <span>Schedule: {getScheduleTypeLabel(scan.schedule_type)}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span>
                                    Scheduled: {format(new Date(scan.scheduled_time), "MMM dd, yyyy 'at' HH:mm")}
                                  </span>
                                  {scan.next_execution && (
                                    <span>
                                      Next: {format(new Date(scan.next_execution), "MMM dd, yyyy 'at' HH:mm")}
                                    </span>
                                  )}
                                </div>
                                {scan.last_executed && (
                                  <span>
                                    Last executed: {format(new Date(scan.last_executed), "MMM dd, yyyy 'at' HH:mm")}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleScanActive(scan.id, scan.is_active)}
                              >
                                {scan.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteScan(scan.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

            {/* 24/7 Monitoring Tab */}
            <TabsContent value="continuous" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">24/7 Continuous Monitoring</h3>
                <Dialog open={isMonitoringDialogOpen} onOpenChange={setIsMonitoringDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Zap className="h-4 w-4 mr-2" />
                      Setup 24/7 Monitoring
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Setup 24/7 Monitoring</DialogTitle>
                      <DialogDescription>
                        Configure continuous monitoring that runs automatically around the clock
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="scheduleName">Schedule Name</Label>
                        <Input
                          value={scheduleName}
                          onChange={(e) => setScheduleName(e.target.value)}
                          placeholder="e.g., Primary Art Monitoring"
                        />
                      </div>

                      <div>
                        <Label>Scan Types</Label>
                        <div className="space-y-2 mt-2">
                          {[
                            { id: 'monitoring', label: 'Copyright Monitoring' },
                            { id: 'deepfake-detection', label: 'Deepfake Detection' }
                          ].map((type) => (
                            <div key={type.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={type.id}
                                checked={selectedScanTypes.includes(type.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedScanTypes([...selectedScanTypes, type.id]);
                                  } else {
                                    setSelectedScanTypes(selectedScanTypes.filter(t => t !== type.id));
                                  }
                                }}
                              />
                              <Label htmlFor={type.id}>{type.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="frequency">Frequency (minutes)</Label>
                        <Select value={frequencyMinutes.toString()} onValueChange={(value) => setFrequencyMinutes(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">Every 15 minutes</SelectItem>
                            <SelectItem value="30">Every 30 minutes</SelectItem>
                            <SelectItem value="60">Every hour</SelectItem>
                            <SelectItem value="120">Every 2 hours</SelectItem>
                            <SelectItem value="360">Every 6 hours</SelectItem>
                            <SelectItem value="720">Every 12 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="24-7"
                          checked={is247Enabled}
                          onCheckedChange={setIs247Enabled}
                        />
                        <Label htmlFor="24-7">Enable 24/7 monitoring</Label>
                      </div>

                      <Button onClick={create247Monitoring} className="w-full">
                        Create 24/7 Monitoring
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {monitoringSchedules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No 24/7 monitoring schedules yet. Set up continuous monitoring above.</p>
                  </div>
                ) : (
                  monitoringSchedules.map((schedule) => (
                    <Card key={schedule.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{schedule.schedule_name}</h4>
                              {schedule.is_active ? (
                                schedule.is_24_7_enabled ? (
                                  <Badge className="bg-green-500">24/7 Active</Badge>
                                ) : (
                                  <Badge variant="secondary">Scheduled</Badge>
                                )
                              ) : (
                                <Badge variant="outline">Inactive</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-4">
                                <span>Types: {schedule.scan_types.join(', ')}</span>
                                <span>Frequency: Every {schedule.frequency_minutes} minutes</span>
                              </div>
                              <div>
                                Monitoring: {schedule.artwork_ids ? `${schedule.artwork_ids.length} specific artworks` : 'All artworks'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleMonitoringActive(schedule.id, schedule.is_active)}
                            >
                              {schedule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMonitoringSchedule(schedule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduledScansManager;