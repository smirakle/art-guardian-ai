import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const testAITPAEngine = async () => {
  try {
    console.log('Starting AITPA Engine test...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in to test AITPA engine');
      return;
    }

    // Get an artwork to test with
    const { data: artwork } = await supabase
      .from('artwork')
      .select('id, title')
      .limit(1)
      .single();

    if (!artwork) {
      toast.error('No artwork found to test. Please create an artwork first.');
      return;
    }

    toast.info(`Testing AITPA engine with artwork: ${artwork.title}`);

    // Call the AITPA engine
    const { data, error } = await supabase.functions.invoke('aitpa-core-engine', {
      body: {
        content_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
        content_type: 'image',
        monitoring_targets: [
          'LAION-5B',
          'CommonCrawl',
          'Stability AI',
          'Midjourney',
          'OpenAI DALL-E'
        ],
        user_id: user.id,
        artwork_id: artwork.id,
        session_id: `test-session-${Date.now()}`,
        enable_realtime_monitoring: true
      }
    });

    if (error) {
      console.error('AITPA Engine error:', error);
      toast.error(`AITPA test failed: ${error.message}`);
      return;
    }

    console.log('AITPA Engine response:', data);

    // Display results
    const results = data as any;
    
    toast.success('AITPA Analysis Complete!', {
      description: `
        Status: ${results.status}
        Threat Vectors: ${results.threat_vectors?.length || 0}
        Violation Class: ${results.violation_report?.violation_class}
        Confidence: ${Math.round((results.violation_report?.confidence || 0) * 100)}%
      `
    });

    // Log threat vectors
    if (results.threat_vectors && results.threat_vectors.length > 0) {
      console.log('=== THREAT VECTORS DETECTED ===');
      results.threat_vectors.forEach((threat: any) => {
        console.log(`- ${threat.type}: ${threat.severity} (${Math.round(threat.confidence * 100)}% confidence)`);
        console.log(`  Source: ${threat.source}`);
      });
    }

    // Check database for stored results
    const { data: detections } = await supabase
      .from('ai_threat_detections')
      .select('*')
      .eq('user_id', user.id)
      .order('detected_at', { ascending: false })
      .limit(5);

    if (detections && detections.length > 0) {
      console.log('=== LATEST THREAT DETECTIONS IN DB ===');
      console.log(detections);
    }

    return results;

  } catch (err: any) {
    console.error('Test error:', err);
    toast.error(`Test failed: ${err.message}`);
  }
};
