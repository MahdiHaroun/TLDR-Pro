from pydantic import BaseModel


# Text summary

class TextRequest(BaseModel):
    text: str
    word_count: int 

class TextResponse(BaseModel):
    summary: str


