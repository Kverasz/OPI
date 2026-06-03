import { useState, useEffect } from 'react';
import { api } from '../api';
import { Users, Building2, GraduationCap, BookOpen, Plus, Edit, Trash2, X, LogOut, BarChart3, TrendingUp, Award, AlertCircle, Eye, FolderOpen } from 'lucide-react';
import { SenacLogo } from './SenacLogo';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  tipo: 'aluno' | 'professor' | 'empresa' | 'coordenador';
  turma?: string;
  turmaId?: number;
  turmaIds?: number[];
  curso?: string;
}

interface Grupo {
  id: number;
  nome: string;
  descricao: string;
  turma: { id: number; nome: string };
  membros: { id: number; nome: string; email: string }[];
  cor: string;
  criado_em: string;
}

interface AvaliacaoRubrica {
  criterioNome: string;
  criterioDescricao: string;
  conceito: string;
  observacao: string;
}

interface AvaliacaoDetalhes {
  professorNome: string;
  data: string;
  rubricaAssinatura: string;
  rubricas: AvaliacaoRubrica[];
}

interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  turma: string;
  membros: string;
  tecnologias: string;
  status: 'Pendente' | 'Em Avaliação' | 'Avaliado';
  dataSubmissao: string;
  conceito?: string;
  feedback?: string;
  autor: string;
  grupoId: number;
  linkGithub?: string;
  linkProjeto?: string;
  linkDocumentacao?: string;
  linkVideo?: string;
  avaliacaoDetalhes?: AvaliacaoDetalhes;
}

interface CoordenadorPanelProps {
  onLogout: () => void;
  coordenadorNome: string;
}

const conceitoDisplay: Record<string, string> = {
  EXCELENTE: 'Excelente',
  OTIMO: 'Ótimo',
  BOM: 'Bom',
  AINDA_NAO_SUFICIENTE: 'Ainda não suficiente',
  INSUFICIENTE: 'Insuficiente',
};

export function CoordenadorPanel({ onLogout, coordenadorNome }: CoordenadorPanelProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'usuarios' | 'projetos' | 'grupos' | 'turmas'>('dashboard');
  const [userTypeFilter, setUserTypeFilter] = useState<'todos' | 'aluno' | 'professor' | 'empresa' | 'coordenador'>('todos');
  const [buscaUsuario, setBuscaUsuario] = useState('');
  const [filtroUsuarioCurso, setFiltroUsuarioCurso] = useState('');
  const [filtroUsuarioTurmaId, setFiltroUsuarioTurmaId] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Projeto | null>(null);
  const [viewingProject, setViewingProject] = useState<Projeto | null>(null);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<{ id: number; nome: string; turno?: string; ano?: number; semestre?: number }[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [showGrupoForm, setShowGrupoForm] = useState(false);
  const [filtroTurmaGrupo, setFiltroTurmaGrupo] = useState('');
  const [cursoGrupo, setCursoGrupo] = useState('');
  const [filtroGrupoCurso, setFiltroGrupoCurso] = useState('Todos');
  const [filtroGrupoTurmaId, setFiltroGrupoTurmaId] = useState(0);
  const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null);
  const [grupoFormData, setGrupoFormData] = useState({
    nome: '',
    descricao: '',
    turma_id: 0,
    membros_ids: [] as number[],
    cor: '#003D7A'
  });

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projectStatusFilter, setProjectStatusFilter] = useState('Todos os Status');
  const [projectTurmaFilter, setProjectTurmaFilter] = useState('Todas as Turmas');

  const [showTurmaForm, setShowTurmaForm] = useState(false);
  const [filtroTurmaCurso, setFiltroTurmaCurso] = useState('Todos');
  const [turmaFormData, setTurmaFormData] = useState({
    nome: '',
    codigo: '',
    turno: 'MANHA',
    ano: new Date().getFullYear(),
    semestre: 1
  });

  useEffect(() => {
    api.listarUsuarios().then((data: any) => {
      const lista = data.results || data;
      if (Array.isArray(lista)) {
        setUsuarios(lista.map((u: any) => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          senha: '••••••',
          tipo: u.perfil.toLowerCase() as 'aluno' | 'professor' | 'empresa' | 'coordenador',
          turma: u.turmas?.[0]?.nome || '',
          turmaId: u.turmas?.[0]?.id || 0,
          turmaIds: u.turmas?.map((t: any) => t.id) || [],
          curso: u.curso || ''
        })));
      }
    });

    api.listarTurmas().then((data: any) => {
      const lista = data.results || data;
      if (Array.isArray(lista)) setTurmasDisponiveis(lista.map((t: any) => ({ id: t.id, nome: t.nome, turno: t.turno, ano: t.ano, semestre: t.semestre })));
    });

    api.listarProjetos().then((data: any) => {
      const lista = data.results || data;
      if (Array.isArray(lista)) {
        setProjetos(lista.map((p: any) => ({
          id: p.id,
          titulo: p.titulo,
          descricao: p.descricao,
          turma: p.turma?.nome || '',
          membros: p.membros_detalhe?.map((m: any) => m.usuario?.nome).join(', ') || '',
          tecnologias: p.tecnologias?.map((t: any) => t.tecnologia).join(', ') || '',
          status: p.status === 'PENDENTE' ? 'Pendente' : p.status === 'EM_AVALIACAO' ? 'Em Avaliação' : 'Avaliado',
          dataSubmissao: p.criado_em?.split('T')[0] || '',
          conceito: p.conceito ? (conceitoDisplay[p.conceito] || p.conceito) : undefined,
          feedback: p.feedback_geral || undefined,
          avaliacaoDetalhes: p.conceito ? {
            professorNome: p.avaliador_nome || '',
            data: p.avaliado_em || '',
            rubricaAssinatura: p.rubrica_assinatura || '',
            rubricas: (p.rubricas_avaliacao || []).map((r: any) => ({
              criterioNome: r.criterio_nome || '',
              criterioDescricao: r.criterio_descricao || '',
              conceito: conceitoDisplay[r.conceito] || r.conceito || '',
              observacao: r.comentario || '',
            })),
          } : undefined,
          autor: p.criado_por?.nome || '',
          grupoId: p.grupo_id || 0,
          linkGithub: p.link_repositorio || '',
          linkProjeto: p.link_demo || '',
        })));
      }
    });

    api.listarGrupos().then((data: any) => {
      const lista = data.results || data;
      if (Array.isArray(lista)) {
        setGrupos(lista);
      }
    });

    api.listarDashboard().then((data: any) => {
      setDashboardData(data);
    });
  }, []);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'aluno' as 'aluno' | 'professor' | 'empresa' | 'coordenador',
    turmaId: 0,
    turmaIds: [] as number[],
    curso: ''
  });

  const [cursoProjeto, setCursoProjeto] = useState('');
  const [projectFormData, setProjectFormData] = useState({
    titulo: '',
    descricao: '',
    turma: '',
    turmaId: 0,
    membros: '',
    grupoId: 0,
    tecnologias: '',
    status: 'Pendente' as 'Pendente' | 'Em Avaliação' | 'Avaliado',
    autor: '',
    autorId: 0,
    conceito: '',
    feedback: '',
    linkGithub: '',
    linkProjeto: '',
    linkDocumentacao: '',
    linkVideo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const turmaIds = formData.tipo === 'professor'
      ? formData.turmaIds
      : formData.turmaId ? [formData.turmaId] : [];
    if (editingUser) {
      const payload: any = {
        nome: formData.nome,
        email: formData.email,
        perfil: formData.tipo.toUpperCase(),
        curso: formData.curso || null,
        turma_ids: turmaIds,
      };
      await api.editarUsuario(editingUser.id, payload);
    } else {
      const payload: any = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        perfil: formData.tipo.toUpperCase(),
        curso: formData.curso || null,
        turma_ids: turmaIds,
      };
      await api.criarUsuario(payload);
    }
    const data = await api.listarUsuarios();
    const lista = data.results || data;
    if (Array.isArray(lista)) {
      setUsuarios(lista.map((u: any) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        senha: '••••••',
        tipo: u.perfil.toLowerCase() as 'aluno' | 'professor' | 'empresa',
        turma: u.turmas?.[0]?.nome || '',
        turmaId: u.turmas?.[0]?.id || 0,
        turmaIds: u.turmas?.map((t: any) => t.id) || [],
        curso: u.curso || ''
      })));
    }
    setFormData({ nome: '', email: '', senha: '', tipo: 'aluno', turmaId: 0, turmaIds: [], curso: '' });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tecnologiasArr = projectFormData.tecnologias
      .split(',').map(t => t.trim()).filter(Boolean);

    if (editingProject) {
      const statusMap: Record<string, string> = {
        'Pendente': 'PENDENTE',
        'Em Avaliação': 'EM_AVALIACAO',
        'Avaliado': 'AVALIADO',
      };
      const conceitoMap: Record<string, string> = {
        'Excelente': 'EXCELENTE',
        'Ótimo': 'OTIMO',
        'Bom': 'BOM',
        'Ainda não suficiente': 'AINDA_NAO_SUFICIENTE',
        'Insuficiente': 'INSUFICIENTE',
      };
      await api.editarProjeto(editingProject.id, {
        titulo: projectFormData.titulo,
        descricao: projectFormData.descricao,
        turma: projectFormData.turmaId || undefined,
        link_repositorio: projectFormData.linkGithub || null,
        link_demo: projectFormData.linkProjeto || null,
        tecnologias: tecnologiasArr,
        grupo_id: projectFormData.grupoId || null,
        status: statusMap[projectFormData.status] || 'PENDENTE',
        conceito: projectFormData.conceito ? conceitoMap[projectFormData.conceito] || null : null,
        feedback_geral: projectFormData.feedback || null,
      });
      setEditingProject(null);
    } else {
      await api.criarProjeto({
        titulo: projectFormData.titulo,
        descricao: projectFormData.descricao,
        resumo_300: projectFormData.descricao.slice(0, 300),
        area_tematica: cursoProjeto || 'Geral',
        turma: projectFormData.turmaId,
        link_repositorio: projectFormData.linkGithub || null,
        link_demo: projectFormData.linkProjeto || null,
        tecnologias: tecnologiasArr,
        grupo_id: projectFormData.grupoId || null,
      });
    }

    const data = await api.listarProjetos();
    const lista = data.results || data;
    if (Array.isArray(lista)) {
      setProjetos(lista.map((p: any) => ({
        id: p.id,
        titulo: p.titulo,
        descricao: p.descricao,
        turma: p.turma?.nome || '',
        membros: p.membros_detalhe?.map((m: any) => m.usuario?.nome).join(', ') || '',
        tecnologias: p.tecnologias?.map((t: any) => t.tecnologia).join(', ') || '',
        status: p.status === 'PENDENTE' ? 'Pendente' : p.status === 'EM_AVALIACAO' ? 'Em Avaliação' : 'Avaliado',
        dataSubmissao: p.criado_em?.split('T')[0] || '',
        conceito: p.conceito ? (conceitoDisplay[p.conceito] || p.conceito) : undefined,
        feedback: p.feedback_geral || undefined,
        autor: p.criado_por?.nome || '',
        grupoId: p.grupo_id || 0,
        linkGithub: p.link_repositorio || '',
        linkProjeto: p.link_demo || '',
      })));
    }
    api.listarDashboard().then((d: any) => setDashboardData(d));

    setCursoProjeto('');
    setProjectFormData({ titulo: '', descricao: '', turma: '', turmaId: 0, membros: '', grupoId: 0, tecnologias: '', status: 'Pendente', autor: '', autorId: 0, conceito: '', feedback: '', linkGithub: '', linkProjeto: '', linkDocumentacao: '', linkVideo: '' });
    setShowProjectForm(false);
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({ nome: user.nome, email: user.email, senha: user.senha, tipo: user.tipo, turmaId: user.turmaId || 0, turmaIds: user.turmaIds || [], curso: user.curso || '' });
    setShowForm(true);
  };

  const handleEditProject = (project: Projeto) => {
    setEditingProject(project);
    const turmaObj = turmasDisponiveis.find(t => t.nome === project.turma);
    const curso = turmaObj ? getCursoDaTurma(turmaObj.nome) : '';
    setCursoProjeto(curso);
    setProjectFormData({ titulo: project.titulo, descricao: project.descricao, turma: project.turma, turmaId: turmaObj?.id || 0, membros: project.membros, grupoId: project.grupoId, tecnologias: project.tecnologias, status: project.status, autor: project.autor, autorId: 0, conceito: project.conceito || '', feedback: project.feedback || '', linkGithub: project.linkGithub || '', linkProjeto: project.linkProjeto || '', linkDocumentacao: project.linkDocumentacao || '', linkVideo: project.linkVideo || '' });
    setShowProjectForm(true);
  };

  const [redefinindoSenha, setRedefinindoSenha] = useState<Usuario | null>(null);
  const [novaSenha, setNovaSenha] = useState('');

  const handleRedefinirSenha = async () => {
    if (!redefinindoSenha || novaSenha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    await api.redefinirSenha(redefinindoSenha.id, novaSenha);
    setRedefinindoSenha(null);
    setNovaSenha('');
    alert('Senha alterada com sucesso!');
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      await api.deletarUsuario(id);
      setUsuarios(usuarios.filter(u => u.id !== id));
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      const ok = await api.deletarProjeto(id);
      if (ok) {
        setProjetos(projetos.filter(p => p.id !== id));
        api.listarDashboard().then((data: any) => setDashboardData(data));
      }
    }
  };

  const getCursoDaTurma = (nome: string) => {
    const n = nome.toUpperCase();
    if (n.startsWith('ADS')) return 'Análise e Desenvolvimento de Sistemas';
    if (n.startsWith('DESIGN')) return 'Design';
    if (n.startsWith('GASTRO')) return 'Gastronomia';
    return 'Outros';
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'aluno': return '#003D7A';
      case 'professor': return '#FF6B00';
      case 'empresa': return '#5CB85C';
      case 'coordenador': return '#9B59B6';
      default: return '#6C757D';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return '#FF6B00';
      case 'Em Avaliação': return '#FFA500';
      case 'Avaliado': return '#28A745';
      default: return '#6C757D';
    }
  };

  const getConceitoColor = (conceito: string) => {
    switch (conceito) {
      case 'Excelente': return '#28A745';
      case 'Ótimo': return '#5CB85C';
      case 'Bom': return '#5BC0DE';
      case 'Ainda não suficiente': return '#F0AD4E';
      case 'Insuficiente': return '#D9534F';
      default: return '#6C757D';
    }
  };

  const filteredUsuarios = usuarios.filter(u => {
    if (userTypeFilter !== 'todos' && u.tipo !== userTypeFilter) return false;
    if (buscaUsuario.trim()) {
      const q = buscaUsuario.toLowerCase();
      if (!u.nome.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    if (filtroUsuarioCurso && u.curso !== filtroUsuarioCurso) return false;
    if (filtroUsuarioTurmaId && u.turmaId !== filtroUsuarioTurmaId) return false;
    return true;
  });
  const totalAlunos = usuarios.filter(u => u.tipo === 'aluno').length;
  const totalProfessores = usuarios.filter(u => u.tipo === 'professor').length;
  const totalEmpresas = usuarios.filter(u => u.tipo === 'empresa').length;
  const totalCoordenadores = usuarios.filter(u => u.tipo === 'coordenador').length;
  const totalProjetos = dashboardData?.total_projetos || projetos.length;
  const projetosPendentes = dashboardData?.por_status?.PENDENTE || projetos.filter(p => p.status === 'Pendente').length;
  const projetosAvaliados = dashboardData?.por_status?.AVALIADO || projetos.filter(p => p.status === 'Avaliado').length;
  const turmasDashboard = dashboardData?.por_turma || Array.from(new Set(projetos.map(p => p.turma))).map(t => ({ turma: t, total: projetos.filter(p => p.turma === t).length }));
  const turmasUnicas = Array.from(new Set(projetos.map(p => p.turma).filter(Boolean)));

  const filteredProjectsView = projetos.filter(p => {
    const matchStatus = projectStatusFilter === 'Todos os Status' || p.status === projectStatusFilter;
    const matchTurma = projectTurmaFilter === 'Todas as Turmas' || p.turma === projectTurmaFilter;
    return matchStatus && matchTurma;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <SenacLogo className="h-8 md:h-12" />
              <div className="border-l-2 pl-3 md:pl-4" style={{ borderColor: '#FF6B00' }}>
                <h1 className="text-lg md:text-xl font-bold" style={{ color: '#003D7A' }}>Painel do Coordenador</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Gestão e Acompanhamento - OPI</p>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <div className="text-right mr-2">
                <p className="text-sm font-medium" style={{ color: '#003D7A' }}>{coordenadorNome}</p>
              </div>
              <button onClick={() => document.getElementById('coord-mobile-menu')?.classList.toggle('hidden')} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <button onClick={() => setCurrentView('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentView === 'dashboard' ? 'text-white' : 'hover:bg-gray-100'}`} style={currentView === 'dashboard' ? { backgroundColor: '#003D7A' } : { color: '#003D7A' }}>
                <BarChart3 className="w-4 h-4" /> Dashboard
              </button>
              <button onClick={() => setCurrentView('usuarios')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentView === 'usuarios' ? 'text-white' : 'hover:bg-gray-100'}`} style={currentView === 'usuarios' ? { backgroundColor: '#FF6B00' } : { color: '#FF6B00' }}>
                <Users className="w-4 h-4" /> Usuários
              </button>
              <button onClick={() => setCurrentView('projetos')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentView === 'projetos' ? 'text-white' : 'hover:bg-gray-100'}`} style={currentView === 'projetos' ? { backgroundColor: '#5CB85C' } : { color: '#5CB85C' }}>
                <FolderOpen className="w-4 h-4" /> Projetos
              </button>
              <button onClick={() => setCurrentView('grupos')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentView === 'grupos' ? 'text-white' : 'hover:bg-gray-100'}`} style={currentView === 'grupos' ? { backgroundColor: '#FF6B00' } : { color: '#FF6B00' }}>
                <Users className="w-4 h-4" /> Grupos
              </button>
              <button onClick={() => setCurrentView('turmas')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentView === 'turmas' ? 'text-white' : 'hover:bg-gray-100'}`} style={currentView === 'turmas' ? { backgroundColor: '#9B59B6' } : { color: '#9B59B6' }}>
                <GraduationCap className="w-4 h-4" /> Turmas
              </button>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: '#003D7A' }}>{coordenadorNome}</p>
                <p className="text-xs text-muted-foreground">Coordenador</p>
              </div>
              <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: '#003D7A' }}>
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </div>

          <div id="coord-mobile-menu" className="hidden md:hidden mt-4 pb-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2 mt-4">
              <button onClick={() => { setCurrentView('dashboard'); document.getElementById('coord-mobile-menu')?.classList.add('hidden'); }} className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all w-full text-left ${currentView === 'dashboard' ? 'bg-[#E6F2FF] text-[#003D7A] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <BarChart3 className="w-5 h-5" /> Dashboard
              </button>
              <button onClick={() => { setCurrentView('usuarios'); document.getElementById('coord-mobile-menu')?.classList.add('hidden'); }} className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all w-full text-left ${currentView === 'usuarios' ? 'bg-[#FFF4ED] text-[#FF6B00] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Users className="w-5 h-5" /> Usuários
              </button>
              <button onClick={() => { setCurrentView('projetos'); document.getElementById('coord-mobile-menu')?.classList.add('hidden'); }} className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all w-full text-left ${currentView === 'projetos' ? 'bg-[#E8F5E9] text-[#5CB85C] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <FolderOpen className="w-5 h-5" /> Projetos
              </button>
              <button onClick={() => { setCurrentView('grupos'); document.getElementById('coord-mobile-menu')?.classList.add('hidden'); }} className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all w-full text-left ${currentView === 'grupos' ? 'bg-[#FFF4ED] text-[#FF6B00] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Users className="w-5 h-5" /> Grupos
              </button>
              <button onClick={() => { setCurrentView('turmas'); document.getElementById('coord-mobile-menu')?.classList.add('hidden'); }} className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all w-full text-left ${currentView === 'turmas' ? 'bg-[#F5EEF8] text-[#9B59B6] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <GraduationCap className="w-5 h-5" /> Turmas
              </button>
              <button onClick={onLogout} className="flex items-center gap-2 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-all w-full text-left mt-2">
                <LogOut className="w-5 h-5" /> Sair
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h2 className="mb-2" style={{ color: '#003D7A' }}>Dashboard Geral</h2>
              <p className="text-sm text-muted-foreground">Visão consolidada do sistema</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6F2FF' }}>
                    <GraduationCap className="w-6 h-6" style={{ color: '#003D7A' }} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#003D7A' }}>{totalAlunos}</p>
                <p className="text-sm text-muted-foreground">Alunos Cadastrados</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF4ED' }}>
                    <Users className="w-6 h-6" style={{ color: '#FF6B00' }} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#FF6B00' }}>{totalProfessores}</p>
                <p className="text-sm text-muted-foreground">Professores Ativos</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
                    <Building2 className="w-6 h-6" style={{ color: '#5CB85C' }} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#5CB85C' }}>{totalEmpresas}</p>
                <p className="text-sm text-muted-foreground">Empresas Parceiras</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6F2FF' }}>
                    <BookOpen className="w-6 h-6" style={{ color: '#003D7A' }} />
                  </div>
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#003D7A' }}>{totalProjetos}</p>
                <p className="text-sm text-muted-foreground">Projetos Integradores</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <h3 className="mb-6 font-medium" style={{ color: '#003D7A' }}>Status dos Projetos</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#FFF4ED' }}>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5" style={{ color: '#FF6B00' }} />
                      <span className="font-medium">Pendentes</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: '#FF6B00' }}>{projetosPendentes}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#FFF9E6' }}>
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Em Avaliação</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">{projetos.filter(p => p.status === 'Em Avaliação').length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#E8F5E9' }}>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5" style={{ color: '#28A745' }} />
                      <span className="font-medium">Avaliados</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: '#28A745' }}>{projetosAvaliados}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <h3 className="mb-6 font-medium" style={{ color: '#003D7A' }}>Distribuição por Turma</h3>
                <div className="space-y-3">
                  {turmasDashboard.map((item: any) => {
                    const turma = typeof item === 'string' ? item : item.turma;
                    const count = typeof item === 'string' ? projetos.filter(p => p.turma === item).length : item.total;
                    const percentage = totalProjetos > 0 ? (count / totalProjetos) * 100 : 0;
                    return (
                      <div key={turma}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{turma}</span>
                          <span className="text-sm text-muted-foreground">{count} projetos</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: '#003D7A' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <h3 className="mb-6 font-medium" style={{ color: '#003D7A' }}>Projetos Recentes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Título</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Turma</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Conceito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projetos.slice(0, 5).map((projeto) => (
                      <tr key={projeto.id} className="border-b border-border hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{projeto.titulo}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          <span className="block">{projeto.turma}</span>
                          {getCursoDaTurma(projeto.turma) && <span className="text-xs opacity-70">{getCursoDaTurma(projeto.turma) === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : getCursoDaTurma(projeto.turma)}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 rounded-full text-xs text-white" style={{ backgroundColor: getStatusColor(projeto.status) }}>
                            {projeto.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{projeto.conceito || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Usuários View */}
        {currentView === 'usuarios' && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 style={{ color: '#003D7A' }}>Gerenciamento de Usuários</h2>
                <p className="text-sm text-muted-foreground">Cadastre e gerencie alunos, professores e empresas</p>
              </div>
              <button onClick={() => { setShowForm(true); setEditingUser(null); setFormData({ nome: '', email: '', senha: '', tipo: 'aluno', turmaId: 0, turmaIds: [], curso: '' }); }} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: '#FF6B00' }}>
                <Plus className="w-5 h-5" /> Novo Usuário
              </button>
            </div>

            {/* Barra de pesquisa */}
            <div className="mb-4 relative">
              <input
                type="text"
                value={buscaUsuario}
                onChange={(e) => setBuscaUsuario(e.target.value)}
                placeholder="Pesquisar por nome ou e-mail..."
                className="w-full px-4 py-2 pl-10 border rounded-lg outline-none focus:ring-2 bg-white"
                style={{ borderColor: 'var(--color-border)' }}
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {buscaUsuario && (
                <button onClick={() => setBuscaUsuario('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtro por tipo */}
            <div className="mb-4 flex gap-2 flex-wrap">
              {([
                { key: 'todos',     label: `Todos (${usuarios.length})`,          cor: '#003D7A' },
                { key: 'aluno',     label: `Alunos (${totalAlunos})`,             cor: '#003D7A' },
                { key: 'professor', label: `Professores (${totalProfessores})`,   cor: '#FF6B00' },
                { key: 'empresa',      label: `Empresas (${totalEmpresas})`,         cor: '#5CB85C' },
                { key: 'coordenador', label: `Coordenadores (${totalCoordenadores})`, cor: '#9B59B6' },
              ] as const).map(({ key, label, cor }) => (
                <button key={key}
                  onClick={() => { setUserTypeFilter(key as any); setFiltroUsuarioCurso(''); setFiltroUsuarioTurmaId(0); }}
                  className={`px-4 py-2 rounded-lg transition-all ${userTypeFilter === key ? 'text-white' : 'bg-white hover:bg-gray-50'}`}
                  style={userTypeFilter === key ? { backgroundColor: cor } : { color: cor, border: '1px solid #E5E7EB' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Filtros por curso e turma (alunos e professores) */}
            {(userTypeFilter === 'aluno' || userTypeFilter === 'professor' || userTypeFilter === 'todos') && (
              <div className="mb-6 flex flex-col md:flex-row gap-3">
                <select
                  value={filtroUsuarioCurso}
                  onChange={(e) => { setFiltroUsuarioCurso(e.target.value); setFiltroUsuarioTurmaId(0); }}
                  className="px-4 py-2 border rounded-lg outline-none bg-white"
                  style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}
                >
                  <option value="">Todos os Cursos</option>
                  <option value="Design">Design</option>
                  <option value="Análise e Desenvolvimento de Sistemas">ADS</option>
                  <option value="Gastronomia">Gastronomia</option>
                </select>
                {(userTypeFilter === 'aluno' || userTypeFilter === 'todos') && (
                  <select
                    value={filtroUsuarioTurmaId}
                    onChange={(e) => setFiltroUsuarioTurmaId(Number(e.target.value))}
                    className="px-4 py-2 border rounded-lg outline-none bg-white"
                    style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}
                  >
                    <option value={0}>Todas as Turmas</option>
                    {turmasDisponiveis
                      .filter(t => !filtroUsuarioCurso || getCursoDaTurma(t.nome) === filtroUsuarioCurso)
                      .map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                  </select>
                )}
                {(filtroUsuarioCurso || filtroUsuarioTurmaId > 0 || buscaUsuario) && (
                  <button
                    onClick={() => { setFiltroUsuarioCurso(''); setFiltroUsuarioTurmaId(0); setBuscaUsuario(''); }}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
                    style={{ color: '#6C757D', borderColor: '#E5E7EB' }}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsuarios.map((usuario) => (
                <div key={usuario.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: getTipoColor(usuario.tipo) }}>
                        {usuario.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium">{usuario.nome}</h3>
                        <span className="inline-block px-2 py-1 rounded text-xs text-white mt-1" style={{ backgroundColor: getTipoColor(usuario.tipo) }}>
                          {usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 text-sm">
                    <p className="text-muted-foreground"><strong>E-mail:</strong> {usuario.email}</p>
                    {usuario.turma && <p className="text-muted-foreground"><strong>Turma:</strong> {usuario.turma}</p>}
                    {usuario.curso && <p className="text-muted-foreground"><strong>Curso:</strong> {usuario.curso}</p>}
                    <p className="text-muted-foreground"><strong>Senha:</strong> {usuario.senha}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(usuario)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 rounded-lg hover:bg-gray-50 transition-all" style={{ color: '#003D7A', borderColor: '#003D7A' }}>
                      <Edit className="w-4 h-4" /> Editar
                    </button>
                    <button onClick={() => { setRedefinindoSenha(usuario); setNovaSenha(''); }} className="flex items-center justify-center gap-2 px-3 py-2 border-2 rounded-lg hover:bg-gray-50 transition-all" style={{ color: '#FF6B00', borderColor: '#FF6B00' }} title="Redefinir senha">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(usuario.id)} className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsuarios.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-border">
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#003D7A', opacity: 0.5 }} />
                <h3 className="mb-2" style={{ color: '#003D7A' }}>Nenhum usuário encontrado</h3>
                <p className="text-muted-foreground">
                  {buscaUsuario
                    ? `Sem resultados para "${buscaUsuario}"`
                    : filtroUsuarioCurso || filtroUsuarioTurmaId
                      ? 'Nenhum usuário com os filtros selecionados'
                      : 'Cadastre o primeiro usuário para começar'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Projetos View */}
        {currentView === 'projetos' && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 style={{ color: '#003D7A' }}>Gestão de Projetos Integradores</h2>
                <p className="text-sm text-muted-foreground">Gerencie todos os projetos do sistema</p>
              </div>
              <button onClick={() => { setShowProjectForm(true); setEditingProject(null); setProjectFormData({ titulo: '', descricao: '', turma: '', turmaId: 0, membros: '', grupoId: 0, tecnologias: '', status: 'Pendente', autor: '', autorId: 0, conceito: '', feedback: '', linkGithub: '', linkProjeto: '', linkDocumentacao: '', linkVideo: '' }); }} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: '#5CB85C' }}>
                <Plus className="w-5 h-5" /> Novo Projeto
              </button>
            </div>

            {/* Filtros por status e turma */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setProjectStatusFilter('Todos os Status')} className={`px-4 py-2 rounded-lg transition-all ${projectStatusFilter === 'Todos os Status' ? 'text-white' : 'bg-white hover:bg-gray-50'}`} style={projectStatusFilter === 'Todos os Status' ? { backgroundColor: '#003D7A' } : { color: '#003D7A', border: '1px solid #E5E7EB' }}>
                  Todos ({projetos.length})
                </button>
                <button onClick={() => setProjectStatusFilter('Pendente')} className={`px-4 py-2 rounded-lg transition-all ${projectStatusFilter === 'Pendente' ? 'text-white' : 'bg-white hover:bg-gray-50'}`} style={projectStatusFilter === 'Pendente' ? { backgroundColor: '#FF6B00' } : { color: '#FF6B00', border: '1px solid #E5E7EB' }}>
                  Pendentes ({projetosPendentes})
                </button>
                <button onClick={() => setProjectStatusFilter('Em Avaliação')} className={`px-4 py-2 rounded-lg transition-all ${projectStatusFilter === 'Em Avaliação' ? 'text-white' : 'bg-white hover:bg-gray-50'}`} style={projectStatusFilter === 'Em Avaliação' ? { backgroundColor: '#FFA500' } : { color: '#FFA500', border: '1px solid #E5E7EB' }}>
                  Em Avaliação ({projetos.filter(p => p.status === 'Em Avaliação').length})
                </button>
                <button onClick={() => setProjectStatusFilter('Avaliado')} className={`px-4 py-2 rounded-lg transition-all ${projectStatusFilter === 'Avaliado' ? 'text-white' : 'bg-white hover:bg-gray-50'}`} style={projectStatusFilter === 'Avaliado' ? { backgroundColor: '#28A745' } : { color: '#28A745', border: '1px solid #E5E7EB' }}>
                  Avaliados ({projetosAvaliados})
                </button>
              </div>
              <select
                value={projectTurmaFilter}
                onChange={(e) => setProjectTurmaFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg outline-none bg-white"
                style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}
              >
                <option value="Todas as Turmas">Todas as Turmas</option>
                {turmasUnicas.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjectsView.map((projeto) => (
                <div key={projeto.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="mb-2" style={{ color: '#003D7A' }}>{projeto.titulo}</h3>
                      <span className="inline-block px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: getStatusColor(projeto.status) }}>
                        {projeto.status}
                      </span>
                      {projeto.conceito && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs text-white ml-2" style={{ backgroundColor: getConceitoColor(projeto.conceito) }}>
                          {projeto.conceito}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{projeto.descricao}</p>
                  <div className="text-xs text-muted-foreground mb-4 space-y-1">
                    {getCursoDaTurma(projeto.turma) && <p><strong>Curso:</strong> {getCursoDaTurma(projeto.turma) === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : getCursoDaTurma(projeto.turma)}</p>}
                    <p><strong>Turma:</strong> {projeto.turma}</p>
                    <p><strong>Data:</strong> {projeto.dataSubmissao.split('-').reverse().join('/')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewingProject(projeto)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 rounded-lg hover:bg-gray-50 transition-all" style={{ color: '#003D7A', borderColor: '#003D7A' }}>
                      <Eye className="w-4 h-4" /> Ver
                    </button>
                    <button onClick={() => handleEditProject(projeto)} className="flex items-center justify-center gap-2 px-3 py-2 border-2 rounded-lg hover:bg-gray-50 transition-all" style={{ color: '#5CB85C', borderColor: '#5CB85C' }}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteProject(projeto.id)} className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjectsView.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 mx-auto mb-4" style={{ color: '#5CB85C', opacity: 0.5 }} />
                <h3 className="mb-2" style={{ color: '#5CB85C' }}>Nenhum projeto encontrado</h3>
                <p className="text-muted-foreground mb-6">Nenhum projeto com os filtros selecionados</p>
              </div>
            )}
          </>
        )}

        {/* Grupos View */}
        {currentView === 'grupos' && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 style={{ color: '#003D7A' }}>Gerenciamento de Grupos</h2>
                <p className="text-sm text-muted-foreground">Crie e gerencie os grupos de projeto por turma</p>
              </div>
              <button onClick={() => { setShowGrupoForm(true); setEditingGrupo(null); setCursoGrupo(''); setGrupoFormData({ nome: '', descricao: '', turma_id: 0, membros_ids: [], cor: '#003D7A' }); }} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: '#FF6B00' }}>
                <Plus className="w-5 h-5" /> Novo Grupo
              </button>
            </div>

            {/* Filtros */}
            <div className="mb-6 space-y-3">
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-sm font-medium text-muted-foreground w-14">Curso</span>
                {(['Todos', 'Análise e Desenvolvimento de Sistemas', 'Design', 'Gastronomia'] as const).map(curso => {
                  const label = curso === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : curso;
                  const count = curso === 'Todos' ? grupos.length : grupos.filter(g => getCursoDaTurma(g.turma?.nome || '') === curso).length;
                  return (
                    <button key={curso} onClick={() => { setFiltroGrupoCurso(curso); setFiltroGrupoTurmaId(0); }}
                      className={`px-4 py-2 rounded-lg transition-all ${filtroGrupoCurso === curso ? 'text-white' : 'bg-white hover:bg-gray-50'}`}
                      style={filtroGrupoCurso === curso ? { backgroundColor: '#FF6B00' } : { color: '#FF6B00', border: '1px solid #E5E7EB' }}>
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground w-14">Turma</span>
                <select
                  value={filtroGrupoTurmaId}
                  onChange={(e) => setFiltroGrupoTurmaId(Number(e.target.value))}
                  disabled={filtroGrupoCurso === 'Todos'}
                  className="px-4 py-2 border rounded-lg outline-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}
                >
                  <option value={0}>{filtroGrupoCurso === 'Todos' ? 'Selecione um curso primeiro' : 'Todas as turmas'}</option>
                  {turmasDisponiveis
                    .filter(t => getCursoDaTurma(t.nome) === filtroGrupoCurso)
                    .map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grupos.filter(g => {
                const matchCurso = filtroGrupoCurso === 'Todos' || getCursoDaTurma(g.turma?.nome || '') === filtroGrupoCurso;
                const matchTurma = filtroGrupoTurmaId === 0 || g.turma?.id === filtroGrupoTurmaId;
                return matchCurso && matchTurma;
              }).map((grupo) => (
                <div key={grupo.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: grupo.cor }}>
                      {grupo.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ color: '#003D7A' }}>{grupo.nome}</h3>
                      <p className="text-xs text-muted-foreground">{grupo.turma?.nome}</p>
                    </div>
                  </div>
                  {grupo.descricao && <p className="text-sm text-muted-foreground mb-4">{grupo.descricao}</p>}
                  <div className="mb-4">
                    <p className="text-xs font-medium mb-2" style={{ color: '#003D7A' }}>Membros ({grupo.membros?.length || 0}):</p>
                    <div className="flex flex-wrap gap-2">
                      {grupo.membros?.map((m) => (
                        <span key={m.id} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{m.nome}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingGrupo(grupo); const cursoEdit = grupo.turma ? getCursoDaTurma(grupo.turma.nome) : ''; setCursoGrupo(cursoEdit); setGrupoFormData({ nome: grupo.nome, descricao: grupo.descricao, turma_id: grupo.turma?.id || 0, membros_ids: grupo.membros?.map(m => m.id) || [], cor: grupo.cor }); setShowGrupoForm(true); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 rounded-lg hover:bg-gray-50 transition-all" style={{ color: '#003D7A', borderColor: '#003D7A' }}>
                      <Edit className="w-4 h-4" /> Editar
                    </button>
                    <button onClick={async () => { if (confirm('Tem certeza que deseja excluir este grupo?')) { await api.deletarGrupo(grupo.id); setGrupos(grupos.filter(g => g.id !== grupo.id)); } }} className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {grupos.filter(g => {
              const matchCurso = filtroGrupoCurso === 'Todos' || getCursoDaTurma(g.turma?.nome || '') === filtroGrupoCurso;
              const matchTurma = filtroGrupoTurmaId === 0 || g.turma?.id === filtroGrupoTurmaId;
              return matchCurso && matchTurma;
            }).length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-border">
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#FF6B00', opacity: 0.5 }} />
                <h3 className="mb-2" style={{ color: '#003D7A' }}>Nenhum grupo encontrado</h3>
                <p className="text-muted-foreground">
                  {filtroGrupoCurso === 'Todos' && filtroGrupoTurmaId === 0
                    ? 'Crie o primeiro grupo para começar'
                    : 'Nenhum grupo com os filtros selecionados'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Turmas View */}
        {currentView === 'turmas' && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 style={{ color: '#003D7A' }}>Gerenciamento de Turmas</h2>
                <p className="text-sm text-muted-foreground">Cadastre e gerencie as turmas do SENAC</p>
              </div>
              <button onClick={() => setShowTurmaForm(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: '#9B59B6' }}>
                <Plus className="w-5 h-5" /> Nova Turma
              </button>
            </div>

            <div className="mb-6 flex gap-2 flex-wrap">
              {(['Todos', 'Análise e Desenvolvimento de Sistemas', 'Design', 'Gastronomia'] as const).map((curso) => {
                const label = curso === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : curso;
                const count = curso === 'Todos'
                  ? turmasDisponiveis.length
                  : turmasDisponiveis.filter((t: any) => getCursoDaTurma(t.nome) === curso).length;
                return (
                  <button
                    key={curso}
                    onClick={() => setFiltroTurmaCurso(curso)}
                    className={`px-4 py-2 rounded-lg transition-all ${filtroTurmaCurso === curso ? 'text-white' : 'bg-white hover:bg-gray-50'}`}
                    style={filtroTurmaCurso === curso ? { backgroundColor: '#9B59B6' } : { color: '#9B59B6', border: '1px solid #E5E7EB' }}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {turmasDisponiveis.filter((t: any) => filtroTurmaCurso === 'Todos' || getCursoDaTurma(t.nome) === filtroTurmaCurso).map((turma: any) => (
                <div key={turma.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: getCursoDaTurma(turma.nome) === 'Design' ? '#FF6B00' : getCursoDaTurma(turma.nome) === 'Gastronomia' ? '#5CB85C' : '#9B59B6' }}>
                      {turma.nome.split(' ')[0].substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#003D7A' }}>{turma.nome}</p>
                      <p className="text-xs text-muted-foreground">{turma.turno === 'MANHA' ? 'Manhã' : turma.turno === 'TARDE' ? 'Tarde' : 'Noite'} · {turma.ano}/{turma.semestre}º sem.</p>
                    </div>
                  </div>
                  <button onClick={async () => { if (confirm(`Excluir a turma "${turma.nome}"?`)) { await api.deletarTurma(turma.id); setTurmasDisponiveis(turmasDisponiveis.filter((t: any) => t.id !== turma.id)); } }} className="p-2 border-2 border-red-400 text-red-400 rounded-lg hover:bg-red-50 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {turmasDisponiveis.filter((t: any) => filtroTurmaCurso === 'Todos' || getCursoDaTurma(t.nome) === filtroTurmaCurso).length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-border">
                <GraduationCap className="w-16 h-16 mx-auto mb-4" style={{ color: '#9B59B6', opacity: 0.5 }} />
                <h3 className="mb-2" style={{ color: '#003D7A' }}>Nenhuma turma encontrada</h3>
                <p className="text-muted-foreground">{filtroTurmaCurso === 'Todos' ? 'Crie a primeira turma para começar' : `Nenhuma turma de ${filtroTurmaCurso === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : filtroTurmaCurso} cadastrada`}</p>
              </div>
            )}
          </>
        )}

        {/* Turma Form Modal */}
        {showTurmaForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ color: '#003D7A' }}>Nova Turma</h3>
                <button onClick={() => setShowTurmaForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Nome da Turma</label>
                  <input
                    type="text"
                    value={turmaFormData.nome}
                    onChange={(e) => setTurmaFormData({ ...turmaFormData, nome: e.target.value, codigo: e.target.value.replace(/\s+/g, '-').toUpperCase() })}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2"
                    style={{ borderColor: 'var(--color-border)' }}
                    placeholder="Ex: ADS 185, Design 98, Gastronomia 31"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Código</label>
                  <input
                    type="text"
                    value={turmaFormData.codigo}
                    onChange={(e) => setTurmaFormData({ ...turmaFormData, codigo: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2"
                    style={{ borderColor: 'var(--color-border)' }}
                    placeholder="Ex: ADS-185"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-2 font-medium">Turno</label>
                    <select value={turmaFormData.turno} onChange={(e) => setTurmaFormData({ ...turmaFormData, turno: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none bg-white" style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}>
                      <option value="MANHA">Manhã</option>
                      <option value="TARDE">Tarde</option>
                      <option value="NOITE">Noite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Ano</label>
                    <input type="number" value={turmaFormData.ano} onChange={(e) => setTurmaFormData({ ...turmaFormData, ano: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg outline-none" style={{ borderColor: 'var(--color-border)' }} min={2020} max={2035} />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Semestre</label>
                    <select value={turmaFormData.semestre} onChange={(e) => setTurmaFormData({ ...turmaFormData, semestre: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg outline-none bg-white" style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}>
                      <option value={1}>1º</option>
                      <option value={2}>2º</option>
                      <option value={3}>3º</option>
                      <option value={4}>4º</option>
                      <option value={5}>5º</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={async () => {
                    if (!turmaFormData.nome.trim()) return;
                    const nova = await api.criarTurma(turmaFormData);
                    if (nova.id) {
                      setTurmasDisponiveis([...turmasDisponiveis, nova]);
                      setTurmaFormData({ nome: '', codigo: '', turno: 'MANHA', ano: new Date().getFullYear(), semestre: 1 });
                      setShowTurmaForm(false);
                    }
                  }} className="flex-1 py-3 text-white rounded-lg hover:opacity-90 transition-all font-medium" style={{ backgroundColor: '#9B59B6' }}>
                    Criar Turma
                  </button>
                  <button onClick={() => setShowTurmaForm(false)} className="flex-1 py-3 border-2 rounded-lg hover:bg-gray-50 transition-all font-medium" style={{ color: '#003D7A', borderColor: '#003D7A' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grupo Form Modal */}
        {showGrupoForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ color: '#003D7A' }}>{editingGrupo ? 'Editar Grupo' : 'Novo Grupo'}</h3>
                <button onClick={() => { setShowGrupoForm(false); setEditingGrupo(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Nome do Grupo</label>
                  <input type="text" value={grupoFormData.nome} onChange={(e) => setGrupoFormData({ ...grupoFormData, nome: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2" style={{ borderColor: 'var(--color-border)' }} placeholder="Ex: Squad 1" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Descrição (opcional)</label>
                  <textarea value={grupoFormData.descricao} onChange={(e) => setGrupoFormData({ ...grupoFormData, descricao: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 min-h-[80px]" style={{ borderColor: 'var(--color-border)' }} placeholder="Descrição do grupo..." />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Cor do Grupo</label>
                  <div className="flex gap-3">
                    {['#003D7A', '#FF6B00', '#5CB85C', '#9B59B6', '#E74C3C', '#F39C12'].map(cor => (
                      <button key={cor} type="button" onClick={() => setGrupoFormData({ ...grupoFormData, cor })} className="w-10 h-10 rounded-full border-4 transition-all" style={{ backgroundColor: cor, borderColor: grupoFormData.cor === cor ? '#000' : 'transparent' }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">Curso</label>
                    <select value={cursoGrupo} onChange={(e) => { setCursoGrupo(e.target.value); setGrupoFormData({ ...grupoFormData, turma_id: 0 }); setFiltroTurmaGrupo(''); }} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 bg-white" style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}>
                      <option value="">Selecione um curso</option>
                      <option value="Design">Design</option>
                      <option value="Análise e Desenvolvimento de Sistemas">Análise e Desenvolvimento de Sistemas</option>
                      <option value="Gastronomia">Gastronomia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Turma</label>
                    <select
                      value={grupoFormData.turma_id}
                      onChange={(e) => setGrupoFormData({ ...grupoFormData, turma_id: Number(e.target.value), membros_ids: [] })}
                      disabled={!cursoGrupo}
                      className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}
                    >
                      <option value={0}>{cursoGrupo ? 'Selecione uma turma' : 'Selecione um curso primeiro'}</option>
                      {turmasDisponiveis
                        .filter(t => getCursoDaTurma(t.nome) === cursoGrupo)
                        .map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Membros do Grupo</label>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-2" style={{ borderColor: 'var(--color-border)' }}>
                    {!grupoFormData.turma_id ? (
                      <p className="text-sm text-muted-foreground p-2">Selecione uma turma para ver os alunos disponíveis.</p>
                    ) : usuarios.filter(u => u.tipo === 'aluno' && u.turmaId === grupoFormData.turma_id).length === 0 ? (
                      <p className="text-sm text-muted-foreground p-2">Nenhum aluno nesta turma.</p>
                    ) : (
                      usuarios.filter(u => u.tipo === 'aluno' && u.turmaId === grupoFormData.turma_id).map((usuario) => (
                        <label key={usuario.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input type="checkbox" checked={grupoFormData.membros_ids.includes(usuario.id)} onChange={(e) => { if (e.target.checked) { setGrupoFormData({ ...grupoFormData, membros_ids: [...grupoFormData.membros_ids, usuario.id] }); } else { setGrupoFormData({ ...grupoFormData, membros_ids: grupoFormData.membros_ids.filter(id => id !== usuario.id) }); } }} />
                          <span className="text-sm">{usuario.nome}</span>
                          <span className="text-xs text-muted-foreground">{usuario.email}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={async () => {
                    if (!grupoFormData.turma_id) { alert('Selecione uma turma antes de salvar.'); return; }
                    if (editingGrupo) { await api.editarGrupo(editingGrupo.id, grupoFormData); } else { await api.criarGrupo(grupoFormData); }
                    const data = await api.listarGrupos(); setGrupos(data.results || data);
                    setShowGrupoForm(false); setEditingGrupo(null); setCursoGrupo('');
                    setGrupoFormData({ nome: '', descricao: '', turma_id: 0, membros_ids: [], cor: '#003D7A' });
                  }} className="flex-1 py-3 text-white rounded-lg hover:opacity-90 transition-all font-medium" style={{ backgroundColor: '#FF6B00' }}>
                    {editingGrupo ? 'Salvar Alterações' : 'Criar Grupo'}
                  </button>
                  <button onClick={() => { setShowGrupoForm(false); setEditingGrupo(null); setCursoGrupo(''); }} className="flex-1 py-3 border-2 rounded-lg hover:bg-gray-50 transition-all font-medium" style={{ color: '#003D7A', borderColor: '#003D7A' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Redefinir Senha */}
        {redefinindoSenha && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ color: '#003D7A' }}>Redefinir Senha</h3>
                <button onClick={() => setRedefinindoSenha(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Definir nova senha para <strong>{redefinindoSenha.nome}</strong></p>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Nova senha (mínimo 6 caracteres)"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 mb-4"
                style={{ borderColor: 'var(--color-border)' }}
                onKeyDown={(e) => e.key === 'Enter' && handleRedefinirSenha()}
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={handleRedefinirSenha}
                  className="flex-1 py-2 text-white rounded-lg hover:opacity-90 font-medium"
                  style={{ backgroundColor: '#FF6B00' }}>
                  Salvar Nova Senha
                </button>
                <button onClick={() => setRedefinindoSenha(null)}
                  className="flex-1 py-2 border-2 rounded-lg hover:bg-gray-50 font-medium"
                  style={{ color: '#003D7A', borderColor: '#003D7A' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 style={{ color: '#003D7A' }}>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                <button onClick={() => { setShowForm(false); setEditingUser(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Tipo de Usuário</label>
                  <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'aluno' | 'professor' | 'empresa' | 'coordenador' })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2" style={{ borderColor: 'var(--color-border)' }} required>
                    <option value="aluno">Aluno</option>
                    <option value="professor">Professor</option>
                    <option value="empresa">Empresa</option>
                    <option value="coordenador">Coordenador</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Nome Completo</label>
                  <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2" style={{ borderColor: 'var(--color-border)' }} required />
                </div>
                <div>
                  <label className="block mb-2 font-medium">E-mail</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2" style={{ borderColor: 'var(--color-border)' }} required />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Senha</label>
                  <input type="text" value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2" style={{ borderColor: 'var(--color-border)' }} required />
                </div>
                {formData.tipo === 'aluno' && (
                  <>
                    <div>
                      <label className="block mb-2 font-medium">Curso</label>
                      <select value={formData.curso} onChange={(e) => setFormData({ ...formData, curso: e.target.value, turmaId: 0 })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 bg-white" style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}>
                        <option value="">Selecione um curso</option>
                        <option value="Design">Design</option>
                        <option value="Análise e Desenvolvimento de Sistemas">Análise e Desenvolvimento de Sistemas</option>
                        <option value="Gastronomia">Gastronomia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 font-medium">Turma</label>
                      <select
                        value={formData.turmaId}
                        onChange={(e) => setFormData({ ...formData, turmaId: Number(e.target.value) })}
                        disabled={!formData.curso}
                        className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}
                      >
                        <option value={0}>{formData.curso ? 'Selecione uma turma' : 'Selecione um curso primeiro'}</option>
                        {turmasDisponiveis
                          .filter(t => getCursoDaTurma(t.nome) === formData.curso)
                          .map(t => (
                            <option key={t.id} value={t.id}>{t.nome}</option>
                          ))}
                      </select>
                    </div>
                  </>
                )}
                {formData.tipo === 'professor' && (
                  <div>
                    <label className="block mb-2 font-medium">Cursos e Turmas</label>
                    <p className="text-xs text-muted-foreground mb-3">Selecione todas as turmas que este professor leciona</p>
                    <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                      {(['Análise e Desenvolvimento de Sistemas', 'Design', 'Gastronomia'] as const).map((curso, idx) => {
                        const turmasDoCurso = turmasDisponiveis.filter(t => getCursoDaTurma(t.nome) === curso);
                        const cor = curso === 'Design' ? '#FF6B00' : curso === 'Gastronomia' ? '#5CB85C' : '#9B59B6';
                        const label = curso === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : curso;
                        const todasSelecionadas = turmasDoCurso.every(t => formData.turmaIds.includes(t.id));
                        const algumasSelecionadas = turmasDoCurso.some(t => formData.turmaIds.includes(t.id));
                        return (
                          <div key={curso} className={idx > 0 ? 'border-t' : ''} style={{ borderColor: 'var(--color-border)' }}>
                            <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: `${cor}12` }}>
                              <input
                                type="checkbox"
                                checked={todasSelecionadas}
                                ref={el => { if (el) el.indeterminate = algumasSelecionadas && !todasSelecionadas; }}
                                onChange={() => {
                                  const ids = turmasDoCurso.map(t => t.id);
                                  if (todasSelecionadas) {
                                    setFormData({ ...formData, turmaIds: formData.turmaIds.filter(id => !ids.includes(id)) });
                                  } else {
                                    setFormData({ ...formData, turmaIds: [...new Set([...formData.turmaIds, ...ids])] });
                                  }
                                }}
                                className="w-4 h-4 cursor-pointer"
                              />
                              <span className="font-medium text-sm" style={{ color: cor }}>{label}</span>
                              <span className="text-xs text-muted-foreground">({turmasDoCurso.filter(t => formData.turmaIds.includes(t.id)).length}/{turmasDoCurso.length} selecionadas)</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 px-4 py-3">
                              {turmasDoCurso.map(t => (
                                <label key={t.id} className="flex items-center gap-2 cursor-pointer text-sm">
                                  <input
                                    type="checkbox"
                                    checked={formData.turmaIds.includes(t.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFormData({ ...formData, turmaIds: [...formData.turmaIds, t.id] });
                                      } else {
                                        setFormData({ ...formData, turmaIds: formData.turmaIds.filter(id => id !== t.id) });
                                      }
                                    }}
                                    className="w-4 h-4 cursor-pointer"
                                  />
                                  <span>{t.nome}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-3 text-white rounded-lg hover:opacity-90 transition-all font-medium" style={{ backgroundColor: '#FF6B00' }}>
                    {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} className="flex-1 py-3 border-2 rounded-lg hover:bg-gray-50 transition-all font-medium" style={{ color: '#003D7A', borderColor: '#003D7A' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project Form Modal */}
        {showProjectForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 style={{ color: '#003D7A' }}>{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</h3>
                <button onClick={() => { setShowProjectForm(false); setEditingProject(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleProjectSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Título do Projeto</label>
                  <input type="text" value={projectFormData.titulo} onChange={(e) => setProjectFormData({ ...projectFormData, titulo: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2" style={{ borderColor: 'var(--color-border)' }} required />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Descrição</label>
                  <textarea value={projectFormData.descricao} onChange={(e) => setProjectFormData({ ...projectFormData, descricao: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 min-h-[100px]" style={{ borderColor: 'var(--color-border)' }} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">Curso</label>
                    <select value={cursoProjeto} onChange={(e) => { setCursoProjeto(e.target.value); setProjectFormData({ ...projectFormData, turma: '', turmaId: 0, grupoId: 0 }); }} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 bg-white" style={{ borderColor: 'var(--color-border)', color: '#003D7A' }} required>
                      <option value="">Selecione um curso</option>
                      <option value="Design">Design</option>
                      <option value="Análise e Desenvolvimento de Sistemas">Análise e Desenvolvimento de Sistemas</option>
                      <option value="Gastronomia">Gastronomia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Turma</label>
                    <select
                      value={projectFormData.turmaId}
                      onChange={(e) => {
                        const t = turmasDisponiveis.find(t => t.id === Number(e.target.value));
                        setProjectFormData({ ...projectFormData, turmaId: Number(e.target.value), turma: t?.nome || '', grupoId: 0 });
                      }}
                      disabled={!cursoProjeto}
                      className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}
                      required
                    >
                      <option value={0}>{cursoProjeto ? 'Selecione uma turma' : 'Selecione um curso primeiro'}</option>
                      {turmasDisponiveis
                        .filter(t => getCursoDaTurma(t.nome) === cursoProjeto)
                        .map(t => (
                          <option key={t.id} value={t.id}>{t.nome}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Grupo</label>
                  <select
                    value={projectFormData.grupoId}
                    onChange={(e) => setProjectFormData({ ...projectFormData, grupoId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 bg-white"
                    style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}
                  >
                    <option value={0}>
                      {!cursoProjeto ? 'Selecione um curso primeiro' : !projectFormData.turmaId ? 'Selecione uma turma primeiro' : 'Selecione um grupo'}
                    </option>
                    {grupos
                      .filter(g =>
                        (!cursoProjeto || getCursoDaTurma(g.turma?.nome || '') === cursoProjeto) &&
                        (!projectFormData.turmaId || g.turma?.id === projectFormData.turmaId)
                      )
                      .map(g => (
                        <option key={g.id} value={g.id}>{g.nome}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Tecnologias Utilizadas</label>
                  <input type="text" value={projectFormData.tecnologias} onChange={(e) => setProjectFormData({ ...projectFormData, tecnologias: e.target.value })} placeholder="Ex: Python, Django, PostgreSQL" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2" style={{ borderColor: 'var(--color-border)' }} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">Status</label>
                    <select value={projectFormData.status} onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value as 'Pendente' | 'Em Avaliação' | 'Avaliado' })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2" style={{ borderColor: 'var(--color-border)' }} required>
                      <option value="Pendente">Pendente</option>
                      <option value="Em Avaliação">Em Avaliação</option>
                      <option value="Avaliado">Avaliado</option>
                    </select>
                  </div>
                  {projectFormData.status === 'Avaliado' && (
                    <div>
                      <label className="block mb-2 font-medium">Conceito</label>
                      <select value={projectFormData.conceito} onChange={(e) => setProjectFormData({ ...projectFormData, conceito: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2" style={{ borderColor: 'var(--color-border)' }}>
                        <option value="">Selecione</option>
                        <option value="Excelente">Excelente</option>
                        <option value="Ótimo">Ótimo</option>
                        <option value="Bom">Bom</option>
                        <option value="Ainda não suficiente">Ainda não suficiente</option>
                        <option value="Insuficiente">Insuficiente</option>
                      </select>
                    </div>
                  )}
                </div>
                {projectFormData.status === 'Avaliado' && (
                  <div>
                    <label className="block mb-2 font-medium">Feedback</label>
                    <textarea value={projectFormData.feedback} onChange={(e) => setProjectFormData({ ...projectFormData, feedback: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 min-h-[80px]" style={{ borderColor: 'var(--color-border)' }} placeholder="Feedback para o aluno..." />
                  </div>
                )}
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-3" style={{ color: '#003D7A' }}>Links do Projeto (Opcional)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-2 text-sm">GitHub</label>
                      <input type="url" value={projectFormData.linkGithub} onChange={(e) => setProjectFormData({ ...projectFormData, linkGithub: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 text-sm" style={{ borderColor: 'var(--color-border)' }} />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm">Projeto</label>
                      <input type="url" value={projectFormData.linkProjeto} onChange={(e) => setProjectFormData({ ...projectFormData, linkProjeto: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 text-sm" style={{ borderColor: 'var(--color-border)' }} />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm">Documentação</label>
                      <input type="url" value={projectFormData.linkDocumentacao} onChange={(e) => setProjectFormData({ ...projectFormData, linkDocumentacao: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 text-sm" style={{ borderColor: 'var(--color-border)' }} />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm">Vídeo</label>
                      <input type="url" value={projectFormData.linkVideo} onChange={(e) => setProjectFormData({ ...projectFormData, linkVideo: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 text-sm" style={{ borderColor: 'var(--color-border)' }} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-3 text-white rounded-lg hover:opacity-90 transition-all font-medium" style={{ backgroundColor: '#5CB85C' }}>
                    {editingProject ? 'Salvar Alterações' : 'Criar Projeto'}
                  </button>
                  <button type="button" onClick={() => { setShowProjectForm(false); setEditingProject(null); }} className="flex-1 py-3 border-2 rounded-lg hover:bg-gray-50 transition-all font-medium" style={{ color: '#003D7A', borderColor: '#003D7A' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Project Modal */}
        {viewingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 style={{ color: '#003D7A' }}>{viewingProject.titulo}</h3>
                <button onClick={() => setViewingProject(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: getStatusColor(viewingProject.status) }}>{viewingProject.status}</span>
                  {viewingProject.conceito && <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: getConceitoColor(viewingProject.conceito) }}>{viewingProject.conceito}</span>}
                </div>
                <div><label className="font-medium" style={{ color: '#003D7A' }}>Descrição</label><p className="text-muted-foreground mt-1">{viewingProject.descricao}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  {getCursoDaTurma(viewingProject.turma) && <div><label className="font-medium" style={{ color: '#003D7A' }}>Curso</label><p className="text-muted-foreground mt-1">{getCursoDaTurma(viewingProject.turma)}</p></div>}
                  <div><label className="font-medium" style={{ color: '#003D7A' }}>Turma</label><p className="text-muted-foreground mt-1">{viewingProject.turma}</p></div>
                </div>
                <div><label className="font-medium" style={{ color: '#003D7A' }}>Membros</label><p className="text-muted-foreground mt-1">{viewingProject.membros}</p></div>
                <div><label className="font-medium" style={{ color: '#003D7A' }}>Tecnologias</label><p className="text-muted-foreground mt-1">{viewingProject.tecnologias}</p></div>
                <div><label className="font-medium" style={{ color: '#003D7A' }}>Data de Submissão</label><p className="text-muted-foreground mt-1">{viewingProject.dataSubmissao.split('-').reverse().join('/')}</p></div>
                {viewingProject.avaliacaoDetalhes && (
                  <div className="pt-4 border-t-2 border-border space-y-4">
                    <h4 className="font-bold" style={{ color: '#003D7A' }}>Avaliação por Rubrica</h4>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      {viewingProject.avaliacaoDetalhes.professorNome && (
                        <p className="text-sm mb-1"><strong>Avaliado por:</strong> {viewingProject.avaliacaoDetalhes.professorNome}</p>
                      )}
                      {viewingProject.avaliacaoDetalhes.data && (
                        <p className="text-sm"><strong>Data:</strong> {viewingProject.avaliacaoDetalhes.data.split('T')[0].split('-').reverse().join('/')}</p>
                      )}
                    </div>
                    {viewingProject.avaliacaoDetalhes.rubricas.length > 0 && (
                      <div className="space-y-3">
                        <label className="font-medium text-sm block" style={{ color: '#003D7A' }}>Critérios</label>
                        {viewingProject.avaliacaoDetalhes.rubricas.map((r, i) => (
                          <div key={i} className="p-3 rounded-lg border flex items-start justify-between" style={{ backgroundColor: '#FAFAFA', borderColor: '#E5E7EB' }}>
                            <div className="flex-1">
                              <p className="font-medium text-sm" style={{ color: '#003D7A' }}>{r.criterioNome}</p>
                              {r.criterioDescricao && <p className="text-xs text-muted-foreground mt-0.5">{r.criterioDescricao}</p>}
                              {r.observacao && <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{r.observacao}</p>}
                            </div>
                            <span className="px-2 py-1 rounded text-xs font-bold text-white ml-2 flex-shrink-0" style={{ backgroundColor: getConceitoColor(r.conceito) }}>
                              {r.conceito}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {viewingProject.feedback && (
                      <div>
                        <label className="font-medium text-sm block mb-1" style={{ color: '#003D7A' }}>Feedback do Professor</label>
                        <p className="text-sm text-muted-foreground">{viewingProject.feedback}</p>
                      </div>
                    )}
                    {viewingProject.avaliacaoDetalhes.rubricaAssinatura && (
                      <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: '#FF6B00', backgroundColor: '#FFFBF0' }}>
                        <label className="font-medium text-sm block mb-2" style={{ color: '#003D7A' }}>Rubrica (Assinatura)</label>
                        <p className="text-xl text-center" style={{ fontFamily: 'cursive', fontStyle: 'italic', color: '#003D7A' }}>
                          {viewingProject.avaliacaoDetalhes.rubricaAssinatura}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => setViewingProject(null)} className="w-full mt-6 py-3 text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: '#003D7A' }}>
                Fechar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}