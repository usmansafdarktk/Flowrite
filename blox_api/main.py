from fastapi import FastAPI
from common.db import init_db
from modules.auth.route import router as auth_router
from modules.blog.route import router as blog_router
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # or ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# Register routers
app.include_router(auth_router)
app.include_router(blog_router)
