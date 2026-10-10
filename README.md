# TicketHub — Event Ticket Booking System (Java Full Stack)

![Java](https://img.shields.io/badge/Java-21-red)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.4-brightgreen)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6.x-6DB33F)
![OAuth2](https://img.shields.io/badge/OAuth2-Resource%20Server-blue)
![Keycloak](https://img.shields.io/badge/Keycloak-IAM-0078D4)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

A production-ready, full-stack event ticketing platform. Organizers create and publish events, attendees browse and purchase tickets backed by **QR codes**, and venue staff scan those codes at entry — all secured by **Keycloak** as an external OpenID Connect identity provider.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Features by Role](#features-by-role)
5. [Project Structure](#project-structure)
6. [Data Model](#data-model)
7. [API Reference](#api-reference)
8. [Security Design](#security-design)
9. [Getting Started](#getting-started)
10. [Configuration](#configuration)
11. [Frontend Guide](#frontend-guide)
12. [Screenshots](#screenshots)
13. [Future Improvements](#future-improvements)

---

## Overview

TicketHub separates concerns cleanly across three personas:

| Persona | What they do |
|---------|-------------|
| **Organizer** | Create events, define ticket types (price, quantity), publish to public |
| **Attendee** | Browse published events, purchase tickets, view QR codes |
| **Staff** | Scan QR codes at the venue door to mark tickets as used |

Authentication is entirely delegated to **Keycloak** — the backend acts as a pure stateless **OAuth2 Resource Server** and never stores passwords. The frontend uses `keycloak-js` for a seamless SSO experience including silent token refresh.

---

## Tech Stack

### Backend

| Concern | Technology |
|---------|-----------|
| Language / Runtime | Java 21 |
| Framework | Spring Boot 3.4.4 |
| Security | Spring Security 6 · OAuth2 Resource Server |
| Auth Provider | Keycloak (JWT / OIDC) |
| Persistence | Spring Data JPA · Hibernate |
| Database | PostgreSQL |
| DTO Mapping | MapStruct 1.6.3 |
| Boilerplate | Lombok 1.18.36 |
| QR Code | Google ZXing 3.5.1 |
| Build | Maven (wrapper included) |
| Infrastructure | Docker Compose |

### Frontend

| Concern | Technology |
|---------|-----------|
| Language | TypeScript |
| Framework | React 19 (Vite) |
| Auth | keycloak-js |
| Routing | React Router |
| Validation | Zod |
| QR Scanning | Camera-based (`useQrScanner` hook + ZXing WASM) |

---

## System Architecture

```
┌──────────────────────────────────────┐
│         React Frontend (Vite)        │
│  /public  /organizer  /attendee      │
│  /staff   (role-gated routes)        │
└─────────────────┬────────────────────┘
                  │  REST API  Bearer JWT
                  ▼
┌──────────────────────────────────────┐
│       Spring Boot REST API           │
│                                      │
│  EventController                     │
│  PublishedEventController            │
│  TicketTypeController                │
│  TicketController                    │
│  TicketValidationController          │
│  GlobalExceptionHandler              │
└────────┬─────────────────┬───────────┘
         │ JPA / Hibernate │ JWT issuer validation
         ▼                 ▼
  ┌─────────────┐   ┌────────────────────┐
  │  PostgreSQL │   │  Keycloak (Docker) │
  │  (Docker)   │   │  :9090             │
  └─────────────┘   └────────────────────┘
```

**Key design decisions:**

- The backend is a **stateless resource server** — it only verifies JWT signatures and reads claims. Session state lives nowhere server-side.
- `UserProvisioningFilter` auto-creates a local `User` row on the very first authenticated request, linking `keycloakId` to a local UUID. No separate sign-up endpoint needed.
- QR code content is a URL-safe UUID stored in the `qr_codes` table. ZXing generates the PNG on demand from that UUID string.
- All domain errors extend a common base and are mapped to structured `ErrorDto` JSON in `GlobalExceptionHandler` — no raw Spring error pages leak to clients.

---

## Features by Role

### Organizer

- Create events (name, description, date, location, capacity)
- Define multiple **ticket types** per event — each with name, price, and quantity available
- **Publish** an event: flips `EventStatusEnum.DRAFT → PUBLISHED`, making it visible to attendees
- Edit any field on a draft event; update ticket types at any time
- Delete events they own
- View all their events in a paginated dashboard with status badges

### Attendee

- Browse all published events (paginated list + detail page)
- See each event's ticket types with live availability counts
- Purchase a ticket — the service checks capacity, creates a `Ticket` row, and triggers QR code generation via ZXing
- "My Tickets" page shows all purchased tickets with status
- Ticket detail page renders the embedded QR code PNG inline

### Staff / Venue

- Open the QR Scanner page (uses device camera)
- `useQrScanner` hook decodes frames via ZXing's browser WASM build in real time
- On a successful decode, calls `POST /api/v1/ticket-validations`
- Backend records a `TicketValidation` row: validates the QR UUID, checks `Ticket.status`, transitions `VALID → REDEEMED`, returns a pass/fail response
- A ticket can only be redeemed once

---

## Project Structure

```
.
├── Images/                          # 17 app screenshots
├── README.md
├── backend/
│   ├── docker-compose.yml           # PostgreSQL + Adminer + Keycloak
│   ├── pom.xml
│   └── src/main/java/com/devtiro/tickets/
│       ├── TicketsApplication.java
│       ├── config/
│       │   ├── JpaConfiguration.java          # @EnableJpaAuditing
│       │   ├── JwtAuthenticationConverter.java # Maps JWT → Spring authorities
│       │   ├── QrCodeConfig.java               # ZXing MultiFormatWriter bean
│       │   └── SecurityConfig.java             # OAuth2 resource server, CORS, public paths
│       ├── controllers/
│       │   ├── EventController.java            # POST/GET/PUT/DELETE /api/v1/events
│       │   ├── PublishedEventController.java   # GET /api/v1/published-events
│       │   ├── TicketController.java           # POST/GET /api/v1/.../tickets
│       │   ├── TicketTypeController.java       # POST/PUT/DELETE on ticket-types
│       │   ├── TicketValidationController.java # POST /api/v1/ticket-validations
│       │   └── GlobalExceptionHandler.java     # @RestControllerAdvice → ErrorDto
│       ├── domain/
│       │   ├── entities/
│       │   │   ├── Event.java                  # @Entity, audited
│       │   │   ├── EventStatusEnum.java        # DRAFT | PUBLISHED | CANCELLED
│       │   │   ├── Ticket.java
│       │   │   ├── TicketStatusEnum.java       # VALID | REDEEMED | CANCELLED
│       │   │   ├── TicketType.java
│       │   │   ├── QrCode.java
│       │   │   ├── QrCodeStatusEnum.java       # ACTIVE | USED | REVOKED
│       │   │   ├── TicketValidation.java
│       │   │   ├── TicketValidationMethod.java # QR_CODE | MANUAL
│       │   │   ├── TicketValidationStatusEnum.java
│       │   │   └── User.java
│       │   └── dtos/                           # Request + response DTOs per use case
│       ├── exceptions/                         # EventNotFoundException, TicketsSoldOutException, etc.
│       ├── filters/
│       │   └── UserProvisioningFilter.java     # Creates local User on first authenticated hit
│       ├── mappers/
│       │   ├── EventMapper.java                # MapStruct: entity ↔ DTO
│       │   ├── TicketMapper.java
│       │   └── TicketValidationMapper.java
│       ├── repositories/                       # Spring Data JPA interfaces
│       ├── services/
│       │   ├── EventService.java / impl/EventServiceImpl.java
│       │   ├── TicketService.java / impl/TicketServiceImpl.java
│       │   ├── TicketTypeService.java / impl/TicketTypeServiceImpl.java
│       │   ├── TicketValidationService.java / impl/TicketValidationServiceImpl.java
│       │   └── QrCodeService.java / impl/QrCodeServiceImpl.java
│       └── util/
│           └── JwtUtil.java                    # Extracts UUID userId from Jwt principal
└── frontend/
    └── src/
        ├── api/
        │   ├── client.ts                # Axios instance + Bearer token injection
        │   ├── events.api.ts
        │   ├── publishedEvents.api.ts
        │   ├── tickets.api.ts
        │   └── ticketValidation.api.ts
        ├── auth/
        │   ├── keycloak.ts              # Keycloak singleton init
        │   └── AuthProvider.tsx         # Context, token refresh, loading gate
        ├── components/
        │   ├── events/EventForm.tsx
        │   ├── layout/RootLayout.tsx + OrganizerLayout.tsx
        │   ├── ui/Button.tsx + Toast.tsx
        │   └── validation/QrCameraScanner.tsx
        ├── hooks/useQrScanner.ts        # Camera frames → ZXing decode
        ├── pages/
        │   ├── attendee/MyTicketsPage.tsx + TicketDetailPage.tsx
        │   ├── organizer/Dashboard + EventList + Create + Edit + Detail
        │   ├── public/HomePage.tsx + EventDetailPage.tsx
        │   └── staff/TicketValidationPage.tsx
        ├── router/index.tsx             # All routes
        ├── router/guards.tsx            # Role-based <ProtectedRoute>
        ├── schemas/                     # Zod form schemas
        └── types/                       # TypeScript interfaces
```

---

## Data Model

```
User ─────< Event ─────< TicketType ─────< Ticket ─────< TicketValidation
                                               │
                                               └──────< QrCode
```

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| `User` | `id (UUID)`, `keycloakId (UUID)`, `email`, `name` | Provisioned automatically from JWT |
| `Event` | `id`, `organizerId`, `name`, `date`, `location`, `status` | Owned by one User |
| `TicketType` | `id`, `eventId`, `name`, `price (BigDecimal)`, `quantityAvailable`, `quantitySold` | Capacity tracked here |
| `Ticket` | `id`, `attendeeId`, `ticketTypeId`, `status` | Created on purchase |
| `QrCode` | `id`, `ticketId`, `content (UUID string)`, `status` | Content is the scannable payload |
| `TicketValidation` | `id`, `ticketId`, `validatedAt`, `method`, `status` | Immutable audit record |

**Status lifecycle:**

```
Event:    DRAFT ──▶ PUBLISHED ──▶ CANCELLED
Ticket:   VALID ──▶ REDEEMED
QrCode:   ACTIVE ──▶ USED
```

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Events (Organizer — JWT required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/events` | Create a new draft event |
| `GET` | `/events` | List own events (Spring `Pageable`) |
| `GET` | `/events/{eventId}` | Get event + ticket types |
| `PUT` | `/events/{eventId}` | Update event fields |
| `DELETE` | `/events/{eventId}` | Delete an owned event |
| `POST` | `/events/{eventId}/ticket-types` | Add a ticket type |
| `PUT` | `/events/{eventId}/ticket-types/{id}` | Update a ticket type |
| `DELETE` | `/events/{eventId}/ticket-types/{id}` | Remove a ticket type |

### Published Events (Public — no auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/published-events` | List all published events (paginated) |
| `GET` | `/published-events/{eventId}` | Get published event details + ticket types |

### Tickets (Attendee — JWT required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/events/{eventId}/ticket-types/{ticketTypeId}/tickets` | Purchase a ticket |
| `GET` | `/tickets` | List my purchased tickets |
| `GET` | `/tickets/{ticketId}` | Get ticket detail + QR code PNG |

### Ticket Validation (Staff — JWT required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/ticket-validations` | Validate a ticket by QR content; marks it `REDEEMED` |

**Error shape** (all errors):

```json
{
  "status": 404,
  "message": "Event not found with id: ...",
  "timestamp": "2025-04-01T10:30:00Z"
}
```

---

## Security Design

The backend is configured as a **stateless OAuth2 Resource Server** in `SecurityConfig.java`:

```java
http.oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt
    .jwtAuthenticationConverter(jwtAuthenticationConverter)));
```

- JWT issuer URI: `http://localhost:9090/realms/event-ticket-platform`
- Spring verifies the signature and expiry on every request — no session, no database hit for auth
- `JwtAuthenticationConverter` extracts realm roles from the `realm_access.roles` claim and maps them to `ROLE_*` authorities
- Public paths (`/api/v1/published-events/**`) are fully open
- `UserProvisioningFilter` runs after JWT validation and inserts a `User` row if none exists for `keycloakId`

**Required Keycloak roles:**

| Role | Access |
|------|--------|
| `ROLE_ORGANIZER` | All `/events/**` write endpoints |
| `ROLE_STAFF` | `POST /ticket-validations` |
| *(any authenticated user)* | Ticket purchase + listing |

---

## Getting Started

### Prerequisites

- Java 21+
- Node.js 18+ and npm
- Docker + Docker Compose

### Step 1 — Start infrastructure

```bash
cd backend
docker compose up -d
```

This launches:

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary database |
| Adminer | 8888 | Web DB admin UI |
| Keycloak | 9090 | Identity provider |

### Step 2 — Configure Keycloak

1. Open `http://localhost:9090` → log in with `admin` / `admin`
2. Create realm: `event-ticket-platform`
3. Create a **Client** for the frontend (Client type: OpenID Connect, Standard flow enabled)
   - Client ID: `event-ticket-frontend`
   - Valid redirect URIs: `http://localhost:5173/*`
   - Web origins: `http://localhost:5173`
4. Create realm roles: `ROLE_ORGANIZER`, `ROLE_STAFF`
5. Create test users and assign roles

### Step 3 — Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

Starts on port `8080`. Update `application.properties` if your PostgreSQL port differs.

### Step 4 — Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Starts on `http://localhost:5173`.

---

## Configuration

### Backend — `application.properties`

```properties
# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=yourpassword

# Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Keycloak JWT validation
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:9090/realms/event-ticket-platform
```

> **Note:** `docker-compose.yml` exposes PostgreSQL on `5432`; the checked-in config uses `5433`. Align the port before running.

### Frontend — `src/auth/keycloak.ts`

Update the Keycloak instance configuration to match your realm:

```ts
const keycloak = new Keycloak({
  url: 'http://localhost:9090',
  realm: 'event-ticket-platform',
  clientId: 'event-ticket-frontend',
});
```

---

## Frontend Guide

### Authentication flow

1. App boots → `AuthProvider` calls `keycloak.init({ onLoad: 'check-sso', silentCheckSsoRedirectUri: ... })`
2. Unauthenticated users see public pages; a login click redirects to Keycloak
3. After Keycloak login, the user is redirected back with a code; `keycloak-js` exchanges it for tokens
4. `api/client.ts` reads `keycloak.token` and attaches `Authorization: Bearer <token>` to every request
5. Token auto-refreshes via `keycloak.updateToken(30)` before each API call

### Role-based routing

`router/guards.tsx` exports a `<ProtectedRoute role="ROLE_ORGANIZER" />` wrapper. Unknown roles land on the Unauthorized page.

### QR scanning (staff page)

`useQrScanner.ts` opens the device camera stream, grabs frames at 200ms intervals, and passes each frame to ZXing's `BrowserMultiFormatReader`. On a successful decode it fires `onScan(result)`, which calls the validation API.

---

## Screenshots

All 17 screenshots covering the full user flow are in the [`Images/`](./Images/) directory.

| # | Screen |
|---|--------|
| 1–3 | Home page + event listing |
| 4–6 | Organizer dashboard + event creation |
| 7–9 | Event detail + ticket type management |
| 10–12 | Attendee ticket purchase flow |
| 13–15 | My Tickets + ticket detail + QR code |
| 16–17 | Staff QR scanner + validation result |

---

## Future Improvements

- Migrate from `ddl-auto=update` to **Flyway** or **Liquibase** for production-safe schema migrations
- Move all secrets and URLs to environment variables / Vault
- Add **OpenAPI / Swagger UI** for self-documenting REST endpoints
- Integrate a **payment gateway** (Stripe / Razorpay) before ticket issuance
- Add comprehensive integration tests covering security and purchase flows
- Add **event search and filtering** on the public listing page
- **Email confirmation** after ticket purchase with QR code attached

---

## License

See [`backend/LICENSE`](./backend/LICENSE).
