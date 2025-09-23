// Options page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings
    loadSettings();
    
    // Add event listeners
    setupEventListeners();
});

function loadSettings() {
    chrome.storage.sync.get({
        autoProtect: false,
        showNotifications: true,
        showOverlay: true,
        minImageSize: 200,
        protectionStrength: 'medium',
        debugMode: false
    }, function(items) {
        // Update UI with saved settings
        document.getElementById('autoProtect').classList.toggle('active', items.autoProtect);
        document.getElementById('showNotifications').classList.toggle('active', items.showNotifications);
        document.getElementById('showOverlay').classList.toggle('active', items.showOverlay);
        document.getElementById('minImageSize').value = items.minImageSize;
        document.getElementById('protectionStrength').value = items.protectionStrength;
        document.getElementById('debugMode').classList.toggle('active', items.debugMode);
    });
    
    // Check authentication status
    checkAuthStatus();
}

function setupEventListeners() {
    // Toggle switches
    document.querySelectorAll('.toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
    
    // Save settings button
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    // Reset settings button
    document.getElementById('resetSettings').addEventListener('click', resetSettings);
    
    // Connect account button
    document.getElementById('connectAccount').addEventListener('click', connectAccount);
    
    // Footer links
    document.getElementById('openDashboard').addEventListener('click', function() {
        chrome.tabs.create({ url: 'https://utneaqmbyjwxaqrrarpc.supabase.co/dashboard' });
    });
    
    document.getElementById('viewDocs').addEventListener('click', function() {
        chrome.tabs.create({ url: 'https://tsmo.ai/docs' });
    });
    
    document.getElementById('contactSupport').addEventListener('click', function() {
        chrome.tabs.create({ url: 'mailto:support@tsmo.ai' });
    });
    
    document.getElementById('viewPrivacy').addEventListener('click', function() {
        chrome.tabs.create({ url: 'https://tsmo.ai/privacy' });
    });
}

function saveSettings() {
    const settings = {
        autoProtect: document.getElementById('autoProtect').classList.contains('active'),
        showNotifications: document.getElementById('showNotifications').classList.contains('active'),
        showOverlay: document.getElementById('showOverlay').classList.contains('active'),
        minImageSize: parseInt(document.getElementById('minImageSize').value),
        protectionStrength: document.getElementById('protectionStrength').value,
        debugMode: document.getElementById('debugMode').classList.contains('active')
    };
    
    chrome.storage.sync.set(settings, function() {
        showStatusMessage('Settings saved successfully!', 'success');
        
        // Notify background script of settings change
        chrome.runtime.sendMessage({
            action: 'settings-updated',
            settings: settings
        });
    });
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
        chrome.storage.sync.clear(function() {
            loadSettings();
            showStatusMessage('Settings reset to defaults', 'success');
        });
    }
}

function connectAccount() {
    // Open authentication flow
    chrome.tabs.create({ 
        url: 'https://utneaqmbyjwxaqrrarpc.supabase.co/auth/login'
    }, function(tab) {
        // Listen for auth completion
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, updatedTab) {
            if (tabId === tab.id && changeInfo.url && changeInfo.url.includes('dashboard')) {
                chrome.tabs.onUpdated.removeListener(listener);
                checkAuthStatus();
            }
        });
    });
}

function checkAuthStatus() {
    // Check if user is authenticated
    chrome.storage.local.get(['userToken'], function(result) {
        const isAuthenticated = !!result.userToken;
        const indicator = document.getElementById('authIndicator');
        const status = document.getElementById('authStatus');
        const button = document.getElementById('connectAccount');
        
        if (isAuthenticated) {
            indicator.classList.remove('disconnected');
            status.textContent = 'Connected to TSMO account';
            button.textContent = 'Disconnect Account';
            button.onclick = disconnectAccount;
        } else {
            indicator.classList.add('disconnected');
            status.textContent = 'Not connected to TSMO account';
            button.textContent = 'Connect Account';
            button.onclick = connectAccount;
        }
    });
}

function disconnectAccount() {
    if (confirm('Are you sure you want to disconnect your TSMO account?')) {
        chrome.storage.local.remove(['userToken'], function() {
            checkAuthStatus();
            showStatusMessage('Account disconnected', 'success');
        });
    }
}

function showStatusMessage(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'block';
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}

// Debug logging
function log(...args) {
    chrome.storage.sync.get(['debugMode'], function(items) {
        if (items.debugMode) {
            console.log('[TSMO Options]', ...args);
        }
    });
}