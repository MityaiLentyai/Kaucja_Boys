from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.db.models import User, WalletTransaction
from app.db.session import get_db
from app.routers.auth import get_current_user
from app.schemas.contracts import ItemScanRequest, ItemScanResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/items", tags=["items"])

DEPOSIT_VALUE = 0.50

@router.post("/scan", response_model=ItemScanResponse)
def scan_item(
    payload: ItemScanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Safely extract and clean barcode
        code = str(payload.barcode).strip() if payload.barcode else ""

        if not code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Barcode cannot be empty."
            )

        # 1. Check if item was already redeemed in any previous session
        existing_tx = (
            db.query(WalletTransaction)
            .filter(WalletTransaction.source_id == code)
            .first()
        )

        if existing_tx:
            return ItemScanResponse(
                is_valid=False,
                deposit_value=0.0,
                message="This item has already been recycled.",
            )

        # 2. Reject physically damaged or defective barcodes
        if code.endswith("999") or code.endswith("BAD"):
            return ItemScanResponse(
                is_valid=False,
                deposit_value=0.0,
                message="Item rejected: Container shape is deformed or barcode is damaged.",
            )

        # 3. Count existing user transactions to generate sequential name
        str_user_id = str(current_user.id)
        user_item_count = (
            db.query(WalletTransaction)
            .filter(WalletTransaction.user_id == str_user_id)
            .count()
        )
        item_number = user_item_count + 1

        # 4. Return valid scan response
        return ItemScanResponse(
            is_valid=True,
            item_name=f"NewItem{item_number}",
            deposit_value=DEPOSIT_VALUE,
            message="Item accepted.",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing item scan: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error processing barcode: {str(e)}"
        )
