# Cafe-X Security & Authentication Hardening Plan

This document outlines the security architecture and authentication flows for Cafe-X, covering auth mechanisms, token management, RBAC, input validation, and auditing safeguards.

## 1) Authentication Flow

### Current Implementation (Preserved)
- **Method**: Token-based auth via `ApiTokenAuth` middleware
- **Login**: `POST /api/v1/auth/login` with `{username, password, device_name}`
- **Token**: SHA256-hashed, stored in `api_tokens` table
- **Expiry**: Default 30 days (configurable via `TOKEN_EXPIRY_DAYS`)

### Token Lifecycle
1. **Issue**: Login → Token created with `expires_at`
2. **Validate**: Middleware checks token hash + expiry on each protected request
3. **Refresh**: Re-login to obtain new token (no refresh endpoint yet)
4. **Revoke**: Logout or manual revocation deletes token

### Headers
```
Authorization: Bearer <token>
```

## 2) Token Security

| Aspect | Implementation |
|--------|----------------|
| Hashing | SHA256 (token) - already implemented |
| Storage | `api_tokens.token_hash` (hash only, never plain) |
| Expiry | Configurable (`TOKEN_EXPIRY_DAYS`, default 30) |
| Rate Limiting | 60 req/minute per IP (throttle middleware) |
| Device Tracking | `device_name` logged at login |

**Hardening Recommendations**
- Use HMAC-SHA256 for token signing instead of raw hash
- Add token refresh endpoint (rotate without re-login)
- Implement token revocation list (for lost device)
- Add 2FA for admin accounts (optional)

## 3) Role-Based Access Control (RBAC)

### Roles
| Role | Permissions |
|------|-------------|
| `admin` | Full tenant access, user management, reporting |
| `manager` | Outlet management, orders, reports |
| `cashier` | POS operations, orders, payments |
| `driver` | Delivery order access |
| `viewer` | Read-only reports |

### Implementation
- Roles stored in `user_roles` table
- Middleware checks role before allowing action
- Per-endpoint role requirements in route definitions

### Example Middleware
```php
// In route definition
Route::middleware(['api.token', 'role:admin'])->group(function () {
    // Admin-only routes
});
```

## 4) Input Validation

### Form Requests
All inputs validated via Laravel Form Requests:
- `ProductUpsertRequest`: product fields
- `OrderCreateRequest`: order/line items
- `AuthLoginRequest`: credentials

### Validation Rules
- **Sanitize**: Trim strings, escape HTML
- **Type**: Cast numeric fields strictly
- **Length**: Enforce max lengths
- **SQL Injection**: Use parameter binding (Eloquent/Query Builder)
- **XSS**: Output escaping in views/API responses

## 5) API Security

| Threat | Mitigation |
|--------|------------|
| Brute Force | Rate limiting (60/min) + account lockout |
| Token Theft | Short expiry + device tracking |
| Injection | Parameterized queries only |
| Replay | Timestamp + expiry on critical actions |
| Mass Assignment | `$fillable`/`$guarded` on models |

## 6) Audit & Logging

All auth events logged:
- `user.login` (success)
- `user.login_failed` (failure with reason)
- `user.logout`
- `user.token_created`
- `user.token_revoked`

Logs include:
- `actor` (username)
- `ip_address`
- `user_agent`
- `tenant_id`/`outlet_id`

## 7) Password Security

- **Hashing**: Bcrypt (cost 10) via `Hash::make()`
- **Requirements**: Min 8 chars (enforced in validation)
- **Recovery**: Token-based reset (future)

## 8) SSL/TLS

- **Production**: Force HTTPS via middleware
- **HSTS**: Enable for production domain
- **Certificates**: Let's Encrypt or cloud-managed

## 9) Secrets Management

| Secret | Storage |
|--------|--------|
| Database credentials | `.env` (not committed) |
| API signing key | `.env` |
| OAuth secrets | `.env` |
| Cloud credentials | Cloud secret manager |

## 10) Acceptance Criteria

- [ ] All protected routes require valid token
- [ ] Rate limiting enforced on auth endpoints
- [ ] Passwords hashed with bcrypt
- [ ] All auth events logged
- [ ] RBAC enforced per role
- [ ] HTTPS forced in production
- [ ] Input validation on all endpoints
- [ ] No credentials in logs

This document will evolve as security requirements grow.