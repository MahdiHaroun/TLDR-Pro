from fastapi import FastAPI 
from routers import  pdf , text , url , sql 
app = FastAPI()


#app.include_router(pdf.router) 
app.include_router(text.router) 
app.include_router(url.router) 
#app.include_router(sql.router) 
