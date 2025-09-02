import { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [wordCount, setWordCount] = useState(100)
  const [file, setFile] = useState(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTextSummary = async () => {
    if (!text.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          word_count: wordCount
        })
      })
      const data = await response.json()
      setSummary(data.summary)
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
      const response = await fetch('http://localhost:8000/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          word_count: wordCount
        })
      })
      const data = await response.json()
      setSummary(data.summary)
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
      const response = await fetch(`http://localhost:8000/ms/${endpoint}`, {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      setSummary(data.summary)
    } catch (error) {
      console.error('Error:', error)
      setSummary('Error occurred while summarizing file')
    }
    setLoading(false)
  }

  return (
    <div className="app">
      <header>
        <h1>TLDR-Pro</h1>
        <p>Summarize any content quickly and easily</p>
      </header>

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
            <label htmlFor="wordCount">Summary Length:</label>
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
                placeholder="Paste your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
              />
              <button onClick={handleTextSummary} disabled={loading}>
                {loading ? 'Summarizing...' : 'Summarize Text'}
              </button>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="url-input">
              <input
                type="url"
                placeholder="Enter URL (website or YouTube video)..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button onClick={handleUrlSummary} disabled={loading}>
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
                >
                  {loading ? 'Summarizing...' : 'Summarize PDF'}
                </button>
                <button 
                  onClick={() => handleFileSummary('word')} 
                  disabled={loading || !file}
                >
                  {loading ? 'Summarizing...' : 'Summarize Word'}
                </button>
                <button 
                  onClick={() => handleFileSummary('excel')} 
                  disabled={loading || !file}
                >
                  {loading ? 'Summarizing...' : 'Summarize Excel'}
                </button>
                <button 
                  onClick={() => handleFileSummary('powerp')} 
                  disabled={loading || !file}
                >
                  {loading ? 'Summarizing...' : 'Summarize PowerPoint'}
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
