# OPI Frontend - Observatório de Projetos Integradores

Frontend do **OPI - Observatório de Projetos Integradores**, sistema web do SENAC Pernambuco para submissão, acompanhamento, avaliação e divulgação de Projetos Integradores.

Esta pasta contém apenas a interface da aplicação. O backend Django fica em `../opi_backend` e deve estar acessível para que login, painéis, API REST, chat e videochamada funcionem corretamente.

Responsável: Ericha Barbosa

## Visão Geral

O `opifront` é uma SPA desenvolvida com **React 18**, **TypeScript**, **Vite** e **Tailwind CSS v4**. A aplicação se comunica com o backend por API REST usando JWT e com os recursos de chat/videochamada por WebSockets.

Principais telas e módulos:

- Página inicial institucional com apresentação do sistema.
- Login com autenticação JWT.
- Restauração de sessão via `localStorage`.
- Painel do Aluno.
- Painel do Professor.
- Painel do Coordenador.
- Painel da Empresa Parceira.
- Feed social de projetos.
- Portfólio de projetos avaliados.
- Chat por grupo com suporte a arquivos.
- Videochamada WebRTC com sinalização via WebSocket.
- Termos de Uso e Política de Privacidade.

## Tecnologias

| Categoria | Tecnologias |
|---|---|
| Base | React 18, TypeScript, Vite 6 |
| Estilo | Tailwind CSS v4, CSS modular por arquivos, tema SENAC |
| Componentes | shadcn/ui, Radix UI, Lucide React |
| Gráficos e UI auxiliar | Recharts, Sonner, Motion, MUI Icons |
| Comunicação HTTP | `fetch`, API REST, JWT Bearer Token |
| Tempo real | WebSocket nativo do navegador |
| Videochamada | WebRTC nativo |
| Hospedagem | Vercel |

## Estrutura da Pasta

```bash
opifront/
│
├── index.html
├── index.css
├── package.json
├── package-lock.json
├── vite.config.ts
├── vercel.json
├── postcss.config.mjs
├── default_shadcn_theme.css
├── pnpm-workspace.yaml
├── ATTRIBUTIONS.md
│
├── guidelines/
│   └── Guidelines.md
│
└── src/
    ├── main.tsx
    ├── vite-env.d.ts
    │
    ├── app/
    │   ├── App.tsx
    │   ├── api.ts
    │   │
    │   ├── pages/
    │   │   ├── TermosDeUso.tsx
    │   │   └── PoliticaDePrivacidade.tsx
    │   │
    │   └── components/
    │       ├── AlunoPanel.tsx
    │       ├── ProfessorPanel.tsx
    │       ├── CoordenadorPanel.tsx
    │       ├── EmpresaPanel.tsx
    │       ├── SenacLogo.tsx
    │       ├── figma/
    │       │   └── ImageWithFallback.tsx
    │       └── ui/
    │
    ├── styles/
    │   ├── fonts.css
    │   ├── globals.css
    │   ├── index.css
    │   ├── tailwind.css
    │   └── theme.css
    │
    └── imports/
        ├── Levantamento_Requisitos_OPI_v1.pdf
        └── image*.png
```

## Arquivos Principais

| Arquivo | Função |
|---|---|
| `src/main.tsx` | Ponto de entrada da aplicação React. |
| `src/app/App.tsx` | Controla login, restauração de sessão, rotas e seleção do painel por perfil. |
| `src/app/api.ts` | Cliente REST usado pelos painéis para consumir endpoints do backend. |
| `src/app/components/AlunoPanel.tsx` | Interface do aluno, projetos, grupos, chat e videochamada. |
| `src/app/components/ProfessorPanel.tsx` | Interface de avaliação de projetos por rubrica. |
| `src/app/components/CoordenadorPanel.tsx` | Interface administrativa de usuários, turmas, grupos, projetos e dashboard. |
| `src/app/components/EmpresaPanel.tsx` | Interface de portfólio para empresas parceiras. |
| `src/app/components/ui/` | Componentes de UI baseados em shadcn/ui e Radix UI. |
| `vite.config.ts` | Configuração do Vite, plugin React, Tailwind e alias `@`. |
| `vercel.json` | Reescrita de rotas para SPA na Vercel. |

## Variáveis de Ambiente

Crie um arquivo `.env.local` dentro de `opifront/`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_WS_URL=ws://127.0.0.1:8000
```

Para ambiente publicado:

```env
VITE_API_URL=https://seu-backend.railway.app/api
VITE_WS_URL=wss://seu-backend.railway.app
```

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API REST do backend Django. |
| `VITE_WS_URL` | URL base para conexões WebSocket de chat e videochamada. |

O projeto também possui um `.env.example` com o formato esperado das variáveis.

## Como Executar Localmente

### Pré-requisitos

- Node.js 18 ou superior.
- npm.
- Backend do OPI rodando e acessível.

### Instalação

```bash
cd opifront
npm install
```

### Servidor de Desenvolvimento

```bash
npm run dev
```

Por padrão, o Vite abre a aplicação em:

```text
http://localhost:5173
```

### Build

```bash
npm run build
```

O build gera os arquivos finais na pasta:

```text
dist/
```

## Integração com o Backend

O frontend usa o arquivo `src/app/api.ts` para centralizar chamadas REST. O token JWT é lido de:

```text
localStorage["opi_token"]
```

As requisições autenticadas enviam:

```http
Authorization: Bearer <token>
```

Principais grupos de endpoints consumidos:

| Módulo | Endpoints base |
|---|---|
| Autenticação | `/auth/login/`, `/auth/me/` |
| Projetos | `/projetos/` |
| Usuários | `/usuarios/` |
| Turmas | `/turmas/` |
| Grupos | `/grupos/` |
| Avaliações | `/avaliacoes/`, `/criterios-rubrica/` |
| Feed | `/feed/`, `/feed/{id}/curtir/` |
| Portfólio | `/portfolio/` |
| Chat | `/chat-grupo/{grupo_id}/` |
| Dashboard | `/dashboard/` |

## WebSockets

Os WebSockets são usados principalmente no `AlunoPanel.tsx`.

| Recurso | Rota |
|---|---|
| Chat por grupo | `/ws/chat-grupo/{grupo_id}/?token={jwt}` |
| Videochamada | `/ws/video-grupo/{grupo_id}/?token={jwt}` |

Em execução local, a base padrão é:

```text
ws://127.0.0.1:8000
```

Em ambiente publicado, use `wss://`.

## Perfis e Painéis

Depois do login, o backend retorna o perfil do usuário. O frontend usa esse perfil para renderizar o painel correto:

| Perfil recebido | Componente renderizado |
|---|---|
| `ALUNO` | `AlunoPanel` |
| `PROFESSOR` | `ProfessorPanel` |
| `COORDENADOR` | `CoordenadorPanel` |
| `EMPRESA` | `EmpresaPanel` |

As credenciais exibidas na tela de login servem como referência visual e dependem de usuários equivalentes cadastrados no backend.

## Publicação na Vercel

Configuração sugerida:

| Campo | Valor |
|---|---|
| Root Directory | `opifront` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Variáveis necessárias na Vercel:

- `VITE_API_URL`
- `VITE_WS_URL`

O arquivo `vercel.json` contém a regra:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Essa configuração permite que a SPA trate rotas internas sem erro de recarregamento.

## Identidade Visual

O frontend segue a identidade visual do SENAC, com uso predominante de azul institucional, laranja de destaque, cards claros, ícones Lucide e componentes responsivos.

Arquivos relevantes:

- `src/styles/theme.css`
- `src/styles/globals.css`
- `src/styles/tailwind.css`
- `default_shadcn_theme.css`

## Observações Importantes

- O frontend depende do backend para login, dados dos painéis, feed, avaliações, grupos, chat e videochamada.
- Não há script de testes configurado no `package.json`.
- Não versionar `.env.local` com URLs ou chaves sensíveis.
- Para WebSockets em servidor publicado, configure `VITE_WS_URL` com protocolo `wss://`.
- Os arquivos em `src/imports/` são assets importados do protótipo/documentação e devem ser mantidos se forem usados pela interface.

