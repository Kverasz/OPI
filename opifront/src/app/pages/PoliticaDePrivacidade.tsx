import { Shield } from 'lucide-react';

export default function PoliticaDePrivacidade() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #E6F2FF, #FFFFFF)' }}>
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div style={{ borderColor: '#E87722' }}>
            <h1 className="text-lg font-bold" style={{ color: '#1B3A6B' }}>Política de Privacidade</h1>
            <p className="text-xs text-gray-500">OPI — Observatório de Projetos Integradores</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E87722' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#1B3A6B' }}>Política de Privacidade</h2>
          </div>
          <p className="text-sm text-gray-500 mb-8">Observatório de Projetos Integradores (OPI) — SENAC Pernambuco · Versão 2.0 · 2026</p>

          <div className="space-y-8 text-sm leading-relaxed text-gray-700">

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>1. Introdução e Controlador dos Dados</h3>
              <p>Esta Política de Privacidade descreve como o sistema OPI coleta, utiliza, armazena e protege os dados pessoais dos seus usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). O controlador dos dados é o SENAC Pernambuco, representado pelo Coordenador do curso de ADS responsável pela turma usuária do sistema.</p>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>2. Dados Coletados</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#E87722' }}>2.1 Dados obrigatórios (todos os perfis)</h4>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong>Nome completo:</strong> identificação do usuário no sistema e nas avaliações;</li>
                    <li><strong>E-mail institucional:</strong> login único e canal de comunicação oficial;</li>
                    <li><strong>Senha:</strong> armazenada exclusivamente como hash PBKDF2+SHA256;</li>
                    <li><strong>Perfil de acesso:</strong> Aluno, Professor, Coordenador ou Empresa Parceira;</li>
                    <li><strong>Vínculo com turma(s):</strong> necessário para filtragem de projetos e avaliações;</li>
                    <li><strong>Registro de consentimento:</strong> booleano + timestamp da aceitação dos termos.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#E87722' }}>2.2 Dados opcionais de perfil (alunos)</h4>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong>Foto de perfil:</strong> enviada pelo próprio usuário, armazenada como base64 no banco;</li>
                    <li><strong>Sobre mim:</strong> texto de apresentação pessoal e profissional;</li>
                    <li><strong>Hard skills:</strong> lista de habilidades técnicas;</li>
                    <li><strong>Soft skills:</strong> lista de habilidades comportamentais;</li>
                    <li><strong>Curso(s):</strong> derivado automaticamente da(s) turma(s) vinculada(s).</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#E87722' }}>2.3 Dados gerados pelo uso</h4>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong>Projetos submetidos:</strong> título, descrição, tecnologias, links, arquivos e histórico de versões;</li>
                    <li><strong>Avaliações:</strong> conceito, feedback, critérios de rubrica e identificação do avaliador;</li>
                    <li><strong>Mensagens de chat:</strong> texto e arquivos enviados nos canais de grupo;</li>
                    <li><strong>Curtidas no feed:</strong> registro de quais projetos cada usuário curtiu;</li>
                    <li><strong>Histórico de ações:</strong> registro de submissões, edições e exclusões para auditoria.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#E87722' }}>2.4 Dados NÃO coletados</h4>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Dados de geolocalização;</li>
                    <li>Informações financeiras ou de pagamento;</li>
                    <li>Dados biométricos;</li>
                    <li>Conteúdo de áudio/vídeo das videochamadas (apenas sinalização WebRTC é processada).</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>3. Finalidade do Tratamento</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Autenticação e controle de acesso ao sistema por perfil;</li>
                <li>Identificação do autor nos projetos, avaliações e mensagens do chat;</li>
                <li>Filtragem de projetos por turma, curso e professor responsável;</li>
                <li>Exibição no portfólio público de empresas parceiras (somente com consentimento);</li>
                <li>Comunicação interna por meio do chat de grupo;</li>
                <li>Geração de relatórios acadêmicos institucionais pelo Coordenador;</li>
                <li>Auditoria de ações administrativas.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>4. Base Legal para o Tratamento</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>Consentimento (Art. 7º, I):</strong> para dados opcionais de perfil e exibição no portfólio público;</li>
                <li><strong>Legítimo interesse (Art. 7º, IX):</strong> para dados necessários ao funcionamento acadêmico;</li>
                <li><strong>Cumprimento de obrigação legal (Art. 7º, II):</strong> para registros de auditoria e conformidade institucional.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>5. Compartilhamento de Dados</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>Entre usuários do sistema:</strong> nome e projetos são visíveis conforme o perfil de acesso;</li>
                <li><strong>Portfólio público (empresas):</strong> somente nome, foto, skills e projetos avaliados, mediante consentimento;</li>
                <li><strong>Infraestrutura de produção:</strong> dados armazenados no PostgreSQL na Railway; frontend servido pela Vercel;</li>
                <li><strong>Não compartilhamos dados com terceiros</strong> para fins comerciais, publicitários ou de marketing;</li>
                <li><strong>Não realizamos venda ou cessão de dados pessoais</strong> a qualquer entidade.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>6. Armazenamento e Segurança</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>Banco de dados:</strong> PostgreSQL na Railway com criptografia em repouso e em trânsito (HTTPS/TLS);</li>
                <li><strong>Senhas:</strong> armazenadas como hash PBKDF2+SHA256 — impossível recuperar a senha original;</li>
                <li><strong>Autenticação:</strong> tokens JWT com tempo de expiração configurado;</li>
                <li><strong>Arquivos de chat:</strong> armazenados em <code>media/chat_arquivos/</code>, acessíveis apenas por membros autenticados do grupo;</li>
                <li><strong>WebSockets:</strong> conexões protegidas por WSS; autenticação verificada via JWT em cada conexão;</li>
                <li><strong>Videochamada:</strong> o servidor processa apenas sinalização WebRTC; o conteúdo de áudio/vídeo trafega P2P entre navegadores.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>7. Retenção de Dados</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Os dados são mantidos enquanto a conta do usuário estiver ativa no sistema;</li>
                <li>A exclusão definitiva remove automaticamente os projetos e grupos criados pelo usuário;</li>
                <li>Avaliações são mantidas vinculadas ao projeto mesmo após encerramento do vínculo do professor;</li>
                <li>Registros de auditoria podem ser mantidos pelo SENAC para fins institucionais.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>8. Direitos dos Titulares</h3>
              <p className="mb-2">Conforme a LGPD (Art. 18), você tem direito a:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>Confirmação e acesso:</strong> saber se seus dados são tratados e acessar as informações armazenadas;</li>
                <li><strong>Correção:</strong> solicitar a atualização de dados incompletos ou inexatos;</li>
                <li><strong>Anonimização ou exclusão:</strong> solicitar a exclusão de dados tratados em desconformidade com a LGPD;</li>
                <li><strong>Revogação do consentimento:</strong> retirar o consentimento para dados opcionais a qualquer momento;</li>
                <li><strong>Portabilidade:</strong> solicitar seus dados em formato estruturado;</li>
                <li><strong>Oposição:</strong> opor-se ao tratamento de dados realizado com base em legítimo interesse.</li>
              </ul>
              <p className="mt-2">Para exercer qualquer um desses direitos, entre em contato com o Coordenador responsável pela sua turma.</p>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>9. Cookies e Armazenamento Local</h3>
              <p>O OPI não utiliza cookies de rastreamento ou publicidade. O sistema armazena no <code>localStorage</code> do navegador apenas o token JWT de autenticação, necessário para manter a sessão ativa. Esse token não contém dados sensíveis e expira automaticamente.</p>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>10. Contato</h3>
              <p>Para dúvidas, solicitações relacionadas aos seus dados pessoais ou relatos de incidentes de segurança, entre em contato com o Coordenador responsável pela sua turma no SENAC Pernambuco.</p>
            </section>

            <div className="pt-6 border-t border-gray-200 text-xs text-gray-400">
              <p>SENAC Pernambuco — Análise e Desenvolvimento de Sistemas — 2026</p>
              <p className="mt-1">Versão 2.0 | Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
