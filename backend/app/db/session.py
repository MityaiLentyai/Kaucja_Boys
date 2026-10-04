from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = make_url(settings.DATABASE_URL)
if db_url.drivername in ("postgres", "postgresql"):
    db_url = db_url.set(drivername="postgresql+psycopg")

engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False} if db_url.get_backend_name() == "sqlite" else {},
    # Neon suspends idle computes, which drops pooled connections.
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
