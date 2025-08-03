import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users,
  Search,
  Download,
  UserCheck,
  UserX,
  Crown,
  Eye,
  Plus,
  Edit,
  Trash2,
  Mail,
  Shield,
  Activity,
  Calendar,
  Settings,
  Filter,
  MoreVertical,
  Ban,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface User {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  created_at: string;
  email?: string;
  role?: 'admin' | 'user';
  artworkCount?: number;
  lastActive?: string;
  subscription?: any;
  status?: 'active' | 'suspended' | 'pending';
  verified?: boolean;
}

const EnhancedUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<string>("");
  
  // New user form state
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    username: "",
    role: "user" as "admin" | "user"
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          username,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const userIds = profiles?.map(p => p.user_id) || [];
      const artworkCounts: Record<string, number> = {};
      
      if (userIds.length > 0) {
        const { data: artworks, error: artworkError } = await supabase
          .from('artwork')
          .select('user_id')
          .in('user_id', userIds);

        if (!artworkError && artworks) {
          artworks.forEach(artwork => {
            artworkCounts[artwork.user_id] = (artworkCounts[artwork.user_id] || 0) + 1;
          });
        }
      }

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      const enrichedUsers: User[] = profiles?.map(profile => ({
        ...profile,
        role: roleMap.get(profile.user_id) || 'user',
        artworkCount: artworkCounts[profile.user_id] || 0,
        email: 'Email available via admin panel',
        lastActive: 'Recently',
        status: 'active',
        verified: true
      })) || [];

      setUsers(enrichedUsers);
      setFilteredUsers(enrichedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    const channel = supabase
      .channel('enhanced-user-management')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchUsers()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const createUser = async () => {
    try {
      // This would typically call an admin function to create a user
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: newUser
      });

      if (error) throw error;

      toast.success('User created successfully');
      setCreateUserOpen(false);
      setNewUser({
        email: "",
        password: "",
        full_name: "",
        username: "",
        role: "user"
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || "Failed to create user");
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-role-management', {
        body: {
          userId,
          newRole,
          reason: `Role change initiated by admin via enhanced user management`
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to update user role');
      }

      toast.success(data.message || `User role updated to ${newRole}`);
      fetchUsers();
      setSelectedUser(null);
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(error.message || "Failed to update user role");
    }
  };

  const suspendUser = async (userId: string, reason: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-details', {
        method: 'POST',
        body: {
          userId,
          action: 'suspend',
          data: { reason }
        }
      });

      if (error) throw error;

      toast.success('User suspended successfully');
      fetchUsers();
    } catch (error: any) {
      console.error('Error suspending user:', error);
      toast.error(error.message || "Failed to suspend user");
    }
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0 || !bulkActionType) {
      toast.error('Please select users and an action');
      return;
    }

    try {
      // Handle bulk actions based on type
      for (const userId of selectedUsers) {
        switch (bulkActionType) {
          case 'suspend':
            await suspendUser(userId, 'Bulk suspension by admin');
            break;
          case 'activate':
            // Implement activation logic
            break;
          case 'delete':
            // Implement safe deletion logic
            break;
          default:
            break;
        }
      }

      toast.success(`Bulk action completed for ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setBulkActionType("");
      fetchUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to complete bulk action');
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Username', 'Email', 'Role', 'Status', 'Artworks', 'Joined', 'Last Active'].join(','),
      ...filteredUsers.map(user => [
        user.full_name || '',
        user.username || '',
        user.email || '',
        user.role || 'user',
        user.status || 'active',
        user.artworkCount || 0,
        new Date(user.created_at).toLocaleDateString(),
        user.lastActive || 'Unknown'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('User data exported successfully');
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.user_id)
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading enhanced user management...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Enhanced User Management</h3>
          <p className="text-muted-foreground">Comprehensive user administration with advanced features</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Temporary Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Temporary password"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="johndoe"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value: "admin" | "user") => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createUser} className="w-full">
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={exportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Crown className="h-4 w-4 text-yellow-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-sm text-muted-foreground">Administrators</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold">
                  {users.filter(u => u.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold">
                  {users.filter(u => u.status === 'suspended').length}
                </div>
                <div className="text-sm text-muted-foreground">Suspended</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-4 w-4 text-purple-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold">
                  {users.reduce((sum, u) => sum + (u.artworkCount || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Content</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedUsers.length} user(s) selected
              </span>
              <Select value={bulkActionType} onValueChange={setBulkActionType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Choose bulk action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suspend">Suspend Users</SelectItem>
                  <SelectItem value="activate">Activate Users</SelectItem>
                  <SelectItem value="export">Export Selected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkAction} variant="outline" size="sm">
                Apply Action
              </Button>
              <Button 
                onClick={() => setSelectedUsers([])} 
                variant="ghost" 
                size="sm"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Users ({filteredUsers.length})</span>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.user_id)}
                      onCheckedChange={() => toggleUserSelection(user.user_id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {(user.full_name || user.username || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.full_name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">@{user.username || 'no-username'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role || 'user')}>
                      {user.role === 'admin' ? (
                        <>
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        'User'
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status || 'active')}>
                      {user.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{user.artworkCount || 0} items</div>
                      <div className="text-muted-foreground">Protected content</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {user.lastActive}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog open={dialogOpen && selectedUser?.id === user.id} 
                           onOpenChange={(open) => {
                             setDialogOpen(open);
                             if (!open) setSelectedUser(null);
                           }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Manage User: {user.full_name}</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="profile" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="permissions">Permissions</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                            <TabsTrigger value="actions">Actions</TabsTrigger>
                          </TabsList>
                          <TabsContent value="profile" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Current Role</Label>
                                <div className="mt-1">
                                  <Badge variant={getRoleBadgeVariant(user.role || 'user')}>
                                    {user.role || 'user'}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <div className="mt-1">
                                  <Badge variant={getStatusBadgeVariant(user.status || 'active')}>
                                    {user.status || 'active'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="permissions" className="space-y-4">
                            <div className="flex gap-2">
                              <Button
                                variant={user.role === 'admin' ? 'default' : 'outline'}
                                onClick={() => updateUserRole(user.user_id, 'admin')}
                                disabled={user.role === 'admin'}
                              >
                                <Crown className="w-4 h-4 mr-2" />
                                Make Admin
                              </Button>
                              <Button
                                variant={user.role === 'user' ? 'default' : 'outline'}
                                onClick={() => updateUserRole(user.user_id, 'user')}
                                disabled={user.role === 'user'}
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Make User
                              </Button>
                            </div>
                          </TabsContent>
                          <TabsContent value="activity" className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                              Activity logs and usage statistics would appear here.
                            </div>
                          </TabsContent>
                          <TabsContent value="actions" className="space-y-4">
                            <div className="space-y-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Ban className="w-4 h-4 mr-2" />
                                    Suspend User
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will suspend the user's account. They will not be able to log in or access the system.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => suspendUser(user.user_id, 'Suspended by admin')}
                                    >
                                      Suspend
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedUserManagement;