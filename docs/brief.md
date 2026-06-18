# Project Brief: Colorir

> Gerado por Atlas (🔍 analyst) em 2026-06-17

## Executive Summary

O **Colorir** é uma plataforma web que permite a geração sob demanda de páginas de livros de colorir personalizadas via IA, com compilação em PDF pronto para impressão. Resolve a dificuldade de pais, educadores e criadores de conteúdo em encontrar material de colorir temático e de qualidade — unindo generative AI via **AI Gateway** com um motor de exportação PDF otimizado.

Seu diferencial está na curadoria de estilos visuais (mandalas, cozy, botânica, infantil) e na orquestração eficiente de provedores de IA via backend Hono em monorepo modular. Visão de longo prazo inclui **Style Transfer & Remix** (upload de foto → line-art) e **Community Gallery** para compartilhamento de resultados.

## Problem Statement

Pais, educadores e criadores de conteúdo enfrentam dificuldade em encontrar páginas de colorir com temas específicos e qualidade profissional. Soluções existentes oferecem:

- **Bibliotecas fixas** (SuperColoring, Crayola) — milhares de páginas, mas sem personalização temática sob demanda
- **IA genérica** (Midjourney, DALL-E) — capaz de gerar line-art, mas requer prompting avançado que o usuário comum não domina
- **Composição manual** — baixar imagens uma a uma e montar PDF é trabalhoso

O gap real é **customização temática sob demanda + prompting otimizado para line-art + compilação automática em PDF multi-página**. Além disso, o produto deve incluir filtros de safety para evitar geração de conteúdo impróprio (NSFW).

## Proposed Solution

**Colorir** resolve através de três camadas:

1. **Studio de geração otimizada** — Prompt templates e curadoria de estilos (mandala, cozy, botânica, infantil) que guiam o usuário a resultados consistentes de line-art preto e branco via AI Gateway
2. **Galeria inteligente** — Assets salvos por usuário com seleção em lote para ações de exportação
3. **Motor de exportação PDF** — Compilação das imagens selecionadas em arquivo A4 pronto para impressão via `pdf-lib`, com quebras de página automáticas

**Diferenciais:** monorepo modular, TanStack Router para performance, Drizzle como fonte de verdade única, backend Hono orquestrando provedores de IA com tratamento robusto de erros. O usuário gera, seleciona, exporta PDF, imprime e **colore offline no papel** — relaxamento e diversão longe das telas.

## Target Users

### Primary Segment: Pais e Responsáveis
- **Perfil:** 25–45 anos, pais de crianças 3–12 anos
- **Comportamento:** Buscam atividades offline criativas e educativas para os filhos
- **Dor:** Dificuldade em encontrar material temático personalizado (ex: filha que ama ballet, filho obcecado por dinossauros)
- **Ganho:** Gerar páginas personalizadas em minutos + PDF pronto para imprimir

### Secondary Segment: Educadores
- **Perfil:** Professores da educação infantil e fundamental I
- **Comportamento:** Precisam de material didático visual para sala de aula
- **Dor:** Tempo limitado para preparar atividades manuais; materiais genéricos não atendem temas específicos
- **Ganho:** Criar lotes de páginas por tema (ex: "animais da fazenda", "letra B") em segundos

### Tertiary Segment: Artistas / Criadores de Conteúdo
- **Perfil:** Ilustradores, designers, creators de redes sociais
- **Comportamento:** Usam bases de lineart como ponto de partida para criações
- **Ganho:** Geração rápida de esboços vetorizáveis ou materiais para distribuição digital/gratuita

## Goals & Success Metrics

### Business Objectives
- **Adoção:** 100 usuários ativos (gerou ≥ 1 imagem + baixou ≥ 1 PDF) no primeiro mês
- **Engajamento:** Média de 3 páginas geradas por usuário ativo por semana
- **Retenção:** 40% dos usuários retornam na semana seguinte ao primeiro uso

### User Success Metrics
- Tempo médio < 10s para gerar uma imagem via AI Gateway
- 60% dos usuários completam o fluxo: gerar → selecionar → exportar PDF
- Satisfação do usuário > 4/5 em pesquisa NPS simplificada

### KPIs
- **Imagens Geradas:** Total de imagens geradas por dia
- **PDFs Exportados:** Total de PDFs baixados por dia
- **TTR (Time to Render):** Latência média da geração de imagem
- **Churn Rate:** % de usuários que não retornam em 30 dias
- **Avg. Session Duration:** Tempo médio por sessão

## MVP Scope

### Core Features (Must Have)
- **Login via Google** — Autenticação via better-auth com Google OAuth
- **Gerador de line-art com prompts guiados** — Templates de prompt por estilo + campo livre
- **Galeria de imagens** — Grid visual com as imagens geradas pelo usuário
- **Seleção múltipla** — Checkbox para selecionar várias imagens
- **Exportação PDF** — Compilar selecionadas em PDF A4 pronto para impressão via `pdf-lib`
- **Perfil / Dashboard** — Visualizar histórico e configurar conta

### Out of Scope para MVP
- Community Gallery (pós-lançamento)
- Style Transfer & Remix (pós-lançamento)
- Páginas Colaborativas (investigar para post-MVP)
- Upload manual de imagens
- Planos pagos / assinatura

### MVP Success Criteria
> Um usuário consegue logar com Google, gerar uma line-art a partir de um prompt guiado, visualizar na galeria, selecionar múltiplas imagens e baixar um PDF pronto para impressão — tudo em < 2 minutos.

## Post-MVP Vision

### Phase 2 Features
- **Upload manual** — Upload de imagens próprias para incluir no PDF
- **Community Gallery** — Galeria pública com curadoria para compartilhamento de resultados
- **Style Transfer & Remix** — Upload de foto → geração de line-art correspondente

### Long-term Vision
> O Colorir se torna a plataforma de referência para coloring books personalizados, combinando geração IA com curadoria humana, num ecossistema que conecta criadores de conteúdo (artistas vendendo seus estilos) a usuários finais.

### Expansion Opportunities
- **Marketplace de estilos** — Artistas vendem pacotes de templates/prompts exclusivos
- **App mobile** — Geração e exportação direto do celular
- **API pública** — Integração com plataformas educacionais (escolas, sistemas de ensino)

## Technical Considerations

### Platform Requirements
- **Target Platforms:** Web (desktop-first, responsivo para tablet)
- **Browser Support:** Chrome, Firefox, Safari, Edge (últimas 2 versões)
- **Performance:** Navegação instantânea (TanStack Router); API < 50ms (não-IA)

### Technology Preferences
- **Frontend:** React + TanStack Router + TailwindCSS + shadcn/ui
- **Backend:** Hono (API routes)
- **Database:** PostgreSQL + Drizzle ORM
- **IA:** AI Gateway (`ai` + `provider/model`) com seleção de modelo por capability e fallback configurável
- **PDF:** `pdf-lib` (geração server-side em Node.js, sem DOM dependency)
- **Auth:** better-auth com Google OAuth
- **Storage:** MinIO (S3-compatible, self-hosted em Docker) — MVP; migração futura para Cloudflare R2 se necessário
- **Infra:** Docker Compose em VPS Hetzner + Arcane (https://github.com/getarcaneapp/arcane)

### Architecture Considerations
- **Repository:** Monorepo (apps/web, apps/api, packages/*)
- **Service Architecture:** Backend Hono como BFF; IA chamada via server-side
- **Integration:** AI Gateway via AI SDK (`ai`); Google OAuth via better-auth
- **Deploy:** Docker Compose → Arcane → VPS Hetzner (CX22, ~€4-6/mês)
- **Security:** Content safety filter para evitar geração de conteúdo impróprio

## Constraints & Assumptions

### Constraints
- **Budget:** Bootstrapped / early stage — recursos limitados para APIs de IA
- **Timeline:** MVP em desenvolvimento ativo (CLI-first conforme aiox-core)
- **Recursos:** Time pequeno (provavelmente solo ou dupla)
- **Técnicas:** AI Gateway e os provedores abaixo dele têm limites de rate e custo por requisição

### Key Assumptions
- Usuário tem acesso a impressora para aproveitar o produto
- AI Gateway mantém o provider/model desacoplado do produto e permite fallback entre provedores quando necessário
- Usuário consegue navegar pelo fluxo sem tutorial extenso
- O modelo de negócio inicial é gratuito (sem paywall no MVP)

## Risks & Open Questions

### Key Risks
- **Qualidade dos modelos do Gateway** — Se o modelo não gerar line-art consistente, o produto perde o valor central. **Mitigação:** testar extensivamente antes do lançamento, ter fallback por provider/model
- **Custo de IA escala** — Se o produto crescer, custo por imagem pode inviabilizar modelo gratuito. **Mitigação:** caching de resultados, rate limiting, plano pago futuro
- **Content Safety** — Usuários podem tentar gerar conteúdo impróprio. **Mitigação:** filtro de safety do Gemini + blacklist de prompts
- **Baixa adoção** — Usuários podem preferir soluções gratuitas (SuperColoring). **Mitigação:** foco em diferenciais de personalização + PDF compilado

### Open Questions
- Precisa de armazenamento de imagens (MinIO já cobre) ou o Gemini entrega a imagem inline?
- Deve haver limite de gerações por usuário no MVP?
- Qual estratégia de rate limiting para API de IA?

### Areas Needing Further Research
- Capacidade real dos modelos image-capable expostos pelo AI Gateway para line-art consistente (testes práticos)
- Custo projetado por usuário ativo
- Concorrência direta de ferramentas similares baseadas em IA

## Appendices

### C. References
- AI Gateway: https://vercel.com/docs/ai-gateway
- AI SDK Providers and Models: https://ai-sdk.dev/docs/foundations/providers-and-models
- `pdf-lib`: https://github.com/hopding/pdf-lib
- better-auth: https://www.better-auth.com
- MinIO: https://min.io
- Arcane: https://github.com/getarcaneapp/arcane
- Hetzner Cloud: https://www.hetzner.com/cloud

## Next Steps

### Immediate Actions
1. Validar qualidade dos modelos image-capable do AI Gateway para line-art com testes reais
2. Setup inicial da VPS Hetzner com Arcane + Docker Compose
3. Estruturar monorepo com Dockerfile para web + api
4. Criar primeira story de dev (autenticação Google + setup DB + MinIO)

### PM Handoff
> Este Project Brief fornece o contexto completo para **Morgan (@pm)** iniciar a criação do PRD. Revisar o brief, trabalhar o PRD seção por seção conforme template, pedindo esclarecimentos ou sugerindo melhorias quando necessário.
