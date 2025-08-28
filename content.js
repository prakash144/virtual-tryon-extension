// Global flag to prevent duplicate button injection
let buttonInjected = false;

function findMainProductImage() {
  // Prefer Myntra CDN images
  let img = document.querySelector('img[src*="assets.myntassets.com"]');
  if (!img) {
    const imgs = [...document.querySelectorAll('img')].filter(i => i.width > 300 && i.height > 300);
    imgs.sort((a, b) => b.width * b.height - a.width * a.height);
    img = imgs[0] || null;
  }
  return img;
}

async function loadButtonPosition() {
  try {
    const { buttonPosition } = await chrome.storage.local.get(['buttonPosition']);
    // Return null if no saved position, so we can use smart default
    return buttonPosition || null;
  } catch (e) {
    console.warn('Failed to load button position:', e);
    return null;
  }
}

async function saveButtonPosition(position) {
  try {
    await chrome.storage.local.set({ buttonPosition: position });
  } catch (e) {
    console.warn('Failed to save button position:', e);
  }
}

function ensureUI(hostEl) {
  // If button already exists, don't add another
  if (hostEl.querySelector('.mto-try-btn')) return;

  hostEl.style.position = hostEl.style.position || 'relative';

  const btn = document.createElement('button');
  btn.textContent = 'Try On';
  btn.className = 'mto-try-btn';
  btn.addEventListener('click', () => triggerTryOn(hostEl));

  // --- Make button draggable with premium positioning ---
  let isDragging = false, offsetX = 0, offsetY = 0;

  // Set premium default position - bottom right corner
  const setPremiumPosition = () => {
    btn.style.bottom = '20px';
    btn.style.right = '20px';
    btn.style.top = 'auto';
    btn.style.left = 'auto';
  };

  // Load saved position or set premium default
  loadButtonPosition().then(position => {
    if (position && position.top && position.left) {
      // Use saved position if it exists
      btn.style.top = position.top;
      btn.style.left = position.left;
      btn.style.right = position.right;
      btn.style.bottom = position.bottom;
    } else {
      // Set premium default position
      setPremiumPosition();
    }
  });

  btn.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - btn.getBoundingClientRect().left;
    offsetY = e.clientY - btn.getBoundingClientRect().top;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    // Add premium visual feedback
    btn.style.transform = 'scale(0.95)';
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    const rect = hostEl.getBoundingClientRect();
    const newLeft = e.clientX - rect.left - offsetX;
    const newTop = e.clientY - rect.top - offsetY;
    
    // Constrain to container bounds with premium margins
    const margin = 20;
    const maxLeft = rect.width - btn.offsetWidth - margin;
    const maxTop = rect.height - btn.offsetHeight - margin;
    
    const constrainedLeft = Math.max(margin, Math.min(newLeft, maxLeft));
    const constrainedTop = Math.max(margin, Math.min(newTop, maxTop));
    
    btn.style.left = `${constrainedLeft}px`;
    btn.style.top = `${constrainedTop}px`;
    btn.style.right = 'auto';
    btn.style.bottom = 'auto';
  }

  function onMouseUp() {
    if (isDragging) {
      // Save position when dragging ends
      const position = {
        top: btn.style.top,
        right: btn.style.right,
        left: btn.style.left,
        bottom: btn.style.bottom
      };
      saveButtonPosition(position);
    }
    
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    
    // Remove premium visual feedback
    btn.style.transform = '';
  }
  // --- end draggable ---

  hostEl.appendChild(btn);
}


async function triggerTryOn(hostEl) {
  const img = hostEl.querySelector('img') || hostEl;
  const src = img.src;
  const btn = hostEl.querySelector('.mto-try-btn');
  
  console.log('Starting try-on process...');
  console.log('Product image source:', src);
  
  btn.classList.add('mto-loading');
  btn.textContent = '…';

  try {
    // Ask background to fetch image as dataURL (CORS-safe)
    console.log('Fetching product image as data URL...');
    const { dataUrl, error: fetchErr } = await chrome.runtime.sendMessage({
      type: 'MTO_FETCH_IMAGE_AS_DATAURL',
      url: src
    });
    
    if (fetchErr) {
      console.error('Failed to fetch image:', fetchErr);
      throw new Error(fetchErr);
    }
    
    console.log('Successfully fetched product image as data URL');
    console.log('Data URL length:', dataUrl ? dataUrl.length : 0);

    console.log('Sending request to generate try-on...');
    const { resultDataUrl, error } = await chrome.runtime.sendMessage({
      type: 'MTO_GENERATE',
      productImageDataUrl: dataUrl
    });
    
    if (error) {
      console.error('Try-on generation failed:', error);
      throw new Error(error);
    }

    console.log('Try-on generation successful!');
    console.log('Result data URL length:', resultDataUrl ? resultDataUrl.length : 0);
    
    img.src = resultDataUrl;
    console.log('Product image replaced with try-on result');
    
  } catch (e) {
    console.error('Try-on process failed:', e);
    alert('Try-on failed: ' + e.message);
  } finally {
    btn.classList.remove('mto-loading');
    btn.textContent = 'Try On';
  }
}

function init() {
  // Prevent duplicate initialization
  if (buttonInjected) return;
  
  const target = findMainProductImage();
  if (!target || !target.parentNode) return;

  let host = target.closest('.mto-host');
  if (!host) {
    host = document.createElement('div');
    host.className = 'mto-host';
    host.style.display = 'inline-block';
    target.parentNode.insertBefore(host, target);
    host.appendChild(target);
  }
  
  ensureUI(host);
  buttonInjected = true; // Mark as injected
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Reset flag when navigating to new pages
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    buttonInjected = false; // Reset flag for new page
  }
  
  // Only initialize if not already done and page is visible
  if (!buttonInjected && document.visibilityState === 'visible') {
    init();
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });
