// TSMO AI Art Protection - Options Script
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
  await checkAccountStatus();
});

async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get([
      'extensionEnabled',
      'autoDetect',
      'showOverlays',
      'showNotifications',
      'successNotifications',
      'errorNotifications',
      'minImageSize',
      'skipUiElements',
      'platformDetection',
      'debugMode'
    ]);

    // Set default values and update UI
    document.getElementById('extension-enabled').checked = settings.extensionEnabled !== false;
    document.getElementById('auto-detect').checked = settings.autoDetect !== false;
    document.getElementById('show-overlays').checked = settings.showOverlays !== false;
    document.getElementById('show-notifications').checked = settings.showNotifications !== false;
    document.getElementById('success-notifications').checked = settings.successNotifications !== false;
    document.getElementById('error-notifications').checked = settings.errorNotifications !== false;
    document.getElementById('min-image-size').value = settings.minImageSize || '100';
    document.getElementById('skip-ui-elements').checked = settings.skipUiElements !== false;
    document.getElementById('platform-detection').checked = settings.platformDetection !== false;
    document.getElementById('debug-mode').checked = settings.debugMode === true;

  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveSettings() {
  try {
    const settings = {
      extensionEnabled: document.getElementById('extension-enabled').checked,
      autoDetect: document.getElementById('auto-detect').checked,
      showOverlays: document.getElementById('show-overlays').checked,
      showNotifications: document.getElementById('show-notifications').checked,
      successNotifications: document.getElementById('success-notifications').checked,
      errorNotifications: document.getElementById('error-notifications').checked,
      minImageSize: parseInt(document.getElementById('min-image-size').value),
      skipUiElements: document.getElementById('skip-ui-elements').checked,
      platformDetection: document.getElementById('platform-detection').checked,
      debugMode: document.getElementById('debug-mode').checked
    };

    await chrome.storage.sync.set(settings);
    
    // Show save confirmation
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved!';
    saveBtn.style.background = '#10b981';
    
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.background = '';
    }, 2000);

  } catch (error) {
    console.error('Error saving settings:', error);
    
    // Show error
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Error!';
    saveBtn.style.background = '#ef4444';
    
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.background = '';
    }, 2000);
  }
}

async function checkAccountStatus() {
  try {
    const result = await chrome.storage.sync.get(['userToken', 'userEmail']);
    
    if (result.userToken && result.userEmail) {
      // User is connected
      document.getElementById('connection-status').classList.add('connected');
      document.getElementById('account-email').textContent = result.userEmail;
      document.getElementById('account-status').textContent = 'Connected';
      document.getElementById('connect-account-btn').style.display = 'none';
      document.getElementById('disconnect-account-btn').style.display = 'inline-block';
      
      // Load usage stats
      await loadUsageStats();
    } else {
      // User is not connected
      document.getElementById('connection-status').classList.remove('connected');
      document.getElementById('account-email').textContent = 'Not connected';
      document.getElementById('account-status').textContent = 'Disconnected';
      document.getElementById('connect-account-btn').style.display = 'inline-block';
      document.getElementById('disconnect-account-btn').style.display = 'none';
    }
  } catch (error) {
    console.error('Error checking account status:', error);
  }
}

async function loadUsageStats() {
  try {
    const today = new Date().toDateString();
    const result = await chrome.storage.local.get([`protected_${today}`]);
    const usage = result[`protected_${today}`] || 0;
    const limit = 100; // This could be fetched from user's plan
    
    const percentage = Math.min((usage / limit) * 100, 100);
    
    document.getElementById('usage-fill').style.width = `${percentage}%`;
    document.getElementById('usage-text').textContent = `${usage} / ${limit} requests today`;
  } catch (error) {
    console.error('Error loading usage stats:', error);
  }
}

function setupEventListeners() {
  // Save button
  document.getElementById('save-btn').addEventListener('click', saveSettings);
  
  // Account actions
  document.getElementById('connect-account-btn').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://utneaqmbyjwxaqrrarpc.supabase.co'
    });
  });
  
  document.getElementById('disconnect-account-btn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to disconnect your account? This will disable protection features.')) {
      await chrome.storage.sync.remove(['userToken', 'userEmail']);
      await checkAccountStatus();
    }
  });
  
  // Clear data
  document.getElementById('clear-data-btn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all extension data? This action cannot be undone.')) {
      try {
        await chrome.storage.local.clear();
        await chrome.storage.sync.clear();
        
        // Reset form to defaults
        await loadSettings();
        await checkAccountStatus();
        
        alert('All data has been cleared successfully.');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data. Please try again.');
      }
    }
  });
  
  // Export data
  document.getElementById('export-data-btn').addEventListener('click', async () => {
    try {
      const syncData = await chrome.storage.sync.get();
      const localData = await chrome.storage.local.get();
      
      const exportData = {
        settings: syncData,
        statistics: localData,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tsmo-extension-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  });
  
  // Auto-save on changes
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      // Debounce save
      clearTimeout(window.saveTimeout);
      window.saveTimeout = setTimeout(saveSettings, 1000);
    });
  });
  
  // Footer links
  document.getElementById('privacy-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://utneaqmbyjwxaqrrarpc.supabase.co/privacy'
    });
  });
  
  document.getElementById('support-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://utneaqmbyjwxaqrrarpc.supabase.co/support'
    });
  });
}

// Listen for auth updates from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'auth-updated') {
    checkAccountStatus();
  }
});