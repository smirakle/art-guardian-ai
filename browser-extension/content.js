// TSMO AI Art Protection - Content Script
(function() {
  'use strict';

  let protectionOverlays = new Map();
  let isEnabled = true;

  // Initialize the content script
  function init() {
    addProtectionButtons();
    observeImageChanges();
    loadSettings();
  }

  // Load user settings
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['extensionEnabled', 'autoDetect']);
      isEnabled = result.extensionEnabled !== false; // Default to true
      
      if (result.autoDetect !== false) {
        detectArtworkPlatforms();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  // Add protection buttons to images
  function addProtectionButtons() {
    if (!isEnabled) return;

    const images = document.querySelectorAll('img');
    images.forEach(addProtectionButton);
  }

  function addProtectionButton(img) {
    // Skip if already has protection button or is too small
    if (img.dataset.tsmoProtected || img.naturalWidth < 100 || img.naturalHeight < 100) {
      return;
    }

    // Skip if image is likely a UI element (icons, thumbnails, etc.)
    if (isUIElement(img)) {
      return;
    }

    img.dataset.tsmoProtected = 'true';
    
    // Create protection overlay
    const overlay = createProtectionOverlay(img);
    
    // Position overlay relative to image
    positionOverlay(overlay, img);
    
    // Add to page
    document.body.appendChild(overlay);
    protectionOverlays.set(img, overlay);

    // Update position when window resizes
    const updatePosition = () => positionOverlay(overlay, img);
    window.addEventListener('resize', updatePosition);
    
    // Clean up when image is removed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === img) {
            removeProtectionOverlay(img);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function createProtectionOverlay(img) {
    const overlay = document.createElement('div');
    overlay.className = 'tsmo-protection-overlay';
    overlay.innerHTML = `
      <button class="tsmo-protect-btn" title="Protect with TSMO AI Protection">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7V12C2 17.55 5.84 22.54 11 23C16.16 22.54 20 17.55 20 12V7L12 2Z" 
                stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" 
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Protect
      </button>
    `;

    const button = overlay.querySelector('.tsmo-protect-btn');
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      protectImage(img);
    });

    return overlay;
  }

  function positionOverlay(overlay, img) {
    const rect = img.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    overlay.style.position = 'absolute';
    overlay.style.top = (rect.top + scrollTop + 10) + 'px';
    overlay.style.left = (rect.left + scrollLeft + 10) + 'px';
    overlay.style.zIndex = '10000';
  }

  function removeProtectionOverlay(img) {
    const overlay = protectionOverlays.get(img);
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      protectionOverlays.delete(img);
    }
  }

  function isUIElement(img) {
    const src = img.src.toLowerCase();
    const className = (img.className || '').toLowerCase();
    const parent = img.parentElement;

    // Skip common UI elements
    if (src.includes('icon') || src.includes('logo') || src.includes('avatar') ||
        src.includes('button') || src.includes('thumbnail') ||
        className.includes('icon') || className.includes('logo') ||
        className.includes('avatar') || className.includes('button')) {
      return true;
    }

    // Skip images in navigation or header areas
    if (parent) {
      const parentClass = (parent.className || '').toLowerCase();
      if (parentClass.includes('nav') || parentClass.includes('header') ||
          parentClass.includes('menu') || parentClass.includes('toolbar')) {
        return true;
      }
    }

    return false;
  }

  async function protectImage(img) {
    const button = protectionOverlays.get(img)?.querySelector('.tsmo-protect-btn');
    if (!button) return;

    // Show loading state
    button.disabled = true;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="animate-spin">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
      Protecting...
    `;

    try {
      const result = await chrome.runtime.sendMessage({
        action: 'protect-image',
        imageUrl: img.src
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Show success state
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" 
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Protected!
      `;
      button.style.background = '#10B981';
      button.style.color = 'white';

      // Add protected badge to image
      img.style.border = '2px solid #10B981';
      img.style.borderRadius = '4px';
      
    } catch (error) {
      console.error('Protection failed:', error);
      
      // Show error state
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" 
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Error
      `;
      button.style.background = '#EF4444';
      button.style.color = 'white';
      
      // Reset after delay
      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7V12C2 17.55 5.84 22.54 11 23C16.16 22.54 20 17.55 20 12V7L12 2Z" 
                  stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" 
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Protect
        `;
        button.style.background = '';
        button.style.color = '';
      }, 3000);
    }
  }

  // Detect popular artwork platforms and show enhanced features
  function detectArtworkPlatforms() {
    const hostname = window.location.hostname.toLowerCase();
    const artPlatforms = [
      'artstation.com',
      'deviantart.com',
      'behance.net',
      'dribbble.com',
      'instagram.com',
      'pinterest.com',
      'pixiv.net',
      'tumblr.com'
    ];

    if (artPlatforms.some(platform => hostname.includes(platform))) {
      addPlatformSpecificFeatures();
    }
  }

  function addPlatformSpecificFeatures() {
    // Add a floating action button for quick protection
    const fab = document.createElement('div');
    fab.className = 'tsmo-fab';
    fab.innerHTML = `
      <button class="tsmo-fab-btn" title="Quick Protect All Visible Images">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7V12C2 17.55 5.84 22.54 11 23C16.16 22.54 20 17.55 20 12V7L12 2Z" 
                stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </button>
    `;
    
    fab.querySelector('.tsmo-fab-btn').addEventListener('click', () => {
      protectAllVisibleImages();
    });
    
    document.body.appendChild(fab);
  }

  function protectAllVisibleImages() {
    const images = document.querySelectorAll('img');
    let protectedCount = 0;
    
    images.forEach(img => {
      if (!isUIElement(img) && isImageVisible(img)) {
        protectImage(img);
        protectedCount++;
      }
    });
    
    if (protectedCount > 0) {
      showNotification(`Protecting ${protectedCount} images...`);
    }
  }

  function isImageVisible(img) {
    const rect = img.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && 
           rect.bottom <= window.innerHeight && 
           rect.right <= window.innerWidth;
  }

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'tsmo-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Observe for new images added to the page
  function observeImageChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'IMG') {
              addProtectionButton(node);
            } else {
              const images = node.querySelectorAll('img');
              images.forEach(addProtectionButton);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Clean up overlays when page unloads
  window.addEventListener('beforeunload', () => {
    protectionOverlays.forEach((overlay, img) => {
      removeProtectionOverlay(img);
    });
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();