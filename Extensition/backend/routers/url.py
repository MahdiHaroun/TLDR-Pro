import requests
from fastapi import APIRouter, status, HTTPException
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain.chains.summarize import load_summarize_chain
from langchain_community.document_loaders import UnstructuredURLLoader
from langchain.docstore.document import Document
from schemas import url_Request , url_Response
from dotenv import load_dotenv
import os
import yt_dlp

load_dotenv()
os.environ["GROQ_API"] = os.getenv("GROQ_API")
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGSMITH_TRACING"] = os.getenv("LANGSMITH_TRACING")
os.environ["LANGSMITH_PROJECT"] = os.getenv("LANGSMITH_PROJECT")

router = APIRouter()
llm = ChatGroq(model="openai/gpt-oss-20b", groq_api_key=os.getenv("GROQ_API"))

prompt_template = """
Summarize the following content in approximately {word_count} words:

{text}
"""
prompt = PromptTemplate(template=prompt_template, input_variables=["text", "word_count"])

def load_youtube_transcript(url: str):
    try:
        with yt_dlp.YoutubeDL({"skip_download": True, "quiet": True, "writesubtitles": True,
                               "writeautomaticsub": True, "subtitlesformat": "json", "simulate": True}) as ydl:
            info = ydl.extract_info(url, download=False)
            captions = info.get("subtitles") or info.get("automatic_captions")
            if captions and "en" in captions:
                sub_url = captions["en"][0]["url"]
                r = requests.get(sub_url)
                r.raise_for_status()
                data = r.json()
                # Automatic captions JSON has events -> segs -> utf8
                if "events" in data:
                    text = " ".join(seg.get("utf8", "") for e in data["events"] for seg in e.get("segs", []))
                elif isinstance(data, list):
                    text = " ".join(entry.get("text", "") for entry in data)
                else:
                    text = ""
                if text:
                    return [Document(page_content=text)], "transcript"
            # Fallback to metadata
            title = info.get("title", "")
            description = info.get("description", "")
            return [Document(page_content=f"Title: {title}\nDescription: {description}")], "metadata"
    except Exception as e:
        return [Document(page_content=f"Transcript not available: {str(e)}")], "none"


@router.post("/url", response_model=url_Response, status_code=status.HTTP_200_OK)
async def summarize(new_summ: url_Request):
    url_str = str(new_summ.url)
    word_count = new_summ.word_count

    # Load content
    if "youtu.be" in url_str or "youtube.com" in url_str:
        documents, source = load_youtube_transcript(url_str)
    else:
        loader = UnstructuredURLLoader(urls=[url_str], ssl_verify=False,
                                       headers={"User-Agent": "Mozilla/5.0"})
        documents = loader.load()
        source = "web"

    # Combine text
    combined_text = "\n".join(doc.page_content for doc in documents)

    if not combined_text.strip():
        raise HTTPException(status_code=400, detail="No content found at the given URL.")

    # Truncate 
    max_chars = 12000
    if len(combined_text) > max_chars:
        combined_text = combined_text[:max_chars]

    # Format and summarize
    prompt_text = prompt.format(text=combined_text, word_count=word_count)
    summary = await llm.ainvoke(prompt_text)

    return url_Response(summary=summary.content)

    



