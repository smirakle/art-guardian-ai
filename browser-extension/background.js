// TSMO AI Art Protection - Background Script
const API_BASE_URL = 'https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1';
const EXTENSION_TOKEN = 'your-extension-token-here'; // This should be configured per user

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for images
  chrome.contextMenus.create({
    id: 'protect-image',
    title: 'Protect with TSMO AI Protection',
    contexts: ['image']
  });

  // Create context menu for selection (for artwork URLs)
  chrome.contextMenus.create({
    id: 'protect-selection',
    title: 'Protect Selected Artwork URL',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'protect-image') {
    await protectImage(info.srcUrl, tab);
  } else if (info.menuItemId === 'protect-selection') {
    await protectSelection(info.selectionText, tab);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'protect-image') {
    protectImage(request.imageUrl, sender.tab)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'get-protection-status') {
    checkProtectionStatus(request.imageUrl)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

async function protectImage(imageUrl, tab) {
  try {
    // Get user's auth token from storage
    const result = await chrome.storage.sync.get(['userToken']);
    const userToken = result.userToken;

    if (!userToken) {
      // Show login popup
      await chrome.tabs.create({
        url: 'https://utneaqmbyjwxaqrrarpc.supabase.co'
      });
      return { error: 'Please log in to your TSMO account first' };
    }

    const response = await fetch(`${API_BASE_URL}/one-click-protect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        'x-extension-token': EXTENSION_TOKEN
      },
      body: JSON.stringify({
        title: `Protection Request from ${tab.title}`,
        source: tab.url,
        file_url: imageUrl,
        metadata: {
          page_title: tab.title,
          page_url: tab.url,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Protection request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Show success notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'TSMO AI Protection',
      message: 'Image protection request submitted successfully!'
    });

    // Update badge
    chrome.action.setBadgeText({
      text: '✓',
      tabId: tab.id
    });
    chrome.action.setBadgeBackgroundColor({ color: '#10B981' });

    return { success: true, data };
  } catch (error) {
    console.error('Protection error:', error);
    
    // Show error notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'TSMO AI Protection Error',
      message: error.message
    });

    return { error: error.message };
  }
}

async function protectSelection(selectedText, tab) {
  // Try to extract URL from selection
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = selectedText.match(urlRegex);
  
  if (urls && urls.length > 0) {
    return await protectImage(urls[0], tab);
  } else {
    return { error: 'No valid image URL found in selection' };
  }
}

async function checkProtectionStatus(imageUrl) {
  try {
    // This would check if an image is already protected
    // For now, we'll return a simple response
    return { protected: false };
  } catch (error) {
    return { error: error.message };
  }
}

// Update badge when tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  chrome.action.setBadgeText({ text: '' });
});

// Clear badge when navigating
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});