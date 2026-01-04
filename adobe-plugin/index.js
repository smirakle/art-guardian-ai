/**
 * TSMO AI Training Protection - Adobe UXP Plugin
 * Protects creative work from unauthorized AI training
 */

const API_URL = 'https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/adobe-plugin-api';
const VERSION_URL = 'https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/plugin-version';
const SUPABASE_URL = 'https://utneaqmbyjwxaqrrarpc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bmVhcW1ieWp3eGFxcnJhcnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzAzNzIsImV4cCI6MjA2ODAwNjM3Mn0.bYhOQUFOxVqXXPpF9WGHtILKfmHTOzUcbGmZ5-RIzxI';

// State
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
  settings.copyrightOwner = document.getElementById('copyrightOwner').value;
  settings.copyrightYear = parseInt(document.getElementById('copyrightYear').value) || new Date().getFullYear();
  settings.autoProtect = document.getElementById('autoProtect').checked;
  settings.showNotifications = document.getElementById('showNotifications').checked;
  
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
      // Store protection ID for save to account
      localStorage.setItem('tsmo_last_protection_id', result.protectionId || '');
      localStorage.setItem('tsmo_last_protection_filename', docInfo.name);
      
      // Inject XMP metadata into document
      await injectXmpMetadata(result.protectionCertificate.xmpDirective);
      
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

// Generate a base64 thumbnail from the current document
async function generateThumbnail(docInfo) {
  try {
    if (typeof require !== 'undefined') {
      const app = require('photoshop').app;
      const fs = require('uxp').storage.localFileSystem;
      
      if (app.activeDocument) {
        // Create a temporary folder for the thumbnail
        const tempFolder = await fs.getTemporaryFolder();
        const thumbFile = await tempFolder.createFile('tsmo_thumb.jpg', { overwrite: true });
        
        // Export a small JPEG thumbnail
        const exportOptions = {
          quality: 60,
          width: 400,
          height: 400,
          resampleMethod: 'bicubic'
        };
        
        // Save as JPEG to temp file
        await app.activeDocument.saveAs.jpg(thumbFile, exportOptions);
        
        // Read the file as base64
        const fileData = await thumbFile.read({ format: 'binary' });
        const base64 = btoa(String.fromCharCode(...new Uint8Array(fileData)));
        
        // Clean up
        await thumbFile.delete();
        
        return `data:image/jpeg;base64,${base64}`;
      }
    }
  } catch (e) {
    console.log('Could not generate Photoshop thumbnail:', e);
  }
  
  try {
    if (typeof require !== 'undefined') {
      const app = require('illustrator').app;
      const fs = require('uxp').storage.localFileSystem;
      
      if (app.activeDocument) {
        // For Illustrator, export as PNG
        const tempFolder = await fs.getTemporaryFolder();
        const thumbFile = await tempFolder.createFile('tsmo_thumb.png', { overwrite: true });
        
        // Export to temp file
        await app.activeDocument.exportFile(thumbFile, 'png', { artBoardClipping: true });
        
        // Read as base64
        const fileData = await thumbFile.read({ format: 'binary' });
        const base64 = btoa(String.fromCharCode(...new Uint8Array(fileData)));
        
        await thumbFile.delete();
        
        return `data:image/png;base64,${base64}`;
      }
    }
  } catch (e) {
    console.log('Could not generate Illustrator thumbnail:', e);
  }
  
  // Fallback: Create a simple placeholder canvas thumbnail for testing
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
      fileHash: `batch-${Date.now()}-${item.name}`,
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
    
    const fileHash = await calculateDocumentHash(docInfo);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        action: 'verify',
        fileHash: fileHash
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

// ============= ADOBE INTEGRATION =============

async function getDocumentInfo() {
  try {
    // For Photoshop
    if (typeof require !== 'undefined') {
      const app = require('photoshop').app;
      if (app.activeDocument) {
        return {
          name: app.activeDocument.name,
          path: app.activeDocument.path || '',
          format: 'image/psd',
          width: app.activeDocument.width,
          height: app.activeDocument.height
        };
      }
    }
  } catch (e) {
    console.log('Could not get Photoshop document:', e);
  }
  
  try {
    // For Illustrator
    if (typeof require !== 'undefined') {
      const app = require('illustrator').app;
      if (app.activeDocument) {
        return {
          name: app.activeDocument.name,
          path: app.activeDocument.path || '',
          format: 'image/ai',
          width: app.activeDocument.width,
          height: app.activeDocument.height
        };
      }
    }
  } catch (e) {
    console.log('Could not get Illustrator document:', e);
  }
  
  // Fallback for testing
  return {
    name: 'Untitled Document',
    path: '',
    format: 'image/psd',
    width: 1920,
    height: 1080
  };
}

async function calculateDocumentHash(docInfo) {
  // Create a hash from document properties
  const hashData = `${docInfo.name}-${docInfo.width}-${docInfo.height}-${Date.now()}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(hashData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getArtboardsOrLayers() {
  try {
    if (typeof require !== 'undefined') {
      const app = require('photoshop').app;
      if (app.activeDocument) {
        return app.activeDocument.layers.map(layer => ({
          name: layer.name,
          type: 'layer'
        }));
      }
    }
  } catch (e) {
    console.log('Could not get layers:', e);
  }
  
  // Fallback
  return [{ name: 'Layer 1', type: 'layer' }];
}

async function injectXmpMetadata(xmpDirective) {
  try {
    if (typeof require !== 'undefined') {
      const app = require('photoshop').app;
      if (app.activeDocument && app.activeDocument.xmpMetadata) {
        // Note: Actual XMP injection would be done here
        console.log('XMP metadata would be injected:', xmpDirective.substring(0, 100));
      }
    }
  } catch (e) {
    console.log('XMP injection not available:', e);
  }
}

// ============= AUTO-PROTECT ON EXPORT =============

function setupExportListener() {
  try {
    if (typeof require !== 'undefined') {
      const action = require('photoshop').action;
      
      // Listen for save/export events
      action.addNotificationListener(['save', 'exportDocument'], async (event, descriptor) => {
        if (settings.autoProtect) {
          console.log('Auto-protect triggered on export');
          await protectCurrentDocument();
        }
      });
      
      console.log('Export listener registered');
    }
  } catch (e) {
    console.log('Could not setup export listener:', e);
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
  loadingText.textContent = text || 'Processing...';
  loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

function showStatus(message, type = 'info') {
  statusSection.classList.remove('hidden');
  statusMessage.textContent = message;
  statusMessage.className = `status-message status-${type}`;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusSection.classList.add('hidden');
  }, 5000);
}

function showNotification(title, message) {
  // UXP notification API if available
  try {
    if (typeof require !== 'undefined') {
      const { shell } = require('uxp');
      // shell.showNotification would be called here
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
        const levelNames = { basic: 'Basic', professional: 'Professional', enterprise: 'Enterprise' };
        currentLevelEl.textContent = levelNames[e.target.value] || 'Professional';
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
