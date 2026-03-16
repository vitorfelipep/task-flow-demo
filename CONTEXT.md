# TaskFlow - Contexto do Projeto

> Documentação viva da arquitetura, decisões técnicas e roadmap do projeto

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Backend](#backend)
4. [Frontend](#frontend)
5. [Banco de Dados](#banco-de-dados)
6. [Autenticação e Segurança](#autenticação-e-segurança)
7. [Funcionalidades Implementadas](#funcionalidades-implementadas)
8. [Roadmap - Próximos Passos](#roadmap---próximos-passos)
9. [Regras de Negócio](#regras-de-negócio)
10. [DevOps e CI/CD](#devops-e-cicd)

---

## 🎯 Visão Geral

### O que é o TaskFlow?

Sistema de gerenciamento de tarefas (SaaS) inspirado no Todoist, com foco em:
- **Simplicidade**: Interface limpa e intuitiva
- **Produtividade**: Organização por projetos, prioridades e etiquetas
- **Modernidade**: Stack atual (2026), dark mode, design responsivo
- **Performance**: Métricas de build/cold-start, otimizações

### Público-Alvo (MVP)
- Profissionais autônomos
- Equipes pequenas (até 10 pessoas)
- Pessoas buscando alternativa ao Todoist

### Diferencial Competitivo
- Open-source
- Self-hosted disponível (Docker)
- API REST documentada (Swagger)
- Gratuito para uso pessoal

---

## 🏗 Arquitetura

### Visão Geral
```
┌─────────────────────────────────────────────────────────┐
│                    TaskFlow SaaS                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐          ┌──────────────┐            │
│  │   Frontend   │  ◄────►  │   Backend    │            │
│  │   Next.js    │   HTTP   │   Express    │            │
│  │   Port 3000  │   REST   │   Port 3001  │            │
│  └──────────────┘          └───────┬──────┘            │
│        │                           │                     │
│        │                           ▼                     │
│        │                  ┌──────────────┐              │
│        │                  │  PostgreSQL  │              │
│        │                  │   (Prisma)   │              │
│        │                  └──────────────┘              │
│        │                           │                     │
│        └───────────────────────────┘                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Stack Tecnológica

| Camada | Tecnologia | Versão | Justificativa |
|--------|-----------|--------|---------------|
| **Frontend** | Next.js | 14.1.0 | App Router, SSR, performance |
| **UI** | Tailwind CSS | 3.4.1 | Utility-first, customização |
| **Components** | shadcn/ui | latest | Componentes acessíveis, Radix UI |
| **State** | Zustand | 4.5.0 | Simples, performático |
| **Forms** | React Hook Form | 7.50.0 | Validação, performance |
| **Validation** | Zod | 3.22.0 | Type-safe, runtime validation |
| **Backend** | Express | 4.18.2 | Maduro, extensível |
| **ORM** | Prisma | 5.9.0 | Type-safe, migrations |
| **Database** | PostgreSQL | 16 | Relacional, ACID, performance |
| **Auth** | JWT | 9.0.2 | Stateless, escalável |
| **Docs** | Swagger | 3.0 | OpenAPI, interativo |

### Estrutura de Monorepo (Turborepo)

```
task-flow-demo/
├── apps/
│   ├── api/                 # Backend Express
│   │   ├── src/
│   │   │   ├── config/      # Swagger, env
│   │   │   ├── controllers/ # Lógica de negócio
│   │   │   ├── middlewares/ # Auth, errors, logging
│   │   │   ├── routes/      # Endpoints REST
│   │   │   └── index.ts     # Entry point
│   │   └── package.json
│   │
│   └── web/                 # Frontend Next.js
│       ├── src/
│       │   ├── app/         # Pages (App Router)
│       │   ├── components/  # UI components
│       │   ├── hooks/       # Custom React hooks
│       │   ├── lib/         # API client, utils
│       │   └── stores/      # Zustand state
│       └── package.json
│
├── packages/
│   ├── config/              # ESLint, TypeScript configs
│   ├── database/            # Prisma schema, seeds, migrations
│   ├── shared/              # Types, validations (Zod)
│   └── ui/                  # Shared UI components (shadcn/ui)
│
├── scripts/
│   └── measure-perf.mjs     # Performance analytics
│
├── docker-compose.yml       # PostgreSQL, Redis
├── start-dev.sh             # Dev startup
└── turbo.json              # Build pipeline
```

---

## 🔧 Backend

### Arquitetura em Camadas

```
Request → Routes → Middlewares → Controllers → Services → Database
```

#### 1. **Routes** (`src/routes/`)
- Definição de endpoints
- Documentação Swagger (JSDoc)
- Mapeamento de verbos HTTP

**Rotas Implementadas:**
- `auth.ts` - Autenticação
- `tasks.ts` - Tarefas
- `projects.ts` - Projetos
- `labels.ts` - Etiquetas
- `health.ts` - Health check

#### 2. **Middlewares** (`src/middlewares/`)
- `auth.ts` - Autenticação JWT
- `error-handler.ts` - Tratamento global de erros
- `not-found.ts` - 404 handler

#### 3. **Controllers** (`src/controllers/`)
- `AuthController` - Signup, Login, Profile
- `TasksController` - CRUD de tarefas
- `ProjectsController` - Gerenciamento de projetos
- `LabelsController` - Gerenciamento de etiquetas
- `HealthController` - Status do sistema

**Padrão:**
```typescript
export class TasksController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Validação (Zod)
      // Lógica de negócio
      // Resposta padronizada
    } catch (error) {
      next(error);
    }
  }
}
```

#### 4. **Validações** (Zod)
- Runtime validation
- Type inference
- Mensagens de erro customizadas
- Transformação de dados (string vazia → undefined)

#### 5. **Tratamento de Erros**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### API Endpoints

#### Auth (`/api/auth`)
| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/signup` | ❌ | Criar conta |
| POST | `/login` | ❌ | Login |
| GET | `/me` | ✅ | Perfil do usuário |
| PATCH | `/me` | ✅ | Atualizar perfil |
| POST | `/change-password` | ✅ | Alterar senha |

#### Tasks (`/api/tasks`)
| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/` | ✅ | Listar tarefas (filtros) |
| GET | `/today` | ✅ | Tarefas de hoje |
| GET | `/upcoming` | ✅ | Próximos 7 dias |
| GET | `/overdue` | ✅ | Tarefas atrasadas |
| GET | `/:id` | ✅ | Detalhes da tarefa |
| POST | `/` | ✅ | Criar tarefa |
| PATCH | `/:id` | ✅ | Atualizar tarefa |
| PATCH | `/bulk` | ✅ | Atualizar múltiplas |
| POST | `/:id/toggle` | ✅ | Marcar completa/pendente |
| DELETE | `/:id` | ✅ | Excluir tarefa |

#### Projects (`/api/projects`)
| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/` | ✅ | Listar projetos |
| GET | `/:id` | ✅ | Detalhes do projeto |
| GET | `/:id/stats` | ✅ | Estatísticas |
| POST | `/` | ✅ | Criar projeto |
| POST | `/reorder` | ✅ | Reordenar projetos |
| PATCH | `/:id` | ✅ | Atualizar projeto |
| POST | `/:id/archive` | ✅ | Arquivar projeto |
| DELETE | `/:id` | ✅ | Excluir projeto |

#### Labels (`/api/labels`)
| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/` | ✅ | Listar etiquetas |
| GET | `/:id` | ✅ | Detalhes da etiqueta |
| POST | `/` | ✅ | Criar etiqueta |
| PATCH | `/:id` | ✅ | Atualizar etiqueta |
| POST | `/:id/merge` | ✅ | Mesclar etiquetas |
| DELETE | `/:id` | ✅ | Excluir etiqueta |

---

## 🎨 Frontend

### Arquitetura de Componentes

```
app/
├── (auth)/
│   ├── login/
│   └── signup/
└── dashboard/
    ├── layout.tsx       # Sidebar + Header
    ├── page.tsx         # Hoje
    ├── upcoming/
    ├── inbox/
    └── completed/

components/
├── layout/
│   ├── sidebar.tsx      # Navegação
│   └── header.tsx       # User menu, search
├── tasks/
│   ├── task-list.tsx
│   ├── task-item.tsx
│   └── add-task-button.tsx
├── projects/
│   └── add-project-dialog.tsx
└── labels/
    └── add-label-dialog.tsx
```

### State Management (Zustand)

#### `auth-store.ts`
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user, token) => void;
  logout: () => void;
}
```
- Persistido em localStorage
- Usado em toda a aplicação
- Auto-rehydration

#### `tasks-store.ts`
```typescript
interface TasksState {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  currentView: TaskView;
  selectedProjectId: string | null;
  selectedLabelId: string | null;
  searchQuery: string;
  // ... mutations
}
```

### Design System

#### Cores (Tailwind)
```css
--primary: hsl(262 83% 58%)      /* Violet */
--secondary: hsl(220 14.3% 95.9%)
--destructive: hsl(0 84.2% 60.2%)
--muted: hsl(220 14.3% 95.9%)
```

#### Prioridades
- **P1**: Vermelho (#FF6B6B) - Urgente
- **P2**: Laranja (#FFA500) - Alta
- **P3**: Azul (#45B7D1) - Média
- **P4**: Cinza (#808080) - Baixa

#### Componentes (shadcn/ui)
- Button, Input, Label
- Dialog, Card, Badge
- Checkbox, Avatar, Toast
- Todos customizados com Tailwind

---

## 🗄 Banco de Dados

### Schema Prisma

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   # bcrypt hash
  name      String
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tasks    Task[]
  projects Project[]
  labels   Label[]
}

model Project {
  id        String   @id @default(cuid())
  name      String
  color     String   @default("#808080")
  isInbox   Boolean  @default(false)
  order     Int      @default(0)
  userId    String
  user      User     @relation(...)
  tasks     Task[]
}

model Label {
  id     String @id @default(cuid())
  name   String
  color  String @default("#808080")
  userId String
  user   User   @relation(...)
  tasks  TaskLabel[]
  
  @@unique([userId, name])
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  status      String    @default("pending")
  priority    String    @default("P4")
  dueDate     DateTime?
  dueTime     String?
  order       Int       @default(0)
  completedAt DateTime?
  
  userId    String
  projectId String
  user      User      @relation(...)
  project   Project   @relation(...)
  labels    TaskLabel[]
  
  @@index([userId, status])
  @@index([userId, dueDate])
}

model TaskLabel {
  taskId  String
  labelId String
  task    Task   @relation(...)
  label   Label  @relation(...)
  
  @@id([taskId, labelId])
}
```

### Índices Estratégicos
- `user.email` (unique) - Login rápido
- `task.userId + status` - Filtro por status
- `task.userId + dueDate` - Ordenação por data
- `label.userId + name` (unique) - Unicidade de nomes

---

## 🔐 Autenticação e Segurança

### Fluxo de Autenticação

```
1. Signup/Login → Backend valida credenciais
2. Backend gera JWT com payload { userId, email }
3. JWT enviado ao frontend (7 dias de validade)
4. Frontend armazena em localStorage (Zustand persist)
5. Toda requisição inclui: Authorization: Bearer {token}
6. Middleware auth.ts valida JWT antes de processar request
```

### JWT Payload
```typescript
interface AuthPayload {
  userId: string;
  email: string;
  iat: number;    // Issued at
  exp: number;    // Expiration
}
```

### Senha
- Hash: **bcrypt** (cost factor: 12)
- Validação: Mínimo 8 caracteres, maiúscula, minúscula, número
- Armazenamento: Apenas hash no banco

### Rate Limiting
- **15 minutos**: 100 requests por IP
- Aplicado em todas as rotas `/api/*`

### Headers de Segurança (Helmet)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`
- CSP (Content Security Policy)

### CORS
- Origem permitida: `NEXT_PUBLIC_APP_URL`
- Credentials: `true`

### Vulnerabilidades Conhecidas
⚠️ **32 vulnerabilidades** detectadas pelo GitHub Dependabot:
- 2 críticas
- 14 altas
- 12 moderadas
- 4 baixas

**Ação necessária:** Executar `npm audit fix` e revisar dependências

---

## ✅ Funcionalidades Implementadas

### Auth
- [x] Signup (criação de conta)
- [x] Login (email/senha)
- [x] Obter perfil (`/me`)
- [x] Atualizar perfil (nome, avatar)
- [x] Alterar senha
- [x] Logout (client-side)

### Tasks
- [x] Criar tarefa
- [x] Listar tarefas (com filtros)
- [x] Tarefas de hoje
- [x] Tarefas próximas (7 dias)
- [x] Tarefas atrasadas
- [x] Marcar como completa/pendente
- [x] Excluir tarefa
- [x] Atualizar tarefa
- [x] Atualização em massa (bulk)
- [x] Prioridades (P1-P4)
- [x] Agendamento (data + hora)
- [x] Associar a projeto
- [x] Associar a etiquetas

### Projects
- [x] Criar projeto
- [x] Listar projetos
- [x] Visualizar tarefas do projeto
- [x] Estatísticas do projeto
- [x] Atualizar projeto
- [x] Reordenar projetos
- [x] Arquivar projeto
- [x] Excluir projeto (move tarefas para Inbox)
- [x] Inbox automático (criado no signup)

### Labels
- [x] Criar etiqueta
- [x] Listar etiquetas
- [x] Visualizar tarefas da etiqueta
- [x] Atualizar etiqueta
- [x] Mesclar etiquetas
- [x] Excluir etiqueta

### UI/UX
- [x] Design moderno (2026)
- [x] Dark mode
- [x] Responsivo
- [x] Animações suaves
- [x] Toast notifications
- [x] Loading states
- [x] Error handling
- [x] Empty states

### DevOps
- [x] Docker Compose (PostgreSQL, Redis)
- [x] Scripts de inicialização (`start-dev.sh`)
- [x] Performance metrics (build time)
- [x] Swagger documentation
- [x] Health check endpoint
- [x] Seed de dados demo

---

## 🚀 Roadmap - Próximos Passos

### 🔴 Crítico (P1)

#### Segurança
- [ ] **Resolver vulnerabilidades de dependências**
  - Executar `npm audit fix`
  - Atualizar pacotes críticos
  - Revisar dependências obsoletas

- [ ] **Implementar CSRF protection**
  - Tokens CSRF em formulários
  - Validação no backend

- [ ] **Rate limiting por usuário**
  - Atualmente só por IP
  - Adicionar limite por `userId`

- [ ] **Sanitização de inputs**
  - XSS protection
  - SQL injection (Prisma já ajuda)
  - Validar uploads (se houver)

#### Autenticação
- [ ] **Refresh tokens**
  - Separar access token (15min) e refresh token (7 dias)
  - Endpoint `/auth/refresh`

- [ ] **Logout no backend**
  - Blacklist de tokens (Redis)
  - Invalidar sessões

- [ ] **2FA (Two-Factor Authentication)**
  - TOTP (Google Authenticator)
  - Backup codes

### 🟠 Alta Prioridade (P2)

#### Funcionalidades de Tasks
- [ ] **Edição inline de tarefas**
  - Editar título diretamente na lista
  - Editar descrição, data, prioridade

- [ ] **Drag & drop para reordenar**
  - Ordenação manual de tarefas
  - Mover entre projetos

- [ ] **Subtarefas**
  - Hierarquia de tarefas
  - Progresso de subtarefas

- [ ] **Recorrência**
  - Tarefas diárias, semanais, mensais
  - Cron-like patterns

- [ ] **Comentários em tarefas**
  - Histórico de atividades
  - Mentions (@user)

#### Notificações
- [ ] **Sistema de notificações in-app**
  - Tarefas vencidas
  - Tarefas próximas (1h antes)
  - Atividades de colaboradores

- [ ] **Push notifications (Web Push)**
  - Service Worker
  - Permissões do navegador

- [ ] **Email notifications**
  - Resumo diário de tarefas
  - Alertas de vencimento
  - Digest semanal

#### Email
- [ ] **Configurar serviço de email**
  - SendGrid / Resend / Mailgun
  - Templates transacionais

- [ ] **Emails de boas-vindas**
  - Após signup
  - Guia de primeiros passos

- [ ] **Reset de senha**
  - Email com link de reset
  - Token temporário

- [ ] **Confirmação de email**
  - Verificação obrigatória
  - Reenvio de confirmação

### 🟡 Média Prioridade (P3)

#### Configurações de Usuário
- [ ] **Preferências de conta**
  - Idioma (i18n)
  - Timezone
  - Formato de data/hora

- [ ] **Preferências de notificações**
  - Ativar/desativar por tipo
  - Horários de silêncio
  - Canais (email, push)

- [ ] **Tema personalizado**
  - Escolher cores primárias
  - Fonte preferida
  - Densidade da interface

- [ ] **Privacidade**
  - Exportar dados (LGPD/GDPR)
  - Excluir conta
  - Histórico de acessos

#### Colaboração (Futuro)
- [ ] **Compartilhar projetos**
  - Convidar usuários
  - Permissões (viewer, editor, admin)

- [ ] **Atribuir tarefas**
  - Responsável pela tarefa
  - Múltiplos assignees

- [ ] **Atividades/Feed**
  - Timeline de mudanças
  - Quem fez o quê

#### Integrações
- [ ] **Calendário (Google, Outlook)**
  - Sincronizar tarefas com data
  - Visualização em calendário

- [ ] **Importar/Exportar**
  - CSV, JSON
  - Todoist import

- [ ] **Webhooks**
  - Notificar sistemas externos
  - Automações (Zapier-like)

### 🟢 Baixa Prioridade (P4)

#### Analytics
- [ ] **Dashboard de produtividade**
  - Tarefas completadas por dia/semana/mês
  - Tempo médio de conclusão
  - Projetos mais ativos

- [ ] **Relatórios**
  - Exportar PDF
  - Gráficos de tendências

#### Gamificação
- [ ] **Streaks**
  - Dias consecutivos completando tarefas
  - Recompensas visuais

- [ ] **Badges/Conquistas**
  - Marcos de produtividade

#### Mobile
- [ ] **Progressive Web App (PWA)**
  - Instalável
  - Offline-first
  - App-like

- [ ] **App nativo (React Native?)**
  - iOS e Android
  - Notificações nativas

---

## 📊 Regras de Negócio

### Modelo de Precificação (Futuro)

#### Plano Free
- ✅ Até 50 tarefas ativas
- ✅ 3 projetos
- ✅ 5 etiquetas
- ❌ Sem colaboradores
- ❌ Sem notificações por email
- ❌ Sem integrações

#### Plano Pro ($5/mês)
- ✅ Tarefas ilimitadas
- ✅ Projetos ilimitados
- ✅ Etiquetas ilimitadas
- ✅ Até 5 colaboradores
- ✅ Notificações por email
- ✅ Integrações básicas
- ✅ Suporte prioritário

#### Plano Business ($15/mês)
- ✅ Tudo do Pro
- ✅ Colaboradores ilimitados
- ✅ Integrações avançadas
- ✅ SSO (Single Sign-On)
- ✅ API custom
- ✅ SLA de uptime

### Limites Técnicos (MVP)

| Recurso | Limite |
|---------|--------|
| Tarefas por usuário | Ilimitado |
| Projetos por usuário | Ilimitado |
| Etiquetas por usuário | Ilimitado |
| Etiquetas por tarefa | 10 |
| Tamanho do título | 500 caracteres |
| Tamanho da descrição | 5000 caracteres |
| Upload de arquivos | ❌ Não implementado |

### Políticas

#### Retenção de Dados
- Tarefas completadas: **Permanente**
- Tarefas deletadas: **Soft delete** (30 dias para recuperação)
- Conta deletada: **Hard delete** após 30 dias

#### Backup
- ❌ **Não implementado**
- **TODO**: Backup diário automático (PostgreSQL dump)

#### Privacidade
- Dados não são compartilhados com terceiros
- Email usado apenas para notificações (opt-in)
- Conformidade com LGPD/GDPR (exportar/deletar dados)

---

## 🔄 DevOps e CI/CD

### Ambiente Atual

#### Desenvolvimento
```bash
# Local
./start-dev.sh

# Docker Compose
docker-compose up -d postgres redis
```

#### Produção
- ❌ **Não configurado**

### CI/CD Pipeline (TODO)

#### GitHub Actions

**1. Testes (`test.yml`)**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    - Lint (ESLint)
    - Type check (TypeScript)
    - Unit tests (Vitest)
    - Integration tests
    - E2E tests (Playwright)
```

**2. Build (`build.yml`)**
```yaml
name: Build
on: [push]
jobs:
  build:
    - Build API
    - Build Web
    - Medir performance
    - Upload artifacts
```

**3. Deploy (`deploy.yml`)**
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    - Build Docker images
    - Push to registry
    - Deploy to Vercel (frontend)
    - Deploy to Railway (backend)
    - Run migrations
    - Health check
```

### Infraestrutura (Sugestões)

#### Opção 1: Serverless
- **Frontend**: Vercel / Netlify
- **Backend**: Railway / Render
- **Database**: Neon / Supabase (PostgreSQL)
- **Cache**: Upstash (Redis)

#### Opção 2: VPS
- **Provider**: DigitalOcean / Hetzner
- **Container**: Docker Compose
- **Reverse Proxy**: Nginx / Caddy
- **SSL**: Let's Encrypt

#### Opção 3: Kubernetes (Futuro)
- **Cluster**: GKE / EKS / AKS
- **Helm Charts**
- **Auto-scaling**
- **Multi-region**

### Monitoramento (TODO)

- [ ] **Logs centralizados**
  - Winston / Pino
  - Loki / ELK Stack

- [ ] **Métricas**
  - Prometheus + Grafana
  - Uptime monitoring

- [ ] **Error tracking**
  - Sentry
  - Alertas no Slack/Discord

- [ ] **Performance**
  - New Relic / DataDog
  - Core Web Vitals

---

## 📝 Notas de Desenvolvimento

### Performance Build
- **Última medição**: 7.82s (2026-03-16)
- **Meta**: < 10s

### Débitos Técnicos

1. **TypeScript**
   - `@ts-expect-error` em `auth.ts` (linha 50)
   - Resolver quando @types/jsonwebtoken atualizar

2. **Validações**
   - String vazia → undefined (workaround)
   - Melhorar com schema refinement

3. **State Management**
   - Considerar React Query para cache de API
   - Otimizar re-renders

4. **Acessibilidade**
   - Adicionar testes de acessibilidade
   - ARIA labels completos
   - Keyboard navigation

### Convenções

#### Commits (Conventional Commits)
```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
refactor: refatora código
test: adiciona testes
chore: tarefas de manutenção
perf: melhora performance
```

#### Branches
```
main              # Produção
develop           # Desenvolvimento
feature/xxx       # Nova feature
fix/xxx           # Bug fix
hotfix/xxx        # Correção urgente
```

---

## 🎯 Próximos Passos Imediatos

### Sprint 1 (1-2 semanas)
1. ✅ ~~Resolver erros de TypeScript~~
2. 🔲 Implementar edição inline de tarefas
3. 🔲 Adicionar sistema de notificações in-app
4. 🔲 Configurar CI/CD básico (GitHub Actions)
5. 🔲 Resolver vulnerabilidades críticas

### Sprint 2 (2-3 semanas)
1. 🔲 Implementar refresh tokens
2. 🔲 Adicionar email notifications
3. 🔲 Criar página de configurações
4. 🔲 Deploy em produção (Vercel + Railway)
5. 🔲 Documentar API completa

### Sprint 3 (3-4 semanas)
1. 🔲 Implementar subtarefas
2. 🔲 Adicionar drag & drop
3. 🔲 Criar dashboard de analytics
4. 🔲 Testes E2E (Playwright)
5. 🔲 Beta testing com usuários reais

---

## 📚 Recursos e Referências

### Documentação
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Inspiração
- [Todoist](https://todoist.com)
- [Linear](https://linear.app)
- [Height](https://height.app)

### Comunidade
- GitHub Issues
- Discord (criar?)
- Twitter/X (@taskflow?)

---

**Última atualização:** 2026-03-16  
**Versão:** 0.1.0  
**Mantenedor:** [@vitorfelipep](https://github.com/vitorfelipep)
