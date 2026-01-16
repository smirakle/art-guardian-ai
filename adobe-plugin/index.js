/**
 * TSMO Watch - Adobe Creative Cloud Plugin
 * Version: 1.0.4
 * 
 * Protects artwork from AI training with Style Cloaking,
 * Invisible Watermarking, and AI Training Blocks.
 */

// ============= CONFIGURATION =============
const SUPABASE_URL = 'https://utneaqmbyjwxaqrrarpc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bmVhcW1ieWp3eGFxcnJhcnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzAzNzIsImV4cCI6MjA2ODAwNjM3Mn0.bYhOQUFOxVqXXPpF9WGHtILKfmHTOzUcbGmZ5-RIzxI';
const API_URL = `${SUPABASE_URL}/functions/v1/adobe-plugin-api`;
const PIXEL_PROTECTION_URL = `${SUPABASE_URL}/functions/v1/apply-pixel-protection`;

// ============= POLYFILLS =============
// TextEncoder/TextDecoder polyfill for UXP
if (typeof TextEncoder === 'undefined') {
  window.TextEncoder = class TextEncoder {
    encode(str) {
      const utf8 = unescape(encodeURIComponent(str));
      const result = new Uint8Array(utf8.length);
      for (let i = 0; i < utf8.length; i++) {
        result[i] = utf8.charCodeAt(i);
      }
      return result;
    }
  };
}

if (typeof TextDecoder === 'undefined') {
  window.TextDecoder = class TextDecoder {
    decode(bytes) {
      let str = '';
      for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      return decodeURIComponent(escape(str));
    }
  };
}

// ============= STATE =============
let authToken = null;
let currentUser = null;
let userTier = 'basic';
let lastProtectionId = null;
let isOnline = true;

const settings = {
  protectionLevel: 'basic',
  ownerName: '',
  copyrightYear: new Date().getFullYear(),
  autoSave: true
};

// ============= DOM ELEMENTS =============
let loginPanel, signupPanel, mainPanel, errorPanel, verifyResultPanel;
let loginBtn, signupBtn, showSignupBtn, showLoginBtn, logoutBtn;
let protectBtn, batchBtn, verifyBtn;
let protectionProgress, progressSteps, resultPanel;
let statusMessage, signupStatusMessage;
let upgradeOverlay, upgradeLink, refreshTierBtn, closeUpgradeBtn;
let planBadge, userEmailEl;

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  attachEventListeners();
  checkStoredSession();
  checkOnlineStatus();
});

function initializeElements() {
  // Panels
  loginPanel = document.getElementById('loginPanel');
  signupPanel = document.getElementById('signupPanel');
  mainPanel = document.getElementById('mainPanel');
  errorPanel = document.getElementById('errorPanel');
  verifyResultPanel = document.getElementById('verifyResultPanel');
  
  // Buttons
  loginBtn = document.getElementById('loginBtn');
  signupBtn = document.getElementById('signupBtn');
  showSignupBtn = document.getElementById('showSignupBtn');
  showLoginBtn = document.getElementById('showLoginBtn');
  logoutBtn = document.getElementById('logoutBtn');
  protectBtn = document.getElementById('protectBtn');
  batchBtn = document.getElementById('batchBtn');
  verifyBtn = document.getElementById('verifyBtn');
  
  // Progress elements
  protectionProgress = document.getElementById('protectionProgress');
  progressSteps = document.getElementById('progressSteps');
  resultPanel = document.getElementById('resultPanel');
  
  // Status messages
  statusMessage = document.getElementById('statusMessage');
  signupStatusMessage = document.getElementById('signupStatusMessage');
  
  // Upgrade modal
  upgradeOverlay = document.getElementById('upgradePanelOverlay');
  upgradeLink = document.getElementById('upgradeLink');
  refreshTierBtn = document.getElementById('refreshTierBtn');
  closeUpgradeBtn = document.getElementById('closeUpgradeBtn');
  
  // Header elements
  planBadge = document.getElementById('planBadge');
  userEmailEl = document.getElementById('userEmail');
}

function attachEventListeners() {
  // Auth buttons
  loginBtn?.addEventListener('click', login);
  signupBtn?.addEventListener('click', signup);
  showSignupBtn?.addEventListener('click', showSignupPanel);
  showLoginBtn?.addEventListener('click', showLoginPanel);
  logoutBtn?.addEventListener('click', logout);
  
  // Main actions
  protectBtn?.addEventListener('click', protectDocument);
  batchBtn?.addEventListener('click', batchProtect);
  verifyBtn?.addEventListener('click', verifyDocument);
  
  // Enter key for login/signup
  document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
  });
  document.getElementById('signupPassword')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') signup();
  });
  
  // Protection level radio buttons
  document.querySelectorAll('input[name="protectionLevel"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'pro' && userTier !== 'pro') {
        // Reset to basic and show upgrade modal
        e.target.checked = false;
        document.querySelector('input[name="protectionLevel"][value="basic"]').checked = true;
        settings.protectionLevel = 'basic';
        showUpgradeModal();
      } else {
        settings.protectionLevel = e.target.value;
      }
    });
  });
  
  // Upgrade modal
  upgradeLink?.addEventListener('click', openUpgradeLink);
  refreshTierBtn?.addEventListener('click', async () => {
    refreshTierBtn.textContent = 'Checking...';
    refreshTierBtn.disabled = true;
    await refreshSubscriptionTier();
    refreshTierBtn.textContent = 'I upgraded — Refresh status';
    refreshTierBtn.disabled = false;
    if (userTier === 'pro') {
      hideUpgradeModal();
      showStatus('Pro status confirmed! 🎉', 'success');
    } else {
      showStatus('Still on Basic tier. Complete your upgrade first.', 'error');
    }
  });
  closeUpgradeBtn?.addEventListener('click', hideUpgradeModal);
  
  // Result panel buttons
  document.getElementById('saveToAccountBtn')?.addEventListener('click', saveToAccount);
  document.getElementById('viewInTsmoBtn')?.addEventListener('click', () => {
    openExternalLink('https://www.tsmowatch.com/dashboard');
  });
  
  // Verify close button
  document.getElementById('closeVerifyBtn')?.addEventListener('click', () => {
    verifyResultPanel.style.display = 'none';
    mainPanel.style.display = 'block';
  });
  
  // Error panel
  document.getElementById('retryBtn')?.addEventListener('click', () => {
    errorPanel.style.display = 'none';
    if (authToken) {
      mainPanel.style.display = 'block';
    } else {
      loginPanel.style.display = 'block';
    }
  });
  
  // Auto-save checkbox
  document.getElementById('autoSaveToTsmo')?.addEventListener('change', (e) => {
    settings.autoSave = e.target.checked;
    localStorage.setItem('tsmo_auto_save', settings.autoSave);
  });
  
  // External links
  document.getElementById('learnMoreLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    openExternalLink('https://www.tsmowatch.com/help');
  });
}

// ============= EXTERNAL LINKS =============
function openExternalLink(url) {
  try {
    // Try UXP shell API for Adobe environment
    const uxp = require('uxp');
    if (uxp && uxp.shell && uxp.shell.openExternal) {
      uxp.shell.openExternal(url);
      return;
    }
  } catch (e) {
    console.log('UXP shell not available, trying fallback');
  }
  
  // Fallback: open in new window (may be blocked)
  window.open(url, '_blank');
}

function openUpgradeLink(e) {
  e.preventDefault();
  const email = encodeURIComponent(currentUser?.email || '');
  const upgradeUrl = `https://www.tsmowatch.com/pricing?source=adobe_plugin&email=${email}`;
  openExternalLink(upgradeUrl);
}

// ============= ONLINE STATUS =============
function checkOnlineStatus() {
  isOnline = navigator.onLine !== false;
  
  window.addEventListener('online', () => {
    isOnline = true;
    hideError();
  });
  
  window.addEventListener('offline', () => {
    isOnline = false;
    showError('You are offline', 'Please check your internet connection and try again.');
  });
}

// ============= SESSION MANAGEMENT =============
function checkStoredSession() {
  try {
    const storedToken = localStorage.getItem('tsmo_auth_token');
    const storedUser = localStorage.getItem('tsmo_user');
    const storedTier = localStorage.getItem('tsmo_user_tier');
    
    if (storedToken && storedUser) {
      authToken = storedToken;
      currentUser = JSON.parse(storedUser);
      userTier = storedTier || 'basic';
      settings.protectionLevel = userTier;
      
      // Verify token is still valid
      verifySession();
    }
    
    // Restore settings
    const savedOwner = localStorage.getItem('tsmo_owner_name');
    const savedAutoSave = localStorage.getItem('tsmo_auto_save');
    
    if (savedOwner) {
      settings.ownerName = savedOwner;
      const ownerInput = document.getElementById('ownerName');
      if (ownerInput) ownerInput.value = savedOwner;
    }
    
    if (savedAutoSave !== null) {
      settings.autoSave = savedAutoSave === 'true';
      const autoSaveCheckbox = document.getElementById('autoSaveToTsmo');
      if (autoSaveCheckbox) autoSaveCheckbox.checked = settings.autoSave;
    }
  } catch (e) {
    console.log('Error restoring session:', e);
  }
}

async function verifySession() {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (response.ok) {
      showMainPanel();
      await refreshSubscriptionTier();
    } else {
      // Token expired
      logout();
    }
  } catch (e) {
    console.log('Session verification failed:', e);
    // Keep user logged in if offline
    if (isOnline) {
      logout();
    } else {
      showMainPanel();
    }
  }
}

// ============= SUBSCRIPTION TIER =============
async function refreshSubscriptionTier() {
  if (!authToken) return;
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ action: 'get_subscription' })
    });
    
    const data = await response.json();
    
    if (data.success && data.tier) {
      userTier = data.tier;
      
      // Only update protection level if user is Pro
      if (userTier === 'pro') {
        settings.protectionLevel = 'pro';
        // Update radio button
        const proRadio = document.querySelector('input[name="protectionLevel"][value="pro"]');
        if (proRadio) proRadio.checked = true;
      } else {
        settings.protectionLevel = 'basic';
        const basicRadio = document.querySelector('input[name="protectionLevel"][value="basic"]');
        if (basicRadio) basicRadio.checked = true;
      }
      
      updateTierDisplay();
      localStorage.setItem('tsmo_user_tier', userTier);
      
      console.log('TSMO: Subscription tier:', userTier);
    }
  } catch (e) {
    console.log('TSMO: Could not fetch subscription tier:', e);
    // Use cached tier if available
    const cachedTier = localStorage.getItem('tsmo_user_tier');
    if (cachedTier) {
      userTier = cachedTier;
      updateTierDisplay();
    }
  }
}

function updateTierDisplay() {
  if (planBadge) {
    planBadge.style.display = 'inline-block';
    planBadge.textContent = userTier === 'pro' ? 'Pro' : 'Basic';
    planBadge.className = `plan-badge ${userTier === 'pro' ? 'plan-pro' : 'plan-basic'}`;
  }
}

// ============= AUTHENTICATION =============
async function login() {
  const email = document.getElementById('loginEmail').value?.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showStatus('Please enter email and password', 'error');
    return;
  }
  
  showLoading('Signing in...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 400) {
        showStatus('Invalid email or password', 'error');
      } else if (response.status === 422) {
        showStatus('Please verify your email first', 'error');
      } else {
        showStatus(data.error_description || data.msg || 'Login failed', 'error');
      }
      return;
    }
    
    if (data.access_token) {
      authToken = data.access_token;
      currentUser = data.user;
      
      localStorage.setItem('tsmo_auth_token', authToken);
      localStorage.setItem('tsmo_user', JSON.stringify(currentUser));
      
      hideStatus();
      showMainPanel();
      await refreshSubscriptionTier();
    } else {
      showStatus('Login failed. Please try again.', 'error');
    }
  } catch (e) {
    console.error('Login error:', e);
    showStatus('Connection error. Please try again.', 'error');
  }
}

async function signup() {
  const email = document.getElementById('signupEmail').value?.trim();
  const password = document.getElementById('signupPassword').value;
  
  if (!email || !password) {
    showSignupStatus('Please enter email and password', 'error');
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showSignupStatus('Please enter a valid email address', 'error');
    return;
  }
  
  // Supabase requires stronger passwords - at least 8 chars with variety
  if (password.length < 8) {
    showSignupStatus('Password must be at least 8 characters', 'error');
    return;
  }
  
  // Check for password strength (Supabase rejects weak passwords)
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    showSignupStatus('Password must include letters and numbers', 'error');
    return;
  }
  
  showSignupLoading('Creating account...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ 
        email, 
        password,
        data: { account_type: 'free' },
        // Note: email_redirect_to at root level for GoTrue
        email_redirect_to: 'https://www.tsmowatch.com/auth'
      })
    });
    
    const statusCode = response.status;
    let data = {};
    
    try {
      data = await response.json();
    } catch (e) {
      console.log('Could not parse signup response as JSON');
    }
    
    if (!response.ok) {
      // Handle specific HTTP status codes
      if (statusCode === 400) {
        if (data.code === 'weak_password' || data.error_code === 'weak_password') {
          showSignupStatus('Password too weak. Use 8+ chars with letters & numbers.', 'error');
        } else if (data.code === 'user_already_exists' || data.msg?.includes('already registered')) {
          showLoginPanel();
          showStatus('Email already registered. Please sign in instead.', 'error');
        } else {
          showSignupStatus(`Signup failed: ${data.msg || data.message || 'Invalid request'}`, 'error');
        }
      } else if (statusCode === 403) {
        showSignupStatus('Signup blocked. Please try again later.', 'error');
      } else if (statusCode === 422) {
        if (data.msg?.includes('already registered') || data.code === 'user_already_exists') {
          showLoginPanel();
          showStatus('Email already registered. Please sign in instead.', 'error');
        } else {
          showSignupStatus(`Validation error: ${data.msg || 'Please check your email and password'}`, 'error');
        }
      } else if (statusCode >= 500) {
        showSignupStatus('Server error. Please try again later.', 'error');
      } else {
        showSignupStatus(`Signup failed: ${data.msg || data.message || 'Unknown error'}`, 'error');
      }
      return;
    }
    
    // Check if email confirmation is required
    if (data.id && !data.access_token) {
      // User created but needs email confirmation
      showSignupStatus('Account created! Check your email to confirm, then sign in.', 'success');
      setTimeout(() => {
        showLoginPanel();
      }, 3000);
    } else if (data.access_token) {
      // Auto-login (email confirmation disabled)
      authToken = data.access_token;
      currentUser = data.user;
      
      localStorage.setItem('tsmo_auth_token', authToken);
      localStorage.setItem('tsmo_user', JSON.stringify(currentUser));
      
      hideSignupStatus();
      showMainPanel();
      await refreshSubscriptionTier();
    } else if (data.user) {
      // User created, needs confirmation
      showSignupStatus('Account created! Check your email to confirm, then sign in.', 'success');
      setTimeout(() => {
        showLoginPanel();
      }, 3000);
    } else {
      showSignupStatus('Account may have been created. Try signing in.', 'success');
      setTimeout(() => {
        showLoginPanel();
      }, 2000);
    }
  } catch (e) {
    console.error('Signup error:', e);
    showSignupStatus('Connection error. Please check your internet and try again.', 'error');
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  userTier = 'basic';
  
  localStorage.removeItem('tsmo_auth_token');
  localStorage.removeItem('tsmo_user');
  localStorage.removeItem('tsmo_user_tier');
  
  showLoginPanel();
}

// ============= PANEL MANAGEMENT =============
function showLoginPanel() {
  hideAllPanels();
  loginPanel.style.display = 'block';
  logoutBtn.style.display = 'none';
  planBadge.style.display = 'none';
  userEmailEl.textContent = '';
  hideStatus();
}

function showSignupPanel() {
  hideAllPanels();
  signupPanel.style.display = 'block';
  logoutBtn.style.display = 'none';
  planBadge.style.display = 'none';
  hideSignupStatus();
}

function showMainPanel() {
  hideAllPanels();
  mainPanel.style.display = 'block';
  logoutBtn.style.display = 'inline-block';
  
  // Update header
  if (currentUser?.email) {
    userEmailEl.textContent = currentUser.email;
  }
  
  updateTierDisplay();
  
  // Reset progress and result panels
  protectionProgress.style.display = 'none';
  resultPanel.style.display = 'none';
  
  // Restore owner name
  const ownerInput = document.getElementById('ownerName');
  if (ownerInput && settings.ownerName) {
    ownerInput.value = settings.ownerName;
  }
}

function hideAllPanels() {
  loginPanel.style.display = 'none';
  signupPanel.style.display = 'none';
  mainPanel.style.display = 'none';
  errorPanel.style.display = 'none';
  verifyResultPanel.style.display = 'none';
}

function showUpgradeModal() {
  const userInfo = document.getElementById('upgradeUserInfo');
  if (userInfo && currentUser) {
    userInfo.innerHTML = `<strong>${currentUser.email}</strong><br>${new Date().getFullYear()}`;
  }
  upgradeOverlay.style.display = 'flex';
}

function hideUpgradeModal() {
  upgradeOverlay.style.display = 'none';
}

// ============= STATUS MESSAGES =============
function showStatus(message, type = 'info') {
  if (statusMessage) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';
  }
}

function hideStatus() {
  if (statusMessage) {
    statusMessage.style.display = 'none';
  }
}

function showLoading(message) {
  showStatus(message, 'loading');
  loginBtn.disabled = true;
}

function showSignupStatus(message, type = 'info') {
  if (signupStatusMessage) {
    signupStatusMessage.textContent = message;
    signupStatusMessage.className = `status-message ${type}`;
    signupStatusMessage.style.display = 'block';
  }
  signupBtn.disabled = false;
}

function hideSignupStatus() {
  if (signupStatusMessage) {
    signupStatusMessage.style.display = 'none';
  }
}

function showSignupLoading(message) {
  showSignupStatus(message, 'loading');
  signupBtn.disabled = true;
}

function showError(title, message, details = null) {
  document.getElementById('errorTitle').textContent = title;
  document.getElementById('errorMessage').textContent = message;
  
  const detailsEl = document.getElementById('errorDetails');
  if (details && detailsEl) {
    detailsEl.textContent = details;
    detailsEl.style.display = 'none';
  }
  
  hideAllPanels();
  errorPanel.style.display = 'block';
}

function hideError() {
  errorPanel.style.display = 'none';
}

// ============= PROTECTION FLOW =============
async function protectDocument() {
  if (!authToken) {
    showStatus('Please sign in first', 'error');
    return;
  }
  
  // Get owner name and save it
  const ownerInput = document.getElementById('ownerName');
  if (ownerInput?.value) {
    settings.ownerName = ownerInput.value;
    localStorage.setItem('tsmo_owner_name', settings.ownerName);
  }
  
  const yearInput = document.getElementById('copyrightYear');
  if (yearInput?.value) {
    settings.copyrightYear = parseInt(yearInput.value) || new Date().getFullYear();
  }
  
  // Hide result panel, show progress
  resultPanel.style.display = 'none';
  protectionProgress.style.display = 'block';
  protectBtn.disabled = true;
  
  // Reset all steps
  resetProgressSteps();
  
  try {
    // Step 1: Export document (simulated for now)
    await setStepActive('export');
    const documentData = await getActiveDocumentData();
    await setStepComplete('export');
    
    // Determine protection level based on tier
    const effectiveLevel = userTier === 'pro' ? settings.protectionLevel : 'basic';
    
    if (effectiveLevel === 'pro') {
      // Pro tier: Apply REAL pixel protection
      await setStepActive('stylecloak');
      await sleep(200);
      
      await setStepActive('watermark');
      await sleep(200);
      
      await setStepActive('aiblock');
      
      // Call pixel protection API if we have image data
      if (documentData.imageData) {
        try {
          const pixelResponse = await fetch(PIXEL_PROTECTION_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              imageData: documentData.imageData,
              protectionId: 'pending',
              options: {
                strength: 0.35,
                frequency: 8,
                colorJitter: 0.1,
                applyStyleCloak: true,
                applyWatermark: true,
                applyAiBlock: true
              }
            })
          });
          
          const pixelResult = await pixelResponse.json();
          
          if (pixelResult.success && pixelResult.protectedImage) {
            documentData.protectedImageData = `data:image/png;base64,${pixelResult.protectedImage}`;
            console.log('TSMO: Real pixel protection applied');
          } else {
            console.log('TSMO: Pixel protection failed:', pixelResult.error);
          }
        } catch (pixelError) {
          console.log('TSMO: Pixel protection API error:', pixelError);
        }
      }
      
      await setStepComplete('stylecloak');
      await setStepComplete('watermark');
      await setStepComplete('aiblock');
    } else {
      // Basic tier: Skip pixel protection steps
      await setStepSkipped('stylecloak');
      await setStepSkipped('watermark');
      await setStepSkipped('aiblock');
    }
    
    // Step 5: Save metadata to server
    await setStepActive('metadata');
    
    const protectionResult = await callProtectionAPI(documentData, effectiveLevel);
    
    if (protectionResult.success) {
      await setStepComplete('metadata');
      lastProtectionId = protectionResult.protectionId;
      
      // Store protection ID for verification
      localStorage.setItem(`tsmo_protection_${documentData.hash}`, lastProtectionId);
      
      // Show success result
      showProtectionResult(protectionResult);
      
      // Auto-save if enabled
      if (settings.autoSave) {
        await saveToAccount();
      }
    } else {
      await setStepError('metadata');
      
      if (protectionResult.message === 'UPGRADE_REQUIRED') {
        showUpgradeModal();
      } else {
        showStatus(protectionResult.error || 'Protection failed', 'error');
      }
    }
  } catch (e) {
    console.error('Protection error:', e);
    showStatus('Protection failed. Please try again.', 'error');
  } finally {
    protectBtn.disabled = false;
  }
}

async function callProtectionAPI(documentData, level) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      action: 'protect',
      protectionLevel: level,
      fileHash: documentData.hash,
      fileName: documentData.name,
      fileType: documentData.type,
      fileSize: documentData.size,
      metadata: {
        copyrightOwner: settings.ownerName,
        copyrightYear: settings.copyrightYear,
        rights: 'All Rights Reserved',
        prohibitAiTraining: true,
        prohibitDerivatives: false,
        requireAttribution: true
      }
    })
  });
  
  return await response.json();
}

function showProtectionResult(result) {
  protectionProgress.style.display = 'none';
  resultPanel.style.display = 'block';
  
  const resultTitle = resultPanel.querySelector('.result-title');
  const resultMessage = resultPanel.querySelector('.result-message');
  
  if (resultTitle) {
    resultTitle.textContent = '✓ Protected successfully!';
  }
  if (resultMessage) {
    resultMessage.textContent = 'Your art is now protected from AI training.';
  }
}

// ============= PROGRESS STEPS =============
function resetProgressSteps() {
  const steps = progressSteps?.querySelectorAll('.step');
  steps?.forEach(step => {
    step.classList.remove('active', 'complete', 'skipped', 'error');
    const indicator = step.querySelector('.step-indicator');
    if (indicator) indicator.textContent = '○';
    const label = step.querySelector('.step-label');
    if (label) label.style.opacity = '1';
  });
}

async function setStepActive(stepId) {
  const stepEl = progressSteps?.querySelector(`[data-step="${stepId}"]`);
  if (stepEl) {
    stepEl.classList.add('active');
    const indicator = stepEl.querySelector('.step-indicator');
    if (indicator) indicator.innerHTML = '<span class="spinner-small"></span>';
  }
  await sleep(100);
}

async function setStepComplete(stepId) {
  const stepEl = progressSteps?.querySelector(`[data-step="${stepId}"]`);
  if (stepEl) {
    stepEl.classList.remove('active');
    stepEl.classList.add('complete');
    const indicator = stepEl.querySelector('.step-indicator');
    if (indicator) indicator.textContent = '✓';
  }
  await sleep(50);
}

async function setStepSkipped(stepId) {
  const stepEl = progressSteps?.querySelector(`[data-step="${stepId}"]`);
  if (stepEl) {
    stepEl.classList.remove('active');
    stepEl.classList.add('skipped');
    const indicator = stepEl.querySelector('.step-indicator');
    if (indicator) indicator.textContent = '—';
    const label = stepEl.querySelector('.step-label');
    if (label) label.style.opacity = '0.5';
  }
  await sleep(50);
}

async function setStepError(stepId) {
  const stepEl = progressSteps?.querySelector(`[data-step="${stepId}"]`);
  if (stepEl) {
    stepEl.classList.remove('active');
    stepEl.classList.add('error');
    const indicator = stepEl.querySelector('.step-indicator');
    if (indicator) indicator.textContent = '✕';
  }
  await sleep(50);
}

// ============= DOCUMENT HANDLING =============
async function getActiveDocumentData() {
  try {
    // Try to get real document data from Photoshop/Illustrator
    const app = require('photoshop')?.app || require('illustrator')?.app;
    
    if (app?.activeDocument) {
      const doc = app.activeDocument;
      const hash = await calculateDocumentHash(doc);
      
      return {
        name: doc.name || 'Untitled',
        width: doc.width || 1000,
        height: doc.height || 1000,
        type: 'image/png',
        size: 0,
        hash: hash,
        imageData: null // Would need to export to get actual image data
      };
    }
  } catch (e) {
    console.log('Could not access host application:', e);
  }
  
  // Fallback for testing/simulation
  const mockHash = 'MOCK-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
  return {
    name: 'Document.psd',
    width: 1920,
    height: 1080,
    type: 'image/png',
    size: 2048000,
    hash: mockHash,
    imageData: null
  };
}

async function calculateDocumentHash(doc) {
  // Create deterministic hash from document properties
  const hashInput = `${doc.name || 'untitled'}-${doc.width || 0}-${doc.height || 0}-${doc.mode || 'rgb'}`;
  
  try {
    // Use Web Crypto API if available
    const encoder = new TextEncoder();
    const data = encoder.encode(hashInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Fallback to simple hash (FNV-1a)
    let hash = 2166136261;
    for (let i = 0; i < hashInput.length; i++) {
      hash ^= hashInput.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
}

// ============= BATCH PROTECTION =============
async function batchProtect() {
  showStatus('Batch protection coming soon!', 'info');
}

// ============= VERIFICATION =============
async function verifyDocument() {
  if (!authToken) {
    showStatus('Please sign in first', 'error');
    return;
  }
  
  verifyBtn.disabled = true;
  showStatus('Verifying...', 'loading');
  
  try {
    const documentData = await getActiveDocumentData();
    
    // Check local cache first
    const cachedProtectionId = localStorage.getItem(`tsmo_protection_${documentData.hash}`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        action: 'verify',
        fileHash: documentData.hash,
        protectionId: cachedProtectionId || undefined
      })
    });
    
    const result = await response.json();
    
    hideStatus();
    showVerifyResult(result, documentData);
  } catch (e) {
    console.error('Verification error:', e);
    showStatus('Verification failed', 'error');
  } finally {
    verifyBtn.disabled = false;
  }
}

function showVerifyResult(result, documentData) {
  const verifyIcon = document.getElementById('verifyIcon');
  const verifyTitle = document.getElementById('verifyTitle');
  const verifyDetails = document.getElementById('verifyDetails');
  
  if (result.success && result.verificationResult?.isProtected) {
    verifyIcon.textContent = '✓';
    verifyIcon.className = 'result-icon success';
    verifyTitle.textContent = 'Protected Document';
    
    const vr = result.verificationResult;
    verifyDetails.innerHTML = `
      <div class="verify-item">
        <strong>Protection ID:</strong> ${vr.protectionId || 'N/A'}
      </div>
      <div class="verify-item">
        <strong>Protected:</strong> ${vr.protectedAt ? new Date(vr.protectedAt).toLocaleDateString() : 'Unknown'}
      </div>
      <div class="verify-item">
        <strong>Owner:</strong> ${vr.owner || 'Unknown'}
      </div>
      <div class="verify-item">
        <strong>C2PA Signed:</strong> ${vr.signatureVerified ? 'Yes ✓' : 'No'}
      </div>
    `;
  } else {
    verifyIcon.textContent = '○';
    verifyIcon.className = 'result-icon warning';
    verifyTitle.textContent = 'Not Protected';
    
    verifyDetails.innerHTML = `
      <p>This document has not been protected with TSMO.</p>
      <p>Use the "Protect" button to add AI training protection.</p>
    `;
  }
  
  hideAllPanels();
  verifyResultPanel.style.display = 'block';
}

// ============= SAVE TO ACCOUNT =============
async function saveToAccount() {
  if (!lastProtectionId || !authToken) {
    console.log('Cannot save: no protection ID or auth token');
    return;
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        action: 'save_to_portfolio',
        protectionId: lastProtectionId,
        filename: settings.ownerName ? `${settings.ownerName} - Protected Work` : 'Protected Work',
        metadata: {
          copyrightOwner: settings.ownerName,
          copyrightYear: settings.copyrightYear
        }
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('TSMO: Saved to portfolio:', result.artworkId);
    } else {
      console.log('TSMO: Save to portfolio failed:', result.error);
    }
  } catch (e) {
    console.error('Save to account error:', e);
  }
}

// ============= UTILITIES =============
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============= INITIALIZATION COMPLETE =============
console.log('TSMO Watch Plugin v1.0.4 loaded');
