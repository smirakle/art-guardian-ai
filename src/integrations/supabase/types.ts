export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          session_token: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          session_token: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          session_token?: string
        }
        Relationships: []
      }
      ai_protection_records: {
        Row: {
          applied_at: string
          artwork_id: string | null
          created_at: string
          file_fingerprint: string
          id: string
          is_active: boolean
          metadata: Json
          original_filename: string
          protected_file_path: string | null
          protection_id: string
          protection_level: string
          protection_methods: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          artwork_id?: string | null
          created_at?: string
          file_fingerprint: string
          id?: string
          is_active?: boolean
          metadata?: Json
          original_filename: string
          protected_file_path?: string | null
          protection_id: string
          protection_level?: string
          protection_methods?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          artwork_id?: string | null
          created_at?: string
          file_fingerprint?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          original_filename?: string
          protected_file_path?: string | null
          protection_id?: string
          protection_level?: string
          protection_methods?: Json
          updated_at?: string
          user_id?: string
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
      artwork: {
        Row: {
          ai_protection_enabled: boolean | null
          ai_protection_level: string | null
          ai_protection_methods: Json | null
          blockchain_certificate_id: string | null
          blockchain_hash: string | null
          blockchain_registered_at: string | null
          category: string
          created_at: string
          description: string | null
          enable_blockchain: boolean | null
          enable_watermark: boolean | null
          file_paths: string[]
          id: string
          license_type: string | null
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
          created_at?: string
          description?: string | null
          enable_blockchain?: boolean | null
          enable_watermark?: boolean | null
          file_paths: string[]
          id?: string
          license_type?: string | null
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
          created_at?: string
          description?: string | null
          enable_blockchain?: boolean | null
          enable_watermark?: boolean | null
          file_paths?: string[]
          id?: string
          license_type?: string | null
          protection_record_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
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
      portfolio_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean
          is_resolved: boolean
          message: string
          metadata: Json | null
          portfolio_id: string
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          is_resolved?: boolean
          message: string
          metadata?: Json | null
          portfolio_id: string
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          is_resolved?: boolean
          message?: string
          metadata?: Json | null
          portfolio_id?: string
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
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
      portfolio_monitoring_results: {
        Row: {
          artworks_scanned: number
          created_at: string
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
          created_at?: string
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
          created_at?: string
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
      portfolios: {
        Row: {
          alert_settings: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          monitoring_enabled: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_settings?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          monitoring_enabled?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_settings?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          monitoring_enabled?: boolean
          name?: string
          updated_at?: string
          user_id?: string
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
      realtime_monitoring_stats: {
        Row: {
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
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
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
          plan_id: string
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
          plan_id: string
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
          plan_id?: string
          social_media_addon?: boolean
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
          white_label_enabled?: boolean | null
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
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
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
          schedule_type: string
          execution_time: string
          recurrence_pattern: Json
        }
        Returns: string
      }
      create_free_subscription_for_user: {
        Args: { _user_id: string }
        Returns: undefined
      }
      generate_document_hash: {
        Args: { content: string }
        Returns: string
      }
      get_all_template_download_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          template_id: string
          download_count: number
        }[]
      }
      get_artwork_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_portfolio_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_template_download_count: {
        Args: { template_id_param: string }
        Returns: number
      }
      get_user_subscription: {
        Args: Record<PropertyKey, never>
        Returns: {
          plan_id: string
          status: string
          social_media_addon: boolean
          deepfake_addon: boolean
          is_active: boolean
        }[]
      }
      get_user_white_label_org: {
        Args: Record<PropertyKey, never>
        Returns: {
          org_id: string
          org_name: string
          org_slug: string
          is_owner: boolean
          user_role: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_valid_admin_session: {
        Args: { session_token: string }
        Returns: boolean
      }
      trigger_scheduled_scans: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_has_feature: {
        Args: { feature_name: string }
        Returns: boolean
      }
      user_has_membership: {
        Args: { _user_id: string }
        Returns: boolean
      }
      user_has_white_label_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_admin_token: {
        Args: { token_hash: string }
        Returns: boolean
      }
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
