# English Version

﻿# OPI: Integrative Projects Observatory

<p align="center">
  <img src="./imagens/banner opi.png" width="1000">
</p>

> A web platform designed to centralize the submission, evaluation, communication and public showcase of Integrative Projects at SENAC Pernambuco. Developed as a Capstone Project for the **Systems Analysis and Development Program** at **Senac College**.

[![Institution](https://img.shields.io/badge/Institution-Senac%20Pernambuco-blue)](https://www.senac.br/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB)](./opifront)
[![Backend](https://img.shields.io/badge/Backend-Django%20REST%20Framework-092E20)](./opi_backend)
[![Compliance](https://img.shields.io/badge/Compliance-LGPD%20Aware-blueviolet)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

## Links

| Item | Access |
|---|---|
| Repository | https://github.com/Kverasz/OPI |
| Published frontend | https://opi-gamma.vercel.app |
| Published backend | Railway - Python 3.12, Daphne/ASGI and PostgreSQL |
| Institution | SENAC Pernambuco - Fecomercio / Sesc |
| Course | Systems Analysis and Development - 2nd Module |

## Project Overview

**OPI - Integrative Projects Observatory** is an institutional web system created to solve a recurring academic management problem: Integrative Project deliveries were previously spread across e-mail, Microsoft Teams and external communication tools. This made it difficult to control project versions, trace evaluations, organize submissions by class and preserve student work as an academic portfolio.

The platform brings this workflow into a single role-based environment. Students submit and manage projects, teachers evaluate them through a structured rubric, coordinators manage users/classes/groups, and partner companies access a curated portfolio of evaluated projects and student profiles.

### Key Features

- **Role-based dashboards:** Dedicated interfaces for Student, Teacher, Coordinator and Partner Company profiles.
- **Project lifecycle management:** Project CRUD, group links, file uploads, version history, status tracking and evaluation visibility.
- **Rubric-based assessment:** Teachers and coordinators can evaluate projects using criteria stored in the database, with general feedback and rubric signature.
- **Public portfolio:** Partner companies can browse evaluated projects and student profiles, respecting LGPD consent rules.
- **Social feed:** Projects can be selectively published by groups and ranked by likes.
- **Real-time collaboration:** Group chat with message history, file attachments, unread badges and WebRTC video calls.
- **Session persistence:** JWT authentication with access/refresh tokens stored on the frontend.

### User Profiles

| Profile | Role in the System |
|---|---|
| Student | Submits and manages projects, participates in groups, uses chat/video calls, follows feedback and updates profile with photo and skills. |
| Teacher | Views projects from linked classes, filters by course/class and evaluates through a standardized rubric. |
| Coordinator | Manages users, classes, groups and projects, tracks indicators, evaluates projects directly and reverts evaluations when necessary. |
| Partner Company | Consults the public portfolio, filters evaluated projects and views student profiles with LGPD consent. |

## Main Modules and Features

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

## LGPD & Data Privacy Compliance

Because OPI handles academic records, user profiles and optional public portfolio data, privacy and access control are part of the project requirements. The system follows LGPD-oriented practices, especially for consent, purpose limitation and role-based visibility.

### Implemented Privacy Standards

- **Purpose limitation:** User data is used for authentication, academic project management, evaluation tracking, collaboration and portfolio display.
- **Role-based access control:** Students, teachers, coordinators and partner companies see different data according to their permissions.
- **Consent-aware portfolio:** Optional profile data such as photo, skills and "about me" information is exposed in the portfolio only when the student grants consent.
- **Secure passwords:** Passwords are stored with Django's secure hashing mechanism (`PBKDF2 + SHA256`).
- **JWT authentication:** API requests use Bearer tokens, and private WebSocket routes validate authenticated users.
- **Legal transparency:** The frontend includes Terms of Use and Privacy Policy pages.
- **Restricted chat/video access:** Group chat and WebRTC signaling are available only to authenticated group members.

## Tech Stack

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

## System Architecture

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

## Getting Started (Local Development)

Follow these steps to run the full project environment locally.

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm
- PostgreSQL 14+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Kverasz/OPI.git
cd OPI
```

### 2. Configure the Backend

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

### 3. Configure the Frontend

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

## Core API Endpoints

| Method | Endpoint | Description | Access Scope |
|---|---|---|---|
| `POST` | `/api/auth/login/` | Authenticates the user and returns JWT tokens. | Public |
| `POST` | `/api/auth/logout/` | Logs out the authenticated user. | Authenticated users |
| `POST` | `/api/auth/refresh/` | Refreshes the access token. | Authenticated users |
| `GET/PATCH` | `/api/auth/me/` | Reads or updates the logged-in user's profile. | Authenticated users |
| `GET/POST` | `/api/usuarios/` | Lists or creates users. | Coordinator |
| `GET/POST` | `/api/turmas/` | Lists or creates classes. | Authenticated users / Coordinator |
| `GET/POST` | `/api/grupos/` | Lists or creates project groups. | Authenticated users / Coordinator |
| `GET/POST` | `/api/projetos/` | Lists or submits projects. | Role-based |
| `POST` | `/api/projetos/{id}/publicar_feed/` | Publishes a project to the social feed. | Group members |
| `GET` | `/api/projetos/{id}/historico/` | Returns project version history. | Authorized users |
| `GET` | `/api/portfolio/` | Lists evaluated projects for the public portfolio. | Partner Company / authorized users |
| `GET` | `/api/dashboard/` | Returns coordinator indicators. | Coordinator |
| `GET/POST` | `/api/avaliacoes/` | Lists or creates evaluations. | Teacher / Coordinator |
| `POST` | `/api/avaliacoes/iniciar/{projeto_id}/` | Reserves a project for evaluation. | Teacher / Coordinator |
| `POST` | `/api/avaliacoes/liberar/{projeto_id}/` | Releases a project under evaluation. | Teacher / Coordinator |
| `GET` | `/api/feed/` | Returns feed projects sorted by likes. | Authenticated users |
| `POST` | `/api/feed/{projeto_id}/curtir/` | Likes or unlikes a project. | Authenticated users |
| `GET` | `/api/chat-grupo/{grupo_id}/` | Returns group chat history. | Group members |
| `POST` | `/api/chat-grupo/{grupo_id}/mensagens/` | Sends a message or file to a group chat. | Group members |

## WebSocket Routes

| Route | Purpose | Access Scope |
|---|---|---|
| `/ws/chat-grupo/{grupo_id}/?token={jwt}` | Real-time group chat. | Authenticated group members |
| `/ws/video-grupo/{grupo_id}/?token={jwt}` | WebRTC signaling for video calls. | Authenticated group members |

## Deployment Notes

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

## Future Improvements

If the project evolves in future semesters, the next improvements may include:

- **Redis channel layer:** Replace the in-memory channel layer to improve WebSocket scalability.
- **Advanced reports:** Export institutional reports by class, course, concept and evaluator.
- **Automated tests:** Add backend API tests and frontend component/integration tests.
- **Notification center:** Expand notifications for evaluation updates, chat activity and project status changes.
- **Portfolio analytics:** Add metrics for project views, company interest and student profile engagement.
- **Cloud media storage:** Move chat files and profile images to a dedicated storage service.

## Project Status

OPI is documented as a complete delivered system for the 2nd Delivery. Version v6.0 consolidates:

- 41 functional requirements.
- 10 non-functional requirements.
- 14 business rules.
- Backend with 4 Django apps: `usuarios`, `projetos`, `avaliacoes` and `feed`.
- Support for REST API, WebSockets, file upload, social feed and WebRTC video calls.
- Separate deployment on Railway and Vercel.

## Authors & Project Team

- Kennedy Veras. Backend & Privacy Architecture Specialist & Scrum Master [![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?logo=github&logoColor=white)](https://github.com/Kverasz) [![LinkedIn](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?logo=linkedin-white&logoColor=fff)](https://www.linkedin.com/in/kennedy-de-lima-veras-48366b2b4/)
- Ericha Barbosa. Frontend Developer & Product Owner [![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?logo=github&logoColor=white)](https://github.com/eritsb) [![LinkedIn](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?logo=linkedin-white&logoColor=fff)](https://www.linkedin.com/in/ericha-barbosa-092473292/)
- João Guilherme. UI/UX [![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?logo=github&logoColor=white)](https://github.com/JGOliveiraQ) [![LinkedIn](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?logo=linkedin-white&logoColor=fff)](https://www.linkedin.com/in/joaoguilhermeo/)
- Flávio Gonçalves.  UI/UX [![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?logo=github&logoColor=white)](https://github.com/flavinhogs) [![LinkedIn](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?logo=linkedin-white&logoColor=fff)](https://www.linkedin.com/in/fl%C3%A1vio-gon%C3%A7alves-961892208/)
- Academic context - Integrative Project / Capstone Project.
- Project management - Notion, GitHub and Figma.
- Technical scope - React + TypeScript frontend, Django REST backend, PostgreSQL database, WebSockets and WebRTC.

## Academic Advisor / Professor

Coding: Languages ​​and Techniques & Research, Technology and Society: Prof. Guibson Santana

Tech English Course Professor: Prof. Leonardo Trevas

Database: DQL and DTL: Prof. Heuryk Wylk

Requirements Engineering & Creativity: Prof. Paulo Pimentel

Information Technology Legislation: Prof. Renata Cristina

Extension Units: Back End: Prof. Arnott Ramos