from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from routers import  pdf , text , url , ms
app = FastAPI()

app.include_router(pdf.router) 
app.include_router(text.router) 
app.include_router(url.router) 
app.include_router(ms.router)




app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5176"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/hello")
async def hello():
    return {"message": "Hello from FastAPI"}