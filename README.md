# OPI - Observatório de Projetos Integradores

<p align="center">
  <img src="./imagens/banner opi.png" width="1000">
</p>


Sistema web institucional desenvolvido para centralizar o ciclo de vida dos Projetos Integradores do SENAC Pernambuco, da submissão e acompanhamento pelos alunos até a avaliação por rubrica, publicação em feed social, comunicação em grupo e vitrine de projetos para empresas parceiras.

> Versão documentada: 2.0 / v6.0 - 2º Entregável - Sistema completo entregue e publicado.

## Links

| Item | Acesso |
|---|---|
| Repositório | https://github.com/Kverasz/OPI |
| Frontend publicado | https://opi-gamma.vercel.app |
| Backend publicado | Railway - Python 3.12, Daphne/ASGI e PostgreSQL |
| Instituição | SENAC Pernambuco - Fecomércio / Sesc |
| Curso | Análise e Desenvolvimento de Sistemas - 2º Módulo |

## Visão Geral

Antes do OPI, a entrega dos Projetos Integradores era feita de forma descentralizada por e-mail, Microsoft Teams e aplicativos externos. Esse fluxo dificultava o controle de versões, a rastreabilidade das avaliações, a organização por turma/turno e a preservação dos projetos como portfólio acadêmico.

O OPI resolve esse problema com uma plataforma única, responsiva e orientada por perfis. A aplicação possui frontend React hospedado na Vercel, backend Django REST Framework publicado na Railway, banco PostgreSQL, autenticação JWT, WebSockets para chat e sinalização de videochamada WebRTC.

## Perfis de Acesso

| Perfil | Papel no Sistema |
|---|---|
| Aluno | Submete e gerencia projetos, participa de grupos, usa chat/videochamada, acompanha feedbacks e atualiza perfil com foto e skills. |
| Professor | Visualiza projetos das turmas vinculadas, filtra por curso/turma e avalia por rubrica padronizada. |
| Coordenador | Gerencia usuários, turmas, grupos e projetos, acompanha indicadores, avalia diretamente e reverte avaliações quando necessário. |
| Empresa Parceira | Consulta o portfólio público, filtra projetos avaliados e visualiza perfis de alunos com consentimento LGPD. |

## Funcionalidades

### Autenticação e Sessão

- Login por e-mail e senha com JWT.
- Refresh token e persistência de sessão no `localStorage`.
- Redirecionamento automático por perfil.
- Cadastro e redefinição de senha controlados pelo Coordenador.

### Painel do Aluno

- CRUD completo de projetos.
- Seleção em cascata de curso, turma e grupo.
- Visualização dos projetos em que o aluno participa, não apenas os que criou.
- Upload de arquivos e histórico de versões.
- Acompanhamento de status, conceito, feedback e rubrica detalhada.
- Perfil expandido com foto, sobre mim, hard skills e soft skills.
- Chat em tempo real por grupo e videochamada WebRTC.

### Painel do Professor

- Listagem de projetos das turmas vinculadas.
- Filtros por curso e turma.
- Avaliação por rubrica carregada do banco de dados.
- Registro de conceito, comentários por critério, feedback geral e rubrica/assinatura.
- Revisão de avaliação existente.
- Controle de concorrência para evitar avaliações simultâneas do mesmo projeto.

### Painel do Coordenador

- CRUD de usuários com suporte a alunos multi-curso.
- CRUD de turmas, com seed de turmas para ADS, Design e Gastronomia.
- CRUD de grupos.
- Dashboard com indicadores de projetos e avaliações.
- Avaliação direta de projetos.
- Reversão de avaliação para devolver projeto ao status `PENDENTE`.
- Exclusão controlada para preservar integridade referencial.

### Portfólio para Empresas

- Acesso ao portfólio público por perfil de empresa.
- Exibição apenas de projetos avaliados.
- Filtros por curso, tecnologia, área e conceito.
- Aba de alunos com busca e filtro por curso.
- Perfil do aluno com foto, skills, cursos/turmas e projetos avaliados, respeitando consentimento LGPD.

### Feed Social

- Feed com projetos publicados seletivamente pelos grupos.
- Ordenação por quantidade de curtidas.
- Curtida única por usuário/projeto, com possibilidade de descurtir.
- Destaque visual para projetos com maior engajamento.

### Chat e Videochamada

- Chat de texto em tempo real por grupo via Django Channels.
- Histórico persistente de mensagens.
- Suporte a anexos no chat.
- Imagens com visualização inline e arquivos com download.
- Badges de mensagens não lidas.
- Videochamada WebRTC fullscreen com múltiplos participantes.
- Toggle de câmera e microfone.
- Sinalização WebRTC por WebSocket no próprio backend.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS v4, shadcn/ui, Radix UI, Lucide React, Recharts |
| Backend | Python 3.12, Django 5.2, Django REST Framework 3.16 |
| Autenticação | djangorestframework-simplejwt, JWT access/refresh |
| Tempo real | Django Channels 4.2, Daphne 4.1, WebSockets |
| Videochamada | WebRTC nativo do navegador com sinalização via WebSocket |
| Banco de dados | PostgreSQL, Django ORM, dj-database-url |
| Arquivos estáticos | WhiteNoise 6.9 |
| Deploy | Vercel para frontend, Railway para backend e PostgreSQL |
| Gestão | Git, GitHub, Notion, Figma |

## Arquitetura

```text
Usuário
  |
  | HTTPS / API REST / JWT
  v
Frontend React + TypeScript + Vite
  |
  | VITE_API_URL
  v
Backend Django + DRF
  |
  | ORM
  v
PostgreSQL

Chat e vídeo:
Frontend React
  |
  | VITE_WS_URL / WSS
  v
Daphne + Django Channels
  |
  | WebSocket
  v
Chat em tempo real + sinalização WebRTC
```

## Estrutura do Repositório

```bash
OPI/
|
├── opifront/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json
│   └── src/
│       ├── main.tsx
│       ├── styles/
│       │   ├── index.css
│       │   ├── globals.css
│       │   ├── theme.css
│       │   ├── tailwind.css
│       │   └── fonts.css
│       └── app/
│           ├── App.tsx
│           ├── api.ts
│           ├── pages/
│           │   ├── TermosDeUso.tsx
│           │   └── PoliticaDePrivacidade.tsx
│           └── components/
│               ├── AlunoPanel.tsx
│               ├── ProfessorPanel.tsx
│               ├── CoordenadorPanel.tsx
│               ├── EmpresaPanel.tsx
│               ├── SenacLogo.tsx
│               └── ui/
│
├── opi_backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── core/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── usuarios/
│   ├── projetos/
│   ├── avaliacoes/
│   └── feed/
│
└── Changelog_v6_para_PDF.txt
```

## Modelo de Dados

| Tabela / Modelo | Finalidade |
|---|---|
| `usuarios` | Usuário customizado com perfil, foto, curso, consentimento LGPD e skills. |
| `turmas` | Turmas por curso, turno, ano e semestre. |
| `usuario_turma` | Vínculo N:N entre usuários e turmas. |
| `grupos` | Grupos de projeto com membros, turma e cor. |
| `projetos` | Projetos integradores com status, links, resumo, turma, grupo e controle de avaliação. |
| `projeto_membros` | Membros do projeto e papel no grupo. |
| `projeto_tecnologias` | Tecnologias utilizadas no projeto. |
| `projeto_arquivos` | Arquivos anexados e controle de versão. |
| `historico_versoes` | Auditoria das alterações do projeto. |
| `criterios_rubrica` | Critérios configuráveis da avaliação. |
| `avaliacoes` | Avaliação final com conceito, feedback e rubrica assinatura. |
| `avaliacao_criterios` | Conceito e comentário por critério da rubrica. |
| `curtidas` | Curtidas únicas por usuário/projeto. |
| `canais_grupo` | Canal de chat vinculado a um grupo. |
| `mensagens_grupo` | Mensagens de texto ou arquivo no chat de grupo. |
| `notificacoes` | Notificações do sistema. |

## Regras de Negócio

| ID | Regra |
|---|---|
| RN-01 | Somente Coordenador cria, edita, desativa e redefine senha de usuários. |
| RN-02 | Aluno visualiza projetos em que é membro, não apenas os criados por ele. |
| RN-03 | Projeto só pode ser editado ou excluído quando está com status `PENDENTE`. |
| RN-04 | Portfólio público exibe apenas projetos com status `AVALIADO`. |
| RN-05 | Cada usuário pode curtir o mesmo projeto apenas uma vez. |
| RN-06 | Avaliação exige conceito geral, professor, data e todos os critérios preenchidos. |
| RN-07 | Chat e videochamada só podem ser acessados por membros autenticados do grupo. |
| RN-08 | Dados pessoais no portfólio dependem de consentimento LGPD. |
| RN-09 | Aluno pode estar vinculado a até 3 cursos, uma turma por curso. |
| RN-10 | Coordenador pode avaliar projetos diretamente. |
| RN-11 | Coordenador pode reverter avaliação e devolver o projeto para `PENDENTE`. |
| RN-12 | Exclusão definitiva de usuário executa cascata controlada para manter integridade. |
| RN-13 | Publicação no feed é seletiva e pode ser feita por membros do grupo. |
| RN-14 | Professor avalia apenas projetos de turmas às quais está vinculado. |

## Como Executar Localmente

### Pré-requisitos

- Python 3.12+
- Node.js 18+
- npm
- PostgreSQL 14+
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/Kverasz/OPI.git
cd OPI
```

### 2. Configure o backend

```powershell
cd opi_backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configure as variáveis de ambiente do banco. Em ambiente local, o projeto lê as variáveis abaixo ou usa os valores padrão definidos em `opi_backend/core/settings.py`.

```powershell
$env:DB_NAME="opi_db"
$env:DB_USER="postgres"
$env:DB_PASSWORD="sua_senha"
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DEBUG="True"
```

Crie o banco PostgreSQL e execute as migrations:

```powershell
createdb opi_db
python manage.py migrate
python manage.py loaddata avaliacoes/fixtures/criterios_rubrica.json
python manage.py createsuperuser
python manage.py runserver
```

Backend local:

```text
http://127.0.0.1:8000
```

### 3. Configure o frontend

Em outro terminal:

```powershell
cd opifront
npm install
```

Crie `opifront/.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_WS_URL=ws://127.0.0.1:8000
```

Inicie o Vite:

```powershell
npm run dev
```

Frontend local:

```text
http://localhost:5173
```

### Build do frontend

```powershell
cd opifront
npm run build
```

## Variáveis de Ambiente

### Backend

| Variável | Uso |
|---|---|
| `SECRET_KEY` | Chave secreta do Django. Deve ser definida no ambiente publicado. |
| `DEBUG` | Controla modo debug (`True` ou `False`). |
| `DATABASE_URL` | URL completa do PostgreSQL usada pela Railway. |
| `DB_NAME` | Nome do banco local, quando `DATABASE_URL` não existe. |
| `DB_USER` | Usuário do banco local. |
| `DB_PASSWORD` | Senha do banco local. |
| `DB_HOST` | Host do PostgreSQL local. |
| `DB_PORT` | Porta do PostgreSQL local. |

### Frontend

| Variável | Uso |
|---|---|
| `VITE_API_URL` | URL base da API REST. Exemplo: `https://seu-backend.up.railway.app/api`. |
| `VITE_WS_URL` | URL base de WebSockets. Exemplo: `wss://seu-backend.up.railway.app`. |

## Endpoints Principais

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/login/` | Login e emissão de tokens JWT. |
| `POST` | `/api/auth/logout/` | Logout. |
| `POST` | `/api/auth/refresh/` | Renovação do access token. |
| `GET/PATCH` | `/api/auth/me/` | Consulta e atualização do perfil logado. |
| `GET/POST` | `/api/usuarios/` | Listagem e criação de usuários. |
| `GET/POST` | `/api/turmas/` | Listagem e criação de turmas. |
| `GET/POST` | `/api/grupos/` | Listagem e criação de grupos. |
| `GET/POST` | `/api/projetos/` | Listagem e submissão de projetos. |
| `POST` | `/api/projetos/{id}/publicar_feed/` | Publica projeto no feed social. |
| `GET` | `/api/projetos/{id}/historico/` | Histórico de versões do projeto. |
| `GET` | `/api/portfolio/` | Portfólio público de projetos avaliados. |
| `GET` | `/api/dashboard/` | Indicadores do Coordenador. |
| `GET/POST` | `/api/avaliacoes/` | Listagem e registro de avaliações. |
| `POST` | `/api/avaliacoes/iniciar/{projeto_id}/` | Reserva projeto para avaliação. |
| `POST` | `/api/avaliacoes/liberar/{projeto_id}/` | Libera projeto em avaliação. |
| `GET` | `/api/feed/` | Feed social ordenado por curtidas. |
| `POST` | `/api/feed/{projeto_id}/curtir/` | Curtir ou descurtir projeto. |
| `GET` | `/api/chat-grupo/{grupo_id}/` | Histórico do chat de grupo. |
| `POST` | `/api/chat-grupo/{grupo_id}/mensagens/` | Envio de mensagem ou arquivo. |

## WebSockets

| Rota | Uso |
|---|---|
| `/ws/chat-grupo/{grupo_id}/?token={jwt}` | Chat em tempo real por grupo. |
| `/ws/video-grupo/{grupo_id}/?token={jwt}` | Sinalização WebRTC para videochamada. |

## Deploy

### Frontend - Vercel

- Projeto em `opifront/`.
- Build command: `npm run build`.
- Variáveis obrigatórias:
  - `VITE_API_URL`
  - `VITE_WS_URL`

### Backend - Railway

- Projeto em `opi_backend/`.
- Servidor ASGI via Daphne.
- `Procfile`:

```Procfile
web: mkdir -p media/chat_arquivos && python manage.py collectstatic --noinput && daphne -b 0.0.0.0 -p $PORT core.asgi:application
```

- Variáveis recomendadas:
  - `SECRET_KEY`
  - `DEBUG=False`
  - `DATABASE_URL`

## Identidade Visual

| Cor | Hex | Uso |
|---|---|---|
| Azul principal | `#1B3A6B` | Navbar, headers, footer, botões primários e títulos. |
| Laranja destaque | `#E87722` | Login, links de destaque e ícones de módulos. |
| Azul claro | `#2563A8` | Ícones secundários e variações de cards. |
| Branco | `#FFFFFF` | Fundos e textos sobre fundo escuro. |
| Cinza escuro | `#1E293B` | Texto principal. |
| Cinza médio | `#64748B` | Texto secundário e placeholders. |

## LGPD e Segurança

- Senhas armazenadas com hash seguro do Django (`PBKDF2 + SHA256`).
- Sessão por JWT, com access e refresh token.
- Controle de acesso por perfil.
- Política de privacidade e termos de uso no frontend.
- Dados opcionais de perfil usados com consentimento.
- Exposição de foto e skills no portfólio condicionada ao consentimento LGPD.
- WebSockets autenticados por token JWT e restritos aos membros do grupo.

## Status do Projeto

O OPI está documentado como sistema completo no 2º Entregável. A versão v6.0 consolida:

- 41 requisitos funcionais.
- 10 requisitos não funcionais.
- 14 regras de negócio.
- Backend com 4 apps Django: `usuarios`, `projetos`, `avaliacoes` e `feed`.
- Suporte a API REST, WebSockets, upload de arquivos, feed social e videochamada WebRTC.
- Deploy separado em Railway e Vercel.

---

# English Version

# OPI - Integrative Projects Observatory

<p align="center">
  <img src="./imagens/banner opi.png" width="1000">
</p>

Institutional web system developed to centralize the full lifecycle of SENAC Pernambuco Integrative Projects, from student submission and tracking to rubric-based evaluation, social feed publication, group communication and a project showcase for partner companies.

> Documented version: 2.0 / v6.0 - 2nd Delivery - Complete delivered and published system.

## Links

| Item | Access |
|---|---|
| Repository | https://github.com/Kverasz/OPI |
| Published frontend | https://opi-gamma.vercel.app |
| Published backend | Railway - Python 3.12, Daphne/ASGI and PostgreSQL |
| Institution | SENAC Pernambuco - Fecomercio / Sesc |
| Course | Systems Analysis and Development - 2nd Module |

## Overview

Before OPI, Integrative Project submissions were handled in a decentralized way through e-mail, Microsoft Teams and external applications. This workflow made version control, evaluation traceability, class/shift organization and long-term preservation of projects as an academic portfolio difficult.

OPI solves this problem with a single responsive platform organized by user roles. The application has a React frontend hosted on Vercel, a Django REST Framework backend published on Railway, PostgreSQL database, JWT authentication, WebSockets for chat and WebRTC signaling for video calls.

## Access Profiles

| Profile | Role in the System |
|---|---|
| Student | Submits and manages projects, participates in groups, uses chat/video calls, follows feedback and updates profile with photo and skills. |
| Teacher | Views projects from linked classes, filters by course/class and evaluates through a standardized rubric. |
| Coordinator | Manages users, classes, groups and projects, tracks indicators, evaluates projects directly and reverts evaluations when necessary. |
| Partner Company | Consults the public portfolio, filters evaluated projects and views student profiles with LGPD consent. |

## Features

### Authentication and Session

- Login by e-mail and password using JWT.
- Refresh token and session persistence in `localStorage`.
- Automatic redirection by user profile.
- User registration and password reset controlled by the Coordinator.

### Student Dashboard

- Full project CRUD.
- Cascading selection of course, class and group.
- View of projects in which the student participates, not only those created by the student.
- File upload and version history.
- Tracking of status, grade/concept, feedback and detailed rubric.
- Expanded profile with photo, about me, hard skills and soft skills.
- Real-time group chat and WebRTC video call.

### Teacher Dashboard

- Listing of projects from linked classes.
- Filters by course and class.
- Rubric evaluation loaded from the database.
- Registration of concept, comments per criterion, general feedback and rubric/signature.
- Review of an existing evaluation.
- Concurrency control to prevent simultaneous evaluations of the same project.

### Coordinator Dashboard

- User CRUD with support for multi-course students.
- Class CRUD, with seeded classes for ADS, Design and Gastronomy.
- Group CRUD.
- Dashboard with project and evaluation indicators.
- Direct project evaluation.
- Evaluation reversal to return a project to `PENDENTE` status.
- Controlled deletion to preserve referential integrity.

### Portfolio for Companies

- Public portfolio access through the company profile.
- Display of evaluated projects only.
- Filters by course, technology, area and concept.
- Students tab with search and course filter.
- Student profile with photo, skills, courses/classes and evaluated projects, respecting LGPD consent.

### Social Feed

- Feed with projects selectively published by groups.
- Sorting by number of likes.
- One like per user/project, with the option to unlike.
- Visual highlight for projects with higher engagement.

### Chat and Video Call

- Real-time text chat by group via Django Channels.
- Persistent message history.
- Support for chat attachments.
- Inline image preview and file download.
- Unread message badges.
- Fullscreen WebRTC video call with multiple participants.
- Camera and microphone toggle.
- WebRTC signaling through WebSocket in the backend itself.

## Technologies

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS v4, shadcn/ui, Radix UI, Lucide React, Recharts |
| Backend | Python 3.12, Django 5.2, Django REST Framework 3.16 |
| Authentication | djangorestframework-simplejwt, JWT access/refresh |
| Real time | Django Channels 4.2, Daphne 4.1, WebSockets |
| Video call | Native browser WebRTC with WebSocket signaling |
| Database | PostgreSQL, Django ORM, dj-database-url |
| Static files | WhiteNoise 6.9 |
| Deployment | Vercel for frontend, Railway for backend and PostgreSQL |
| Management | Git, GitHub, Notion, Figma |

## Architecture

```text
User
  |
  | HTTPS / REST API / JWT
  v
React + TypeScript + Vite Frontend
  |
  | VITE_API_URL
  v
Django + DRF Backend
  |
  | ORM
  v
PostgreSQL

Chat and video:
React Frontend
  |
  | VITE_WS_URL / WSS
  v
Daphne + Django Channels
  |
  | WebSocket
  v
Real-time chat + WebRTC signaling
```

## Repository Structure

```bash
OPI/
|
├── opifront/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json
│   └── src/
│       ├── main.tsx
│       ├── styles/
│       │   ├── index.css
│       │   ├── globals.css
│       │   ├── theme.css
│       │   ├── tailwind.css
│       │   └── fonts.css
│       └── app/
│           ├── App.tsx
│           ├── api.ts
│           ├── pages/
│           │   ├── TermosDeUso.tsx
│           │   └── PoliticaDePrivacidade.tsx
│           └── components/
│               ├── AlunoPanel.tsx
│               ├── ProfessorPanel.tsx
│               ├── CoordenadorPanel.tsx
│               ├── EmpresaPanel.tsx
│               ├── SenacLogo.tsx
│               └── ui/
│
├── opi_backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── core/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── usuarios/
│   ├── projetos/
│   ├── avaliacoes/
│   └── feed/
│
└── Changelog_v6_para_PDF.txt
```

## Data Model

| Table / Model | Purpose |
|---|---|
| `usuarios` | Custom user with profile, photo, course, LGPD consent and skills. |
| `turmas` | Classes by course, shift, year and semester. |
| `usuario_turma` | Many-to-many relationship between users and classes. |
| `grupos` | Project groups with members, class and color. |
| `projetos` | Integrative projects with status, links, summary, class, group and evaluation control. |
| `projeto_membros` | Project members and role in the group. |
| `projeto_tecnologias` | Technologies used in the project. |
| `projeto_arquivos` | Attached files and version control. |
| `historico_versoes` | Audit trail of project changes. |
| `criterios_rubrica` | Configurable evaluation rubric criteria. |
| `avaliacoes` | Final evaluation with concept, feedback and rubric signature. |
| `avaliacao_criterios` | Concept and comment per rubric criterion. |
| `curtidas` | Unique likes per user/project. |
| `canais_grupo` | Chat channel linked to a group. |
| `mensagens_grupo` | Text or file messages in the group chat. |
| `notificacoes` | System notifications. |

## Business Rules

| ID | Rule |
|---|---|
| RN-01 | Only the Coordinator creates, edits, disables and resets user passwords. |
| RN-02 | Students view projects in which they are members, not only those they created. |
| RN-03 | Projects can only be edited or deleted when their status is `PENDENTE`. |
| RN-04 | The public portfolio displays only projects with `AVALIADO` status. |
| RN-05 | Each user can like the same project only once. |
| RN-06 | Evaluation requires general concept, teacher, date and all criteria filled in. |
| RN-07 | Chat and video call can only be accessed by authenticated group members. |
| RN-08 | Personal data in the portfolio depends on LGPD consent. |
| RN-09 | A student can be linked to up to 3 courses, one class per course. |
| RN-10 | The Coordinator can directly evaluate projects. |
| RN-11 | The Coordinator can revert an evaluation and return the project to `PENDENTE`. |
| RN-12 | Permanent user deletion runs controlled cascade logic to keep integrity. |
| RN-13 | Feed publication is selective and can be performed by group members. |
| RN-14 | Teachers evaluate only projects from classes to which they are linked. |

## How to Run Locally

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm
- PostgreSQL 14+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Kverasz/OPI.git
cd OPI
```

### 2. Configure the backend

```powershell
cd opi_backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configure the database environment variables. In local development, the project reads the variables below or uses the default values defined in `opi_backend/core/settings.py`.

```powershell
$env:DB_NAME="opi_db"
$env:DB_USER="postgres"
$env:DB_PASSWORD="your_password"
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DEBUG="True"
```

Create the PostgreSQL database and run migrations:

```powershell
createdb opi_db
python manage.py migrate
python manage.py loaddata avaliacoes/fixtures/criterios_rubrica.json
python manage.py createsuperuser
python manage.py runserver
```

Local backend:

```text
http://127.0.0.1:8000
```

### 3. Configure the frontend

In another terminal:

```powershell
cd opifront
npm install
```

Create `opifront/.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_WS_URL=ws://127.0.0.1:8000
```

Start Vite:

```powershell
npm run dev
```

Local frontend:

```text
http://localhost:5173
```

### Frontend build

```powershell
cd opifront
npm run build
```

## Environment Variables

### Backend

| Variable | Usage |
|---|---|
| `SECRET_KEY` | Django secret key. Must be defined in the published environment. |
| `DEBUG` | Controls debug mode (`True` or `False`). |
| `DATABASE_URL` | Full PostgreSQL URL used by Railway. |
| `DB_NAME` | Local database name when `DATABASE_URL` does not exist. |
| `DB_USER` | Local database user. |
| `DB_PASSWORD` | Local database password. |
| `DB_HOST` | Local PostgreSQL host. |
| `DB_PORT` | Local PostgreSQL port. |

### Frontend

| Variable | Usage |
|---|---|
| `VITE_API_URL` | REST API base URL. Example: `https://your-backend.up.railway.app/api`. |
| `VITE_WS_URL` | WebSocket base URL. Example: `wss://your-backend.up.railway.app`. |

## Main Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login/` | Login and JWT token issuing. |
| `POST` | `/api/auth/logout/` | Logout. |
| `POST` | `/api/auth/refresh/` | Access token renewal. |
| `GET/PATCH` | `/api/auth/me/` | View and update the logged-in profile. |
| `GET/POST` | `/api/usuarios/` | User listing and creation. |
| `GET/POST` | `/api/turmas/` | Class listing and creation. |
| `GET/POST` | `/api/grupos/` | Group listing and creation. |
| `GET/POST` | `/api/projetos/` | Project listing and submission. |
| `POST` | `/api/projetos/{id}/publicar_feed/` | Publishes a project in the social feed. |
| `GET` | `/api/projetos/{id}/historico/` | Project version history. |
| `GET` | `/api/portfolio/` | Public portfolio of evaluated projects. |
| `GET` | `/api/dashboard/` | Coordinator indicators. |
| `GET/POST` | `/api/avaliacoes/` | Evaluation listing and registration. |
| `POST` | `/api/avaliacoes/iniciar/{projeto_id}/` | Reserves a project for evaluation. |
| `POST` | `/api/avaliacoes/liberar/{projeto_id}/` | Releases a project under evaluation. |
| `GET` | `/api/feed/` | Social feed sorted by likes. |
| `POST` | `/api/feed/{projeto_id}/curtir/` | Like or unlike a project. |
| `GET` | `/api/chat-grupo/{grupo_id}/` | Group chat history. |
| `POST` | `/api/chat-grupo/{grupo_id}/mensagens/` | Sends a message or file. |

## WebSockets

| Route | Usage |
|---|---|
| `/ws/chat-grupo/{grupo_id}/?token={jwt}` | Real-time group chat. |
| `/ws/video-grupo/{grupo_id}/?token={jwt}` | WebRTC signaling for video calls. |

## Deployment

### Frontend - Vercel

- Project in `opifront/`.
- Build command: `npm run build`.
- Required variables:
  - `VITE_API_URL`
  - `VITE_WS_URL`

### Backend - Railway

- Project in `opi_backend/`.
- ASGI server via Daphne.
- `Procfile`:

```Procfile
web: mkdir -p media/chat_arquivos && python manage.py collectstatic --noinput && daphne -b 0.0.0.0 -p $PORT core.asgi:application
```

- Recommended variables:
  - `SECRET_KEY`
  - `DEBUG=False`
  - `DATABASE_URL`

## Visual Identity

| Color | Hex | Usage |
|---|---|---|
| Main blue | `#1B3A6B` | Navbar, headers, footer, primary buttons and titles. |
| Highlight orange | `#E87722` | Login, highlight links and module icons. |
| Light blue | `#2563A8` | Secondary icons and card variations. |
| White | `#FFFFFF` | Backgrounds and text on dark backgrounds. |
| Dark gray | `#1E293B` | Main text. |
| Medium gray | `#64748B` | Secondary text and placeholders. |

## LGPD and Security

- Passwords stored with Django secure hash (`PBKDF2 + SHA256`).
- Session via JWT, with access and refresh tokens.
- Access control by profile.
- Privacy policy and terms of use in the frontend.
- Optional profile data used with consent.
- Exposure of photo and skills in the portfolio conditioned by LGPD consent.
- WebSockets authenticated by JWT token and restricted to group members.

## Project Status

OPI is documented as a complete delivered system for the 2nd Delivery. Version v6.0 consolidates:

- 41 functional requirements.
- 10 non-functional requirements.
- 14 business rules.
- Backend with 4 Django apps: `usuarios`, `projetos`, `avaliacoes` and `feed`.
- Support for REST API, WebSockets, file upload, social feed and WebRTC video calls.
- Separate deployment on Railway and Vercel.
