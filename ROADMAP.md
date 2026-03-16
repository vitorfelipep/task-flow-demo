# 🗺️ TaskFlow Roadmap

> Planejamento de releases e features

---

## 📅 Timeline

```
v0.1.0 (MVP) ─────── v0.2.0 ────────── v0.3.0 ────────── v1.0.0
    │                   │                  │                 │
    │                   │                  │                 │
  ATUAL          Segurança +         Colaboração        Launch
                Notificações
```

---

## v0.1.0 - MVP (ATUAL) ✅

**Status:** Concluído  
**Data:** Março 2026

### Features
- ✅ Autenticação JWT
- ✅ CRUD de tarefas
- ✅ Projetos e etiquetas
- ✅ Prioridades (P1-P4)
- ✅ Agendamento
- ✅ Filtros (Hoje, Próximos, Concluídas)
- ✅ Dark mode
- ✅ API REST + Swagger
- ✅ Docker setup

### Débitos
- ⚠️ 32 vulnerabilidades de dependências
- ⚠️ Sem testes automatizados
- ⚠️ Sem CI/CD

---

## v0.2.0 - Segurança + Notificações 🔴

**Status:** Planejado  
**Data:** Abril 2026  
**Prioridade:** CRÍTICA

### Objetivos
1. Resolver problemas de segurança
2. Implementar sistema de notificações
3. Configurar CI/CD básico

### Tasks

#### Segurança (P1)
- [ ] Resolver todas as vulnerabilidades críticas e altas
- [ ] Implementar refresh tokens
- [ ] Adicionar CSRF protection
- [ ] Rate limiting por usuário
- [ ] Sanitização de inputs (XSS)
- [ ] Auditoria de segurança

#### Email (P1)
- [ ] Integrar SendGrid/Resend
- [ ] Template de boas-vindas
- [ ] Reset de senha por email
- [ ] Confirmação de email obrigatória

#### Notificações (P2)
- [ ] Sistema de notificações in-app
- [ ] Notificações de tarefas vencidas
- [ ] Notificações 1h antes do vencimento
- [ ] Email digest diário (opt-in)

#### DevOps (P2)
- [ ] GitHub Actions (lint, type-check, build)
- [ ] Testes unitários (Vitest)
- [ ] Testes E2E básicos (Playwright)
- [ ] Deploy automático (staging)

#### UX (P3)
- [ ] Edição inline de tarefas
- [ ] Melhorar feedback visual
- [ ] Loading skeletons
- [ ] Animações de transição

### Métricas de Sucesso
- ✅ 0 vulnerabilidades críticas
- ✅ 95%+ uptime
- ✅ CI/CD rodando em todas as PRs
- ✅ Emails sendo enviados com sucesso

---

## v0.3.0 - Produtividade + Colaboração 🟠

**Status:** Planejado  
**Data:** Maio 2026  
**Prioridade:** ALTA

### Objetivos
1. Features avançadas de produtividade
2. Fundamentos de colaboração
3. Analytics básico

### Tasks

#### Tasks Avançadas (P1)
- [ ] Subtarefas (hierarquia)
- [ ] Recorrência (diária, semanal, mensal)
- [ ] Drag & drop para reordenar
- [ ] Comentários em tarefas
- [ ] Anexos de arquivos (S3)

#### Configurações (P2)
- [ ] Página de configurações completa
- [ ] Preferências de notificações
- [ ] Timezone e formato de data
- [ ] Temas personalizados
- [ ] Exportar dados (LGPD/GDPR)

#### Colaboração (P2)
- [ ] Compartilhar projetos
- [ ] Convidar colaboradores
- [ ] Atribuir tarefas
- [ ] Permissões (viewer, editor, admin)
- [ ] Feed de atividades

#### Analytics (P3)
- [ ] Dashboard de produtividade
- [ ] Gráficos de tarefas completadas
- [ ] Tempo médio de conclusão
- [ ] Projetos mais ativos

### Métricas de Sucesso
- ✅ 3+ projetos compartilhados em teste
- ✅ 50+ usuários ativos (beta)
- ✅ Feedback positivo (NPS > 40)

---

## v1.0.0 - Launch Público 🚀

**Status:** Planejado  
**Data:** Junho 2026  
**Prioridade:** ALTA

### Objetivos
1. Launch público
2. Planos de precificação
3. Infraestrutura escalável

### Tasks

#### Produto (P1)
- [ ] Polimento de UX
- [ ] Onboarding de novos usuários
- [ ] Tutorial interativo
- [ ] Help center / FAQ
- [ ] Changelog público

#### Business (P1)
- [ ] Sistema de billing (Stripe)
- [ ] Planos Free / Pro / Business
- [ ] Página de pricing
- [ ] Termos de uso
- [ ] Política de privacidade

#### Marketing (P1)
- [ ] Landing page
- [ ] Blog
- [ ] Vídeo demo
- [ ] Product Hunt launch
- [ ] SEO básico

#### Infra (P2)
- [ ] Multi-region deploy
- [ ] CDN para assets
- [ ] Backups automatizados
- [ ] Monitoring (Sentry, DataDog)
- [ ] Status page

#### Mobile (P3)
- [ ] Progressive Web App (PWA)
- [ ] Instalável em iOS/Android
- [ ] Offline-first
- [ ] Push notifications

### Métricas de Sucesso
- ✅ 1000+ usuários registrados
- ✅ 100+ usuários pagantes
- ✅ 99.9% uptime
- ✅ < 1s tempo de resposta (p95)

---

## v2.0.0 - Enterprise 🏢

**Status:** Futuro  
**Data:** Q3 2026

### Features Planejadas
- SSO (SAML, OAuth)
- API pública com rate limits
- Webhooks
- Integrações (Slack, Google Calendar, etc)
- White-label
- Self-hosted enterprise edition
- Compliance (SOC 2, ISO 27001)

---

## Backlog (Sem data definida)

### Integrações
- [ ] Google Calendar sync
- [ ] Outlook integration
- [ ] Slack bot
- [ ] Zapier
- [ ] API pública v1

### Gamificação
- [ ] Streaks
- [ ] Badges/Conquistas
- [ ] Leaderboards (opt-in)

### Mobile Nativo
- [ ] App iOS (React Native?)
- [ ] App Android
- [ ] Notificações push nativas
- [ ] Widgets

### IA
- [ ] Sugestões de prioridade
- [ ] Auto-agendamento inteligente
- [ ] Detecção de tarefas duplicadas
- [ ] Resumo de produtividade por IA

---

## Como Contribuir

### Sugerir Features
1. Abrir issue no GitHub com label `feature-request`
2. Descrever problema e solução proposta
3. Aguardar discussão da comunidade

### Reportar Bugs
1. Abrir issue com label `bug`
2. Incluir steps to reproduce
3. Anexar screenshots/logs

### Pull Requests
1. Fork o repositório
2. Criar branch `feature/nome-da-feature`
3. Implementar + testes
4. Abrir PR com descrição detalhada

---

**Última atualização:** 2026-03-16  
**Versão atual:** v0.1.0
