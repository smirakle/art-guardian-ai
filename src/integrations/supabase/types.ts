export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_online_status: {
        Row: {
          admin_id: string
          current_conversations: Json | null
          is_online: boolean
          last_seen: string | null
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          current_conversations?: Json | null
          is_online?: boolean
          last_seen?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          current_conversations?: Json | null
          is_online?: boolean
          last_seen?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          session_token: string
          session_token_hash: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          session_token: string
          session_token_hash?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          session_token?: string
          session_token_hash?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      advanced_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          delivery_channels: string[]
          delivery_status: Json | null
          escalation_level: number
          id: string
          is_escalated: boolean
          message: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          source_data: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          delivery_channels?: string[]
          delivery_status?: Json | null
          escalation_level?: number
          id?: string
          is_escalated?: boolean
          message: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          source_data?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          delivery_channels?: string[]
          delivery_status?: Json | null
          escalation_level?: number
          id?: string
          is_escalated?: boolean
          message?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source_data?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_agent_deployments: {
        Row: {
          agents_deployed: number | null
          completed_at: string | null
          config: Json | null
          created_at: string
          deployment_status: string
          id: string
          platforms_requested: string[]
          started_at: string | null
          user_id: string
        }
        Insert: {
          agents_deployed?: number | null
          completed_at?: string | null
          config?: Json | null
          created_at?: string
          deployment_status?: string
          id?: string
          platforms_requested: string[]
          started_at?: string | null
          user_id: string
        }
        Update: {
          agents_deployed?: number | null
          completed_at?: string | null
          config?: Json | null
          created_at?: string
          deployment_status?: string
          id?: string
          platforms_requested?: string[]
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_auto_responses: {
        Row: {
          confidence_score: number
          created_at: string
          generated_content: string
          id: string
          platform: string
          response_type: string
          sent_at: string | null
          status: string
          threat_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score: number
          created_at?: string
          generated_content: string
          id?: string
          platform: string
          response_type: string
          sent_at?: string | null
          status?: string
          threat_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          generated_content?: string
          id?: string
          platform?: string
          response_type?: string
          sent_at?: string | null
          status?: string
          threat_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_detection_results: {
        Row: {
          ai_model_used: string
          artwork_id: string | null
          automated_actions: Json | null
          confidence_score: number
          created_at: string
          detection_metadata: Json
          detection_type: string
          id: string
          source_platforms: string[] | null
          status: string
          threat_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model_used: string
          artwork_id?: string | null
          automated_actions?: Json | null
          confidence_score?: number
          created_at?: string
          detection_metadata?: Json
          detection_type: string
          id?: string
          source_platforms?: string[] | null
          status?: string
          threat_level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model_used?: string
          artwork_id?: string | null
          automated_actions?: Json | null
          confidence_score?: number
          created_at?: string
          detection_metadata?: Json
          detection_type?: string
          id?: string
          source_platforms?: string[] | null
          status?: string
          threat_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_detection_results_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artwork"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_document_tracers: {
        Row: {
          checksum: string | null
          created_at: string
          id: string
          is_active: boolean
          notes: string | null
          protection_record_id: string
          tracer_payload: string
          tracer_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          protection_record_id: string
          tracer_payload: string
          tracer_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checksum?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          protection_record_id?: string
          tracer_payload?: string
          tracer_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_monitoring_agents: {
        Row: {
          agent_config: Json | null
          created_at: string
          id: string
          last_scan: string | null
          performance_metrics: Json | null
          platform_id: string
          platform_name: string
          scan_frequency: number | null
          status: string
          success_rate: number | null
          threats_detected: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_config?: Json | null
          created_at?: string
          id?: string
          last_scan?: string | null
          performance_metrics?: Json | null
          platform_id: string
          platform_name: string
          scan_frequency?: number | null
          status?: string
          success_rate?: number | null
          threats_detected?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_config?: Json | null
          created_at?: string
          id?: string
          last_scan?: string | null
          performance_metrics?: Json | null
          platform_id?: string
          platform_name?: string
          scan_frequency?: number | null
          status?: string
          success_rate?: number | null
          threats_detected?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_predictive_analyses: {
        Row: {
          analysis_type: string
          confidence_score: number
          created_at: string
          generated_at: string
          id: string
          insights: string
          prediction_horizon: string
          user_id: string
        }
        Insert: {
          analysis_type: string
          confidence_score: number
          created_at?: string
          generated_at?: string
          id?: string
          insights: string
          prediction_horizon: string
          user_id: string
        }
        Update: {
          analysis_type?: string
          confidence_score?: number
          created_at?: string
          generated_at?: string
          id?: string
          insights?: string
          prediction_horizon?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_protection_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_protection_dmca_notices: {
        Row: {
          cost_usd: number | null
          created_at: string | null
          deadline_date: string | null
          filed_at: string | null
          id: string
          platform: string
          reference_number: string | null
          response_data: Json | null
          status: string
          takedown_url: string | null
          updated_at: string | null
          user_id: string
          violation_id: string
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string | null
          deadline_date?: string | null
          filed_at?: string | null
          id?: string
          platform: string
          reference_number?: string | null
          response_data?: Json | null
          status?: string
          takedown_url?: string | null
          updated_at?: string | null
          user_id: string
          violation_id: string
        }
        Update: {
          cost_usd?: number | null
          created_at?: string | null
          deadline_date?: string | null
          filed_at?: string | null
          id?: string
          platform?: string
          reference_number?: string | null
          response_data?: Json | null
          status?: string
          takedown_url?: string | null
          updated_at?: string | null
          user_id?: string
          violation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_protection_dmca_notices_violation_id_fkey"
            columns: ["violation_id"]
            isOneToOne: false
            referencedRelation: "ai_training_violations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_protection_metrics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
        }
        Relationships: []
      }
      ai_protection_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          severity: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          severity?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          severity?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_protection_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          request_count?: number
          user_id: string
          window_start: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      ai_protection_records: {
        Row: {
          applied_at: string
          artwork_id: string | null
          char_count: number
          content_type: string
          created_at: string
          doc_tracer_checksum: string | null
          document_methods: Json
          file_extension: string | null
          file_fingerprint: string
          id: string
          is_active: boolean
          language: string | null
          metadata: Json
          original_filename: string
          original_mime_type: string | null
          protected_file_path: string | null
          protection_id: string
          protection_level: string
          protection_methods: Json
          text_fingerprint: string | null
          updated_at: string
          user_id: string
          word_count: number
        }
        Insert: {
          applied_at?: string
          artwork_id?: string | null
          char_count?: number
          content_type?: string
          created_at?: string
          doc_tracer_checksum?: string | null
          document_methods?: Json
          file_extension?: string | null
          file_fingerprint: string
          id?: string
          is_active?: boolean
          language?: string | null
          metadata?: Json
          original_filename: string
          original_mime_type?: string | null
          protected_file_path?: string | null
          protection_id: string
          protection_level?: string
          protection_methods?: Json
          text_fingerprint?: string | null
          updated_at?: string
          user_id: string
          word_count?: number
        }
        Update: {
          applied_at?: string
          artwork_id?: string | null
          char_count?: number
          content_type?: string
          created_at?: string
          doc_tracer_checksum?: string | null
          document_methods?: Json
          file_extension?: string | null
          file_fingerprint?: string
          id?: string
          is_active?: boolean
          language?: string | null
          metadata?: Json
          original_filename?: string
          original_mime_type?: string | null
          protected_file_path?: string | null
          protection_id?: string
          protection_level?: string
          protection_methods?: Json
          text_fingerprint?: string | null
          updated_at?: string
          user_id?: string
          word_count?: number
        }
        Relationships: []
      }
      ai_threat_detections: {
        Row: {
          agent_id: string | null
          confidence_score: number | null
          created_at: string
          detected_at: string
          id: string
          platform: string
          source_url: string | null
          status: string
          threat_data: Json | null
          threat_level: string
          threat_type: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          confidence_score?: number | null
          created_at?: string
          detected_at?: string
          id?: string
          platform: string
          source_url?: string | null
          status?: string
          threat_data?: Json | null
          threat_level: string
          threat_type: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          confidence_score?: number | null
          created_at?: string
          detected_at?: string
          id?: string
          platform?: string
          source_url?: string | null
          status?: string
          threat_data?: Json | null
          threat_level?: string
          threat_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_threat_detections_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_monitoring_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_training_datasets: {
        Row: {
          created_at: string | null
          dataset_name: string
          dataset_url: string
          id: string
          is_active: boolean | null
          last_indexed: string | null
          metadata: Json | null
          platform: string
          total_samples: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dataset_name: string
          dataset_url: string
          id?: string
          is_active?: boolean | null
          last_indexed?: string | null
          metadata?: Json | null
          platform: string
          total_samples?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dataset_name?: string
          dataset_url?: string
          id?: string
          is_active?: boolean | null
          last_indexed?: string | null
          metadata?: Json | null
          platform?: string
          total_samples?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_training_enforcement_workflows: {
        Row: {
          certificate_hash: string | null
          created_at: string
          id: string
          metadata: Json
          protection_record_id: string
          status: string
          steps_completed: Json
          updated_at: string
          user_id: string
          violation_id: string | null
        }
        Insert: {
          certificate_hash?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          protection_record_id: string
          status?: string
          steps_completed?: Json
          updated_at?: string
          user_id: string
          violation_id?: string | null
        }
        Update: {
          certificate_hash?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          protection_record_id?: string
          status?: string
          steps_completed?: Json
          updated_at?: string
          user_id?: string
          violation_id?: string | null
        }
        Relationships: []
      }
      ai_training_violations: {
        Row: {
          artwork_id: string
          confidence_score: number
          created_at: string
          detected_at: string
          dmca_notice_id: string | null
          evidence_data: Json
          id: string
          legal_action_taken: boolean
          protection_record_id: string
          resolved_at: string | null
          source_domain: string | null
          source_url: string | null
          status: string
          updated_at: string
          user_id: string
          violation_type: string
        }
        Insert: {
          artwork_id: string
          confidence_score?: number
          created_at?: string
          detected_at?: string
          dmca_notice_id?: string | null
          evidence_data?: Json
          id?: string
          legal_action_taken?: boolean
          protection_record_id: string
          resolved_at?: string | null
          source_domain?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          violation_type: string
        }
        Update: {
          artwork_id?: string
          confidence_score?: number
          created_at?: string
          detected_at?: string
          dmca_notice_id?: string | null
          evidence_data?: Json
          id?: string
          legal_action_taken?: boolean
          protection_record_id?: string
          resolved_at?: string | null
          source_domain?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          violation_type?: string
        }
        Relationships: []
      }
      alert_channels: {
        Row: {
          channel_config: Json
          channel_type: string
          created_at: string
          id: string
          is_active: boolean
          priority_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_config?: Json
          channel_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          priority_level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_config?: Json
          channel_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          priority_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      alert_notifications_log: {
        Row: {
          alert_id: string
          created_at: string
          email_id: string | null
          error_message: string | null
          id: string
          notification_type: string
          recipient_email: string
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          alert_id: string
          created_at?: string
          email_id?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          recipient_email: string
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          alert_id?: string
          created_at?: string
          email_id?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          recipient_email?: string
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      artwork: {
        Row: {
          ai_protection_enabled: boolean | null
          ai_protection_level: string | null
          ai_protection_methods: Json | null
          blockchain_certificate_id: string | null
          blockchain_hash: string | null
          blockchain_registered_at: string | null
          category: string
          compressed_file_size: number | null
          created_at: string
          description: string | null
          enable_blockchain: boolean | null
          enable_watermark: boolean | null
          file_paths: string[]
          file_size: number | null
          id: string
          license_type: string | null
          original_file_size: number | null
          processing_status: string | null
          protection_record_id: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_protection_enabled?: boolean | null
          ai_protection_level?: string | null
          ai_protection_methods?: Json | null
          blockchain_certificate_id?: string | null
          blockchain_hash?: string | null
          blockchain_registered_at?: string | null
          category: string
          compressed_file_size?: number | null
          created_at?: string
          description?: string | null
          enable_blockchain?: boolean | null
          enable_watermark?: boolean | null
          file_paths: string[]
          file_size?: number | null
          id?: string
          license_type?: string | null
          original_file_size?: number | null
          processing_status?: string | null
          protection_record_id?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_protection_enabled?: boolean | null
          ai_protection_level?: string | null
          ai_protection_methods?: Json | null
          blockchain_certificate_id?: string | null
          blockchain_hash?: string | null
          blockchain_registered_at?: string | null
          category?: string
          compressed_file_size?: number | null
          created_at?: string
          description?: string | null
          enable_blockchain?: boolean | null
          enable_watermark?: boolean | null
          file_paths?: string[]
          file_size?: number | null
          id?: string
          license_type?: string | null
          original_file_size?: number | null
          processing_status?: string | null
          protection_record_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      backup_logs: {
        Row: {
          backup_location: string | null
          backup_type: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_size_bytes: number | null
          id: string
          metadata: Json | null
          started_at: string
          status: string
        }
        Insert: {
          backup_location?: string | null
          backup_type: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          started_at?: string
          status?: string
        }
        Update: {
          backup_location?: string | null
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      batch_processing_queue: {
        Row: {
          batch_size: number
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          items_processed: number | null
          metadata: Json | null
          operation_type: string
          progress_percentage: number | null
          started_at: string | null
          status: string | null
          total_items: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          batch_size?: number
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          items_processed?: number | null
          metadata?: Json | null
          operation_type: string
          progress_percentage?: number | null
          started_at?: string | null
          status?: string | null
          total_items: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          batch_size?: number
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          items_processed?: number | null
          metadata?: Json | null
          operation_type?: string
          progress_percentage?: number | null
          started_at?: string | null
          status?: string | null
          total_items?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blockchain_certificates: {
        Row: {
          artwork_fingerprint: string
          artwork_id: string
          blockchain_hash: string
          certificate_data: Json
          certificate_id: string
          created_at: string
          id: string
          ownership_proof: string
          registration_timestamp: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_fingerprint: string
          artwork_id: string
          blockchain_hash: string
          certificate_data: Json
          certificate_id: string
          created_at?: string
          id?: string
          ownership_proof: string
          registration_timestamp: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_fingerprint?: string
          artwork_id?: string
          blockchain_hash?: string
          certificate_data?: Json
          certificate_id?: string
          created_at?: string
          id?: string
          ownership_proof?: string
          registration_timestamp?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blockchain_licenses: {
        Row: {
          artwork_id: string | null
          automated_compliance: boolean | null
          blockchain: string
          created_at: string
          document_hash: string
          duration: string | null
          exclusivity: string | null
          id: string
          legal_document: string
          license_terms: Json
          royalty_rate: number | null
          smart_contract_enabled: boolean | null
          status: string | null
          territory: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_id?: string | null
          automated_compliance?: boolean | null
          blockchain: string
          created_at?: string
          document_hash: string
          duration?: string | null
          exclusivity?: string | null
          id?: string
          legal_document: string
          license_terms?: Json
          royalty_rate?: number | null
          smart_contract_enabled?: boolean | null
          status?: string | null
          territory?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string | null
          automated_compliance?: boolean | null
          blockchain?: string
          created_at?: string
          document_hash?: string
          duration?: string | null
          exclusivity?: string | null
          id?: string
          legal_document?: string
          license_terms?: Json
          royalty_rate?: number | null
          smart_contract_enabled?: boolean | null
          status?: string | null
          territory?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blockchain_ownership_registry: {
        Row: {
          artwork_id: string | null
          blockchain: string
          confirmation_status: string | null
          contract_address: string | null
          created_at: string
          gas_price: number | null
          gas_used: number | null
          id: string
          legal_enforceability: number | null
          metadata: Json | null
          network_details: Json | null
          ownership_proof: Json
          token_id: number | null
          transaction_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_id?: string | null
          blockchain: string
          confirmation_status?: string | null
          contract_address?: string | null
          created_at?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          legal_enforceability?: number | null
          metadata?: Json | null
          network_details?: Json | null
          ownership_proof?: Json
          token_id?: number | null
          transaction_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string | null
          blockchain?: string
          confirmation_status?: string | null
          contract_address?: string | null
          created_at?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          legal_enforceability?: number | null
          metadata?: Json | null
          network_details?: Json | null
          ownership_proof?: Json
          token_id?: number | null
          transaction_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blockchain_verifications: {
        Row: {
          block_number: number | null
          block_timestamp: string | null
          blockchain: string
          contract_address: string | null
          created_at: string
          gas_price: number | null
          gas_used: number | null
          id: string
          is_valid: boolean
          metadata_uri: string | null
          owner_address: string | null
          token_id: number | null
          transaction_hash: string
          verification_metadata: Json
          verification_timestamp: string
        }
        Insert: {
          block_number?: number | null
          block_timestamp?: string | null
          blockchain: string
          contract_address?: string | null
          created_at?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          is_valid?: boolean
          metadata_uri?: string | null
          owner_address?: string | null
          token_id?: number | null
          transaction_hash: string
          verification_metadata?: Json
          verification_timestamp?: string
        }
        Update: {
          block_number?: number | null
          block_timestamp?: string | null
          blockchain?: string
          contract_address?: string | null
          created_at?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          is_valid?: boolean
          metadata_uri?: string | null
          owner_address?: string | null
          token_id?: number | null
          transaction_hash?: string
          verification_metadata?: Json
          verification_timestamp?: string
        }
        Relationships: []
      }
      cache_statistics: {
        Row: {
          cache_key: string
          created_at: string
          hit_count: number
          id: string
          last_accessed: string
          miss_count: number
          size_bytes: number
          ttl_seconds: number
          updated_at: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          hit_count?: number
          id?: string
          last_accessed?: string
          miss_count?: number
          size_bytes?: number
          ttl_seconds: number
          updated_at?: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          hit_count?: number
          id?: string
          last_accessed?: string
          miss_count?: number
          size_bytes?: number
          ttl_seconds?: number
          updated_at?: string
        }
        Relationships: []
      }
      cdn_cache_analytics: {
        Row: {
          asset_type: string | null
          cache_hit: boolean | null
          cache_status: string | null
          cdn_config_id: string | null
          created_at: string | null
          edge_location: string | null
          id: string
          requested_at: string | null
          size_bytes: number | null
          user_country: string | null
        }
        Insert: {
          asset_type?: string | null
          cache_hit?: boolean | null
          cache_status?: string | null
          cdn_config_id?: string | null
          created_at?: string | null
          edge_location?: string | null
          id?: string
          requested_at?: string | null
          size_bytes?: number | null
          user_country?: string | null
        }
        Update: {
          asset_type?: string | null
          cache_hit?: boolean | null
          cache_status?: string | null
          cdn_config_id?: string | null
          created_at?: string | null
          edge_location?: string | null
          id?: string
          requested_at?: string | null
          size_bytes?: number | null
          user_country?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cdn_cache_analytics_cdn_config_id_fkey"
            columns: ["cdn_config_id"]
            isOneToOne: false
            referencedRelation: "cdn_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      cdn_configurations: {
        Row: {
          cache_rules: Json | null
          compression_enabled: boolean | null
          configuration: Json | null
          created_at: string | null
          custom_headers: Json | null
          domain: string
          edge_locations: Json | null
          http2_enabled: boolean | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          minification_enabled: boolean | null
          provider: string
          ssl_enabled: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cache_rules?: Json | null
          compression_enabled?: boolean | null
          configuration?: Json | null
          created_at?: string | null
          custom_headers?: Json | null
          domain: string
          edge_locations?: Json | null
          http2_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          minification_enabled?: boolean | null
          provider: string
          ssl_enabled?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cache_rules?: Json | null
          compression_enabled?: boolean | null
          configuration?: Json | null
          created_at?: string | null
          custom_headers?: Json | null
          domain?: string
          edge_locations?: Json | null
          http2_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          minification_enabled?: boolean | null
          provider?: string
          ssl_enabled?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cdn_performance_metrics: {
        Row: {
          bandwidth_bytes: number | null
          cache_hit_ratio: number | null
          cdn_config_id: string | null
          created_at: string | null
          domain: string
          error_count: number | null
          id: string
          measured_at: string | null
          metadata: Json | null
          region: string | null
          requests_count: number | null
          response_time_ms: number | null
          status_2xx: number | null
          status_3xx: number | null
          status_4xx: number | null
          status_5xx: number | null
        }
        Insert: {
          bandwidth_bytes?: number | null
          cache_hit_ratio?: number | null
          cdn_config_id?: string | null
          created_at?: string | null
          domain: string
          error_count?: number | null
          id?: string
          measured_at?: string | null
          metadata?: Json | null
          region?: string | null
          requests_count?: number | null
          response_time_ms?: number | null
          status_2xx?: number | null
          status_3xx?: number | null
          status_4xx?: number | null
          status_5xx?: number | null
        }
        Update: {
          bandwidth_bytes?: number | null
          cache_hit_ratio?: number | null
          cdn_config_id?: string | null
          created_at?: string | null
          domain?: string
          error_count?: number | null
          id?: string
          measured_at?: string | null
          metadata?: Json | null
          region?: string | null
          requests_count?: number | null
          response_time_ms?: number | null
          status_2xx?: number | null
          status_3xx?: number | null
          status_4xx?: number | null
          status_5xx?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cdn_performance_metrics_cdn_config_id_fkey"
            columns: ["cdn_config_id"]
            isOneToOne: false
            referencedRelation: "cdn_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_comments_post_id"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category: string
          comments_count: number
          content: string
          created_at: string
          id: string
          is_featured: boolean
          likes_count: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean
          likes_count?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean
          likes_count?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_votes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
          vote_type: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_votes_comment_id"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_votes_post_id"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_reminders: {
        Row: {
          compliance_tracking_id: string
          created_at: string
          email_sent: boolean | null
          id: string
          is_active: boolean | null
          notification_sent: boolean | null
          reminder_count: number | null
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          compliance_tracking_id: string
          created_at?: string
          email_sent?: boolean | null
          id?: string
          is_active?: boolean | null
          notification_sent?: boolean | null
          reminder_count?: number | null
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          compliance_tracking_id?: string
          created_at?: string
          email_sent?: boolean | null
          id?: string
          is_active?: boolean | null
          notification_sent?: boolean | null
          reminder_count?: number | null
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      copyright_matches: {
        Row: {
          artwork_id: string
          context: string | null
          created_at: string
          description: string | null
          detected_at: string
          dmca_filed: boolean | null
          dmca_filed_at: string | null
          id: string
          image_url: string | null
          is_authorized: boolean | null
          is_reviewed: boolean | null
          match_confidence: number
          match_type: string
          scan_id: string
          source_domain: string | null
          source_title: string | null
          source_url: string
          threat_level: string | null
          thumbnail_url: string | null
        }
        Insert: {
          artwork_id: string
          context?: string | null
          created_at?: string
          description?: string | null
          detected_at?: string
          dmca_filed?: boolean | null
          dmca_filed_at?: string | null
          id?: string
          image_url?: string | null
          is_authorized?: boolean | null
          is_reviewed?: boolean | null
          match_confidence: number
          match_type: string
          scan_id: string
          source_domain?: string | null
          source_title?: string | null
          source_url: string
          threat_level?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          artwork_id?: string
          context?: string | null
          created_at?: string
          description?: string | null
          detected_at?: string
          dmca_filed?: boolean | null
          dmca_filed_at?: string | null
          id?: string
          image_url?: string | null
          is_authorized?: boolean | null
          is_reviewed?: boolean | null
          match_confidence?: number
          match_type?: string
          scan_id?: string
          source_domain?: string | null
          source_title?: string | null
          source_url?: string
          threat_level?: string | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "copyright_matches_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artwork"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copyright_matches_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "monitoring_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      copyright_scan_results: {
        Row: {
          ai_analysis: string | null
          created_at: string
          id: string
          image_url: string
          results: Json
          scan_completed_at: string
          search_engines: string[]
          threat_level: string
          total_matches: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          created_at?: string
          id?: string
          image_url: string
          results?: Json
          scan_completed_at?: string
          search_engines?: string[]
          threat_level?: string
          total_matches?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          created_at?: string
          id?: string
          image_url?: string
          results?: Json
          scan_completed_at?: string
          search_engines?: string[]
          threat_level?: string
          total_matches?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cross_chain_registrations: {
        Row: {
          artwork_id: string | null
          bridge_fee: number | null
          bridge_status: string | null
          confirmation_time: number | null
          created_at: string
          id: string
          source_blockchain: string
          source_transaction: string
          target_blockchain: string
          target_transaction: string
          user_id: string
        }
        Insert: {
          artwork_id?: string | null
          bridge_fee?: number | null
          bridge_status?: string | null
          confirmation_time?: number | null
          created_at?: string
          id?: string
          source_blockchain: string
          source_transaction: string
          target_blockchain: string
          target_transaction: string
          user_id: string
        }
        Update: {
          artwork_id?: string | null
          bridge_fee?: number | null
          bridge_status?: string | null
          confirmation_time?: number | null
          created_at?: string
          id?: string
          source_blockchain?: string
          source_transaction?: string
          target_blockchain?: string
          target_transaction?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_integrations: {
        Row: {
          api_key: string
          config: Json
          created_at: string
          endpoint_url: string | null
          id: string
          last_used: string | null
          name: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          config?: Json
          created_at?: string
          endpoint_url?: string | null
          id?: string
          last_used?: string | null
          name: string
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          config?: Json
          created_at?: string
          endpoint_url?: string | null
          id?: string
          last_used?: string | null
          name?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_api_usage: {
        Row: {
          created_at: string
          daily_limit: number
          id: string
          request_count: number
          service_type: string
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_limit: number
          id?: string
          request_count?: number
          service_type: string
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_limit?: number
          id?: string
          request_count?: number
          service_type?: string
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      data_retention_policies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_cleanup: string | null
          retention_days: number
          table_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_cleanup?: string | null
          retention_days: number
          table_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_cleanup?: string | null
          retention_days?: number
          table_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      deepfake_analysis_results: {
        Row: {
          analysis_methods: string[]
          confidence_score: number
          countermeasures: string[]
          created_at: string
          facial_artifacts: string[]
          id: string
          is_deepfake: boolean
          manipulation_type: string | null
          media_type: string
          media_url: string
          metadata_anomalies: string[]
          technical_details: Json
          temporal_inconsistencies: string[]
          threat_level: string
        }
        Insert: {
          analysis_methods?: string[]
          confidence_score?: number
          countermeasures?: string[]
          created_at?: string
          facial_artifacts?: string[]
          id?: string
          is_deepfake?: boolean
          manipulation_type?: string | null
          media_type: string
          media_url: string
          metadata_anomalies?: string[]
          technical_details?: Json
          temporal_inconsistencies?: string[]
          threat_level?: string
        }
        Update: {
          analysis_methods?: string[]
          confidence_score?: number
          countermeasures?: string[]
          created_at?: string
          facial_artifacts?: string[]
          id?: string
          is_deepfake?: boolean
          manipulation_type?: string | null
          media_type?: string
          media_url?: string
          metadata_anomalies?: string[]
          technical_details?: Json
          temporal_inconsistencies?: string[]
          threat_level?: string
        }
        Relationships: []
      }
      deepfake_matches: {
        Row: {
          claimed_location: string | null
          claimed_time: string | null
          context: Json | null
          created_at: string
          detected_at: string
          detection_confidence: number
          facial_artifacts: string[] | null
          id: string
          image_url: string
          is_reviewed: boolean | null
          manipulation_type: string
          metadata_suspicious: boolean | null
          scan_type: string
          source_domain: string | null
          source_title: string | null
          source_type: string
          source_url: string
          temporal_inconsistency: boolean | null
          threat_level: string
          thumbnail_url: string | null
        }
        Insert: {
          claimed_location?: string | null
          claimed_time?: string | null
          context?: Json | null
          created_at?: string
          detected_at?: string
          detection_confidence: number
          facial_artifacts?: string[] | null
          id?: string
          image_url: string
          is_reviewed?: boolean | null
          manipulation_type: string
          metadata_suspicious?: boolean | null
          scan_type?: string
          source_domain?: string | null
          source_title?: string | null
          source_type?: string
          source_url: string
          temporal_inconsistency?: boolean | null
          threat_level?: string
          thumbnail_url?: string | null
        }
        Update: {
          claimed_location?: string | null
          claimed_time?: string | null
          context?: Json | null
          created_at?: string
          detected_at?: string
          detection_confidence?: number
          facial_artifacts?: string[] | null
          id?: string
          image_url?: string
          is_reviewed?: boolean | null
          manipulation_type?: string
          metadata_suspicious?: boolean | null
          scan_type?: string
          source_domain?: string | null
          source_title?: string | null
          source_type?: string
          source_url?: string
          temporal_inconsistency?: boolean | null
          threat_level?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      dmca_notices: {
        Row: {
          artwork_id: string
          copyright_owner_address: string
          copyright_owner_email: string
          copyright_owner_name: string
          copyright_work_description: string
          created_at: string
          electronic_signature: string
          filed_at: string
          id: string
          infringing_description: string
          infringing_url: string
          match_id: string
          response_received_at: string | null
          response_status: string | null
          status: string
          target_domain: string
          updated_at: string
        }
        Insert: {
          artwork_id: string
          copyright_owner_address: string
          copyright_owner_email: string
          copyright_owner_name: string
          copyright_work_description: string
          created_at?: string
          electronic_signature: string
          filed_at?: string
          id?: string
          infringing_description: string
          infringing_url: string
          match_id: string
          response_received_at?: string | null
          response_status?: string | null
          status?: string
          target_domain: string
          updated_at?: string
        }
        Update: {
          artwork_id?: string
          copyright_owner_address?: string
          copyright_owner_email?: string
          copyright_owner_name?: string
          copyright_work_description?: string
          created_at?: string
          electronic_signature?: string
          filed_at?: string
          id?: string
          infringing_description?: string
          infringing_url?: string
          match_id?: string
          response_received_at?: string | null
          response_status?: string | null
          status?: string
          target_domain?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_protection_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          file_size: number
          id: string
          original_filename: string
          progress_percentage: number | null
          protection_level: string
          protection_record_id: string | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_size: number
          id?: string
          original_filename: string
          progress_percentage?: number | null
          protection_level: string
          protection_record_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_size?: number
          id?: string
          original_filename?: string
          progress_percentage?: number | null
          protection_level?: string
          protection_record_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_protection_jobs_protection_record_id_fkey"
            columns: ["protection_record_id"]
            isOneToOne: false
            referencedRelation: "ai_protection_records"
            referencedColumns: ["id"]
          },
        ]
      }
      email_ab_tests: {
        Row: {
          campaign_id: string | null
          completed_at: string | null
          confidence_level: number | null
          created_at: string
          id: string
          name: string
          results: Json | null
          sample_size: number | null
          split_percentage: number | null
          started_at: string | null
          status: string | null
          test_duration_hours: number | null
          test_type: string
          updated_at: string
          user_id: string
          variant_a: Json
          variant_b: Json
          winner_criteria: string | null
          winner_variant: string | null
        }
        Insert: {
          campaign_id?: string | null
          completed_at?: string | null
          confidence_level?: number | null
          created_at?: string
          id?: string
          name: string
          results?: Json | null
          sample_size?: number | null
          split_percentage?: number | null
          started_at?: string | null
          status?: string | null
          test_duration_hours?: number | null
          test_type?: string
          updated_at?: string
          user_id: string
          variant_a: Json
          variant_b: Json
          winner_criteria?: string | null
          winner_variant?: string | null
        }
        Update: {
          campaign_id?: string | null
          completed_at?: string | null
          confidence_level?: number | null
          created_at?: string
          id?: string
          name?: string
          results?: Json | null
          sample_size?: number | null
          split_percentage?: number | null
          started_at?: string | null
          status?: string | null
          test_duration_hours?: number | null
          test_type?: string
          updated_at?: string
          user_id?: string
          variant_a?: Json
          variant_b?: Json
          winner_criteria?: string | null
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_ab_tests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_automation_executions: {
        Row: {
          campaign_sent: boolean
          error_message: string | null
          executed_at: string
          id: string
          rule_id: string
          trigger_data: Json
          user_id: string
        }
        Insert: {
          campaign_sent?: boolean
          error_message?: string | null
          executed_at?: string
          id?: string
          rule_id: string
          trigger_data?: Json
          user_id: string
        }
        Update: {
          campaign_sent?: boolean
          error_message?: string | null
          executed_at?: string
          id?: string
          rule_id?: string
          trigger_data?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_automation_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "email_automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      email_automation_rules: {
        Row: {
          campaign_id: string | null
          created_at: string
          delay_minutes: number
          description: string | null
          execution_count: number
          id: string
          is_active: boolean
          last_executed_at: string | null
          name: string
          trigger_conditions: Json
          trigger_event: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          delay_minutes?: number
          description?: string | null
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name: string
          trigger_conditions?: Json
          trigger_event: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          delay_minutes?: number
          description?: string | null
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name?: string
          trigger_conditions?: Json
          trigger_event?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_automation_rules_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaign_recipients: {
        Row: {
          bounced_at: string | null
          campaign_id: string
          clicked_at: string | null
          created_at: string
          email: string
          id: string
          metadata: Json
          opened_at: string | null
          sent_at: string | null
          status: string
          subscriber_id: string | null
          unsubscribed_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bounced_at?: string | null
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          email: string
          id?: string
          metadata?: Json
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          subscriber_id?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bounced_at?: string | null
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          email?: string
          id?: string
          metadata?: Json
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          subscriber_id?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_recipients_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "email_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          send_time: string | null
          status: string
          subject: string
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          send_time?: string | null
          status?: string
          subject: string
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          send_time?: string | null
          status?: string
          subject?: string
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_deliverability_stats: {
        Row: {
          bounce_rate: number | null
          bounced: number | null
          complained: number | null
          complaint_rate: number | null
          created_at: string
          date: string
          deliverability_rate: number | null
          delivered: number | null
          domain: string
          id: string
          reputation_score: number | null
          total_sent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bounce_rate?: number | null
          bounced?: number | null
          complained?: number | null
          complaint_rate?: number | null
          created_at?: string
          date: string
          deliverability_rate?: number | null
          delivered?: number | null
          domain: string
          id?: string
          reputation_score?: number | null
          total_sent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bounce_rate?: number | null
          bounced?: number | null
          complained?: number | null
          complaint_rate?: number | null
          created_at?: string
          date?: string
          deliverability_rate?: number | null
          delivered?: number | null
          domain?: string
          id?: string
          reputation_score?: number | null
          total_sent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_detailed_events: {
        Row: {
          campaign_id: string | null
          created_at: string
          device_type: string | null
          email_client: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          location_city: string | null
          location_country: string | null
          subscriber_id: string | null
          user_agent: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          device_type?: string | null
          email_client?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          location_city?: string | null
          location_country?: string | null
          subscriber_id?: string | null
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          device_type?: string | null
          email_client?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          location_city?: string | null
          location_country?: string | null
          subscriber_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_detailed_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_detailed_events_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "email_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_drip_enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number | null
          enrolled_at: string
          id: string
          metadata: Json | null
          paused_at: string | null
          sequence_id: string
          status: string | null
          subscriber_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          enrolled_at?: string
          id?: string
          metadata?: Json | null
          paused_at?: string | null
          sequence_id: string
          status?: string | null
          subscriber_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          enrolled_at?: string
          id?: string
          metadata?: Json | null
          paused_at?: string | null
          sequence_id?: string
          status?: string | null
          subscriber_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_drip_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_drip_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_drip_enrollments_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "email_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_drip_sequences: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_drip_steps: {
        Row: {
          content_template: string
          created_at: string
          delay_days: number
          delay_hours: number
          id: string
          is_active: boolean | null
          sequence_id: string
          step_order: number
          subject_template: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          content_template: string
          created_at?: string
          delay_days?: number
          delay_hours?: number
          id?: string
          is_active?: boolean | null
          sequence_id: string
          step_order: number
          subject_template: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          content_template?: string
          created_at?: string
          delay_days?: number
          delay_hours?: number
          id?: string
          is_active?: boolean | null
          sequence_id?: string
          step_order?: number
          subject_template?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_drip_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_drip_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_drip_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_events: {
        Row: {
          campaign_id: string | null
          email: string | null
          event_type: string
          id: string
          occurred_at: string
          payload: Json
          subscriber_id: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          email?: string | null
          event_type: string
          id?: string
          occurred_at?: string
          payload?: Json
          subscriber_id?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          email?: string | null
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json
          subscriber_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_events_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "email_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_marketing_campaigns: {
        Row: {
          bounce_count: number | null
          campaign_data: Json | null
          click_count: number | null
          content: string
          created_at: string
          id: string
          name: string
          open_count: number | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          unsubscribe_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bounce_count?: number | null
          campaign_data?: Json | null
          click_count?: number | null
          content: string
          created_at?: string
          id?: string
          name: string
          open_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          unsubscribe_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bounce_count?: number | null
          campaign_data?: Json | null
          click_count?: number | null
          content?: string
          created_at?: string
          id?: string
          name?: string
          open_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          unsubscribe_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_marketing_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          provider: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          provider: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_notification_preferences: {
        Row: {
          copyright_alerts_enabled: boolean
          created_at: string
          daily_digest_enabled: boolean
          deepfake_alerts_enabled: boolean
          digest_time: string
          high_priority_only: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          copyright_alerts_enabled?: boolean
          created_at?: string
          daily_digest_enabled?: boolean
          deepfake_alerts_enabled?: boolean
          digest_time?: string
          high_priority_only?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          copyright_alerts_enabled?: boolean
          created_at?: string
          daily_digest_enabled?: boolean
          deepfake_alerts_enabled?: boolean
          digest_time?: string
          high_priority_only?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_subscriber_field_values: {
        Row: {
          created_at: string
          field_id: string
          field_value: string | null
          id: string
          subscriber_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_id: string
          field_value?: string | null
          id?: string
          subscriber_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_id?: string
          field_value?: string | null
          id?: string
          subscriber_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_subscriber_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "email_subscriber_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_subscriber_field_values_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "email_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_subscriber_fields: {
        Row: {
          created_at: string
          display_order: number | null
          field_name: string
          field_options: Json | null
          field_type: string
          id: string
          is_required: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          field_name: string
          field_options?: Json | null
          field_type?: string
          id?: string
          is_required?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          field_name?: string
          field_options?: Json | null
          field_type?: string
          id?: string
          is_required?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      email_subscriber_segments: {
        Row: {
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          subscriber_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subscriber_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subscriber_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_subscribers: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_engaged_at: string | null
          last_name: string | null
          metadata: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_engaged_at?: string | null
          last_name?: string | null
          metadata?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_engaged_at?: string | null
          last_name?: string | null
          metadata?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: string
          is_active: boolean
          name: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          is_active?: boolean
          name: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_validations: {
        Row: {
          email_address: string
          expires_at: string | null
          id: string
          user_id: string
          validated_at: string
          validation_details: Json | null
          validation_status: string
        }
        Insert: {
          email_address: string
          expires_at?: string | null
          id?: string
          user_id: string
          validated_at?: string
          validation_details?: Json | null
          validation_status: string
        }
        Update: {
          email_address?: string
          expires_at?: string | null
          id?: string
          user_id?: string
          validated_at?: string
          validation_details?: Json | null
          validation_status?: string
        }
        Relationships: []
      }
      email_webhooks: {
        Row: {
          created_at: string
          events: string[]
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_triggered: string | null
          name: string
          retry_count: number | null
          secret_key: string
          timeout_seconds: number | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          name: string
          retry_count?: number | null
          secret_key: string
          timeout_seconds?: number | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          name?: string
          retry_count?: number | null
          secret_key?: string
          timeout_seconds?: number | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      enterprise_ai_analyses: {
        Row: {
          analyses: Json
          analysis_type: string
          created_at: string
          id: string
          image_url: string
          overall_risk: string
          processed_at: string
          risk_factors: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analyses?: Json
          analysis_type?: string
          created_at?: string
          id?: string
          image_url: string
          overall_risk?: string
          processed_at?: string
          risk_factors?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analyses?: Json
          analysis_type?: string
          created_at?: string
          id?: string
          image_url?: string
          overall_risk?: string
          processed_at?: string
          risk_factors?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enterprise_api_keys: {
        Row: {
          api_key: string
          created_at: string
          expires_at: string | null
          gov_defense_enabled: boolean | null
          id: string
          is_active: boolean
          key_name: string
          key_prefix: string
          last_used_at: string | null
          permissions: string[]
          rate_limit_requests: number
          rate_limit_window_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          expires_at?: string | null
          gov_defense_enabled?: boolean | null
          id?: string
          is_active?: boolean
          key_name: string
          key_prefix: string
          last_used_at?: string | null
          permissions?: string[]
          rate_limit_requests?: number
          rate_limit_window_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          expires_at?: string | null
          gov_defense_enabled?: boolean | null
          id?: string
          is_active?: boolean
          key_name?: string
          key_prefix?: string
          last_used_at?: string | null
          permissions?: string[]
          rate_limit_requests?: number
          rate_limit_window_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enterprise_api_rate_limits: {
        Row: {
          api_key_id: string
          created_at: string
          id: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          api_key_id: string
          created_at?: string
          id?: string
          request_count?: number
          updated_at?: string
          window_start: string
        }
        Update: {
          api_key_id?: string
          created_at?: string
          id?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_api_rate_limits_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "enterprise_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_api_usage: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          method: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
          user_id: string
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          method: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
          user_id: string
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          method?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "enterprise_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_webhooks: {
        Row: {
          created_at: string
          event_types: string[]
          id: string
          is_active: boolean
          last_delivery_at: string | null
          last_delivery_status: string | null
          retry_count: number
          timeout_seconds: number
          updated_at: string
          user_id: string
          webhook_secret: string | null
          webhook_url: string
        }
        Insert: {
          created_at?: string
          event_types?: string[]
          id?: string
          is_active?: boolean
          last_delivery_at?: string | null
          last_delivery_status?: string | null
          retry_count?: number
          timeout_seconds?: number
          updated_at?: string
          user_id: string
          webhook_secret?: string | null
          webhook_url: string
        }
        Update: {
          created_at?: string
          event_types?: string[]
          id?: string
          is_active?: boolean
          last_delivery_at?: string | null
          last_delivery_status?: string | null
          retry_count?: number
          timeout_seconds?: number
          updated_at?: string
          user_id?: string
          webhook_secret?: string | null
          webhook_url?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          created_at: string
          error_message: string
          error_stack: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          request_path: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message: string
          error_stack?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          request_path?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string
          error_stack?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          request_path?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      expert_advice: {
        Row: {
          advice: string
          category: string
          created_at: string
          expert_id: string
          id: string
          is_featured: boolean
          likes_count: number
          updated_at: string
        }
        Insert: {
          advice: string
          category: string
          created_at?: string
          expert_id: string
          id?: string
          is_featured?: boolean
          likes_count?: number
          updated_at?: string
        }
        Update: {
          advice?: string
          category?: string
          created_at?: string
          expert_id?: string
          id?: string
          is_featured?: boolean
          likes_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_advice_expert_id"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_profiles: {
        Row: {
          bio: string | null
          created_at: string
          expert_name: string
          id: string
          is_verified: boolean
          role: string
          specialties: string[] | null
          total_likes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          expert_name: string
          id?: string
          is_verified?: boolean
          role: string
          specialties?: string[] | null
          total_likes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          expert_name?: string
          id?: string
          is_verified?: boolean
          role?: string
          specialties?: string[] | null
          total_likes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gdpr_consent_logs: {
        Row: {
          consent_given: boolean
          consent_type: string
          consent_version: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_given: boolean
          consent_type: string
          consent_version?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_given?: boolean
          consent_type?: string
          consent_version?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gov_defense_ip_monitoring: {
        Row: {
          alert_threshold: string
          asset_id: string
          asset_type: string
          classification: string
          compliance_framework: string | null
          created_at: string
          findings_count: number | null
          id: string
          last_scan_at: string | null
          metadata: Json | null
          monitoring_scope: string[] | null
          monitoring_status: string | null
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_threshold: string
          asset_id: string
          asset_type: string
          classification: string
          compliance_framework?: string | null
          created_at?: string
          findings_count?: number | null
          id?: string
          last_scan_at?: string | null
          metadata?: Json | null
          monitoring_scope?: string[] | null
          monitoring_status?: string | null
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_threshold?: string
          asset_id?: string
          asset_type?: string
          classification?: string
          compliance_framework?: string | null
          created_at?: string
          findings_count?: number | null
          id?: string
          last_scan_at?: string | null
          metadata?: Json | null
          monitoring_scope?: string[] | null
          monitoring_status?: string | null
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gov_defense_ip_monitoring_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "gov_defense_monitoring_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      gov_defense_monitoring_sessions: {
        Row: {
          alert_threshold: string | null
          callback_url: string | null
          classification_level: string | null
          compliance_framework: string | null
          created_at: string
          id: string
          ip_assets: Json | null
          metadata: Json | null
          monitoring_duration_hours: number | null
          priority: string | null
          session_type: string
          status: string
          targets: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_threshold?: string | null
          callback_url?: string | null
          classification_level?: string | null
          compliance_framework?: string | null
          created_at?: string
          id?: string
          ip_assets?: Json | null
          metadata?: Json | null
          monitoring_duration_hours?: number | null
          priority?: string | null
          session_type: string
          status?: string
          targets?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_threshold?: string | null
          callback_url?: string | null
          classification_level?: string | null
          compliance_framework?: string | null
          created_at?: string
          id?: string
          ip_assets?: Json | null
          metadata?: Json | null
          monitoring_duration_hours?: number | null
          priority?: string | null
          session_type?: string
          status?: string
          targets?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gov_defense_security_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          description: string
          id: string
          is_acknowledged: boolean | null
          metadata: Json | null
          session_id: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          description: string
          id?: string
          is_acknowledged?: boolean | null
          metadata?: Json | null
          session_id?: string | null
          severity: string
          title: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          is_acknowledged?: boolean | null
          metadata?: Json | null
          session_id?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gov_defense_security_alerts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "gov_defense_monitoring_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      government_agencies: {
        Row: {
          address: Json | null
          agency_code: string
          agency_name: string
          authorization_document_url: string | null
          authorized_personnel: Json | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          department: string
          id: string
          is_active: boolean
          is_verified: boolean
          security_clearance_level: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address?: Json | null
          agency_code: string
          agency_name: string
          authorization_document_url?: string | null
          authorized_personnel?: Json | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          department: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          security_clearance_level?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: Json | null
          agency_code?: string
          agency_name?: string
          authorization_document_url?: string | null
          authorized_personnel?: Json | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          department?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          security_clearance_level?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      government_api_keys: {
        Row: {
          agency_id: string
          api_key: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          ip_whitelist: Json | null
          is_active: boolean
          key_name: string
          last_used_at: string | null
          permissions: Json
          purpose: string | null
          rate_limit_requests: number
          rate_limit_window_minutes: number
          security_classification: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          api_key: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          ip_whitelist?: Json | null
          is_active?: boolean
          key_name: string
          last_used_at?: string | null
          permissions?: Json
          purpose?: string | null
          rate_limit_requests?: number
          rate_limit_window_minutes?: number
          security_classification?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          api_key?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          ip_whitelist?: Json | null
          is_active?: boolean
          key_name?: string
          last_used_at?: string | null
          permissions?: Json
          purpose?: string | null
          rate_limit_requests?: number
          rate_limit_window_minutes?: number
          security_classification?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "government_api_keys_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "government_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      government_api_rate_limits: {
        Row: {
          created_at: string
          id: string
          rate_limit_key: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          rate_limit_key: string
          request_count?: number
          updated_at?: string
          window_start: string
        }
        Update: {
          created_at?: string
          id?: string
          rate_limit_key?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      government_api_usage: {
        Row: {
          agency_id: string
          api_key_id: string
          classification_level: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown
          metadata: Json | null
          method: string
          operation_type: string | null
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          agency_id: string
          api_key_id: string
          classification_level?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          method: string
          operation_type?: string | null
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          agency_id?: string
          api_key_id?: string
          classification_level?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          method?: string
          operation_type?: string | null
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_api_usage_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "government_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "government_api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "government_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      government_filing_requests: {
        Row: {
          additional_instructions: string | null
          admin_notes: string | null
          amount_paid: number
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          currency: string
          document_description: string | null
          document_paths: Json
          document_title: string
          filed_at: string | null
          filed_by: string | null
          filing_fee_paid: boolean
          filing_jurisdiction: string
          filing_status: string
          filing_type: string
          government_response: Json | null
          id: string
          payment_status: string
          stripe_session_id: string | null
          tracking_number: string | null
          updated_at: string
          urgency_level: string
          user_id: string
        }
        Insert: {
          additional_instructions?: string | null
          admin_notes?: string | null
          amount_paid: number
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          currency?: string
          document_description?: string | null
          document_paths?: Json
          document_title: string
          filed_at?: string | null
          filed_by?: string | null
          filing_fee_paid?: boolean
          filing_jurisdiction: string
          filing_status?: string
          filing_type: string
          government_response?: Json | null
          id?: string
          payment_status?: string
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
          urgency_level?: string
          user_id: string
        }
        Update: {
          additional_instructions?: string | null
          admin_notes?: string | null
          amount_paid?: number
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          currency?: string
          document_description?: string | null
          document_paths?: Json
          document_title?: string
          filed_at?: string | null
          filed_by?: string | null
          filing_fee_paid?: boolean
          filing_jurisdiction?: string
          filing_status?: string
          filing_type?: string
          government_response?: Json | null
          id?: string
          payment_status?: string
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
          urgency_level?: string
          user_id?: string
        }
        Relationships: []
      }
      government_security_configs: {
        Row: {
          agency_id: string
          created_at: string
          data_classification_required: boolean
          id: string
          ip_allowlist: string[] | null
          rate_limit_per_hour: number
          require_mfa: boolean
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          data_classification_required?: boolean
          id?: string
          ip_allowlist?: string[] | null
          rate_limit_per_hour?: number
          require_mfa?: boolean
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          data_classification_required?: boolean
          id?: string
          ip_allowlist?: string[] | null
          rate_limit_per_hour?: number
          require_mfa?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      government_security_events: {
        Row: {
          created_at: string
          description: string
          event_type: string
          id: string
          metadata: Json | null
          severity: string
        }
        Insert: {
          created_at?: string
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          severity: string
        }
        Update: {
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          severity?: string
        }
        Relationships: []
      }
      industry_verticals: {
        Row: {
          compliance_requirements: Json | null
          created_at: string
          description: string | null
          export_controlled: boolean | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          requires_security_clearance: boolean | null
          slug: string
          updated_at: string
        }
        Insert: {
          compliance_requirements?: Json | null
          created_at?: string
          description?: string | null
          export_controlled?: boolean | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_security_clearance?: boolean | null
          slug: string
          updated_at?: string
        }
        Update: {
          compliance_requirements?: Json | null
          created_at?: string
          description?: string | null
          export_controlled?: boolean | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_security_clearance?: boolean | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      ip_lawyers: {
        Row: {
          accepts_new_clients: boolean | null
          bar_admissions: string[] | null
          city: string
          created_at: string
          description: string | null
          email: string
          hourly_rate_range: string | null
          id: string
          is_verified: boolean | null
          languages: string[] | null
          law_firm: string
          location: string
          name: string
          phone: string | null
          specialties: string[]
          state: string
          updated_at: string
          website: string | null
          years_experience: number | null
        }
        Insert: {
          accepts_new_clients?: boolean | null
          bar_admissions?: string[] | null
          city: string
          created_at?: string
          description?: string | null
          email: string
          hourly_rate_range?: string | null
          id?: string
          is_verified?: boolean | null
          languages?: string[] | null
          law_firm: string
          location: string
          name: string
          phone?: string | null
          specialties?: string[]
          state: string
          updated_at?: string
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          accepts_new_clients?: boolean | null
          bar_admissions?: string[] | null
          city?: string
          created_at?: string
          description?: string | null
          email?: string
          hourly_rate_range?: string | null
          id?: string
          is_verified?: boolean | null
          languages?: string[] | null
          law_firm?: string
          location?: string
          name?: string
          phone?: string | null
          specialties?: string[]
          state?: string
          updated_at?: string
          website?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          company: string | null
          consent: boolean
          created_at: string
          email: string
          id: string
          name: string | null
          notes: string | null
          owner_email: string | null
          source: string | null
          updated_at: string
          use_case: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          company?: string | null
          consent?: boolean
          created_at?: string
          email: string
          id?: string
          name?: string | null
          notes?: string | null
          owner_email?: string | null
          source?: string | null
          updated_at?: string
          use_case?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          company?: string | null
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          notes?: string | null
          owner_email?: string | null
          source?: string | null
          updated_at?: string
          use_case?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      legal_cases: {
        Row: {
          actual_cost: number | null
          case_type: string
          communication_log: Json | null
          created_at: string
          description: string | null
          documents: Json | null
          estimated_cost: number | null
          estimated_timeline: string | null
          id: string
          jurisdiction: string
          next_action: string | null
          next_action_due: string | null
          priority: string
          professional_id: string | null
          resolved_at: string | null
          status: string
          time_spent_hours: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          case_type: string
          communication_log?: Json | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          estimated_cost?: number | null
          estimated_timeline?: string | null
          id?: string
          jurisdiction: string
          next_action?: string | null
          next_action_due?: string | null
          priority?: string
          professional_id?: string | null
          resolved_at?: string | null
          status?: string
          time_spent_hours?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          case_type?: string
          communication_log?: Json | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          estimated_cost?: number | null
          estimated_timeline?: string | null
          id?: string
          jurisdiction?: string
          next_action?: string | null
          next_action_due?: string | null
          priority?: string
          professional_id?: string | null
          resolved_at?: string | null
          status?: string
          time_spent_hours?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_cases_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "legal_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_compliance_tracking: {
        Row: {
          compliance_type: string
          cost_usd: number | null
          created_at: string
          deadline_date: string | null
          document_id: string
          filing_date: string | null
          filing_number: string | null
          government_response: Json | null
          id: string
          jurisdiction: string
          reminder_sent: boolean
          status: string
          supporting_documents: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          compliance_type: string
          cost_usd?: number | null
          created_at?: string
          deadline_date?: string | null
          document_id: string
          filing_date?: string | null
          filing_number?: string | null
          government_response?: Json | null
          id?: string
          jurisdiction: string
          reminder_sent?: boolean
          status?: string
          supporting_documents?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          compliance_type?: string
          cost_usd?: number | null
          created_at?: string
          deadline_date?: string | null
          document_id?: string
          filing_date?: string | null
          filing_number?: string | null
          government_response?: Json | null
          id?: string
          jurisdiction?: string
          reminder_sent?: boolean
          status?: string
          supporting_documents?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_compliance_tracking_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_document_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_consultations: {
        Row: {
          actual_cost: number | null
          budget_range: string | null
          consultation_type: string
          created_at: string
          description: string
          estimated_cost: number | null
          follow_up_date: string | null
          follow_up_required: boolean
          id: string
          preferred_communication: string | null
          professional_id: string
          professional_response: string | null
          rating: number | null
          requested_date: string | null
          review_text: string | null
          session_notes: string | null
          status: string
          subject: string
          updated_at: string
          urgency_level: string
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          budget_range?: string | null
          consultation_type: string
          created_at?: string
          description: string
          estimated_cost?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean
          id?: string
          preferred_communication?: string | null
          professional_id: string
          professional_response?: string | null
          rating?: number | null
          requested_date?: string | null
          review_text?: string | null
          session_notes?: string | null
          status?: string
          subject: string
          updated_at?: string
          urgency_level?: string
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          budget_range?: string | null
          consultation_type?: string
          created_at?: string
          description?: string
          estimated_cost?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean
          id?: string
          preferred_communication?: string | null
          professional_id?: string
          professional_response?: string | null
          rating?: number | null
          requested_date?: string | null
          review_text?: string | null
          session_notes?: string | null
          status?: string
          subject?: string
          updated_at?: string
          urgency_level?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_consultations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "legal_professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_document_analytics: {
        Row: {
          created_at: string
          document_id: string | null
          event_metadata: Json | null
          event_type: string
          id: string
          ip_address: unknown
          template_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          event_metadata?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          template_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          event_metadata?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          template_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      legal_document_generations: {
        Row: {
          created_at: string
          custom_fields: Json
          document_hash: string
          download_count: number
          expires_at: string | null
          generated_at: string
          generated_content: string
          id: string
          is_signed: boolean
          last_downloaded: string | null
          legal_review_date: string | null
          legal_review_notes: string | null
          legal_review_status: string | null
          legal_reviewer_id: string | null
          notarization_data: Json | null
          signature_data: Json | null
          template_id: string
          template_title: string
          updated_at: string
          user_id: string
          witness_data: Json | null
        }
        Insert: {
          created_at?: string
          custom_fields?: Json
          document_hash: string
          download_count?: number
          expires_at?: string | null
          generated_at?: string
          generated_content: string
          id?: string
          is_signed?: boolean
          last_downloaded?: string | null
          legal_review_date?: string | null
          legal_review_notes?: string | null
          legal_review_status?: string | null
          legal_reviewer_id?: string | null
          notarization_data?: Json | null
          signature_data?: Json | null
          template_id: string
          template_title: string
          updated_at?: string
          user_id: string
          witness_data?: Json | null
        }
        Update: {
          created_at?: string
          custom_fields?: Json
          document_hash?: string
          download_count?: number
          expires_at?: string | null
          generated_at?: string
          generated_content?: string
          id?: string
          is_signed?: boolean
          last_downloaded?: string | null
          legal_review_date?: string | null
          legal_review_notes?: string | null
          legal_review_status?: string | null
          legal_reviewer_id?: string | null
          notarization_data?: Json | null
          signature_data?: Json | null
          template_id?: string
          template_title?: string
          updated_at?: string
          user_id?: string
          witness_data?: Json | null
        }
        Relationships: []
      }
      legal_document_signatures: {
        Row: {
          created_at: string
          document_id: string
          id: string
          ip_address: unknown
          signature_data: Json
          signature_type: string
          signed_at: string
          signer_email: string
          signer_name: string
          verification_data: Json | null
          verification_status: string | null
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          ip_address?: unknown
          signature_data: Json
          signature_type: string
          signed_at?: string
          signer_email: string
          signer_name: string
          verification_data?: Json | null
          verification_status?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          ip_address?: unknown
          signature_data?: Json
          signature_type?: string
          signed_at?: string
          signer_email?: string
          signer_name?: string
          verification_data?: Json | null
          verification_status?: string | null
        }
        Relationships: []
      }
      legal_document_versions: {
        Row: {
          changes_summary: string | null
          content: string
          content_hash: string
          created_at: string
          created_by: string
          document_id: string
          id: string
          is_current: boolean | null
          version_number: number
        }
        Insert: {
          changes_summary?: string | null
          content: string
          content_hash: string
          created_at?: string
          created_by: string
          document_id: string
          id?: string
          is_current?: boolean | null
          version_number?: number
        }
        Update: {
          changes_summary?: string | null
          content?: string
          content_hash?: string
          created_at?: string
          created_by?: string
          document_id?: string
          id?: string
          is_current?: boolean | null
          version_number?: number
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          artwork_id: string | null
          blockchain: string
          blockchain_verified: boolean | null
          created_at: string
          document_types: string[]
          documents: Json
          id: string
          international_validity: boolean | null
          legal_status: string | null
          transaction_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_id?: string | null
          blockchain: string
          blockchain_verified?: boolean | null
          created_at?: string
          document_types?: string[]
          documents?: Json
          id?: string
          international_validity?: boolean | null
          legal_status?: string | null
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string | null
          blockchain?: string
          blockchain_verified?: boolean | null
          created_at?: string
          document_types?: string[]
          documents?: Json
          id?: string
          international_validity?: boolean | null
          legal_status?: string | null
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      legal_messages: {
        Row: {
          case_id: string
          content: string
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          is_encrypted: boolean
          is_read: boolean
          message_type: string
          metadata: Json | null
          sender_id: string
          sender_type: string
          updated_at: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_encrypted?: boolean
          is_read?: boolean
          message_type?: string
          metadata?: Json | null
          sender_id: string
          sender_type: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_encrypted?: boolean
          is_read?: boolean
          message_type?: string
          metadata?: Json | null
          sender_id?: string
          sender_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          priority: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          priority?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          priority?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      legal_professionals: {
        Row: {
          accepts_new_clients: boolean
          bar_numbers: Json | null
          bio: string | null
          certifications: string[] | null
          consultation_fee: number | null
          created_at: string
          education: string[] | null
          email: string
          full_name: string
          hourly_rate_max: number | null
          hourly_rate_min: number | null
          id: string
          is_active: boolean
          jurisdictions: string[]
          languages: string[] | null
          law_firm: string | null
          linkedin_url: string | null
          phone: string | null
          profile_image_url: string | null
          rating: number | null
          response_time_hours: number | null
          review_count: number
          specialties: string[]
          updated_at: string
          verification_documents: Json | null
          verified_status: string
          website: string | null
          years_experience: number | null
        }
        Insert: {
          accepts_new_clients?: boolean
          bar_numbers?: Json | null
          bio?: string | null
          certifications?: string[] | null
          consultation_fee?: number | null
          created_at?: string
          education?: string[] | null
          email: string
          full_name: string
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          is_active?: boolean
          jurisdictions?: string[]
          languages?: string[] | null
          law_firm?: string | null
          linkedin_url?: string | null
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          response_time_hours?: number | null
          review_count?: number
          specialties?: string[]
          updated_at?: string
          verification_documents?: Json | null
          verified_status?: string
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          accepts_new_clients?: boolean
          bar_numbers?: Json | null
          bio?: string | null
          certifications?: string[] | null
          consultation_fee?: number | null
          created_at?: string
          education?: string[] | null
          email?: string
          full_name?: string
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          is_active?: boolean
          jurisdictions?: string[]
          languages?: string[] | null
          law_firm?: string | null
          linkedin_url?: string | null
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          response_time_hours?: number | null
          review_count?: number
          specialties?: string[]
          updated_at?: string
          verification_documents?: Json | null
          verified_status?: string
          website?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      legal_template_customizations: {
        Row: {
          created_at: string
          custom_clauses: Json | null
          custom_fields: Json
          id: string
          is_default: boolean
          preferred_jurisdiction: string | null
          saved_name: string
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_clauses?: Json | null
          custom_fields?: Json
          id?: string
          is_default?: boolean
          preferred_jurisdiction?: string | null
          saved_name: string
          template_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_clauses?: Json | null
          custom_fields?: Json
          id?: string
          is_default?: boolean
          preferred_jurisdiction?: string | null
          saved_name?: string
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      license_events: {
        Row: {
          created_at: string
          data: Json | null
          event_type: string
          id: string
          license_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          event_type: string
          id?: string
          license_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          event_type?: string
          id?: string
          license_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_license_events_license"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          artwork_id: string | null
          blockchain_certificate_id: string | null
          blockchain_hash: string | null
          chain: string | null
          created_at: string
          currency: string | null
          document_hash: string | null
          document_url: string | null
          end_date: string | null
          file_hash: string
          hash_algo: string
          id: string
          issued_at: string
          license_type: string
          licensee_email: string | null
          licensee_name: string | null
          licensor_user_id: string | null
          paid_at: string | null
          payment_session_id: string | null
          price_cents: number | null
          start_date: string | null
          status: string | null
          terms: string
          terms_text: string | null
          territory: string | null
          tx_hash: string | null
          updated_at: string
          usage_scope: Json | null
          user_id: string
          verification_code: string | null
        }
        Insert: {
          artwork_id?: string | null
          blockchain_certificate_id?: string | null
          blockchain_hash?: string | null
          chain?: string | null
          created_at?: string
          currency?: string | null
          document_hash?: string | null
          document_url?: string | null
          end_date?: string | null
          file_hash: string
          hash_algo?: string
          id?: string
          issued_at?: string
          license_type: string
          licensee_email?: string | null
          licensee_name?: string | null
          licensor_user_id?: string | null
          paid_at?: string | null
          payment_session_id?: string | null
          price_cents?: number | null
          start_date?: string | null
          status?: string | null
          terms: string
          terms_text?: string | null
          territory?: string | null
          tx_hash?: string | null
          updated_at?: string
          usage_scope?: Json | null
          user_id: string
          verification_code?: string | null
        }
        Update: {
          artwork_id?: string | null
          blockchain_certificate_id?: string | null
          blockchain_hash?: string | null
          chain?: string | null
          created_at?: string
          currency?: string | null
          document_hash?: string | null
          document_url?: string | null
          end_date?: string | null
          file_hash?: string
          hash_algo?: string
          id?: string
          issued_at?: string
          license_type?: string
          licensee_email?: string | null
          licensee_name?: string | null
          licensor_user_id?: string | null
          paid_at?: string | null
          payment_session_id?: string | null
          price_cents?: number | null
          start_date?: string | null
          status?: string | null
          terms?: string
          terms_text?: string | null
          territory?: string | null
          tx_hash?: string | null
          updated_at?: string
          usage_scope?: Json | null
          user_id?: string
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_licenses_artwork"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artwork"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_licenses_licensor"
            columns: ["licensor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mobile_app_settings: {
        Row: {
          auto_sync_enabled: boolean
          biometric_auth_enabled: boolean
          created_at: string
          id: string
          language_preference: string
          offline_mode_enabled: boolean
          push_notifications_enabled: boolean
          theme_preference: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_sync_enabled?: boolean
          biometric_auth_enabled?: boolean
          created_at?: string
          id?: string
          language_preference?: string
          offline_mode_enabled?: boolean
          push_notifications_enabled?: boolean
          theme_preference?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_sync_enabled?: boolean
          biometric_auth_enabled?: boolean
          created_at?: string
          id?: string
          language_preference?: string
          offline_mode_enabled?: boolean
          push_notifications_enabled?: boolean
          theme_preference?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mobile_app_usage: {
        Row: {
          app_version: string | null
          crash_reports: Json | null
          created_at: string
          device_info: Json | null
          features_used: string[] | null
          id: string
          platform: string
          session_end: string | null
          session_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          crash_reports?: Json | null
          created_at?: string
          device_info?: Json | null
          features_used?: string[] | null
          id?: string
          platform: string
          session_end?: string | null
          session_start?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          crash_reports?: Json | null
          created_at?: string
          device_info?: Json | null
          features_used?: string[] | null
          id?: string
          platform?: string
          session_end?: string | null
          session_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mobile_notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          delivered_at: string | null
          id: string
          platform: string | null
          push_token: string | null
          read_at: string | null
          sent_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          id?: string
          platform?: string | null
          push_token?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          id?: string
          platform?: string | null
          push_token?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monitored_platforms: {
        Row: {
          api_endpoint: string | null
          created_at: string
          features: Json | null
          id: string
          is_enabled: boolean | null
          platform_category: string
          platform_name: string
          scan_frequency_minutes: number | null
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string
          features?: Json | null
          id?: string
          is_enabled?: boolean | null
          platform_category: string
          platform_name: string
          scan_frequency_minutes?: number | null
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string
          features?: Json | null
          id?: string
          is_enabled?: boolean | null
          platform_category?: string
          platform_name?: string
          scan_frequency_minutes?: number | null
        }
        Relationships: []
      }
      monitoring_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean | null
          match_id: string
          message: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id: string
          message: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id?: string
          message?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_alerts_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "copyright_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_scans: {
        Row: {
          artwork_id: string
          completed_at: string | null
          created_at: string
          id: string
          matches_found: number | null
          scan_type: string
          scanned_sources: number | null
          started_at: string | null
          status: string
          total_sources: number | null
        }
        Insert: {
          artwork_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          matches_found?: number | null
          scan_type: string
          scanned_sources?: number | null
          started_at?: string | null
          status?: string
          total_sources?: number | null
        }
        Update: {
          artwork_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          matches_found?: number | null
          scan_type?: string
          scanned_sources?: number | null
          started_at?: string | null
          status?: string
          total_sources?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_scans_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artwork"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_schedules: {
        Row: {
          alert_settings: Json | null
          artwork_ids: string[] | null
          created_at: string
          frequency_minutes: number
          id: string
          is_24_7_enabled: boolean
          is_active: boolean
          monitoring_hours: Json | null
          scan_types: string[]
          schedule_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_settings?: Json | null
          artwork_ids?: string[] | null
          created_at?: string
          frequency_minutes?: number
          id?: string
          is_24_7_enabled?: boolean
          is_active?: boolean
          monitoring_hours?: Json | null
          scan_types?: string[]
          schedule_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_settings?: Json | null
          artwork_ids?: string[] | null
          created_at?: string
          frequency_minutes?: number
          id?: string
          is_24_7_enabled?: boolean
          is_active?: boolean
          monitoring_hours?: Json | null
          scan_types?: string[]
          schedule_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monitoring_sessions: {
        Row: {
          created_at: string
          id: string
          monitoring_type: string
          started_at: string
          status: string
          stopped_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          monitoring_type: string
          started_at?: string
          status?: string
          stopped_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monitoring_type?: string
          started_at?: string
          status?: string
          stopped_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      moonpay_transactions: {
        Row: {
          completed_at: string | null
          created_at: string
          crypto_amount: number | null
          crypto_currency: string
          currency: string
          external_transaction_id: string
          fiat_amount: number
          fiat_currency: string
          id: string
          status: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          crypto_amount?: number | null
          crypto_currency: string
          currency: string
          external_transaction_id: string
          fiat_amount: number
          fiat_currency: string
          id?: string
          status: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          crypto_amount?: number | null
          crypto_currency?: string
          currency?: string
          external_transaction_id?: string
          fiat_amount?: number
          fiat_currency?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      nft_tokens: {
        Row: {
          artwork_id: string
          blockchain: string
          collection_name: string | null
          contract_address: string
          created_at: string
          current_price: number | null
          gas_fee_paid: number | null
          id: string
          is_listed_for_sale: boolean
          last_sale_price: number | null
          listing_marketplace: string | null
          listing_price: number | null
          metadata_ipfs_hash: string
          mint_block_number: number | null
          mint_transaction_hash: string
          minting_metadata: Json
          owner_wallet_address: string
          royalty_percentage: number
          token_id: number
          total_sales: number
          total_volume: number
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_id: string
          blockchain?: string
          collection_name?: string | null
          contract_address: string
          created_at?: string
          current_price?: number | null
          gas_fee_paid?: number | null
          id?: string
          is_listed_for_sale?: boolean
          last_sale_price?: number | null
          listing_marketplace?: string | null
          listing_price?: number | null
          metadata_ipfs_hash: string
          mint_block_number?: number | null
          mint_transaction_hash: string
          minting_metadata?: Json
          owner_wallet_address: string
          royalty_percentage?: number
          token_id: number
          total_sales?: number
          total_volume?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string
          blockchain?: string
          collection_name?: string | null
          contract_address?: string
          created_at?: string
          current_price?: number | null
          gas_fee_paid?: number | null
          id?: string
          is_listed_for_sale?: boolean
          last_sale_price?: number | null
          listing_marketplace?: string | null
          listing_price?: number | null
          metadata_ipfs_hash?: string
          mint_block_number?: number | null
          mint_transaction_hash?: string
          minting_metadata?: Json
          owner_wallet_address?: string
          royalty_percentage?: number
          token_id?: number
          total_sales?: number
          total_volume?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          app_redirect_uri: string
          created_at: string
          expires_at: string
          id: string
          provider: string
          state: string
          used: boolean
          user_id: string
        }
        Insert: {
          app_redirect_uri: string
          created_at?: string
          expires_at?: string
          id?: string
          provider: string
          state: string
          used?: boolean
          user_id: string
        }
        Update: {
          app_redirect_uri?: string
          created_at?: string
          expires_at?: string
          id?: string
          provider?: string
          state?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      one_click_protections: {
        Row: {
          artwork_id: string | null
          automation_settings: Json | null
          created_at: string
          id: string
          infringing_urls: string[] | null
          legal_documents: Json | null
          protection_type: string
          results: Json | null
          status: string
          target_platforms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_id?: string | null
          automation_settings?: Json | null
          created_at?: string
          id?: string
          infringing_urls?: string[] | null
          legal_documents?: Json | null
          protection_type: string
          results?: Json | null
          status?: string
          target_platforms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string | null
          automation_settings?: Json | null
          created_at?: string
          id?: string
          infringing_urls?: string[] | null
          legal_documents?: Json | null
          protection_type?: string
          results?: Json | null
          status?: string
          target_platforms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_click_protections_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artwork"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_costs: {
        Row: {
          annual_amount: number | null
          category: string
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          is_variable: boolean
          monthly_amount: number
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          annual_amount?: number | null
          category: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_variable?: boolean
          monthly_amount: number
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          annual_amount?: number | null
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_variable?: boolean
          monthly_amount?: number
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ownership_certificates: {
        Row: {
          blockchain: string
          certificate_data: Json
          certificate_hash: string
          court_admissible: boolean | null
          created_at: string
          id: string
          international_validity: boolean | null
          is_legal_grade: boolean | null
          registration_id: string
          user_id: string
        }
        Insert: {
          blockchain: string
          certificate_data?: Json
          certificate_hash: string
          court_admissible?: boolean | null
          created_at?: string
          id?: string
          international_validity?: boolean | null
          is_legal_grade?: boolean | null
          registration_id: string
          user_id: string
        }
        Update: {
          blockchain?: string
          certificate_data?: Json
          certificate_hash?: string
          court_admissible?: boolean | null
          created_at?: string
          id?: string
          international_validity?: boolean | null
          is_legal_grade?: boolean | null
          registration_id?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_monitoring_jobs: {
        Row: {
          api_key_id: string
          content_url: string
          created_at: string | null
          id: string
          last_scan_at: string | null
          matches_found: number | null
          metadata: Json | null
          monitor_type: string
          next_scan_at: string | null
          scan_frequency: string
          status: string
          total_scans: number | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          api_key_id: string
          content_url: string
          created_at?: string | null
          id?: string
          last_scan_at?: string | null
          matches_found?: number | null
          metadata?: Json | null
          monitor_type: string
          next_scan_at?: string | null
          scan_frequency: string
          status?: string
          total_scans?: number | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          api_key_id?: string
          content_url?: string
          created_at?: string | null
          id?: string
          last_scan_at?: string | null
          matches_found?: number | null
          metadata?: Json | null
          monitor_type?: string
          next_scan_at?: string | null
          scan_frequency?: string
          status?: string
          total_scans?: number | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_monitoring_jobs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "enterprise_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_pricing_tiers: {
        Row: {
          api_calls_included: number
          created_at: string
          custom_branding: boolean
          custom_integrations: boolean
          dedicated_support: boolean
          features: Json | null
          id: string
          is_active: boolean
          max_domains: number | null
          max_organizations: number | null
          max_users_per_org: number | null
          monthly_price: number
          rate_limit_per_hour: number
          tier_name: string
          updated_at: string
          white_label_included: boolean
        }
        Insert: {
          api_calls_included: number
          created_at?: string
          custom_branding?: boolean
          custom_integrations?: boolean
          dedicated_support?: boolean
          features?: Json | null
          id?: string
          is_active?: boolean
          max_domains?: number | null
          max_organizations?: number | null
          max_users_per_org?: number | null
          monthly_price: number
          rate_limit_per_hour: number
          tier_name: string
          updated_at?: string
          white_label_included?: boolean
        }
        Update: {
          api_calls_included?: number
          created_at?: string
          custom_branding?: boolean
          custom_integrations?: boolean
          dedicated_support?: boolean
          features?: Json | null
          id?: string
          is_active?: boolean
          max_domains?: number | null
          max_organizations?: number | null
          max_users_per_org?: number | null
          monthly_price?: number
          rate_limit_per_hour?: number
          tier_name?: string
          updated_at?: string
          white_label_included?: boolean
        }
        Relationships: []
      }
      partner_scan_results: {
        Row: {
          api_key_id: string
          content_url: string
          created_at: string | null
          id: string
          matches_found: number | null
          monitoring_job_id: string | null
          scan_data: Json | null
          scan_type: string
          scanned_at: string | null
          status: string
          threat_level: string | null
          user_id: string
        }
        Insert: {
          api_key_id: string
          content_url: string
          created_at?: string | null
          id?: string
          matches_found?: number | null
          monitoring_job_id?: string | null
          scan_data?: Json | null
          scan_type: string
          scanned_at?: string | null
          status?: string
          threat_level?: string | null
          user_id: string
        }
        Update: {
          api_key_id?: string
          content_url?: string
          created_at?: string | null
          id?: string
          matches_found?: number | null
          monitoring_job_id?: string | null
          scan_data?: Json | null
          scan_type?: string
          scanned_at?: string | null
          status?: string
          threat_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_scan_results_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "enterprise_api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_scan_results_monitoring_job_id_fkey"
            columns: ["monitoring_job_id"]
            isOneToOne: false
            referencedRelation: "partner_monitoring_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_subscription_usage: {
        Row: {
          api_calls_count: number
          created_at: string
          endpoint_usage: Json | null
          id: string
          subscription_id: string
          updated_at: string
          usage_date: string
        }
        Insert: {
          api_calls_count?: number
          created_at?: string
          endpoint_usage?: Json | null
          id?: string
          subscription_id: string
          updated_at?: string
          usage_date?: string
        }
        Update: {
          api_calls_count?: number
          created_at?: string
          endpoint_usage?: Json | null
          id?: string
          subscription_id?: string
          updated_at?: string
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_subscription_usage_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "partner_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_subscriptions: {
        Row: {
          api_calls_reset_at: string
          api_calls_used: number
          billing_cycle: string | null
          cancelled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          metadata: Json | null
          next_billing_date: string | null
          organization_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          tier_id: string
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_calls_reset_at?: string
          api_calls_used?: number
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          metadata?: Json | null
          next_billing_date?: string | null
          organization_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          tier_id: string
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_calls_reset_at?: string
          api_calls_used?: number
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          metadata?: Json | null
          next_billing_date?: string | null
          organization_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          tier_id?: string
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "partner_pricing_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_webhooks: {
        Row: {
          api_key_id: string
          created_at: string | null
          events: string[]
          failed_deliveries: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          metadata: Json | null
          secret_key: string
          total_deliveries: number | null
          updated_at: string | null
          user_id: string
          webhook_url: string
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          events?: string[]
          failed_deliveries?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          metadata?: Json | null
          secret_key?: string
          total_deliveries?: number | null
          updated_at?: string | null
          user_id: string
          webhook_url: string
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          events?: string[]
          failed_deliveries?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          metadata?: Json | null
          secret_key?: string
          total_deliveries?: number | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_webhooks_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "enterprise_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          additional_data: Json | null
          created_at: string
          id: string
          metric_type: string
          metric_unit: string
          metric_value: number
          recorded_at: string
          source_component: string
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string
          id?: string
          metric_type: string
          metric_unit: string
          metric_value: number
          recorded_at?: string
          source_component: string
        }
        Update: {
          additional_data?: Json | null
          created_at?: string
          id?: string
          metric_type?: string
          metric_unit?: string
          metric_value?: number
          recorded_at?: string
          source_component?: string
        }
        Relationships: []
      }
      platform_api_configs: {
        Row: {
          api_key_configured: boolean
          created_at: string
          current_usage: number | null
          error_message: string | null
          id: string
          is_configured: boolean
          last_rate_limit_reset: string | null
          platform_name: string
          rate_limit_per_hour: number | null
          status: string
          updated_at: string
        }
        Insert: {
          api_key_configured?: boolean
          created_at?: string
          current_usage?: number | null
          error_message?: string | null
          id?: string
          is_configured?: boolean
          last_rate_limit_reset?: string | null
          platform_name: string
          rate_limit_per_hour?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          api_key_configured?: boolean
          created_at?: string
          current_usage?: number | null
          error_message?: string | null
          id?: string
          is_configured?: boolean
          last_rate_limit_reset?: string | null
          platform_name?: string
          rate_limit_per_hour?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_alerts: {
        Row: {
          alert_type: string
          automated_response: Json | null
          compliance_deadline: string | null
          created_at: string
          id: string
          is_read: boolean
          is_resolved: boolean
          legal_action_required: boolean | null
          message: string
          metadata: Json | null
          platform_reported: boolean | null
          portfolio_id: string
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          automated_response?: Json | null
          compliance_deadline?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          is_resolved?: boolean
          legal_action_required?: boolean | null
          message: string
          metadata?: Json | null
          platform_reported?: boolean | null
          portfolio_id: string
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          automated_response?: Json | null
          compliance_deadline?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          is_resolved?: boolean
          legal_action_required?: boolean | null
          message?: string
          metadata?: Json | null
          platform_reported?: boolean | null
          portfolio_id?: string
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_compliance_workflows: {
        Row: {
          alert_id: string | null
          automation_enabled: boolean | null
          created_at: string
          current_step: string | null
          deadline: string | null
          id: string
          portfolio_id: string
          priority: string | null
          status: string
          steps_completed: Json | null
          updated_at: string
          user_id: string
          workflow_metadata: Json | null
          workflow_type: string
        }
        Insert: {
          alert_id?: string | null
          automation_enabled?: boolean | null
          created_at?: string
          current_step?: string | null
          deadline?: string | null
          id?: string
          portfolio_id: string
          priority?: string | null
          status?: string
          steps_completed?: Json | null
          updated_at?: string
          user_id: string
          workflow_metadata?: Json | null
          workflow_type: string
        }
        Update: {
          alert_id?: string | null
          automation_enabled?: boolean | null
          created_at?: string
          current_step?: string | null
          deadline?: string | null
          id?: string
          portfolio_id?: string
          priority?: string | null
          status?: string
          steps_completed?: Json | null
          updated_at?: string
          user_id?: string
          workflow_metadata?: Json | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_compliance_workflows_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "portfolio_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_compliance_workflows_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          added_at: string
          artwork_id: string
          id: string
          is_active: boolean
          portfolio_id: string
        }
        Insert: {
          added_at?: string
          artwork_id: string
          id?: string
          is_active?: boolean
          portfolio_id: string
        }
        Update: {
          added_at?: string
          artwork_id?: string
          id?: string
          is_active?: boolean
          portfolio_id?: string
        }
        Relationships: []
      }
      portfolio_monitoring_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      portfolio_monitoring_cache: {
        Row: {
          cache_key: string
          cache_value: Json
          created_at: string
          expires_at: string
          hit_count: number
          id: string
          updated_at: string
        }
        Insert: {
          cache_key: string
          cache_value: Json
          created_at?: string
          expires_at: string
          hit_count?: number
          id?: string
          updated_at?: string
        }
        Update: {
          cache_key?: string
          cache_value?: Json
          created_at?: string
          expires_at?: string
          hit_count?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_monitoring_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          portfolio_id: string | null
          recorded_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          portfolio_id?: string | null
          recorded_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          portfolio_id?: string | null
          recorded_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      portfolio_monitoring_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          notification_type: string
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          notification_type: string
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          notification_type?: string
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_monitoring_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          request_count: number
          updated_at: string
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          request_count?: number
          updated_at?: string
          user_id: string
          window_start: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          request_count?: number
          updated_at?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      portfolio_monitoring_results: {
        Row: {
          artworks_scanned: number
          automated_actions: Json | null
          created_at: string
          detection_accuracy: number | null
          false_positive_rate: number | null
          geographic_data: Json | null
          high_risk_matches: number
          id: string
          low_risk_matches: number
          medium_risk_matches: number
          platforms_scanned: string[]
          portfolio_id: string
          scan_date: string
          scan_duration_minutes: number | null
          total_artworks: number
          total_matches: number
        }
        Insert: {
          artworks_scanned?: number
          automated_actions?: Json | null
          created_at?: string
          detection_accuracy?: number | null
          false_positive_rate?: number | null
          geographic_data?: Json | null
          high_risk_matches?: number
          id?: string
          low_risk_matches?: number
          medium_risk_matches?: number
          platforms_scanned?: string[]
          portfolio_id: string
          scan_date?: string
          scan_duration_minutes?: number | null
          total_artworks?: number
          total_matches?: number
        }
        Update: {
          artworks_scanned?: number
          automated_actions?: Json | null
          created_at?: string
          detection_accuracy?: number | null
          false_positive_rate?: number | null
          geographic_data?: Json | null
          high_risk_matches?: number
          id?: string
          low_risk_matches?: number
          medium_risk_matches?: number
          platforms_scanned?: string[]
          portfolio_id?: string
          scan_date?: string
          scan_duration_minutes?: number | null
          total_artworks?: number
          total_matches?: number
        }
        Relationships: []
      }
      portfolio_monitoring_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          high_risk_matches: number | null
          id: string
          platforms_scanned: number | null
          portfolios_monitored: number | null
          session_metadata: Json | null
          session_type: string
          started_at: string
          status: string
          total_matches_found: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          high_risk_matches?: number | null
          id?: string
          platforms_scanned?: number | null
          portfolios_monitored?: number | null
          session_metadata?: Json | null
          session_type: string
          started_at?: string
          status?: string
          total_matches_found?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          high_risk_matches?: number | null
          id?: string
          platforms_scanned?: number | null
          portfolios_monitored?: number | null
          session_metadata?: Json | null
          session_type?: string
          started_at?: string
          status?: string
          total_matches_found?: number | null
          user_id?: string
        }
        Relationships: []
      }
      portfolio_performance_metrics: {
        Row: {
          additional_data: Json | null
          created_at: string
          id: string
          metric_type: string
          metric_unit: string
          metric_value: number
          recorded_at: string
          source_component: string
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string
          id?: string
          metric_type: string
          metric_unit: string
          metric_value: number
          recorded_at?: string
          source_component: string
        }
        Update: {
          additional_data?: Json | null
          created_at?: string
          id?: string
          metric_type?: string
          metric_unit?: string
          metric_value?: number
          recorded_at?: string
          source_component?: string
        }
        Relationships: []
      }
      portfolio_threat_intelligence: {
        Row: {
          confidence_score: number
          created_at: string
          first_detected: string
          geographic_origin: string | null
          id: string
          is_active: boolean | null
          last_detected: string
          occurrence_count: number | null
          platform_category: string | null
          threat_indicators: Json | null
          threat_source: string
          threat_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          first_detected?: string
          geographic_origin?: string | null
          id?: string
          is_active?: boolean | null
          last_detected?: string
          occurrence_count?: number | null
          platform_category?: string | null
          threat_indicators?: Json | null
          threat_source: string
          threat_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          first_detected?: string
          geographic_origin?: string | null
          id?: string
          is_active?: boolean | null
          last_detected?: string
          occurrence_count?: number | null
          platform_category?: string | null
          threat_indicators?: Json | null
          threat_source?: string
          threat_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          alert_settings: Json | null
          compliance_notes: string | null
          created_at: string
          data_classification: string | null
          description: string | null
          export_control_notice: boolean | null
          id: string
          industry_id: string | null
          is_active: boolean
          monitoring_enabled: boolean
          monitoring_frequency: string | null
          monitoring_settings: Json | null
          name: string
          next_scan_at: string | null
          realtime_monitoring: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_settings?: Json | null
          compliance_notes?: string | null
          created_at?: string
          data_classification?: string | null
          description?: string | null
          export_control_notice?: boolean | null
          id?: string
          industry_id?: string | null
          is_active?: boolean
          monitoring_enabled?: boolean
          monitoring_frequency?: string | null
          monitoring_settings?: Json | null
          name: string
          next_scan_at?: string | null
          realtime_monitoring?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_settings?: Json | null
          compliance_notes?: string | null
          created_at?: string
          data_classification?: string | null
          description?: string | null
          export_control_notice?: boolean | null
          id?: string
          industry_id?: string | null
          is_active?: boolean
          monitoring_enabled?: boolean
          monitoring_frequency?: string | null
          monitoring_settings?: Json | null
          name?: string
          next_scan_at?: string | null
          realtime_monitoring?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industry_verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      production_metrics: {
        Row: {
          created_at: string
          id: string
          labels: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          labels?: Json | null
          metric_name: string
          metric_type?: string
          metric_value: number
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          labels?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          timestamp?: string
        }
        Relationships: []
      }
      profile_impersonation_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          id: string
          is_acknowledged: boolean | null
          is_resolved: boolean | null
          recommended_actions: string[] | null
          resolved_at: string | null
          scan_result_id: string
          severity: string | null
          target_id: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          id?: string
          is_acknowledged?: boolean | null
          is_resolved?: boolean | null
          recommended_actions?: string[] | null
          resolved_at?: string | null
          scan_result_id: string
          severity?: string | null
          target_id: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          is_acknowledged?: boolean | null
          is_resolved?: boolean | null
          recommended_actions?: string[] | null
          resolved_at?: string | null
          scan_result_id?: string
          severity?: string | null
          target_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile_impersonation_alerts_scan_result"
            columns: ["scan_result_id"]
            isOneToOne: false
            referencedRelation: "profile_scan_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profile_impersonation_alerts_target"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profile_monitoring_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_monitoring_targets: {
        Row: {
          created_at: string
          id: string
          last_scan_at: string | null
          monitoring_enabled: boolean | null
          platforms_to_monitor: string[] | null
          profile_images: string[] | null
          risk_score: number | null
          target_description: string | null
          target_emails: string[] | null
          target_name: string
          target_usernames: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_scan_at?: string | null
          monitoring_enabled?: boolean | null
          platforms_to_monitor?: string[] | null
          profile_images?: string[] | null
          risk_score?: number | null
          target_description?: string | null
          target_emails?: string[] | null
          target_name: string
          target_usernames?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_scan_at?: string | null
          monitoring_enabled?: boolean | null
          platforms_to_monitor?: string[] | null
          profile_images?: string[] | null
          risk_score?: number | null
          target_description?: string | null
          target_emails?: string[] | null
          target_name?: string
          target_usernames?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_risk_assessments: {
        Row: {
          assessment_factors: Json | null
          brand_damage_risk: number | null
          created_at: string
          financial_risk: number | null
          id: string
          identity_theft_risk: number | null
          impersonation_risk: number | null
          last_updated: string
          overall_risk_score: number | null
          recommendations: string[] | null
          target_id: string
        }
        Insert: {
          assessment_factors?: Json | null
          brand_damage_risk?: number | null
          created_at?: string
          financial_risk?: number | null
          id?: string
          identity_theft_risk?: number | null
          impersonation_risk?: number | null
          last_updated?: string
          overall_risk_score?: number | null
          recommendations?: string[] | null
          target_id: string
        }
        Update: {
          assessment_factors?: Json | null
          brand_damage_risk?: number | null
          created_at?: string
          financial_risk?: number | null
          id?: string
          identity_theft_risk?: number | null
          impersonation_risk?: number | null
          last_updated?: string
          overall_risk_score?: number | null
          recommendations?: string[] | null
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile_risk_assessments_target"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profile_monitoring_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_scan_results: {
        Row: {
          confidence_score: number | null
          created_at: string
          detected_at: string
          detected_issues: string[] | null
          id: string
          is_reviewed: boolean | null
          is_verified: boolean | null
          metadata: Json | null
          platform: string
          profile_bio: string | null
          profile_image_url: string | null
          profile_name: string | null
          profile_url: string
          profile_username: string | null
          risk_level: string | null
          scan_type: string | null
          similarity_score: number | null
          target_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          detected_at?: string
          detected_issues?: string[] | null
          id?: string
          is_reviewed?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          platform: string
          profile_bio?: string | null
          profile_image_url?: string | null
          profile_name?: string | null
          profile_url: string
          profile_username?: string | null
          risk_level?: string | null
          scan_type?: string | null
          similarity_score?: number | null
          target_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          detected_at?: string
          detected_issues?: string[] | null
          id?: string
          is_reviewed?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          platform?: string
          profile_bio?: string | null
          profile_image_url?: string | null
          profile_name?: string | null
          profile_url?: string
          profile_username?: string | null
          risk_level?: string | null
          scan_type?: string | null
          similarity_score?: number | null
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile_scan_results_target"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profile_monitoring_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      promo_code_redemptions: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          promo_code_id: string
          redeemed_at: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          promo_code_id: string
          redeemed_at?: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          promo_code_id?: string
          redeemed_at?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_redemptions_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_percentage: number
          id: string
          is_active: boolean
          is_lifetime: boolean
          max_uses: number
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_percentage: number
          id?: string
          is_active?: boolean
          is_lifetime?: boolean
          max_uses: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_percentage?: number
          id?: string
          is_active?: boolean
          is_lifetime?: boolean
          max_uses?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      realtime_analysis_results: {
        Row: {
          analysis_type: string
          confidence_score: number
          created_at: string
          id: string
          image_url: string
          processing_time_ms: number | null
          results: Json
          service_name: string
          user_id: string
        }
        Insert: {
          analysis_type: string
          confidence_score: number
          created_at?: string
          id?: string
          image_url: string
          processing_time_ms?: number | null
          results?: Json
          service_name: string
          user_id: string
        }
        Update: {
          analysis_type?: string
          confidence_score?: number
          created_at?: string
          id?: string
          image_url?: string
          processing_time_ms?: number | null
          results?: Json
          service_name?: string
          user_id?: string
        }
        Relationships: []
      }
      realtime_matches: {
        Row: {
          artwork_id: string
          confidence_score: number
          created_at: string
          detected_at: string
          id: string
          match_type: string
          metadata: Json | null
          platform: string
          session_id: string
          source_domain: string | null
          source_url: string
          threat_level: string
        }
        Insert: {
          artwork_id: string
          confidence_score: number
          created_at?: string
          detected_at?: string
          id?: string
          match_type: string
          metadata?: Json | null
          platform: string
          session_id: string
          source_domain?: string | null
          source_url: string
          threat_level: string
        }
        Update: {
          artwork_id?: string
          confidence_score?: number
          created_at?: string
          detected_at?: string
          id?: string
          match_type?: string
          metadata?: Json | null
          platform?: string
          session_id?: string
          source_domain?: string | null
          source_url?: string
          threat_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "realtime_matches_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "realtime_scan_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      realtime_monitoring_sessions: {
        Row: {
          artwork_id: string | null
          created_at: string
          detections_count: number | null
          ended_at: string | null
          high_threat_count: number | null
          id: string
          image_fingerprints: string[] | null
          keywords_monitored: string[] | null
          platforms_monitored: string[] | null
          session_metadata: Json | null
          session_type: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_id?: string | null
          created_at?: string
          detections_count?: number | null
          ended_at?: string | null
          high_threat_count?: number | null
          id?: string
          image_fingerprints?: string[] | null
          keywords_monitored?: string[] | null
          platforms_monitored?: string[] | null
          session_metadata?: Json | null
          session_type: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string | null
          created_at?: string
          detections_count?: number | null
          ended_at?: string | null
          high_threat_count?: number | null
          id?: string
          image_fingerprints?: string[] | null
          keywords_monitored?: string[] | null
          platforms_monitored?: string[] | null
          session_metadata?: Json | null
          session_type?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "realtime_monitoring_sessions_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artwork"
            referencedColumns: ["id"]
          },
        ]
      }
      realtime_monitoring_stats: {
        Row: {
          active_scans: number | null
          dark_web_scans: number
          deepfakes_detected: number
          high_threat_count: number
          id: string
          low_threat_count: number
          medium_threat_count: number
          scan_type: string
          sources_scanned: number
          surface_web_scans: number
          timestamp: string
        }
        Insert: {
          active_scans?: number | null
          dark_web_scans?: number
          deepfakes_detected?: number
          high_threat_count?: number
          id?: string
          low_threat_count?: number
          medium_threat_count?: number
          scan_type?: string
          sources_scanned?: number
          surface_web_scans?: number
          timestamp?: string
        }
        Update: {
          active_scans?: number | null
          dark_web_scans?: number
          deepfakes_detected?: number
          high_threat_count?: number
          id?: string
          low_threat_count?: number
          medium_threat_count?: number
          scan_type?: string
          sources_scanned?: number
          surface_web_scans?: number
          timestamp?: string
        }
        Relationships: []
      }
      realtime_scan_sessions: {
        Row: {
          artwork_count: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          platforms: string[]
          platforms_scanned: number
          priority: string
          scan_type: string
          started_at: string | null
          status: string
          total_matches: number
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_count?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          platforms?: string[]
          platforms_scanned?: number
          priority?: string
          scan_type: string
          started_at?: string | null
          status?: string
          total_matches?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_count?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          platforms?: string[]
          platforms_scanned?: number
          priority?: string
          scan_type?: string
          started_at?: string | null
          status?: string
          total_matches?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      realtime_scan_updates: {
        Row: {
          created_at: string
          error_message: string | null
          high_threats: number
          id: string
          matches_found: number
          platform: string
          scan_duration_ms: number | null
          scan_timestamp: string
          session_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          high_threats?: number
          id?: string
          matches_found?: number
          platform: string
          scan_duration_ms?: number | null
          scan_timestamp?: string
          session_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          high_threats?: number
          id?: string
          matches_found?: number
          platform?: string
          scan_duration_ms?: number | null
          scan_timestamp?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "realtime_scan_updates_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "realtime_scan_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_execution_log: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          execution_type: string
          id: string
          monitoring_schedule_id: string | null
          results: Json | null
          scheduled_scan_id: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_type: string
          id?: string
          monitoring_schedule_id?: string | null
          results?: Json | null
          scheduled_scan_id?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_type?: string
          id?: string
          monitoring_schedule_id?: string | null
          results?: Json | null
          scheduled_scan_id?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_execution_log_monitoring_schedule_id_fkey"
            columns: ["monitoring_schedule_id"]
            isOneToOne: false
            referencedRelation: "monitoring_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_execution_log_scheduled_scan_id_fkey"
            columns: ["scheduled_scan_id"]
            isOneToOne: false
            referencedRelation: "scheduled_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_scans: {
        Row: {
          artwork_id: string | null
          created_at: string
          id: string
          is_active: boolean
          last_executed: string | null
          next_execution: string | null
          recurrence_pattern: Json | null
          scan_type: string
          schedule_type: string
          scheduled_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_executed?: string | null
          next_execution?: string | null
          recurrence_pattern?: Json | null
          scan_type: string
          schedule_type: string
          scheduled_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_executed?: string | null
          next_execution?: string | null
          recurrence_pattern?: Json | null
          scan_type?: string
          schedule_type?: string
          scheduled_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_scans_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artwork"
            referencedColumns: ["id"]
          },
        ]
      }
      security_alerts: {
        Row: {
          client_info: Json | null
          created_at: string
          description: string
          event_type: string
          id: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_info?: Json | null
          created_at?: string
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_info?: Json | null
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      smart_contract_interactions: {
        Row: {
          block_number: number | null
          blockchain: string
          contract_address: string
          created_at: string
          error_message: string | null
          function_name: string
          gas_price: number | null
          gas_used: number | null
          id: string
          input_data: Json
          output_data: Json
          status: string
          transaction_fee: number | null
          transaction_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          block_number?: number | null
          blockchain: string
          contract_address: string
          created_at?: string
          error_message?: string | null
          function_name: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          input_data?: Json
          output_data?: Json
          status?: string
          transaction_fee?: number | null
          transaction_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          block_number?: number | null
          blockchain?: string
          contract_address?: string
          created_at?: string
          error_message?: string | null
          function_name?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          input_data?: Json
          output_data?: Json
          status?: string
          transaction_fee?: number | null
          transaction_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      smart_contracts: {
        Row: {
          artwork_id: string | null
          blockchain: string
          commercial_use_allowed: boolean | null
          contract_abi: Json | null
          contract_address: string
          contract_features: string[] | null
          contract_type: string
          created_at: string
          deployment_cost: number | null
          deployment_hash: string
          gas_used: number | null
          id: string
          royalty_percentage: number | null
          status: string | null
          template_name: string
          transfer_restrictions: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_id?: string | null
          blockchain: string
          commercial_use_allowed?: boolean | null
          contract_abi?: Json | null
          contract_address: string
          contract_features?: string[] | null
          contract_type: string
          created_at?: string
          deployment_cost?: number | null
          deployment_hash: string
          gas_used?: number | null
          id?: string
          royalty_percentage?: number | null
          status?: string | null
          template_name: string
          transfer_restrictions?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string | null
          blockchain?: string
          commercial_use_allowed?: boolean | null
          contract_abi?: Json | null
          contract_address?: string
          contract_features?: string[] | null
          contract_type?: string
          created_at?: string
          deployment_cost?: number | null
          deployment_hash?: string
          gas_used?: number | null
          id?: string
          royalty_percentage?: number | null
          status?: string | null
          template_name?: string
          transfer_restrictions?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_media_accounts: {
        Row: {
          account_handle: string
          account_name: string | null
          account_url: string
          created_at: string
          follower_count: number | null
          id: string
          last_scan_at: string | null
          monitoring_enabled: boolean | null
          platform: string
          updated_at: string
          user_id: string
          verification_status: string | null
        }
        Insert: {
          account_handle: string
          account_name?: string | null
          account_url: string
          created_at?: string
          follower_count?: number | null
          id?: string
          last_scan_at?: string | null
          monitoring_enabled?: boolean | null
          platform: string
          updated_at?: string
          user_id: string
          verification_status?: string | null
        }
        Update: {
          account_handle?: string
          account_name?: string | null
          account_url?: string
          created_at?: string
          follower_count?: number | null
          id?: string
          last_scan_at?: string | null
          monitoring_enabled?: boolean | null
          platform?: string
          updated_at?: string
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      social_media_monitoring_results: {
        Row: {
          account_id: string
          action_taken: string | null
          artifacts_detected: string[] | null
          confidence_score: number
          content_description: string | null
          content_title: string | null
          content_type: string
          content_url: string
          created_at: string
          detected_at: string
          detection_type: string
          id: string
          is_reviewed: boolean | null
          scan_id: string
          threat_level: string
          thumbnail_url: string | null
        }
        Insert: {
          account_id: string
          action_taken?: string | null
          artifacts_detected?: string[] | null
          confidence_score: number
          content_description?: string | null
          content_title?: string | null
          content_type: string
          content_url: string
          created_at?: string
          detected_at?: string
          detection_type: string
          id?: string
          is_reviewed?: boolean | null
          scan_id: string
          threat_level?: string
          thumbnail_url?: string | null
        }
        Update: {
          account_id?: string
          action_taken?: string | null
          artifacts_detected?: string[] | null
          confidence_score?: number
          content_description?: string | null
          content_title?: string | null
          content_type?: string
          content_url?: string
          created_at?: string
          detected_at?: string
          detection_type?: string
          id?: string
          is_reviewed?: boolean | null
          scan_id?: string
          threat_level?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_monitoring_results_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_media_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_scans: {
        Row: {
          account_id: string
          completed_at: string | null
          content_scanned: number | null
          created_at: string
          detections_found: number | null
          error_message: string | null
          id: string
          scan_type: string
          started_at: string | null
          status: string
        }
        Insert: {
          account_id: string
          completed_at?: string | null
          content_scanned?: number | null
          created_at?: string
          detections_found?: number | null
          error_message?: string | null
          id?: string
          scan_type: string
          started_at?: string | null
          status?: string
        }
        Update: {
          account_id?: string
          completed_at?: string | null
          content_scanned?: number | null
          created_at?: string
          detections_found?: number | null
          error_message?: string | null
          id?: string
          scan_type?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_scans_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_media_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ssl_certificates: {
        Row: {
          certificate_chain: Json | null
          cipher_suite: string | null
          created_at: string | null
          days_until_expiry: number | null
          domain: string
          error_message: string | null
          id: string
          is_valid: boolean | null
          issuer: string | null
          last_checked: string | null
          metadata: Json | null
          protocol_version: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          certificate_chain?: Json | null
          cipher_suite?: string | null
          created_at?: string | null
          days_until_expiry?: number | null
          domain: string
          error_message?: string | null
          id?: string
          is_valid?: boolean | null
          issuer?: string | null
          last_checked?: string | null
          metadata?: Json | null
          protocol_version?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          certificate_chain?: Json | null
          cipher_suite?: string | null
          created_at?: string | null
          days_until_expiry?: number | null
          domain?: string
          error_message?: string | null
          id?: string
          is_valid?: boolean | null
          issuer?: string | null
          last_checked?: string | null
          metadata?: Json | null
          protocol_version?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      storage_addons: {
        Row: {
          addon_type: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          monthly_price_cents: number
          storage_amount_gb: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          addon_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          monthly_price_cents: number
          storage_amount_gb: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          addon_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          monthly_price_cents?: number
          storage_amount_gb?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      storage_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          storage_delta_bytes: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          storage_delta_bytes?: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          storage_delta_bytes?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          current_period_end: string
          current_period_start: string
          custom_domain_enabled: boolean | null
          deepfake_addon: boolean
          id: string
          max_white_label_users: number | null
          metadata: Json | null
          plan_id: string
          promo_code_discount: number | null
          promo_code_id: string | null
          social_media_addon: boolean
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
          white_label_enabled: boolean | null
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          current_period_end: string
          current_period_start?: string
          custom_domain_enabled?: boolean | null
          deepfake_addon?: boolean
          id?: string
          max_white_label_users?: number | null
          metadata?: Json | null
          plan_id: string
          promo_code_discount?: number | null
          promo_code_id?: string | null
          social_media_addon?: boolean
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
          white_label_enabled?: boolean | null
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          custom_domain_enabled?: boolean | null
          deepfake_addon?: boolean
          id?: string
          max_white_label_users?: number | null
          metadata?: Json | null
          plan_id?: string
          promo_code_discount?: number | null
          promo_code_id?: string | null
          social_media_addon?: boolean
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
          white_label_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      support_conversations: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          last_message_at: string | null
          metadata: Json | null
          priority: string
          status: string
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          priority?: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          priority?: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachments: Json | null
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          attachments?: Json | null
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          sender_id: string
          sender_type: string
        }
        Update: {
          attachments?: Json | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_optimizations: {
        Row: {
          configuration: Json
          created_at: string
          enabled_at: string | null
          enabled_by: string | null
          id: string
          is_enabled: boolean
          optimization_type: string
          performance_impact: Json | null
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          is_enabled?: boolean
          optimization_type: string
          performance_impact?: Json | null
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          is_enabled?: boolean
          optimization_type?: string
          performance_impact?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      template_purchases: {
        Row: {
          amount_paid: number
          created_at: string | null
          currency: string | null
          id: string
          purchased_at: string | null
          status: string | null
          stripe_session_id: string | null
          template_id: string
          template_title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          currency?: string | null
          id?: string
          purchased_at?: string | null
          status?: string | null
          stripe_session_id?: string | null
          template_id: string
          template_title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          purchased_at?: string | null
          status?: string | null
          stripe_session_id?: string | null
          template_id?: string
          template_title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      template_usage_stats: {
        Row: {
          conversion_rate: number | null
          created_at: string
          date: string
          id: string
          template_id: string
          total_downloads: number | null
          total_generations: number | null
          total_views: number | null
          unique_users: number | null
          updated_at: string
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          template_id: string
          total_downloads?: number | null
          total_generations?: number | null
          total_views?: number | null
          unique_users?: number | null
          updated_at?: string
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          template_id?: string
          total_downloads?: number | null
          total_generations?: number | null
          total_views?: number | null
          unique_users?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      threat_intelligence: {
        Row: {
          confidence_score: number
          created_at: string
          description: string | null
          first_seen: string
          id: string
          indicator_type: string
          indicator_value: string
          last_seen: string
          source: string
          tags: string[]
          threat_level: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          description?: string | null
          first_seen?: string
          id?: string
          indicator_type: string
          indicator_value: string
          last_seen?: string
          source: string
          tags?: string[]
          threat_level?: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          description?: string | null
          first_seen?: string
          id?: string
          indicator_type?: string
          indicator_value?: string
          last_seen?: string
          source?: string
          tags?: string[]
          threat_level?: string
          updated_at?: string
        }
        Relationships: []
      }
      trademark_alerts: {
        Row: {
          alert_type: string
          auto_resolved: boolean | null
          confidence_score: number | null
          created_at: string
          description: string
          dmca_notice_sent: boolean | null
          evidence_data: Json | null
          geographic_data: Json | null
          id: string
          legal_action_taken: boolean | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          source_domain: string | null
          source_url: string | null
          status: string
          title: string
          trademark_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          auto_resolved?: boolean | null
          confidence_score?: number | null
          created_at?: string
          description: string
          dmca_notice_sent?: boolean | null
          evidence_data?: Json | null
          geographic_data?: Json | null
          id?: string
          legal_action_taken?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source_domain?: string | null
          source_url?: string | null
          status?: string
          title: string
          trademark_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          auto_resolved?: boolean | null
          confidence_score?: number | null
          created_at?: string
          description?: string
          dmca_notice_sent?: boolean | null
          evidence_data?: Json | null
          geographic_data?: Json | null
          id?: string
          legal_action_taken?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source_domain?: string | null
          source_url?: string | null
          status?: string
          title?: string
          trademark_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trademark_alerts_trademark_id_fkey"
            columns: ["trademark_id"]
            isOneToOne: false
            referencedRelation: "trademarks"
            referencedColumns: ["id"]
          },
        ]
      }
      trademark_monitoring_scans: {
        Row: {
          completed_at: string | null
          created_at: string
          error_details: Json | null
          geographic_scope: string[] | null
          high_risk_matches: number | null
          id: string
          low_risk_matches: number | null
          medium_risk_matches: number | null
          platforms_scanned: string[] | null
          potential_infringements: number | null
          scan_duration_seconds: number | null
          scan_parameters: Json | null
          scan_status: string
          scan_type: string
          search_terms_used: string[] | null
          started_at: string
          total_results_found: number | null
          trademark_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          geographic_scope?: string[] | null
          high_risk_matches?: number | null
          id?: string
          low_risk_matches?: number | null
          medium_risk_matches?: number | null
          platforms_scanned?: string[] | null
          potential_infringements?: number | null
          scan_duration_seconds?: number | null
          scan_parameters?: Json | null
          scan_status?: string
          scan_type?: string
          search_terms_used?: string[] | null
          started_at?: string
          total_results_found?: number | null
          trademark_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          geographic_scope?: string[] | null
          high_risk_matches?: number | null
          id?: string
          low_risk_matches?: number | null
          medium_risk_matches?: number | null
          platforms_scanned?: string[] | null
          potential_infringements?: number | null
          scan_duration_seconds?: number | null
          scan_parameters?: Json | null
          scan_status?: string
          scan_type?: string
          search_terms_used?: string[] | null
          started_at?: string
          total_results_found?: number | null
          trademark_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trademark_monitoring_scans_trademark_id_fkey"
            columns: ["trademark_id"]
            isOneToOne: false
            referencedRelation: "trademarks"
            referencedColumns: ["id"]
          },
        ]
      }
      trademark_portfolio_metrics: {
        Row: {
          active_trademarks: number
          average_scan_duration_minutes: number | null
          compliance_score: number | null
          created_at: string
          expired_trademarks: number
          geographic_coverage: string[] | null
          high_risk_alerts_count: number
          id: string
          metadata: Json | null
          metric_date: string
          monitoring_alerts_count: number
          pending_applications: number
          portfolio_value_estimate_usd: number | null
          protection_score: number | null
          renewals_due_30_days: number
          renewals_due_90_days: number
          total_scans_performed: number
          total_trademarks: number
          trademark_classes_covered: string[] | null
          unresolved_alerts_count: number
          user_id: string
        }
        Insert: {
          active_trademarks?: number
          average_scan_duration_minutes?: number | null
          compliance_score?: number | null
          created_at?: string
          expired_trademarks?: number
          geographic_coverage?: string[] | null
          high_risk_alerts_count?: number
          id?: string
          metadata?: Json | null
          metric_date?: string
          monitoring_alerts_count?: number
          pending_applications?: number
          portfolio_value_estimate_usd?: number | null
          protection_score?: number | null
          renewals_due_30_days?: number
          renewals_due_90_days?: number
          total_scans_performed?: number
          total_trademarks?: number
          trademark_classes_covered?: string[] | null
          unresolved_alerts_count?: number
          user_id: string
        }
        Update: {
          active_trademarks?: number
          average_scan_duration_minutes?: number | null
          compliance_score?: number | null
          created_at?: string
          expired_trademarks?: number
          geographic_coverage?: string[] | null
          high_risk_alerts_count?: number
          id?: string
          metadata?: Json | null
          metric_date?: string
          monitoring_alerts_count?: number
          pending_applications?: number
          portfolio_value_estimate_usd?: number | null
          protection_score?: number | null
          renewals_due_30_days?: number
          renewals_due_90_days?: number
          total_scans_performed?: number
          total_trademarks?: number
          trademark_classes_covered?: string[] | null
          unresolved_alerts_count?: number
          user_id?: string
        }
        Relationships: []
      }
      trademark_renewals: {
        Row: {
          attorney_handling: string | null
          automatic_renewal: boolean | null
          confirmation_number: string | null
          created_at: string
          due_date: string
          filed_date: string | null
          grace_period_end: string | null
          id: string
          last_reminder_sent: string | null
          notes: string | null
          payment_method_id: string | null
          receipt_url: string | null
          reminder_schedule: Json | null
          reminder_sent: boolean | null
          renewal_fee_usd: number | null
          renewal_type: string
          status: string
          trademark_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attorney_handling?: string | null
          automatic_renewal?: boolean | null
          confirmation_number?: string | null
          created_at?: string
          due_date: string
          filed_date?: string | null
          grace_period_end?: string | null
          id?: string
          last_reminder_sent?: string | null
          notes?: string | null
          payment_method_id?: string | null
          receipt_url?: string | null
          reminder_schedule?: Json | null
          reminder_sent?: boolean | null
          renewal_fee_usd?: number | null
          renewal_type: string
          status?: string
          trademark_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attorney_handling?: string | null
          automatic_renewal?: boolean | null
          confirmation_number?: string | null
          created_at?: string
          due_date?: string
          filed_date?: string | null
          grace_period_end?: string | null
          id?: string
          last_reminder_sent?: string | null
          notes?: string | null
          payment_method_id?: string | null
          receipt_url?: string | null
          reminder_schedule?: Json | null
          reminder_sent?: boolean | null
          renewal_fee_usd?: number | null
          renewal_type?: string
          status?: string
          trademark_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trademark_renewals_trademark_id_fkey"
            columns: ["trademark_id"]
            isOneToOne: false
            referencedRelation: "trademarks"
            referencedColumns: ["id"]
          },
        ]
      }
      trademark_search_results: {
        Row: {
          applicant_name: string | null
          application_number: string | null
          confidence_score: number
          created_at: string
          evidence_preserved: boolean | null
          filing_date: string | null
          geographic_scope: string | null
          goods_services: string | null
          id: string
          is_reviewed: boolean | null
          legal_analysis: Json | null
          match_type: string
          recommended_actions: string[] | null
          result_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          risk_level: string
          scan_id: string
          similarity_analysis: Json | null
          source_description: string | null
          source_platform: string
          source_title: string | null
          source_url: string | null
          status: string | null
          trademark_class: string[] | null
          trademark_id: string
          trademark_image_url: string | null
          trademark_text: string | null
          user_id: string
        }
        Insert: {
          applicant_name?: string | null
          application_number?: string | null
          confidence_score: number
          created_at?: string
          evidence_preserved?: boolean | null
          filing_date?: string | null
          geographic_scope?: string | null
          goods_services?: string | null
          id?: string
          is_reviewed?: boolean | null
          legal_analysis?: Json | null
          match_type: string
          recommended_actions?: string[] | null
          result_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          risk_level?: string
          scan_id: string
          similarity_analysis?: Json | null
          source_description?: string | null
          source_platform: string
          source_title?: string | null
          source_url?: string | null
          status?: string | null
          trademark_class?: string[] | null
          trademark_id: string
          trademark_image_url?: string | null
          trademark_text?: string | null
          user_id: string
        }
        Update: {
          applicant_name?: string | null
          application_number?: string | null
          confidence_score?: number
          created_at?: string
          evidence_preserved?: boolean | null
          filing_date?: string | null
          geographic_scope?: string | null
          goods_services?: string | null
          id?: string
          is_reviewed?: boolean | null
          legal_analysis?: Json | null
          match_type?: string
          recommended_actions?: string[] | null
          result_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          risk_level?: string
          scan_id?: string
          similarity_analysis?: Json | null
          source_description?: string | null
          source_platform?: string
          source_title?: string | null
          source_url?: string | null
          status?: string | null
          trademark_class?: string[] | null
          trademark_id?: string
          trademark_image_url?: string | null
          trademark_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trademark_search_results_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "trademark_monitoring_scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trademark_search_results_trademark_id_fkey"
            columns: ["trademark_id"]
            isOneToOne: false
            referencedRelation: "trademarks"
            referencedColumns: ["id"]
          },
        ]
      }
      trademarks: {
        Row: {
          application_number: string | null
          attorney_info: Json | null
          created_at: string
          description: string | null
          filing_date: string | null
          goods_services: string | null
          id: string
          jurisdiction: string
          last_monitored_at: string | null
          madrid_protocol: boolean | null
          metadata: Json | null
          monitoring_enabled: boolean | null
          owner_address: string | null
          owner_name: string | null
          priority_claims: Json | null
          registration_date: string | null
          registration_number: string | null
          renewal_date: string | null
          status: string
          trademark_class: string[] | null
          trademark_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_number?: string | null
          attorney_info?: Json | null
          created_at?: string
          description?: string | null
          filing_date?: string | null
          goods_services?: string | null
          id?: string
          jurisdiction: string
          last_monitored_at?: string | null
          madrid_protocol?: boolean | null
          metadata?: Json | null
          monitoring_enabled?: boolean | null
          owner_address?: string | null
          owner_name?: string | null
          priority_claims?: Json | null
          registration_date?: string | null
          registration_number?: string | null
          renewal_date?: string | null
          status?: string
          trademark_class?: string[] | null
          trademark_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_number?: string | null
          attorney_info?: Json | null
          created_at?: string
          description?: string | null
          filing_date?: string | null
          goods_services?: string | null
          id?: string
          jurisdiction?: string
          last_monitored_at?: string | null
          madrid_protocol?: boolean | null
          metadata?: Json | null
          monitoring_enabled?: boolean | null
          owner_address?: string | null
          owner_name?: string | null
          priority_claims?: Json | null
          registration_date?: string | null
          registration_number?: string | null
          renewal_date?: string | null
          status?: string
          trademark_class?: string[] | null
          trademark_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_industries: {
        Row: {
          attestation_completed: boolean | null
          created_at: string
          id: string
          industry_id: string
          is_primary: boolean | null
          security_clearance_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attestation_completed?: boolean | null
          created_at?: string
          id?: string
          industry_id: string
          is_primary?: boolean | null
          security_clearance_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attestation_completed?: boolean | null
          created_at?: string
          id?: string
          industry_id?: string
          is_primary?: boolean | null
          security_clearance_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_industries_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industry_verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_integrations: {
        Row: {
          access_token: string
          account_id: string | null
          account_name: string | null
          created_at: string
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          scope: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_id?: string | null
          account_name?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          scope?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_id?: string | null
          account_name?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          scope?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_legal_profiles: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          business_name: string | null
          business_type: string | null
          city: string
          country: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          postal_code: string
          preferred_jurisdiction: string | null
          state_province: string
          tax_id: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          business_name?: string | null
          business_type?: string | null
          city: string
          country?: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          postal_code: string
          preferred_jurisdiction?: string | null
          state_province: string
          tax_id?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string
          country?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          postal_code?: string
          preferred_jurisdiction?: string | null
          state_province?: string
          tax_id?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_storage_usage: {
        Row: {
          artwork_count: number
          created_at: string
          id: string
          last_calculated_at: string
          storage_limit_bytes: number
          storage_used_bytes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_count?: number
          created_at?: string
          id?: string
          last_calculated_at?: string
          storage_limit_bytes?: number
          storage_used_bytes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_count?: number
          created_at?: string
          id?: string
          last_calculated_at?: string
          storage_limit_bytes?: number
          storage_used_bytes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_connections: {
        Row: {
          blockchain: string
          created_at: string
          id: string
          is_primary: boolean
          is_verified: boolean
          last_connected_at: string | null
          updated_at: string
          user_id: string
          verification_message: string | null
          verification_signature: string | null
          wallet_address: string
          wallet_type: string
        }
        Insert: {
          blockchain: string
          created_at?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          last_connected_at?: string | null
          updated_at?: string
          user_id: string
          verification_message?: string | null
          verification_signature?: string | null
          wallet_address: string
          wallet_type: string
        }
        Update: {
          blockchain?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          last_connected_at?: string | null
          updated_at?: string
          user_id?: string
          verification_message?: string | null
          verification_signature?: string | null
          wallet_address?: string
          wallet_type?: string
        }
        Relationships: []
      }
      web_scan_results: {
        Row: {
          action_taken: string | null
          artifacts_detected: string[] | null
          confidence_score: number
          content_description: string | null
          content_title: string | null
          content_type: string
          created_at: string
          detected_at: string
          detection_type: string
          id: string
          is_reviewed: boolean
          scan_id: string
          source_domain: string
          source_url: string
          threat_level: string
          thumbnail_url: string | null
        }
        Insert: {
          action_taken?: string | null
          artifacts_detected?: string[] | null
          confidence_score: number
          content_description?: string | null
          content_title?: string | null
          content_type: string
          created_at?: string
          detected_at?: string
          detection_type: string
          id?: string
          is_reviewed?: boolean
          scan_id: string
          source_domain: string
          source_url: string
          threat_level: string
          thumbnail_url?: string | null
        }
        Update: {
          action_taken?: string | null
          artifacts_detected?: string[] | null
          confidence_score?: number
          content_description?: string | null
          content_title?: string | null
          content_type?: string
          created_at?: string
          detected_at?: string
          detection_type?: string
          id?: string
          is_reviewed?: boolean
          scan_id?: string
          source_domain?: string
          source_url?: string
          threat_level?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "web_scan_results_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "web_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      web_scans: {
        Row: {
          completed_at: string | null
          content_text: string | null
          content_type: string
          content_url: string | null
          created_at: string
          error_message: string | null
          id: string
          include_deep_web: boolean
          matches_found: number | null
          search_terms: string[]
          sources_scanned: number | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_text?: string | null
          content_type: string
          content_url?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          include_deep_web?: boolean
          matches_found?: number | null
          search_terms: string[]
          sources_scanned?: number | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_text?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          include_deep_web?: boolean
          matches_found?: number | null
          search_terms?: string[]
          sources_scanned?: number | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      white_label_domains: {
        Row: {
          created_at: string
          dns_configured: boolean | null
          domain: string
          id: string
          is_primary: boolean | null
          organization_id: string
          ssl_enabled: boolean | null
          updated_at: string
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          dns_configured?: boolean | null
          domain: string
          id?: string
          is_primary?: boolean | null
          organization_id: string
          ssl_enabled?: boolean | null
          updated_at?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          dns_configured?: boolean | null
          domain?: string
          id?: string
          is_primary?: boolean | null
          organization_id?: string
          ssl_enabled?: boolean | null
          updated_at?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "white_label_domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "white_label_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      white_label_organizations: {
        Row: {
          accent_color: string | null
          company_description: string | null
          company_name: string
          created_at: string
          custom_css: string | null
          custom_domain: string | null
          domain_verified: boolean | null
          domain_verified_at: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_artworks: number | null
          max_users: number | null
          name: string
          owner_id: string
          partner_subscription_id: string | null
          partner_tier_id: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          company_description?: string | null
          company_name: string
          created_at?: string
          custom_css?: string | null
          custom_domain?: string | null
          domain_verified?: boolean | null
          domain_verified_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_artworks?: number | null
          max_users?: number | null
          name: string
          owner_id: string
          partner_subscription_id?: string | null
          partner_tier_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          company_description?: string | null
          company_name?: string
          created_at?: string
          custom_css?: string | null
          custom_domain?: string | null
          domain_verified?: boolean | null
          domain_verified_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_artworks?: number | null
          max_users?: number | null
          name?: string
          owner_id?: string
          partner_subscription_id?: string | null
          partner_tier_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "white_label_organizations_partner_subscription_id_fkey"
            columns: ["partner_subscription_id"]
            isOneToOne: false
            referencedRelation: "partner_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "white_label_organizations_partner_tier_id_fkey"
            columns: ["partner_tier_id"]
            isOneToOne: false
            referencedRelation: "partner_pricing_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "white_label_organizations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      white_label_users: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          organization_id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          organization_id: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          organization_id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "white_label_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "white_label_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_execution: {
        Args: {
          execution_time: string
          recurrence_pattern: Json
          schedule_type: string
        }
        Returns: string
      }
      calculate_segment_size: { Args: { segment_id: string }; Returns: number }
      calculate_user_storage_usage: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      check_ai_protection_rate_limit: {
        Args: {
          endpoint_param: string
          max_requests_param?: number
          user_id_param: string
          window_minutes_param?: number
        }
        Returns: boolean
      }
      check_daily_api_limit: {
        Args: {
          p_daily_limit: number
          p_service_type: string
          p_user_id: string
        }
        Returns: Json
      }
      check_enterprise_api_rate_limit: {
        Args: { api_key_param: string; endpoint_param?: string }
        Returns: boolean
      }
      check_portfolio_monitoring_rate_limit: {
        Args: {
          endpoint_param: string
          max_requests_param?: number
          user_id_param: string
          window_minutes_param?: number
        }
        Returns: boolean
      }
      create_ai_protection_notification: {
        Args: {
          action_url_param?: string
          expires_hours_param?: number
          message_param: string
          metadata_param?: Json
          notification_type_param: string
          severity_param?: string
          title_param: string
          user_id_param: string
        }
        Returns: string
      }
      create_free_subscription_for_user: {
        Args: { _user_id: string }
        Returns: undefined
      }
      create_portfolio_monitoring_notification: {
        Args: {
          action_url_param?: string
          expires_hours_param?: number
          message_param: string
          metadata_param?: Json
          notification_type_param: string
          severity_param?: string
          title_param: string
          user_id_param: string
        }
        Returns: string
      }
      generate_document_hash: { Args: { content: string }; Returns: string }
      generate_enterprise_api_key: { Args: never; Returns: string }
      generate_government_api_key: { Args: never; Returns: string }
      generate_secure_api_key: { Args: never; Returns: string }
      get_all_template_download_counts: {
        Args: never
        Returns: {
          download_count: number
          template_id: string
        }[]
      }
      get_artwork_limit: { Args: never; Returns: number }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_daily_usage_stats: {
        Args: { p_user_id: string }
        Returns: {
          current_usage: number
          daily_limit: number
          remaining: number
          reset_time: string
          service_type: string
        }[]
      }
      get_portfolio_limit: { Args: never; Returns: number }
      get_portfolio_monitoring_cache: {
        Args: { cache_key_param: string }
        Returns: Json
      }
      get_production_health: { Args: never; Returns: Json }
      get_template_download_count: {
        Args: { template_id_param: string }
        Returns: number
      }
      get_total_operating_costs: {
        Args: never
        Returns: {
          cost_breakdown: Json
          fixed_monthly: number
          total_annual: number
          total_monthly: number
          variable_monthly: number
        }[]
      }
      get_user_dashboard_stats: {
        Args: never
        Returns: {
          high_threats: number
          protected_artworks: number
          protection_score: number
          total_portfolios: number
          total_scans: number
        }[]
      }
      get_user_email_verified: { Args: never; Returns: boolean }
      get_user_notification_preferences: {
        Args: { user_id_param: string }
        Returns: {
          copyright_alerts_enabled: boolean
          daily_digest_enabled: boolean
          deepfake_alerts_enabled: boolean
          digest_time: string
          high_priority_only: boolean
        }[]
      }
      get_user_partner_tier: {
        Args: never
        Returns: {
          api_calls_included: number
          api_calls_remaining: number
          api_calls_used: number
          billing_cycle: string
          current_period_end: string
          custom_branding: boolean
          custom_integrations: boolean
          dedicated_support: boolean
          features: Json
          max_domains: number
          max_organizations: number
          max_users_per_org: number
          monthly_price: number
          next_billing_date: string
          rate_limit_per_hour: number
          stripe_subscription_id: string
          subscription_status: string
          tier_name: string
          white_label_included: boolean
        }[]
      }
      get_user_primary_industry: {
        Args: { user_id_param: string }
        Returns: {
          export_controlled: boolean
          industry_name: string
          industry_slug: string
          requires_clearance: boolean
        }[]
      }
      get_user_subscription: {
        Args: never
        Returns: {
          deepfake_addon: boolean
          is_active: boolean
          plan_id: string
          social_media_addon: boolean
          status: string
        }[]
      }
      get_user_white_label_access: {
        Args: { user_id_param: string }
        Returns: {
          is_owner: boolean
          organization_id: string
          role: string
        }[]
      }
      get_user_white_label_org: {
        Args: never
        Returns: {
          is_owner: boolean
          org_id: string
          org_name: string
          org_slug: string
          user_role: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_session_token: { Args: { token: string }; Returns: string }
      invalidate_admin_sessions_by_ip: {
        Args: { ip_param: unknown }
        Returns: undefined
      }
      is_valid_admin_session: {
        Args: { session_token: string }
        Returns: boolean
      }
      is_valid_hashed_admin_session: {
        Args: { session_token: string }
        Returns: boolean
      }
      log_ai_protection_action: {
        Args: {
          action_param: string
          details_param?: Json
          ip_param?: unknown
          resource_id_param?: string
          resource_type_param: string
          user_agent_param?: string
          user_id_param: string
        }
        Returns: undefined
      }
      log_enterprise_api_usage: {
        Args: {
          api_key_param: string
          endpoint_param: string
          error_message_param?: string
          ip_address_param?: unknown
          metadata_param?: Json
          method_param: string
          response_time_ms_param?: number
          status_code_param: number
          user_agent_param?: string
        }
        Returns: undefined
      }
      log_error: {
        Args: {
          error_message_param: string
          error_stack_param?: string
          metadata_param?: Json
          request_path_param?: string
          severity_param?: string
          user_id_param?: string
        }
        Returns: string
      }
      log_portfolio_monitoring_action: {
        Args: {
          action_param: string
          details_param?: Json
          ip_param?: unknown
          resource_id_param?: string
          resource_type_param: string
          user_agent_param?: string
          user_id_param: string
        }
        Returns: undefined
      }
      log_production_metric: {
        Args: {
          metadata_param?: Json
          metric_name_param: string
          metric_type_param: string
          metric_value_param: number
        }
        Returns: string
      }
      record_ai_protection_metric: {
        Args: {
          metadata_param?: Json
          metric_name_param: string
          metric_type_param: string
          metric_value_param: number
        }
        Returns: undefined
      }
      record_portfolio_monitoring_metric: {
        Args: {
          metadata_param?: Json
          metric_name_param: string
          metric_type_param: string
          metric_value_param: number
          portfolio_id_param?: string
          user_id_param?: string
        }
        Returns: undefined
      }
      record_production_metric: {
        Args: {
          labels_param?: Json
          metric_name_param: string
          metric_type_param?: string
          metric_value_param: number
        }
        Returns: undefined
      }
      redeem_promo_code: {
        Args: { code_param: string; subscription_id_param?: string }
        Returns: boolean
      }
      schedule_compliance_reminder: {
        Args: {
          compliance_id_param: string
          reminder_type_param: string
          scheduled_date_param: string
        }
        Returns: string
      }
      set_portfolio_monitoring_cache: {
        Args: {
          cache_key_param: string
          cache_value_param: Json
          ttl_seconds_param?: number
        }
        Returns: undefined
      }
      track_partner_api_usage: {
        Args: {
          calls_count_param?: number
          endpoint_param?: string
          user_id_param: string
        }
        Returns: boolean
      }
      track_template_usage: {
        Args: {
          event_type_param: string
          template_id_param: string
          user_id_param?: string
        }
        Returns: undefined
      }
      trigger_scheduled_scans: { Args: never; Returns: undefined }
      update_case_status: {
        Args: { case_id_param: string; message?: string; new_status: string }
        Returns: boolean
      }
      update_protection_job_progress: {
        Args: {
          job_id_param: string
          progress_param: number
          status_param?: string
        }
        Returns: undefined
      }
      user_has_feature: { Args: { feature_name: string }; Returns: boolean }
      user_has_membership: { Args: { _user_id: string }; Returns: boolean }
      user_has_white_label_access: { Args: never; Returns: boolean }
      validate_admin_token: { Args: { token_hash: string }; Returns: boolean }
      validate_government_api_key: {
        Args: { api_key_param: string; required_permission?: string }
        Returns: Json
      }
      validate_promo_code: { Args: { code_param: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
