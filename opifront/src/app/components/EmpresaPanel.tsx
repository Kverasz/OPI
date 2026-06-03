import { useState, useEffect } from 'react';
import { api } from '../api';
import { Building2, LogOut, Search, Award, Eye, User, Mail, Briefcase, Star, X, GraduationCap, Users, Heart } from 'lucide-react';
import { SenacLogo } from './SenacLogo';

type Conceito = 'Insuficiente' | 'Ainda não suficiente' | 'Bom' | 'Ótimo' | 'Excelente';

interface MembroPerfil {
  id: number;
  nome: string;
  email: string;
  foto?: string;
  curso: string;
  turma: string;
  turmas: { nome: string; curso: string }[];
  sobreMim: string;
  softSkills: string[];
  hardSkills: string[];
  projetos: { id: number; titulo: string; conceito: Conceito }[];
}

interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  turma: string;
  curso: string;
  membros: string;
  membrosProfiles: MembroPerfil[];
  tecnologias: string;
  conceito: Conceito;
  feedback?: string;
  dataSubmissao: string;
  curtidas: number;
  linkGithub?: string;
  linkProjeto?: string;
}

interface EmpresaPanelProps {
  onLogout: () => void;
  empresaNome: string;
}

const conceitoDisplayMap: Record<string, Conceito> = {
  EXCELENTE: 'Excelente', OTIMO: 'Ótimo', BOM: 'Bom',
  AINDA_NAO_SUFICIENTE: 'Ainda não suficiente', INSUFICIENTE: 'Insuficiente',
};

function getCursoDaTurma(nome: string): string {
  const n = nome.toUpperCase();
  if (n.startsWith('ADS')) return 'Análise e Desenvolvimento de Sistemas';
  if (n.startsWith('DESIGN')) return 'Design';
  if (n.startsWith('GASTRO')) return 'Gastronomia';
  return nome;
}

function getConceitoColor(conceito: string) {
  switch (conceito) {
    case 'Excelente': return '#28A745';
    case 'Ótimo': return '#5CB85C';
    case 'Bom': return '#5BC0DE';
    case 'Ainda não suficiente': return '#F0AD4E';
    case 'Insuficiente': return '#D9534F';
    default: return '#6C757D';
  }
}

function mapearMembro(u: any, turmaFallback: string): MembroPerfil {
  const todasTurmas = Array.isArray(u.turmas) && u.turmas.length > 0
    ? u.turmas.map((t: any) => ({ nome: t.nome || t, curso: getCursoDaTurma(t.nome || t) }))
    : [{ nome: turmaFallback, curso: getCursoDaTurma(turmaFallback) }];
  return {
    id: u.id,
    nome: u.nome || '',
    email: u.email || '',
    foto: u.foto_url || '',
    curso: todasTurmas[0]?.curso || getCursoDaTurma(turmaFallback),
    turma: todasTurmas[0]?.nome || turmaFallback,
    turmas: todasTurmas,
    sobreMim: u.sobre_mim || '',
    softSkills: Array.isArray(u.soft_skills) ? u.soft_skills : [],
    hardSkills: Array.isArray(u.hard_skills) ? u.hard_skills : [],
    projetos: [],
  };
}

export function EmpresaPanel({ onLogout, empresaNome }: EmpresaPanelProps) {
  const [currentView, setCurrentView] = useState<'projetos' | 'alunos'>('projetos');
  const [cursoFilter, setCursoFilter] = useState('Todos os Cursos');
  const [conceitoFilter, setConceitoFilter] = useState('Todos os Conceitos');
  const [searchQuery, setSearchQuery] = useState('');
  const [alunoSearch, setAlunoSearch] = useState('');
  const [alunoCursoFilter, setAlunoCursoFilter] = useState('Todos os Cursos');
  const [viewingProject, setViewingProject] = useState<Projeto | null>(null);
  const [viewingTeam, setViewingTeam] = useState<MembroPerfil[] | null>(null);
  const [viewingProfile, setViewingProfile] = useState<MembroPerfil | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [alunos, setAlunos] = useState<MembroPerfil[]>([]);

  useEffect(() => {
    api.listarPortfolio().then((data: any) => {
      const lista = data.results || data;
      if (Array.isArray(lista)) {
        const projetosMapeados = lista.map((p: any) => {
          const turma = p.turma?.nome || '';
          const curso = getCursoDaTurma(turma);
          const membrosProfiles: MembroPerfil[] = (p.membros_detalhe || [])
            .map((m: any) => m.usuario ? mapearMembro(m.usuario, turma) : null)
            .filter(Boolean);
          return {
            id: p.id, titulo: p.titulo, descricao: p.descricao, turma, curso,
            membros: membrosProfiles.map(m => m.nome).join(', '),
            membrosProfiles,
            tecnologias: p.tecnologias?.map((t: any) => t.tecnologia).join(', ') || '',
            conceito: conceitoDisplayMap[p.conceito] || ('Bom' as Conceito),
            feedback: p.feedback_geral || undefined,
            dataSubmissao: p.criado_em?.split('T')[0] || '',
            curtidas: p.total_curtidas || 0,
            linkGithub: p.link_repositorio || '',
            linkProjeto: p.link_demo || '',
          };
        });
        setProjetos(projetosMapeados);

        // Extrair alunos únicos com seus projetos vinculados
        const alunosMap = new Map<number, MembroPerfil>();
        projetosMapeados.forEach(proj => {
          proj.membrosProfiles.forEach(m => {
            if (!alunosMap.has(m.id)) {
              alunosMap.set(m.id, { ...m, projetos: [] });
            }
            const aluno = alunosMap.get(m.id)!;
            if (!aluno.projetos.some(p => p.id === proj.id)) {
              aluno.projetos.push({ id: proj.id, titulo: proj.titulo, conceito: proj.conceito });
            }
          });
        });
        setAlunos(Array.from(alunosMap.values()).sort((a, b) => a.nome.localeCompare(b.nome)));
      }
    });
  }, []);

  const filteredProjetos = projetos.filter(p => {
    const matchCurso = cursoFilter === 'Todos os Cursos' || p.curso === cursoFilter;
    const matchConceito = conceitoFilter === 'Todos os Conceitos' || p.conceito === conceitoFilter;
    const matchSearch = !searchQuery || p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tecnologias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.membros.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCurso && matchConceito && matchSearch;
  });

  const projetosExcelentes = projetos.filter(p => p.conceito === 'Excelente').length;
  const projetosOtimos = projetos.filter(p => p.conceito === 'Ótimo').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <SenacLogo className="h-8 md:h-12" />
            <div className="border-l-2 pl-3 md:pl-4" style={{ borderColor: '#FF6B00' }}>
              <h1 className="text-lg md:text-xl font-bold" style={{ color: '#003D7A' }}>Painel da Empresa</h1>
              <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Portfólio de Talentos - OPI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex gap-2">
              <button onClick={() => setCurrentView('projetos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentView === 'projetos' ? 'text-white' : 'hover:bg-gray-100'}`}
                style={currentView === 'projetos' ? { backgroundColor: '#003D7A' } : { color: '#003D7A' }}>
                <Briefcase className="w-4 h-4" /> Projetos
              </button>
              <button onClick={() => setCurrentView('alunos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentView === 'alunos' ? 'text-white' : 'hover:bg-gray-100'}`}
                style={currentView === 'alunos' ? { backgroundColor: '#5CB85C' } : { color: '#5CB85C' }}>
                <Users className="w-4 h-4" /> Alunos
              </button>
            </nav>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium" style={{ color: '#003D7A' }}>{empresaNome}</p>
              <p className="text-xs text-muted-foreground">Empresa Parceira</p>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: '#003D7A' }}>
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* View Alunos */}
        {currentView === 'alunos' && (
          <div>
            <div className="mb-6">
              <h2 style={{ color: '#003D7A' }}>Talentos SENAC</h2>
              <p className="text-sm text-muted-foreground">{alunos.length} aluno(s) com projetos avaliados</p>
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-border mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={alunoSearch} onChange={e => setAlunoSearch(e.target.value)}
                  placeholder="Buscar por nome ou e-mail..."
                  className="w-full pl-9 pr-4 py-2 border rounded-lg outline-none focus:ring-2"
                  style={{ borderColor: 'var(--color-border)' }} />
              </div>
              <select value={alunoCursoFilter} onChange={e => setAlunoCursoFilter(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border rounded-lg outline-none bg-white"
                style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}>
                <option value="Todos os Cursos">Todos os Cursos</option>
                <option value="Análise e Desenvolvimento de Sistemas">ADS</option>
                <option value="Design">Design</option>
                <option value="Gastronomia">Gastronomia</option>
              </select>
            </div>

            {/* Grid de Alunos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alunos
                .filter(a => {
                  const matchSearch = !alunoSearch || a.nome.toLowerCase().includes(alunoSearch.toLowerCase()) || a.email.toLowerCase().includes(alunoSearch.toLowerCase());
                  const matchCurso = alunoCursoFilter === 'Todos os Cursos' || a.turmas.some(t => t.curso === alunoCursoFilter) || a.curso === alunoCursoFilter;
                  return matchSearch && matchCurso;
                })
                .map(aluno => (
                  <button key={aluno.id} onClick={() => setViewingProfile(aluno)}
                    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-border text-left">
                    <div className="flex items-center gap-4 mb-3">
                      {aluno.foto ? (
                        <img src={aluno.foto} alt={aluno.nome} className="w-14 h-14 rounded-full object-cover border-2 flex-shrink-0" style={{ borderColor: '#003D7A' }} />
                      ) : (
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ backgroundColor: '#003D7A' }}>
                          {aluno.nome.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: '#003D7A' }}>{aluno.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">{aluno.email}</p>
                        {aluno.turmas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {aluno.turmas.map((t, i) => (
                              <span key={i} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#E6F2FF', color: '#003D7A' }}>
                                {t.curso === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : t.curso} · {t.nome}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {(aluno.softSkills.length > 0 || aluno.hardSkills.length > 0) && (
                      <p className="text-xs" style={{ color: '#5CB85C' }}>Ver perfil completo →</p>
                    )}
                  </button>
                ))}
            </div>

            {alunos.filter(a => {
              const matchSearch = !alunoSearch || a.nome.toLowerCase().includes(alunoSearch.toLowerCase()) || a.email.toLowerCase().includes(alunoSearch.toLowerCase());
              const matchCurso = alunoCursoFilter === 'Todos os Cursos' || a.turmas.some(t => t.curso === alunoCursoFilter) || a.curso === alunoCursoFilter;
              return matchSearch && matchCurso;
            }).length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-border">
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#5CB85C', opacity: 0.4 }} />
                <p className="text-muted-foreground">Nenhum aluno encontrado</p>
              </div>
            )}
          </div>
        )}

        <div style={{ display: currentView === 'projetos' ? 'block' : 'none' }}>

        {/* Banner */}
        <div className="mb-8 p-4 md:p-6 rounded-xl border-2" style={{ background: 'linear-gradient(to right, #E6F2FF, #FFF4ED)', borderColor: '#003D7A' }}>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#003D7A' }}>
              <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-bold mb-2" style={{ color: '#003D7A' }}>Bem-vindo ao Portfólio de Talentos do SENAC</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                Explore projetos integradores avaliados por nossos professores. Clique em um projeto para ver detalhes e conhecer o perfil dos alunos.
              </p>
              <div className="flex flex-wrap gap-4 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 flex-shrink-0" style={{ color: '#28A745' }} />
                  <span><strong>{projetosExcelentes}</strong> projetos Excelentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 flex-shrink-0" style={{ color: '#5CB85C' }} />
                  <span><strong>{projetosOtimos}</strong> projetos Ótimos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 flex-shrink-0" style={{ color: '#003D7A' }} />
                  <span><strong>{projetos.length}</strong> projetos avaliados</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <h2 className="mb-4" style={{ color: '#003D7A' }}>Projetos Avaliados</h2>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-border space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por projeto, tecnologia, aluno..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <select value={cursoFilter} onChange={(e) => setCursoFilter(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg outline-none bg-white"
                style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}>
                <option value="Todos os Cursos">Todos os Cursos</option>
                <option value="Design">Design</option>
                <option value="Análise e Desenvolvimento de Sistemas">ADS</option>
                <option value="Gastronomia">Gastronomia</option>
              </select>
              <select value={conceitoFilter} onChange={(e) => setConceitoFilter(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border rounded-lg outline-none bg-white"
                style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}>
                <option value="Todos os Conceitos">Todos os Conceitos</option>
                <option value="Excelente">Excelente</option>
                <option value="Ótimo">Ótimo</option>
                <option value="Bom">Bom</option>
                <option value="Ainda não suficiente">Ainda não suficiente</option>
                <option value="Insuficiente">Insuficiente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cards de Projetos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjetos.map((projeto) => (
            <div key={projeto.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="mb-2" style={{ color: '#003D7A' }}>{projeto.titulo}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block px-3 py-1 rounded-full text-xs text-white font-medium"
                      style={{ backgroundColor: getConceitoColor(projeto.conceito) }}>
                      {projeto.conceito}
                    </span>
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#E6F2FF', color: '#003D7A' }}>
                      {projeto.curso === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : projeto.curso}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="w-3 h-3" /> {projeto.curtidas}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{projeto.descricao}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {projeto.tecnologias.split(',').filter(Boolean).map((tech, i) => (
                  <span key={i} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#FFF4ED', color: '#FF6B00' }}>
                    {tech.trim()}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground pb-4 border-b border-border">
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  <span>{projeto.turma}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{projeto.membrosProfiles.length} integrante(s)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setViewingProject(projeto)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 rounded-lg hover:bg-gray-50 transition-all"
                  style={{ color: '#003D7A', borderColor: '#003D7A' }}>
                  <Eye className="w-4 h-4" /> Ver Projeto
                </button>
                {projeto.membrosProfiles.length > 0 && (
                  <button onClick={() => setViewingTeam(projeto.membrosProfiles)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#5CB85C' }}>
                    <Users className="w-4 h-4" /> Ver Equipe
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProjetos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-border">
            <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: '#003D7A', opacity: 0.4 }} />
            <h3 className="mb-2" style={{ color: '#003D7A' }}>Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground">Ajuste os filtros ou tente outra busca</p>
          </div>
        )}

        </div>

        {/* Modal Projeto */}
        {viewingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ color: '#003D7A' }}>{viewingProject.titulo}</h3>
                <button onClick={() => setViewingProject(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-5">
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-sm text-white font-medium"
                    style={{ backgroundColor: getConceitoColor(viewingProject.conceito) }}>
                    ⭐ {viewingProject.conceito}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#E6F2FF', color: '#003D7A' }}>
                    {viewingProject.curso === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : viewingProject.curso}
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm text-muted-foreground bg-gray-100">
                    <Heart className="w-3 h-3" /> {viewingProject.curtidas} curtidas
                  </span>
                </div>

                <div>
                  <label className="font-medium" style={{ color: '#003D7A' }}>Descrição</label>
                  <p className="text-muted-foreground mt-1">{viewingProject.descricao}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium" style={{ color: '#003D7A' }}>Curso</label>
                    <p className="text-muted-foreground mt-1">{viewingProject.curso}</p>
                  </div>
                  <div>
                    <label className="font-medium" style={{ color: '#003D7A' }}>Turma</label>
                    <p className="text-muted-foreground mt-1">{viewingProject.turma}</p>
                  </div>
                </div>

                <div>
                  <label className="font-medium" style={{ color: '#003D7A' }}>Equipe</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewingProject.membrosProfiles.map(m => (
                      <button key={m.id} onClick={() => { setViewingProfile(m); setViewingProject(null); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50 transition-all text-sm"
                        style={{ borderColor: '#5CB85C', color: '#5CB85C' }}>
                        <User className="w-4 h-4" /> {m.nome}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium" style={{ color: '#003D7A' }}>Tecnologias</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewingProject.tecnologias.split(',').filter(Boolean).map((tech, i) => (
                      <span key={i} className="px-3 py-1 rounded text-sm" style={{ backgroundColor: '#FFF4ED', color: '#FF6B00' }}>
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium" style={{ color: '#003D7A' }}>Data de Submissão</label>
                  <p className="text-muted-foreground mt-1">{viewingProject.dataSubmissao.split('-').reverse().join('/')}</p>
                </div>

                {viewingProject.feedback && (
                  <div className="p-4 rounded-xl" style={{ backgroundColor: '#E6F2FF' }}>
                    <label className="font-medium block mb-1" style={{ color: '#003D7A' }}>Feedback do Professor</label>
                    <p className="text-sm text-muted-foreground">{viewingProject.feedback}</p>
                  </div>
                )}

                {(viewingProject.linkGithub || viewingProject.linkProjeto) && (
                  <div className="pt-4 border-t border-border">
                    <label className="font-medium mb-3 block" style={{ color: '#003D7A' }}>Links</label>
                    <div className="space-y-2">
                      {viewingProject.linkGithub && (
                        <a href={viewingProject.linkGithub} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:underline p-2 rounded hover:bg-gray-50"
                          style={{ color: '#003D7A' }}>
                          <Briefcase className="w-4 h-4" /> Repositório GitHub
                        </a>
                      )}
                      {viewingProject.linkProjeto && (
                        <a href={viewingProject.linkProjeto} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:underline p-2 rounded hover:bg-gray-50"
                          style={{ color: '#003D7A' }}>
                          <Eye className="w-4 h-4" /> Projeto em Produção
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => setViewingProject(null)}
                className="w-full mt-6 py-3 border-2 rounded-lg hover:bg-gray-50 transition-all font-medium"
                style={{ color: '#003D7A', borderColor: '#003D7A' }}>
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Modal Equipe */}
        {viewingTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 style={{ color: '#003D7A' }}>Equipe do Projeto</h3>
                  <p className="text-sm text-muted-foreground">{viewingTeam.length} integrante(s) — clique para ver o perfil</p>
                </div>
                <button onClick={() => setViewingTeam(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {viewingTeam.map(membro => (
                  <button key={membro.id}
                    onClick={() => { setViewingProfile(membro); setViewingTeam(null); }}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 hover:border-[#5CB85C] hover:bg-gray-50 transition-all text-left"
                    style={{ borderColor: '#E5E7EB' }}>
                    {membro.foto ? (
                      <img src={membro.foto} alt={membro.nome} className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2" style={{ borderColor: '#003D7A' }} />
                    ) : (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ backgroundColor: '#003D7A' }}>
                        {membro.nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: '#003D7A' }}>{membro.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">{membro.email}</p>
                      {membro.curso && <p className="text-xs text-muted-foreground mt-0.5">{membro.curso === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : membro.curso}</p>}
                      {(membro.softSkills.length > 0 || membro.hardSkills.length > 0) && (
                        <p className="text-xs mt-1" style={{ color: '#5CB85C' }}>Ver perfil completo →</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={() => setViewingTeam(null)}
                className="w-full mt-6 py-3 border-2 rounded-lg hover:bg-gray-50 transition-all font-medium"
                style={{ color: '#003D7A', borderColor: '#003D7A' }}>
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Modal Perfil do Aluno */}
        {viewingProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ color: '#003D7A' }}>Perfil do Aluno</h3>
                <button onClick={() => setViewingProfile(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex items-start gap-5 mb-6 pb-6 border-b border-border">
                {viewingProfile.foto ? (
                  <img src={viewingProfile.foto} alt={viewingProfile.nome}
                    className="w-20 h-20 rounded-full object-cover border-4 flex-shrink-0"
                    style={{ borderColor: '#003D7A' }} />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                    style={{ backgroundColor: '#003D7A' }}>
                    {viewingProfile.nome.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2" style={{ color: '#003D7A' }}>{viewingProfile.nome}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{viewingProfile.email}</span></div>
                    {viewingProfile.turmas.length > 0 ? (
                      viewingProfile.turmas.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          <span>{t.curso === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : t.curso} · {t.nome}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        {viewingProfile.curso && <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /><span>{viewingProfile.curso}</span></div>}
                        {viewingProfile.turma && <div className="flex items-center gap-2"><Award className="w-4 h-4" /><span>{viewingProfile.turma}</span></div>}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {viewingProfile.sobreMim && (
                  <div>
                    <h5 className="font-medium mb-2" style={{ color: '#003D7A' }}>Sobre</h5>
                    <p className="text-muted-foreground text-sm">{viewingProfile.sobreMim}</p>
                  </div>
                )}

                {viewingProfile.softSkills.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3" style={{ color: '#003D7A' }}>Competências Comportamentais</h5>
                    <div className="flex flex-wrap gap-2">
                      {viewingProfile.softSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingProfile.hardSkills.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3" style={{ color: '#003D7A' }}>Competências Técnicas</h5>
                    <div className="flex flex-wrap gap-2">
                      {viewingProfile.hardSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: '#003D7A' }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {!viewingProfile.sobreMim && !viewingProfile.softSkills.length && !viewingProfile.hardSkills.length && (
                  <p className="text-muted-foreground text-sm italic">Este aluno ainda não preencheu o perfil completo.</p>
                )}

                {viewingProfile.projetos.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3" style={{ color: '#003D7A' }}>Projetos Avaliados</h5>
                    <div className="space-y-2">
                      {viewingProfile.projetos.map(p => (
                        <button key={p.id}
                          onClick={() => {
                            const proj = projetos.find(x => x.id === p.id);
                            if (proj) { setViewingProject(proj); setViewingProfile(null); }
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-border hover:bg-blue-50 hover:border-blue-200 transition-all text-left">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 flex-shrink-0" style={{ color: '#FF6B00' }} />
                            <span className="text-sm font-medium">{p.titulo}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="px-2 py-1 rounded-full text-xs text-white"
                              style={{ backgroundColor: getConceitoColor(p.conceito) }}>
                              {p.conceito}
                            </span>
                            <Eye className="w-3 h-3 text-muted-foreground" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#E8F5E9', border: '2px solid #5CB85C' }}>
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#5CB85C' }} />
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: '#5CB85C' }}>Interessado neste talento?</h5>
                      <p className="text-sm text-muted-foreground">
                        Entre em contato: <strong>{viewingProfile.email}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={() => setViewingProfile(null)}
                className="w-full mt-6 py-3 text-white rounded-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: '#003D7A' }}>
                Fechar
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
