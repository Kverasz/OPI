# Política de Privacidade — OPI

**Observatório de Projetos Integradores**
SENAC Pernambuco · Versão 2.0 · 2026
Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)

---

## 1. Introdução e Controlador dos Dados

Esta Política de Privacidade descreve como o sistema OPI coleta, utiliza, armazena e protege os dados pessoais dos seus usuários, em conformidade com a LGPD (Lei nº 13.709/2018). O controlador dos dados é o **SENAC Pernambuco (Fecomércio / Sesc)**, representado pelo Coordenador do curso de Análise e Desenvolvimento de Sistemas responsável pela turma usuária do sistema.

---

## 2. Dados Coletados

O OPI coleta exclusivamente os dados necessários para seu funcionamento, conforme o princípio da necessidade previsto na LGPD.

### 2.1 Dados obrigatórios (todos os perfis)

| Dado | Finalidade |
|---|---|
| Nome completo | Identificação no sistema e nas avaliações |
| E-mail institucional | Login único e comunicação oficial |
| Senha | Armazenada como hash PBKDF2+SHA256 — nunca em texto puro |
| Perfil de acesso | Aluno, Professor, Coordenador ou Empresa Parceira |
| Vínculo com turma(s) | Filtragem de projetos e avaliações |
| Registro de consentimento | Booleano + timestamp da aceitação dos termos |

### 2.2 Dados opcionais de perfil (somente alunos)

Coletados apenas mediante preenchimento voluntário pelo aluno:

- **Foto de perfil:** enviada pelo próprio usuário, armazenada como base64 no banco;
- **Sobre mim:** texto de apresentação pessoal e profissional;
- **Hard skills:** lista de habilidades técnicas (ex.: Python, React, SQL);
- **Soft skills:** lista de habilidades comportamentais (ex.: Liderança, Comunicação);
- **Curso(s):** derivado automaticamente da(s) turma(s) vinculada(s) — ADS, Design ou Gastronomia.

### 2.3 Dados gerados pelo uso

- **Projetos submetidos:** título, descrição, tecnologias, links, arquivos e histórico de versões;
- **Avaliações:** conceito, feedback textual, critérios de rubrica e identificação do avaliador;
- **Mensagens de chat:** texto e arquivos enviados nos canais de grupo, com autor e timestamp;
- **Curtidas no feed:** registro de quais projetos cada usuário curtiu;
- **Histórico de ações:** registro de submissões, edições e exclusões de projetos para auditoria.

### 2.4 Dados que NÃO são coletados

- Dados de geolocalização;
- Informações financeiras ou de pagamento;
- Dados biométricos;
- Conteúdo de áudio/vídeo das videochamadas (apenas a sinalização WebRTC é processada pelo servidor — o conteúdo trafega diretamente entre os navegadores, P2P).

---

## 3. Finalidade do Tratamento

Os dados coletados são utilizados exclusivamente para:

- Autenticação e controle de acesso ao sistema por perfil;
- Identificação do autor nos projetos, avaliações e mensagens do chat;
- Filtragem de projetos por turma, curso e professor responsável;
- Exibição no portfólio público de empresas parceiras (somente com consentimento do aluno);
- Comunicação interna por meio do chat de grupo;
- Geração de relatórios acadêmicos institucionais pelo Coordenador;
- Auditoria de ações administrativas.

---

## 4. Base Legal para o Tratamento (LGPD Art. 7º)

| Base Legal | Aplicação |
|---|---|
| **Consentimento** (Art. 7º, I) | Dados opcionais de perfil (foto, sobre mim, skills) e exibição no portfólio público |
| **Legítimo interesse** (Art. 7º, IX) | Dados necessários ao funcionamento acadêmico (login, avaliações, projetos) |
| **Obrigação legal** (Art. 7º, II) | Registros de auditoria e conformidade institucional |

---

## 5. Compartilhamento de Dados

- **Entre usuários do sistema:** nome e projetos são visíveis conforme o perfil de acesso (professores veem projetos das suas turmas; coordenador tem acesso total);
- **Portfólio público (empresas):** somente nome, foto, skills e projetos avaliados, mediante consentimento explícito do aluno;
- **Infraestrutura de produção:** dados armazenados no PostgreSQL hospedado na Railway; frontend servido pela Vercel;
- **Não compartilhamos dados com terceiros** para fins comerciais, publicitários ou de marketing;
- **Não realizamos venda ou cessão de dados pessoais** a qualquer entidade.

---

## 6. Armazenamento e Segurança

| Aspecto | Implementação |
|---|---|
| Banco de dados | PostgreSQL na Railway com criptografia em trânsito (HTTPS/TLS) |
| Senhas | Hash PBKDF2+SHA256 — impossível recuperar a senha original |
| Autenticação | Tokens JWT com expiração; refresh token para renovação automática |
| Arquivos de chat | Armazenados em `media/chat_arquivos/` no servidor Railway, acessíveis apenas por membros autenticados do grupo |
| WebSockets | Conexões protegidas por WSS; autenticação verificada via JWT em cada conexão |
| Videochamada | Servidor processa apenas sinalização WebRTC (offer/answer/ICE); áudio e vídeo trafegam P2P entre navegadores |

---

## 7. Retenção de Dados

Os dados são mantidos enquanto a conta do usuário estiver ativa no sistema. Em caso de encerramento do vínculo com o SENAC:

- O Coordenador pode desativar a conta (soft delete) ou excluí-la definitivamente (hard delete);
- A **exclusão definitiva remove automaticamente** os projetos e grupos criados pelo usuário;
- Avaliações realizadas pelo professor são mantidas vinculadas ao projeto, mesmo após encerramento do vínculo;
- Registros de auditoria podem ser mantidos pelo SENAC para fins institucionais.

---

## 8. Direitos dos Titulares (LGPD Art. 18)

| Direito | Descrição |
|---|---|
| **Confirmação e acesso** | Saber se seus dados são tratados e acessar as informações armazenadas |
| **Correção** | Solicitar atualização de dados incompletos, inexatos ou desatualizados |
| **Exclusão** | Solicitar a exclusão de dados desnecessários ou tratados em desconformidade |
| **Revogação do consentimento** | Retirar consentimento para dados opcionais a qualquer momento, sem perder acesso ao sistema |
| **Portabilidade** | Solicitar seus dados em formato estruturado |
| **Oposição** | Opor-se ao tratamento com base em legítimo interesse |

Para exercer qualquer um desses direitos, entre em contato com o **Coordenador responsável pela sua turma**.

---

## 9. Cookies e Armazenamento Local

O OPI **não utiliza cookies de rastreamento ou publicidade**. O sistema armazena no `localStorage` do navegador apenas o token JWT de autenticação — necessário para manter a sessão ativa sem novo login a cada acesso. Esse token não contém dados sensíveis além do identificador de sessão e expira automaticamente.

---

## 10. Alterações nesta Política

Esta Política de Privacidade pode ser atualizada para refletir melhorias no sistema ou mudanças na legislação aplicável. Alterações significativas serão comunicadas pelo Coordenador responsável.

---

## 11. Contato

Para dúvidas, solicitações relacionadas aos seus dados pessoais ou relatos de incidentes de segurança, entre em contato com o **Coordenador responsável pela sua turma no SENAC Pernambuco**. O Coordenador atua como ponto de contato do controlador de dados para fins desta política.

---

*SENAC Pernambuco — Análise e Desenvolvimento de Sistemas — 2º Módulo — 2026*
*Versão 2.0 | Em conformidade com a LGPD — Lei nº 13.709/2018*
