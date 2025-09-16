import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Globe, TrendingUp, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SchedulingFeaturesProps {
  onSchedule?: (scheduleData: any) => void;
}

export const SchedulingFeatures: React.FC<SchedulingFeaturesProps> = ({ onSchedule }) => {
  const [scheduleData, setScheduleData] = useState({
    sendTime: '',
    timezone: 'UTC',
    frequency: 'once',
    optimizeForEngagement: false,
    segmentByTimezone: false
  });
  const { toast } = useToast();

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Australia/Sydney', label: 'Sydney' }
  ];

  const frequencyOptions = [
    { value: 'once', label: 'Send Once' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const handleSchedule = () => {
    if (!scheduleData.sendTime) {
      toast({
        title: "Error",
        description: "Please select a send time.",
        variant: "destructive",
      });
      return;
    }

    if (onSchedule) {
      onSchedule(scheduleData);
    }

    toast({
      title: "Campaign Scheduled",
      description: `Your campaign has been scheduled for ${new Date(scheduleData.sendTime).toLocaleString()}.`,
    });
  };

  const getOptimalSendTimes = () => {
    // Mock optimal send times based on user engagement data
    return [
      { time: '09:00', engagement: 85, label: 'Peak Morning' },
      { time: '14:00', engagement: 72, label: 'Afternoon' },
      { time: '18:00', engagement: 78, label: 'Evening' }
    ];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Email Scheduling</h3>
        <p className="text-muted-foreground">
          Schedule your campaigns for optimal engagement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduling Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Settings
            </CardTitle>
            <CardDescription>
              Set when and how often your campaign should be sent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sendTime">Send Date & Time</Label>
              <Input
                id="sendTime"
                type="datetime-local"
                value={scheduleData.sendTime}
                onChange={(e) => setScheduleData(prev => ({ ...prev, sendTime: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={scheduleData.timezone} 
                onValueChange={(value) => setScheduleData(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select 
                value={scheduleData.frequency} 
                onValueChange={(value) => setScheduleData(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="optimizeForEngagement"
                  checked={scheduleData.optimizeForEngagement}
                  onChange={(e) => setScheduleData(prev => ({ 
                    ...prev, 
                    optimizeForEngagement: e.target.checked 
                  }))}
                />
                <Label htmlFor="optimizeForEngagement">
                  Optimize send time for engagement
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="segmentByTimezone"
                  checked={scheduleData.segmentByTimezone}
                  onChange={(e) => setScheduleData(prev => ({ 
                    ...prev, 
                    segmentByTimezone: e.target.checked 
                  }))}
                />
                <Label htmlFor="segmentByTimezone">
                  Segment by subscriber timezone
                </Label>
              </div>
            </div>

            <Button onClick={handleSchedule} className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              Schedule Campaign
            </Button>
          </CardContent>
        </Card>

        {/* Optimal Send Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Optimal Send Times
            </CardTitle>
            <CardDescription>
              Based on your audience engagement patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getOptimalSendTimes().map((timeSlot, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{timeSlot.time}</p>
                    <p className="text-sm text-muted-foreground">{timeSlot.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={timeSlot.engagement > 80 ? "default" : "secondary"}>
                    {timeSlot.engagement}% engagement
                  </Badge>
                </div>
              </div>
            ))}

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">Audience Insights</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• 65% of your audience is most active between 9-11 AM</p>
                <p>• Tuesday and Wednesday show highest engagement</p>
                <p>• Avoid sending after 8 PM for better open rates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timezone Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Subscriber Timezone Distribution
          </CardTitle>
          <CardDescription>
            Understanding when your audience is online
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { zone: 'Eastern', percentage: 35, active: '9 AM - 6 PM' },
              { zone: 'Central', percentage: 25, active: '8 AM - 5 PM' },
              { zone: 'Pacific', percentage: 20, active: '6 AM - 3 PM' },
              { zone: 'International', percentage: 20, active: 'Varies' }
            ].map((zone, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{zone.percentage}%</div>
                <div className="font-medium">{zone.zone}</div>
                <div className="text-sm text-muted-foreground">Active: {zone.active}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};