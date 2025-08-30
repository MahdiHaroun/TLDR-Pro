from fastapi import APIRouter, HTTPException, status
from schemas import TextRequest , TextResponse


router = APIRouter()

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
#llm = Ollama(model="gemma:2b")
from langchain.chains import LLMChain  # llmchain = llm | prompt
from langchain.prompts import PromptTemplate

prompt_template = """
Provide a summary of the following content in {word_count} words:
Content:{text}
"""

prompt = PromptTemplate(
    input_variables=["word_count" , "text"],
    template=prompt_template
)

llm_chain = LLMChain(llm=llm, prompt=prompt)




@router.post("/text", status_code=status.HTTP_200_OK, response_model=TextResponse)
async def summarize_text(new_text_req: TextRequest):
    try:
        result = await llm_chain.ainvoke({"text": new_text_req.text, "word_count": new_text_req.word_count})
        summary = result["text"] if isinstance(result, dict) else result
        return TextResponse(summary=summary.strip())
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

