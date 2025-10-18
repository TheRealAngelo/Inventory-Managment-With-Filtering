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

## Example
# Create tag
$tag='{"tag_name":"Electronics"}'
Invoke-RestMethod -Uri 'http://localhost:3000/api/tags' -Method Post -ContentType 'application/json' -Body $tag

# Create product
$body='{"name":"Wireless Mouse","description":"Ergonomic","initial_stock":10,"tags":["Electronics"]}'
Invoke-RestMethod -Uri 'http://localhost:3000/api/products' -Method Post -ContentType 'application/json' -Body $body

# Get product by id
Invoke-RestMethod -Uri 'http://localhost:3000/api/products/1' -Method Get

# List products with filters
Invoke-RestMethod -Uri "http://localhost:3000/api/products?tag=Electronics&min_stock=5&name=mouse" -Method Get

# Update product (PATCH)
$upd='{"name":"Wireless Mouse Pro","description":"Updated"}'
Invoke-RestMethod -Uri 'http://localhost:3000/api/products/1' -Method Patch -ContentType 'application/json' -Body $upd

# Delete product
Invoke-RestMethod -Uri 'http://localhost:3000/api/products/1' -Method Delete

# Adjust stock (in / out)
$stockIn='{"type":"in","quantity":5}'
Invoke-RestMethod -Uri 'http://localhost:3000/api/products/1/stock' -Method Post -ContentType 'application/json' -Body $stockIn

$stockOut='{"type":"out","quantity":2}'
try { Invoke-RestMethod -Uri 'http://localhost:3000/api/products/1/stock' -Method Post -ContentType 'application/json' -Body $stockOut }
catch {
  $r=$_.Exception.Response
  if ($r) { (New-Object System.IO.StreamReader($r.GetResponseStream())).ReadToEnd() } else { $_.Exception.Message }
}

Tested with bash.
