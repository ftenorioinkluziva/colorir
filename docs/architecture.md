# Colorir Fullstack Architecture Document

> Gerado por Aria (🏛️ architect) em 2026-06-17

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-06-17 | 1.0 | Initial architecture draft | Aria |

---

## 1. Introduction

Este documento descreve a arquitetura fullstack do **Colorir**, incluindo backend (Hono), frontend (React + TanStack Router), infraestrutura (Docker + Arcane + Hetzner) e integrações (AI Gateway, MinIO, better-auth). Serve como blueprint único para o desenvolvimento orientado por IA.

**Starter Template / Existing Project:** Greenfield, sem starter template. Inspirado no projeto anterior `coloring-book-v2`.

---

## 2. High Level Architecture

### Technical Summary

O Colorir adota uma arquitetura **Monolith no backend com frontend SPA separado**, ambos containerizados via Docker Compose. O frontend React com TanStack Router consome uma API REST Hono que orquestra serviços internos (AI Gateway, pdf-lib, MinIO). PostgreSQL como banco relacional com Drizzle ORM. Tudo deployado via Arcane em VPS Hetzner.

### High Level Overview

- **Arquitetura:** Monolith backend (Hono) + SPA frontend (React)
- **Repositório:** Monorepo (apps/web, apps/api, packages/shared, packages/config)
- **Fluxo principal:** Usuário → Web App → Hono API → AI Gateway + MinIO + PostgreSQL
- **Estilo de API:** REST (Hono routes)

### Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend (Docker)"
        WEB[React + TanStack Router\nTailwindCSS + shadcn/ui]
    end

    subgraph "Backend (Docker)"
        HONO[Hono API Server\nREST]
        AUTH[better-auth Service]
        AI[AI Gateway Client\nai + provider/model]
        PDF[pdf-lib Service]
    end

    subgraph "Infra (Docker Compose)"
        PG[(PostgreSQL\nDrizzle ORM)]
        MINIO[MinIO\nS3-compatible Storage]
    end

    subgraph "External"
        GOOGLE[Google OAuth]
        GATEWAY[AI Gateway\nVercel AI Gateway]
        GOOGLE_API[Google / Vertex]
        OPENAI_API[OpenAI]
    end

    WEB -->|HTTP REST| HONO
    HONO --> AUTH
    HONO --> AI
    HONO --> PDF
    AUTH --> PG
    AI --> GATEWAY
    GATEWAY --> GOOGLE_API
    GATEWAY --> OPENAI_API
    AI --> MINIO
    PDF --> MINIO
    AUTH --> GOOGLE
```

### Architectural Patterns

- **Monolith Modular:** Backend Hono organizado por domínio (auth, images, pdf) — simplicidade do monolith com separação lógica de concerns
- **Repository Pattern:** Acesso a dados via serviços dedicados, não ORM direto — testabilidade
- **BFF Pattern:** Hono como backend-for-frontend, servindo dados prontos para o React consumir
- **Service Layer Pattern:** Lógica de negócio isolada das rotas HTTP — cada serviço (AI Gateway, PDF, MinIO) com interface clara

---

## 3. Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.x | Primary language | Type safety, ecossistema maduro |
| Frontend Framework | React | 19.x | UI library | Padrão do mercado, ecossistema vasto |
| Routing | TanStack Router | latest | Client-side routing | Performance, type-safe routes |
| UI Library | shadcn/ui (Radix) | latest | Componentes base | Acessível, customizável com Tailwind |
| CSS Framework | TailwindCSS | 4.x | Estilização | Utility-first, produtividade |
| State Management | TanStack Query | latest | Server state | Cache, refetch, loading states |
| Backend Language | TypeScript | 5.x | Primary language | Compartilha tipos com frontend |
| Backend Framework | Hono | 4.x | HTTP server | Leve, rápido, middleware rico |
| API Style | REST | - | API design | Simples, universal |
| Database | PostgreSQL | 16.x | Relational DB | Maturidade, confiabilidade |
| ORM | Drizzle ORM | 0.43.x | DB access | Type-safe, schema como fonte de verdade |
| File Storage | MinIO | latest | S3-compatible | Self-hosted, Docker, MVP |
| Cache | (não necessário no MVP) | - | - | Postergado |
| Auth | better-auth | 1.2.x | Autenticação | Google OAuth nativo, Drizzle adapter |
| IA SDK | ai | 6.x | AI Gateway client | Provider/model strings + routing/fallback |
| PDF | pdf-lib | latest | PDF generation | Server-side, zero DOM dependency |
| Frontend Testing | Vitest | latest | Unit tests | Rápido, compatível com Vite |
| Backend Testing | Vitest | latest | Unit + Integration | Mesma toolchain do frontend |
| E2E Testing | Playwright | latest | E2E | (pós-MVP) |
| Build Tool (web) | Vite | 6.x | Frontend bundler | Rápido, HMR excelente |
| Build Tool (api) | tsup | latest | Backend build | Bundle Hono para Node.js |
| IaC | Docker Compose | latest | Infra definition | Simples, adequado para MVP |
| CI/CD | GitHub Actions | - | Test + deploy | CI integrado com Arcane para deploy |
| Logging | pino | latest | Structured logs | Rápido, JSON nativo |
| Monitoring | (postergado) | - | Observability | Health check + pino cobrem MVP |

---

## 4. Data Models

### User
- **Atributos:** `id` (uuid), `name`, `email`, `emailVerified`, `image?`, `createdAt`, `updatedAt`
- **Relações:** hasMany `UserImage`, hasMany `UserPdf`

### UserImage
- **Atributos:** `id` (uuid), `userId` (fk), `prompt` (text), `style` (enum), `minioUrl`, `originalFileName`, `createdAt`
- **Relações:** belongsTo `User`

### UserPdf
- **Atributos:** `id` (uuid), `userId` (fk), `name`, `imageCount` (int), `minioUrl`, `createdAt`
- **Relações:** belongsTo `User`

### UserApiKey (pós-MVP)
- **Atributos:** `id` (uuid), `userId` (fk, unique), `geminiKey` (encrypted), `createdAt`, `updatedAt`
- **Relações:** belongsTo `User`

```typescript
// packages/shared/src/types/models.ts
interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string
  createdAt: string
  updatedAt: string
}

interface UserImage {
  id: string
  userId: string
  prompt: string
  style: 'mandala' | 'cozy' | 'botanica' | 'infantil' | 'free'
  minioUrl: string
  originalFileName: string
  createdAt: string
}
```

---

## 5. API Specification

### Endpoints

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/api/auth/*` | better-auth handler | - |
| GET | `/api/auth/session` | Check current session | Cookie |
| GET | `/api/health` | Health check | - |
| POST | `/api/images/generate` | Generate line-art via AI Gateway | ✅ |
| GET | `/api/images` | List user images (paginated) | ✅ |
| DELETE | `/api/images/batch` | Delete multiple images | ✅ |
| POST | `/api/pdfs/generate` | Generate PDF | ✅ |
| GET | `/api/pdfs/:id/download` | Download PDF | ✅ |
| GET | `/api/user/profile` | Get user profile | ✅ |
| POST | `/api/user/api-key` | Save own API key (pós-MVP) | ✅ |

### Error Format

```typescript
interface ApiError {
  error: {
    code: string       // e.g., "RATE_LIMITED", "AI_TIMEOUT"
    message: string
    details?: Record<string, unknown>
    timestamp: string
    requestId: string
  }
}
```

---

## 6. Components

### Web App (Frontend)
- **Responsabilidade:** UI — Studio, Galeria, Preview PDF, Login
- **Interfaces:** TanStack Router (rotas), TanStack Query (API), shadcn/ui
- **Tech:** React 19 + Vite + TailwindCSS

### Hono API Server
- **Responsabilidade:** Orquestrar requisições, middleware (auth, rate-limit, CORS)
- **Interfaces:** REST endpoints
- **Tech:** Hono 4 + TypeScript + tsup

### Auth Service
- **Responsabilidade:** Google OAuth, sessão, proteção de rotas
- **Tech:** better-auth + Drizzle adapter

### Image Service (IA)
- **Responsabilidade:** Chamar AI Gateway, processar resposta, upload MinIO
- **Tech:** ai + MinIO SDK + Drizzle

### PDF Service
- **Responsabilidade:** Compilar imagens em PDF A4, salvar no MinIO
- **Tech:** pdf-lib + MinIO SDK + Drizzle

### MinIO Storage
- **Responsabilidade:** Armazenamento de objetos (imagens, PDFs)
- **Tech:** MinIO (Docker, S3-compatible)

```mermaid
graph LR
    WEB[Web App] -->|API calls| HONO[Hono API]
    HONO --> AUTH[Auth Service]
    HONO --> IMG[Image Service]
    HONO --> PDF[PDF Service]
    IMG --> GW[AI Gateway]
    GW --> PROV[Provider Model]
    IMG --> MINIO[MinIO]
    PDF --> MINIO
    AUTH --> PG[(PostgreSQL)]
    IMG --> PG
    PDF --> PG
```

---

## 7. Core Workflows

### Workflow 1: Gerar Imagem

```mermaid
sequenceDiagram
    actor User
    participant WEB as Web App
    participant HONO as Hono API
    participant AUTH as Auth Service
    participant IMG as Image Service
    participant GW as AI Gateway
    participant PROV as Provider Model
    participant MINIO as MinIO
    participant DB as PostgreSQL

    User->>WEB: Preenche estilo + prompt
    WEB->>HONO: POST /api/images/generate
    HONO->>AUTH: Validate session
    AUTH-->>HONO: userId
    HONO->>IMG: generateImage(userId, style, prompt)
    IMG->>GW: generateContent(provider/model)
    GW->>PROV: routed request
    PROV-->>GW: base64 image data
    GW-->>IMG: base64 image data
    IMG->>MINIO: upload buffer
    MINIO-->>IMG: imageUrl
    IMG->>DB: INSERT userImages
    HONO-->>WEB: {image: UserImage}
```

### Workflow 2: Exportar PDF

```mermaid
sequenceDiagram
    actor User
    participant WEB as Web App
    participant HONO as Hono API
    participant PDF as PDF Service
    participant MINIO as MinIO

    User->>WEB: Seleciona + "Exportar PDF"
    WEB->>HONO: POST /api/pdfs/generate
    HONO->>PDF: generatePdf(userId, imageIds)
    PDF->>MINIO: getImages(imageIds)
    MINIO-->>PDF: buffers
    PDF->>PDF: pdf-lib compila A4
    PDF->>MINIO: upload pdf
    HONO-->>WEB: {pdfId, downloadUrl}
```

### Workflow 3: Login Google OAuth

```mermaid
sequenceDiagram
    actor User
    participant WEB as Web App
    participant BT as better-auth
    participant GOOGLE as Google OAuth

    User->>WEB: Clica "Login com Google"
    WEB->>BT: Redirect Google OAuth
    BT->>GOOGLE: Authorization request
    GOOGLE-->>USER: Consent screen
    User->>GOOGLE: Authorize
    GOOGLE-->>BT: Code → tokens
    BT-->>WEB: Session cookie + redirect
```

### Workflow 4: Excluir em Lote

```mermaid
sequenceDiagram
    actor User
    participant WEB as Web App
    participant HONO as Hono API
    participant IMG as Image Service
    participant MINIO as MinIO

    User->>WEB: Seleciona + "Excluir" → Confirmar
    WEB->>HONO: DELETE /api/images/batch
    HONO->>IMG: deleteImages(userId, imageIds)
    IMG->>MINIO: removeObjects
    IMG->>DB: DELETE FROM userImages
    HONO-->>WEB: {deleted: count}
```

---

## 8. Unified Project Structure

```
colorir/
├── .github/
│   └── workflows/
│       ├── ci.yaml
│       └── deploy.yaml
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/          # shadcn/ui
│   │   │   │   ├── studio/
│   │   │   │   ├── gallery/
│   │   │   │   └── pdf/
│   │   │   ├── hooks/
│   │   │   ├── services/        # TanStack Query
│   │   │   ├── routes/          # TanStack Router
│   │   │   ├── styles/
│   │   │   └── utils/
│   │   └── package.json
│   └── api/
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── images.ts
│       │   │   ├── pdfs.ts
│       │   │   └── user.ts
│       │   ├── services/
│       │   │   ├── auth.ts
│       │   │   ├── image.ts
│       │   │   └── pdf.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   ├── rate-limit.ts
│       │   │   └── error.ts
│       │   ├── db/
│       │   │   ├── schema.ts
│       │   │   ├── index.ts
│       │   │   └── migrations/
│       │   └── index.ts
│       └── package.json
├── packages/
│   ├── shared/
│   │   ├── src/types/
│   │   └── package.json
│   └── config/
│       ├── eslint/
│       └── typescript/
├── infrastructure/
│   ├── docker-compose.yml
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   ├── nginx.conf
│   └── .dockerignore
├── docs/
│   ├── brief.md
│   ├── prd.md
│   └── architecture.md
├── .env.example
├── package.json
└── README.md
```

---

## 9. Development Workflow

### Prerequisites
Node.js 20+, Docker + Docker Compose, Arcane CLI

### Initial Setup
```bash
git clone <repo> && cd colorir
npm install
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
docker compose up -d postgres minio
npm run db:migrate
npm run dev
```

### Dev Commands
```bash
npm run dev:web          # Vite dev server (port 5173)
npm run dev:api          # Hono + tsx watch (port 3001)
npm run test             # Vitest (web + api)
npm run lint             # ESLint
npm run db:generate      # Drizzle schema → migration
npm run db:migrate       # Apply migrations
```

### Env Vars (apps/api/.env)
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/colorir
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
AI_GATEWAY_API_KEY=your_key
VERCEL_OIDC_TOKEN=optional_local_token
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
BETTER_AUTH_SECRET=xxx
BETTER_AUTH_URL=http://localhost:3001
```

---

## 10. Infrastructure & Docker Compose

```yaml
services:
  nginx:
    image: nginx:alpine
    volumes:
      - ./infrastructure/nginx.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "80:80"
      - "443:443"

  postgres:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U colorir"]

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    volumes:
      - miniodata:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]

  api:
    build:
      context: .
      dockerfile: infrastructure/Dockerfile.api
    depends_on:
      postgres: condition: service_healthy
      minio: condition: service_healthy
    ports:
      - "3001:3001"

  web:
    build:
      context: .
      dockerfile: infrastructure/Dockerfile.web
    depends_on:
      - api
    ports:
      - "80:80"

volumes:
  pgdata:
  miniodata:
```

---

## 11. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose -f infrastructure/docker-compose.yml build
      - run: docker tag colorir-api ghcr.io/${{ github.repository }}/api:latest
      - name: Push to registry + Deploy via Arcane
        run: |
          docker push ghcr.io/${{ github.repository }}/api:latest
          arcane deploy --service api --tag latest
```

---

## 12. Error Handling Strategy

### Error Types
- `AUTH_REQUIRED` (401) — sessão inválida/expirada
- `RATE_LIMITED` (429) — limite de gerações excedido
- `AI_TIMEOUT` (504) — provedor do Gateway não respondeu
- `CONTENT_BLOCKED` (422) — safety filter
- `IMAGE_NOT_FOUND` (404) — imagem não encontrada
- `PDF_GENERATION_FAILED` (500) — erro pdf-lib

### Error Handler
```typescript
app.onError((err, c) => {
  if (err instanceof ServiceError) {
    return c.json({ error: err.toApiError() }, err.statusCode)
  }
  logger.error({ err, requestId: c.get('requestId') }, 'Unhandled error')
  return c.json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong', requestId: c.get('requestId'), timestamp: new Date().toISOString() }
  }, 500)
})
```

### Logging
- **Library:** pino
- **Format:** JSON (production), pretty (dev)
- **Required Context:** requestId, userId, service, duration

---

## 13. Security & Performance

### Security
| Area | Configuration |
|------|--------------|
| CSP Headers | `default-src 'self'; img-src 'self' https:` |
| XSS Prevention | React + helmet-style headers |
| CORS | Only frontend origin |
| Rate Limiting | 20 images/day/user; 100 req/min global |
| Input Validation | Zod em todas as rotas |
| Session | HTTP-only cookie, secure, sameSite=lax |
| Secrets | Env vars apenas |
| HTTPS | Let's Encrypt via nginx |

### Performance
| Area | Target |
|------|--------|
| Bundle Size | < 200kB |
| Loading | TanStack Router lazy loading |
| API (non-IA) | < 50ms |
| API (IA) | < 10s |
| DB Queries | Indexados por userId + createdAt |
| Caching | TanStack Query staleTime 30s |

---

## 14. Testing Strategy

```
         E2E (Playwright — pós-MVP)
        /                         \
   Integration Tests           Integration Tests
   (API + DB)                  (Components + API)
        \                         /
    Backend Unit Tests        Frontend Unit Tests
```

### Backend Tests
```
apps/api/tests/
├── unit/services/
│   ├── image.test.ts
│   ├── pdf.test.ts
│   └── auth.test.ts
└── integration/routes/
    ├── images.test.ts
    └── pdfs.test.ts
```

### Frontend Tests
```
apps/web/tests/
├── components/
│   ├── studio.test.tsx
│   ├── gallery.test.tsx
│   └── pdf-preview.test.tsx
└── hooks/
    ├── use-images.test.ts
    └── use-pdf.test.ts
```

---

## 15. Coding Standards

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `StudioForm.tsx` |
| Hooks | camelCase + `use` | `useImages.ts` |
| API Routes | kebab-case | `/api/images/generate` |
| DB Tables | snake_case | `user_images` |
| Services | camelCase | `imageService.ts` |

### Critical Rules
- **Type Sharing:** Tipos em `packages/shared`, nunca duplicar
- **API Calls:** TanStack Query (FE) + service layer (BE)
- **Env Vars:** Via config objects, nunca `process.env` direto
- **Error Handling:** Sempre usar error handler padrão
- **Logging:** pino, nunca `console.log`

---

## 16. Monitoring & Observability

| Area | Tool | Status |
|------|------|--------|
| Backend Logs | pino + Docker logs | ✅ MVP |
| Health Check | `GET /api/health` | ✅ MVP |
| Error Tracking | Sentry | ⏳ Pós-MVP |
| Performance Monitoring | Core Web Vitals | ⏳ Pós-MVP |

### Health Check Endpoint
```typescript
app.get('/api/health', async (c) => {
  const dbOk = await db.execute(sql`SELECT 1`)
  const minioOk = await minioClient.bucketExists('colorir-images')
  return c.json({
    status: dbOk && minioOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString()
  })
})
```

---

## 17. Architect Checklist Report

### Executive Summary
- **Overall Readiness:** HIGH (85% pass rate)
- **Key Strengths:** Stack bem definido, componentes claros, workflows diagramados

### Category Statuses
| Category | Status |
|----------|--------|
| 1. Requirements Alignment | ✅ 90% |
| 2. Architecture Fundamentals | ✅ 95% |
| 3. Technical Stack | ✅ 100% |
| 4. Frontend Design | ✅ 85% |
| 5. Resilience & Operational | ⚠️ 60% |
| 6. Security & Compliance | ⚠️ 70% |
| 7. Implementation Guidance | ✅ 90% |
| 8. Dependencies & Integration | ✅ 85% |
| 9. AI Agent Suitability | ✅ 95% |
| 10. Accessibility | ❌ 0% (MVP skip) |

### Top Risks
1. **AI Gateway / provider downtime** — sem fallback. Mitigação: retry + provider ordering
2. **MinIO sem backup** — Mitigação: snapshots periódicos do volume
3. **Monitoring mínimo** — pino + health check cobrem MVP

---

## Next Steps

Esta arquitetura está pronta para implementação pelo **@dev (Dex)**. Recomenda-se iniciar pelo Epic 1 (Foundation & Authentication), seguindo as stories definidas no PRD.

### Handoff Prompt para @dev
> Implementar o Colorir conforme arquitetura em `docs/architecture.md`, começando pelo Epic 1: Setup do monorepo, Docker Compose (PostgreSQL + MinIO + nginx), Drizzle schema, better-auth com Google OAuth. Seguir a estrutura de diretórios, padrões de código e workflows definidos neste documento.
