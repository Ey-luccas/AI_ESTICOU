# 🚀 LuaLabs - Sistema de Catálogo de Artes com IA

Sistema completo de gestão de artes e geração de variações inteligentes via IA.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- MongoDB rodando (local ou Atlas)
- (Opcional) Contas Cloudinary e OpenAI para funcionalidades completas

## 🚀 Início Rápido

### 1. Instalar dependências

```bash
# Instalar dependências do front-end
npm install

# Instalar dependências do back-end
cd backend
npm install
cd ..
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo do back-end
cp backend/.env.example backend/.env

# Editar backend/.env com suas configurações:
# - MONGODB_URI (obrigatório)
# - JWT_SECRET (obrigatório)
# - CLOUDINARY_* (opcional - para upload de imagens)
# - OPENAI_API_KEY (opcional - para geração de variações)
```

### 3. Popular banco de dados (opcional)

```bash
cd backend
npm run seed
cd ..
```

### 4. Rodar projeto completo

```bash
# Rodar front-end e back-end simultaneamente
npm run dev:all
```

Isso iniciará:

- **Front-end**: http://localhost:5173
- **Back-end**: http://localhost:5000

## 📜 Scripts Disponíveis

### No diretório raiz:

- `npm run dev` - Roda apenas o front-end
- `npm run dev:frontend` - Roda apenas o front-end
- `npm run dev:backend` - Roda apenas o back-end
- `npm run dev:all` - Roda front-end e back-end simultaneamente ⭐
- `npm run build` - Build de produção do front-end

### No diretório backend:

- `npm run dev` - Roda o servidor em modo desenvolvimento
- `npm run start` - Roda o servidor em modo produção
- `npm run seed` - Popula o banco com dados de exemplo

## 🔧 Configuração Mínima

Para rodar o projeto sem OpenAI e Cloudinary, você só precisa:

```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/lualabs
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

O servidor iniciará normalmente, mas:

- ⚠️ Upload de imagens retornará erro (precisa Cloudinary)
- ⚠️ Geração de variações retornará erro (precisa OpenAI)

## 📡 Endpoints Principais

### Back-end (http://localhost:5000)

- `GET /api/health` - Status da API
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário
- `GET /api/clients` - Listar clientes
- `GET /api/arts` - Listar artes
- `POST /api/variations/generate` - Gerar variação com IA

### Front-end (http://localhost:5173)

Interface completa do sistema.

## 👥 Credenciais de Demo

Após rodar `npm run seed` no backend:

```
Designer: designer@lualabs.com / demo123
Cliente:  cliente@fitness.com / demo123
Gestor:   gestor@lualabs.com / demo123
```

## 🛠️ Estrutura do Projeto

```
AI_ESTICOU/
├── src/              # Front-end (React + TypeScript)
├── backend/          # Back-end (Node.js + Express)
│   ├── src/
│   │   ├── config/   # Configurações (DB, Cloudinary)
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/  # OpenAI, prompts
│   │   └── middleware/
│   └── .env          # Variáveis de ambiente
└── package.json      # Scripts para rodar tudo junto
```

## 📝 Notas

- O MongoDB precisa estar rodando antes de iniciar o back-end
- Sem Cloudinary/OpenAI, o sistema funciona parcialmente (autenticação, CRUD básico)
- Use `npm run dev:all` para desenvolvimento completo
- Logs aparecem coloridos no terminal (cyan=frontend, yellow=backend)

## 🐛 Troubleshooting

### MongoDB não conecta

```bash
# Verificar se MongoDB está rodando
mongosh
# ou
mongo
```

### Porta já em uso

```bash
# Alterar porta no backend/.env
PORT=5001
```

### Erro de permissão

```bash
# Dar permissão de execução (Linux/Mac)
chmod +x node_modules/.bin/*
```

---

**Desenvolvido com ❤️ pela LuaLabs**
