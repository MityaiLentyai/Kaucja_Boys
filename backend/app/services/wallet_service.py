from sqlalchemy.orm import Session
from app.db.models import Wallet, WalletTransaction, TransactionType

def get_or_create_wallet(db: Session, user_id: str) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet

def record_transaction(
    db: Session,
    user_id: str,
    amount: float,
    type_: TransactionType,
    source_type: str,
    source_id: str = None,
    description: str = None
) -> WalletTransaction:
    wallet = get_or_create_wallet(db, user_id)

    if type_ == TransactionType.TOPUP:
        wallet.balance += amount
    elif type_ == TransactionType.REDEEM:
        if wallet.balance < amount:
            raise ValueError("Insufficient wallet balance")
        wallet.balance -= amount

    tx = WalletTransaction(
        wallet_id=wallet.id,
        user_id=user_id,
        type=type_,
        amount=amount,
        source_type=source_type,
        source_id=source_id,
        description=description
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx
