# 🚀 Lua Crescente Backend - Sistema Completo

Sistema de catálogo de artes com geração inteligente via IA.

## ✨ Funcionalidades

### Autenticação (Parte 1)

- ✅ Login/Registro com JWT
- ✅ 3 tipos de usuário: Designer, Cliente, Manager
- ✅ Middleware de proteção e autorização

### Gestão (Parte 2)

- ✅ CRUD de Clientes
- ✅ CRUD de Designers
- ✅ Relacionamentos e estatísticas

### Artes (Parte 3)

- ✅ Upload de imagens (Cloudinary)
- ✅ CRUD de Artes
- ✅ Categorização e tags
- ✅ Filtros avançados

### IA (Parte 4)

- ✅ Geração de variações com DALL-E 3
- ✅ Prompts otimizados
- ✅ Limite mensal de uso
- ✅ Rate limiting
- ✅ Sistema de feedback

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Popular banco de dados
npm run seed

# Iniciar servidor
npm run dev
```

## 🔧 Configuração

### MongoDB

```bash
# Instale MongoDB ou use MongoDB Atlas (cloud)
# Configure a URL no .env:
MONGODB_URI=mongodb://localhost:27017/lualabs
```

### Cloudinary

```bash
# Crie conta gratuita: https://cloudinary.com
# Adicione credenciais no .env:
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

### OpenAI

```bash
# Obtenha chave: https://platform.openai.com/api-keys
# Adicione no .env:
OPENAI_API_KEY=sk-proj-sua_chave
OPENAI_MODEL=dall-e-3
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_QUALITY=standard
```

## 📡 Endpoints Principais

### Auth

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado
- `POST /api/auth/logout` - Logout

### Clients

- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente
- `GET /api/clients/stats/overview` - Estatísticas

### Designers

- `GET /api/designers` - Listar designers
- `POST /api/designers` - Criar designer
- `POST /api/designers/:id/assign-client` - Atribuir cliente
- `DELETE /api/designers/:id/unassign-client/:clientId` - Remover cliente

### Arts

- `GET /api/arts` - Listar artes (com filtros)
- `POST /api/arts` - Criar arte (multipart/form-data)
- `PUT /api/arts/:id` - Atualizar arte
- `GET /api/arts/:id/download` - Download de arte
- `GET /api/arts/meta/categories` - Categorias disponíveis
- `GET /api/arts/meta/popular-tags` - Tags mais usadas

### Variations (IA)

- `POST /api/variations/generate` - Gerar variação com IA
- `GET /api/variations/:id/status` - Status de geração
- `GET /api/variations` - Listar variações
- `GET /api/variations/:id` - Ver variação
- `POST /api/variations/:id/approve` - Aprovar variação
- `POST /api/variations/:id/feedback` - Adicionar feedback
- `GET /api/variations/usage/current` - Uso atual do cliente
- `GET /api/variations/stats/overview` - Estatísticas (manager)

### Utilitários

- `GET /api/health` - Status da API
- `GET /api/openai/test` - Testar conexão OpenAI

## 📊 Estrutura do Banco

```
Users (autenticação)
  ↓
Clients ← Arts → Designers
             ↓
         Variations (IA)
```

## 🧪 Testando

### 1. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@fitness.com","password":"demo123"}'
```

### 2. Gerar variação com IA

```bash
# Use o token retornado no login
TOKEN="seu_token_aqui"

curl -X POST http://localhost:5000/api/variations/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "artId": "ID_DA_ARTE",
    "newProduct": "Top Fitness",
    "newPrice": "R$ 79,90",
    "newText": "Super Promoção",
    "quality": "standard"
  }'
```

### 3. Verificar status de geração

```bash
curl -X GET http://localhost:5000/api/variations/ID_DA_VARIACAO/status \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Ver uso atual

```bash
curl -X GET http://localhost:5000/api/variations/usage/current \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Testar conexão OpenAI

```bash
curl http://localhost:5000/api/openai/test
```

## 🚀 Deploy

### Heroku

```bash
heroku create lualabs-api
heroku config:set MONGODB_URI=sua_uri
heroku config:set CLOUDINARY_CLOUD_NAME=seu_cloud_name
heroku config:set CLOUDINARY_API_KEY=sua_api_key
heroku config:set CLOUDINARY_API_SECRET=seu_api_secret
heroku config:set OPENAI_API_KEY=sua_chave
git push heroku main
```

### Railway / Render

- Configure variáveis de ambiente
- Conecte repositório Git
- Deploy automático

## 🔒 Segurança

- ✅ JWT para autenticação
- ✅ Rate limiting (100 req/15min geral, 10 req/hora para IA)
- ✅ Validação de permissões por role
- ✅ Limite mensal de uso de IA por cliente
- ✅ Sanitização de inputs
- ✅ Tratamento de erros

## 📝 Licença

MIT

## 👥 Credenciais de Demo

```
Designer: designer@lualabs.com / demo123
Cliente:  cliente@fitness.com / demo123
Gestor:   gestor@lualabs.com / demo123
```

## 🎯 Próximos Passos

- [ ] Webhooks para notificações
- [ ] Sistema de fila (Bull/Redis) para processamento assíncrono
- [ ] Cache com Redis
- [ ] Logs estruturados (Winston)
- [ ] Testes automatizados (Jest)
- [ ] Documentação Swagger/OpenAPI

---

**🎉 BACKEND COMPLETO!**

Agora você tem:

- ✅ Autenticação JWT
- ✅ Gestão de Clientes e Designers
- ✅ Upload de Artes (Cloudinary)
- ✅ Geração de Variações com IA (OpenAI)
- ✅ Rate Limiting e Limites de Uso
- ✅ Sistema completo e pronto para produção
