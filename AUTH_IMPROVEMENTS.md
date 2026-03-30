# Melhorias no Sistema de Autenticação

## 🔒 Problema Identificado

O usuário ficava "preso" na aplicação quando o token JWT expirava, pois:
1. O `apiClient` retornava erro 401, mas não fazia logout automático
2. O token expirado permanecia no localStorage
3. Não havia redirecionamento automático para a página de login
4. Nenhuma notificação visual era exibida ao usuário

## ✅ Soluções Implementadas

### 1. **Detecção Automática de Token Expirado**

**Arquivo:** `apps/web/src/lib/api.ts`

- Adicionada função `handleAuthError()` que:
  - Detecta erros de autenticação (401)
  - Identifica códigos específicos: `TOKEN_EXPIRED`, `INVALID_TOKEN`, `UNAUTHORIZED`
  - Limpa o localStorage automaticamente
  - Dispara evento customizado para notificação
  - Redireciona para `/login?expired=true`

```typescript
function handleAuthError(errorCode?: string, errorMessage?: string) {
  if (errorCode === 'INVALID_TOKEN' || errorCode === 'TOKEN_EXPIRED' || errorCode === 'UNAUTHORIZED') {
    localStorage.removeItem('taskflow-auth');
    
    const event = new CustomEvent('auth:session-expired', {
      detail: { message: errorMessage || 'Sessão expirada. Faça login novamente.' }
    });
    window.dispatchEvent(event);
    
    setTimeout(() => {
      window.location.href = '/login?expired=true';
    }, 100);
  }
}
```

### 2. **Melhor Diferenciação de Erros no Backend**

**Arquivo:** `apps/api/src/middlewares/auth.ts`

- Mensagens de erro mais descritivas
- Validação adicional para tokens vazios
- Diferenciação clara entre:
  - `TOKEN_EXPIRED`: Token válido mas expirado
  - `INVALID_TOKEN`: Token malformado ou inválido
  - `UNAUTHORIZED`: Token não fornecido

```typescript
if (error instanceof jwt.TokenExpiredError) {
  next(new AppError(401, 'TOKEN_EXPIRED', 'Token expirado. Por favor, faça login novamente.'));
} else if (error instanceof jwt.JsonWebTokenError) {
  next(new AppError(401, 'INVALID_TOKEN', 'Token inválido. Por favor, faça login novamente.'));
}
```

### 3. **Sistema de Notificações**

**Arquivo:** `apps/web/src/components/providers/auth-error-listener.tsx`

- Componente que escuta eventos de `auth:session-expired`
- Exibe toast notification com mensagem de erro
- Integrado ao sistema de toast existente (shadcn/ui)

```typescript
useEffect(() => {
  const handleSessionExpired = (event: Event) => {
    const customEvent = event as CustomEvent<{ message: string }>;
    toast({
      variant: 'destructive',
      title: 'Sessão Expirada',
      description: customEvent.detail.message,
    });
  };

  window.addEventListener('auth:session-expired', handleSessionExpired);
  return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
}, [toast]);
```

### 4. **Feedback Visual na Página de Login**

**Arquivo:** `apps/web/src/app/auth/login/page.tsx`

- Detecta parâmetro `?expired=true` na URL
- Exibe toast automático informando sobre a sessão expirada
- Melhora a experiência do usuário ao ser redirecionado

```typescript
useEffect(() => {
  if (searchParams.get('expired') === 'true') {
    toast({
      variant: 'destructive',
      title: 'Sessão Expirada',
      description: 'Sua sessão expirou. Por favor, faça login novamente.',
    });
  }
}, [searchParams]);
```

## 🔄 Fluxo de Autenticação (Novo)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário faz requisição com token expirado                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend retorna 401 + TOKEN_EXPIRED                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. apiClient detecta erro 401 → handleAuthError()           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. localStorage limpo (token removido)                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Evento 'auth:session-expired' disparado                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. AuthErrorListener mostra toast de notificação           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Redirecionamento para /login?expired=true               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. LoginPage detecta ?expired=true → mostra toast          │
└─────────────────────────────────────────────────────────────┘
```

## 🧪 Como Testar

### 1. **Testar Token Expirado**

```bash
# No navegador (DevTools Console):
# 1. Fazer login normalmente
# 2. Copiar o token do localStorage
localStorage.getItem('taskflow-auth')

# 3. No backend, alterar temporariamente JWT_EXPIRES_IN para 10s
# apps/api/.env
JWT_EXPIRES_IN="10s"

# 4. Reiniciar o backend
# 5. Aguardar 10 segundos
# 6. Tentar criar uma tarefa
# 7. Verificar se:
#    - Toast de erro aparece
#    - Redirecionamento para /login ocorre
#    - localStorage foi limpo
```

### 2. **Testar Token Inválido**

```javascript
// No DevTools Console:
// Modificar o token manualmente
const auth = JSON.parse(localStorage.getItem('taskflow-auth'));
auth.state.token = 'token-invalido';
localStorage.setItem('taskflow-auth', JSON.stringify(auth));

// Tentar criar uma tarefa
// Deve exibir erro e redirecionar
```

### 3. **Testar Sem Token**

```javascript
// No DevTools Console:
localStorage.removeItem('taskflow-auth');
// Recarregar a página
// Deve redirecionar para /login
```

## 📊 Benefícios

| Antes | Depois |
|-------|--------|
| ❌ Usuário preso com token expirado | ✅ Logout automático |
| ❌ Sem feedback visual | ✅ Toast notification |
| ❌ Token no localStorage | ✅ localStorage limpo |
| ❌ Erro genérico 401 | ✅ Mensagens específicas |
| ❌ Sem redirecionamento | ✅ Redirecionamento automático |

## 🔐 Segurança

- Token expirado/inválido é removido imediatamente
- Não há possibilidade de fazer requisições com token inválido
- Mensagens de erro não expõem informações sensíveis
- Redirecionamento automático previne acesso não autorizado

## 🚀 Próximos Passos (Opcionais)

1. **Refresh Tokens**
   - Implementar sistema de refresh tokens
   - Access token: 15 minutos
   - Refresh token: 7 dias
   - Renovação automática antes da expiração

2. **Logout no Backend**
   - Blacklist de tokens (Redis)
   - Invalidar sessões ativas

3. **2FA (Two-Factor Authentication)**
   - TOTP (Google Authenticator)
   - Backup codes

## 📝 Arquivos Modificados

1. `apps/web/src/lib/api.ts` - Cliente HTTP com detecção de erros
2. `apps/api/src/middlewares/auth.ts` - Middleware com mensagens melhoradas
3. `apps/web/src/components/providers/auth-error-listener.tsx` - Novo componente
4. `apps/web/src/app/layout.tsx` - Integração do AuthErrorListener
5. `apps/web/src/app/auth/login/page.tsx` - Feedback visual na tela de login

---

**Data:** 2026-03-30  
**Versão:** 0.1.1  
**Autor:** TaskFlow Team
