# Kaucja_Boys

### Kaucja Web App Hackathon Plan
---

# 1. One-line product vision

Build a **web app that turns store-specific kaucja vouchers/receipts into a universal digital wallet in the Polish market**, enables users to **scan deposit/kaucja bottles and cans and receive instant deposited cash from the comfort of their homes**, and lets **cashier redemption via QR code connected to the web-app's wallet** along with **finding and reviewing deposit machines**

---

# 2. Hackathon framing

## What we are building in 24 hours

A **working demo / MVP** with:

- user sign-in
- barcode scan of kaucja receipt/voucher
- wallet balance storage
- machine map with community reviews
- cashier redemption via QR code
- basic admin/store panel or cashier page to deduct value

## What we are _not_ fully solving in 24 hours

- real integration with Lidl / Biedronka / Żabka systems
- real payments settlement between stores
- legal / fiscal integration
- production-grade fraud prevention
- real machine firmware integration
- full AI bottle-recognition pipeline in production

Instead, we build:

- a **credible prototype**
- strong **architecture**
- mocked integrations
- clear upgrade path

---

# 3. Product concept

## Core MVP flow

1. User receives a barcode / receipt from a kaucja machine.
2. User scans the barcode in the web app.
3. App validates or simulates validation of the voucher.
4. Voucher value is added to the user wallet.
5. User can spend wallet value in **any participating store**.
6. At checkout, user shows a **dynamic QR code**.
7. Cashier scans the QR code.
8. Backend deducts the amount from the wallet and records the transaction.
9. Users can browse nearby deposit machines and submit reviews/status.
10. Users get points for every deposit made, points that will be used for getting sponsored vouchers/discounts

## Stage 2 vision

- home bottle pre-scan with AI + temporary wallet credit
- debt tracking until physical return in 1–2 days
- machine-side QR user identification
- courier pickup marketplace for bottle collection
- ***
