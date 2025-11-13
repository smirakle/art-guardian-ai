import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Scheduled Document Scanner function started");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Checking for scheduled scans...");

    // Get all active schedules that are due for execution
    const { data: dueSchedules, error: scheduleError } = await supabase
      .from("scheduled_document_monitoring")
      .select("*")
      .eq("is_active", true)
      .lte("next_execution", new Date().toISOString())
      .order("next_execution", { ascending: true });

    if (scheduleError) {
      console.error("Error fetching schedules:", scheduleError);
      throw scheduleError;
    }

    if (!dueSchedules || dueSchedules.length === 0) {
      console.log("No scheduled scans due at this time");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No scheduled scans due",
          executedCount: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${dueSchedules.length} scheduled scans to execute`);

    let executedCount = 0;
    const errors = [];

    // Execute each scheduled scan
    for (const schedule of dueSchedules) {
      try {
        console.log(`Executing scheduled scan ${schedule.id}`);

        // Get protection record details if specified
        let documentContent = null;
        if (schedule.protection_record_id) {
          const { data: protectionRecord } = await supabase
            .from("ai_protection_records")
            .select("metadata, word_count")
            .eq("id", schedule.protection_record_id)
            .single();

          if (protectionRecord?.metadata?.original_text) {
            documentContent = protectionRecord.metadata.original_text;
          }
        }

        // Create a new monitoring session
        const { data: session, error: sessionError } = await supabase
          .from("document_monitoring_sessions")
          .insert({
            user_id: schedule.user_id,
            protection_record_id: schedule.protection_record_id,
            platforms: schedule.platforms,
            status: "in_progress",
            started_at: new Date().toISOString(),
            metadata: {
              scheduled_scan: true,
              schedule_id: schedule.id,
              schedule_type: schedule.schedule_type
            }
          })
          .select()
          .single();

        if (sessionError) {
          throw new Error(`Failed to create session: ${sessionError.message}`);
        }

        console.log(`Created monitoring session ${session.id}`);

        // Trigger the document monitoring engine
        const { error: engineError } = await supabase.functions.invoke(
          "document-monitoring-engine",
          {
            body: { sessionId: session.id }
          }
        );

        if (engineError) {
          console.error(`Engine error for session ${session.id}:`, engineError);
          throw engineError;
        }

        // Update the schedule with execution info
        const { error: updateError } = await supabase
          .from("scheduled_document_monitoring")
          .update({
            last_executed: new Date().toISOString(),
            total_executions: schedule.total_executions + 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", schedule.id);

        if (updateError) {
          console.error("Error updating schedule:", updateError);
        }

        executedCount++;
        console.log(`Successfully executed scheduled scan ${schedule.id}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error executing schedule ${schedule.id}:`, errorMessage);
        errors.push({
          scheduleId: schedule.id,
          error: errorMessage
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        executedCount,
        totalSchedules: dueSchedules.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Executed ${executedCount} of ${dueSchedules.length} scheduled scans`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in scheduled scanner:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
