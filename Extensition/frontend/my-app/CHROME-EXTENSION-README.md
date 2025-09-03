# TLDR-Pro Chrome Extension

A simple and powerful Chrome extension for summarizing any content quickly and easily.

## Features

- **Text Summarization**: Summarize any selected text or pasted content
- **URL Summarization**: Summarize web pages and YouTube videos
- **File Summarization**: Summarize PDFs, Word documents, Excel files, and PowerPoint presentations
- **Context Menu Integration**: Right-click on selected text or pages to summarize
- **Quick Page Summary**: One-click button to summarize the current page
- **Customizable Length**: Choose summary length from 10-500 words

## Installation

### Development Setup

1. **Start the Backend Server**:
   ```bash
   cd /home/mahdi/projects/TLDR-Pro/Extensition/backend
   python -m uvicorn main:app --reload
   ```

2. **Build the Extension**:
   ```bash
   cd /home/mahdi/projects/TLDR-Pro/Extensition/frontend/my-app
   npm run build
   ```

3. **Install in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `dist` folder: `/home/mahdi/projects/TLDR-Pro/Extensition/frontend/my-app/dist`

## Usage

### Extension Popup
1. Click the TLDR-Pro extension icon in your Chrome toolbar
2. Choose between Text, URL, or Files tabs
3. Set your preferred summary length (10-500 words)
4. Use the features:
   - **Quick Page Summary**: Click "📄 Summarize This Page" for instant page summarization
   - **Text**: Paste text or use auto-filled selected text
   - **URL**: Enter any URL or use auto-filled current page URL
   - **Files**: Upload PDF, Word, Excel, or PowerPoint files

### Context Menu (Right-click)
1. Select any text on a webpage
2. Right-click and choose "Summarize selected text"
3. Or right-click anywhere on a page and choose "Summarize this page"

## File Structure

```
dist/
├── index.html          # Extension popup HTML
├── popup.js           # Main popup React application
├── popup.css          # Popup styles
├── background.js      # Extension background service worker
├── content.js         # Content script for webpage interaction
└── manifest.json      # Chrome extension manifest
```

## API Endpoints

The extension communicates with these backend endpoints:

- `POST /text` - Summarize plain text
- `POST /url` - Summarize web pages/YouTube videos
- `POST /pdf` - Summarize PDF files
- `POST /word` - Summarize Word documents
- `POST /excel` - Summarize Excel files
- `POST /powerp` - Summarize PowerPoint files

## Technical Notes

- **CORS**: The backend is configured to accept requests from Chrome extensions
- **File Uploads**: File processing is handled directly from the popup to avoid Chrome extension messaging limitations
- **Permissions**: The extension requires `activeTab`, `storage`, `scripting`, and `contextMenus` permissions
- **Host Permissions**: Allows communication with localhost:8000 and all web pages

## Troubleshooting

1. **Extension not working**: Make sure the backend server is running on port 8000
2. **CORS errors**: Verify the backend CORS settings include Chrome extension origins
3. **File upload errors**: Ensure the file is a supported format (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)
4. **No context menu**: Refresh the page after installing the extension

## Development

To make changes:

1. Edit source files in `src/`
2. Run `npm run build` to rebuild
3. Click the refresh icon on the extension in `chrome://extensions/`
4. Test your changes

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers
