# Kaucja_Boys

## Make kaucja great again

### Kaucja Web App Hackathon Plan

### Inspired by Żabka / universal deposit-wallet concept

#### Goal: deliver a convincing MVP in 24 hours

---

# 1. One-line product vision

Build a **web app that turns store-specific kaucja vouchers into a universal digital wallet**, lets users **find and review deposit machines**, and enables **cashier redemption via QR code**.

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

## Stage 2 vision

- home bottle pre-scan with AI + temporary wallet credit
- debt tracking until physical return in 1–2 days
- machine-side QR user identification
- courier pickup marketplace for bottle collection

---

# 4. Recommended tech stack

## Frontend

Use **Next.js**.

Why:

- fast to scaffold
- React ecosystem
- easy routing
- PWA support possible
- easy camera/barcode/QR integration
- hackathon-friendly

### Frontend libraries

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** or simple component kit
- **react-hook-form**
- **zod**
- **@zxing/browser** or **html5-qrcode** for barcode scanning
- **react-qr-code** for displaying wallet QR
- **Leaflet + react-leaflet** for map
- **TanStack Query** for API state
- **next-pwa** if time allows

## Backend

Use **FastAPI** in Python.

Why:

- extremely fast for hackathons
- automatic OpenAPI docs
- simple auth patterns
- easy async API creation
- easy future AI integration in Python

### Backend libraries

- **FastAPI**
- **Uvicorn**
- **SQLAlchemy**
- **Pydantic**
- **Alembic** if migrations are needed
- **PostgreSQL** ideally
- **SQLite** acceptable for demo
- **JWT auth**
- **qrcode** / **PyJWT**
- **OpenCV / Pillow** only for stage-2 PoC if time permits

## Infrastructure

For hackathon speed:

- Frontend: **Vercel**
- Backend: **Render**, **Railway**, or **Fly.io**
- DB: **Supabase Postgres** or **Neon**
- Storage: Supabase storage / Cloudinary for review photos

---

# 5. Architecture overview

## High-level architecture

- **Frontend (Next.js)** handles:
  - login/signup
  - scan voucher barcode
  - show wallet
  - show QR for payment
  - machine map
  - reviews
  - cashier panel

- **Backend (FastAPI)** handles:
  - authentication
  - wallet ledger
  - voucher ingestion
  - redemption logic
  - QR token generation/validation
  - machine and review APIs
  - fraud/rate-limit logic
  - future AI scoring endpoints

- **Database** stores:
  - users
  - wallets
  - voucher claims
  - transactions
  - machine locations
  - reviews
  - pending home-scan debts

---

# 6. MVP scope definition

## Must-have features for demo

### A. Auth

- email/password login
- optional social login only if super easy
- basic profile page

### B. Voucher barcode scan -> wallet top-up

- mobile camera scan
- fallback manual entry
- backend validation
- top-up wallet if voucher not used before

### C. Wallet

- current balance
- transaction history
- voucher claim history

### D. Redeem via QR

- generate time-limited QR token
- cashier scans QR or enters short code
- cashier enters amount to deduct
- backend validates and deducts

### E. Machine map

- show machines on map
- add new machine by user
- add status/review:
  - working
  - broken
  - dirty
  - fast
  - crowded
- optionally upload photo

### F. Demo admin / cashier panel

- simulate store checkout
- search or scan user QR
- deduct wallet amount
- show success/failure

## Nice-to-have if time remains

- review voting
- machine status badges
- balance reservation before checkout
- push notification mock
- PWA install banner
- multilingual UI: Polish + English

---

# 7. Data model

## Core tables

### users

- id
- email
- password_hash
- full_name
- created_at
- role (`user`, `cashier`, `admin`)

### wallets

- id
- user_id
- balance
- updated_at

### wallet_transactions

- id
- user_id
- type (`topup`, `redeem`, `adjustment`, `reservation`, `release`)
- amount
- status
- source_type (`voucher`, `cashier_qr`, `admin`, `home_scan_credit`)
- source_id
- description
- created_at

### vouchers

- id
- code
- barcode_format
- amount
- issuer_store
- issued_at
- expires_at
- claimed_by_user_id
- claimed_at
- status (`new`, `claimed`, `redeemed`, `invalid`)
- raw_scan_payload

### redemption_tokens

- id
- user_id
- token
- expires_at
- max_amount
- status (`active`, `used`, `expired`, `cancelled`)
- created_at

### redemptions

- id
- user_id
- cashier_user_id
- store_name
- token_id
- amount
- status
- created_at

### machines

- id
- name
- latitude
- longitude
- address
- store_brand
- added_by_user_id
- status_aggregate
- created_at

### machine_reviews

- id
- machine_id
- user_id
- rating
- tags
- comment
- image_url
- created_at

---

# 8. Stage-2 data model additions

### bottle_scan_claims

- id
- user_id
- barcode
- estimated_material
- estimated_shape_class
- ai_confidence
- predicted_kaucja_value
- status (`credited_pending_return`, `returned`, `expired`, `rejected`)
- due_date
- created_at

### user_bottle_debts

- id
- user_id
- claim_id
- amount
- due_date
- settled_at
- status

### courier_pickups

- id
- user_id
- address
- preferred_time
- number_of_bags
- fee
- status (`requested`, `accepted`, `picked`, `delivered`, `cancelled`)
- courier_user_id

---

# 9. API design

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

## Wallet

- `GET /wallet`
- `GET /wallet/transactions`

## Voucher scanning

- `POST /vouchers/scan`
- request:
  - barcode value
  - optional image metadata
- response:
  - amount
  - status
  - wallet balance

## QR redemption

- `POST /wallet/redeem-token`
- `POST /cashier/redeem`
- `GET /cashier/transaction/:id`

## Machines

- `GET /machines`
- `POST /machines`
- `GET /machines/:id`
- `POST /machines/:id/reviews`
- `GET /machines/:id/reviews`

## Stage-2 placeholder APIs

- `POST /bottles/home-scan`
- `POST /bottles/settle-return`
- `POST /courier/request`

---

# 10. User journeys

## Journey 1: Add voucher to wallet

1. User opens app.
2. Clicks “Scan voucher”.
3. Camera opens.
4. Barcode detected.
5. App sends code to backend.
6. Backend checks whether code exists or is already used.
7. If valid, amount is credited.
8. User sees updated wallet and success screen.

## Journey 2: Spend wallet in any store

1. User opens wallet.
2. Clicks “Pay with kaucja”.
3. Dynamic QR code appears.
4. Cashier opens cashier page.
5. Cashier scans QR.
6. Cashier enters amount to deduct.
7. Backend validates token and wallet balance.
8. Amount deducted.
9. Receipt/success confirmation shown.

## Journey 3: Find machine

1. User opens map.
2. Sees nearby machines.
3. Can filter by:
   - working
   - broken
   - fast
   - dirty
4. Opens machine details.
5. Adds review and photo.

---

# 11. Fraud/risk controls for MVP

Even for demo, show that fraud was considered.

## Basic anti-fraud measures

- voucher code can only be claimed once
- QR redemption token expires in 60–120 seconds
- QR token single-use only
- amount limit per redemption
- wallet ledger instead of balance-only mutation
- barcode scan payload stored raw for audit
- device/IP rate limiting on voucher claims
- manual admin override panel
- basic duplicate detection

## Demo disclaimer

For hackathon demo:

- voucher validation can be mocked with:
  - whitelist of sample barcodes
  - generated demo vouchers
  - checksum rule
- store reconciliation is out of scope for MVP

---

# 12. UX screens to build

## User-facing pages

- landing page
- login/register
- dashboard
- scan voucher page
- wallet page
- payment QR page
- map page
- machine detail page
- add machine modal/page
- profile page

## Cashier/admin pages

- cashier login
- scan customer QR
- deduct amount
- success/failure result
- admin voucher viewer (optional)

---

# 13. Suggested UI structure

## Dashboard

Cards:

- current wallet balance
- scan new voucher
- pay with QR
- nearby machines
- recent activity

## Wallet screen

- balance at top
- button: “Show payment QR”
- transaction list below
- statuses:
  - credited
  - spent
  - pending

## Machine map

- Leaflet map
- colored pins:
  - green = working
  - red = broken
  - yellow = mixed reports
- machine detail bottom sheet
- quick tags for reviews

## Cashier screen

- scan QR / enter code
- fetch wallet
- input redemption amount
- confirm
- display transaction success

---

# 14. Barcode and QR implementation approach

## Voucher barcode scan

Use a browser-based scanning library:

- `@zxing/browser` or `html5-qrcode`

### Supported approach

- camera stream
- detect common barcode formats
- fallback manual input

### Demo strategy

Because real kaucja vouchers may vary:

- prepare sample printed barcodes
- accept a normalized string input
- backend maps sample codes to values

## Payment QR

Generate a **short-lived signed token** containing:

- user_id
- token_id
- expiry
- optional max spend

Token should not directly expose wallet balance.

Backend validates:

- signature
- expiry
- token status
- wallet amount

---

# 15. Geolocation and review approach

## Machine discovery

MVP data sources:

- user-added machines
- seeded sample machines near hackathon/demo city

## Features

- browser geolocation
- nearest machines list
- machine reviews
- machine tags
- confidence score from latest reports

## Review tags

- working
- broken
- dirty
- fast
- queue
- inaccessible
- accepts glass
- accepts plastic
- accepts cans

---

# 16. Second-stage feature design: AI home bottle scanning

This is the most innovative part. Build the concept clearly even if not fully delivered.

## User flow

1. User scans bottle at home with app camera.
2. App reads barcode and takes bottle image.
3. AI model checks:
   - barcode eligibility
   - bottle type
   - shape consistency
   - visible damage/condition
4. System estimates kaucja value.
5. User gets **temporary wallet credit**.
6. User must physically return bottles within 1–2 days.
7. At machine, user scans personal QR first.
8. Machine requests outstanding owed bottles.
9. Returned bottles settle the temporary debt.
10. If user fails to return in time, credit is reversed or account is locked.

## Practical hackathon implementation

Do **not** build full ML training pipeline.
Instead:

- barcode lookup + image upload
- simple heuristic classifier
- optional use of a vision API mock
- show confidence score in UI
- return “pending verification” state

## AI logic for PoC

Use a hybrid:

- barcode scan -> deterministic known product info
- image check -> simple CV heuristics or external vision model
- result -> accepted / maybe / rejected

### Validation fields

- barcode recognized?
- bottle material likely PET/glass/can?
- shape roughly matches known packaging?
- condition acceptable?
- label present?

## Risk note

This feature is highly abuse-prone.
Need later:

- anti-spoofing
- duplicate bottle prevention
- image reuse detection
- account trust scoring

---

# 17. Second-stage feature design: courier pickup

## User flow

1. User requests pickup.
2. App detects address or user inputs it.
3. User selects pickup window.
4. Fee is estimated.
5. Nearby couriers can accept.
6. Bottles are collected and delivered to partner machine/store.
7. User receives kaucja minus fee.

## Hackathon version

Simulate with:

- request form
- courier marketplace board
- fake courier acceptance
- status tracker

## Future real-world options

- integrate with Glovo/Bolt/Uber Direct style APIs
- local partner couriers
- store-owned pickup fleets

---

# 18. 24-hour delivery strategy

The key is **ruthless scope control**.

## Priority levels

### P0 — mandatory

- auth
- wallet
- voucher scan
- wallet top-up
- QR pay
- cashier deduction
- machine map
- reviews

### P1 — should have

- seeded machine data
- transaction history
- geolocation
- basic fraud controls
- polished demo script

### P2 — only if time permits

- review photos
- admin dashboard
- multilingual support
- home-scan concept page
- courier concept page

### P3 — presentation only

- AI home-scan
- debt settlement logic
- courier logistics engine

---

# 19. Team split for hackathon

## If 2 people

### Person A — frontend

- Next.js app
- wallet UI
- scan UI
- QR UI
- map and reviews

### Person B — backend

- FastAPI
- auth
- wallet ledger
- voucher logic
- redemption endpoints
- DB models
- deployment

## If 3 people

### Person A

frontend core

### Person B

backend core

### Person C

map/reviews + polish + pitch deck + seeded data + demo testing

## If 4 people

### Person A

auth/dashboard/wallet

### Person B

scan + QR + cashier screen

### Person C

backend/API/database

### Person D

map/reviews/deployment/presentation

---

# 20. Hour-by-hour execution plan

## Hour 0–2

- finalize scope
- create repo
- define DB schema
- scaffold Next.js + FastAPI
- deploy empty apps
- create shared API contract

## Hour 2–5

- implement auth
- implement wallet schema + transactions
- build dashboard skeleton
- seed demo users and sample vouchers

## Hour 5–8

- build voucher scan page
- connect barcode scanner
- implement `/vouchers/scan`
- top-up wallet on successful scan

## Hour 8–11

- build payment QR page
- implement redeem-token endpoint
- build cashier page
- implement deduction flow

## Hour 11–14

- build map page
- add geolocation
- add seeded machines
- build reviews flow

## Hour 14–17

- polish user journeys
- transaction history
- validation/error handling
- demo data cleanup

## Hour 17–20

- create stage-2 concept pages
- mock home-scan AI page
- mock courier request page
- produce architecture diagram

## Hour 20–22

- bug fixing
- mobile responsiveness
- cross-browser testing
- backup demo video

## Hour 22–24

- rehearse pitch
- create demo script
- prepare fallback screenshots
- freeze code

---

# 21. Directory structure

## Frontend

```txt
frontend/
  app/
    login/
    register/
    dashboard/
    scan/
    wallet/
    pay/
    map/
    machines/[id]/
    cashier/
  components/
    ui/
    wallet/
    scanner/
    map/
    reviews/
  lib/
    api.ts
    auth.ts
    utils.ts
```

## Backend

```txt
backend/
  app/
    main.py
    core/
      config.py
      security.py
    db/
      session.py
      models.py
    schemas/
      auth.py
      wallet.py
      voucher.py
      machine.py
      review.py
      redemption.py
    routers/
      auth.py
      wallet.py
      vouchers.py
      machines.py
      cashier.py
    services/
      wallet_service.py
      voucher_service.py
      redemption_service.py
      machine_service.py

```

## 22. API/business logic details

Voucher claim logic

Pseudo-flow:

receive barcode
normalize barcode
find voucher record or validate via mock rule
reject if already claimed
create wallet transaction topup
mark voucher as claimed
update wallet balance
return new balance
Redemption logic

Pseudo-flow:

user requests QR token
backend creates short-lived signed token
cashier scans token
cashier enters amount
backend verifies token and wallet
create redemption record
deduct wallet
mark token used
return success

## 23. Demo assumptions to state clearly

To make this “bulletproof” in a hackathon, explicitly say:

current deposit vouchers are store-specific
this app is a universal wallet layer
stores would settle balances later through B2B reconciliation
machine integration is mocked for demo
barcode validation is mocked or semi-mocked
cashier redemption is a participating-merchant concept
map data is crowdsourced
This makes the concept realistic without pretending impossible integrations already exist.

## 24. KPIs for judging success

For the hackathon demo, measure:

time from voucher scan to wallet credit
time from QR show to cashier redemption
number of mapped machines
number of community reviews submitted
successful end-to-end transactions in demo
clarity of stage-2 innovation

## 25. Key pitch angles

Why this matters

current kaucja flow is fragmented by retailer
users lose convenience and flexibility
deposit machines are inconsistent and hard to find
returning bottles should feel like digital money, not paper coupons
Why this is strong

solves real friction
community layer adds utility
universal wallet is easy to understand
AI home-scan is a standout innovation
courier pickup expands accessibility

## 26. Risks and hackathon-safe mitigations

Risk: real barcode formats vary

Mitigation:

support common formats + manual input
use demo barcodes
Risk: QR payment fraud

Mitigation:

short expiry
one-time token
cashier confirmation
Risk: maps need data

Mitigation:

seed 20–50 machine locations
Risk: AI too large to implement

Mitigation:

build concept flow + mocked confidence scoring
Risk: too much scope

Mitigation:

lock MVP after hour 2
only demo stage-2 features as clickable prototype

## 27. What to actually demo live

Live demo sequence

Login as user
Scan voucher barcode
Show wallet balance increased
Open map and show nearby machines + reviews
Open payment QR
Login/open cashier page
Scan QR / paste token
Deduct amount
Show wallet updated
Show stage-2 home-scan concept
Show courier pickup concept
This is short, clear, and powerful.

## 28. Definition of done for 24 hours

The project is “done” if:

a user can log in
a barcode can be scanned or entered
wallet gets credited
map shows machine locations
reviews can be added
QR can be generated
cashier can redeem part of wallet value
all flows work on mobile screen size
there is a clean pitch-ready demo

## 29. Stretch roadmap after hackathon

Phase 2

machine operator integration
receipt OCR and barcode fallback
richer moderation for reviews
AI bottle eligibility model
debt-based temporary credit
notifications/reminders
Phase 3

retailer settlement engine
banking/payment partnerships
courier network
loyalty/rewards
public API for stores/machines
anti-fraud ML

## 30. Final recommendation

Best build choice

Frontend: Next.js + TypeScript + Tailwind
Backend: FastAPI + PostgreSQL
Map: Leaflet
Barcode/QR: ZXing + QR token flow
Deploy: Vercel + Render/Railway + Supabase
Best execution strategy

Build only:

voucher scan
wallet
QR redemption
machine map/reviews
Then present:

home AI scan
debt settlement
courier pickup
as future-ready innovation modules.
That is the highest-probability path to a polished 24-hour hackathon delivery.

## 31. Super-short implementation checklist

Backend

auth routes
wallet model
voucher model
voucher scan endpoint
redeem token endpoint
cashier redeem endpoint
machines endpoint
reviews endpoint
Frontend

login/register
dashboard
scan voucher page
wallet page
QR payment page
cashier page
map page
machine detail + review form
Demo prep

seed users
seed vouchers
seed machines
print sample barcode
test on mobile
record backup demo
