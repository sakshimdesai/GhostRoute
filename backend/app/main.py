from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import engine
from app.database.database import Base
from app.database import models

from app.routers.projects import router as projects_router
from app.routers.mock import router as mock_router

app = FastAPI(title="Stub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/")
def health_check():
    return {"message": "Stub Backend Running"}

app.include_router(projects_router)
app.include_router(mock_router)