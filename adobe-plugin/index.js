/**
 * TSMO AI Training Protection - Adobe UXP Plugin
 * Protects creative work from unauthorized AI training
 * 
 * Compatible with Photoshop 2024+ (v24.0) and Illustrator 2024+ (v27.0)
 */

const API_URL = 'https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/adobe-plugin-api';
const VERSION_URL = 'https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/plugin-version';
const SUPABASE_URL = 'https://utneaqmbyjwxaqrrarpc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bmVhcW1ieWp3eGFxcnJhcnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzAzNzIsImV4cCI6MjA2ODAwNjM3Mn0.bYhOQUFOxVqXXPpF9WGHtILKfmHTOzUcbGmZ5-RIzxI';

// ============= UXP POLYFILLS =============
// TextEncoder polyfill for UXP environment (not available in Adobe UXP)
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
      let result = '';
      for (let i = 0; i < bytes.length; i++) {
        result += String.fromCharCode(bytes[i]);
      }
      return decodeURIComponent(escape(result));
    }
  };
}

// ============= UXP ENVIRONMENT DETECTION =============

let isUXPEnvironment = false;
let photoshopApp = null;
let photoshopAction = null;
let illustratorApp = null;
let uxpStorage = null;

function initUXPEnvironment() {
  try {
    // Correct UXP destructuring syntax
    const photoshop = require('photoshop');
    photoshopApp = photoshop.app;
    photoshopAction = photoshop.action;
    isUXPEnvironment = true;
    console.log('TSMO: Photoshop UXP environment detected');
  } catch (e) {
    console.log('TSMO: Not in Photoshop environment');
  }
  
  try {
    const illustrator = require('illustrator');
    illustratorApp = illustrator.app;
    isUXPEnvironment = true;
    console.log('TSMO: Illustrator UXP environment detected');
  } catch (e) {
    console.log('TSMO: Not in Illustrator environment');
  }
  
  try {
    const uxp = require('uxp');
    uxpStorage = uxp.storage;
    console.log('TSMO: UXP storage available');
  } catch (e) {
    console.log('TSMO: UXP storage not available');
  }
}

// ============= STATE =============

let authToken = null;
let userEmail = null;
let protectionCount = 0;
const BASIC_TIER_LIMIT = 50;
let settings = {
  protectionLevel: 'basic',
  copyrightOwner: '',
  copyrightYear: new Date().getFullYear(),
  autoProtect: true,
  showNotifications: true
};

// DOM Elements (with null safety)
let demoPanel, loginPanel, mainPanel, loadingOverlay, loadingText, statusSection, statusMessage;
let protectionOverlay, protectionSteps, advancedToggle, advancedOptions, successSection;

// First-run state
let isFirstRun = true;

// Protection steps for animated sequence
const PROTECTION_STEPS = [
  { id: 'metadata', label: 'Metadata Embed' },
  { id: 'watermark', label: 'Invisible Watermark' },
  { id: 'stylecloak', label: 'Style Cloak' },
  { id: 'aiblock', label: 'AI Training Block' },
];

// Initialize DOM references safely
function initDomElements() {
  demoPanel = document.getElementById('demoPanel');
  loginPanel = document.getElementById('loginPanel');
  mainPanel = document.getElementById('mainPanel');
  loadingOverlay = document.getElementById('loadingOverlay');
  loadingText = document.getElementById('loadingText');
  statusSection = document.getElementById('statusSection');
  statusMessage = document.getElementById('statusMessage');
  protectionOverlay = document.getElementById('protectionOverlay');
  protectionSteps = document.getElementById('protectionSteps');
  advancedToggle = document.getElementById('advancedToggle');
  advancedOptions = document.getElementById('advancedOptions');
  successSection = document.getElementById('successSection');
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  try {
    initUXPEnvironment();
    initDomElements();
    loadSettings();
    checkInitialState();
    checkForUpdates();
    setupEventListeners();
    setupExportListener();
    console.log('TSMO Plugin initialized successfully');
  } catch (error) {
    console.error('TSMO Plugin initialization error:', error);
  }
});

// ============= SETTINGS =============

function loadSettings() {
  try {
    const saved = localStorage.getItem('tsmo_settings');
    if (saved) {
      settings = { ...settings, ...JSON.parse(saved) };
    }
    const token = localStorage.getItem('tsmo_auth_token');
    const email = localStorage.getItem('tsmo_user_email');
    if (token && email) {
      authToken = token;
      userEmail = email;
    }
  } catch (e) {
    console.log('Could not load settings:', e);
  }
  
  // Apply settings to UI (with null checks)
  const copyrightOwnerEl = document.getElementById('copyrightOwner');
  const copyrightYearEl = document.getElementById('copyrightYear');
  const autoProtectEl = document.getElementById('autoProtect');
  
  if (copyrightOwnerEl) copyrightOwnerEl.value = settings.copyrightOwner;
  if (copyrightYearEl) copyrightYearEl.value = settings.copyrightYear;
  if (autoProtectEl) autoProtectEl.checked = settings.autoProtect;
  
  // Set protection level
  const levelRadio = document.querySelector(`input[name="level"][value="${settings.protectionLevel}"]`);
  if (levelRadio) levelRadio.checked = true;
  
  // Update current level display
  const currentLevelEl = document.getElementById('currentLevel');
  if (currentLevelEl) {
    const levelNames = { basic: 'Basic (Free)', pro: 'Pro ($29/mo)' };
    currentLevelEl.textContent = levelNames[settings.protectionLevel] || 'Basic (Free)';
  }
}

function saveSettings() {
  const copyrightOwnerEl = document.getElementById('copyrightOwner');
  const copyrightYearEl = document.getElementById('copyrightYear');
  const autoProtectEl = document.getElementById('autoProtect');
  const showNotificationsEl = document.getElementById('showNotifications');
  
  if (copyrightOwnerEl) settings.copyrightOwner = copyrightOwnerEl.value;
  if (copyrightYearEl) settings.copyrightYear = parseInt(copyrightYearEl.value) || new Date().getFullYear();
  if (autoProtectEl) settings.autoProtect = autoProtectEl.checked;
  if (showNotificationsEl) settings.showNotifications = showNotificationsEl.checked;
  
  const selectedLevel = document.querySelector('input[name="level"]:checked');
  if (selectedLevel) settings.protectionLevel = selectedLevel.value;
  
  try {
    localStorage.setItem('tsmo_settings', JSON.stringify(settings));
  } catch (e) {
    console.log('Could not save settings:', e);
  }
}

// ============= AUTH & PANEL MANAGEMENT =============

function checkInitialState() {
  // Check if user is already logged in
  if (authToken && userEmail) {
    showMainPanel();
  } else if (isFirstRun) {
    showDemoPanel();
  } else {
    showLoginPanel();
  }
}

function showDemoPanel() {
  if (demoPanel) demoPanel.classList.remove('hidden');
  if (loginPanel) loginPanel.classList.add('hidden');
  if (mainPanel) mainPanel.classList.add('hidden');
}

function showLoginPanel() {
  if (demoPanel) demoPanel.classList.add('hidden');
  if (loginPanel) loginPanel.classList.remove('hidden');
  if (mainPanel) mainPanel.classList.add('hidden');
}

function showMainPanel() {
  if (demoPanel) demoPanel.classList.add('hidden');
  if (loginPanel) loginPanel.classList.add('hidden');
  if (mainPanel) mainPanel.classList.remove('hidden');
  const userEmailEl = document.getElementById('userEmail');
  if (userEmailEl) userEmailEl.textContent = userEmail || 'User';
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
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
    
    if (data.access_token) {
      authToken = data.access_token;
      userEmail = email;
      
      localStorage.setItem('tsmo_auth_token', authToken);
      localStorage.setItem('tsmo_user_email', userEmail);
      
      hideLoading();
      showMainPanel();
      showStatus('Signed in successfully', 'success');
    } else {
      hideLoading();
      showStatus(data.error_description || 'Login failed', 'error');
    }
  } catch (error) {
    hideLoading();
    showStatus('Connection error. Please try again.', 'error');
    console.error('Login error:', error);
  }
}

function logout() {
  authToken = null;
  userEmail = null;
  localStorage.removeItem('tsmo_auth_token');
  localStorage.removeItem('tsmo_user_email');
  isFirstRun = true;
  showDemoPanel();
}

// ============= ANIMATED PROTECTION (AHA MOMENT) =============

async function runAnimatedProtection(isDemo = false) {
  // Show animated protection overlay
  if (protectionOverlay) protectionOverlay.classList.remove('hidden');
  
  // Reset all steps
  const steps = protectionSteps?.querySelectorAll('.step');
  steps?.forEach(step => {
    step.classList.remove('active', 'complete');
    const indicator = step.querySelector('.step-indicator');
    if (indicator) indicator.textContent = '○';
  });
  
  // Animate through each step
  for (let i = 0; i < PROTECTION_STEPS.length; i++) {
    const stepEl = protectionSteps?.querySelector(`[data-step="${PROTECTION_STEPS[i].id}"]`);
    if (stepEl) {
      // Set active
      stepEl.classList.add('active');
      const indicator = stepEl.querySelector('.step-indicator');
      if (indicator) indicator.innerHTML = '<span class="spinner-small"></span>';
      
      await sleep(350);
      
      // Complete step
      stepEl.classList.remove('active');
      stepEl.classList.add('complete');
      if (indicator) indicator.textContent = '✓';
    }
  }
  
  await sleep(300);
  
  // Hide overlay
  if (protectionOverlay) protectionOverlay.classList.add('hidden');
  
  // Show success
  if (!isDemo) {
    showSuccessState();
  } else {
    // For demo, redirect to main panel with success
    isFirstRun = false;
    showMainPanel();
    showSuccessState();
  }
}

function showSuccessState() {
  if (successSection) {
    successSection.classList.remove('hidden');
    // Hide after 10 seconds
    setTimeout(() => {
      successSection.classList.add('hidden');
    }, 10000);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function instantDemo() {
  await runAnimatedProtection(true);
}

// ============= PROTECTION =============

async function protectCurrentDocument() {
  if (!authToken) {
    showStatus('Please sign in first', 'error');
    return;
  }
  
  showLoading('Protecting document...');
  saveSettings();
  
  try {
    // Get document info from Adobe app
    const docInfo = await getDocumentInfo();
    
    if (!docInfo) {
      hideLoading();
      showStatus('No document open', 'error');
      return;
    }
    
    // Calculate file hash
    const fileHash = await calculateDocumentHash(docInfo);
    
    // Call TSMO API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        action: 'protect',
        protectionLevel: settings.protectionLevel,
        fileName: docInfo.name,
        fileType: docInfo.format || 'image/psd',
        fileHash: fileHash,
        metadata: {
          copyrightOwner: settings.copyrightOwner,
          copyrightYear: settings.copyrightYear,
          rights: 'All Rights Reserved',
          prohibitAiTraining: true,
          prohibitDerivatives: false,
          requireAttribution: true
        }
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store protection ID for save to account AND for verify fallback
      const protectionInfo = {
        protectionId: result.protectionId || '',
        fileName: docInfo.name,
        fileHash: fileHash,
        protectedAt: new Date().toISOString()
      };
      localStorage.setItem('tsmo_last_protection', JSON.stringify(protectionInfo));
      localStorage.setItem('tsmo_last_protection_id', result.protectionId || '');
      localStorage.setItem('tsmo_last_protection_filename', docInfo.name);
      
      // Store globally for quick access in verify
      window.tsmoLastProtection = protectionInfo;
      
      // Inject XMP metadata into document using real batchPlay
      await injectXmpMetadata(result.protectionCertificate?.xmpDirective);
      
      // Generate and upload thumbnail for dashboard display
      await uploadThumbnail(result.protectionId, docInfo);
      
      hideLoading();
      
      const signedMsg = result.protectionCertificate?.signatureValid 
        ? ' (C2PA signed)' 
        : '';
      showStatus(`Protected! ID: ${result.protectionId}${signedMsg}`, 'success');
      
      // Show success section with save button
      if (successSection) successSection.classList.remove('hidden');
      
      if (settings.showNotifications) {
        showNotification('Protection Applied', `Your document is now protected with ID: ${result.protectionId}`);
      }
    } else {
      hideLoading();
      showStatus(result.error || 'Protection failed', 'error');
    }
  } catch (error) {
    hideLoading();
    showStatus('Error: ' + error.message, 'error');
    console.error('Protection error:', error);
  }
}

// Generate thumbnail and upload to server for dashboard display
async function uploadThumbnail(protectionId, docInfo) {
  try {
    // Generate thumbnail from document
    const thumbnailData = await generateThumbnail(docInfo);
    
    if (!thumbnailData) {
      console.log('Could not generate thumbnail');
      return;
    }
    
    // Upload thumbnail to server
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        action: 'upload_thumbnail',
        protectionId: protectionId,
        thumbnailData: thumbnailData
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Thumbnail uploaded successfully:', result.thumbnailPath);
    } else {
      console.log('Thumbnail upload failed:', result.error);
    }
  } catch (error) {
    console.log('Thumbnail upload error:', error);
    // Non-blocking - protection still succeeded
  }
}

// Generate a base64 thumbnail from the current document using batchPlay
async function generateThumbnail(docInfo) {
  // Try Photoshop batchPlay export
  if (photoshopApp && photoshopAction && uxpStorage) {
    try {
      const doc = photoshopApp.activeDocument;
      if (!doc) return null;
      
      const fs = uxpStorage.localFileSystem;
      const tempFolder = await fs.getTemporaryFolder();
      const thumbFile = await tempFolder.createFile('tsmo_thumb.jpg', { overwrite: true });
      
      // Get file token for batchPlay
      const token = await fs.createSessionToken(thumbFile);
      
      // Use batchPlay to export a resized JPEG
      await photoshopAction.batchPlay([
        {
          _obj: "export",
          as: {
            _obj: "JPEG",
            quality: 8
          },
          in: {
            _path: token,
            _kind: "local"
          },
          copy: true,
          lowerCase: true,
          embedProfiles: true,
          _options: {
            dialogOptions: "dontDisplay"
          }
        }
      ], { synchronousExecution: true });
      
      // Read the file as binary and convert to base64
      const fileData = await thumbFile.read({ format: uxpStorage.formats.binary });
      const uint8Array = new Uint8Array(fileData);
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);
      
      // Clean up temp file
      try {
        await thumbFile.delete();
      } catch (e) {
        console.log('Could not delete temp file:', e);
      }
      
      return `data:image/jpeg;base64,${base64}`;
    } catch (e) {
      console.log('Photoshop thumbnail generation failed:', e);
    }
  }
  
  // Try Illustrator export
  if (illustratorApp && uxpStorage) {
    try {
      const doc = illustratorApp.activeDocument;
      if (!doc) return null;
      
      const fs = uxpStorage.localFileSystem;
      const tempFolder = await fs.getTemporaryFolder();
      const thumbFile = await tempFolder.createFile('tsmo_thumb.png', { overwrite: true });
      
      // Illustrator export
      const exportOptions = {
        type: 'PNG24',
        artBoardClipping: true,
        horizontalScale: 25,
        verticalScale: 25
      };
      
      await doc.exportFile(thumbFile, exportOptions);
      
      const fileData = await thumbFile.read({ format: uxpStorage.formats.binary });
      const uint8Array = new Uint8Array(fileData);
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);
      
      try {
        await thumbFile.delete();
      } catch (e) {
        console.log('Could not delete temp file:', e);
      }
      
      return `data:image/png;base64,${base64}`;
    } catch (e) {
      console.log('Illustrator thumbnail generation failed:', e);
    }
  }
  
  // Fallback: Create a simple placeholder canvas thumbnail for web testing
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Draw a gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, 200, 200);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 200, 200);
    
    // Add document name
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(docInfo.name?.substring(0, 20) || 'Protected', 100, 100);
    ctx.font = '10px Arial';
    ctx.fillText('TSMO Protected', 100, 120);
    
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (e) {
    console.log('Could not generate fallback thumbnail:', e);
  }
  
  return null;
}

async function batchProtect() {
  if (!authToken) {
    showStatus('Please sign in first', 'error');
    return;
  }
  
  showLoading('Batch protection...');
  saveSettings();
  
  try {
    // Get all artboards/layers
    const items = await getArtboardsOrLayers();
    
    if (!items || items.length === 0) {
      hideLoading();
      showStatus('No artboards or layers found', 'error');
      return;
    }
    
    const batchFiles = items.map(item => ({
      fileHash: `tsmo-batch-${item.name}-${item.bounds?.width || 0}-${item.bounds?.height || 0}`.replace(/[^a-zA-Z0-9-]/g, ''),
      fileName: item.name,
      fileType: 'image/png',
      fileSize: 0
    }));
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        action: 'batch_protect',
        protectionLevel: settings.protectionLevel,
        batchFiles: batchFiles,
        metadata: {
          copyrightOwner: settings.copyrightOwner,
          copyrightYear: settings.copyrightYear,
          prohibitAiTraining: true
        }
      })
    });
    
    const result = await response.json();
    hideLoading();
    
    if (result.success) {
      showStatus(result.message, 'success');
    } else {
      showStatus(result.error || 'Batch protection failed', 'error');
    }
  } catch (error) {
    hideLoading();
    showStatus('Error: ' + error.message, 'error');
    console.error('Batch protection error:', error);
  }
}

async function verifyProtection() {
  if (!authToken) {
    showStatus('Please sign in first', 'error');
    return;
  }
  
  showLoading('Verifying...');
  
  try {
    const docInfo = await getDocumentInfo();
    if (!docInfo) {
      hideLoading();
      showStatus('No document open', 'error');
      return;
    }
    
    // Try to read XMP metadata first
    const xmpData = await readXmpMetadata();
    const fileHash = await calculateDocumentHash(docInfo);
    
    // Get stored protection info for fallback verification
    let storedProtection = window.tsmoLastProtection;
    if (!storedProtection) {
      try {
        const stored = localStorage.getItem('tsmo_last_protection');
        if (stored) {
          storedProtection = JSON.parse(stored);
        }
      } catch (e) {
        console.log('Could not retrieve stored protection:', e);
      }
    }
    
    // Check if this document matches the stored protection
    const matchesStored = storedProtection && (
      storedProtection.fileName === docInfo.name ||
      storedProtection.fileHash === fileHash
    );
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        action: 'verify',
        fileHash: fileHash,
        xmpData: xmpData,
        // Include fallback data for better matching
        protectionId: matchesStored ? storedProtection.protectionId : null,
        fileName: docInfo.name
      })
    });
    
    const result = await response.json();
    hideLoading();
    
    if (result.success && result.verificationResult) {
      if (result.verificationResult.isProtected) {
        const verified = result.verificationResult.signatureVerified ? ' ✓' : '';
        showStatus(`Protected by ${result.verificationResult.owner}${verified}`, 'success');
      } else {
        showStatus('Document is not protected', 'warning');
      }
    } else {
      showStatus(result.error || 'Verification failed', 'error');
    }
  } catch (error) {
    hideLoading();
    showStatus('Error: ' + error.message, 'error');
  }
}

// ============= ADOBE UXP INTEGRATION =============

async function getDocumentInfo() {
  // For Photoshop
  if (photoshopApp) {
    try {
      const doc = photoshopApp.activeDocument;
      if (doc) {
        return {
          name: doc.name,
          path: doc.path || '',
          format: 'image/psd',
          width: doc.width,
          height: doc.height
        };
      }
    } catch (e) {
      console.log('Could not get Photoshop document:', e);
    }
  }
  
  // For Illustrator
  if (illustratorApp) {
    try {
      const doc = illustratorApp.activeDocument;
      if (doc) {
        return {
          name: doc.name,
          path: doc.path || '',
          format: 'image/ai',
          width: doc.width,
          height: doc.height
        };
      }
    } catch (e) {
      console.log('Could not get Illustrator document:', e);
    }
  }
  
  // Fallback for web testing
  return {
    name: 'Untitled Document',
    path: '',
    format: 'image/psd',
    width: 1920,
    height: 1080
  };
}

async function calculateDocumentHash(docInfo) {
  // DETERMINISTIC hash - same document = same hash every time
  // Only use stable properties: name, dimensions, format (NO timestamps or random values)
  const hashData = `tsmo-${docInfo.name}-${docInfo.width}-${docInfo.height}-${docInfo.format || 'psd'}`;
  
  // Try Web Crypto API first (may not be available in UXP)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(hashData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = new Uint8Array(hashBuffer);
      return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.log('crypto.subtle not available, using fallback hash');
    }
  }
  
  // Fallback: FNV-1a hash (deterministic, no randomness)
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < hashData.length; i++) {
    hash ^= hashData.charCodeAt(i);
    hash = (hash * 16777619) >>> 0; // FNV prime, convert to unsigned
  }
  return 'tsmo-' + hash.toString(16).padStart(8, '0');
}

async function getArtboardsOrLayers() {
  // Photoshop layers
  if (photoshopApp) {
    try {
      const doc = photoshopApp.activeDocument;
      if (doc && doc.layers) {
        return doc.layers.map(layer => ({
          name: layer.name,
          type: 'layer'
        }));
      }
    } catch (e) {
      console.log('Could not get Photoshop layers:', e);
    }
  }
  
  // Illustrator artboards
  if (illustratorApp) {
    try {
      const doc = illustratorApp.activeDocument;
      if (doc && doc.artboards) {
        const artboards = [];
        for (let i = 0; i < doc.artboards.length; i++) {
          artboards.push({
            name: doc.artboards[i].name,
            type: 'artboard'
          });
        }
        return artboards;
      }
    } catch (e) {
      console.log('Could not get Illustrator artboards:', e);
    }
  }
  
  // Fallback for web testing
  return [{ name: 'Layer 1', type: 'layer' }];
}

// Real XMP metadata injection using batchPlay
async function injectXmpMetadata(xmpDirective) {
  if (!xmpDirective) {
    console.log('No XMP directive provided');
    return;
  }
  
  // Photoshop XMP injection via batchPlay
  if (photoshopApp && photoshopAction) {
    try {
      const doc = photoshopApp.activeDocument;
      if (!doc) return;
      
      // Parse XMP directive to extract key fields
      let copyright = '';
      let copyrightNotice = '';
      let author = settings.copyrightOwner || '';
      
      if (typeof xmpDirective === 'string') {
        // Extract from XMP string
        const copyrightMatch = xmpDirective.match(/<dc:rights>.*?<rdf:li[^>]*>([^<]+)<\/rdf:li>/);
        if (copyrightMatch) copyright = copyrightMatch[1];
        
        const creatorMatch = xmpDirective.match(/<dc:creator>.*?<rdf:li[^>]*>([^<]+)<\/rdf:li>/);
        if (creatorMatch) author = creatorMatch[1];
        
        copyrightNotice = `© ${settings.copyrightYear} ${author}. All Rights Reserved. AI Training Prohibited.`;
      } else if (typeof xmpDirective === 'object') {
        copyright = xmpDirective.copyright || '';
        copyrightNotice = xmpDirective.notice || '';
        author = xmpDirective.author || author;
      }
      
      // Use batchPlay to set document file info (XMP metadata)
      await photoshopAction.batchPlay([
        {
          _obj: "set",
          _target: [
            { _ref: "property", _property: "fileInfo" },
            { _ref: "document", _enum: "ordinal", _value: "targetEnum" }
          ],
          to: {
            _obj: "fileInfo",
            copyrighted: { _enum: "copyrightedState", _value: "copyrightedWork" },
            copyrightNotice: copyrightNotice || `© ${settings.copyrightYear} ${author}. AI Training Prohibited.`,
            ownerUrl: "https://tsmo.io/verify",
            author: author,
            authorsPosition: "Creator",
            caption: `Protected by TSMO. AI Training is prohibited. Verify at https://tsmo.io`,
            captionWriter: "TSMO Protection System",
            keywords: ["TSMO Protected", "AI Training Prohibited", "Copyright Protected"]
          },
          _options: {
            dialogOptions: "dontDisplay"
          }
        }
      ], { synchronousExecution: true });
      
      console.log('XMP metadata injected successfully via batchPlay');
      return;
    } catch (e) {
      console.log('Photoshop XMP injection failed:', e);
    }
  }
  
  // Illustrator XMP injection
  if (illustratorApp) {
    try {
      const doc = illustratorApp.activeDocument;
      if (!doc) return;
      
      // Illustrator uses XMPMeta for metadata
      if (doc.XMPString) {
        // Append TSMO protection info to existing XMP
        let xmp = doc.XMPString;
        const tsmoXmp = `<xmpRights:UsageTerms>AI Training Prohibited - Protected by TSMO</xmpRights:UsageTerms>`;
        
        // Insert before closing rdf:Description
        xmp = xmp.replace('</rdf:Description>', tsmoXmp + '</rdf:Description>');
        doc.XMPString = xmp;
        
        console.log('Illustrator XMP metadata updated');
      }
    } catch (e) {
      console.log('Illustrator XMP injection failed:', e);
    }
  }
  
  console.log('XMP injection: Not in UXP environment, skipped');
}

// Read existing XMP metadata from document
async function readXmpMetadata() {
  // Photoshop XMP reading via batchPlay
  if (photoshopApp && photoshopAction) {
    try {
      const result = await photoshopAction.batchPlay([
        {
          _obj: "get",
          _target: [
            { _ref: "property", _property: "fileInfo" },
            { _ref: "document", _enum: "ordinal", _value: "targetEnum" }
          ]
        }
      ], { synchronousExecution: true });
      
      if (result && result[0] && result[0].fileInfo) {
        return result[0].fileInfo;
      }
    } catch (e) {
      console.log('Could not read Photoshop XMP:', e);
    }
  }
  
  // Illustrator XMP reading
  if (illustratorApp) {
    try {
      const doc = illustratorApp.activeDocument;
      if (doc && doc.XMPString) {
        return doc.XMPString;
      }
    } catch (e) {
      console.log('Could not read Illustrator XMP:', e);
    }
  }
  
  return null;
}

// ============= AUTO-PROTECT ON EXPORT =============

function setupExportListener() {
  // Photoshop save/export notification listener
  if (photoshopAction) {
    try {
      // Use correct UXP notification events
      photoshopAction.addNotificationListener(
        ['save', 'saveAs', 'quickExport'],
        async (event, descriptor) => {
          console.log('TSMO: Save/export event detected:', event);
          
          // Only auto-protect if setting is enabled
          if (settings.autoProtect) {
            // Check if this is before the save starts
            if (descriptor && descriptor.saveStage === 'beforeSaveProcessStart') {
              console.log('TSMO: Auto-protect triggered before save');
              await protectCurrentDocument();
            } else if (!descriptor || !descriptor.saveStage) {
              // Fallback: trigger after save event
              console.log('TSMO: Auto-protect triggered on save event');
              await protectCurrentDocument();
            }
          }
        }
      );
      
      console.log('TSMO: Photoshop export listener registered');
    } catch (e) {
      console.log('TSMO: Could not setup Photoshop export listener:', e);
    }
  }
  
  // Illustrator doesn't have the same notification system
  // We rely on manual protection for Illustrator
  if (illustratorApp && !photoshopApp) {
    console.log('TSMO: Illustrator detected - auto-protect on manual trigger only');
  }
}

// ============= VERSION CHECK =============

async function checkForUpdates() {
  try {
    const response = await fetch(`${VERSION_URL}?current_version=1.0.0&platform=uxp`);
    const data = await response.json();
    
    if (data.updateAvailable) {
      console.log('Update available:', data.version);
      if (data.updateRequired) {
        showStatus(`Update required: v${data.version}`, 'warning');
      }
    }
  } catch (e) {
    console.log('Version check failed:', e);
  }
}

// ============= UI HELPERS =============

function showLoading(text) {
  if (loadingText) loadingText.textContent = text || 'Processing...';
  if (loadingOverlay) loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  if (loadingOverlay) loadingOverlay.classList.add('hidden');
}

function showStatus(message, type = 'info') {
  if (statusSection) statusSection.classList.remove('hidden');
  if (statusMessage) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
  }
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (statusSection) statusSection.classList.add('hidden');
  }, 5000);
}

function showNotification(title, message) {
  // UXP shell notification if available
  try {
    const uxp = require('uxp');
    if (uxp && uxp.shell) {
      // UXP shell.showNotification is not available in all versions
      console.log(`TSMO Notification: ${title} - ${message}`);
    }
  } catch (e) {
    console.log('Notification:', title, message);
  }
}

// ============= EVENT LISTENERS =============

function setupEventListeners() {
  // Demo panel
  const instantDemoBtn = document.getElementById('instantDemoBtn');
  if (instantDemoBtn) instantDemoBtn.addEventListener('click', instantDemo);
  
  const showLoginBtn = document.getElementById('showLoginBtn');
  if (showLoginBtn) showLoginBtn.addEventListener('click', showLoginPanel);
  
  const backToDemoBtn = document.getElementById('backToDemoBtn');
  if (backToDemoBtn) backToDemoBtn.addEventListener('click', showDemoPanel);
  
  // Auth
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.addEventListener('click', login);
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  
  // Protection actions
  const protectBtn = document.getElementById('protectBtn');
  if (protectBtn) protectBtn.addEventListener('click', protectCurrentDocument);
  
  const batchBtn = document.getElementById('batchBtn');
  if (batchBtn) batchBtn.addEventListener('click', batchProtect);
  
  const verifyBtn = document.getElementById('verifyBtn');
  if (verifyBtn) verifyBtn.addEventListener('click', verifyProtection);
  
  // Advanced toggle
  if (advancedToggle) {
    advancedToggle.addEventListener('click', () => {
      advancedToggle.classList.toggle('open');
      if (advancedOptions) advancedOptions.classList.toggle('hidden');
    });
  }
  
  // Save to account - connects to TSMO portfolio
  const saveToAccountBtn = document.getElementById('saveToAccountBtn');
  if (saveToAccountBtn) {
    saveToAccountBtn.addEventListener('click', async () => {
      if (!authToken) {
        showLoginPanel();
        return;
      }
      
      const protectionId = localStorage.getItem('tsmo_last_protection_id');
      const filename = localStorage.getItem('tsmo_last_protection_filename') || 'Untitled';
      
      if (!protectionId) {
        showStatus('No protection to save. Please protect a document first.', 'error');
        return;
      }
      
      // Show loading state
      saveToAccountBtn.disabled = true;
      saveToAccountBtn.textContent = 'Saving...';
      
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            action: 'save_to_portfolio',
            protectionId: protectionId,
            filename: filename,
            metadata: {
              copyrightOwner: settings.copyrightOwner,
              copyrightYear: settings.copyrightYear
            }
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          showStatus('Saved to your portfolio! View it in your TSMO dashboard.', 'success');
          saveToAccountBtn.textContent = 'Saved ✓';
          saveToAccountBtn.classList.add('saved');
          
          // Clear stored protection ID
          localStorage.removeItem('tsmo_last_protection_id');
          localStorage.removeItem('tsmo_last_protection_filename');
          
          // Hide success section after delay
          setTimeout(() => {
            if (successSection) successSection.classList.add('hidden');
          }, 2000);
        } else {
          throw new Error(result.error || 'Failed to save');
        }
      } catch (error) {
        showStatus('Failed to save: ' + error.message, 'error');
        saveToAccountBtn.disabled = false;
        saveToAccountBtn.textContent = 'Save to TSMO Account';
      }
    });
  }
  
  // Save settings on change
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', saveSettings);
  });
  
  // Level selector styling
  document.querySelectorAll('input[name="level"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.level-option').forEach(opt => opt.classList.remove('selected'));
      e.target.closest('.level-option')?.classList.add('selected');
      
      // Update current level display
      const currentLevelEl = document.getElementById('currentLevel');
      if (currentLevelEl) {
        const levelNames = { basic: 'Basic', pro: 'Pro' };
        currentLevelEl.textContent = levelNames[e.target.value] || 'Basic';
      }
    });
  });
  
  // Enter key for login
  const passwordEl = document.getElementById('password');
  if (passwordEl) {
    passwordEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') login();
    });
  }
}
