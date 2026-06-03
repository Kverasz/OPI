import { useState, useEffect } from 'react';
import { api } from '../api';
import { BookOpen, LogOut, Filter, Eye, Edit2, Award, Calendar, User, FileText, CheckCircle, X, GraduationCap, AlertCircle } from 'lucide-react';
import { SenacLogo } from './SenacLogo';

type Conceito = 'Insuficiente' | 'Ainda não suficiente' | 'Bom' | 'Ótimo' | 'Excelente';

interface Criterio {
  id: string;
  nome: string;
  descricao: string;
  peso: number;
}

interface AvaliacaoRubrica {
  criterioId: string;
  criterioNome?: string;
  criterioDescricao?: string;
  conceito: Conceito;
  observacao: string;
}

interface Avaliacao {
  id: number;
  projetoId: number;
  professorNome: string;
  data: string;
  conceitoFinal: Conceito;
  feedbackGeral: string;
  rubricas: AvaliacaoRubrica[];
  rubricaAssinatura: string;
}

interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  turma: string;
  curso: string;
  membros: string;
  tecnologias: string;
  status: 'Pendente' | 'Em Avaliação' | 'Avaliado';
  dataSubmissao: string;
  linkGithub?: string;
  linkProjeto?: string;
  linkDocumentacao?: string;
  linkVideo?: string;
  avaliacao?: Avaliacao;
}

interface ProfessorPanelProps {
  onLogout: () => void;
  professorNome: string;
}

const conceitoDisplayMap: Record<string, Conceito> = {
  EXCELENTE: 'Excelente',
  OTIMO: 'Ótimo',
  BOM: 'Bom',
  AINDA_NAO_SUFICIENTE: 'Ainda não suficiente',
  INSUFICIENTE: 'Insuficiente',
};

function getCursoDaTurma(nome: string): string {
  const n = nome.toUpperCase();
  if (n.startsWith('ADS')) return 'Análise e Desenvolvimento de Sistemas';
  if (n.startsWith('DESIGN')) return 'Design';
  if (n.startsWith('GASTRO')) return 'Gastronomia';
  return '';
}

function mapearProjeto(p: any): Projeto {
  const turma = p.turma?.nome || '';
  const conceitoRaw = p.conceito;
  const conceitoDisplay = conceitoRaw ? (conceitoDisplayMap[conceitoRaw] || conceitoRaw as Conceito) : undefined;
  return {
    id: p.id,
    titulo: p.titulo,
    descricao: p.descricao,
    turma,
    curso: getCursoDaTurma(turma),
    membros: p.membros_detalhe?.map((m: any) => m.usuario?.nome).join(', ') || '',
    tecnologias: p.tecnologias?.map((t: any) => t.tecnologia).join(', ') || '',
    status: p.status === 'PENDENTE' ? 'Pendente' : p.status === 'EM_AVALIACAO' ? 'Em Avaliação' : 'Avaliado',
    dataSubmissao: p.criado_em?.split('T')[0] || '',
    linkGithub: p.link_repositorio || '',
    linkProjeto: p.link_demo || '',
    avaliacao: conceitoDisplay ? {
      id: 0,
      projetoId: p.id,
      professorNome: p.avaliador_nome || '',
      data: p.avaliado_em || '',
      conceitoFinal: conceitoDisplay,
      feedbackGeral: p.feedback_geral || '',
      rubricas: (p.rubricas_avaliacao || []).map((r: any) => ({
        criterioId: r.criterio_id,
        criterioNome: r.criterio_nome || '',
        criterioDescricao: r.criterio_descricao || '',
        conceito: conceitoDisplayMap[r.conceito] || r.conceito as Conceito,
        observacao: r.comentario || '',
      })),
      rubricaAssinatura: p.rubrica_assinatura || '',
    } : undefined,
  };
}

export function ProfessorPanel({ onLogout, professorNome }: ProfessorPanelProps) {
  const [turmaFilter, setTurmaFilter] = useState('Todas as Turmas');
  const [statusFilter, setStatusFilter] = useState('Todos os Status');
  const [viewingProject, setViewingProject] = useState<Projeto | null>(null);
  const [evaluatingProject, setEvaluatingProject] = useState<Projeto | null>(null);

  // Critérios de avaliação por rubrica
  const criterios: Criterio[] = [
    {
      id: 'funcionalidade',
      nome: 'Funcionalidade',
      descricao: 'O sistema atende aos requisitos e funciona corretamente',
      peso: 25
    },
    {
      id: 'codigo',
      nome: 'Qualidade do Código',
      descricao: 'Organização, boas práticas, legibilidade e documentação',
      peso: 25
    },
    {
      id: 'interface',
      nome: 'Interface e Usabilidade',
      descricao: 'Design, experiência do usuário e acessibilidade',
      peso: 20
    },
    {
      id: 'inovacao',
      nome: 'Inovação e Criatividade',
      descricao: 'Soluções criativas e diferenciais do projeto',
      peso: 15
    },
    {
      id: 'documentacao',
      nome: 'Documentação',
      descricao: 'Completude e clareza da documentação técnica',
      peso: 15
    }
  ];

  const [projetos, setProjetos] = useState<Projeto[]>([]);

  useEffect(() => {
    api.listarProjetos().then((data: any) => {
      const lista = data.results || data;
      if (Array.isArray(lista)) {
        setProjetos(lista.map((p: any) => mapearProjeto(p)));
      }
    });
  }, []);

  const [avaliacaoForm, setAvaliacaoForm] = useState<{
    rubricas: AvaliacaoRubrica[];
    feedbackGeral: string;
    rubricaAssinatura: string;
  }>({
    rubricas: criterios.map(c => ({
      criterioId: c.id,
      conceito: 'Bom' as Conceito,
      observacao: ''
    })),
    feedbackGeral: '',
    rubricaAssinatura: ''
  });

  const turmas = Array.from(new Set(projetos.map(p => p.turma)));

  const filteredProjetos = projetos.filter(p => {
    const matchTurma = turmaFilter === 'Todas as Turmas' || p.turma === turmaFilter;
    const matchStatus = statusFilter === 'Todos os Status' || p.status === statusFilter;
    return matchTurma && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return '#FF6B00';
      case 'Em Avaliação':
        return '#FFA500';
      case 'Avaliado':
        return '#28A745';
      default:
        return '#6C757D';
    }
  };

  const getConceitoColor = (conceito: Conceito) => {
    switch (conceito) {
      case 'Excelente':
        return '#28A745';
      case 'Ótimo':
        return '#5CB85C';
      case 'Bom':
        return '#5BC0DE';
      case 'Ainda não suficiente':
        return '#F0AD4E';
      case 'Insuficiente':
        return '#D9534F';
      default:
        return '#6C757D';
    }
  };

  const getConceitoNumerico = (conceito: Conceito): number => {
    switch (conceito) {
      case 'Excelente': return 10;
      case 'Ótimo': return 8.5;
      case 'Bom': return 7;
      case 'Ainda não suficiente': return 5;
      case 'Insuficiente': return 3;
      default: return 0;
    }
  };

  const calcularConceitoFinal = (): Conceito => {
    let somaNotas = 0;
    let somaPesos = 0;

    avaliacaoForm.rubricas.forEach(rubrica => {
      const criterio = criterios.find(c => c.id === rubrica.criterioId);
      if (criterio) {
        somaNotas += getConceitoNumerico(rubrica.conceito) * criterio.peso;
        somaPesos += criterio.peso;
      }
    });

    const media = somaNotas / somaPesos;

    if (media >= 9) return 'Excelente';
    if (media >= 8) return 'Ótimo';
    if (media >= 6) return 'Bom';
    if (media >= 4) return 'Ainda não suficiente';
    return 'Insuficiente';
  };

  const handleAvaliar = async (projeto: Projeto) => {
    // Marca como "Em Avaliação" no banco (reserva para este professor)
    if (projeto.status === 'Pendente') {
      const res = await api.iniciarAvaliacao(projeto.id);
      if (res.detail && res.detail.includes('outro professor')) {
        alert(res.detail);
        return;
      }
      // Atualiza o status localmente
      setProjetos(prev => prev.map(p =>
        p.id === projeto.id ? { ...p, status: 'Em Avaliação' as const } : p
      ));
    }

    setEvaluatingProject(projeto);

    if (projeto.avaliacao && projeto.avaliacao.rubricas.length > 0) {
      // Revisão: mapeia rubricas existentes para os critérios locais por posição
      setAvaliacaoForm({
        rubricas: criterios.map((c, index) => {
          const existing = projeto.avaliacao!.rubricas[index];
          return {
            criterioId: c.id,
            conceito: existing?.conceito ?? ('Bom' as Conceito),
            observacao: existing?.observacao ?? '',
          };
        }),
        feedbackGeral: projeto.avaliacao.feedbackGeral,
        rubricaAssinatura: projeto.avaliacao.rubricaAssinatura,
      });
    } else {
      setAvaliacaoForm({
        rubricas: criterios.map(c => ({
          criterioId: c.id,
          conceito: 'Bom' as Conceito,
          observacao: ''
        })),
        feedbackGeral: projeto.avaliacao?.feedbackGeral ?? '',
        rubricaAssinatura: projeto.avaliacao?.rubricaAssinatura ?? '',
      });
    }
  };

  const handleSubmitAvaliacao = async () => {
    if (!evaluatingProject) return;

    const conceitoFinal = calcularConceitoFinal();

    // Busca os critérios reais do banco
    const criteriosData = await api.listarCriterios();
    const criteriosList = criteriosData.results || criteriosData;

    // Monta os critérios no formato da API
    const criteriosPayload = avaliacaoForm.rubricas.map((rubrica, index) => {
      const criterioReal = criteriosList[index];
      const conceitoMap: Record<string, string> = {
        'Insuficiente': 'INSUFICIENTE',
        'Ainda não suficiente': 'AINDA_NAO_SUFICIENTE',
        'Bom': 'BOM',
        'Ótimo': 'OTIMO',
        'Excelente': 'EXCELENTE'
      };
      return {
        criterio_id: criterioReal?.id || index + 1,
        conceito: conceitoMap[rubrica.conceito] || 'BOM',
        comentario: rubrica.observacao
      };
    });

    const conceitoMap: Record<string, string> = {
      'Insuficiente': 'INSUFICIENTE',
      'Ainda não suficiente': 'AINDA_NAO_SUFICIENTE',
      'Bom': 'BOM',
      'Ótimo': 'OTIMO',
      'Excelente': 'EXCELENTE'
    };

    const resultado = await api.criarAvaliacao({
      projeto: evaluatingProject.id,
      conceito: conceitoMap[conceitoFinal],
      feedback_geral: avaliacaoForm.feedbackGeral,
      rubrica_assinatura: avaliacaoForm.rubricaAssinatura,
      criterios: criteriosPayload
    });

    if (resultado?.__status >= 400) {
      alert('Erro ao salvar avaliação (' + resultado.__status + '):\n' + JSON.stringify(resultado, null, 2));
      return;
    }

    // Atualiza a lista de projetos
    const data = await api.listarProjetos();
    const lista = data.results || data;
    if (Array.isArray(lista)) {
      const novos = lista.map((p: any) => mapearProjeto(p));
      setProjetos(novos);
      // Atualiza o modal de detalhes se estiver aberto para este projeto
      if (viewingProject?.id === evaluatingProject.id) {
        const atualizado = novos.find(p => p.id === evaluatingProject.id);
        if (atualizado) setViewingProject(atualizado);
      }
    }

    setEvaluatingProject(null);
    setAvaliacaoForm({
      rubricas: criterios.map(c => ({
        criterioId: c.id,
        conceito: 'Bom' as Conceito,
        observacao: ''
      })),
      feedbackGeral: '',
      rubricaAssinatura: ''
    });
  };

  const updateRubrica = (criterioId: string, field: 'conceito' | 'observacao', value: string) => {
    setAvaliacaoForm({
      ...avaliacaoForm,
      rubricas: avaliacaoForm.rubricas.map(r =>
        r.criterioId === criterioId
          ? { ...r, [field]: value }
          : r
      )
    });
  };

  const projetosPendentes = projetos.filter(p => p.status === 'Pendente').length;
  const projetosEmAvaliacao = projetos.filter(p => p.status === 'Em Avaliação').length;
  const projetosAvaliados = projetos.filter(p => p.status === 'Avaliado').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <SenacLogo className="h-8 md:h-12" />
              <div className="border-l-2 pl-3 md:pl-4" style={{ borderColor: '#FF6B00' }}>
                <h1 className="text-lg md:text-xl font-bold" style={{ color: '#003D7A' }}>
                  Painel do Professor
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Avaliação de Projetos Integradores</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-right">
                <p className="text-xs md:text-sm font-medium" style={{ color: '#003D7A' }}>{professorNome}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Professor</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-white rounded-lg hover:opacity-90 transition-all text-sm md:text-base"
                style={{ backgroundColor: '#003D7A' }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF4ED' }}>
                <BookOpen className="w-6 h-6" style={{ color: '#FF6B00' }} />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#FF6B00' }}>{projetosPendentes}</p>
            <p className="text-sm text-muted-foreground">Projetos Pendentes</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF9E6' }}>
                <Edit2 className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-yellow-600">{projetosEmAvaliacao}</p>
            <p className="text-sm text-muted-foreground">Em Avaliação</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
                <Award className="w-6 h-6" style={{ color: '#28A745' }} />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#28A745' }}>{projetosAvaliados}</p>
            <p className="text-sm text-muted-foreground">Projetos Avaliados</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <h2 className="mb-4" style={{ color: '#003D7A' }}>Projetos para Avaliação</h2>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-border flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <select
                value={turmaFilter}
                onChange={(e) => setTurmaFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 bg-white"
                style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}
              >
                <option value="Todas as Turmas">Todas as Turmas</option>
                {turmas.map(turma => (
                  <option key={turma} value={turma}>{turma}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 bg-white"
                style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}
              >
                <option value="Todos os Status">Todos os Status</option>
                <option value="Pendente">Pendente</option>
                <option value="Em Avaliação">Em Avaliação</option>
                <option value="Avaliado">Avaliado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Projetos */}
        <div className="grid grid-cols-1 gap-6">
          {filteredProjetos.map((projeto) => (
            <div
              key={projeto.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="mb-2" style={{ color: '#003D7A' }}>{projeto.titulo}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
                        style={{ backgroundColor: getStatusColor(projeto.status) }}
                      >
                        {projeto.status}
                      </span>
                      {projeto.avaliacao && (
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
                          style={{ backgroundColor: getConceitoColor(projeto.avaliacao.conceitoFinal) }}
                        >
                          {projeto.avaliacao.conceitoFinal}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{projeto.descricao}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {projeto.curso && <span><strong>Curso:</strong> {projeto.curso === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : projeto.curso}</span>}
                    <span><strong>Turma:</strong> {projeto.turma}</span>
                    <span><strong>Membros:</strong> {projeto.membros}</span>
                    <span><strong>Data:</strong> {projeto.dataSubmissao.split('-').reverse().join('/')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewingProject(projeto)}
                  className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg hover:bg-gray-50 transition-all"
                  style={{ color: '#003D7A', borderColor: '#003D7A' }}
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalhes
                </button>
                {projeto.status === 'Avaliado' ? (
                  <button
                    onClick={() => handleAvaliar(projeto)}
                    className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg hover:bg-gray-50 transition-all"
                    style={{ color: '#FF6B00', borderColor: '#FF6B00' }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Revisar Avaliação
                  </button>
                ) : (
                  <button
                    onClick={() => handleAvaliar(projeto)}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#FF6B00' }}
                  >
                    <Award className="w-4 h-4" />
                    Avaliar Projeto
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProjetos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-border">
            <Filter className="w-16 h-16 mx-auto mb-4" style={{ color: '#003D7A', opacity: 0.5 }} />
            <h3 className="mb-2" style={{ color: '#003D7A' }}>Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground">Ajuste os filtros para ver mais resultados</p>
          </div>
        )}

        {/* Modal de Visualização */}
        {viewingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 style={{ color: '#003D7A' }}>{viewingProject.titulo}</h3>
                <button
                  onClick={() => setViewingProject(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-sm text-white"
                    style={{ backgroundColor: getStatusColor(viewingProject.status) }}
                  >
                    {viewingProject.status}
                  </span>
                  {viewingProject.avaliacao && (
                    <span
                      className="px-3 py-1 rounded-full text-sm text-white"
                      style={{ backgroundColor: getConceitoColor(viewingProject.avaliacao.conceitoFinal) }}
                    >
                      {viewingProject.avaliacao.conceitoFinal}
                    </span>
                  )}
                </div>

                <div>
                  <label className="font-medium" style={{ color: '#003D7A' }}>Descrição</label>
                  <p className="text-muted-foreground mt-1">{viewingProject.descricao}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {viewingProject.curso && (
                    <div>
                      <label className="font-medium" style={{ color: '#003D7A' }}>Curso</label>
                      <p className="text-muted-foreground mt-1">{viewingProject.curso}</p>
                    </div>
                  )}
                  <div>
                    <label className="font-medium" style={{ color: '#003D7A' }}>Turma</label>
                    <p className="text-muted-foreground mt-1">{viewingProject.turma}</p>
                  </div>
                </div>

                <div>
                  <label className="font-medium" style={{ color: '#003D7A' }}>Membros</label>
                  <p className="text-muted-foreground mt-1">{viewingProject.membros}</p>
                </div>

                <div>
                  <label className="font-medium" style={{ color: '#003D7A' }}>Tecnologias</label>
                  <p className="text-muted-foreground mt-1">{viewingProject.tecnologias}</p>
                </div>

                {(viewingProject.linkGithub || viewingProject.linkProjeto || viewingProject.linkDocumentacao || viewingProject.linkVideo) && (
                  <div className="pt-4 border-t border-border">
                    <label className="font-medium mb-3 block" style={{ color: '#003D7A' }}>Links do Projeto</label>
                    <div className="space-y-2">
                      {viewingProject.linkGithub && (
                        <a
                          href={viewingProject.linkGithub}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:underline"
                          style={{ color: '#003D7A' }}
                        >
                          <BookOpen className="w-4 h-4" />
                          Repositório GitHub
                        </a>
                      )}
                      {viewingProject.linkProjeto && (
                        <a
                          href={viewingProject.linkProjeto}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:underline"
                          style={{ color: '#003D7A' }}
                        >
                          <Eye className="w-4 h-4" />
                          Projeto Funcionando
                        </a>
                      )}
                      {viewingProject.linkDocumentacao && (
                        <a
                          href={viewingProject.linkDocumentacao}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:underline"
                          style={{ color: '#003D7A' }}
                        >
                          <FileText className="w-4 h-4" />
                          Documentação
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {viewingProject.avaliacao && (
                  <div className="pt-6 border-t-2 border-border">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: '#003D7A' }}>
                      <Award className="w-5 h-5" />
                      Avaliação por Rubrica
                    </h4>

                    <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#F9FAFB', border: '2px solid #E5E7EB' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm"><strong>Professor Avaliador:</strong> {viewingProject.avaliacao.professorNome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm"><strong>Data da Avaliação:</strong> {viewingProject.avaliacao.data ? viewingProject.avaliacao.data.split('T')[0].split('-').reverse().join('/') : '—'}</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <h5 className="font-bold text-sm flex items-center gap-2" style={{ color: '#003D7A' }}>
                        <FileText className="w-4 h-4" />
                        Critérios Avaliados:
                      </h5>
                      {viewingProject.avaliacao.rubricas.map(rubrica => (
                          <div key={rubrica.criterioId} className="p-4 rounded-xl border-2" style={{ backgroundColor: '#FAFAFA', borderColor: '#E5E7EB' }}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <span className="font-bold text-sm" style={{ color: '#003D7A' }}>{rubrica.criterioNome}</span>
                                {rubrica.criterioDescricao && <p className="text-xs text-muted-foreground italic mt-1">{rubrica.criterioDescricao}</p>}
                              </div>
                              <span
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm ml-2"
                                style={{ backgroundColor: getConceitoColor(rubrica.conceito) }}
                              >
                                {rubrica.conceito}
                              </span>
                            </div>
                            {rubrica.observacao && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-xs font-medium mb-1" style={{ color: '#003D7A' }}>Observação:</p>
                                <p className="text-xs text-muted-foreground">{rubrica.observacao}</p>
                              </div>
                            )}
                          </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#E6F2FF', border: '2px solid #003D7A' }}>
                      <label className="font-bold text-sm block mb-2 flex items-center gap-2" style={{ color: '#003D7A' }}>
                        <FileText className="w-4 h-4" />
                        Feedback Geral do Professor:
                      </label>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {viewingProject.avaliacao.feedbackGeral}
                      </p>
                    </div>

                    <div className="p-6 rounded-xl border-2 mt-6" style={{ backgroundColor: '#FFFBF0', borderColor: '#FF6B00' }}>
                      <label className="font-bold text-sm block mb-3 flex items-center gap-2" style={{ color: '#003D7A' }}>
                        <Edit2 className="w-4 h-4" />
                        Rubrica (Assinatura):
                      </label>
                      <div className="p-4 rounded-lg bg-white border-2 border-dashed" style={{ borderColor: '#FF6B00' }}>
                        <p className="text-2xl text-center" style={{
                          fontFamily: 'cursive',
                          fontStyle: 'italic',
                          color: '#003D7A'
                        }}>
                          {viewingProject.avaliacao.rubricaAssinatura}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Avaliação autenticada em {new Date(viewingProject.avaliacao.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setViewingProject(null)}
                className="w-full mt-6 py-3 text-white rounded-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: '#003D7A' }}
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Modal de Avaliação */}
        {evaluatingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                  <h3 style={{ color: '#003D7A' }}>Avaliar Projeto</h3>
                  <p className="text-sm text-muted-foreground mt-1">{evaluatingProject.titulo}</p>
                </div>
                <button
                  onClick={() => setEvaluatingProject(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 p-6 rounded-xl" style={{ background: 'linear-gradient(to right, #E6F2FF, #F0F9FF)', border: '2px solid #003D7A' }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#003D7A' }}>
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1" style={{ color: '#003D7A' }}>Avaliação por Rubrica</h4>
                    <p className="text-sm text-muted-foreground">
                      Sistema de avaliação estruturado por critérios com pesos definidos. Avalie cada critério individualmente e o conceito final será calculado automaticamente.
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-white border border-border">
                  <p className="text-xs font-medium mb-2" style={{ color: '#003D7A' }}>📋 Critérios de Avaliação:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {criterios.map(c => (
                      <div key={c.id} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FF6B00' }}></div>
                        <span className="text-muted-foreground">{c.nome} ({c.peso}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold text-lg mb-4" style={{ color: '#003D7A' }}>Critérios de Avaliação</h4>
              </div>

              <div className="space-y-6">
                {criterios.map((criterio) => {
                  const rubrica = avaliacaoForm.rubricas.find(r => r.criterioId === criterio.id);
                  return (
                    <div key={criterio.id} className="p-5 rounded-xl border-2 shadow-sm hover:shadow-md transition-all" style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' }}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h4 className="font-bold text-base md:text-lg" style={{ color: '#003D7A' }}>
                              {criterio.nome}
                            </h4>
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap inline-block" style={{ backgroundColor: '#FF6B00' }}>
                              Peso: {criterio.peso}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground italic">{criterio.descricao}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium mb-3" style={{ color: '#003D7A' }}>
                          Conceito para este Critério:
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          {(['Insuficiente', 'Ainda não suficiente', 'Bom', 'Ótimo', 'Excelente'] as Conceito[]).map(conceito => (
                            <button
                              key={conceito}
                              type="button"
                              onClick={() => updateRubrica(criterio.id, 'conceito', conceito)}
                              className={`px-3 py-4 rounded-lg text-xs md:text-sm font-bold transition-all border-2 min-h-[60px] flex items-center justify-center text-center leading-tight ${
                                rubrica?.conceito === conceito
                                  ? 'text-white shadow-lg transform scale-105'
                                  : 'bg-white hover:bg-gray-50 border-gray-300'
                              }`}
                              style={
                                rubrica?.conceito === conceito
                                  ? { backgroundColor: getConceitoColor(conceito), borderColor: getConceitoColor(conceito) }
                                  : {}
                              }
                            >
                              {conceito}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: '#003D7A' }}>
                          Observações sobre este Critério (opcional):
                        </label>
                        <textarea
                          value={rubrica?.observacao || ''}
                          onChange={(e) => updateRubrica(criterio.id, 'observacao', e.target.value)}
                          placeholder="Adicione comentários específicos sobre o desempenho neste critério..."
                          className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:ring-2 text-sm bg-white"
                          style={{ borderColor: 'var(--color-border)' }}
                          rows={3}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="p-4 md:p-6 rounded-xl" style={{ background: 'linear-gradient(to right, #E8F5E9, #F1F8E9)', border: '3px solid #28A745' }}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#28A745' }}>
                        <Award className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base md:text-lg" style={{ color: '#28A745' }}>Conceito Final Calculado</h4>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                          Baseado na média ponderada de todos os critérios avaliados
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-6 py-3 md:px-8 md:py-4 rounded-xl text-base md:text-xl font-bold text-white shadow-lg flex-shrink-0 self-center"
                      style={{ backgroundColor: getConceitoColor(calcularConceitoFinal()) }}
                    >
                      {calcularConceitoFinal()}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-border">
                  <label className="block mb-3 font-bold text-lg" style={{ color: '#003D7A' }}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Feedback Geral para o Aluno
                    </div>
                  </label>
                  <textarea
                    value={avaliacaoForm.feedbackGeral}
                    onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, feedbackGeral: e.target.value })}
                    placeholder="Escreva um feedback detalhado sobre o projeto, destacando pontos positivos e áreas de melhoria. Este feedback será visível para o aluno e deve ser construtivo..."
                    className="w-full px-4 py-4 border-2 rounded-lg outline-none focus:ring-2 min-h-[140px] text-sm"
                    style={{ borderColor: 'var(--color-border)' }}
                    required
                  />
                  <div className="flex items-start gap-2 mt-2 p-3 rounded-lg" style={{ backgroundColor: '#FFF4ED' }}>
                    <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#FF6B00' }} />
                    <p className="text-xs text-muted-foreground">
                      <strong>Importante:</strong> Este feedback será visível para o aluno. Seja claro, específico e construtivo nas suas observações.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-xl border-2" style={{ backgroundColor: '#FFFBF0', borderColor: '#FF6B00' }}>
                  <label className="block mb-3 font-bold text-lg flex items-center gap-2" style={{ color: '#003D7A' }}>
                    <Edit2 className="w-5 h-5" />
                    Rubrica (Assinatura) do Professor
                  </label>
                  <input
                    type="text"
                    value={avaliacaoForm.rubricaAssinatura}
                    onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, rubricaAssinatura: e.target.value })}
                    placeholder="Digite sua assinatura (ex: Prof. Carlos Mendes)"
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:ring-2 text-lg"
                    style={{
                      borderColor: 'var(--color-border)',
                      fontFamily: 'cursive',
                      fontStyle: 'italic'
                    }}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2 flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 mt-0.5" />
                    Esta rubrica autentica e valida sua avaliação do projeto.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-border">
                  <button
                    onClick={handleSubmitAvaliacao}
                    disabled={!avaliacaoForm.feedbackGeral.trim()}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#28A745' }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirmar Avaliação
                  </button>
                  <button
                    onClick={() => setEvaluatingProject(null)}
                    className="w-full sm:flex-1 px-4 py-3.5 border-2 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
                    style={{ color: '#003D7A', borderColor: '#003D7A' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
