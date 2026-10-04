from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.db.session import engine, Base, SessionLocal
from app.routers import auth, wallet, vouchers, items
from app.db.models import User, UserRole, Voucher, VoucherStatus
from app.core.security import get_password_hash

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kaucja Boys Universal Wallet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://10.250.165.75:3000",
        "https://kaucja-boys.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(wallet.router)
app.include_router(vouchers.router)
app.include_router(items.router)

@app.on_event("startup")
def seed_demo_data():
    db: Session = SessionLocal()
    try:
        # Seed test user
        if not db.query(User).filter(User.email == "demo@kaucja.pl").first():
            demo_user = User(
                email="demo@kaucja.pl",
                password_hash=get_password_hash("password123"),
                full_name="Demo User",
                role=UserRole.USER
            )
            db.add(demo_user)
            db.commit()

        # Seed missing demo vouchers one by one so a claimed KAUCJA-100
        # does not block later codes from appearing.
        demo_vouchers = [
            ("KAUCJA-100", 10.0, "Biedronka"),
            ("KAUCJA-050", 5.0, "Lidl"),
            ("KAUCJA-025", 2.5, "Żabka"),
            ("KAUCJA-200", 20.0, "Biedronka"),
        ]
        added = False
        for code, amount, store in demo_vouchers:
            if db.query(Voucher).filter(Voucher.code == code).first():
                continue
            db.add(
                Voucher(
                    code=code,
                    amount=amount,
                    issuer_store=store,
                    status=VoucherStatus.NEW,
                    barcode_format="QR_CODE",
                )
            )
            added = True
        if added:
            db.commit()
    finally:
        db.close()
