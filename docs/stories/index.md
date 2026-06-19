# PRD Story Map

Source of truth: [docs/prd.md](../prd.md)

This map reflects the planned product stories from the PRD.
The implementation stories in `docs/stories/1.1-*` through `docs/stories/1.7-*` are closed delivery artifacts and are not part of this planning map.

---

## Epic Overview

| Epic | Name | Scope |
|------|------|-------|
| 1 | Foundation & Authentication | Monorepo setup, Docker, PostgreSQL, MinIO, and Google OAuth |
| 2 | AI Studio + Galeria | AI Gateway generation, curated prompts, and image gallery workflows |
| 3 | Motor de Exportação PDF | PDF compilation, preview, and download |

---

## Epic 1: Foundation & Authentication

| Story | Title | Status | Draft |
|------|-------|--------|-------|
| 1.1 | [Setup do Monorepo e Infra Docker](backlog/epic-1/1.1-setup-monorepo-infra-docker.md) | Draft | Monorepo, Docker Compose, PostgreSQL, MinIO, Arcane deploy |
| 1.2 | [Setup Drizzle ORM + Schema Inicial](backlog/epic-1/1.2-setup-drizzle-orm-schema-inicial.md) | Draft | Drizzle, schema inicial, migrations |
| 1.3 | [Autenticação Google OAuth (better-auth)](backlog/epic-1/1.3-autenticacao-google-oauth-better-auth.md) | Draft | Google login, session, logout, redirect to Studio |
| 1.4 | [Setup MinIO + Upload de Imagens](backlog/epic-1/1.4-setup-minio-upload-imagens.md) | Draft | Bucket creation, upload helpers, image URL helpers |

### Story Notes

- The PRD defines Epic 1 as the foundation for the entire product.
- These stories are prerequisites for the AI and PDF workflows.

---

## Epic 2: AI Studio + Galeria

| Story | Title | Status | Draft |
|------|-------|--------|-------|
| 2.1 | [Integração AI Gateway (Spike Técnico)](backlog/epic-2/2.1-integracao-ai-gateway-spike-tecnico.md) | Completed | Validate line-art generation quality and prompting |
| 2.2 | [Studio: Formulário de Geração](backlog/epic-2/2.2-studio-formulario-de-geracao.md) | Draft | Style selector, prompt field, loading state, validation |
| 2.3 | [API de Geração (Hono)](backlog/epic-2/2.3-api-de-geracao-hono.md) | Draft | POST endpoint, prompt orchestration, MinIO upload, rate limiting |
| 2.4 | [Galeria de Imagens](backlog/epic-2/2.4-galeria-de-imagens.md) | Draft | Grid responsivo, empty state, loading state, pagination |
| 2.5 | [Seleção Múltipla e Ações em Lote](backlog/epic-2/2.5-selecao-multipla-acoes-em-lote.md) | Draft | Multi-select, export PDF, delete selected, confirmation |

### Story Notes

- Epic 2 is the core user value of the MVP.
- The spike story 2.1 should be used to validate model behavior before full UI rollout.

---

## Epic 3: Motor de Exportação PDF

| Story | Title | Status | Draft |
|------|-------|--------|-------|
| 3.1 | [Serviço de Geração de PDF (Hono + pdf-lib)](backlog/epic-3/3.1-servico-geracao-pdf-hono-pdf-lib.md) | Draft | Server-side PDF generation, storage, metadata |
| 3.2 | [Preview do PDF](backlog/epic-3/3.2-preview-do-pdf.md) | Draft | Page thumbnails, reorder flow, confirm and download |
| 3.3 | [Download do PDF](backlog/epic-3/3.3-download-do-pdf.md) | Draft | Signed URL download, filename, progress, size limits |

### Story Notes

- Epic 3 completes the print/export loop.
- PDF generation should be server-side and optimized for A4 output.

---

## Planning Notes

- All stories in this map are sourced directly from `docs/prd.md`.
- Draft story files live under `docs/stories/backlog/epic-*`.
- Operational backlog order lives in `docs/stories/backlog/index.md`.
- The closed implementation stories remain in the repository as historical delivery records.
- When new implementation stories are drafted for the PRD, they should be created from this map rather than reused from the closed delivery set.
