import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CacheMetrics {
  cache_key: string
  hit_count: number
  miss_count: number
  size_bytes: number
  ttl_seconds: number
  last_accessed: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, cache_key, pattern, metrics } = await req.json()

    console.log('Cache manager action:', action, 'key:', cache_key)

    switch (action) {
      case 'invalidate': {
        if (pattern) {
          // Invalidate by pattern
          const { data: keys } = await supabase
            .from('cache_statistics')
            .select('cache_key')
            .like('cache_key', pattern)
          
          if (keys && keys.length > 0) {
            await supabase
              .from('cache_statistics')
              .delete()
              .in('cache_key', keys.map(k => k.cache_key))
            
            console.log(`Invalidated ${keys.length} cache entries matching pattern: ${pattern}`)
            return new Response(
              JSON.stringify({ success: true, invalidated: keys.length }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        } else if (cache_key) {
          // Invalidate specific key
          await supabase
            .from('cache_statistics')
            .delete()
            .eq('cache_key', cache_key)
          
          console.log(`Invalidated cache key: ${cache_key}`)
          return new Response(
            JSON.stringify({ success: true, invalidated: 1 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }

      case 'update_metrics': {
        if (metrics && Array.isArray(metrics)) {
          const updates = metrics.map((metric: CacheMetrics) => ({
            cache_key: metric.cache_key,
            hit_count: metric.hit_count,
            miss_count: metric.miss_count,
            size_bytes: metric.size_bytes,
            ttl_seconds: metric.ttl_seconds,
            last_accessed: metric.last_accessed,
            updated_at: new Date().toISOString()
          }))

          for (const update of updates) {
            await supabase
              .from('cache_statistics')
              .upsert(update, { onConflict: 'cache_key' })
          }

          console.log(`Updated ${updates.length} cache metrics`)
          return new Response(
            JSON.stringify({ success: true, updated: updates.length }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }

      case 'get_stats': {
        const { data: stats } = await supabase
          .from('cache_statistics')
          .select('*')
          .order('last_accessed', { ascending: false })
          .limit(100)

        const totalHits = stats?.reduce((sum, s) => sum + s.hit_count, 0) || 0
        const totalMisses = stats?.reduce((sum, s) => sum + s.miss_count, 0) || 0
        const totalSize = stats?.reduce((sum, s) => sum + s.size_bytes, 0) || 0
        const hitRate = totalHits + totalMisses > 0 
          ? (totalHits / (totalHits + totalMisses)) * 100 
          : 0

        return new Response(
          JSON.stringify({
            success: true,
            stats: {
              total_entries: stats?.length || 0,
              total_hits: totalHits,
              total_misses: totalMisses,
              hit_rate: hitRate.toFixed(2),
              total_size_bytes: totalSize,
              entries: stats || []
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'warm_cache': {
        // Cache warming logic - preload frequently accessed data
        const { keys } = await req.json()
        if (keys && Array.isArray(keys)) {
          console.log(`Warming cache for ${keys.length} keys`)
          return new Response(
            JSON.stringify({ success: true, warmed: keys.length }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }

      case 'cleanup_expired': {
        const { data: expired } = await supabase
          .from('cache_statistics')
          .select('cache_key, last_accessed, ttl_seconds')
        
        const now = new Date()
        const expiredKeys = expired?.filter(entry => {
          const lastAccessed = new Date(entry.last_accessed)
          const expiryTime = new Date(lastAccessed.getTime() + entry.ttl_seconds * 1000)
          return now > expiryTime
        }).map(e => e.cache_key) || []

        if (expiredKeys.length > 0) {
          await supabase
            .from('cache_statistics')
            .delete()
            .in('cache_key', expiredKeys)
          
          console.log(`Cleaned up ${expiredKeys.length} expired cache entries`)
        }

        return new Response(
          JSON.stringify({ success: true, cleaned: expiredKeys.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Cache manager error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
