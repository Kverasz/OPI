# OPI Backend — Observatório de Projetos Integradores

Backend REST API do OPI desenvolvido com **Python + Django + Django REST Framework**.

---

## Estrutura do Projeto

```
opi_backend/
├── core/              # Configurações globais e URLs raiz
├── usuarios/          # Modelo de usuário customizado, turmas, autenticação
├── projetos/          # CRUD de projetos, arquivos, histórico de versões
├── avaliacoes/        # Rubrica, avaliações por critério
├── feed/              # Curtidas, notificações, chat interno
└── media/             # Uploads de arquivos (gerado em runtime)
```

---

## Pré-requisitos

- Python 3.11+
- PostgreSQL 14+
- pip

---

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/opi-backend.git
cd opi-backend

# 2. Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure as variáveis de ambiente (crie um .env)
cp .env.example .env
# edite o .env com seus dados do banco

# 5. Crie o banco de dados no PostgreSQL
createdb opi_db

# 6. Rode as migrations
python manage.py migrate

# 7. Carregue os critérios de rubrica iniciais
python manage.py loaddata avaliacoes/fixtures/criterios_rubrica.json

# 8. Crie o superusuário (Coordenador)
python manage.py createsuperuser

# 9. Inicie o servidor
python manage.py runserver
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz com:

```env
DB_NAME=opi_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_HOST=localhost
DB_PORT=5432
```

---

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/api/auth/login/` | Login — retorna JWT + dados do usuário | Público |
| POST | `/api/auth/logout/` | Logout (invalida refresh token) | Autenticado |
| POST | `/api/auth/refresh/` | Renovar access token | Autenticado |
| GET/PATCH | `/api/auth/me/` | Ver e editar perfil próprio | Autenticado |

**Exemplo de login:**
```json
POST /api/auth/login/
{
  "email": "coordenador@senac.edu.br",
  "senha": "suasenha"
}
```
**Resposta:**
```json
{
  "access": "<jwt_token>",
  "refresh": "<refresh_token>",
  "usuario": { "id": 1, "nome": "...", "perfil": "COORDENADOR", ... }
}
```

Nas requisições seguintes, envie o header:
```
Authorization: Bearer <access_token>
```

---

### Usuários (apenas Coordenador)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/usuarios/` | Listar usuários (filtros: `perfil`, `turma_id`, `ativo`) |
| POST | `/api/usuarios/` | Criar novo usuário |
| GET | `/api/usuarios/{id}/` | Detalhe do usuário |
| PATCH | `/api/usuarios/{id}/` | Editar usuário |
| DELETE | `/api/usuarios/{id}/` | Desativar usuário (soft delete) |
| POST | `/api/usuarios/{id}/redefinir_senha/` | Redefinir senha |
| POST | `/api/usuarios/{id}/vincular_turma/` | Vincular a uma turma |
| DELETE | `/api/usuarios/{id}/desvincular_turma/` | Remover de uma turma |

**Criar usuário:**
```json
POST /api/usuarios/
{
  "nome": "João Silva",
  "email": "joao@senac.edu.br",
  "perfil": "ALUNO",
  "senha": "senac2026"
}
```
Perfis aceitos: `ALUNO`, `PROFESSOR`, `COORDENADOR`, `EMPRESA`

---

### Turmas

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/api/turmas/` | Listar turmas | Todos autenticados |
| POST | `/api/turmas/` | Criar turma | Coordenador |
| PATCH | `/api/turmas/{id}/` | Editar turma | Coordenador |

---

### Projetos

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/api/projetos/` | Listar projetos (filtros: `status`, `turma_id`, `area_tematica`, `tecnologia`) | Autenticado* |
| POST | `/api/projetos/` | Submeter novo projeto | Aluno |
| GET | `/api/projetos/{id}/` | Detalhe do projeto | Autenticado* |
| PATCH | `/api/projetos/{id}/` | Editar projeto | Aluno (só PENDENTE) |
| DELETE | `/api/projetos/{id}/` | Excluir projeto | Aluno (só PENDENTE) |
| GET | `/api/projetos/{id}/historico/` | Histórico de versões | Autenticado |
| POST | `/api/projetos/{id}/arquivos/` | Adicionar arquivo | Autenticado |

*Aluno vê apenas os próprios; Professor vê da sua turma; Coordenador vê todos.

**Submeter projeto:**
```json
POST /api/projetos/
{
  "titulo": "Sistema de Biblioteca Digital",
  "descricao": "Sistema web para gerenciamento de empréstimos",
  "resumo_300": "Resumo curto do projeto...",
  "area_tematica": "Tecnologia da Informação",
  "turma": 1,
  "link_repositorio": "https://github.com/...",
  "tecnologias": ["Python", "Django", "PostgreSQL"],
  "membros_ids": [2, 3]
}
```

---

### Avaliações (Professor / Coordenador)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/criterios-rubrica/` | Listar critérios da rubrica |
| GET | `/api/avaliacoes/` | Listar avaliações |
| POST | `/api/avaliacoes/` | Registrar avaliação completa |
| POST | `/api/avaliacoes/iniciar/{projeto_id}/` | Reservar projeto para avaliação |
| POST | `/api/avaliacoes/liberar/{projeto_id}/` | Liberar projeto (volta para PENDENTE) |

**Registrar avaliação:**
```json
POST /api/avaliacoes/
{
  "projeto": 1,
  "conceito": "EXCELENTE",
  "feedback_geral": "Excelente trabalho! Interface intuitiva e código bem estruturado.",
  "criterios": [
    {"criterio_id": 1, "conceito": "EXCELENTE", "comentario": "Sistema funcionando perfeitamente"},
    {"criterio_id": 2, "conceito": "OTIMO", "comentario": "Código organizado"},
    {"criterio_id": 3, "conceito": "EXCELENTE", "comentario": "Interface limpa"},
    {"criterio_id": 4, "conceito": "BOM", "comentario": "Boas ideias"},
    {"criterio_id": 5, "conceito": "OTIMO", "comentario": "Documentação completa"}
  ]
}
```
Conceitos aceitos: `INSUFICIENTE`, `AINDA_NAO_SUFICIENTE`, `BOM`, `OTIMO`, `EXCELENTE`

---

### Portfólio Público (Empresas)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/portfolio/` | Projetos avaliados (filtros: `tecnologia`, `area_tematica`, `ano`) |

---

### Dashboard (Coordenador)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/` | Indicadores: totais por status, por turma, percentual avaliado |

---

### Feed Social

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/feed/` | Projetos ordenados por curtidas (filtros: `turma_id`, `area_tematica`, `tecnologia`, `conceito`) |
| POST | `/api/feed/{projeto_id}/curtir/` | Curtir / Descurtir (toggle) |

---

### Notificações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/notificacoes/` | Listar notificações do usuário logado |
| PATCH | `/api/notificacoes/{id}/lida/` | Marcar como lida |

---

### Chat Interno

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/chat/{projeto_id}/` | Canal + histórico de mensagens do grupo |
| POST | `/api/chat/{projeto_id}/mensagens/` | Enviar mensagem |

Acesso restrito aos membros do grupo (RN-07).

---

## Regras de Negócio Implementadas

| ID | Regra | Onde |
|----|-------|------|
| RN-01 | Só Coordenador cria usuários | `UsuarioViewSet` — permissão `IsCoordenador` |
| RN-02 | Aluno vê apenas os próprios projetos no painel | `ProjetoViewSet.get_queryset()` |
| RN-03 | Editar/excluir projeto só com status PENDENTE | `Projeto.pode_editar()` + views |
| RN-04 | Portfólio exibe só projetos com status AVALIADO | `PortfolioPublicoView` + `FeedView` |
| RN-05 | 1 curtida por usuário por projeto (unique_together) | `Curtida` model + toggle na view |
| RN-06 | Avaliação exige todos os critérios preenchidos | `AvaliacaoCriarSerializer.validate()` |
| RN-07 | Chat restrito aos membros do grupo | `ChatView` + `enviar_mensagem` |
| RN-08 | Dados LGPD: campo `consentimento_lgpd` no usuário | `Usuario` model |

---

## Banco de Dados

O arquivo `OPIBD.sql` contém o schema completo com:
- Todas as tabelas com comentários
- Triggers que bloqueiam delete de projetos não-PENDENTES
- Foreign keys com as políticas corretas (CASCADE, RESTRICT, SET NULL)

Para usar com Django (recomendado): rode `python manage.py migrate` — as migrations geram o mesmo schema via ORM.

---

## Tecnologias

- **Python 3.11**
- **Django 4.2**
- **Django REST Framework 3.15**
- **djangorestframework-simplejwt** — autenticação JWT
- **django-cors-headers** — CORS para o frontend
- **PostgreSQL** — banco de dados principal
