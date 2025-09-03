// Background service worker for TLDR-Pro Chrome Extension

// Install event
chrome.runtime.onInstalled.addListener(() => {
  console.log('TLDR-Pro extension installed');
  
  // Create context menu items
  chrome.contextMenus.create({
    id: "summarize-text",
    title: "Summarize selected text",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "summarize-page",
    title: "Summarize this page",
    contexts: ["page"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarize-text") {
    // Send selected text to content script
    chrome.tabs.sendMessage(tab.id, {
      action: "summarizeSelection",
      text: info.selectionText
    });
  } else if (info.menuItemId === "summarize-page") {
    // Send page URL to content script
    chrome.tabs.sendMessage(tab.id, {
      action: "summarizePage",
      url: tab.url
    });
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    // Handle different types of requests
    if (request.data instanceof FormData || request.isFormData) {
      // For file uploads, we need to handle this differently
      // Since FormData can't be passed through message passing,
      // we'll need the popup to make the request directly
      sendResponse({ 
        success: false, 
        error: "File uploads not supported through extension messaging. Use direct fetch from popup." 
      });
      return true;
    }
    
    // Forward text/URL summarization request to backend
    fetch('http://localhost:8000' + request.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.data)
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ success: true, data: data });
    })
    .catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    
    // Return true to indicate we will respond asynchronously
    return true;
  }
});
