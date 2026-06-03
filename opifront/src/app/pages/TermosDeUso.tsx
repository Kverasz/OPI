import { BookOpen } from 'lucide-react';

export default function TermosDeUso() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #E6F2FF, #FFFFFF)' }}>
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div style={{ borderColor: '#E87722' }}>
            <h1 className="text-lg font-bold" style={{ color: '#1B3A6B' }}>Termos de Uso</h1>
            <p className="text-xs text-gray-500">OPI — Observatório de Projetos Integradores</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1B3A6B' }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#1B3A6B' }}>Termos de Uso</h2>
          </div>
          <p className="text-sm text-gray-500 mb-8">Observatório de Projetos Integradores (OPI) — SENAC Pernambuco · Versão 2.0 · 2026</p>

          <div className="space-y-8 text-sm leading-relaxed text-gray-700">

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>1. Aceitação dos Termos</h3>
              <p>Ao acessar e utilizar a plataforma OPI, você declara ter lido, compreendido e concordado integralmente com os presentes Termos de Uso. Caso não concorde com qualquer disposição, você deve abster-se de utilizar o sistema. O uso continuado da plataforma implica aceitação tácita de eventuais atualizações destes termos, que serão comunicadas pelo Coordenador responsável.</p>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>2. Sobre a Plataforma</h3>
              <p>O OPI é um sistema web institucional desenvolvido pelo curso de Análise e Desenvolvimento de Sistemas do SENAC Pernambuco. Seu propósito é centralizar a submissão, avaliação e portfólio dos Projetos Integradores. O sistema oferece: gestão de projetos com controle de versão, avaliação por rubrica, feed social, chat em tempo real com suporte a arquivos, videochamada WebRTC e portfólio público para empresas parceiras.</p>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>3. Credenciais de Acesso</h3>
              <p className="mb-2">As credenciais de acesso (e-mail e senha) são pessoais e intransferíveis. O usuário é responsável por manter o sigilo de sua senha e por todas as ações realizadas em sua conta.</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>É expressamente proibido compartilhar credenciais com terceiros;</li>
                <li>Em caso de suspeita de uso indevido, o usuário deve comunicar imediatamente o Coordenador;</li>
                <li>O Coordenador é o único perfil autorizado a criar, editar e desativar contas;</li>
                <li>A recuperação de senha é realizada exclusivamente pelo Coordenador mediante solicitação.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>4. Termos por Perfil de Usuário</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#E87722' }}>4.1 Aluno</h4>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>O aluno é responsável pela veracidade e originalidade das informações submetidas nos projetos;</li>
                    <li>Projetos podem ser editados ou excluídos apenas enquanto o status for <strong>Pendente</strong>;</li>
                    <li>A visibilidade de projetos inclui todos os projetos dos quais o aluno é membro, não apenas os que criou;</li>
                    <li>A publicação de projetos no Feed Social é opcional e pode ser realizada por qualquer membro do grupo;</li>
                    <li>O aluno pode configurar seu perfil com foto, sobre mim, hard skills e soft skills;</li>
                    <li>O uso do chat e da videochamada é restrito aos membros do grupo vinculado ao projeto;</li>
                    <li>É vedado o envio de conteúdo ofensivo, discriminatório ou que viole direitos de terceiros;</li>
                    <li>O aluno pode estar vinculado a até três cursos (ADS, Design, Gastronomia), com uma turma por curso.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#E87722' }}>4.2 Professor</h4>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>O professor deve utilizar a plataforma exclusivamente para fins acadêmicos e institucionais;</li>
                    <li>As avaliações devem seguir os critérios definidos pela rubrica institucional;</li>
                    <li>O professor só pode avaliar projetos de turmas às quais está vinculado pelo Coordenador;</li>
                    <li>A revisão de uma avaliação já registrada é permitida; o sistema mantém o histórico completo;</li>
                    <li>Feedbacks e comentários devem manter postura ética, respeitosa e profissional;</li>
                    <li>O professor não possui autorização para criar, editar ou desativar contas de usuários.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#E87722' }}>4.3 Coordenador / Administrador</h4>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>O Coordenador possui acesso administrativo completo e é o único perfil com permissão para gerenciar contas;</li>
                    <li>Pode criar e gerenciar turmas, grupos e projetos, além de avaliar e reverter avaliações;</li>
                    <li>A exclusão definitiva de um usuário remove automaticamente os projetos e grupos criados — ação irreversível;</li>
                    <li>O Coordenador deve garantir conformidade com a LGPD em todas as operações de gestão de usuários.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#E87722' }}>4.4 Empresa Parceira</h4>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Acesso restrito ao portfólio público e à aba de alunos;</li>
                    <li>Somente projetos com status <strong>Avaliado</strong> são visíveis para empresas;</li>
                    <li>As informações dos alunos estão sujeitas ao consentimento individual de cada aluno (LGPD);</li>
                    <li>É expressamente proibido utilizar informações obtidas para fins ilegais ou discriminatórios;</li>
                    <li>A empresa não possui acesso a avaliações internas ou projetos em andamento.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>5. Uso do Chat e Videochamada</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>O acesso ao chat e à videochamada é autenticado via token JWT e restrito a membros do grupo;</li>
                <li>Mensagens e arquivos enviados no chat ficam armazenados no histórico do canal de grupo;</li>
                <li>A videochamada é realizada diretamente entre os navegadores dos participantes (WebRTC); o servidor processa apenas a sinalização;</li>
                <li>Gravação ou captura do conteúdo das chamadas sem autorização de todos os participantes é vedada.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>6. Propriedade Intelectual</h3>
              <p>Os projetos submetidos são de propriedade intelectual dos seus respectivos autores. O SENAC e a equipe de desenvolvimento do OPI não reivindicam qualquer direito sobre o conteúdo dos projetos integradores. O sistema OPI em si é de autoria da equipe de desenvolvimento do curso de ADS do SENAC Pernambuco.</p>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>7. Limitação de Responsabilidade</h3>
              <p>O OPI é um sistema acadêmico em desenvolvimento contínuo. A equipe responsável não se responsabiliza por eventuais indisponibilidades ou falhas técnicas decorrentes de fatores externos. O sistema é disponibilizado para fins educacionais e institucionais.</p>
            </section>

            <section>
              <h3 className="text-base font-bold mb-3" style={{ color: '#1B3A6B' }}>8. Contato e Suporte</h3>
              <p>Dúvidas, solicitações de exclusão de dados ou relatos de uso indevido devem ser encaminhados ao Coordenador responsável pela turma.</p>
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
