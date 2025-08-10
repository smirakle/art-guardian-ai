import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateDraftPayload {
  action: "create_draft";
  artworkId: string;
  licensee_name?: string;
  licensee_email?: string;
  license_type: string;
  territory?: string;
  price_cents?: number;
  currency?: string;
  terms_text: string;
}

interface ActivatePayload {
  action: "activate";
  licenseId: string;
}

interface RevokePayload {
  action: "revoke";
  licenseId: string;
  reason?: string;
}

interface ListPayload {
  action: "list";
}

type LicensingRequest = CreateDraftPayload | ActivatePayload | RevokePayload | ListPayload;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Initialize clients
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { 
      auth: { persistSession: false } 
    });

    // Authenticate user
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData?.user) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = userData.user.id;

    const body = (await req.json()) as LicensingRequest;

    switch (body.action) {
      case "create_draft": {
        const payload = body as CreateDraftPayload;

        // Validate required fields
        if (!payload.artworkId || !payload.license_type || !payload.terms_text) {
          return json({ error: "Missing required fields: artworkId, license_type, terms_text" }, 400);
        }

        // Verify artwork ownership
        const { data: artworkRows, error: artErr } = await supabase
          .from("artwork")
          .select("id, user_id")
          .eq("id", payload.artworkId)
          .eq("user_id", userId)
          .single();

        if (artErr || !artworkRows) {
          console.error("Artwork verification failed:", artErr);
          return json({ error: "Artwork not found or not owned by user" }, 403);
        }

        // Generate document hash
        const documentContent = {
          terms: payload.terms_text,
          license_type: payload.license_type,
          territory: payload.territory || "Worldwide",
          artwork_id: payload.artworkId
        };
        const documentHash = await generateHash(JSON.stringify(documentContent));

        // Determine status based on price
        const priceInCents = Number(payload.price_cents) || 0;
        const status = priceInCents > 0 ? "pending_payment" : "draft";

        // Insert license record
        const licenseData = {
          user_id: userId,
          licensor_user_id: userId,
          artwork_id: payload.artworkId,
          file_hash: documentHash,
          hash_algo: "sha256",
          license_type: payload.license_type,
          terms: payload.terms_text,
          terms_text: payload.terms_text,
          licensee_name: payload.licensee_name || null,
          licensee_email: payload.licensee_email || null,
          territory: payload.territory || "Worldwide",
          price_cents: priceInCents,
          currency: (payload.currency || "usd").toLowerCase(),
          status: status,
          document_hash: documentHash,
          usage_scope: {}
        };

        const { data: licenseRow, error: licErr } = await supabase
          .from("licenses")
          .insert(licenseData)
          .select("*")
          .single();

        if (licErr) {
          console.error("License insert failed:", {
            error: licErr,
            data: licenseData
          });
          return json({ 
            error: "Failed to create license", 
            details: licErr.message,
            code: licErr.code 
          }, 500);
        }

        // Log event
        await recordEvent(supabase, licenseRow.id, userId, "created", { status, price_cents: priceInCents });

        return json({ success: true, license: licenseRow });
      }

      case "activate": {
        const { licenseId } = body as ActivatePayload;
        if (!licenseId) {
          return json({ error: "licenseId is required" }, 400);
        }

        // Fetch and verify ownership
        const { data: license, error: fetchErr } = await supabase
          .from("licenses")
          .select("*")
          .eq("id", licenseId)
          .eq("user_id", userId)
          .single();

        if (fetchErr || !license) {
          console.error("License fetch failed:", fetchErr);
          return json({ error: "License not found or access denied" }, 404);
        }

        // Update to active status
        const { data: updatedLicense, error: updateErr } = await supabase
          .from("licenses")
          .update({ 
            status: "active", 
            paid_at: new Date().toISOString() 
          })
          .eq("id", licenseId)
          .select("*")
          .single();

        if (updateErr) {
          console.error("License activation failed:", updateErr);
          return json({ error: "Failed to activate license" }, 500);
        }

        // Generate blockchain proof
        const certificateId = `TSMO-LIC-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const blockchainHash = await simulateBlockchainTransaction(updatedLicense, certificateId);

        // Update with blockchain info
        const { data: finalLicense, error: blockchainErr } = await supabase
          .from("licenses")
          .update({
            blockchain_hash: blockchainHash,
            blockchain_certificate_id: certificateId
          })
          .eq("id", licenseId)
          .select("*")
          .single();

        if (blockchainErr) {
          console.warn("Blockchain info update failed:", blockchainErr);
        }

        // Record events
        await recordEvent(supabase, licenseId, userId, "activated", {});
        await recordEvent(supabase, licenseId, userId, "blockchain_registered", {
          blockchain_hash: blockchainHash,
          certificate_id: certificateId
        });

        const certificate = {
          certificateId,
          blockchainHash,
          timestamp: new Date().toISOString(),
          registrationUrl: `https://tsmowatch.com/certificate/${certificateId}`,
          type: "license"
        };

        return json({ 
          success: true, 
          license: finalLicense || updatedLicense, 
          certificate 
        });
      }

      case "revoke": {
        const { licenseId, reason } = body as RevokePayload;
        if (!licenseId) {
          return json({ error: "licenseId is required" }, 400);
        }

        // Verify ownership and update
        const { data: revokedLicense, error: revokeErr } = await supabase
          .from("licenses")
          .update({ status: "revoked" })
          .eq("id", licenseId)
          .eq("user_id", userId)
          .select("*")
          .single();

        if (revokeErr) {
          console.error("License revoke failed:", revokeErr);
          return json({ error: "Failed to revoke license or access denied" }, 500);
        }

        await recordEvent(supabase, licenseId, userId, "revoked", { reason: reason || null });
        return json({ success: true, license: revokedLicense });
      }

      case "list": {
        const { data: licenses, error: listErr } = await supabase
          .from("licenses")
          .select(`
            *,
            artwork:artwork(id, title)
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (listErr) {
          console.error("License list failed:", listErr);
          return json({ error: "Failed to fetch licenses" }, 500);
        }

        return json({ success: true, licenses: licenses || [] });
      }

      default:
        return json({ error: "Invalid action" }, 400);
    }

  } catch (error: any) {
    console.error("Automated licensing error:", error);
    return json({ 
      error: "Internal server error", 
      details: error?.message || String(error) 
    }, 500);
  }
});

// Helper functions
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function generateHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function simulateBlockchainTransaction(license: any, certificateId: string): Promise<string> {
  // Simulate blockchain transaction delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const transactionData = {
    certificateId,
    licenseId: license.id,
    artworkId: license.artwork_id,
    timestamp: new Date().toISOString(),
    userId: license.user_id
  };
  
  const hash = await generateHash(JSON.stringify(transactionData));
  return `0x${hash.slice(0, 64)}`;
}

async function recordEvent(
  supabase: ReturnType<typeof createClient>,
  licenseId: string,
  userId: string,
  eventType: string,
  data: Record<string, unknown>
) {
  try {
    const { error } = await supabase
      .from("license_events")
      .insert({
        license_id: licenseId,
        user_id: userId,
        event_type: eventType,
        data: data
      });
    
    if (error) {
      console.warn("Failed to record license event:", error);
    }
  } catch (err) {
    console.warn("Event recording error:", err);
  }
}