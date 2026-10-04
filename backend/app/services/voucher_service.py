import json
from datetime import datetime
from urllib.parse import parse_qs, unquote, urlparse

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import TransactionType, Voucher, VoucherStatus
from app.services.wallet_service import get_or_create_wallet, record_transaction

MIN_CODE_LENGTH = 4


def extract_voucher_code(raw: str | None) -> str | None:
    """Accept a raw barcode, a QR URL, or a JSON payload and return the code."""
    if not raw:
        return None

    trimmed = raw.strip()
    if not trimmed:
        return None

    if trimmed.lower().startswith("kaucash://pay"):
        return None

    lowered = trimmed.lower()
    if lowered.startswith(("kaucash://", "http://", "https://")):
        parsed = urlparse(trimmed)
        query = parse_qs(parsed.query)
        for key in ("code", "barcode", "voucher", "voucher_code"):
            values = query.get(key)
            if values and values[0].strip() and len(values[0].strip()) >= MIN_CODE_LENGTH:
                return values[0].strip()
        parts = [part for part in parsed.path.split("/") if part]
        if parts:
            decoded = unquote(parts[-1]).strip()
            if len(decoded) >= MIN_CODE_LENGTH:
                return decoded

    if trimmed.startswith("{"):
        try:
            parsed_json = json.loads(trimmed)
        except json.JSONDecodeError:
            parsed_json = None
        if isinstance(parsed_json, dict):
            for key in ("code", "barcode", "voucher_code", "voucher"):
                value = parsed_json.get(key)
                if isinstance(value, str) and len(value.strip()) >= MIN_CODE_LENGTH:
                    return value.strip()

    token = trimmed.split()[0].strip("'\"")
    return token if len(token) >= MIN_CODE_LENGTH else None


def process_voucher_claim(
    db: Session,
    user_id: str,
    barcode: str,
    raw_payload: str | None = None,
) -> dict:
    normalized_barcode = extract_voucher_code(barcode)

    if not normalized_barcode:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read a valid voucher from that barcode or QR.",
        )

    voucher = (
        db.query(Voucher)
        .filter(func.lower(Voucher.code) == normalized_barcode.lower())
        .first()
    )

    if not voucher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voucher not found or invalid barcode.",
        )

    if voucher.status == VoucherStatus.CLAIMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This voucher has already been claimed."
        )

    if voucher.status == VoucherStatus.INVALID or voucher.status == VoucherStatus.REDEEMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This voucher is inactive or invalid."
        )

    # Mark voucher as claimed
    voucher.status = VoucherStatus.CLAIMED
    voucher.claimed_by_user_id = user_id
    voucher.claimed_at = datetime.utcnow()
    voucher.raw_scan_payload = raw_payload or barcode

    # Record transaction and top up wallet balance
    tx = record_transaction(
        db=db,
        user_id=user_id,
        amount=voucher.amount,
        type_=TransactionType.TOPUP,
        source_type="voucher",
        source_id=voucher.id,
        description=f"Voucher deposit ({voucher.issuer_store})"
    )

    wallet = get_or_create_wallet(db, user_id)

    return {
        "message": "Voucher processed successfully!",
        "voucher_code": voucher.code,
        "amount": voucher.amount,
        "issuer_store": voucher.issuer_store,
        "new_balance": wallet.balance
    }
