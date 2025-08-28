const photoInput = document.getElementById('photo');
const preview = document.getElementById('preview');
const apikeyEl = document.getElementById('apikey');
const saveBtn = document.getElementById('save');
const statusEl = document.getElementById('status');
const toggleKey = document.getElementById('toggleKey');

function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = isError ? 'error' : 'ok';
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = '';
  }, 3000);
}

async function loadSettings() {
  try {
    const { userPhotoDataUrl, geminiApiKey } = await chrome.storage.local.get([
      'userPhotoDataUrl',
      'geminiApiKey'
    ]);
    
    if (userPhotoDataUrl) {
      preview.src = userPhotoDataUrl;
      preview.style.display = 'block';
    }
    
    if (geminiApiKey) {
      apikeyEl.value = geminiApiKey;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
    showStatus('Failed to load saved settings', true);
  }
}

photoInput.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showStatus('Please select an image file', true);
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showStatus('Image file too large (max 5MB)', true);
    return;
  }
  
  try {
    const dataUrl = await fileToDataURL(file);
    preview.src = dataUrl;
    preview.style.display = 'block';
    showStatus('Photo loaded successfully');
  } catch (error) {
    console.error('Failed to load photo:', error);
    showStatus('Failed to load photo', true);
  }
});

saveBtn.addEventListener('click', async () => {
  const updates = {};
  let hasChanges = false;
  
  // Validate API key format
  const apiKey = apikeyEl.value.trim();
  if (apiKey) {
    if (!apiKey.startsWith('AIza')) {
      showStatus('Invalid API key format (should start with AIza)', true);
      return;
    }
    updates.geminiApiKey = apiKey;
    hasChanges = true;
  }
  
  // Save photo if available
  if (preview.src && preview.src !== 'data:,' && preview.style.display !== 'none') {
    updates.userPhotoDataUrl = preview.src;
    hasChanges = true;
  }
  
  if (!hasChanges) {
    showStatus('No changes to save');
    return;
  }
  
  try {
    await chrome.storage.local.set(updates);
    showStatus('Settings saved successfully!');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatus('Failed to save settings', true);
  }
});

toggleKey.addEventListener('click', () => {
  if (apikeyEl.type === 'password') {
    apikeyEl.type = 'text';
    toggleKey.textContent = '🙈 Hide';
  } else {
    apikeyEl.type = 'password';
    toggleKey.textContent = '👁️ Show';
  }
});

// Load settings when popup opens
loadSettings();
