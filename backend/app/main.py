from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine, Base

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kaucja Boys Universal Wallet API",
    version="1.0.0",
    description="Backend API powering deposit-voucher wallet top-ups, QR redemption, and machine mapping."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "Kaucja Boys API running"}
