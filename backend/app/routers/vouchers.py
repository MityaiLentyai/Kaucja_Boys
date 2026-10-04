from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User
from app.routers.auth import get_current_user
from app.schemas.contracts import VoucherScanRequest, VoucherScanResponse
from app.services.voucher_service import process_voucher_claim

router = APIRouter(prefix="/vouchers", tags=["Vouchers"])

@router.post("/scan", response_model=VoucherScanResponse)
def scan_voucher(
    payload: VoucherScanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = process_voucher_claim(
        db,
        user_id=current_user.id,
        barcode=payload.barcode,
        raw_payload=payload.raw_payload,
    )
    return result
