/* ============================================================
   TSMO AI Protection – Adobe UXP Plugin v2.0.0
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
const PLUGIN_VERSION = "2.0.0";

// ── State ────────────────────────────────────────────────────
let authToken = null;
let userEmail = null;
let userTier = "basic";
let lastProtectionId = null;

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
    // Try Web Crypto first
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
    // Fallback for Illustrator or no document
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

    // Store for session persistence
    try { localStorage.setItem("tsmo_token", authToken); } catch (_) {}
    try { localStorage.setItem("tsmo_email", userEmail); } catch (_) {}

    // Fetch subscription tier
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
    $("tier-indicator").textContent = "Pro Protection • Full Suite";
    $("btn-upgrade").style.display = "none";
  } else {
    badge.textContent = "Basic";
    badge.className = "badge badge-basic";
    $("tier-indicator").textContent = "Basic Protection • Metadata Only";
    $("btn-upgrade").style.display = "block";
  }
}

function logout() {
  authToken = null;
  userEmail = null;
  userTier = "basic";
  lastProtectionId = null;
  try { localStorage.removeItem("tsmo_token"); } catch (_) {}
  try { localStorage.removeItem("tsmo_email"); } catch (_) {}
  $("protection-status").style.display = "none";
  $("verify-status").style.display = "none";
  showScreen("login");
}

// ── Protection ───────────────────────────────────────────────
async function protectDocument() {
  $("btn-protect").disabled = true;
  $("btn-protect").innerHTML = '<span class="shield-icon">⏳</span> Protecting...';
  setStatus("Analyzing document...", "loading");

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
              caption: "TSMO Protected | ID: " + lastProtectionId,
              copyrightNotice: "Protected by TSMO AI Protection v" + PLUGIN_VERSION,
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

    setStatus("✅ Document protected successfully! ID: " + lastProtectionId, "success");
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

    if (result.verified || result.is_protected) {
      el.className = "verify-status status-success";
      el.textContent = "✅ Protection verified — " + (result.protectionId || result.protection_id || protectionId);
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
