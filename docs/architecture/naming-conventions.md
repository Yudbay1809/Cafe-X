# Naming Conventions

Models (PascalCase):
- Product
- Order
- OrderItem
- Payment
- Customer

Tables (snake_case plural):
- products
- orders
- order_items
- payments
- customers

Services:
- CreateOrderService
- UpdateStockService
- SyncOrderService
- GenerateReportService

Controllers:
- OrderController
- ProductController
- AuthController

DTO:
- CreateOrderDTO
- UpdateProductDTO

Rules:
- Validation logic in DTO/FormRequest
- Controllers only call services
- Business logic stays in service layer
