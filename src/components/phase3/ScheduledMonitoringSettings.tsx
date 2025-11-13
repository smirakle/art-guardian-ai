import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Mail, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SCHEDULE_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" }
];

const NOTIFICATION_THRESHOLDS = [
  { value: "any", label: "Any Match" },
  { value: "high_risk_only", label: "High Risk Only" },
  { value: "medium_plus", label: "Medium+ Risk" }
];

const WEEKDAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" }
];

export const ScheduledMonitoringSettings = ({ protectionRecordId }: { protectionRecordId?: string }) => {
  const { toast } = useToast();
  const [scheduleType, setScheduleType] = useState<string>("weekly");
  const [scheduleTime, setScheduleTime] = useState<string>("09:00");
  const [scheduleDays, setScheduleDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notificationThreshold, setNotificationThreshold] = useState("any");
  const [isActive, setIsActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSchedule = async () => {
    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("scheduled_document_monitoring")
        .insert({
          user_id: user.id,
          protection_record_id: protectionRecordId,
          schedule_type: scheduleType,
          schedule_time: scheduleTime,
          schedule_days: scheduleType === "weekly" ? scheduleDays : null,
          is_active: isActive,
          email_notifications: emailNotifications,
          notification_threshold: notificationThreshold
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Scheduled Monitoring Created",
        description: `Your document will be scanned ${scheduleType} at ${scheduleTime}.`
      });

    } catch (error) {
      console.error("Error creating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to create scheduled monitoring. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleWeekday = (day: number) => {
    setScheduleDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle>Scheduled Monitoring</CardTitle>
        </div>
        <CardDescription>
          Automatically scan your documents on a regular schedule
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Schedule Type */}
        <div className="space-y-2">
          <Label>Scan Frequency</Label>
          <Select value={scheduleType} onValueChange={setScheduleType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCHEDULE_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scan Time
          </Label>
          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Weekday Selection (for weekly) */}
        {scheduleType === "weekly" && (
          <div className="space-y-2">
            <Label>Days of Week</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(day => (
                <Badge
                  key={day.value}
                  variant={scheduleDays.includes(day.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleWeekday(day.value)}
                >
                  {day.label.slice(0, 3)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive email alerts when matches are found
            </p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>

        {/* Notification Threshold */}
        {emailNotifications && (
          <div className="space-y-2">
            <Label>Notification Threshold</Label>
            <Select value={notificationThreshold} onValueChange={setNotificationThreshold}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTIFICATION_THRESHOLDS.map(threshold => (
                  <SelectItem key={threshold.value} value={threshold.value}>
                    {threshold.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Schedule</Label>
            <p className="text-sm text-muted-foreground">
              Activate or pause scheduled monitoring
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        {/* Info Alert */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Next scan will be calculated automatically</p>
            <p className="text-muted-foreground">
              The system will determine the next execution time based on your schedule settings.
            </p>
          </div>
        </div>

        {/* Create Button */}
        <Button
          onClick={handleCreateSchedule}
          disabled={isCreating || (scheduleType === "weekly" && scheduleDays.length === 0)}
          className="w-full"
        >
          {isCreating ? "Creating Schedule..." : "Create Scheduled Monitoring"}
        </Button>
      </CardContent>
    </Card>
  );
};
