import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SecurityEventType = 
  | 'login_attempt' 
  | 'login_success' 
  | 'login_failure'
  | 'logout'
  | 'admin_access'
  | 'data_export'
  | 'config_change'
  | 'api_key_created'
  | 'api_key_revoked'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'unauthorized_access'
  | 'data_access'
  | 'privilege_escalation_attempt';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

interface SecurityEvent {
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  resource_accessed?: string;
}

export const useSecurityLogging = () => {
  const { user } = useAuth();

  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    try {
      // Get client IP and user agent
      const rawIpAddress = event.ip_address || await getClientIP();
      const clientInfo = {
        ip_address: rawIpAddress === 'unknown' ? null : rawIpAddress,
        user_agent: event.user_agent || navigator.userAgent,
        timestamp: new Date().toISOString(),
        session_id: user?.id || 'anonymous'
      };

      // Log to Supabase security audit table
      const { error } = await supabase.from('security_audit_log').insert({
        user_id: user?.id || null,
        action: event.event_type,
        resource_type: 'security_event',
        resource_id: event.resource_accessed || null,
        details: {
          ...event.metadata,
          severity: event.severity,
          description: event.description,
          ...clientInfo
        },
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }

      // For critical events, also invoke real-time monitoring
      if (event.severity === 'critical') {
        await supabase.functions.invoke('security-alert-handler', {
          body: {
            event_type: event.event_type,
            severity: event.severity,
            user_id: user?.id,
            description: event.description,
            metadata: event.metadata,
            client_info: clientInfo
          }
        });
      }

    } catch (error) {
      console.error('Security logging error:', error);
    }
  }, [user]);

  const logAdminAccess = useCallback(async (resource: string, action: string) => {
    await logSecurityEvent({
      event_type: 'admin_access',
      severity: 'medium',
      description: `Admin accessed ${resource} - ${action}`,
      resource_accessed: resource,
      metadata: { action, admin_user_id: user?.id }
    });
  }, [user, logSecurityEvent]);

  const logDataExport = useCallback(async (exportType: string, recordCount: number) => {
    await logSecurityEvent({
      event_type: 'data_export',
      severity: 'high',
      description: `Data export initiated: ${exportType}`,
      metadata: { 
        export_type: exportType,
        record_count: recordCount,
        admin_user_id: user?.id
      }
    });
  }, [user, logSecurityEvent]);

  const logSuspiciousActivity = useCallback(async (activity: string, details: Record<string, any>) => {
    await logSecurityEvent({
      event_type: 'suspicious_activity',
      severity: 'critical',
      description: `Suspicious activity detected: ${activity}`,
      metadata: details
    });
  }, [logSecurityEvent]);

  const logAPIAccess = useCallback(async (endpoint: string, method: string, statusCode: number) => {
    const severity: SecuritySeverity = statusCode >= 400 ? 'medium' : 'low';
    
    await logSecurityEvent({
      event_type: 'data_access',
      severity,
      description: `API access: ${method} ${endpoint}`,
      resource_accessed: endpoint,
      metadata: { 
        method,
        status_code: statusCode,
        endpoint
      }
    });
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    logAdminAccess,
    logDataExport,
    logSuspiciousActivity,
    logAPIAccess
  };
};

// Helper function to get client IP
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}