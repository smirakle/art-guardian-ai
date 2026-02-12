/* ============================================================
   TSMO AI Protection – Adobe UXP Plugin v2.1.0
   C2PA Content Credentials Integration
   ============================================================ */

// ── Polyfills (UXP lacks native TextEncoder/TextDecoder) ─────
if (typeof TextEncoder === "undefined") {
  globalThis.TextEncoder = class {
    encode(str) {
      const arr = [];
      for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c < 0x80) arr.push(c);
        else if (c < 0x800) { arr.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
        else { arr.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
      }
      return new Uint8Array(arr);
    }
  };
}
if (typeof TextDecoder === "undefined") {
  globalThis.TextDecoder = class {
    decode(buf) {
      const bytes = new Uint8Array(buf);
      let s = "";
      for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      return s;
    }
  };
}

// ── Constants ────────────────────────────────────────────────
const API_URL = "https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/adobe-plugin-api";
const SUPABASE_URL = "https://utneaqmbyjwxaqrrarpc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bmVhcW1ieWp3eGFxcnJhcnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzAzNzIsImV4cCI6MjA2ODAwNjM3Mn0.bYhOQUFOxVqXXPpF9WGHtILKfmHTOzUcbGmZ5-RIzxI";
const SIGN_C2PA_URL = "https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/sign-c2pa-manifest";
const EMBED_C2PA_URL = "https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/embed-c2pa-manifest";
const PLUGIN_VERSION = "2.1.0";

// ── State ────────────────────────────────────────────────────
let authToken = null;
let userEmail = null;
let userTier = "basic";
let lastProtectionId = null;
let lastC2PAResult = null;

// ── DOM refs ─────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// ── Helpers ──────────────────────────────────────────────────
function openExternal(url) {
  try {
    if (typeof require !== "undefined") {
      const uxp = require("uxp");
      uxp.shell.openExternal(url);
    } else {
      window.open(url, "_blank");
    }
  } catch (e) {
    console.error("openExternal failed:", e);
  }
}

function showScreen(screen) {
  $("login-screen").style.display = screen === "login" ? "block" : "none";
  $("main-panel").style.display = screen === "main" ? "block" : "none";
}

function setStatus(msg, type) {
  const el = $("status-message");
  const section = $("protection-status");
  section.style.display = "block";
  el.textContent = msg;
  el.className = "status-message status-" + type;
  if (type === "success") $("post-protect-actions").style.display = "block";
  else $("post-protect-actions").style.display = "none";
}

function setC2PAStatus(status, details) {
  const section = $("c2pa-status");
  const badge = $("c2pa-badge");
  const statusText = $("c2pa-status-text");
  const detailsEl = $("c2pa-details-content");

  section.style.display = "block";

  if (status === "pending") {
    statusText.textContent = "Content Credentials: Signing...";
    statusText.className = "c2pa-status-text c2pa-pending";
    badge.style.display = "none";
    detailsEl.textContent = "";
  } else if (status === "applied") {
    statusText.textContent = "Content Credentials: Applied ✓";
    statusText.className = "c2pa-status-text c2pa-applied";
    badge.style.display = "inline-block";
    badge.textContent = "C2PA";
    if (details) {
      detailsEl.textContent =
        "Algorithm: " + (details.algorithm || "ES256") + "\n" +
        "Manifest Hash: " + (details.manifestHash || "N/A") + "\n" +
        "JUMBF Size: " + (details.jumbfSize || "N/A") + " bytes";
    }
  } else if (status === "failed") {
    statusText.textContent = "Content Credentials: Failed";
    statusText.className = "c2pa-status-text c2pa-failed";
    badge.style.display = "none";
    if (details) {
      detailsEl.textContent = "Error: " + (details.error || "Unknown error");
    }
  } else {
    section.style.display = "none";
  }
}

// ── FNV-1a Hash ──────────────────────────────────────────────
function fnv1aHash(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

async function calculateDocumentHash() {
  try {
    const ps = require("photoshop");
    const doc = ps.app.activeDocument;
    if (!doc) throw new Error("No active document");
    const raw = [doc.name, doc.width, doc.height, doc.resolution, doc.mode].join("|");
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(raw);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (_) {
      return fnv1aHash(raw);
    }
  } catch (e) {
    return fnv1aHash("tsmo-" + Date.now());
  }
}

// ── API Calls ────────────────────────────────────────────────
async function apiCall(body) {
  const headers = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
  };
  if (authToken) headers["Authorization"] = "Bearer " + authToken;

  const res = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...body, plugin_version: PLUGIN_VERSION }),
  });
  return res.json();
}

// ── C2PA Content Credentials ─────────────────────────────────

/**
 * Export the active Photoshop document as a temporary JPEG.
 * Returns { file, bytes } where file is the UXP File entry.
 */
async function exportDocumentAsJPEG() {
  const ps = require("photoshop");
  const { core } = require("photoshop");
  const uxp = require("uxp");
  const fs = uxp.storage.localFileSystem;

  const doc = ps.app.activeDocument;
  if (!doc) throw new Error("No active document");

  // Get a temp folder from UXP
  const tempFolder = await fs.getTemporaryFolder();
  const tempFile = await tempFolder.createFile("tsmo_c2pa_export.jpg", { overwrite: true });

  // Export as JPEG via batchPlay
  await core.executeAsModal(async () => {
    const batchPlay = ps.action.batchPlay;
    await batchPlay(
      [{
        _obj: "save",
        as: {
          _obj: "JPEG",
          extendedQuality: 95,
          matteColor: { _enum: "matteColor", _value: "none" },
        },
        in: { _path: tempFile.nativePath, _kind: "local" },
        copy: true,
        lowerCase: true,
        saveStage: { _enum: "saveStageType", _value: "saveBegin" },
      }],
      { synchronousExecution: false }
    );
  }, { commandName: "TSMO C2PA Export" });

  // Read the exported file bytes
  const fileBytes = await tempFile.read({ format: uxp.storage.formats.binary });
  return { file: tempFile, bytes: new Uint8Array(fileBytes), name: doc.name };
}

/**
 * Build the C2PA claim manifest JSON for the document.
 */
function buildC2PAClaim(docName, fileHash, protectionId) {
  return {
    "dc:title": docName,
    "dc:format": "image/jpeg",
    "c2pa.actions": [
      {
        action: "c2pa.created",
        softwareAgent: "TSMO AI Protection v" + PLUGIN_VERSION,
        when: new Date().toISOString(),
      },
      {
        action: "c2pa.edited",
        softwareAgent: "Adobe Photoshop (UXP Plugin)",
        when: new Date().toISOString(),
      },
    ],
    "c2pa.hash.data": [
      {
        name: "jumbf manifest",
        alg: "sha256",
        hash: fileHash,
      },
    ],
    "stds:schema": "http://c2pa.org/manifest/2",
    "tsmo:protectionId": protectionId,
    "tsmo:protectedBy": "TSMO Technology Inc.",
    "tsmo:pluginVersion": PLUGIN_VERSION,
  };
}

/**
 * Sign the C2PA manifest via the edge function.
 * Returns { signature, manifestHash, algorithm, certificateFingerprint }.
 */
async function signC2PAManifest(manifestJson) {
  const headers = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
  };
  if (authToken) headers["Authorization"] = "Bearer " + authToken;

  const res = await fetch(SIGN_C2PA_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ manifest: manifestJson }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Signing failed" }));
    throw new Error(err.error || "C2PA signing failed (HTTP " + res.status + ")");
  }

  return res.json();
}

/**
 * Embed the C2PA manifest into the image file via the edge function.
 * Returns the protected image bytes.
 */
async function embedC2PAManifest(imageBytes, fileName, manifestJson, signatureB64) {
  const formData = new FormData();

  // Create a Blob from the image bytes
  const blob = new Blob([imageBytes], { type: "image/jpeg" });
  formData.append("file", blob, fileName);
  formData.append("manifest", manifestJson);
  formData.append("signature", signatureB64);

  const headers = {
    apikey: SUPABASE_ANON_KEY,
  };
  if (authToken) headers["Authorization"] = "Bearer " + authToken;

  const res = await fetch(EMBED_C2PA_URL, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Embedding failed" }));
    throw new Error(err.error || "C2PA embedding failed (HTTP " + res.status + ")");
  }

  const jumbfSize = res.headers.get("X-C2PA-JUMBF-Size");
  const protectedBytes = new Uint8Array(await res.arrayBuffer());
  return { protectedBytes, jumbfSize };
}

/**
 * Place the C2PA-protected image back into the document as a new layer.
 */
async function placeProtectedImage(fileBytes) {
  try {
    const ps = require("photoshop");
    const { core } = require("photoshop");
    const uxp = require("uxp");
    const fs = uxp.storage.localFileSystem;

    const tempFolder = await fs.getTemporaryFolder();
    const protectedFile = await tempFolder.createFile("tsmo_c2pa_protected.jpg", { overwrite: true });
    await protectedFile.write(fileBytes, { format: uxp.storage.formats.binary });

    await core.executeAsModal(async () => {
      const batchPlay = ps.action.batchPlay;
      await batchPlay(
        [{
          _obj: "placeEvent",
          null: { _path: protectedFile.nativePath, _kind: "local" },
          freeTransformCenterState: { _enum: "quadCenterState", _value: "QCSAverage" },
          offset: { _obj: "offset", horizontal: { _unit: "pixelsUnit", _value: 0 }, vertical: { _unit: "pixelsUnit", _value: 0 } },
        }],
        { synchronousExecution: false }
      );

      // Rename the placed layer
      await batchPlay(
        [{
          _obj: "setd",
          _target: [{ _ref: "layer", _enum: "ordinal", _value: "targetEnum" }],
          to: { _obj: "layer", name: "TSMO C2PA Protected" },
        }],
        { synchronousExecution: false }
      );
    }, { commandName: "TSMO C2PA Layer" });

    return true;
  } catch (e) {
    console.warn("Could not place C2PA layer:", e.message);
    return false;
  }
}

/**
 * Full C2PA pipeline: export → sign → embed → place.
 * Non-blocking: failures don't prevent XMP protection from succeeding.
 */
async function applyC2PA(fileHash, protectionId, docName) {
  setC2PAStatus("pending");

  try {
    // Step 1: Export document as JPEG
    console.log("[C2PA] Exporting document...");
    const exported = await exportDocumentAsJPEG();

    // Step 2: Build claim
    const claim = buildC2PAClaim(docName, fileHash, protectionId);
    const manifestJson = JSON.stringify(claim);

    // Step 3: Sign the manifest
    console.log("[C2PA] Signing manifest...");
    const signResult = await signC2PAManifest(manifestJson);
    const signatureB64 = signResult.signature || signResult.signatureB64;

    if (!signatureB64) {
      throw new Error("No signature returned from signing service");
    }

    // Step 4: Embed into image
    console.log("[C2PA] Embedding JUMBF...");
    const embedResult = await embedC2PAManifest(
      exported.bytes,
      exported.name || "document.jpg",
      manifestJson,
      signatureB64
    );

    // Step 5: Place protected image as new layer
    console.log("[C2PA] Placing protected layer...");
    const placed = await placeProtectedImage(embedResult.protectedBytes);

    // Step 6: Save the protected file to temp for user access
    try {
      const uxp = require("uxp");
      const fs = uxp.storage.localFileSystem;
      const tempFolder = await fs.getTemporaryFolder();
      const savedFile = await tempFolder.createFile("tsmo_c2pa_" + (docName || "protected") + ".jpg", { overwrite: true });
      await savedFile.write(embedResult.protectedBytes, { format: uxp.storage.formats.binary });
      console.log("[C2PA] Protected file saved:", savedFile.nativePath);
    } catch (saveErr) {
      console.warn("[C2PA] Could not save protected file:", saveErr.message);
    }

    lastC2PAResult = {
      algorithm: signResult.algorithm || "ES256",
      manifestHash: signResult.manifestHash || signResult.manifest_hash || "N/A",
      jumbfSize: embedResult.jumbfSize || "N/A",
      certificateFingerprint: signResult.certificateFingerprint || signResult.certificate_fingerprint,
      layerPlaced: placed,
    };

    setC2PAStatus("applied", lastC2PAResult);
    console.log("[C2PA] Content Credentials applied successfully");
    return true;

  } catch (e) {
    console.error("[C2PA] Failed:", e.message);
    setC2PAStatus("failed", { error: e.message });
    return false;
  }
}

// ── Auth ─────────────────────────────────────────────────────
async function signIn() {
  const email = $("login-email").value.trim();
  const password = $("login-password").value;
  if (!email || !password) {
    $("login-error").textContent = "Please enter email and password";
    return;
  }

  $("btn-signin").disabled = true;
  $("btn-signin").textContent = "Signing in...";
  $("login-error").textContent = "";

  try {
    const res = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.error || !data.access_token) {
      throw new Error(data.error_description || data.msg || "Login failed");
    }

    authToken = data.access_token;
    userEmail = data.user?.email || email;

    try { localStorage.setItem("tsmo_token", authToken); } catch (_) {}
    try { localStorage.setItem("tsmo_email", userEmail); } catch (_) {}

    await fetchUserTier();
    enterMainPanel();
  } catch (e) {
    $("login-error").textContent = e.message || "Sign in failed";
  } finally {
    $("btn-signin").disabled = false;
    $("btn-signin").textContent = "Sign In";
  }
}

async function fetchUserTier() {
  try {
    const data = await apiCall({ action: "get_status" });
    userTier = data.tier || data.subscription_tier || "basic";
  } catch (_) {
    userTier = "basic";
  }
}

function enterMainPanel() {
  showScreen("main");
  $("user-email").textContent = userEmail || "";
  const badge = $("user-badge");
  if (userTier === "pro" || userTier === "professional") {
    badge.textContent = "Pro";
    badge.className = "badge badge-pro";
    $("tier-indicator").textContent = "Pro Protection • Full Suite + C2PA";
    $("btn-upgrade").style.display = "none";
  } else {
    badge.textContent = "Basic";
    badge.className = "badge badge-basic";
    $("tier-indicator").textContent = "Basic Protection • Metadata + C2PA";
    $("btn-upgrade").style.display = "block";
  }
}

function logout() {
  authToken = null;
  userEmail = null;
  userTier = "basic";
  lastProtectionId = null;
  lastC2PAResult = null;
  try { localStorage.removeItem("tsmo_token"); } catch (_) {}
  try { localStorage.removeItem("tsmo_email"); } catch (_) {}
  $("protection-status").style.display = "none";
  $("verify-status").style.display = "none";
  $("c2pa-status").style.display = "none";
  showScreen("login");
}

// ── Protection ───────────────────────────────────────────────
async function protectDocument() {
  $("btn-protect").disabled = true;
  $("btn-protect").innerHTML = '<span class="shield-icon">⏳</span> Protecting...';
  setStatus("Analyzing document...", "loading");
  setC2PAStatus("hidden");

  try {
    const fileHash = await calculateDocumentHash();

    let docName = "Untitled";
    try {
      const ps = require("photoshop");
      docName = ps.app.activeDocument?.name || "Untitled";
    } catch (_) {}

    const result = await apiCall({
      action: "protect",
      fileHash,
      fileName: docName,
      protectionLevel: userTier === "pro" || userTier === "professional" ? "pro" : "basic",
    });

    if (result.error) {
      if (result.code === "UPGRADE_REQUIRED") {
        setStatus("Pro feature — upgrade required", "error");
        return;
      }
      throw new Error(result.error);
    }

    lastProtectionId = result.protectionId || result.protection_id;

    // Inject XMP metadata via batchPlay
    try {
      const ps = require("photoshop");
      const { core } = require("photoshop");
      await core.executeAsModal(async () => {
        const batchPlay = require("photoshop").action.batchPlay;
        await batchPlay(
          [{
            _obj: "setd",
            _target: [{ _ref: "property", _property: "fileInfo" }],
            to: {
              _obj: "fileInfo",
              caption: "TSMO Protected | ID: " + lastProtectionId + " | C2PA Enabled",
              copyrightNotice: "Protected by TSMO AI Protection v" + PLUGIN_VERSION + " with C2PA Content Credentials",
              marked: true,
            },
          }],
          { synchronousExecution: false }
        );
      }, { commandName: "TSMO Protection" });
    } catch (e) {
      console.log("XMP injection skipped:", e.message);
    }

    // Store protection ID locally
    try { localStorage.setItem("tsmo_lastProtectionId", lastProtectionId); } catch (_) {}

    setStatus("✅ Document protected! ID: " + lastProtectionId, "success");

    // Apply C2PA Content Credentials (non-blocking — protection already succeeded)
    await applyC2PA(fileHash, lastProtectionId, docName);

  } catch (e) {
    setStatus("❌ " + (e.message || "Protection failed"), "error");
  } finally {
    $("btn-protect").disabled = false;
    $("btn-protect").innerHTML = '<span class="shield-icon">🛡️</span> Protect Current Document';
  }
}

// ── Verify ───────────────────────────────────────────────────
async function verifyProtection() {
  const el = $("verify-status");
  el.style.display = "block";
  el.className = "verify-status status-loading";
  el.textContent = "Verifying...";

  try {
    const fileHash = await calculateDocumentHash();
    const protectionId = lastProtectionId ||
      (function () { try { return localStorage.getItem("tsmo_lastProtectionId"); } catch (_) { return null; } })();

    const result = await apiCall({
      action: "verify",
      fileHash,
      protectionId,
    });

    const verified = result.verified || result.is_protected || result.verificationResult?.isProtected;
    if (verified) {
      const verifiedId = result.protectionId || result.protection_id || result.verificationResult?.protectionId || protectionId;
      el.className = "verify-status status-success";
      el.textContent = "✅ Protection verified — " + verifiedId;
    } else {
      el.className = "verify-status status-error";
      el.textContent = "⚠️ No protection found for this document";
    }
  } catch (e) {
    el.className = "verify-status status-error";
    el.textContent = "❌ Verification failed: " + (e.message || "Unknown error");
  }
}

// ── Save to Account ──────────────────────────────────────────
async function saveToAccount() {
  $("btn-save-account").disabled = true;
  $("btn-save-account").textContent = "Saving...";

  try {
    let docName = "Untitled";
    try {
      const ps = require("photoshop");
      docName = ps.app.activeDocument?.name || "Untitled";
    } catch (_) {}

    const result = await apiCall({
      action: "save_to_portfolio",
      protectionId: lastProtectionId,
      title: docName.replace(/\.[^.]+$/, ""),
      category: "digital_art",
      c2pa_applied: !!lastC2PAResult,
    });

    if (result.error) throw new Error(result.error);
    $("btn-save-account").textContent = "✅ Saved!";
  } catch (e) {
    $("btn-save-account").textContent = "❌ Save Failed";
    console.error("Save failed:", e);
  } finally {
    setTimeout(() => {
      $("btn-save-account").disabled = false;
      $("btn-save-account").textContent = "💾 Save to TSMO Account";
    }, 3000);
  }
}

// ── Event Listeners ──────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Auth
  $("btn-signin").addEventListener("click", signIn);
  $("login-password").addEventListener("keydown", (e) => { if (e.key === "Enter") signIn(); });
  $("btn-logout").addEventListener("click", logout);

  // Create Account
  $("btn-create-account").addEventListener("click", () => {
    openExternal("https://www.tsmowatch.com/auth?tab=signup");
  });

  // Help
  $("link-help").addEventListener("click", (e) => {
    e.preventDefault();
    openExternal("https://www.tsmowatch.com/support");
  });

  // Protection
  $("btn-protect").addEventListener("click", protectDocument);
  $("btn-verify").addEventListener("click", verifyProtection);
  $("btn-save-account").addEventListener("click", saveToAccount);

  // C2PA details toggle
  $("c2pa-details-toggle").addEventListener("click", () => {
    const content = $("c2pa-details-content");
    const toggle = $("c2pa-details-toggle");
    if (content.style.display === "none" || !content.style.display) {
      content.style.display = "block";
      toggle.textContent = "▾ Hide Technical Details";
    } else {
      content.style.display = "none";
      toggle.textContent = "▸ Technical Details";
    }
  });

  // Upgrade
  $("btn-upgrade").addEventListener("click", () => {
    const emailParam = userEmail ? "&email=" + encodeURIComponent(userEmail) : "";
    openExternal("https://www.tsmowatch.com/pricing?source=adobe_plugin" + emailParam);
  });

  // View in TSMO Watch
  $("btn-view-tsmo").addEventListener("click", () => {
    openExternal("https://www.tsmowatch.com");
  });

  // Footer homepage link
  $("link-homepage").addEventListener("click", (e) => {
    e.preventDefault();
    openExternal("https://www.tsmowatch.com");
  });

  // Restore session
  try {
    const savedToken = localStorage.getItem("tsmo_token");
    const savedEmail = localStorage.getItem("tsmo_email");
    if (savedToken && savedEmail) {
      authToken = savedToken;
      userEmail = savedEmail;
      fetchUserTier().then(enterMainPanel);
      return;
    }
  } catch (_) {}

  showScreen("login");
});
