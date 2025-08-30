from fastapi import APIRouter, HTTPException, status , UploadFile , File, Form, Depends
from schemas import ms_Request , ms_Response
import tempfile



router = APIRouter( 
    prefix="/ms",
)

import os 
from dotenv import load_dotenv
load_dotenv()
os.environ["GROQ_API"] = os.getenv("GROQ_API")
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGSMITH_TRACING"] = os.getenv("LANGSMITH_TRACING")
os.environ["LANGSMITH_PROJECT"] = os.getenv("LANGSMITH_PROJECT")


from langchain_groq import ChatGroq
from langchain_community.llms import Ollama
llm = ChatGroq(model="openai/gpt-oss-20b", groq_api_key=os.getenv("GROQ_API"))
from langchain.chains import LLMChain  # llmchain = llm | prompt
from langchain.prompts import PromptTemplate
from langchain_community.document_loaders import Docx2txtLoader
from langchain_community.document_loaders import UnstructuredExcelLoader
from langchain_community.document_loaders import UnstructuredPowerPointLoader

prompt_template = """
Provide a summary of the following content in {word_count} words:
Content:{text}
"""

prompt = PromptTemplate(
    input_variables=["word_count" , "text"],
    template=prompt_template
)

llm_chain = LLMChain(llm=llm, prompt=prompt)

@router.post("/word", status_code=status.HTTP_200_OK)
async def summarize_mord(file: UploadFile = File(...), word_count: int = Form(...)):
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    
    loader = Docx2txtLoader(tmp_path)
    documents = loader.load()

    
    combined_text = "\n".join(doc.page_content for doc in documents)

    # Summarize using LLMChain
    summary = await llm_chain.ainvoke({
        "text": combined_text,
        "word_count": word_count
    })

    return ms_Response(summary=summary['text'])
    

@router.post("/excel" , status_code=status.HTTP_200_OK)
async def summarize_excel(file: UploadFile = File(...), word_count: int = Form(...)):
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        loader = UnstructuredExcelLoader(tmp_path)
        documents = loader.load()

        combined_text = "\n".join(doc.page_content for doc in documents)

        # Summarize using LLMChain
        summary = await llm_chain.ainvoke({
            "text": combined_text,
            "word_count": word_count
        })

        return ms_Response(summary=summary['text'])


@router.post("/powerp" , status_code=status.HTTP_200_OK)
async def summarize_powerpoint(file: UploadFile = File(...), word_count: int = Form(...)):
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    loader = UnstructuredPowerPointLoader(tmp_path)
    documents = loader.load()

    combined_text = "\n".join(doc.page_content for doc in documents)

    # Summarize using LLMChain
    summary = await llm_chain.ainvoke({
        "text": combined_text,
        "word_count": word_count
    })

    return ms_Response(summary=summary['text'])


