# System Design Overview

Architecture: modular monolith

Services:
- Backend API
- Admin dashboard
- Customer ordering app
- POS application

Data:
- MySQL
- Redis cache
- Redis queue

Auth:
- Sanctum token

POS sync flow:
- Local database
- Queue unsynced transactions
- Sync to API when online

Idempotency:
- Prevent duplicate transactions

Service responsibilities:
- OrderService: create order, compute totals, apply tax
- InventoryService: deduct stock, track movement
- PaymentService: record payment, validate amount
- ReportService: generate sales summary

Event flow:
- Order created -> deduct inventory -> audit log -> receipt

Deployment:
- Nginx + PHP-FPM
- MySQL + Redis

Scalability:
- Add queue workers
- Read replicas
- Load balancer
