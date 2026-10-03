import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum, Text, Integer
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class UserRole(str, enum.Enum):
    USER = "user"
    CASHIER = "cashier"
    ADMIN = "admin"

class TransactionType(str, enum.Enum):
    TOPUP = "topup"
    REDEEM = "redeem"
    ADJUSTMENT = "adjustment"
    RESERVATION = "reservation"
    RELEASE = "release"

class VoucherStatus(str, enum.Enum):
    NEW = "new"
    CLAIMED = "claimed"
    REDEEMED = "redeemed"
    INVALID = "invalid"

class TokenStatus(str, enum.Enum):
    ACTIVE = "active"
    USED = "used"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    wallet = relationship("Wallet", back_populates="user", uselist=False)

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    balance = Column(Float, default=0.0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet")

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    wallet_id = Column(String, ForeignKey("wallets.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="completed")
    source_type = Column(String, nullable=False)  # 'voucher', 'cashier_qr', etc.
    source_id = Column(String, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wallet = relationship("Wallet", back_populates="transactions")

class Voucher(Base):
    __tablename__ = "vouchers"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, index=True, nullable=False)
    barcode_format = Column(String, default="CODE128")
    amount = Column(Float, nullable=False)
    issuer_store = Column(String, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    claimed_by_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    claimed_at = Column(DateTime, nullable=True)
    status = Column(Enum(VoucherStatus), default=VoucherStatus.NEW, nullable=False)
    raw_scan_payload = Column(Text, nullable=True)

class RedemptionToken(Base):
    __tablename__ = "redemption_tokens"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    max_amount = Column(Float, nullable=True)
    status = Column(Enum(TokenStatus), default=TokenStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Redemption(Base):
    __tablename__ = "redemptions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    cashier_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    store_name = Column(String, nullable=False)
    token_id = Column(String, ForeignKey("redemption_tokens.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)

class Machine(Base):
    __tablename__ = "machines"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=True)
    store_brand = Column(String, nullable=False)
    added_by_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    status_aggregate = Column(String, default="working")
    created_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("MachineReview", back_populates="machine")

class MachineReview(Base):
    __tablename__ = "machine_reviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    tags = Column(String, nullable=True)  # Comma-separated tags
    comment = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    machine = relationship("Machine", back_populates="reviews")
