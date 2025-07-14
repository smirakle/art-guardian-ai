import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users,
  Search,
  Download,
  UserCheck,
  UserX,
  Crown,
  Eye
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
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with role information
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

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch artwork counts for each user
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

      // Create role lookup
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      // Combine data
      const enrichedUsers: User[] = profiles?.map(profile => ({
        ...profile,
        role: roleMap.get(profile.user_id) || 'user',
        artworkCount: artworkCounts[profile.user_id] || 0
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
    
    // Set up real-time subscription
    const channel = supabase
      .channel('user-management')
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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      // Update or insert user role
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: newRole 
        }, { 
          onConflict: 'user_id' 
        });

      if (error) throw error;

      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Username', 'Role', 'Artworks', 'Joined'].join(','),
      ...filteredUsers.map(user => [
        user.full_name || '',
        user.username || '',
        user.role || 'user',
        user.artworkCount || 0,
        new Date(user.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('User data exported successfully');
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">User Management</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <UserCheck className="h-4 w-4 text-green-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'user').length}
                </div>
                <div className="text-sm text-muted-foreground">Regular Users</div>
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
                <div className="text-sm text-muted-foreground">Total Artworks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Artworks</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || 'Unknown'}
                  </TableCell>
                  <TableCell>{user.username || '-'}</TableCell>
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
                  <TableCell>{user.artworkCount || 0}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
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
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage User: {user.full_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Current Role</Label>
                            <div className="mt-1">
                              <Badge variant={getRoleBadgeVariant(user.role || 'user')}>
                                {user.role || 'user'}
                              </Badge>
                            </div>
                          </div>
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
                        </div>
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

export default UserManagement;