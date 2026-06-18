# Colorir Product Requirements Document (PRD)

> Gerado por Morgan (📋 PM) em 2026-06-17

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-06-17 | 1.0 | Initial PRD draft | Morgan |

---

## 1. Goals and Background Context

### Goals

- Permitir que usuários gerem line-art personalizada via IA (Gemini Nativo) em segundos
- Compilar imagens selecionadas em PDF A4 otimizado para impressão
- Oferecer curadoria de estilos (mandala, cozy, botânica, infantil) para resultados consistentes
- Manter performance de navegação quase instantânea com TanStack Router
- Estabelecer monorepo modular com Drizzle como fonte de verdade única

### Background Context

O Colorir nasce da necessidade de pais, educadores e criadores de conteúdo terem acesso rápido a páginas de colorir temáticas e de qualidade. Soluções existentes ou oferecem bibliotecas fixas sem personalização (SuperColoring), ou exigem prompting avançado de IA (Midjourney). O diferencial do Colorir é unir geração IA otimizada + compilação PDF automática num fluxo único, entregando material pronto para imprimir e colorir offline — promovendo relaxamento longe das telas.

---

## 2. Requirements

### Functional

- **FR1:** Login via Google OAuth (better-auth)
- **FR2:** Gerar line-art B&W via Gemini Nativo (`@google/genai`)
- **FR3:** Prompts guiados por estilo curado (mandala, cozy, botânica, infantil)
- **FR4:** Galeria visual de imagens por usuário
- **FR5:** Seleção múltipla para ações em lote (excluir, exportar)
- **FR6:** Compilar selecionadas em PDF A4 via `pdf-lib`
- **FR7:** Content safety filter (Gemini + blacklist)
- **FR8:** Armazenamento em MinIO vinculado ao ID do usuário

### Non-Functional

- **NFR1:** Navegação instantânea (TanStack Router)
- **NFR2:** API não-IA < 50ms de resposta
- **NFR3:** Geração de imagem < 10s
- **NFR4:** Monorepo (UI separada de DB)
- **NFR5:** Drizzle ORM como fonte de verdade única
- **NFR6:** Docker + Arcane + VPS Hetzner
- **NFR7:** MinIO para storage (MVP)
- **NFR8:** Schema versionado via Drizzle migrations

---

## 3. User Interface Design Goals

### Overall UX Vision

Interface limpa e focada, que guia o usuário em 3 passos: (1) escolher estilo e escrever prompt → (2) ver resultado na galeria → (3) selecionar e exportar PDF. Mínima fricção, máxima satisfação.

### Key Interaction Paradigms

- Geração via formulário simples (estilo + campo de prompt + botão "Gerar")
- Feedback visual imediato com skeleton/spinner durante geração
- Galeria como grid com seleção via checkbox
- Preview do PDF antes do download

### Core Screens and Views

| Screen | Description |
|--------|-------------|
| **Login** | Landing page com botão "Login com Google" |
| **Studio** | Formulário de geração (estilo + prompt) + resultado |
| **Galeria** | Grid de imagens geradas com seleção múltipla |
| **Preview PDF** | Miniaturas das páginas + reordenação + download |
| **Perfil** | Dashboard com histórico e configurações |

### UX Flows

#### Flow 1: Login → Studio

```
[Landing Page] → clica "Login com Google" → [Google OAuth] → [Autorizar] → redirect → [Studio]
```

**Edge cases:** Token expirado → redirect automático para login; Google recusa → mensagem amigável

#### Flow 2: Studio — Geração de Imagem

```
[Studio] → escolhe estilo → prompt → clica "Gerar"
    → valida limite diário → [Loading/Skeleton]
    → Gemini processa → imagem salva no MinIO
    → Galeria atualizada → Toast: "Imagem gerada!"
```

**Edge cases:** Timeout Gemini → toast + "Tentar novamente"; Safety filter bloqueia → mensagem explicativa

#### Flow 3: Galeria — Seleção e Ações

```
[Galeria] → check/uncheck thumbnails → barra de ações
    → "Exportar PDF" ou "Excluir" (com confirmação)
    → Toast: sucesso/erro
```

**Edge cases:** Nenhuma seleção → ações desabilitadas; Galeria vazia → CTA "Gerar primeira imagem"

#### Flow 4: Preview + Download PDF

```
[Galeria] → "Exportar PDF" → [Preview com miniaturas]
    → reordenar (opcional) → "Confirmar e Baixar"
    → Geração via pdf-lib → Download: colorir-{timestamp}.pdf
```

**Edge cases:** PDF > 10MB → aviso; Geração falha → mensagem de erro

### Accessibility

None (MVP — sem requisitos WCAG específicos)

### Branding

Sem branding definido — interface limpa e neutra para MVP

### Target Platforms

Web Responsive (desktop + tablet)

---

## 4. Technical Assumptions

| Aspect | Decision |
|--------|----------|
| **Repository Structure** | Monorepo (apps/web, apps/api, packages/*) |
| **Service Architecture** | Monolith no backend (Hono BFF + serviços internos) |
| **Testing** | Unit + Integration (Vitest) |
| **Frontend** | React + TanStack Router + TailwindCSS + shadcn/ui |
| **Backend** | Hono (API routes) |
| **Database** | PostgreSQL self-hosted (Docker) |
| **ORM** | Drizzle ORM |
| **IA** | Gemini Nativo (`@google/genai`, modelos `gemini-3-pro-image-preview`) |
| **PDF** | `pdf-lib` (server-side Node.js) |
| **Auth** | better-auth + Google OAuth |
| **Storage** | MinIO (S3-compatible, Docker) — MVP; Cloudflare R2 no futuro |
| **Infra** | Docker Compose → Arcane → Hetzner VPS |
| **IA Key** | Híbrido: sistema fornece key + limite diário (20 img/dia); opção de própria key no perfil (pós-MVP) |

---

## 5. Epic List

### Epic 1: Foundation & Authentication

> Setup do monorepo, Docker, banco PostgreSQL, MinIO, e autenticação Google OAuth.

**Stories:**

**1.1 — Setup do Monorepo e Infra Docker**
> Como desenvolvedor, quero estruturar o monorepo (apps/web, apps/api, packages/*) com Docker Compose (PostgreSQL + MinIO) e deploy via Arcane, para que o ambiente de desenvolvimento e produção estejam prontos.
- AC1: Monorepo com workspaces configurados (npm/pnpm)
- AC2: Dockerfile para web (React+Vite) e api (Hono)
- AC3: docker-compose.yml com PostgreSQL + MinIO
- AC4: Deploy via Arcane funcional (health check)

**1.2 — Setup Drizzle ORM + Schema Inicial**
> Como desenvolvedor, quero configurar o Drizzle ORM com PostgreSQL e criar o schema inicial (user, session, userImages), para que o banco seja a fonte de verdade única.
- AC1: Drizzle kit configurado com migrations
- AC2: Tabelas `user`, `session`, `userImages` criadas
- AC3: Migração inicial executável

**1.3 — Autenticação Google OAuth (better-auth)**
> Como usuário, quero fazer login com minha conta Google, para que eu possa acessar a plataforma sem criar senha.
- AC1: Botão "Login com Google" na tela inicial
- AC2: better-auth configurado com Google OAuth provider
- AC3: Sessão persistida (cookie/token)
- AC4: Logout funcional
- AC5: Redirecionamento para Studio após login

**1.4 — Setup MinIO + Upload de Imagens**
> Como desenvolvedor, quero configurar o MinIO (bucket `colorir-images`) e criar a função de upload, para que as imagens geradas sejam armazenadas.
- AC1: Bucket `colorir-images` criado automaticamente no startup
- AC2: Função `uploadImage(userId, buffer, filename)` implementada
- AC3: Função `getImageUrl(imageId)` implementada
- AC4: Configuração via variáveis de ambiente (MINIO_ENDPOINT, MINIO_ACCESS_KEY, etc.)

---

### Epic 2: AI Studio + Galeria

> Integrar Gemini Nativo para geração de line-art, implementar o formulário de prompt com estilos curados, e exibir os resultados em uma galeria visual.

**Stories:**

**2.1 — Integração Gemini Nativo (Spike Técnico)**
> Como desenvolvedor, quero testar a qualidade da line-art gerada pelo Gemini Nativo com diferentes prompts e estilos, para validar a viabilidade técnica antes de implementar a UI completa.
- AC1: Conectar ao Gemini usando `@google/genai` com modelo `gemini-3-pro-image-preview`
- AC2: Testar prompts para cada estilo (mandala, cozy, botânica, infantil)
- AC3: Validar que as imagens são B&W e próprias para colorir
- AC4: Documentar resultados e prompts de referência

**2.2 — Studio: Formulário de Geração**
> Como usuário, quero escolher um estilo e escrever um prompt para gerar uma line-art, para que eu obtenha uma página personalizada para colorir.
- AC1: Seletor de estilo visual (4 opções: mandala, cozy, botânica, infantil)
- AC2: Campo de texto para prompt livre
- AC3: Botão "Gerar" com loading state (skeleton/spinner)
- AC4: Validação de limite diário de gerações (20/dia)
- AC5: Chamada para API Hono que orquestra o Gemini
- AC6: Tratamento de erro (timeout, falha Gemini, conteúdo bloqueado)

**2.3 — API de Geração (Hono)**
> Como desenvolvedor, quero uma rota POST `/api/generate-image` que orquestra a chamada ao Gemini e salva a imagem no MinIO, para que o frontend tenha um endpoint confiável.
- AC1: Rota POST `/api/generate-image` recebendo {style, prompt}
- AC2: Construção do prompt otimizado para line-art (system instruction)
- AC3: Chamada ao Gemini com `response_modalities: ['image']`
- AC4: Upload do resultado (base64 → buffer) para MinIO
- AC5: Registro do metadado em `userImages` (userId, prompt, estilo, url)
- AC6: Rate limiting por usuário

**2.4 — Galeria de Imagens**
> Como usuário, quero visualizar todas as imagens que gerei em uma galeria, para que eu possa ver, selecionar e gerenciar meus assets.
- AC1: Grid responsivo de miniaturas
- AC2: Cada card mostra: thumbnail + estilo + data
- AC3: Paginação ou infinite scroll
- AC4: Estado vazio ("Nenhuma imagem gerada ainda")
- AC5: Loading state durante carregamento

**2.5 — Seleção Múltipla e Ações em Lote**
> Como usuário, quero selecionar várias imagens da galeria e executar ações em lote, para que eu possa gerenciar eficientemente meus assets.
- AC1: Checkbox em cada card da galeria
- AC2: Select all / deselect all
- AC3: Contador de itens selecionados
- AC4: Ações: "Exportar PDF" e "Excluir selecionadas"
- AC5: Confirmação antes de excluir

---

### Epic 3: Motor de Exportação PDF

> Compilar as imagens selecionadas em um PDF A4 otimizado para impressão, com preview e download.

**Stories:**

**3.1 — Serviço de Geração de PDF (Hono + pdf-lib)**
> Como desenvolvedor, quero implementar o serviço server-side de geração de PDF usando pdf-lib, para que imagens selecionadas sejam compiladas em formato A4 pronto para impressão.
- AC1: Rota POST `/api/generate-pdf` recebendo array de imageIds
- AC2: pdf-lib cria documento A4 (595.28 x 841.89 pts)
- AC3: Cada imagem é embedada via `embedJpg()`/`embedPng()` em página própria
- AC4: Quebra de página automática entre imagens
- AC5: PDF gerado é salvo no MinIO (`pdfs/{userId}/`)
- AC6: Registro salvo em tabela `userPdfs` (userId, url, imageCount)
- AC7: Tratamento de erro: imagem não encontrada, pdf-lib falha

**3.2 — Preview do PDF**
> Como usuário, quero visualizar uma prévia do PDF antes de baixar, para que eu possa confirmar a seleção e a ordem das páginas.
- AC1: Preview com miniaturas das páginas na ordem
- AC2: Possibilidade de reordenar imagens antes de gerar
- AC3: Botão "Confirmar e Baixar PDF"
- AC4: Estado vazio ("Selecione imagens primeiro")

**3.3 — Download do PDF**
> Como usuário, quero baixar o PDF gerado de forma rápida e segura, para que eu possa imprimir e colorir.
- AC1: Download direto do arquivo via URL assinada do MinIO
- AC2: Nome do arquivo: `colorir-{timestamp}.pdf`
- AC3: Feedback de progresso durante geração
- AC4: Tratamento de erro se PDF excede tamanho limite

---

## 6. Checklist Results Report

### Executive Summary

- **Completeness:** ~80%
- **MVP Scope:** Just Right (3 épicos bem dimensionados)
- **Readiness:** Nearly Ready — pronto para arquitetura

### Category Statuses

| Category | Status |
|----------|--------|
| 1. Problem Definition & Context | ✅ PASS |
| 2. MVP Scope Definition | ✅ PASS |
| 3. User Experience Requirements | ⚠️ PARTIAL |
| 4. Functional Requirements | ✅ PASS |
| 5. Non-Functional Requirements | ⚠️ PARTIAL |
| 6. Epic & Story Structure | ✅ PASS |
| 7. Technical Guidance | ✅ PASS |
| 8. Cross-Functional Requirements | ⚠️ PARTIAL |
| 9. Clarity & Communication | ✅ PASS |

### Recommendations

- UX flows detalhados foram adicionados nesta versão
- Monitoring/alerting e backup plan podem ser definidos durante arquitetura
- PRD está pronto para handoff ao **@architect (Aria)**

---

## 7. Next Steps

### Architect Prompt

Este PRD está pronto para o **@architect (Aria)** iniciar o desenho da arquitetura do Colorir. O documento cobre o escopo completo do MVP em 3 épicos, com stories detalhadas e acceptance criteria. Foco especial no Epic 1 (Foundation) para estabelecer a base Docker + MinIO + Auth, seguido pelo Epic 2 (AI Studio + Galeria) com spike técnico do Gemini Nativo, e Epic 3 (Motor de Exportação PDF) com pdf-lib.

### UX Expert Prompt

Os UX flows e core screens estão definidos neste PRD. O designer deve focar em: interface limpa e minimalista do Studio, grid responsivo da galeria, preview do PDF com reordenação, e feedback visual durante geração da IA.
