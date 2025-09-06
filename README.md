# 🚀 TLDR-Pro

> **Transform any content into concise, actionable summaries in seconds**

TLDR-Pro is a powerful Chrome extension and web application that leverages advanced AI to instantly summarize web pages, articles, PDFs, documents, and YouTube videos. Perfect for researchers, students, and professionals who want the key points without the fluff.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://reactjs.org)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)

## ✨ Features

### 📄 **Multi-Format Support**
- **Web Pages & Articles**: Summarize any webpage with a single click
- **PDF Documents**: Upload and extract key insights from PDF files
- **Text Content**: Paste any text for instant summarization
- **YouTube Videos**: Get transcripts and summaries of video content
- **Microsoft Documents**: Support for various document formats

### 🎯 **Customizable Summaries**
- **Variable Length**: Choose summary length (50, 100, 200+ words)
- **Smart Processing**: AI-powered content extraction and analysis
- **Context Preservation**: Maintains important context and key points
- **Multi-language Support**: Works with content in various languages

### 🔧 **User-Friendly Interface**
- **Chrome Extension**: One-click summarization from any webpage
- **Clean UI**: Modern, intuitive interface built with React
- **Fast Processing**: Quick response times with optimized backend
- **Cross-Platform**: Works on any device with Chrome browser

## 🏗️ Architecture

```
TLDR-Pro/
├── Extensition/
│   ├── backend/          # FastAPI Backend
│   │   ├── main.py      # Main application entry
│   │   ├── config.py    # Configuration settings
│   │   ├── schemas.py   # Pydantic models
│   │   └── routers/     # API route handlers
│   │       ├── text.py  # Text summarization
│   │       ├── pdf.py   # PDF processing
│   │       ├── url.py   # URL/YouTube processing
│   │       └── ms.py    # Microsoft docs processing
│   └── frontend/        # React Chrome Extension
│       └── my-app/
│           ├── src/     # React components
│           └── public/  # Extension manifest & assets
├── requirements.txt     # Python dependencies
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Chrome Browser**
- **GROQ API Key** (for AI processing)

### 🔧 Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MahdiHaroun/TLDR-Pro.git
   cd TLDR-Pro
   ```

2. **Set up Python environment**
   ```bash
   cd Extensition/backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r ../../requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env  # Create from example
   # Edit .env with your API keys:
   # GROQ_API=your_groq_api_key
   # LANGSMITH_API_KEY=your_langsmith_key (optional)
   ```

4. **Run the backend server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### 🎨 Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend/my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## 📚 API Documentation

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/summarize-text` | POST | Summarize plain text |
| `/summarize-pdf` | POST | Upload and summarize PDF |
| `/summarize-url` | POST | Summarize webpage/YouTube |
| `/summarize-ms` | POST | Process Microsoft documents |

### Example Usage

```python
import requests

# Summarize text
response = requests.post("http://localhost:8000/summarize-text", 
    json={
        "text": "Your long text here...",
        "word_count": 100
    }
)

# Summarize URL
response = requests.post("http://localhost:8000/summarize-url",
    json={
        "url": "https://example.com/article",
        "word_count": 150
    }
)
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**
- **LangChain**
- **GROQ**


### Frontend
- **React**
- **Vite**
- **Chrome Extension APIs**
- **Tailwind CSS**

### AI & ML
- **LangChain Community**
- **Sentence Transformers**
- **FAISS**
- **Hugging Face**

## 🚀 Deployment

### Local Development
```bash
# Start backend
cd Extensition/backend && uvicorn main:app --reload

# Start frontend development
cd Extensition/frontend/my-app && npm run dev
```


## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

