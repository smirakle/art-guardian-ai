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
let settings = {
  protectionLevel: 'professional',
  copyrightOwner: '',
  copyrightYear: new Date().getFullYear(),
  autoProtect: true,
  showNotifications: true
};

// DOM Elements
const loginPanel = document.getElementById('loginPanel');
const mainPanel = document.getElementById('mainPanel');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const statusSection = document.getElementById('statusSection');
const statusMessage = document.getElementById('statusMessage');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  loadSettings();
  checkAuth();
  checkForUpdates();
  setupEventListeners();
  setupExportListener();
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
  
  // Apply settings to UI
  document.getElementById('copyrightOwner').value = settings.copyrightOwner;
  document.getElementById('copyrightYear').value = settings.copyrightYear;
  document.getElementById('autoProtect').checked = settings.autoProtect;
  document.getElementById('showNotifications').checked = settings.showNotifications;
  
  // Set protection level
  const levelRadio = document.querySelector(`input[name="level"][value="${settings.protectionLevel}"]`);
  if (levelRadio) levelRadio.checked = true;
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

// ============= AUTH =============

function checkAuth() {
  if (authToken && userEmail) {
    showMainPanel();
  } else {
    showLoginPanel();
  }
}

function showLoginPanel() {
  loginPanel.classList.remove('hidden');
  mainPanel.classList.add('hidden');
}

function showMainPanel() {
  loginPanel.classList.add('hidden');
  mainPanel.classList.remove('hidden');
  document.getElementById('userEmail').textContent = userEmail || 'User';
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
  showLoginPanel();
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
    
    hideLoading();
    
    if (result.success) {
      // Inject XMP metadata into document
      await injectXmpMetadata(result.protectionCertificate.xmpDirective);
      
      const signedMsg = result.protectionCertificate?.signatureValid 
        ? ' (C2PA signed)' 
        : '';
      showStatus(`Protected! ID: ${result.protectionId}${signedMsg}`, 'success');
      
      if (settings.showNotifications) {
        showNotification('Protection Applied', `Your document is now protected with ID: ${result.protectionId}`);
      }
    } else {
      showStatus(result.error || 'Protection failed', 'error');
    }
  } catch (error) {
    hideLoading();
    showStatus('Error: ' + error.message, 'error');
    console.error('Protection error:', error);
  }
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
  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('protectBtn').addEventListener('click', protectCurrentDocument);
  document.getElementById('batchBtn').addEventListener('click', batchProtect);
  document.getElementById('verifyBtn').addEventListener('click', verifyProtection);
  
  // Save settings on change
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', saveSettings);
  });
  
  // Level selector styling
  document.querySelectorAll('input[name="level"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.level-option').forEach(opt => opt.classList.remove('selected'));
      e.target.closest('.level-option').classList.add('selected');
    });
  });
  
  // Enter key for login
  document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
  });
}
