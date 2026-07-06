# Payroll & Billing Manager — Backend

Node.js + Express + MySQL + Stripe learning project.

## Setup (MAMP)

1. **Database**
   - Buka phpMyAdmin di MAMP (biasanya `http://localhost:8888/phpMyAdmin`)
   - Import `schema.sql` — ini akan bikin database `payroll_billing` + 2 tabel + sample data

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment variables**
   - Copy `.env.example` jadi `.env`
   - Isi `DB_PORT` sesuai MAMP kamu (cek di MAMP preferences, biasanya `8889` untuk MySQL)
   - Isi `STRIPE_SECRET_KEY` dari https://dashboard.stripe.com/test/apikeys (pastikan toggle "Test mode" aktif di dashboard Stripe)

4. **Jalankan server**
   ```bash
   node server.js
   ```
   Server jalan di `http://localhost:4000`

## Testing API (tanpa frontend dulu)

Pakai Postman atau curl:

```bash
# Cek server jalan
curl http://localhost:4000

# List employees
curl http://localhost:4000/api/employees

# Tambah employee baru
curl -X POST http://localhost:4000/api/employees \
  -H "Content-Type: application/json" \
  -d '{"employee_full_name":"Test User","employee_email":"test@example.com","employee_position":"Developer","employee_base_salary":7000000,"employee_join_date":"2026-01-01"}'

# Generate payroll untuk employee_id 1, bulan Januari 2026
curl -X POST http://localhost:4000/api/payroll \
  -H "Content-Type: application/json" \
  -d '{"payroll_employee_id":1,"payroll_period_month":1,"payroll_period_year":2026,"payroll_bonuses":500000,"payroll_deductions":200000}'
```

## Setup Stripe Webhook (untuk testing lokal)

Stripe webhook butuh URL publik, tapi server kamu di localhost. Solusinya pakai **Stripe CLI**:

1. Install Stripe CLI: https://docs.stripe.com/stripe-cli
2. Login: `stripe login`
3. Forward webhook ke localhost:
   ```bash
   stripe listen --forward-to localhost:4000/api/billing/webhook
   ```
4. Stripe CLI akan kasih `whsec_...` — copy itu ke `.env` sebagai `STRIPE_WEBHOOK_SECRET`
5. Test trigger event manual:
   ```bash
   stripe trigger checkout.session.completed
   ```

## Testing Checkout Flow

```bash
curl -X POST http://localhost:4000/api/billing/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"billing_customer_email":"customer@example.com","billing_plan_key":"basic"}'
```

Response akan kasih `checkout_url` — buka di browser, isi pakai test card:
- Card number: `4242 4242 4242 4242`
- Expiry: tanggal apapun di masa depan
- CVC: 3 digit apapun

## Struktur Project

```
backend/
├── server.js          → entry point
├── config/db.js        → koneksi MySQL pool
├── routes/
│   ├── employees.js    → CRUD employee
│   ├── payroll.js       → generate & lihat payroll
│   └── billing.js       → Stripe checkout + webhook
├── schema.sql           → SQL buat setup database
└── .env.example         → template environment variables
```

## Next Step

Setelah backend ini jalan dan ke-test, lanjut bikin frontend React buat:
- Tabel & form employee
- Tabel payroll dengan tombol "Generate Payroll"
- Halaman pilih plan + redirect ke Stripe Checkout
- Halaman list subscriptions dengan status real-time
