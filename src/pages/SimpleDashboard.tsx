import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle2, Upload, Search, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SimpleDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch user's artwork
  const { data: artwork } = useQuery({
    queryKey: ['user-artwork', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('artwork')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch recent alerts
  const { data: alerts } = useQuery({
    queryKey: ['user-alerts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('copyright_matches')
        .select('*')
        .eq('artwork_id', artwork?.[0]?.id)
        .eq('is_reviewed', false)
        .order('detected_at', { ascending: false })
        .limit(3);
      return data || [];
    },
    enabled: !!user && !!artwork?.length,
  });

  const threatCount = alerts?.length || 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-lg text-muted-foreground">Here's what's happening with your art</p>
      </div>

      {/* Your Protected Art */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Your Protected Art
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!artwork || artwork.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl mb-4">You haven't protected any art yet</p>
              <Button 
                size="lg" 
                onClick={() => navigate('/upload')}
                className="text-lg px-8 py-6"
              >
                <Upload className="mr-2 h-5 w-5" />
                Add Your First Artwork
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {artwork.map((art) => (
                <div key={art.id} className="relative group">
                  <img
                    src={art.file_paths[0]}
                    alt={art.title}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Protected
                    </Badge>
                  </div>
                  <p className="mt-2 font-medium truncate">{art.title}</p>
                </div>
              ))}
              <button
                onClick={() => navigate('/upload')}
                className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">Add More</span>
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card className={threatCount > 0 ? "border-2 border-destructive" : "border-2 border-green-500"}>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {threatCount > 0 ? (
              <>
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Threats Detected
              </>
            ) : (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Everything Looks Good
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {threatCount > 0 ? (
            <div className="space-y-4">
              <div className="text-center py-6 bg-destructive/10 rounded-lg">
                <p className="text-4xl font-bold text-destructive mb-2">{threatCount}</p>
                <p className="text-lg">copies of your art found online</p>
              </div>
              <Button 
                size="lg" 
                variant="destructive"
                onClick={() => navigate('/monitoring-hub')}
                className="w-full text-lg py-6"
              >
                View Details & Take Action
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <p className="text-xl text-green-700 font-medium">No threats detected today</p>
              <p className="text-muted-foreground mt-2">We're watching your art 24/7</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            size="lg"
            onClick={() => navigate('/upload')}
            className="h-32 flex flex-col gap-3 text-lg"
          >
            <Shield className="h-10 w-10" />
            Protect New Artwork
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/monitoring-hub')}
            className="h-32 flex flex-col gap-3 text-lg"
          >
            <Search className="h-10 w-10" />
            Check for Copies
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/contact')}
            className="h-32 flex flex-col gap-3 text-lg"
          >
            <Mail className="h-10 w-10" />
            Get Help
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
