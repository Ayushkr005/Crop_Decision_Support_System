import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Shield, ArrowLeft, Loader2, Crown, User as UserIcon, 
  RefreshCw, BarChart3, Leaf, Plus, Pencil, Trash2, Database, Search
} from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'customer';
  created_at: string;
}

interface CropProfile {
  id: string;
  state: string;
  district: string;
  crop_name: string;
  n_value: number;
  p_value: number;
  k_value: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  notes: string | null;
  created_at: string;
}

const emptyCropForm = {
  state: '', district: '', crop_name: '',
  n_value: 0, p_value: 0, k_value: 0,
  temperature: 0, humidity: 0, ph: 0, rainfall: 0, notes: ''
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  
  // User management state
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Crop management state
  const [cropProfiles, setCropProfiles] = useState<CropProfile[]>([]);
  const [isCropLoading, setIsCropLoading] = useState(false);
  const [cropForm, setCropForm] = useState(emptyCropForm);
  const [editingCropId, setEditingCropId] = useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isSavingCrop, setIsSavingCrop] = useState(false);
  const [cropSearch, setCropSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && !isAdmin) {
      navigate('/predict');
      toast({ title: 'Access Denied', description: 'You do not have admin privileges.', variant: 'destructive' });
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  // ── User Management ──
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase.from('profiles').select('user_id, full_name, created_at');
      if (profilesError) throw profilesError;
      const { data: roles, error: rolesError } = await supabase.from('user_roles').select('user_id, role');
      if (rolesError) throw rolesError;

      const usersData: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: 'N/A',
          full_name: profile.full_name,
          role: (userRole?.role as 'admin' | 'customer') || 'customer',
          created_at: profile.created_at,
        };
      });
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: 'Error', description: 'Failed to fetch users.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) { fetchUsers(); fetchCropProfiles(); } }, [isAdmin]);

  const updateUserRole = async (userId: string, newRole: 'admin' | 'customer') => {
    if (userId === user?.id) {
      toast({ title: 'Cannot Change Own Role', description: 'You cannot change your own role.', variant: 'destructive' });
      return;
    }
    setUpdatingUserId(userId);
    try {
      const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('user_id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast({ title: 'Role Updated', description: `User role changed to ${newRole}.` });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({ title: 'Error', description: 'Failed to update user role.', variant: 'destructive' });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // ── Crop Profile Management ──
  const fetchCropProfiles = async () => {
    setIsCropLoading(true);
    try {
      const { data, error } = await supabase.from('crop_profiles').select('*').order('state').order('district').order('crop_name');
      if (error) throw error;
      setCropProfiles(data || []);
    } catch (error) {
      console.error('Error fetching crop profiles:', error);
      toast({ title: 'Error', description: 'Failed to fetch crop profiles.', variant: 'destructive' });
    } finally {
      setIsCropLoading(false);
    }
  };

  const handleSaveCrop = async () => {
    if (!cropForm.state || !cropForm.district || !cropForm.crop_name) {
      toast({ title: 'Missing fields', description: 'State, district and crop name are required.', variant: 'destructive' });
      return;
    }
    setIsSavingCrop(true);
    try {
      if (editingCropId) {
        const { error } = await supabase.from('crop_profiles').update({
          state: cropForm.state, district: cropForm.district, crop_name: cropForm.crop_name,
          n_value: cropForm.n_value, p_value: cropForm.p_value, k_value: cropForm.k_value,
          temperature: cropForm.temperature, humidity: cropForm.humidity,
          ph: cropForm.ph, rainfall: cropForm.rainfall, notes: cropForm.notes || null,
        }).eq('id', editingCropId);
        if (error) throw error;
        toast({ title: 'Updated', description: 'Crop profile updated successfully.' });
      } else {
        const { error } = await supabase.from('crop_profiles').insert({
          state: cropForm.state, district: cropForm.district, crop_name: cropForm.crop_name,
          n_value: cropForm.n_value, p_value: cropForm.p_value, k_value: cropForm.k_value,
          temperature: cropForm.temperature, humidity: cropForm.humidity,
          ph: cropForm.ph, rainfall: cropForm.rainfall, notes: cropForm.notes || null,
          created_by: user?.id,
        });
        if (error) throw error;
        toast({ title: 'Added', description: 'Crop profile added successfully.' });
      }
      setIsCropDialogOpen(false);
      setCropForm(emptyCropForm);
      setEditingCropId(null);
      fetchCropProfiles();
    } catch (error: any) {
      console.error('Error saving crop profile:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save crop profile.', variant: 'destructive' });
    } finally {
      setIsSavingCrop(false);
    }
  };

  const handleEditCrop = (crop: CropProfile) => {
    setCropForm({
      state: crop.state, district: crop.district, crop_name: crop.crop_name,
      n_value: crop.n_value, p_value: crop.p_value, k_value: crop.k_value,
      temperature: crop.temperature, humidity: crop.humidity,
      ph: crop.ph, rainfall: crop.rainfall, notes: crop.notes || '',
    });
    setEditingCropId(crop.id);
    setIsCropDialogOpen(true);
  };

  const handleDeleteCrop = async (id: string) => {
    try {
      const { error } = await supabase.from('crop_profiles').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Crop profile deleted.' });
      fetchCropProfiles();
    } catch (error) {
      console.error('Error deleting crop profile:', error);
      toast({ title: 'Error', description: 'Failed to delete crop profile.', variant: 'destructive' });
    }
  };

  const filteredCrops = cropProfiles.filter(c =>
    !cropSearch || 
    c.state.toLowerCase().includes(cropSearch.toLowerCase()) ||
    c.district.toLowerCase().includes(cropSearch.toLowerCase()) ||
    c.crop_name.toLowerCase().includes(cropSearch.toLowerCase())
  );

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="animate-spin"><Leaf className="h-12 w-12 text-primary" /></div>
      </div>
    );
  }

  const adminCount = users.filter(u => u.role === 'admin').length;
  const customerCount = users.filter(u => u.role === 'customer').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/predict')} className="hover:bg-primary/10 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage users, crops & data</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={signOut} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
          <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-foreground">{users.length}</div></CardContent>
          </Card>
          <Card className="shadow-lg border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Administrators</CardTitle>
              <Crown className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-foreground">{adminCount}</div></CardContent>
          </Card>
          <Card className="shadow-lg border-accent/20 bg-gradient-to-br from-card to-accent/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
              <UserIcon className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-foreground">{customerCount}</div></CardContent>
          </Card>
          <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Crop Profiles</CardTitle>
              <Database className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-foreground">{cropProfiles.length}</div></CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="animate-slide-up">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> User Management</TabsTrigger>
            <TabsTrigger value="crops" className="gap-2"><Leaf className="h-4 w-4" /> Crop Data Management</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="shadow-xl border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> User Management</CardTitle>
                  <CardDescription>View and manage user roles</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading} className="gap-2 hover:bg-primary/10">
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Name</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((userData) => (
                          <TableRow key={userData.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${userData.role === 'admin' ? 'bg-gradient-to-br from-primary to-accent' : 'bg-muted'}`}>
                                  {userData.role === 'admin' ? <Crown className="h-4 w-4 text-primary-foreground" /> : <UserIcon className="h-4 w-4 text-muted-foreground" />}
                                </div>
                                {userData.full_name || 'No name'}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">{userData.id.slice(0, 8)}...</TableCell>
                            <TableCell>
                              <Badge variant={userData.role === 'admin' ? 'default' : 'secondary'} className={userData.role === 'admin' ? 'bg-gradient-to-r from-primary to-accent' : ''}>
                                {userData.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{new Date(userData.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {userData.id === user?.id ? (
                                <Badge variant="outline" className="text-muted-foreground">You</Badge>
                              ) : (
                                <Select value={userData.role} onValueChange={(value: 'admin' | 'customer') => updateUserRole(userData.id, value)} disabled={updatingUserId === userData.id}>
                                  <SelectTrigger className="w-32">
                                    {updatingUserId === userData.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crops Tab */}
          <TabsContent value="crops">
            <Card className="shadow-xl border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5 text-primary" /> Crop Data Management</CardTitle>
                  <CardDescription>Add, edit, or remove crop profiles with soil & climate parameters</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search crops..." value={cropSearch} onChange={e => setCropSearch(e.target.value)} className="pl-9 w-48" />
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchCropProfiles} disabled={isCropLoading} className="gap-2 hover:bg-primary/10">
                    <RefreshCw className={`h-4 w-4 ${isCropLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Dialog open={isCropDialogOpen} onOpenChange={(open) => { setIsCropDialogOpen(open); if (!open) { setCropForm(emptyCropForm); setEditingCropId(null); } }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Crop Profile</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingCropId ? 'Edit' : 'Add'} Crop Profile</DialogTitle>
                        <DialogDescription>Enter the crop details with soil and climate parameters.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <Label>State *</Label>
                            <Input value={cropForm.state} onChange={e => setCropForm(p => ({ ...p, state: e.target.value }))} placeholder="e.g. Punjab" />
                          </div>
                          <div className="space-y-1.5">
                            <Label>District *</Label>
                            <Input value={cropForm.district} onChange={e => setCropForm(p => ({ ...p, district: e.target.value }))} placeholder="e.g. Ludhiana" />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Crop Name *</Label>
                            <Input value={cropForm.crop_name} onChange={e => setCropForm(p => ({ ...p, crop_name: e.target.value }))} placeholder="e.g. Rice" />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="space-y-1.5">
                            <Label>N (kg/ha)</Label>
                            <Input type="number" value={cropForm.n_value} onChange={e => setCropForm(p => ({ ...p, n_value: +e.target.value }))} />
                          </div>
                          <div className="space-y-1.5">
                            <Label>P (kg/ha)</Label>
                            <Input type="number" value={cropForm.p_value} onChange={e => setCropForm(p => ({ ...p, p_value: +e.target.value }))} />
                          </div>
                          <div className="space-y-1.5">
                            <Label>K (kg/ha)</Label>
                            <Input type="number" value={cropForm.k_value} onChange={e => setCropForm(p => ({ ...p, k_value: +e.target.value }))} />
                          </div>
                          <div className="space-y-1.5">
                            <Label>pH</Label>
                            <Input type="number" step="0.1" value={cropForm.ph} onChange={e => setCropForm(p => ({ ...p, ph: +e.target.value }))} />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <Label>Temp (°C)</Label>
                            <Input type="number" step="0.1" value={cropForm.temperature} onChange={e => setCropForm(p => ({ ...p, temperature: +e.target.value }))} />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Humidity (%)</Label>
                            <Input type="number" step="0.1" value={cropForm.humidity} onChange={e => setCropForm(p => ({ ...p, humidity: +e.target.value }))} />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Rainfall (mm)</Label>
                            <Input type="number" value={cropForm.rainfall} onChange={e => setCropForm(p => ({ ...p, rainfall: +e.target.value }))} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Notes</Label>
                          <Textarea value={cropForm.notes} onChange={e => setCropForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes about this crop profile..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCropDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveCrop} disabled={isSavingCrop}>
                          {isSavingCrop ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          {editingCropId ? 'Update' : 'Add'} Profile
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isCropLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : filteredCrops.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No crop profiles yet</p>
                    <p className="text-sm">Click "Add Crop Profile" to start building your crop database.</p>
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>State</TableHead>
                          <TableHead>District</TableHead>
                          <TableHead>Crop</TableHead>
                          <TableHead>N</TableHead>
                          <TableHead>P</TableHead>
                          <TableHead>K</TableHead>
                          <TableHead>Temp</TableHead>
                          <TableHead>Humidity</TableHead>
                          <TableHead>pH</TableHead>
                          <TableHead>Rainfall</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCrops.map((crop) => (
                          <TableRow key={crop.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">{crop.state}</TableCell>
                            <TableCell>{crop.district}</TableCell>
                            <TableCell><Badge variant="secondary">{crop.crop_name}</Badge></TableCell>
                            <TableCell>{crop.n_value}</TableCell>
                            <TableCell>{crop.p_value}</TableCell>
                            <TableCell>{crop.k_value}</TableCell>
                            <TableCell>{crop.temperature}°C</TableCell>
                            <TableCell>{crop.humidity}%</TableCell>
                            <TableCell>{crop.ph}</TableCell>
                            <TableCell>{crop.rainfall}mm</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEditCrop(crop)} className="h-8 w-8 hover:bg-primary/10">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCrop(crop.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <Card className="shadow-lg cursor-pointer group" onClick={() => navigate('/predict')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <BarChart3 className="h-5 w-5" /> View Predictions
              </CardTitle>
              <CardDescription>Access the crop prediction dashboard</CardDescription>
            </CardHeader>
          </Card>
          <Card className="shadow-lg cursor-pointer group" onClick={() => { setIsCropDialogOpen(true); setCropForm(emptyCropForm); setEditingCropId(null); }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <Plus className="h-5 w-5" /> Add New Crop Data
              </CardTitle>
              <CardDescription>Quickly add a new crop profile entry</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
