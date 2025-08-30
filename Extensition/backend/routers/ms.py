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
#llm = ChatGroq(model="openai/gpt-oss-20b", groq_api_key=os.getenv("GROQ_API"))
llm = Ollama(model="gemma:2b")
from langchain.chains import LLMChain  
from langchain.prompts import PromptTemplate
from langchain_community.document_loaders import Docx2txtLoader
from langchain_community.document_loaders import UnstructuredExcelLoader
from langchain_community.document_loaders import UnstructuredPowerPointLoader
from langchain.chains.summarize import load_summarize_chain
from langchain.text_splitter import RecursiveCharacterTextSplitter  

prompt_template = """
Provide a summary of the following content in {word_count} words:
Content:{text}
"""

chunks_prompts = '''
please summarize the below speech: 
speech: {text}
summary:

'''

map_prompt_template = PromptTemplate(input_variables=["text"], template=chunks_prompts)


final_prompt = '''
provide the final summary of the entire speech with these important points.
add a Motivation title , start the precise summary with a introduction and provide the summary in number and points for the speech.
Speech: {text} with a approximatly {word_count} words
'''

final_prompt_template = PromptTemplate(input_variables=["text", "word_count"], template=final_prompt)




llm_chain = load_summarize_chain(
    llm = llm, 
    chain_type="map_reduce",
    map_prompt=map_prompt_template,
    combine_prompt=final_prompt_template,
    verbose=True
)



@router.post("/word", status_code=status.HTTP_200_OK)
async def summarize_mord(file: UploadFile = File(...), word_count: int = Form(...)):
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    
    loader = Docx2txtLoader(tmp_path)
    documents = loader.load()
    init_docs = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100).split_documents(documents)

    
    

    # Summarize using LLMChain
    summary = await llm_chain.ainvoke({
        "input_documents": init_docs,
        "word_count": word_count
    })

    return ms_Response(summary=summary['output_text'])


@router.post("/excel" , status_code=status.HTTP_200_OK)
async def summarize_excel(file: UploadFile = File(...), word_count: int = Form(...)):
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        loader = UnstructuredExcelLoader(tmp_path)
        documents = loader.load()
        init_docs = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100).split_documents(documents)

        

        # Summarize using LLMChain
        summary = await llm_chain.ainvoke({
            "input_documents": init_docs,
            "word_count": word_count
        })

        return ms_Response(summary=summary['output_text'])



@router.post("/powerp" , status_code=status.HTTP_200_OK)
async def summarize_powerpoint(file: UploadFile = File(...), word_count: int = Form(...)):
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    loader = UnstructuredPowerPointLoader(tmp_path)
    documents = loader.load()

    init_docs = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100).split_documents(documents)

    # Summarize using LLMChain
    summary = await llm_chain.ainvoke({
        "input_documents": init_docs,
        "word_count": word_count
    })

    return ms_Response(summary=summary['output_text'])



