// Helper: fetch an image URL as data URL from the background (bypasses page CORS)
async function fetchImageAsDataURL(url) {
  try {
    // First try with normal fetch (works for same-origin and CORS-enabled resources)
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    const blob = await resp.blob();
    return await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result); // data:<mime>;base64,...
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Failed to fetch image with normal mode, trying no-cors:', error);
    // Fallback to no-cors mode for some CDNs
    try {
      const resp = await fetch(url, { mode: 'no-cors' });
      const blob = await resp.blob();
      return await new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(blob);
      });
    } catch (fallbackError) {
      throw new Error(`Failed to fetch image: ${error.message}. Fallback also failed: ${fallbackError.message}`);
    }
  }
}

function imagePartFromDataURL(defaultMime, dataUrl) {
  const match = /^data:(.+?);base64,(.+)$/.exec(dataUrl);
  const mimeType = match ? match[1] : defaultMime;
  const data = match ? match[2] : dataUrl.split(',').pop();
  
  // Validate that we have actual base64 data
  if (!data || data.length < 100) {
    throw new Error('Invalid image data URL - missing or too short base64 data');
  }
  
  return { inline_data: { mime_type: mimeType, data } };
}

async function generateTryOn({ productImageDataUrl }) {
  const { userPhotoDataUrl, geminiApiKey } = await chrome.storage.local.get([
    'userPhotoDataUrl',
    'geminiApiKey'
  ]);

  if (!geminiApiKey) return { error: 'Missing Gemini API key. Open the extension popup and save it.' };
  if (!userPhotoDataUrl) return { error: 'Missing your photo. Open the extension popup and upload it.' };

  // Validate image data URLs
  try {
    if (!userPhotoDataUrl.startsWith('data:image/')) {
      return { error: 'Invalid user photo format. Please re-upload your photo.' };
    }
    if (!productImageDataUrl.startsWith('data:image/')) {
      return { error: 'Invalid product image format. Please try again.' };
    }
  } catch (e) {
    return { error: 'Image validation failed: ' + e.message };
  }

  // Use gemini-1.5-pro which supports image generation
  const MODEL = 'gemini-1.5-pro';

  const body = {
    contents: [
      {
        parts: [
          {
            text:
                `You are an AI image generator. You MUST respond with an image, not text.

TASK: Generate a virtual try-on image.

INPUT: 
- Image 1: A person's photo
- Image 2: A clothing product image

INSTRUCTIONS:
1. Take the clothing from the product image
2. Fit it onto the person in the first image
3. Keep the person's original pose, body shape, and background
4. Maintain realistic lighting and proportions
5. Create a seamless, natural-looking result

CRITICAL: Respond with ONLY the generated image. Do not include any text explanation.`
          },
          imagePartFromDataURL('image/jpeg', userPhotoDataUrl),
          imagePartFromDataURL('image/jpeg', productImageDataUrl)
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      topK: 32,
      topP: 0.8,
      maxOutputTokens: 2048,
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

  // Retry logic for rate limits
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      console.log(`Sending request to Gemini API using ${MODEL}... (attempt ${retryCount + 1})`);
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (resp.status === 429) {
        // Rate limit hit - extract retry delay from response
        const errorData = await resp.json();
        let retryDelay = 12000; // Default 12 seconds
        
        try {
          const retryInfo = errorData.error?.details?.find(detail => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
          if (retryInfo?.retryDelay) {
            retryDelay = parseInt(retryInfo.retryDelay.replace('s', '')) * 1000;
          }
        } catch (e) {
          console.warn('Could not parse retry delay, using default');
        }

        retryCount++;
        if (retryCount <= maxRetries) {
          console.log(`Rate limit hit. Retrying in ${retryDelay/1000} seconds... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        } else {
          return { error: 'Rate limit exceeded. Please wait a few minutes and try again, or upgrade your Gemini API plan.' };
        }
      }

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error(`Gemini API HTTP error:`, resp.status, errorText);
        return { error: `Gemini API error: ${resp.status} ${resp.statusText}. ${errorText}` };
      }

      const data = await resp.json();
      
      // Debug: Log the full response structure
      console.log('Gemini API Response:', JSON.stringify(data, null, 2));
      
      // Check for error in response
      if (data.error) {
        return { error: `Gemini API error: ${data.error.message || data.error}` };
      }
      
      // Try multiple possible response structures
      let b64 = null;
      
      // Structure 1: Standard Gemini response
      if (data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data) {
        b64 = data.candidates[0].content.parts[0].inline_data.data;
      }
      // Structure 2: Check if there are any parts with inline_data
      else if (data?.candidates?.[0]?.content?.parts) {
        const imagePart = data.candidates[0].content.parts.find(part => part.inline_data?.data);
        if (imagePart) {
          b64 = imagePart.inline_data.data;
        }
      }
      // Structure 3: If it's text instead of image, that's an error
      else if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const textResponse = data.candidates[0].content.parts[0].text;
        
        // Check if the text describes an image (like markdown or HTML)
        if (textResponse.includes('```image') || 
            textResponse.includes('<image') || 
            textResponse.includes('src=') ||
            textResponse.includes('person_with_new_shirt') ||
            textResponse.includes('generated image')) {
          return { 
            error: `Gemini returned a text description instead of an actual image. This indicates that the current Gemini models don't support virtual try-on image generation. The model said: "${textResponse.substring(0, 100)}..."` 
          };
        }
        
        return { error: `Gemini returned text instead of image: ${textResponse}` };
      }
      
      if (!b64) {
        console.error('Unexpected Gemini response structure:', data);
        console.error('Response keys:', Object.keys(data));
        if (data.candidates) {
          console.error('Candidates structure:', data.candidates);
        }
        return { error: 'No image returned by the model. Check the console for response details.' };
      }
      
      console.log('Successfully extracted image data from Gemini response');
      return { resultDataUrl: `data:image/png;base64,${b64}` };

    } catch (error) {
      console.error('Network error calling Gemini API:', error);
      retryCount++;
      if (retryCount <= maxRetries) {
        console.log(`Network error. Retrying in 5 seconds... (${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      return { error: `Network error: ${error.message}` };
    }
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg.type === 'MTO_FETCH_IMAGE_AS_DATAURL') {
        const dataUrl = await fetchImageAsDataURL(msg.url);
        sendResponse({ dataUrl });
      } else if (msg.type === 'MTO_GENERATE') {
        const out = await generateTryOn(msg);
        sendResponse(out);
      } else {
        sendResponse({ error: 'Unknown message type' });
      }
    } catch (e) {
      console.error('Background script error:', e);
      sendResponse({ error: e.message });
    }
  })();
  return true; // keep message channel open
});
