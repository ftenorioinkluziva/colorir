# PRD Sprint Plan

Source of truth: [docs/prd.md](../../prd.md)

This plan turns the PRD backlog into an execution-ready sprint sequence.
All three sprints have been executed and are retained here as a completed delivery record.

---

## Sprint 1 - Foundation

### Goal

Establish the project foundation: monorepo, schema, auth, and storage.

### Stories

1. `1.1` Setup do Monorepo e Infra Docker
1. `1.2` Setup Drizzle ORM + Schema Inicial
1. `1.3` Autenticação Google OAuth (better-auth)
1. `1.4` Setup MinIO + Upload de Imagens

### Dependency Notes

- Start with `1.1`.
- `1.2` follows `1.1`.
- `1.3` depends on `1.1` and `1.2`.
- `1.4` depends on `1.1` and can run in parallel with `1.3` after the base platform exists.

### Exit Criteria

- Workspaces bootstrapped.
- Database schema and migrations path ready.
- Auth flow and storage primitives ready for AI work.

---

## Sprint 2 - AI Studio + Gallery

### Goal

Deliver image generation and gallery workflows.

### Stories

1. `2.1` Integração AI Gateway (Spike Técnico)
1. `2.2` Studio: Formulário de Geração
1. `2.3` API de Geração (Hono)
1. `2.4` Galeria de Imagens
1. `2.5` Seleção Múltipla e Ações em Lote
1. `2.6` Otimização de Prompt e Capacidade do Modelo
1. `2.7` Parâmetros Avançados de Geração de Imagem
1. `2.8` Migrar Geração de Imagem para generateText (Gemini)

### Dependency Notes

- `2.1` is the completed technical spike that de-risks the rest of the sprint.
- `2.2` depends on auth and spike outcomes.
- `2.3` depends on schema, auth, storage, and spike findings.
- `2.4` depends on image persistence and API output.
- `2.5` depends on gallery selection.
- `2.6` depends on the generation API and gallery flow, and validates prompt quality across supported styles.

### Exit Criteria

- Image generation API works end-to-end.
- Gallery can display generated images.
- Multi-select and batch action workflow is available.
- Prompt quality is validated through the completed AI Gateway spike and the follow-on prompt optimization work for all supported styles.

---

## Sprint 3 - PDF Export

### Goal

Complete the export loop from selection to downloadable PDF.

### Stories

1. `3.1` Serviço de Geração de PDF (Hono + pdf-lib)
1. `3.2` Preview do PDF
1. `3.3` Download do PDF

### Dependency Notes

- `3.1` is the core dependency for the sprint.
- `3.2` depends on selection and PDF generation.
- `3.3` depends on `3.1` and `3.2`.

### Exit Criteria

- PDF generation is server-side and reliable.
- Preview supports confirmation and ordering.
- Download flow is complete and safe.

---

## Release Gates

- Sprint 1 must be complete before Sprint 2 starts.
- Sprint 2 must be functionally complete before Sprint 3 starts.
- The PRD backlog should be reprioritized only if dependency validation changes.
- All release gates have been satisfied in the completed execution state.

---

## Execution Notes

- Use [docs/stories/backlog/index.md](index.md) as the prioritized backlog.
- Use [docs/stories/index.md](../index.md) as the PRD story map.
- Keep implementation stories in `docs/stories/1.1-*` through `docs/stories/1.7-*` as historical references only.
- Treat this sprint plan as archived documentation after closure of Epic 1, Epic 2, and Epic 3.
