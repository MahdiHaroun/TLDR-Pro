// Content script for TLDR-Pro Chrome Extension

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeSelection") {
    showSummaryPopup(request.text, "text");
  } else if (request.action === "summarizePage") {
    const pageText = extractPageText();
    showSummaryPopup(pageText, "text");
  } else if (request.action === "getSelectedText") {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ selectedText: selectedText });
  } else if (request.action === "getPageText") {
    const pageText = extractPageText();
    sendResponse({ pageText: pageText });
  }
  
  return true; // Indicates we will send a response asynchronously
});

// Extract text content from the current page
function extractPageText() {
  // Remove script and style elements
  const scripts = document.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());
  
  // Get main content areas
  const contentSelectors = [
    'article',
    'main',
    '[role="main"]',
    '.content',
    '.post',
    '.article',
    'body'
  ];
  
  let content = '';
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      content = element.innerText;
      break;
    }
  }
  
  // Clean up the text
  return content
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
    .substring(0, 5000); // Limit to 5000 characters
}

// Show floating summary popup
function showSummaryPopup(text, type) {
  // Remove existing popup if any
  const existingPopup = document.getElementById('tldr-pro-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Create popup container
  const popup = document.createElement('div');
  popup.id = 'tldr-pro-popup';
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    max-height: 500px;
    background: white;
    border: 2px solid #3498db;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow-y: auto;
  `;
  
  // Create popup content
  popup.innerHTML = `
    <div style="margin-bottom: 15px;">
      <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 18px;">TLDR-Pro Summary</h3>
      <button id="tldr-close-btn" style="
        position: absolute;
        top: 10px;
        right: 10px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        cursor: pointer;
        font-size: 14px;
      ">×</button>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-weight: 500;">Word Count:</label>
      <input id="tldr-word-count" type="number" value="100" min="10" max="500" style="
        width: 80px;
        padding: 5px;
        border: 1px solid #bdc3c7;
        border-radius: 4px;
      ">
    </div>
    
    <button id="tldr-summarize-btn" style="
      width: 100%;
      background: #3498db;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 15px;
    ">Generate Summary</button>
    
    <div id="tldr-summary-result" style="
      min-height: 60px;
      padding: 10px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      font-size: 14px;
      line-height: 1.5;
    ">Click "Generate Summary" to create a summary...</div>
  `;
  
  document.body.appendChild(popup);
  
  // Add event listeners
  document.getElementById('tldr-close-btn').addEventListener('click', () => {
    popup.remove();
  });
  
  document.getElementById('tldr-summarize-btn').addEventListener('click', () => {
    const wordCount = document.getElementById('tldr-word-count').value;
    const btn = document.getElementById('tldr-summarize-btn');
    const resultDiv = document.getElementById('tldr-summary-result');
    
    btn.textContent = 'Summarizing...';
    btn.disabled = true;
    resultDiv.textContent = 'Processing your request...';
    
    // Send request to background script
    chrome.runtime.sendMessage({
      action: 'summarize',
      endpoint: '/text',
      data: {
        text: text,
        word_count: parseInt(wordCount)
      }
    }, (response) => {
      btn.textContent = 'Generate Summary';
      btn.disabled = false;
      
      if (response && response.success) {
        resultDiv.textContent = response.data.summary;
      } else {
        resultDiv.textContent = 'Error: ' + (response?.error || 'Failed to generate summary');
        resultDiv.style.color = '#e74c3c';
      }
    });
  });
}

// Add CSS for better integration
const style = document.createElement('style');
style.textContent = `
  #tldr-pro-popup * {
    box-sizing: border-box;
  }
  
  #tldr-pro-popup button:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  #tldr-pro-popup button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
document.head.appendChild(style);
