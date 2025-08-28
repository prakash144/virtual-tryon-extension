# 👕 Myntra Virtual Try-On Chrome Extension

> A premium Chrome extension that allows you to virtually try on Myntra clothing items using your own photo and Google's Gemini 1.5 Pro AI model.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome)](https://chrome.google.com/webstore)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)](https://developer.chrome.com/docs/extensions/mv3/)
[![License](https://img.shields.io/badge/License-Educational-orange)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)
- [Limitations](#limitations)
- [Alternatives](#alternatives)
- [Privacy](#privacy)
- [Requirements](#requirements)

---

## 🎯 Overview

This Chrome extension provides a seamless virtual try-on experience for Myntra product pages. Upload your photo once, and see yourself wearing products directly on the product page using AI-powered image generation.

### ✨ What Makes It Special

- **🎨 Premium UI/UX**: Modern glass morphism design with smooth animations
- **🎯 Smart Positioning**: Intelligent button placement that doesn't interfere with content
- **💾 Persistent Settings**: Your preferences are saved and restored automatically
- **🔄 Rate Limit Handling**: Built-in retry logic for API quota management
- **🔒 Privacy First**: All data stored locally in your browser

---

## ⚠️ Important Notes

### 🚫 Confirmed Limitations

**Current Status**: The extension is fully functional for UI and image processing, but **Gemini models do NOT support virtual try-on image generation**.

#### ✅ What Works Perfectly
- Extension UI and button functionality
- Image detection and processing
- API communication and error handling
- Draggable button with position persistence
- Rate limit handling and retry logic
- Premium UI/UX experience

#### ❌ Confirmed Limitations
- **Gemini models return text descriptions instead of actual images**
- **Virtual try-on image generation is not supported by current Gemini models**
- **Models describe what an image would look like rather than generating it**

### 📊 Rate Limits & Quotas

The Gemini API has strict rate limits on the free tier:

| Limit Type | Description |
|------------|-------------|
| **Daily Requests** | Limited number per day |
| **Requests per Minute** | Limited requests per minute |
| **Input Tokens** | Limited tokens per minute |

#### 🔧 Built-in Solutions
- ✅ **Automatic Retry**: Extension retries with delays when rate limited
- ✅ **Smart Waiting**: Intelligent backoff strategy
- ✅ **Clear Feedback**: User-friendly error messages
- ✅ **Plan Upgrade**: Guidance for paid API plans

---

## 🚀 Features

### Core Functionality
- **🎯 Virtual Try-On**: Replace Myntra product models with your own photo
- **🎮 Draggable Button**: Move the "Try On" button anywhere on the product image
- **💾 Position Persistence**: Button position saved across page refreshes
- **🔍 Smart Image Detection**: Automatically finds main product images on Myntra pages

### Technical Excellence
- **🛡️ CORS-Safe**: Handles image fetching through background script
- **🎨 Premium UI**: Modern glass morphism design with smooth animations
- **⚡ Performance**: Optimized for speed and responsiveness
- **📱 Responsive**: Works perfectly on all screen sizes

### User Experience
- **🎨 Modern Interface**: Clean, intuitive popup design
- **🔄 Rate Limit Handling**: Automatic retry logic for API quota issues
- **📊 Real-time Feedback**: Clear status messages and error handling
- **🔒 Privacy Focused**: Local storage for all sensitive data

---

## 📦 Installation

### Prerequisites
- Chrome browser (version 88+)
- Active internet connection
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Step-by-Step Installation

1. **📥 Download the Extension**
   ```bash
   git clone https://github.com/your-username/virtual-tryon-extension.git
   cd virtual-tryon-extension
   ```

2. **🌐 Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)

3. **📁 Load Extension**
   - Click **"Load unpacked"**
   - Select the extension folder

4. **✅ Verify Installation**
   - Extension should appear in your extensions list
   - Look for the extension icon in your Chrome toolbar

---

## ⚙️ Setup

### Initial Configuration

1. **🔧 Open Extension Popup**
   - Click the extension icon in your Chrome toolbar

2. **📸 Upload Your Photo**
   - Click "Choose File" in the "Your Photo" section
   - Select a clear, front-facing photo
   - Maximum file size: 5MB

3. **🔑 Enter API Key**
   - Paste your Gemini API key (starts with "AIza...")
   - Click the eye icon to show/hide the key

4. **💾 Save Settings**
   - Click "Save Settings" button
   - Wait for confirmation message

### API Key Setup

1. **🌐 Visit Google AI Studio**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)

2. **🔑 Create API Key**
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key

3. **📋 Add to Extension**
   - Paste the key in the extension popup
   - Save your settings

---

## 🎮 Usage

### Basic Usage

1. **🛍️ Navigate to Myntra**
   - Go to any Myntra product page
   - Ensure the page has product images

2. **🎯 Locate the Button**
   - Look for the **"TRY ON"** button on product images
   - Button appears in bottom-right corner by default

3. **🎮 Interact with Button**
   - **Click**: Attempt virtual try-on generation
   - **Drag**: Reposition button anywhere on the image
   - **Hover**: See smooth animations and effects

4. **⏳ Wait for Processing**
   - Button shows loading state during processing
   - Check console for detailed progress information

### Advanced Features

- **🎯 Smart Positioning**: Button automatically positions itself optimally
- **💾 Memory**: Button position is remembered across sessions
- **🔄 Retry Logic**: Automatic retries for rate limit issues
- **📊 Debug Info**: Detailed console logging for troubleshooting

---

## 🔧 Technical Details

### Architecture

```
├── manifest.json      # Extension configuration (Manifest V3)
├── content.js         # Content script for Myntra pages
├── background.js      # Background service worker
├── popup.html         # Settings popup interface
├── popup.js          # Popup functionality
├── styles.css        # Styling for injected elements
├── icons/            # Extension icons
└── README.md         # Documentation
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Manifest** | Manifest V3 | Modern extension framework |
| **Content Script** | Vanilla JavaScript | Page interaction |
| **Background** | Service Worker | API communication |
| **UI** | HTML5 + CSS3 | Premium interface |
| **Storage** | Chrome Storage API | Local data persistence |

### Key Features

- **🎯 Manifest V3**: Latest Chrome extension standard
- **🔄 Service Worker**: Background processing and API calls
- **💾 Local Storage**: Secure data persistence
- **🛡️ CORS Handling**: Safe cross-origin requests
- **⚡ Performance**: Optimized for speed

---

## 🔍 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Button not appearing** | Ensure you're on a Myntra product page with images |
| **API errors** | Check your Gemini API key and permissions |
| **Rate limit errors (429)** | Wait a few minutes and try again |
| **Image not loading** | Refresh the page or check internet connection |
| **CORS errors** | Extension handles this automatically |
| **No image generation** | Check console logs for detailed error messages |

### Debug Information

- **Console Logs**: Open DevTools (F12) to see detailed information
- **Network Tab**: Monitor API requests and responses
- **Storage**: Check Chrome Storage for saved settings

### Error Messages

- **"Text description instead of image"**: Confirms Gemini limitation
- **"Rate limit exceeded"**: Wait or upgrade API plan
- **"Invalid API key"**: Check key format and permissions

---

## 🚫 Limitations

### Current Limitations

1. **🤖 AI Model Limitation**
   - Gemini models don't support virtual try-on generation
   - Models return text descriptions instead of images
   - This is a confirmed limitation of current Gemini models

2. **📊 API Quotas**
   - Free tier has strict rate limits
   - Daily and per-minute request limits
   - Token usage restrictions

3. **🌐 Browser Compatibility**
   - Chrome browser required (version 88+)
   - Manifest V3 support needed

### Workarounds

- **🔄 Retry Logic**: Built-in automatic retries
- **⏰ Smart Waiting**: Intelligent backoff strategies
- **📊 Clear Feedback**: User-friendly error messages

---

## 🔄 Alternatives

### Recommended Solutions

#### 1. 🎯 Replicate API (Recommended)
**Best for virtual try-on applications**
- **InstantID**: Specialized virtual try-on models
- **Stable Diffusion**: Advanced clothing visualization
- **Better Results**: Optimized for fashion applications

#### 2. 🤖 OpenAI DALL-E API
**Reliable image generation**
- **More Reliable**: Better image generation capabilities
- **Fashion Aware**: Better understanding of clothing
- **Higher Success Rate**: More consistent results

#### 3. 🏠 Local Models
**For advanced users**
- **ComfyUI**: With virtual try-on models
- **Automatic1111**: With specialized extensions
- **Privacy**: Run locally for unlimited usage

#### 4. ⏳ Future Updates
**Wait for improvements**
- Google may release new Gemini models
- Better image generation capabilities
- Virtual try-on support

---

## 🔒 Privacy

### Data Handling

- **📱 Local Storage**: All data stored in your browser
- **🔒 No External Servers**: Except for Gemini API calls
- **🛡️ Secure**: No data collection or tracking
- **🗑️ User Control**: You control all your data

### What We Store

| Data Type | Location | Purpose |
|-----------|----------|---------|
| **User Photo** | Local Storage | Virtual try-on processing |
| **API Key** | Local Storage | Gemini API authentication |
| **Button Position** | Local Storage | UI preferences |
| **Settings** | Local Storage | User preferences |

### What We Don't Store

- ❌ **Personal Information**: No name, email, or personal data
- ❌ **Browsing History**: No tracking of your browsing
- ❌ **Product Data**: No storage of Myntra product information
- ❌ **Generated Images**: No storage of AI-generated content

---

## 📋 Requirements

### System Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Chrome Browser** | 88+ | Manifest V3 support |
| **Operating System** | Any | Windows, macOS, Linux |
| **Internet Connection** | Required | For API communication |
| **Memory** | 50MB+ | Extension storage |

### API Requirements

- **Gemini API Key**: Valid API key from Google AI Studio
- **API Permissions**: Proper permissions for image generation
- **Rate Limits**: Understanding of API quotas

### Browser Permissions

- **Storage**: For saving settings and preferences
- **Active Tab**: For interacting with Myntra pages
- **Scripting**: For content script injection

---

## 📄 License

This project is for **educational purposes** only. Please respect:

- **Myntra's Terms of Service**: Respect their platform policies
- **Google's API Usage**: Follow Gemini API guidelines
- **Privacy Laws**: Comply with local privacy regulations

### Educational Use

- ✅ **Learning**: Study the code and implementation
- ✅ **Personal Use**: Use for your own projects
- ✅ **Research**: Academic and research purposes

### Commercial Use

- ❌ **Commercial**: Not intended for commercial use
- ❌ **Redistribution**: Don't redistribute without permission
- ❌ **Modification**: Respect original author's rights

---

## 🤝 Contributing

### How to Contribute

1. **🐛 Report Issues**: Use GitHub issues for bug reports
2. **💡 Suggest Features**: Share ideas for improvements
3. **📝 Improve Documentation**: Help make docs better
4. **🔧 Code Contributions**: Submit pull requests

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/virtual-tryon-extension.git

# Navigate to directory
cd virtual-tryon-extension

# Load in Chrome
# Follow installation instructions above
```

---

## 📞 Support

### Getting Help

- **📖 Documentation**: Check this README first
- **🐛 Issues**: Report bugs on GitHub
- **💬 Discussions**: Join community discussions
- **📧 Contact**: Reach out for support

### Resources

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/)

---

<div align="center">

**Made with ❤️ for the fashion and tech community**

[![Chrome](https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome)](https://chrome.google.com/webstore)
[![License](https://img.shields.io/badge/License-Educational-orange)](LICENSE)

</div>
