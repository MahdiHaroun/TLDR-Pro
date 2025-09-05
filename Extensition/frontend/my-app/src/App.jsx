import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [wordCount, setWordCount] = useState(100)
  const [file, setFile] = useState(null)
  const [fileExtension, setFileExtension] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  // Function to get file extension
  const getFileExtension = (filename) => {
    if (!filename) return ''
    return filename.toLowerCase().split('.').pop()
  }

  // Function to check if file type is supported for specific endpoint
  const isFileTypeSupported = (extension, endpoint) => {
    const supportedTypes = {
      pdf: ['pdf'],
      'ms/word': ['doc', 'docx'],
      'ms/excel': ['xls', 'xlsx'],
      'ms/powerp': ['ppt', 'pptx']
    }
    return supportedTypes[endpoint]?.includes(extension) || false
  }

  // Function to get the correct endpoint for a file extension
  const getEndpointForFile = (extension) => {
    if (['doc', 'docx'].includes(extension)) return 'ms/word'
    if (['xls', 'xlsx'].includes(extension)) return 'ms/excel'
    if (['ppt', 'pptx'].includes(extension)) return 'ms/powerp'
    if (extension === 'pdf') return 'pdf'
    return null
  }

  // Function to check if any document type is supported
  const isDocumentSupported = (extension) => {
    return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)
  }

  // Handle file selection and set extension
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    if (selectedFile) {
      const extension = getFileExtension(selectedFile.name)
      setFileExtension(extension)
    } else {
      setFileExtension('')
    }
  }

  // Auto-fill current page URL when URL tab is selected
  useEffect(() => {
    if (activeTab === 'url' && !url) {
      if (chrome?.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.url) {
            setUrl(tabs[0].url)
          }
        })
      }
    }
  }, [activeTab, url])

  // Auto-fill selected text when extension popup opens
  useEffect(() => {
    if (chrome?.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelectedText' }, (response) => {
            if (response?.selectedText && response.selectedText.trim()) {
              setText(response.selectedText)
              setActiveTab('text')
            }
          })
        }
      })
    }
  }, [])

  const sendToBackground = (endpoint, data) => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'summarize',
        endpoint: endpoint,
        data: data
      }, (response) => {
        resolve(response)
      })
    })
  }

  const handleTextSummary = async () => {
    if (!text.trim()) return
    
    setLoading(true)
    try {
      const response = await sendToBackground('/text', {
        text: text,
        word_count: wordCount
      })
      
      if (response?.success) {
        setSummary(response.data.summary)
      } else {
        setSummary('Error occurred while summarizing text: ' + (response?.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error:', error)
      setSummary('Error occurred while summarizing text')
    }
    setLoading(false)
  }

  const handleUrlSummary = async () => {
    if (!url.trim()) return
    
    setLoading(true)
    try {
      const response = await sendToBackground('/url', {
        url: url,
        word_count: wordCount
      })
      
      if (response?.success) {
        setSummary(response.data.summary)
      } else {
        setSummary('Error occurred while summarizing URL: ' + (response?.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error:', error)
      setSummary('Error occurred while summarizing URL')
    }
    setLoading(false)
  }

  const handleFileSummary = async (endpoint) => {
    if (!file) return
    
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('word_count', wordCount.toString())
    
    try {
      // Make direct request for file uploads (can't pass FormData through extension messaging)
      const response = await fetch(`http://3.75.217.134/${endpoint}`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setSummary('Error occurred while summarizing file: ' + (errorData.detail || response.statusText))
      }
    } catch (error) {
      console.error('Error:', error)
      setSummary('Error occurred while summarizing file: ' + error.message)
    }
    setLoading(false)
  }

  const summarizeCurrentPage = async () => {
    if (!chrome?.tabs) return
    
    setLoading(true)
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tabs[0]?.id) {
        const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getPageText' })
        if (response?.pageText) {
          setText(response.pageText)
          setActiveTab('text')
          // Auto-summarize
          setTimeout(() => handleTextSummary(), 100)
        }
      }
    } catch (error) {
      console.error('Error getting page text:', error)
      setSummary('Error occurred while getting page content')
    }
    setLoading(false)
  }

  return (
    <div className="app extension-popup">
      <header>
        <h1>TLDR-Pro</h1>
        <p>Quick content summarizer</p>
      </header>

      {(activeTab === 'text' || activeTab === 'url') && (
        <div className="quick-actions">
          <button onClick={summarizeCurrentPage} disabled={loading} className="quick-btn">
            {loading ? 'Processing...' : '📄 Summarize This Page'}
          </button>
        </div>
      )}

      <nav className="tabs">
        <button 
          className={activeTab === 'text' ? 'active' : ''} 
          onClick={() => setActiveTab('text')}
        >
          Text
        </button>
        <button 
          className={activeTab === 'url' ? 'active' : ''} 
          onClick={() => setActiveTab('url')}
        >
          URL
        </button>
        <button 
          className={activeTab === 'pdf' ? 'active' : ''} 
          onClick={() => setActiveTab('pdf')}
        >
          PDF
        </button>
        <button 
          className={activeTab === 'documents' ? 'active' : ''} 
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
      </nav>

      <main className="content">
        <div className="input-section">
          <div className="word-count">
            <label htmlFor="wordCount">Length:</label>
            <input
              id="wordCount"
              type="number"
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value) || 100)}
              min="10"
              max="500"
            />
            <span>words</span>
          </div>

          {activeTab === 'text' && (
            <div className="text-input">
              <textarea
                placeholder="Paste text here or select text on page..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
              />
              <button onClick={handleTextSummary} disabled={loading || !text.trim()}>
                {loading ? 'Summarizing...' : 'Summarize Text'}
              </button>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="url-input">
              <input
                type="url"
                placeholder="Enter URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button onClick={handleUrlSummary} disabled={loading || !url.trim()}>
                {loading ? 'Summarizing...' : 'Summarize URL'}
              </button>
            </div>
          )}

          {activeTab === 'pdf' && (
            <div className="file-input">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
              />
              {file && (
                <div className="file-info">
                  <span className="file-name">📄 {file.name}</span>
                  <span className="file-extension">({fileExtension.toUpperCase()})</span>
                </div>
              )}
              <button 
                onClick={() => handleFileSummary('pdf')} 
                disabled={loading || !file || !isFileTypeSupported(fileExtension, 'pdf')}
                className={`file-button ${!isFileTypeSupported(fileExtension, 'pdf') ? 'disabled' : ''}`}
              >
                {loading ? 'Summarizing...' : 'Summarize PDF'}
              </button>
              {file && !isFileTypeSupported(fileExtension, 'pdf') && (
                <p className="error-message">Please select a PDF file (.pdf)</p>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="file-input">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
              {file && (
                <div className="file-info">
                  <span className="file-name">📄 {file.name}</span>
                  <span className="file-extension">({fileExtension.toUpperCase()})</span>
                </div>
              )}
              <button 
                onClick={() => handleFileSummary(getEndpointForFile(fileExtension))} 
                disabled={loading || !file || !isDocumentSupported(fileExtension)}
                className={`file-button ${!isDocumentSupported(fileExtension) ? 'disabled' : ''}`}
              >
                {loading ? 'Summarizing...' : '� Summarize Document'}
              </button>
              {file && !isDocumentSupported(fileExtension) && (
                <p className="error-message">
                  Please select a supported document: Word (.doc, .docx), Excel (.xls, .xlsx), or PowerPoint (.ppt, .pptx)
                </p>
              )}
            </div>
          )}
        </div>

        {summary && (
          <div className="summary-section">
            <h3>Summary:</h3>
            <div className="summary-content">
              {summary}
            </div>
            <button onClick={() => setSummary('')} className="clear-btn">
              Clear
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
