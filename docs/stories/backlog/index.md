# PRD Backlog

Source of truth: [docs/prd.md](../../prd.md)

Implementation order is based on dependency flow and product value.
All stories in this backlog have been executed and are now marked as completed for archival purposes.

---

## Backlog Order

| Order | Story | Epic | Sprint | Points | Priority | Status | File |
|------|-------|------|--------|--------|----------|--------|------|
| 1 | 1.1 Setup do Monorepo e Infra Docker | 1 | 1 | 8 | Critical | Completed | [link](epic-1/1.1-setup-monorepo-infra-docker.md) |
| 2 | 1.2 Setup Drizzle ORM + Schema Inicial | 1 | 1 | 5 | Critical | Completed | [link](epic-1/1.2-setup-drizzle-orm-schema-inicial.md) |
| 3 | 1.3 Autenticação Google OAuth (better-auth) | 1 | 1 | 8 | Critical | Completed | [link](epic-1/1.3-autenticacao-google-oauth-better-auth.md) |
| 4 | 1.4 Setup MinIO + Upload de Imagens | 1 | 1 | 5 | High | Completed | [link](epic-1/1.4-setup-minio-upload-imagens.md) |
| 5 | 2.1 Integração AI Gateway (Spike Técnico) | 2 | 2 | 3 | High | Completed | [link](epic-2/2.1-integracao-ai-gateway-spike-tecnico.md) |
| 6 | 2.2 Studio: Formulário de Geração | 2 | 2 | 8 | High | Completed | [link](epic-2/2.2-studio-formulario-de-geracao.md) |
| 7 | 2.3 API de Geração (Hono) | 2 | 2 | 8 | Critical | Completed | [link](epic-2/2.3-api-de-geracao-hono.md) |
| 8 | 2.4 Galeria de Imagens | 2 | 2 | 5 | High | Completed | [link](epic-2/2.4-galeria-de-imagens.md) |
| 9 | 2.5 Seleção Múltipla e Ações em Lote | 2 | 2 | 5 | Medium | Completed | [link](epic-2/2.5-selecao-multipla-acoes-em-lote.md) |
| 10 | 2.6 Otimização de Prompt e Capacidade do Modelo | 2 | 2 | 5 | High | Completed | [link](epic-2/2.6-otimizacao-prompt-capacidade-modelo.md) |
| 11 | 3.1 Serviço de Geração de PDF (Hono + pdf-lib) | 3 | 3 | 8 | Critical | Completed | [link](epic-3/3.1-servico-geracao-pdf-hono-pdf-lib.md) |
| 12 | 3.2 Preview do PDF | 3 | 3 | 5 | Medium | Completed | [link](epic-3/3.2-preview-do-pdf.md) |
| 13 | 3.3 Download do PDF | 3 | 3 | 3 | Medium | Completed | [link](epic-3/3.3-download-do-pdf.md) |

---

## Notes

- Epic 1 should be implemented first because it unblocks the rest of the system.
- Epic 2 should follow once auth, storage, and database foundations are ready.
- Epic 3 depends on image creation and selection workflows being available.
- `1.3` and `1.4` are sibling foundation stories and can be developed in parallel after `1.2` if team capacity allows.
- `2.1` is a spike and can start as soon as the base repo/platform is ready, but it should land before `2.2` and `2.3`.
- `3.1` is the first hard dependency for the PDF flow; `3.2` and `3.3` should not start before it.
- The executable sprint plan lives in `sprint-plan.md`.

---

## Dependency Validation

| Story | Hard Dependencies | Sequencing Note |
|------|-------------------|-----------------|
| 1.1 | None | Bootstrap story; start first |
| 1.2 | 1.1 | Unlocks schema-dependent work |
| 1.3 | 1.1, 1.2 | Auth should follow the base infra and schema |
| 1.4 | 1.1 | Can run alongside 1.3 after the base platform is ready |
| 2.1 | 1.1 | Technical spike; can start early and de-risk 2.2/2.3 |
| 2.2 | 1.3, 2.1 | UI should wait for auth and spike outcomes |
| 2.3 | 1.2, 1.3, 1.4, 2.1 | API depends on storage, auth, and spike findings |
| 2.4 | 1.3, 1.4, 2.3 | Gallery needs persisted images and auth context |
| 2.5 | 2.4 | Batch actions build on gallery selection |
| 3.1 | 1.2, 1.4, 2.5 | PDF generation needs schema, storage, and selected images |
| 3.2 | 2.5, 3.1 | Preview needs selected images and PDF generation flow |
| 3.3 | 3.1, 3.2 | Download is the final step and should close the export loop |

---

## Next Artifact

- [Sprint Plan](sprint-plan.md)
