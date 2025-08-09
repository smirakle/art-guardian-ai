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
  usage_scope?: Record<string, unknown>;
  territory?: string;
  start_date?: string;
  end_date?: string;
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

type Json = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Read incoming JWT from Authorization header
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    // Auth client (for verifying JWT) and service client (for DB writes bypassing RLS)
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    // Enforce auth
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData?.user) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = userData.user.id;

    const body = (await req.json()) as LicensingRequest;

    switch (body.action) {
      case "create_draft": {
        const payload = body as CreateDraftPayload;

        // Basic validation
        if (!payload.artworkId || !payload.license_type || !payload.terms_text) {
          return json({ error: "Missing required fields" }, 400);
        }

        // Ensure artwork belongs to user (defense-in-depth)
        const { data: artworkRows, error: artErr } = await supabase
          .from("artwork")
          .select("id, user_id")
          .eq("id", payload.artworkId)
          .limit(1);
        if (artErr) console.error("artwork fetch error", artErr);
        if (!artworkRows?.length || artworkRows[0].user_id !== userId) {
          return json({ error: "Artwork not found or not owned by user" }, 403);
        }

        const documentHash = await sha256(
          JSON.stringify({
            terms: payload.terms_text,
            license_type: payload.license_type,
            usage: payload.usage_scope ?? {},
            territory: payload.territory ?? "Worldwide",
          })
        );

        const status = (payload.price_cents ?? 0) > 0 ? "pending_payment" : "active";

        const { data: licenseRow, error: licErr } = await supabase
          .from("licenses")
          .insert({
            licensor_user_id: userId,
            artwork_id: payload.artworkId,
            licensee_name: payload.licensee_name ?? null,
            licensee_email: payload.licensee_email ?? null,
            license_type: payload.license_type,
            usage_scope: payload.usage_scope ?? {},
            territory: payload.territory ?? "Worldwide",
            start_date: payload.start_date ?? null,
            end_date: payload.end_date ?? null,
            price_cents: payload.price_cents ?? 0,
            currency: (payload.currency ?? "usd").toLowerCase(),
            status,
            terms_text: payload.terms_text,
            document_hash: documentHash,
          })
          .select("*")
          .single();

        if (licErr) {
          console.error("license insert error", licErr);
          return json({ error: "Failed to create license" }, 500);
        }

        await recordEvent(supabase, licenseRow.id, userId, "created", {
          status,
          price_cents: payload.price_cents ?? 0,
        });

        return json({ success: true, license: licenseRow });
      }

      case "activate": {
        const { licenseId } = body as ActivatePayload;
        if (!licenseId) return json({ error: "licenseId required" }, 400);

        // Fetch and authorize
        const { data: lic, error: getErr } = await supabase
          .from("licenses")
          .select("*")
          .eq("id", licenseId)
          .limit(1)
          .maybeSingle();
        if (getErr) {
          console.error("license fetch error", getErr);
          return json({ error: "Failed to fetch license" }, 500);
        }
        if (!lic || lic.licensor_user_id !== userId) return json({ error: "Not found" }, 404);

        const now = new Date().toISOString();
        const { data: updated, error: updErr } = await supabase
          .from("licenses")
          .update({ status: "active", paid_at: now })
          .eq("id", licenseId)
          .select("*")
          .single();
        if (updErr) {
          console.error("license activate error", updErr);
          return json({ error: "Failed to activate license" }, 500);
        }

        await recordEvent(supabase, licenseId, userId, "activated", {});

        // Register blockchain proof (simulate)
        const timestamp = new Date().toISOString();
        const certificateId = `TSMO-LIC-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const licenseFingerprint = await sha256(
          JSON.stringify({
            license_id: updated.id,
            artwork_id: updated.artwork_id,
            licensor_user_id: updated.licensor_user_id,
            document_hash: updated.document_hash,
            timestamp,
          })
        );

        const txHash = await simulateBlockchainTransaction({
          certificateId,
          licenseFingerprint,
          owner: userId,
          timestamp,
        });

        const ownershipProof = await sha256(
          JSON.stringify({ certificateId, licenseId, userId, timestamp, txHash, nonce: Math.random() })
        );

        const certificate = {
          certificateId,
          blockchainHash: txHash,
          timestamp,
          licenseFingerprint,
          ownershipProof,
          registrationUrl: `https://tsmowatch.com/certificate/${certificateId}`,
          type: "license",
        } satisfies Json;

        // Persist certificate (if table exists)
        const { error: certErr } = await supabase.from("blockchain_certificates").insert({
          certificate_id: certificateId,
          artwork_id: updated.artwork_id,
          user_id: userId,
          blockchain_hash: txHash,
          artwork_fingerprint: licenseFingerprint,
          ownership_proof: ownershipProof,
          registration_timestamp: timestamp,
          certificate_data: certificate as unknown as Record<string, unknown>,
          status: "registered",
        });
        if (certErr) console.warn("blockchain_certificates insert warn", certErr?.message);

        // Update license with proof
        const { data: finalLic, error: setErr } = await supabase
          .from("licenses")
          .update({ blockchain_hash: txHash, blockchain_certificate_id: certificateId })
          .eq("id", licenseId)
          .select("*")
          .single();
        if (setErr) console.error("license update blockchain error", setErr);

        await recordEvent(supabase, licenseId, userId, "blockchain_registered", {
          blockchain_hash: txHash,
          certificate_id: certificateId,
        });

        return json({ success: true, license: finalLic, certificate });
      }

      case "revoke": {
        const { licenseId, reason } = body as RevokePayload;
        if (!licenseId) return json({ error: "licenseId required" }, 400);

        // Authorize
        const { data: lic, error: getErr } = await supabase
          .from("licenses")
          .select("id, licensor_user_id")
          .eq("id", licenseId)
          .maybeSingle();
        if (getErr) return json({ error: "Failed to fetch license" }, 500);
        if (!lic || lic.licensor_user_id !== userId) return json({ error: "Not found" }, 404);

        const { data: updated, error: updErr } = await supabase
          .from("licenses")
          .update({ status: "revoked" })
          .eq("id", licenseId)
          .select("*")
          .single();
        if (updErr) return json({ error: "Failed to revoke license" }, 500);

        await recordEvent(supabase, licenseId, userId, "revoked", { reason: reason ?? null });
        return json({ success: true, license: updated });
      }

      case "list": {
        const { data: rows, error } = await supabase
          .from("licenses")
          .select("*, artwork:artwork(id, title)")
          .eq("licensor_user_id", userId)
          .order("created_at", { ascending: false });
        if (error) return json({ error: "Failed to list licenses" }, 500);
        return json({ success: true, licenses: rows });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e: any) {
    console.error("automated-licensing error", e);
    return json({ error: "Internal error", details: e?.message ?? String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function simulateBlockchainTransaction(data: Record<string, unknown>): Promise<string> {
  const hash = await sha256(JSON.stringify(data));
  await new Promise((r) => setTimeout(r, 800));
  return `0x${hash.slice(0, 64)}`;
}

async function recordEvent(
  supabase: ReturnType<typeof createClient>,
  licenseId: string,
  userId: string,
  event_type: string,
  data: Record<string, unknown>
) {
  const { error } = await supabase.from("license_events").insert({
    license_id: licenseId,
    user_id: userId,
    event_type,
    data,
  });
  if (error) console.warn("license event insert warn", error.message);
}
