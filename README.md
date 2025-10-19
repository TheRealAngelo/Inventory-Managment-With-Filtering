# Inventory Management with Advanced Filtering API

Stack: Node.js, Express, Knex.js, PostgreSQL

## Setup
1. Clone repo
2. Copy `.env.example` to `.env` and set DB credentials
3. `npm install`
4. Create DB (example): `createdb inventory_db`
5. `npm run migrate`
6. `npm run dev`

## Endpoints
- POST /api/tags
- POST /api/products
- GET /api/products/:id
- GET /api/products?tag=&min_stock=&name=
- PATCH /api/products/:id
- DELETE /api/products/:id
- POST /api/products/:id/stock

Tested with bash.
