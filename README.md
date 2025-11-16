# AI ESTICOU - LuaLabs

Sistema interno para designers e clientes. Catálogo de artes com geração de variações via IA (OpenAI).

## Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **Roteamento**: React Router v6
- **UI**: Tailwind CSS + shadcn/ui (Radix UI)
- **Ícones**: Lucide React
- **Backend** (Planejado): Node.js + MongoDB

## Perfis de Acesso

- **Designer**: Enviar artes e gerenciar criações
- **Cliente**: Visualizar catálogo e solicitar variações
- **Gestor**: Gerenciar clientes, designers e configurações

## Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+ e npm

### Instalação

```bash
# Instalar dependências
npm install

# Rodar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

O projeto estará disponível em `http://localhost:5173`

## Credenciais de Acesso

Para demonstração, use os seguintes acessos rápidos na tela de login:

- **Designer**: `designer@lualabs.com`
- **Cliente**: `cliente@fitness.com`
- **Gestor**: `gestor@lualabs.com`

## Estrutura do Projeto

```
├── src/
│   ├── components/       # Componentes React
│   │   ├── client/       # Componentes do cliente
│   │   ├── designer/     # Componentes do designer
│   │   ├── manager/      # Componentes do gestor
│   │   ├── ui/           # Componentes UI reutilizáveis (shadcn/ui)
│   │   ├── Layout.tsx    # Layout principal
│   │   └── Login.tsx     # Tela de login
│   ├── contexts/         # Contextos React (Auth, Data)
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Ponto de entrada
│   └── index.css         # Estilos globais
├── public/               # Arquivos estáticos
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Status do Projeto

MVP em desenvolvimento pela LuaLabs/SoftHouse.

## Licença

Proprietário - LuaLabs/SoftHouse
