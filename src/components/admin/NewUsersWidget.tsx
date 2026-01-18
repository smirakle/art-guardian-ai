import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Eye, Crown, Users, Loader2, Palette, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface NewUser {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  created_at: string;
  role?: string;
  email?: string;
  plan_id?: string;
  source_app?: string;
}

const NewUsersWidget = () => {
  const [users, setUsers] = useState<NewUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<NewUser | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const navigate = useNavigate();

  const fetchNewUsers = async () => {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, username, created_at')
        .gte('created_at', oneWeekAgo)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (profiles && profiles.length > 0) {
        const userIds = profiles.map(p => p.user_id);
        
        // Fetch roles, subscriptions, protection records, and emails in parallel
        const [rolesResult, subscriptionsResult, protectionResult, emailsResult] = await Promise.all([
          supabase
            .from('user_roles')
            .select('user_id, role')
            .in('user_id', userIds),
          supabase
            .from('subscriptions')
            .select('user_id, plan_id')
            .in('user_id', userIds),
          supabase
            .from('ai_protection_records')
            .select('user_id, metadata')
            .in('user_id', userIds),
          supabase.functions.invoke('admin-user-details', {
            body: { action: 'batchGetEmails', userIds }
          })
        ]);

        const roles = rolesResult.data || [];
        const subscriptions = subscriptionsResult.data || [];
        const protectionRecords = protectionResult.data || [];
        const emails = emailsResult.data?.emails || {};

        // Determine source app from protection records
        const userSourceApps: Record<string, string> = {};
        protectionRecords.forEach((record: { user_id: string; metadata: { source_app?: string } | null }) => {
          const sourceApp = record.metadata?.source_app;
          if (sourceApp && sourceApp.includes('Adobe')) {
            userSourceApps[record.user_id] = 'Adobe Plugin';
          }
        });

        const usersWithDetails = profiles.map(profile => ({
          ...profile,
          role: roles.find(r => r.user_id === profile.user_id)?.role || 'user',
          email: emails[profile.user_id] || undefined,
          plan_id: subscriptions.find(s => s.user_id === profile.user_id)?.plan_id || 'free',
          source_app: userSourceApps[profile.user_id] || 'Web'
        }));

        setUsers(usersWithDetails);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching new users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewUsers();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('new-users-widget')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchNewUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getInitials = (name: string | null, username: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/admin?tab=users&user=${userId}`);
  };

  const handleMakeAdmin = async () => {
    if (!selectedUser) return;
    
    setUpdatingRole(true);
    try {
      const { error } = await supabase.functions.invoke('secure-role-management', {
        body: {
          userId: selectedUser.user_id,
          newRole: 'admin',
          reason: 'Promoted via admin dashboard widget'
        }
      });

      if (error) throw error;

      toast.success(`${selectedUser.full_name || selectedUser.username} is now an admin`);
      setShowRoleDialog(false);
      fetchNewUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdatingRole(false);
    }
  };

  const openRoleDialog = (user: NewUser) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              New Users This Week
            </div>
            {users.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {users.length} new
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Users className="w-10 h-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No new users this week</p>
            </div>
          ) : (
            <>
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(user.full_name, user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {user.full_name || user.username || 'Anonymous'}
                      </p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge 
                          variant={user.plan_id === 'pro' || user.plan_id === 'professional' ? 'default' : 'outline'} 
                          className="text-[10px] px-1.5 py-0"
                        >
                          {user.plan_id === 'pro' || user.plan_id === 'professional' ? 'Pro' : 
                           user.plan_id === 'enterprise' ? 'Enterprise' : 'Free'}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0 flex items-center gap-0.5"
                        >
                          {user.source_app === 'Adobe Plugin' ? (
                            <>
                              <Palette className="w-2.5 h-2.5" />
                              Adobe
                            </>
                          ) : (
                            <>
                              <Globe className="w-2.5 h-2.5" />
                              Web
                            </>
                          )}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          • {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleViewProfile(user.user_id)}
                      title="View Profile"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {user.role !== 'admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-amber-500 hover:text-amber-600"
                        onClick={() => openRoleDialog(user)}
                        title="Make Admin"
                      >
                        <Crown className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate('/admin?tab=users')}
              >
                View All Users
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to make{' '}
              <span className="font-medium text-foreground">
                {selectedUser?.full_name || selectedUser?.username}
              </span>{' '}
              an administrator? They will have full access to the admin dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMakeAdmin} disabled={updatingRole}>
              {updatingRole ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Make Admin
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewUsersWidget;
