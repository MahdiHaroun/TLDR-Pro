from pydantic import BaseModel , HttpUrl


# Text summary

class TextRequest(BaseModel):
    text: str
    word_count: int 

class TextResponse(BaseModel):
    summary: str

class url_Request(BaseModel):
    url: HttpUrl
    word_count: int
    
class url_Response(BaseModel):
    summary: str
     