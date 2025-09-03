import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [wordCount, setWordCount] = useState(100)
  const [file, setFile] = useState(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

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
      const response = await sendToBackground(`/${endpoint}`, formData)
      
      if (response?.success) {
        setSummary(response.data.summary)
      } else {
        setSummary('Error occurred while summarizing file: ' + (response?.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error:', error)
      setSummary('Error occurred while summarizing file')
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

      <div className="quick-actions">
        <button onClick={summarizeCurrentPage} disabled={loading} className="quick-btn">
          {loading ? 'Processing...' : '📄 Summarize This Page'}
        </button>
      </div>

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
          className={activeTab === 'files' ? 'active' : ''} 
          onClick={() => setActiveTab('files')}
        >
          Files
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

          {activeTab === 'files' && (
            <div className="file-input">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
              <div className="file-buttons">
                <button 
                  onClick={() => handleFileSummary('pdf')} 
                  disabled={loading || !file}
                  className="small-btn"
                >
                  PDF
                </button>
                <button 
                  onClick={() => handleFileSummary('word')} 
                  disabled={loading || !file}
                  className="small-btn"
                >
                  Word
                </button>
                <button 
                  onClick={() => handleFileSummary('excel')} 
                  disabled={loading || !file}
                  className="small-btn"
                >
                  Excel
                </button>
                <button 
                  onClick={() => handleFileSummary('powerp')} 
                  disabled={loading || !file}
                  className="small-btn"
                >
                  PowerPoint
                </button>
              </div>
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
