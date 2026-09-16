# Canteen Meal Pre-booking & Ticketing System

A DBMS project for pre-booking canteen meals and collecting them via a
digital ticket, instead of standing in a queue. Built with MySQL, Express,
and React.

## Project structure

```
database/   MySQL schema, triggers, stored procedures, views, seed data
backend/    Express REST API (calls the stored procedures directly)
frontend/   React app (student ordering flow + admin dashboard)
```

## Database

The database is the core of this project. It has:

- **7 tables**: `users`, `menu_items`, `counters`, `orders`, `bookings`,
  `wallet_transactions`, `feedback`
- **2 triggers**: keep `wallet_balance` in sync with the transaction ledger,
  and release menu capacity when an order is cancelled
- **4 stored procedures**: `sp_place_order`, `sp_collect_order`,
  `sp_cancel_order`, `sp_recharge_wallet` — all atomic, with row locking and
  automatic rollback on failure
- **4 views**: `vw_menu_availability`, `vw_order_history`,
  `vw_counter_load`, `vw_daily_sales`

### Set up the database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

This creates the `canteen_system` database, all tables/triggers/procedures/
views, 4 pickup counters, and a starter menu.

## How it works

- Students add dishes to a cart and place **one order** — every item in that
  order shares a single pickup counter and pickup time, assigned via
  round-robin across 4 counters (only active, non-cancelled orders count
  toward the rotation).
- Placing an order debits the student's wallet immediately (atomic with the
  stock check — no overselling the last unit of an item).
- Each order gets a QR-coded ticket. Admin staff scan/enter the ticket token
  to mark it collected.
- Cancelling an order refunds the wallet and releases the reserved stock.
- Admin has a locked-down dashboard: collect tickets, live counter load,
  daily sales, and full menu management (add/edit/delete dishes, including
  image URLs).

## Backend setup

```bash
cd backend
cp .env.example .env   # fill in your MySQL password
npm install
npm start
```

Runs on `http://localhost:4001`.

## Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Runs on `http://localhost:3002`.

## Tech stack

- **Database**: MySQL 8 (triggers, stored procedures, views, JSON columns,
  `JSON_TABLE`)
- **Backend**: Node.js, Express, mysql2, JWT auth, bcrypt
- **Frontend**: React, React Router, Tailwind CSS, Axios
