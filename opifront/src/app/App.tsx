import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { BookOpen, Users, GraduationCap, Building2, Heart, MessageSquare, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { SenacLogo } from './components/SenacLogo';
import { AlunoPanel } from './components/AlunoPanel';
import { CoordenadorPanel } from './components/CoordenadorPanel';
import { ProfessorPanel } from './components/ProfessorPanel';
import { EmpresaPanel } from './components/EmpresaPanel';
import TermosDeUso from './pages/TermosDeUso';
import PoliticaDePrivacidade from './pages/PoliticaDePrivacidade';

interface UserCredential {
  email: string;
  password: string;
  name: string;
  type: 'aluno' | 'coordenador' | 'professor' | 'empresa';
}

function AppContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggedUserType, setLoggedUserType] = useState<'aluno' | 'coordenador' | 'professor' | 'empresa'>('aluno');
  const [restoring, setRestoring] = useState(true);

  // Restaurar sessão ao recarregar a página
  useEffect(() => {
    const token = localStorage.getItem('opi_token');
    if (!token) { setRestoring(false); return; }
    const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    fetch(`${BASE}/auth/me/`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.id) {
          setIsLoggedIn(true);
          setUserName(data.nome);
          setLoggedUserType(data.perfil.toLowerCase() as 'aluno' | 'coordenador' | 'professor' | 'empresa');
        } else {
          localStorage.removeItem('opi_token');
          localStorage.removeItem('opi_refresh');
        }
      })
      .catch(() => {})
      .finally(() => setRestoring(false));
  }, []);

  // Credenciais de todos os usuários do sistema
  const allUsers: UserCredential[] = [
    { email: 'aluno@senac.edu.br', password: 'senac2026', name: 'João Silva', type: 'aluno' },
    { email: 'coordenador@senac.edu.br', password: 'coord2026', name: 'Dr. Roberto Almeida', type: 'coordenador' },
    { email: 'maria.santos@senac.edu.br', password: 'senha123', name: 'Maria Santos', type: 'aluno' },
    { email: 'pedro.costa@senac.edu.br', password: 'senha123', name: 'Pedro Costa', type: 'aluno' },
    { email: 'carlos.mendes@senac.edu.br', password: 'prof2026', name: 'Prof. Carlos Mendes', type: 'professor' },
    { email: 'ana.lima@senac.edu.br', password: 'prof2026', name: 'Prof. Ana Lima', type: 'professor' },
    { email: 'contato@techsolutions.com', password: 'empresa2026', name: 'Tech Solutions Ltda', type: 'empresa' },
    { email: 'rh@digitalinovacoes.com', password: 'empresa2026', name: 'Digital Inovações', type: 'empresa' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, senha: password })
      });

      const result = await response.json();

      if (!response.ok) {
        setLoginError('E-mail ou senha incorretos. Tente novamente.');
        return;
      }

      localStorage.setItem('opi_token', result.access);
      localStorage.setItem('opi_refresh', result.refresh);
      
      window.scrollTo(0, 0);
      setIsLoggedIn(true);
      setUserName(result.usuario.nome);
      setLoggedUserType(result.usuario.perfil.toLowerCase() as 'aluno' | 'coordenador' | 'professor' | 'empresa');

    } catch (error) {
      setLoginError('Erro ao conectar com o servidor. Verifique sua conexão.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('opi_token');
    localStorage.removeItem('opi_refresh');
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setUserName('');
    setLoginError('');
  };

  if (restoring) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #E6F2FF, #FFFFFF)' }}>
        <div className="text-center">
          <SenacLogo className="h-16 mx-auto mb-4" />
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    if (loggedUserType === 'coordenador') {
      return <CoordenadorPanel onLogout={handleLogout} coordenadorNome={userName} />;
    }
    if (loggedUserType === 'professor') {
      return <ProfessorPanel onLogout={handleLogout} professorNome={userName} />;
    }
    if (loggedUserType === 'empresa') {
      return <EmpresaPanel onLogout={handleLogout} empresaNome={userName} />;
    }
    // Apenas alunos usam o painel de aluno
    return <AlunoPanel onLogout={handleLogout} userName={userName} />;
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Painel do Aluno',
      description: 'Submeta e gerencie seus projetos integradores com controle completo de versões e histórico de avaliações.',
      color: '#003D7A'
    },
    {
      icon: GraduationCap,
      title: 'Painel do Professor',
      description: 'Avalie projetos por rubrica estruturada e registre feedback qualitativo para os alunos.',
      color: '#FF6B00'
    },
    {
      icon: Users,
      title: 'Painel Administrativo',
      description: 'Visão consolidada com dashboard, relatórios e gestão completa de usuários e projetos.',
      color: '#003D7A'
    },
    {
      icon: Building2,
      title: 'Portfólio Público',
      description: 'Empresas parceiras acessam projetos aprovados para identificar e recrutar talentos.',
      color: '#FF6B00'
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #E6F2FF, #FFFFFF, #FFF4ED)' }}>
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SenacLogo className="h-10 md:h-12" />
              <div className="border-l-2 pl-3 md:pl-4" style={{ borderColor: '#FF6B00' }}>
                <h1 className="text-lg md:text-xl font-bold" style={{ color: '#003D7A' }}>
                  OPI
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground">Observatório de Projetos Integradores</p>
              </div>
            </div>
            
            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button 
                onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-sm transition-colors hover:opacity-70" style={{ color: '#003D7A' }}>Início</a>
              <a href="#features" className="text-sm transition-colors hover:opacity-70" style={{ color: '#003D7A' }}>Funcionalidades</a>
              <a href="#login" className="text-sm transition-colors hover:opacity-70" style={{ color: '#FF6B00' }}>Login</a>
            </nav>
          </div>

          {/* Mobile Nav */}
          <div id="mobile-menu" className="hidden md:hidden mt-4 pb-4 border-t border-gray-100">
            <nav className="flex flex-col gap-4 mt-4">
              <a href="#home" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: '#003D7A' }}>Início</a>
              <a href="#features" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: '#003D7A' }}>Funcionalidades</a>
              <a href="#login" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: '#FF6B00' }}>Login</a>
            </nav>
          </div>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: '#FFF4ED', color: '#FF6B00' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FF6B00' }}></span>
              <span className="text-sm font-medium">SENAC | Sistema de Gestão de Projetos</span>
            </div>
            <h2 className="mb-6" style={{ color: '#003D7A' }}>
              Centralize e Potencialize seus Projetos Integradores
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Plataforma completa para submissão, avaliação e vitrine de projetos acadêmicos.
              Eliminamos a fragmentação de e-mails e Teams, oferecendo rastreabilidade,
              portfólio digital e inovação com acessibilidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#login" className="inline-flex items-center justify-center px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: '#003D7A' }}>
                Acessar Sistema
              </a>
              <a href="#features" className="inline-flex items-center justify-center px-6 py-3 bg-white rounded-lg hover:shadow-md transition-all border-2" style={{ color: '#003D7A', borderColor: '#003D7A' }}>
                Conhecer Funcionalidades
                <ChevronDown className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4">Funcionalidades do Sistema</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conheça os módulos que compõem o Observatório de Projetos Integradores,
              desenvolvido para atender alunos, professores, coordenadores e empresas parceiras.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border hover:border-transparent hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: feature.color }}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="differentials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: '#FFF4ED', color: '#FF6B00' }}>
              <span className="text-sm font-medium">Diferenciais de Inovação</span>
            </div>
            <h2 className="mb-4">Tecnologia com Impacto Social</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Recursos exclusivos que elevam a plataforma além da gestão acadêmica tradicional.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="relative p-8 rounded-2xl border-2 overflow-hidden flex flex-col h-full" style={{ background: 'linear-gradient(to bottom right, #FFF4ED, #FFE8D6)', borderColor: '#FF6B00' }}>
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#FF6B00' }}>
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-1" style={{ color: '#FF6B00' }}>DIFERENCIAL 1</div>
                    <h3 className="leading-tight">Feed Social com Ranqueamento</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Sistema de curtidas e ranqueamento automático por engajamento. Projetos com mais curtidas
                  recebem destaque visual no topo do feed, incentivando qualidade e motivação dos alunos.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs mt-auto" style={{ color: '#FF6B00' }}>
                <Heart className="w-4 h-4" />
                <span>Curtida única por usuário por projeto</span>
              </div>
            </div>

            <div className="relative p-8 rounded-2xl border-2 overflow-hidden flex flex-col h-full" style={{ background: 'linear-gradient(to bottom right, #EAF3FA, #D4E6F6)', borderColor: '#003D7A' }}>
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#003D7A' }}>
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-1" style={{ color: '#003D7A' }}>DIFERENCIAL 2</div>
                    <h3 className="leading-tight">Chat Interno para Equipes</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Comunicação direta e integrada na plataforma. Os alunos podem debater ideias, organizar tarefas e alinhar o andamento das entregas do projeto com sua equipe em tempo real.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs mt-auto" style={{ color: '#003D7A' }}>
                <MessageSquare className="w-4 h-4" />
                <span>Colaboração centralizada e segura</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="login" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-border">
            <div className="text-center mb-8">
              <div className="mx-auto mb-6 flex justify-center">
                <SenacLogo className="h-20" />
              </div>
              <h2 className="mb-2">Acesse sua Conta</h2>
              <p className="text-sm text-muted-foreground">
                Entre com suas credenciais fornecidas pelo coordenador
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE', color: '#C00' }}>
                  {loginError}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block mb-2">E-mail</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border outline-none transition-all focus:ring-2"
                  style={{
                    borderColor: 'var(--color-border)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#003D7A';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 61, 122, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-2">Senha</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border outline-none transition-all pr-12"
                    style={{
                      borderColor: 'var(--color-border)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#003D7A';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 61, 122, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-muted-foreground">Lembrar-me</span>
                  </label>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="rounded mt-0.5 flex-shrink-0" required />
                  <label className="text-muted-foreground leading-relaxed">
                    Li e estou de acordo com o{' '}
                    <a href="/termos" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70 transition-opacity" style={{ color: '#003D7A' }}>
                      Termo de Uso
                    </a>
                    {' '}e{' '}
                    <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70 transition-opacity" style={{ color: '#003D7A' }}>
                      Política de Privacidade
                    </a>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 text-white rounded-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: '#003D7A' }}
              >
                Entrar no Sistema
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#E6F2FF', borderLeft: '4px solid #003D7A' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: '#003D7A' }}>Aluno:</p>
                  <p className="text-xs text-muted-foreground">E-mail: <span className="font-medium">aluno@senac.edu.br</span></p>
                  <p className="text-xs text-muted-foreground">Senha: <span className="font-medium">senac2026</span></p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF4ED', borderLeft: '4px solid #FF6B00' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: '#FF6B00' }}>Coordenador:</p>
                  <p className="text-xs text-muted-foreground">E-mail: <span className="font-medium">coordenador@senac.edu.br</span></p>
                  <p className="text-xs text-muted-foreground">Senha: <span className="font-medium">coord2026</span></p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#E8F5E9', borderLeft: '4px solid #5CB85C' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: '#5CB85C' }}>Professor:</p>
                  <p className="text-xs text-muted-foreground">E-mail: <span className="font-medium">carlos.mendes@senac.edu.br</span></p>
                  <p className="text-xs text-muted-foreground">Senha: <span className="font-medium">prof2026</span></p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF9E6', borderLeft: '4px solid #D4A017' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: '#D4A017' }}>Empresa:</p>
                  <p className="text-xs text-muted-foreground">E-mail: <span className="font-medium">contato@techsolutions.com</span></p>
                  <p className="text-xs text-muted-foreground">Senha: <span className="font-medium">empresa2026</span></p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Não possui acesso ou esqueceu sua senha? Entre em contato com o <span className="font-medium" style={{ color: '#FF6B00' }}>Coordenador</span> para assistência.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-white py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#003D7A' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <SenacLogo className="h-12" style={{ filter: 'brightness(0) invert(1)' }} />
              </div>
              <p className="text-sm opacity-90">
                Observatório de Projetos Integradores - Centralizando o ciclo de vida dos PIs do SENAC.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-white">Instituição</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>SENAC</li>
                <li>Fecomércio / Sesc</li>
                <li>Sistema Acadêmico</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-white">Tecnologias</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>Python + Django</li>
                <li>HTML5 + CSS3 + Bootstrap</li>
                <li>PostgreSQL</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm opacity-90" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
            <p>© 2026 Observatório de Projetos Integradores - SENAC</p>
            <p className="mt-2 text-xs">Versão 1.0 | Conformidade LGPD</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/termos" element={<TermosDeUso />} />
        <Route path="/privacidade" element={<PoliticaDePrivacidade />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}