# 🔐 Security Policy

> Políticas de segurança e vulnerabilidades conhecidas do TaskFlow

---

## 📊 Status de Segurança

| Categoria | Status | Nível |
|-----------|--------|-------|
| Vulnerabilidades de Dependências | ⚠️ 32 encontradas | 🔴 CRÍTICO |
| Autenticação | ✅ JWT implementado | 🟢 OK |
| Autorização | ✅ Middleware validando | 🟢 OK |
| Rate Limiting | ⚠️ Apenas por IP | 🟡 ATENÇÃO |
| CSRF Protection | ❌ Não implementado | 🔴 CRÍTICO |
| XSS Protection | ⚠️ Parcial (React) | 🟡 ATENÇÃO |
| SQL Injection | ✅ Prisma ORM | 🟢 OK |
| Senhas | ✅ bcrypt (cost 12) | 🟢 OK |
| HTTPS | ❌ Apenas em produção | 🟡 ATENÇÃO |
| Headers de Segurança | ✅ Helmet configurado | 🟢 OK |

---

## 🚨 Vulnerabilidades Conhecidas

### Dependências (GitHub Dependabot)

**Total:** 32 vulnerabilidades  
**Última verificação:** 2026-03-16

| Severidade | Quantidade |
|------------|------------|
| 🔴 Crítica | 2 |
| 🟠 Alta | 14 |
| 🟡 Moderada | 12 |
| 🟢 Baixa | 4 |

#### Ação Necessária
```bash
# Executar auditoria
npm audit

# Tentar correção automática
npm audit fix

# Forçar correção (pode quebrar)
npm audit fix --force

# Revisar manualmente
npm audit --json > audit-report.json
```

### Problemas Identificados

#### 1. CSRF (Cross-Site Request Forgery) - 🔴 CRÍTICO
**Status:** Não implementado  
**Risco:** Requisições forjadas de sites maliciosos  
**Impacto:** Alto - Ações não autorizadas

**Solução:**
```typescript
// Implementar tokens CSRF
import csrf from 'csurf';
app.use(csrf({ cookie: true }));

// Incluir em formulários
<input type="hidden" name="_csrf" value={csrfToken} />
```

#### 2. Rate Limiting - 🟡 ATENÇÃO
**Status:** Implementado apenas por IP  
**Risco:** Bypass usando VPNs/proxies  
**Impacto:** Médio - Ataques de força bruta

**Atual:**
```typescript
// Apenas por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

**Solução:**
```typescript
// Adicionar rate limit por usuário
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  keyGenerator: (req) => req.user?.userId || req.ip
});
```

#### 3. Refresh Tokens - 🟡 ATENÇÃO
**Status:** Não implementado  
**Risco:** Tokens de longa duração comprometidos  
**Impacto:** Médio - Acesso não autorizado

**Atual:**
- Access token válido por 7 dias
- Sem mecanismo de revogação

**Solução:**
- Access token: 15 minutos
- Refresh token: 7 dias
- Blacklist de tokens (Redis)

#### 4. XSS (Cross-Site Scripting) - 🟡 ATENÇÃO
**Status:** Proteção parcial (React auto-escaping)  
**Risco:** Injeção de scripts em inputs  
**Impacto:** Médio - Roubo de sessão

**Pontos de atenção:**
- Descrições de tarefas (rich text no futuro?)
- Nomes de projetos/etiquetas
- HTML em emails

**Solução:**
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitizar antes de salvar
const cleanDescription = DOMPurify.sanitize(description);
```

#### 5. Injeção de SQL - ✅ PROTEGIDO
**Status:** Prisma ORM previne  
**Risco:** Baixo (Prisma usa prepared statements)

**Boas práticas mantidas:**
```typescript
// ✅ SEGURO - Prisma parametriza
await prisma.task.findMany({
  where: { title: { contains: searchQuery } }
});

// ❌ INSEGURO - Evitar raw queries
await prisma.$queryRaw(`SELECT * FROM tasks WHERE title = '${searchQuery}'`);
```

---

## 🛡️ Medidas de Segurança Implementadas

### 1. Autenticação JWT

**Configuração:**
```typescript
JWT_SECRET: string (256+ bits)
JWT_EXPIRES_IN: "7d"
Algorithm: HS256
```

**Fluxo:**
1. Login → Valida credenciais
2. Gera JWT com payload `{ userId, email }`
3. Cliente armazena em localStorage
4. Toda request inclui `Authorization: Bearer {token}`
5. Middleware valida assinatura e expiração

**Limitações:**
- ❌ Sem refresh tokens
- ❌ Sem blacklist (logout não invalida token)
- ❌ Token válido por 7 dias (muito longo)

### 2. Senhas

**Hash:** bcrypt (cost factor 12)

```typescript
// Signup
const hashedPassword = await hash(password, 12);

// Login
const isValid = await compare(password, user.password);
```

**Validação:**
- Mínimo 8 caracteres
- Pelo menos 1 maiúscula
- Pelo menos 1 minúscula
- Pelo menos 1 número

**Melhorias futuras:**
- [ ] Verificar senhas comprometidas (Have I Been Pwned API)
- [ ] Forçar troca a cada 90 dias
- [ ] Histórico de senhas (impedir reutilização)

### 3. Headers de Segurança (Helmet)

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));
```

**Headers aplicados:**
- `X-Frame-Options: DENY` (previne clickjacking)
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` (HTTPS only)
- `X-XSS-Protection: 1; mode=block`

### 4. CORS

```typescript
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL,
  credentials: true
}));
```

**Restrições:**
- Apenas origem configurada
- Credentials permitidos
- Métodos: GET, POST, PATCH, DELETE

### 5. Rate Limiting

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por janela
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests' } }
});

app.use('/api', limiter);
```

**Limitações atuais:**
- Apenas por IP (fácil bypass)
- Limite global (deveria ser por endpoint)
- Sem diferenciação autenticado/anônimo

### 6. Validação de Inputs (Zod)

```typescript
const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  // ...
});
```

**Benefícios:**
- Type-safe
- Runtime validation
- Mensagens de erro customizadas
- Previne dados inválidos no banco

---

## 🔒 Boas Práticas

### Para Desenvolvedores

#### 1. Variáveis de Ambiente
```bash
# ❌ NUNCA commitar
.env
.env.local

# ✅ Usar variáveis para segredos
JWT_SECRET=random-256-bit-secret
DATABASE_URL=postgresql://...
```

#### 2. Senhas e Tokens
```typescript
// ❌ NUNCA fazer log de senhas
console.log('Login attempt:', email, password); // ERRADO!

// ✅ Sanitizar logs
console.log('Login attempt:', email, '[REDACTED]');
```

#### 3. Queries de Banco
```typescript
// ✅ Sempre usar Prisma/ORM
await prisma.user.findUnique({ where: { email } });

// ❌ Evitar raw SQL com inputs do usuário
await prisma.$queryRaw(`SELECT * FROM users WHERE email = '${email}'`);
```

#### 4. Autorização
```typescript
// ✅ Sempre verificar ownership
const task = await prisma.task.findFirst({
  where: { id, userId: req.user!.userId }
});

if (!task) throw new AppError(404, 'TASK_NOT_FOUND');
```

### Para Usuários

#### 1. Senhas Fortes
- Mínimo 12 caracteres (recomendado)
- Combinação de letras, números, símbolos
- Usar gerenciador de senhas (1Password, Bitwarden)
- Nunca reutilizar senhas

#### 2. Autenticação
- Ativar 2FA quando disponível (futuro)
- Fazer logout em dispositivos compartilhados
- Revisar sessões ativas (futuro)

#### 3. Phishing
- Verificar URL antes de fazer login
- Nunca compartilhar senha/token
- Email oficial: `@taskflow.app`

---

## 🚀 Roadmap de Segurança

### Curto Prazo (1-2 semanas)
- [ ] Resolver vulnerabilidades críticas de dependências
- [ ] Implementar CSRF protection
- [ ] Rate limiting por usuário
- [ ] Refresh tokens

### Médio Prazo (1-2 meses)
- [ ] Auditoria de segurança completa
- [ ] Testes de penetração
- [ ] 2FA (TOTP)
- [ ] Logs de auditoria
- [ ] Blacklist de tokens (logout real)

### Longo Prazo (3-6 meses)
- [ ] Certificação SOC 2 Type II
- [ ] Bug bounty program
- [ ] WAF (Web Application Firewall)
- [ ] DDoS protection (Cloudflare)
- [ ] Backup criptografado

---

## 📞 Reportar Vulnerabilidades

### Divulgação Responsável

Se você encontrou uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública
2. Envie email para: **security@taskflow.app** (fictício)
3. Inclua:
   - Descrição detalhada
   - Steps to reproduce
   - Impacto potencial
   - Sugestão de correção (se tiver)

### Tempo de Resposta

| Severidade | Resposta Inicial | Correção |
|------------|------------------|----------|
| 🔴 Crítica | 24 horas | 7 dias |
| 🟠 Alta | 48 horas | 14 dias |
| 🟡 Média | 5 dias | 30 dias |
| 🟢 Baixa | 7 dias | 60 dias |

### Recompensas (Futuro)

Planejamos lançar um programa de bug bounty:
- 🔴 Crítica: $500 - $2000
- 🟠 Alta: $100 - $500
- 🟡 Média: $50 - $100
- 🟢 Baixa: Reconhecimento público

---

## 📚 Recursos

### Leitura Recomendada
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Ferramentas
- `npm audit` - Verificar vulnerabilidades
- [Snyk](https://snyk.io/) - Security scanning
- [Dependabot](https://github.com/dependabot) - Auto updates
- [OWASP ZAP](https://www.zaproxy.org/) - Pen testing

---

**Última atualização:** 2026-03-16  
**Próxima revisão:** 2026-04-01  
**Responsável:** Security Team
