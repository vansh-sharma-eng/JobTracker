# JobTracker Backend

Production-ready Spring Boot + MySQL backend for the JobTracker application.

## Tech Stack
- Java 17, Spring Boot 3.3
- Spring Security + JWT (access + refresh tokens)
- Spring Data JPA / Hibernate
- MySQL 8 with Flyway migrations
- springdoc-openapi (Swagger UI)
- Custom in-memory rate limiting on auth endpoints (dependency-free)
- JUnit 5, MockMvc, H2 (tests), Testcontainers (available for MySQL-backed tests)

## Features implemented
**Phase 1**
- JWT auth: register, login, refresh, logout (per-user data isolation)
- Job application CRUD with ownership checks
- Search (company/role), filter (status, location type, tag, date range), sort, pagination
- Live dashboard stats (total, interview, offer, rejected, success rate)

**Phase 2**
- Status history / timeline per job (auto-recorded on every status change)
- Tags (create, list, delete, filter jobs by tag)
- Attachments (upload/list/delete resume, cover letter, other files per job)
- Follow-up reminders (`/api/v1/jobs/follow-ups` — jobs due within 7 days)
- Analytics endpoint (status breakdown, applications over time, interview/offer rate, by source, by location type)
- CSV export of all applications

## Running locally

### 1. With Docker (recommended)
```bash
cp .env.example .env
# edit .env and set a real JWT_SECRET (openssl rand -base64 64) and DB passwords
docker compose --env-file .env up --build
```
The API will be available at `http://localhost:8080`. Swagger UI: `http://localhost:8080/swagger-ui.html`.

### 2. Without Docker
1. Install MySQL 8 locally and create a database + user matching your `.env`.
2. Export the environment variables from `.env.example` (or create an `.env` and use a tool like `direnv`/`dotenv`).
3. Run:
```bash
mvn spring-boot:run
```
Flyway will automatically create all tables on first startup (`db/migration/V1__init_schema.sql`).

## Running tests
```bash
mvn test
```
Tests run against an in-memory H2 database (`src/test/resources/application.yml`), so no external MySQL instance is required for the test suite.

## API overview
All endpoints are prefixed with `/api/v1`. Except for `/auth/register`, `/auth/login`, `/auth/refresh`, every endpoint requires `Authorization: Bearer <accessToken>`.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create an account, returns tokens |
| POST | `/auth/login` | Login, returns tokens |
| POST | `/auth/refresh` | Exchange a refresh token for a new token pair |
| POST | `/auth/logout` | Revoke all refresh tokens for the current user |
| POST | `/jobs` | Create a job application |
| GET | `/jobs` | List jobs (params: `search`, `status`, `locationType`, `tag`, `from`, `to`, `page`, `size`, `sort`) |
| GET | `/jobs/{id}` | Get one job application |
| PUT | `/jobs/{id}` | Update a job application |
| PATCH | `/jobs/{id}/status` | Update just the status (records history) |
| DELETE | `/jobs/{id}` | Delete a job application |
| GET | `/jobs/stats` | Dashboard stats |
| GET | `/jobs/follow-ups` | Jobs with a follow-up date due within 7 days |
| GET | `/tags` | List the current user's tags |
| POST | `/tags` | Create a tag |
| DELETE | `/tags/{id}` | Delete a tag |
| POST | `/jobs/{jobId}/attachments` | Upload an attachment (multipart) |
| GET | `/jobs/{jobId}/attachments` | List attachments for a job |
| DELETE | `/jobs/{jobId}/attachments/{attachmentId}` | Delete an attachment |
| GET | `/analytics?daysBack=90` | Aggregate analytics |
| GET | `/export/csv` | Download all applications as CSV |

Full interactive docs: Swagger UI at `/swagger-ui.html` once the app is running.

## Production notes
- `ddl-auto` is set to `validate` — schema changes must go through new Flyway migration files, never auto-generated.
- Set `SPRING_PROFILES_ACTIVE=prod` to suppress verbose error bodies and reduce log verbosity.
- `JWT_SECRET` must be a long, random value in production — never use the example default.
- Uploaded files are stored on disk under `UPLOAD_DIR`; back this with a persistent volume (or swap `FileStorageService` for an S3-backed implementation) in real deployments.
- CORS origins are restricted via `CORS_ALLOWED_ORIGINS` — set this to your real frontend domain(s) in production.
- Auth endpoints are rate-limited (10 requests/minute/IP) via `RateLimitFilter`; swap the in-memory bucket store for Redis if you run multiple backend instances.
