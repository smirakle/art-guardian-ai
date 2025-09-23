// TSMO AI Art Protection - Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  await initializePopup();
});

async function initializePopup() {
  try {
    showSection('loading');
    
    // Check if user is authenticated
    const authResult = await checkAuthStatus();
    
    if (authResult.authenticated) {
      await loadMainInterface(authResult.user);
    } else {
      showSection('auth');
      setupAuthHandlers();
    }
  } catch (error) {
    console.error('Error initializing popup:', error);
    showSection('auth');
    setupAuthHandlers();
  }
}

async function checkAuthStatus() {
  try {
    const result = await chrome.storage.sync.get(['userToken', 'userEmail']);
    
    if (result.userToken && result.userEmail) {
      // Verify token is still valid
      const response = await fetch('https://utneaqmbyjwxaqrrarpc.supabase.co/auth/v1/user', {
        headers: {
          'Authorization': `Bearer ${result.userToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bmVhcW1ieWp3eGFxcnJhcnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzAzNzIsImV4cCI6MjA2ODAwNjM3Mn0.bYhOQUFOxVqXXPpF9WGHtILKfmHTOzUcbGmZ5-RIzxI'
        }
      });
      
      if (response.ok) {
        const user = await response.json();
        return { authenticated: true, user };
      } else {
        // Token expired, clear storage
        await chrome.storage.sync.remove(['userToken', 'userEmail']);
        return { authenticated: false };
      }
    }
    
    return { authenticated: false };
  } catch (error) {
    console.error('Auth check failed:', error);
    return { authenticated: false };
  }
}

async function loadMainInterface(user) {
  showSection('main');
  
  // Update user info
  document.getElementById('user-email').textContent = user.email;
  
  // Load stats
  await loadStats();
  
  // Load settings
  await loadSettings();
  
  // Setup event handlers
  setupMainHandlers();
}

async function loadStats() {
  try {
    const today = new Date().toDateString();
    const result = await chrome.storage.local.get([`protected_${today}`, `detected_${today}`]);
    
    document.getElementById('protected-count').textContent = result[`protected_${today}`] || 0;
    document.getElementById('detected-count').textContent = result[`detected_${today}`] || 0;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['autoDetect', 'showNotifications']);
    
    document.getElementById('auto-detect').checked = result.autoDetect !== false;
    document.getElementById('show-notifications').checked = result.showNotifications !== false;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

function setupAuthHandlers() {
  document.getElementById('login-btn').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://utneaqmbyjwxaqrrarpc.supabase.co'
    });
    window.close();
  });
}

function setupMainHandlers() {
  // Protect page button
  document.getElementById('protect-page-btn').addEventListener('click', async () => {
    const button = document.getElementById('protect-page-btn');
    const originalContent = button.innerHTML;
    
    try {
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="animate-spin">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <div>
          <span class="action-title">Protecting...</span>
          <span class="action-desc">Scanning page for artwork</span>
        </div>
      `;
      button.disabled = true;
      
      // Send message to content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'protect-all-images' });
      
      // Update stats
      await updateProtectedCount();
      
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div>
          <span class="action-title">Protected!</span>
          <span class="action-desc">Images protected successfully</span>
        </div>
      `;
      
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('Protection failed:', error);
      button.innerHTML = originalContent;
      button.disabled = false;
    }
  });
  
  // Scan page button
  document.getElementById('scan-page-btn').addEventListener('click', async () => {
    const button = document.getElementById('scan-page-btn');
    const originalContent = button.innerHTML;
    
    try {
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="animate-spin">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <div>
          <span class="action-title">Scanning...</span>
          <span class="action-desc">Looking for artwork</span>
        </div>
      `;
      button.disabled = true;
      
      // Send message to content script to count images
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'scan-images' });
      
      await updateDetectedCount(response.count || 0);
      
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div>
          <span class="action-title">Found ${response.count || 0}</span>
          <span class="action-desc">Protectable images detected</span>
        </div>
      `;
      
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('Scan failed:', error);
      button.innerHTML = originalContent;
      button.disabled = false;
    }
  });
  
  // Settings handlers
  document.getElementById('auto-detect').addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ autoDetect: e.target.checked });
  });
  
  document.getElementById('show-notifications').addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ showNotifications: e.target.checked });
  });
  
  // Footer buttons
  document.getElementById('dashboard-btn').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://utneaqmbyjwxaqrrarpc.supabase.co'
    });
    window.close();
  });
  
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });
}

async function updateProtectedCount() {
  try {
    const today = new Date().toDateString();
    const result = await chrome.storage.local.get([`protected_${today}`]);
    const newCount = (result[`protected_${today}`] || 0) + 1;
    
    await chrome.storage.local.set({ [`protected_${today}`]: newCount });
    document.getElementById('protected-count').textContent = newCount;
  } catch (error) {
    console.error('Error updating protected count:', error);
  }
}

async function updateDetectedCount(count) {
  try {
    const today = new Date().toDateString();
    await chrome.storage.local.set({ [`detected_${today}`]: count });
    document.getElementById('detected-count').textContent = count;
  } catch (error) {
    console.error('Error updating detected count:', error);
  }
}

function showSection(sectionName) {
  const sections = ['auth', 'main', 'loading'];
  sections.forEach(section => {
    const element = document.getElementById(`${section}-section`);
    if (element) {
      element.style.display = section === sectionName ? 'flex' : 'none';
    }
  });
}