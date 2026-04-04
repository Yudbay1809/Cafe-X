# Production Readiness Checklist

Security:
- Sanctum auth
- Rate limit login
- Hash password
- Validate all request
- Prevent SQL injection
- Hide debug mode

Database:
- Foreign key constraints
- Index frequently queried columns
- Soft delete critical data

Logging:
- Activity logs
- Error logs
- Failed job logs

Queue:
- Enable queue worker
- Retry failed jobs

Cache:
- Redis cache
- Config cache
- Route cache

POS:
- Offline mode
- Retry sync queue
- Local database backup

Admin:
- Role permission
- Audit log
- Pagination
- Filterable tables

DevOps:
- .env.example exists
- Separate staging env
- Docker support

Monitoring:
- Uptime monitoring
- Error tracking
- Slow query monitoring

Minimum before go-live:
- Stable transactions
- Secure authentication
- Accurate reports
- Database backup enabled
- Role permission working
