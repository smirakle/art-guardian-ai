import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, Clock, CheckCircle, Mail, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';

interface ComplianceReminder {
  id: string;
  compliance_tracking_id: string;
  reminder_type: string;
  scheduled_for: string;
  sent_at?: string;
  reminder_count: number;
  email_sent: boolean;
  notification_sent: boolean;
  is_active: boolean;
  created_at: string;
  legal_compliance_tracking?: any;
}

const ComplianceReminders = () => {
  const [reminders, setReminders] = useState<ComplianceReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReminders();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('compliance_reminders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'compliance_reminders' },
        (payload) => {
          fetchReminders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compliance_reminders')
        .select(`
          *,
          legal_compliance_tracking (
            compliance_type,
            jurisdiction,
            status,
            deadline_date
          )
        `)
        .eq('is_active', true)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast({
        title: "Error",
        description: "Failed to load compliance reminders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async (complianceId: string, type: string, scheduledDate: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('legal-compliance-notifier', {
        body: {
          action: 'schedule_reminder',
          compliance_id: complianceId,
          reminder_type: type,
          scheduled_date: scheduledDate
        }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Reminder scheduled successfully",
      });
      
      fetchReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast({
        title: "Error",
        description: "Failed to schedule reminder",
        variant: "destructive"
      });
    }
  };

  const deactivateReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('compliance_reminders')
        .update({ is_active: false })
        .eq('id', reminderId);

      if (error) throw error;
      
      setReminders(prev => prev.filter(r => r.id !== reminderId));
      
      toast({
        title: "Success",
        description: "Reminder deactivated",
      });
    } catch (error) {
      console.error('Error deactivating reminder:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate reminder",
        variant: "destructive"
      });
    }
  };

  const sendReminder = async (reminderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('legal-compliance-notifier', {
        body: {
          action: 'send_reminder',
          reminder_id: reminderId
        }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Reminder sent successfully",
      });
      
      fetchReminders();
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive"
      });
    }
  };

  const getReminderTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline_warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'deadline_past':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'response_required':
        return <Mail className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'deadline_warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'deadline_past':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'response_required':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (scheduledFor: string) => {
    return new Date(scheduledFor) < new Date();
  };

  const urgentReminders = reminders.filter(r => 
    r.reminder_type === 'deadline_past' || 
    (r.reminder_type === 'deadline_warning' && isOverdue(r.scheduled_for))
  );

  const upcomingReminders = reminders.filter(r => 
    !urgentReminders.includes(r) && 
    new Date(r.scheduled_for) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const futureReminders = reminders.filter(r => 
    !urgentReminders.includes(r) && !upcomingReminders.includes(r)
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const ReminderList = ({ title, reminders: reminderList, variant = 'default' }: {
    title: string;
    reminders: ComplianceReminder[];
    variant?: 'default' | 'urgent' | 'upcoming';
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant={variant === 'urgent' ? 'destructive' : variant === 'upcoming' ? 'default' : 'secondary'}>
          {reminderList.length}
        </Badge>
      </div>
      
      {reminderList.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No {title.toLowerCase()} reminders
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reminderList.map((reminder) => (
            <Card key={reminder.id} className={variant === 'urgent' ? 'border-red-200 bg-red-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getReminderTypeIcon(reminder.reminder_type)}
                    </div>
                    
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {reminder.legal_compliance_tracking?.compliance_type || 'Unknown Type'}
                        </span>
                        <Badge className={getReminderTypeColor(reminder.reminder_type)}>
                          {reminder.reminder_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Scheduled: {format(new Date(reminder.scheduled_for), 'MMM dd, yyyy HH:mm')}
                          </span>
                          {isOverdue(reminder.scheduled_for) && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          )}
                        </div>
                        
                        {reminder.legal_compliance_tracking?.deadline_date && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              Deadline: {format(new Date(reminder.legal_compliance_tracking.deadline_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span>Jurisdiction: {reminder.legal_compliance_tracking?.jurisdiction}</span>
                          <span>Status: {reminder.legal_compliance_tracking?.status}</span>
                          <span>Attempts: {reminder.reminder_count}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {reminder.email_sent && (
                          <Badge variant="outline" className="text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            Email Sent
                          </Badge>
                        )}
                        {reminder.notification_sent && (
                          <Badge variant="outline" className="text-xs">
                            <Bell className="h-3 w-3 mr-1" />
                            Notification Sent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {!reminder.sent_at && isOverdue(reminder.scheduled_for) && (
                      <Button
                        size="sm"
                        onClick={() => sendReminder(reminder.id)}
                        className="text-xs"
                      >
                        Send Now
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deactivateReminder(reminder.id)}
                      className="text-xs"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compliance Reminders</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {format(new Date(), 'HH:mm')}</span>
        </div>
      </div>

      <ReminderList title="Urgent Reminders" reminders={urgentReminders} variant="urgent" />
      <ReminderList title="Upcoming (Next 7 days)" reminders={upcomingReminders} variant="upcoming" />
      <ReminderList title="Future Reminders" reminders={futureReminders} />
    </div>
  );
};

export default ComplianceReminders;