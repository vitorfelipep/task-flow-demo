# TaskFlow 🚀

Sistema moderno de gerenciamento de tarefas inspirado no [Todoist](https://todoist.com). Construído com Next.js 14, Express, TypeScript e PostgreSQL.

![TaskFlow](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)

## ✨ Features

- ✅ Autenticação JWT (signup/login)
- ✅ CRUD completo de tarefas
- ✅ Prioridades (P1, P2, P3, P4)
- ✅ Agendamento com data e hora
- ✅ Projetos personalizados
- ✅ Etiquetas/Labels coloridas
- ✅ Filtros (Hoje, Próximos, Inbox, Concluídas)
- ✅ Busca full-text
- ✅ Dark mode
- ✅ Design responsivo
- ✅ API documentada com Swagger

## 🛠 Tech Stack

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, shadcn/ui, Zustand |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | JWT (JSON Web Tokens) |
| **Docs** | Swagger / OpenAPI 3.0 |
| **Infra** | Docker, Docker Compose |

## 📁 Estrutura do Projeto

```
task-flow-demo/
├── apps/
│   ├── api/                 # 🔧 Express Backend
│   │   ├── src/
│   │   │   ├── config/      # Swagger config
│   │   │   ├── controllers/ # Business logic
│   │   │   ├── middlewares/ # Auth, errors
│   │   │   └── routes/      # API endpoints
│   │   └── package.json
│   │
│   └── web/                 # 🌐 Next.js Frontend
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   ├── components/  # React components
│       │   ├── hooks/       # Custom hooks
│       │   ├── lib/         # API client
│       │   └── stores/      # Zustand stores
│       └── package.json
│
├── packages/
│   ├── config/              # 📦 ESLint & TypeScript configs
│   ├── database/            # 🗄️ Prisma schema & seeds
│   ├── shared/              # 🔗 Types & Zod validations
│   └── ui/                  # 🎨 shadcn/ui components
│
├── scripts/
│   └── measure-perf.mjs     # 📊 Performance metrics
│
├── docker-compose.yml       # 🐳 Docker services
├── start-dev.sh             # 🚀 Dev startup script
├── start-api.sh             # 🔧 API only script
└── README.md
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- npm 10+

### 1. Clone o repositório

```bash
git clone https://github.com/vitorfelipep/task-flow-demo.git
cd task-flow-demo
```

### 2. Instale as dependências

```bash
npm install --prefix .
```

### 3. Suba o banco de dados

```bash
docker-compose up -d postgres redis
```

### 4. Configure o ambiente

```bash
cp .env.example .env
```

### 5. Configure o Prisma

```bash
# Gerar o Prisma Client
cd packages/database
npx prisma generate

# Criar as tabelas
npx prisma db push

# Popular com dados de demonstração
npx tsx prisma/seed.ts

cd ../..
```

### 6. Inicie a aplicação

```bash
# Opção 1: Script automático (API + Frontend)
./start-dev.sh

# Opção 2: Apenas a API
./start-api.sh

# Opção 3: Manual em terminais separados
# Terminal 1 - API:
cd apps/api && npx tsx src/index.ts

# Terminal 2 - Frontend:
cd apps/web && npx next dev
```

## 🌐 URLs

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Aplicação web |
| **API** | http://localhost:3001 | Backend REST |
| **Swagger** | http://localhost:3001/docs | Documentação da API |
| **Health** | http://localhost:3001/health | Status da API |

## 🔑 Demo Login

```
Email:    demo@taskflow.app
Senha:    Demo@123
```

## 📚 API Endpoints

### Auth
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/signup` | Criar conta |
| POST | `/api/auth/login` | Fazer login |
| GET | `/api/auth/me` | Perfil do usuário |
| PATCH | `/api/auth/me` | Atualizar perfil |
| POST | `/api/auth/change-password` | Alterar senha |

### Tasks
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/tasks` | Listar tarefas |
| GET | `/api/tasks/today` | Tarefas de hoje |
| GET | `/api/tasks/upcoming` | Próximos 7 dias |
| GET | `/api/tasks/overdue` | Tarefas atrasadas |
| POST | `/api/tasks` | Criar tarefa |
| PATCH | `/api/tasks/:id` | Atualizar tarefa |
| POST | `/api/tasks/:id/toggle` | Alternar status |
| DELETE | `/api/tasks/:id` | Excluir tarefa |

### Projects
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/projects` | Listar projetos |
| GET | `/api/projects/:id` | Detalhes do projeto |
| GET | `/api/projects/:id/stats` | Estatísticas |
| POST | `/api/projects` | Criar projeto |
| PATCH | `/api/projects/:id` | Atualizar projeto |
| DELETE | `/api/projects/:id` | Excluir projeto |

### Labels
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/labels` | Listar etiquetas |
| POST | `/api/labels` | Criar etiqueta |
| PATCH | `/api/labels/:id` | Atualizar etiqueta |
| POST | `/api/labels/:id/merge` | Mesclar etiquetas |
| DELETE | `/api/labels/:id` | Excluir etiqueta |

> 📖 Documentação completa disponível em http://localhost:3001/docs

## 📊 Performance Metrics

Meça o tempo de build e cold-start:

```bash
# Medir tempo de build
npm run build:measure

# Medir tempo de cold-start
npm run start:measure
```

Os resultados são salvos em `perf-metrics.json`.

## 🐳 Docker

### Desenvolvimento
```bash
docker-compose up -d
```

### Serviços disponíveis
- **postgres**: PostgreSQL 16 (porta 5432)
- **redis**: Redis 7 (porta 6379)

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `./start-dev.sh` | Inicia API + Frontend em desenvolvimento |
| `./start-api.sh` | Inicia apenas a API |
| `npm run dev` | Inicia todos os apps (via script) |
| `npm run build` | Build de produção |
| `npm run db:generate` | Gera Prisma Client |
| `npm run db:push` | Sincroniza schema com banco |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run db:seed` | Popula banco com dados demo |

## 🔐 Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskflow?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# API
API_PORT=3001
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 License

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Feito com ❤️ por [Vitor Felipe](https://github.com/vitorfelipep)
