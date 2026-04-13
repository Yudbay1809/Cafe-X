# Cafe-X Testing Strategy

This document outlines the testing approach for Cafe-X backend and frontend, covering unit tests, integration tests, E2E tests, mocks, test data management, and CI test integration.

## 1) Test Pyramid

```
       /\
      /E2E\          <- Few, expensive, full flow
     /------\
    /Integration\    <- Moderate, API + DB
   /------------\
  /    Unit      \   <- Many, fast, isolated
 /----------------\
```

| Layer | Count | Speed | Scope |
|-------|-------|-------|-------|
| Unit | 60-70% | <100ms | Single method/class |
| Integration | 20-30% | <1s | API + DB |
| E2E | 10% | <30s | Full user flow |

## 2) Backend Testing (Laravel/PHP)

### Unit Tests
- **Tested Classes**: Repositories, Services, Form Requests, Utilities
- **Tools**: PHPUnit (built-in), Mockery
- **Example**:
```php
class ProductRepositoryTest extends TestCase
{
    public function test_query_filters_by_tenant(): void
    {
        $repo = new ProductRepository();
        $results = $repo->query()->where('tenant_id', 1)->get();
        $this->assertNotEmpty($results);
    }
}
```

### Feature Tests (Integration)
- **Tested Features**: API endpoints, Middleware, Auth flow
- **Tools**: Laravel's `Feature` testing
- **Example**:
```php
class ProductApiTest extends TestCase
{
    public function test_product_list_requires_auth(): void
    {
        $response = $this->getJson('/api/v1/product');
        $response->assertStatus(401);
    }
}
```

### Test Database
- **Strategy**: SQLite in-memory for tests
- **Configuration**: `phpunit.xml` with `<env name="DB_CONNECTION" value="sqlite"/>`
- **Seeding**: `DatabaseSeeder` for base data

### Running Tests
```bash
# All tests
php artisan test

# Unit only
php artisan test --testsuite=Unit

# With coverage
php artisan test --coverage
```

## 3) Frontend Testing (Next.js)

### Unit Tests
- **Tools**: Vitest, React Testing Library
- **Tested**: Hooks, utils, components in isolation
- **Example**:
```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('Button renders with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Component Tests
- **Tools**: React Testing Library
- **Tested**: Component rendering, interactions, states
- **Example**:
```tsx
test('Cart shows item count', () => {
  render(<CartProvider initialItems={[{ id: 1 }]}>);
  expect(screen.getByText('1 item')).toBeInTheDocument();
});
```

### E2E Tests
- **Tools**: Playwright
- **Tested**: Critical user flows
- **Example**:
```typescript
import { test, expect } from '@playwright/test';

test('Customer can place order', async ({ page }) => {
  await page.goto('/customer/orders/new');
  await page.click('[data-testid="add-item"]');
  await page.click('[data-testid="checkout"]');
  await expect(page.locator('.success')).toBeVisible();
});
```

### Running Tests
```bash
# Unit/Component
npm run test

# E2E
npm run test:e2e

# With coverage
npm run test:coverage
```

## 4) Flutter POS Testing

### Unit Tests
- **Tools**: flutter_test, mockito
- **Tested**: Business logic, state management
- **Example**:
```dart
test('Calculate total correctly', () {
  final cart = Cart();
  cart.addItem(Product(id: 1, price: 10000), 2);
  expect(cart.total, 20000);
});
```

### Widget Tests
- **Tools**: flutter_test
- **Tested**: UI rendering, user interactions

### Integration Tests
- **Tools**: integration_test package
- **Tested**: Full POS flow (start shift → order → payment)

## 5) Mock Data

### Backend Mocks
- **Strategy**: Laravel's HTTP mocking or external service mocks
- **Tools**: Mockery, Phpspec

### Frontend Mocks
- **MSW (Mock Service Worker)**: Intercept API calls
- **Example**:
```typescript
import { http, HttpResponse } from 'msw';
import { handlers } from './handlers';

export const server = http.createHttpRouter(...handlers);
```

### Test Data Factories
- **Backend**: Laravel Factories (`Database/factories/`)
- **Frontend**: Faker.js or similar

## 6) CI Test Integration

### GitHub Actions
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: PHP Setup
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install
        run: composer install
      - name: Test
        run: php artisan test --coverage
        env:
          DB_CONNECTION: sqlite
```

## 7) Test Coverage Targets

| Area | Target | Minimum |
|------|-------|---------|
| Business Logic | 80% | 70% |
| API Endpoints | 90% | 80% |
| Critical Paths | 100% | 90% |

## 8) Test Data Management

### Seeds
- **Development**: `php artisan db:seed`
- **Testing**: Factory-based, random data
- **CI**: Deterministic seeds

### Fixtures
- JSON fixtures for API responses
- Stored in `tests/fixtures/`

## 9) Acceptance Criteria

- [ ] Unit tests cover all repositories and services
- [ ] Integration tests cover all API endpoints
- [ ] E2E tests cover critical flows (login, order, payment)
- [ ] Coverage ≥ 70% business logic
- [ ] Tests run in CI pipeline
- [ ] No flaky tests
- [ ] Test data isolated per test

This document will evolve as testing matures.