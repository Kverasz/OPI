import { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Edit, Trash2, Eye, LogOut, User, Heart, Users, MessageCircle, Video, Send, Paperclip, Camera, Mail } from 'lucide-react';
import { SenacLogo } from './SenacLogo';
import { api } from '../api';

type Conceito = 'Insuficiente' | 'Ainda não suficiente' | 'Bom' | 'Ótimo' | 'Excelente';

interface AvaliacaoRubrica {
  criterioNome: string;
  criterioDescricao: string;
  conceito: Conceito;
  observacao: string;
}

interface AvaliacaoDetalhes {
  professorNome: string;
  data: string;
  rubricaAssinatura: string;
  rubricas: AvaliacaoRubrica[];
}

interface Project {
  id: number;
  titulo: string;
  descricao: string;
  turma: string;
  membros: string;
  tecnologias: string;
  status: 'Pendente' | 'Em Avaliação' | 'Avaliado';
  dataSubmissao: string;
  conceito?: Conceito;
  feedback?: string;
  grupoId: number;
  grupoNome?: string;
  autor?: string;
  curtidas?: number;
  curtidasUsuarios?: number[];
  linkGithub?: string;
  linkProjeto?: string;
  linkDocumentacao?: string;
  linkVideo?: string;
  publicadoNoFeed?: boolean;
  curso?: string;
  avaliacaoDetalhes?: AvaliacaoDetalhes;
}

interface Grupo {
  id: number;
  nome: string;
  turmaId: number;
  membros: { nome: string; email: string; curso?: string; foto?: string }[];
  descricao: string;
  cor: string;
}

interface Message {
  id: number;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  tipo: 'TEXTO' | 'ARQUIVO';
  arquivoUrl?: string;
  nomeArquivo?: string;
}

interface AlunoPanelProps {
  onLogout: () => void;
  userName: string;
}

export function AlunoPanel({ onLogout, userName }: AlunoPanelProps) {
  const [currentView, setCurrentView] = useState<'projects' | 'feed' | 'groups' | 'profile'>('feed');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [activeChat, setActiveChat] = useState<'texto' | 'video' | 'membros'>('texto');
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [naoLidas, setNaoLidas] = useState<Record<number, number>>({});
  const [inCall, setInCall] = useState(false);
  const [myChannel, setMyChannel] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [loadingCall, setLoadingCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peersInRoom, setPeersInRoom] = useState<{id: number; nome: string; channel: string}[]>([]);
  const [remotePeers, setRemotePeers] = useState<{id: number; nome: string; channel: string; stream?: MediaStream}[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoWsRef = useRef<WebSocket | null>(null);  // WS de presença (aba vídeo)
  const callWsRef = useRef<WebSocket | null>(null);   // WS dedicado à chamada
  const pcRefs = useRef<Record<string, RTCPeerConnection>>({});
  const pendingIce = useRef<Record<string, RTCIceCandidateInit[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const wsRefs = useRef<Record<number, WebSocket>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState({
    id: 0,
    nome: '',
    email: '',
    turma: '',
    turmas: [] as {id: number; nome: string; curso: string}[],
    curso: '',
    foto: '',
    sobreMim: '',
    softSkills: [] as string[],
    hardSkills: [] as string[]
  });

  const [isEditingSobreMim, setIsEditingSobreMim] = useState(false);
  const [isEditingSoftSkills, setIsEditingSoftSkills] = useState(false);
  const [isEditingHardSkills, setIsEditingHardSkills] = useState(false);

  const availableSoftSkills = [
    "Comunicação", "Trabalho em Equipe", "Liderança", "Criatividade", "Empatia", "Resolução de Problemas",
    "Pensamento Crítico", "Adaptabilidade", "Gestão de Tempo", "Inteligência Emocional", "Colaboração",
    "Proatividade", "Flexibilidade", "Resiliência", "Organização", "Negociação", "Persuasão", "Ética",
    "Autoconfiança", "Gestão de Conflitos"
  ];

  const availableHardSkills = [
    "Python", "JavaScript", "TypeScript", "Java", "C#", "C++", "PHP", "Ruby", "HTML", "CSS", "React",
    "Angular", "Vue.js", "Node.js", "Django", "Flask", "Spring Boot", "Laravel", "SQL", "MongoDB",
    "PostgreSQL", "MySQL", "Git", "Docker", "Kubernetes", "AWS", "Azure", "Firebase", "Figma",
    "Adobe XD", "Photoshop", "Illustrator", "Excel", "Power BI", "Tableau", "Scrum", "Kanban", "DevOps",
    "Machine Learning", "Data Science"
  ];

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [minhasTurmas, setMinhasTurmas] = useState<{id: number; nome: string}[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurso, setSelectedCurso] = useState('Todos os Cursos');

  const [mensagens, setMensagens] = useState<Record<number, Message[]>>({});

  const [newMessage, setNewMessage] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    api.listarProjetos().then((data: any) => {
      if (Array.isArray(data.results || data)) {
        const lista = data.results || data;
        setProjects(lista.map((p: any) => ({
          id: p.id,
          titulo: p.titulo,
          descricao: p.descricao,
          turma: p.turma?.nome || p.turma || '',
          membros: p.membros_detalhe?.map((m: any) => m.usuario?.nome).join(', ') || '',
          tecnologias: p.tecnologias?.map((t: any) => t.tecnologia).join(', ') || '',
          status: p.status === 'PENDENTE' ? 'Pendente' : p.status === 'EM_AVALIACAO' ? 'Em Avaliação' : 'Avaliado',
          dataSubmissao: p.criado_em?.split('T')[0] || '',
          conceito: p.conceito ? normalizarConceito(p.conceito) : undefined,
          feedback: p.feedback_geral || undefined,
          avaliacaoDetalhes: mapearAvaliacaoDetalhes(p),
          grupoId: p.grupo_id || 0,
          grupoNome: p.grupo_nome || undefined,
          autor: p.criado_por?.nome || '',
          curtidas: p.total_curtidas || 0,
          curtidasUsuarios: p.usuario_curtiu ? [1] : [],
          linkGithub: p.link_repositorio || '',
          linkProjeto: p.link_demo || '',
          publicadoNoFeed: p.publicado_no_feed || false,
        })));
      }
      setLoadingProjects(false);
    }).catch(() => setLoadingProjects(false));

    // Feed — projetos avaliados de todos
    api.listarFeed().then((data: any) => {
      const lista = data.results || data;
      if (Array.isArray(lista)) {
        setFeedProjects(lista.map((p: any) => ({
          id: p.id,
          titulo: p.titulo,
          descricao: p.descricao,
          turma: p.turma?.nome || '',
          membros: p.membros_detalhe?.map((m: any) => m.usuario?.nome).join(', ') || '',
          tecnologias: p.tecnologias?.map((t: any) => t.tecnologia).join(', ') || '',
          status: 'Avaliado' as const,
          dataSubmissao: p.criado_em?.split('T')[0] || '',
          conceito: p.conceito ? normalizarConceito(p.conceito) : undefined,
          feedback: p.feedback_geral || undefined,
          avaliacaoDetalhes: mapearAvaliacaoDetalhes(p),
          grupoId: p.grupo_id || 0,
          grupoNome: p.grupo_nome || undefined,
          autor: p.criado_por?.nome || '',
          curtidas: p.total_curtidas || 0,
          curtidasUsuarios: p.usuario_curtiu ? [1] : [],
          linkGithub: p.link_repositorio || '',
          linkProjeto: p.link_demo || '',
          publicadoNoFeed: true,
          curso: p.area_tematica || '',
        })));
      }
    });
    // Carregar grupos do aluno
    api.listarGrupos().then((data: any) => {
      const lista = data.results || data;
      if (Array.isArray(lista)) {
        const gruposCarregados = lista.map((g: any) => ({
          id: g.id,
          nome: g.nome,
          turmaId: g.turma?.id || 0,
          membros: g.membros?.map((m: any) => ({ nome: m.nome, email: m.email, curso: m.curso || '', foto: m.foto_url || '' })) || [],
          descricao: g.descricao || '',
          cor: g.cor || '#003D7A'
        }));
        setGrupos(gruposCarregados);

        // Conecta WebSocket para cada grupo
        const token = localStorage.getItem('opi_token');
        gruposCarregados.forEach((g: any) => {
          if (wsRefs.current[g.id]) return; // já conectado
          const ws = new WebSocket(`${(import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000')}/ws/chat-grupo/${g.id}/?token=${token}`);
          ws.onmessage = (event) => {
            const d = JSON.parse(event.data);
            const msg: Message = {
              id: d.id,
              userId: String(d.autor?.id || ''),
              userName: d.autor?.nome || '',
              text: d.conteudo,
              timestamp: new Date(d.enviada_em).toLocaleString('pt-BR'),
              tipo: d.tipo || 'TEXTO',
              arquivoUrl: d.arquivo_url || undefined,
              nomeArquivo: d.nome_arquivo || undefined,
            };
            setMensagens(prev => ({
              ...prev,
              [g.id]: [...(prev[g.id] || []), msg],
            }));
            // Incrementa não lidas se não estiver vendo este grupo
            setSelectedGroup(current => {
              if (current !== g.id) {
                setNaoLidas(prev => ({ ...prev, [g.id]: (prev[g.id] || 0) + 1 }));
              }
              return current;
            });
          };
          ws.onerror = () => {};
          wsRefs.current[g.id] = ws;
        });
      }
    });
    // Carregar turmas do aluno
    api.minhasTurmas().then((turmas: any[]) => {
      setMinhasTurmas(turmas.map((t: any) => ({ id: t.id, nome: t.nome })));
    });

    // Carregar perfil do aluno logado
    api.meuPerfil().then((u: any) => {
      const turmasDoAluno = (u.turmas || []).map((t: any) => ({
        id: t.id,
        nome: t.nome,
        curso: getCurso(t.nome),
      }));
      setProfile({
        id: u.id || 0,
        nome: u.nome || '',
        email: u.email || '',
        turma: u.turmas?.[0]?.nome || '',
        turmas: turmasDoAluno,
        curso: u.curso || turmasDoAluno[0]?.curso || '',
        foto: u.foto_url || '',
        sobreMim: u.sobre_mim || '',
        hardSkills: Array.isArray(u.hard_skills) ? u.hard_skills : [],
        softSkills: Array.isArray(u.soft_skills) ? u.soft_skills : [],
      });
    });
  }, []);

  // Fecha todos os WebSockets ao desmontar o componente
  useEffect(() => {
    return () => {
      Object.values(wsRefs.current).forEach(ws => ws.close());
    };
  }, []);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, selectedGroup]);

  // Seta srcObject sempre que localStream ou inCall mudar
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, inCall]);

  // WS de presença: só conecta quando na aba vídeo e NÃO estiver em chamada
  useEffect(() => {
    if (activeChat !== 'video' || !selectedGroup || inCall) return;
    if (videoWsRef.current && videoWsRef.current.readyState <= WebSocket.OPEN) return;

    const token = localStorage.getItem('opi_token');
    const ws = new WebSocket(`${(import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000')}/ws/video-grupo/${selectedGroup}/?token=${token}&modo=presenca`);
    videoWsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'room-status') {
        setPeersInRoom(
          (data.participants || [])
            .filter((p: any) => p.user_id !== profile.id)
            .map((p: any) => ({ id: p.user_id, nome: p.user_nome || 'Participante', channel: p.channel }))
        );
      } else if (data.type === 'peer-joined') {
        if (data.user_id !== profile.id) {
          setPeersInRoom(prev => [...prev.filter(p => p.channel !== data.channel), { id: data.user_id, nome: data.user_nome || 'Participante', channel: data.channel }]);
        }
      } else if (data.type === 'peer-left') {
        setPeersInRoom(prev => prev.filter(p => p.id !== data.user_id));
      }
    };
    ws.onerror = () => {};

    return () => {
      ws.close();
      videoWsRef.current = null;
      setPeersInRoom([]);
    };
  }, [activeChat, selectedGroup, inCall]);

  const [feedProjects, setFeedProjects] = useState<Project[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
      titulo: '',
      descricao: '',
      turma: '',
      membros: '',
      tecnologias: '',
      linkGithub: '',
      linkProjeto: '',
      linkDocumentacao: '',
      linkVideo: '',
      grupoSelecionado: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const grupoSelecionado = grupos.find(g => g.id === formData.grupoSelecionado);
    const membrosIds = grupoSelecionado?.membros || [];

    const payload = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      area_tematica: formData.turma,
      turma: Number(formData.turma) || 1,
      link_repositorio: formData.linkGithub,
      link_demo: formData.linkProjeto,
      tecnologias: formData.tecnologias.split(',').map(t => t.trim()),
      grupo_id: formData.grupoSelecionado || null,
    };

    if (editingProject) {
      await api.editarProjeto(editingProject.id, payload);
    } else {
      await api.criarProjeto(payload);
    }

    const data = await api.listarProjetos();
    const lista = data.results || data;
    setProjects(lista.map((p: any) => ({
      id: p.id,
      titulo: p.titulo,
      descricao: p.descricao,
      turma: p.turma?.nome || p.turma || '',
      membros: p.membros_detalhe?.map((m: any) => m.usuario?.nome).join(', ') || '',
      tecnologias: p.tecnologias?.map((t: any) => t.tecnologia).join(', ') || '',
      status: p.status === 'PENDENTE' ? 'Pendente' : p.status === 'EM_AVALIACAO' ? 'Em Avaliação' : 'Avaliado',
      dataSubmissao: p.criado_em?.split('T')[0] || '',
      conceito: p.conceito ? normalizarConceito(p.conceito) : undefined,
      feedback: p.feedback_geral || undefined,
      grupoId: p.grupo_id || 0,
      autor: p.criado_por?.nome || '',
      curtidas: p.total_curtidas || 0,
      curtidasUsuarios: p.usuario_curtiu ? [1] : [],
      linkGithub: p.link_repositorio || '',
      linkProjeto: p.link_demo || '',
    })));

    setFormData({ titulo: '', descricao: '', turma: '', membros: '', tecnologias: '', linkGithub: '', linkProjeto: '', linkDocumentacao: '', linkVideo: '', grupoSelecionado: 0 });
    setShowForm(false);
    setEditingProject(null);
  };

  const handleEdit = (project: Project) => {
    if (project.status !== 'Pendente') {
      alert('Apenas projetos com status "Pendente" podem ser editados.');
      return;
    }
    setEditingProject(project);
    setFormData({
      titulo: project.titulo,
      descricao: project.descricao,
      turma: project.turma,
      membros: project.membros,
      tecnologias: project.tecnologias,
      linkGithub: project.linkGithub || '',
      linkProjeto: project.linkProjeto || '',
      linkDocumentacao: project.linkDocumentacao || '',
      linkVideo: project.linkVideo || '',
      grupoSelecionado: project.grupoId || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
  const project = projects.find(p => p.id === id);
    if (project?.status !== 'Pendente') {
      alert('Apenas projetos com status "Pendente" podem ser excluídos.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      await api.deletarProjeto(id);
      setProjects(projects.filter(p => p.id !== id));
    }
  };

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

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  function criarPeerConnection(channel: string, callWs: WebSocket) {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRefs.current[channel] = pc;
    localStreamRef.current?.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));

    pc.onicecandidate = (e) => {
      if (e.candidate && callWs.readyState === WebSocket.OPEN) {
        callWs.send(JSON.stringify({ type: 'ice-candidate', target: channel, payload: e.candidate.toJSON() }));
      }
    };

    pc.ontrack = (e) => {
      setRemotePeers(prev => prev.map(p =>
        p.channel === channel ? { ...p, stream: e.streams[0] } : p
      ));
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') pc.restartIce();
    };

    return pc;
  }

  async function addIceOrBuffer(channel: string, candidate: RTCIceCandidateInit) {
    const pc = pcRefs.current[channel];
    if (pc && pc.remoteDescription) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    } else {
      if (!pendingIce.current[channel]) pendingIce.current[channel] = [];
      pendingIce.current[channel].push(candidate);
    }
  }

  async function flushIce(channel: string) {
    const pc = pcRefs.current[channel];
    if (!pc) return;
    for (const c of (pendingIce.current[channel] || [])) {
      await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
    }
    delete pendingIce.current[channel];
  }

  async function iniciarChamada() {
    if (!selectedGroup || loadingCall || inCall) return;
    setLoadingCall(true);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      alert('Não foi possível acessar câmera/microfone.\nVerifique as permissões do navegador.');
      setLoadingCall(false);
      return;
    }

    localStreamRef.current = stream;

    // Fecha WS de presença — evita dupla entrada na sala de sinalização
    videoWsRef.current?.close();
    videoWsRef.current = null;

    // Cria WS dedicado à chamada
    const token = localStorage.getItem('opi_token');
    const wsUrl = `${(import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000')}/ws/video-grupo/${selectedGroup}/?token=${token}`;
    const callWs = new WebSocket(wsUrl);
    callWsRef.current = callWs;

    callWs.onopen = () => {
      // Atualiza stream e inCall no mesmo ciclo de render
      setLocalStream(stream);
      setInCall(true);
      setLoadingCall(false);
    };

    callWs.onerror = () => {
      stream.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      if (callWsRef.current === callWs) callWsRef.current = null;
      setLocalStream(null);
      setInCall(false);
      setLoadingCall(false);
      alert('Erro ao conectar na chamada. Verifique sua conexão.');
    };

    callWs.onclose = (e) => {
      // Só encerra a chamada se ainda estamos nela com este WS
      if (callWsRef.current === callWs && e.code !== 1000) {
        // Fechamento inesperado
        stream.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        callWsRef.current = null;
        Object.values(pcRefs.current).forEach(pc => pc.close());
        pcRefs.current = {};
        setLocalStream(null);
        setInCall(false);
        setRemotePeers([]);
      }
    };

    callWs.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'room-status') {
        setMyChannel(data.my_channel);
        setPeersInRoom(
          (data.participants || [])
            .filter((p: any) => p.user_id !== profile.id)
            .map((p: any) => ({ id: p.user_id, nome: p.user_nome || 'Participante', channel: p.channel }))
        );
        for (const peer of (data.participants || [])) {
          setRemotePeers(prev => [...prev.filter(p => p.channel !== peer.channel),
            { id: peer.user_id, nome: peer.user_nome, channel: peer.channel }]);
          const pc = criarPeerConnection(peer.channel, callWs);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          callWs.send(JSON.stringify({ type: 'offer', target: peer.channel, payload: offer }));
        }
      } else if (data.type === 'peer-joined') {
        setPeersInRoom(prev => [...prev.filter(p => p.channel !== data.channel),
          { id: data.user_id, nome: data.user_nome, channel: data.channel }]);
        setRemotePeers(prev => [...prev.filter(p => p.channel !== data.channel),
          { id: data.user_id, nome: data.user_nome, channel: data.channel }]);
      } else if (data.type === 'offer') {
        setRemotePeers(prev => [...prev.filter(p => p.channel !== data.from_channel),
          { id: data.from_user_id, nome: data.from_user_nome, channel: data.from_channel }]);
        const pc = criarPeerConnection(data.from_channel, callWs);
        await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
        await flushIce(data.from_channel);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        callWs.send(JSON.stringify({ type: 'answer', target: data.from_channel, payload: answer }));
      } else if (data.type === 'answer') {
        const pc = pcRefs.current[data.from_channel];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
          await flushIce(data.from_channel);
        }
      } else if (data.type === 'ice-candidate') {
        await addIceOrBuffer(data.from_channel, data.payload);
      } else if (data.type === 'peer-left') {
        pcRefs.current[data.user_id] && pcRefs.current[data.user_id]?.close();
        setRemotePeers(prev => prev.filter(p => p.id !== data.user_id));
        setPeersInRoom(prev => prev.filter(p => p.id !== data.user_id));
      }
    };
  }

  function sairDaChamada() {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    Object.values(pcRefs.current).forEach(pc => pc.close());
    pcRefs.current = {};
    pendingIce.current = {};
    callWsRef.current?.close();
    callWsRef.current = null;
    setInCall(false);
    setLoadingCall(false);
    setLocalStream(null);
    setRemotePeers([]);
    setPeersInRoom([]); // limpa quem estava na chamada ao sair
    setMyChannel('');
    setMicOn(true);
    setCamOn(true);
  }

  function toggleMic() {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(prev => !prev);
  }

  function toggleCam() {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOn(prev => !prev);
  }

  function getCurso(turma: string): string {
    const n = turma.toUpperCase();
    if (n.startsWith('ADS')) return 'Análise e Desenvolvimento de Sistemas';
    if (n.startsWith('DESIGN')) return 'Design';
    if (n.startsWith('GASTRO')) return 'Gastronomia';
    return '';
  }

  function mapearAvaliacaoDetalhes(p: any): AvaliacaoDetalhes | undefined {
    if (!p.conceito) return undefined;
    const conceitoMap: Record<string, Conceito> = {
      EXCELENTE: 'Excelente', OTIMO: 'Ótimo', BOM: 'Bom',
      AINDA_NAO_SUFICIENTE: 'Ainda não suficiente', INSUFICIENTE: 'Insuficiente',
    };
    return {
      professorNome: p.avaliador_nome || '',
      data: p.avaliado_em || '',
      rubricaAssinatura: p.rubrica_assinatura || '',
      rubricas: (p.rubricas_avaliacao || []).map((r: any) => ({
        criterioNome: r.criterio_nome || '',
        criterioDescricao: r.criterio_descricao || '',
        conceito: conceitoMap[r.conceito] || r.conceito as Conceito,
        observacao: r.comentario || '',
      })),
    };
  }

  function normalizarConceito(conceito: string): Conceito {
    const map: Record<string, Conceito> = {
      'INSUFICIENTE': 'Insuficiente',
      'AINDA_NAO_SUFICIENTE': 'Ainda não suficiente',
      'BOM': 'Bom',
      'OTIMO': 'Ótimo',
      'EXCELENTE': 'Excelente',
    };
    return map[conceito] || conceito as Conceito;
  }

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

  const handleCurtir = async (projectId: number) => {
    await api.curtirProjeto(projectId);
    
    // Atualiza localmente o contador
    const update = (project: Project) => {
      if (project.id !== projectId) return project;
      const curtiu = project.curtidasUsuarios?.includes(1) || false;
      return {
        ...project,
        curtidas: curtiu ? (project.curtidas || 0) - 1 : (project.curtidas || 0) + 1,
        curtidasUsuarios: curtiu
          ? project.curtidasUsuarios?.filter(id => id !== 1) || []
          : [...(project.curtidasUsuarios || []), 1]
      };
    };
    setFeedProjects(feedProjects.map(update));
    setProjects(projects.map(update));
  };

  const recarregarMensagens = async (grupoId: number) => {
    const data = await api.listarMensagens(grupoId);
    const lista = Array.isArray(data) ? data : data.results || [];
    setMensagens(prev => ({
      ...prev,
      [grupoId]: lista.map((m: any) => ({
        id: m.id,
        userId: String(m.autor?.id || ''),
        userName: m.autor?.nome || '',
        text: m.conteudo,
        timestamp: new Date(m.enviada_em).toLocaleString('pt-BR'),
        tipo: m.tipo || 'TEXTO',
        arquivoUrl: m.arquivo_url || undefined,
        nomeArquivo: m.nome_arquivo || undefined,
      }))
    }));
  };

  const [enviando, setEnviando] = useState(false);
  const [imagemExpandida, setImagemExpandida] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (selectedGroup === null || enviando) return;

    if (arquivoSelecionado) {
      setEnviando(true);
      const arquivo = arquivoSelecionado;
      const legenda = newMessage.trim();
      setArquivoSelecionado(null);
      setNewMessage('');
      try {
        await api.enviarArquivoGrupo(selectedGroup, arquivo, legenda);
        await recarregarMensagens(selectedGroup);
      } finally {
        setEnviando(false);
      }
    } else {
      if (!newMessage.trim()) return;
      const texto = newMessage.trim();
      setNewMessage('');
      const ws = wsRefs.current[selectedGroup];
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ conteudo: texto }));
      } else {
        await api.enviarMensagem(selectedGroup, texto);
        await recarregarMensagens(selectedGroup);
      }
    }
  };

  
  const handleSelecionarGrupo = async (grupoId: number) => {
    setSelectedGroup(grupoId);
    setNaoLidas(prev => ({ ...prev, [grupoId]: 0 }));

    // Carrega histórico via REST apenas se ainda não carregado
    if (!mensagens[grupoId]) {
      try {
        const data = await api.listarMensagens(grupoId);
        const lista = Array.isArray(data) ? data : data.results || [];
        setMensagens(prev => ({
          ...prev,
          [grupoId]: lista.map((m: any) => ({
            id: m.id,
            userId: String(m.autor?.id || ''),
            userName: m.autor?.nome || '',
            text: m.conteudo,
            timestamp: new Date(m.enviada_em).toLocaleString('pt-BR'),
            tipo: m.tipo || 'TEXTO',
            arquivoUrl: m.arquivo_url || undefined,
            nomeArquivo: m.nome_arquivo || undefined,
          }))
        }));
      } catch (e) {
        console.error('Erro ao carregar mensagens:', e);
      }
    }
  };

  const handlePublicarNoFeed = async (projectId: number) => {
    const result = await api.publicarNoFeed(projectId);
    if (result?.detail) {
      alert(result.detail);
      return;
    }
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, publicadoNoFeed: result.publicado_no_feed } : p
    ));
    // Recarrega o feed
    api.listarFeed().then((data: any) => {
      const lista = data.results || data;
      if (Array.isArray(lista)) {
        setFeedProjects(lista.map((p: any) => ({
          id: p.id,
          titulo: p.titulo,
          descricao: p.descricao,
          turma: p.turma?.nome || '',
          membros: p.membros_detalhe?.map((m: any) => m.usuario?.nome).join(', ') || '',
          tecnologias: p.tecnologias?.map((t: any) => t.tecnologia).join(', ') || '',
          status: 'Avaliado' as const,
          dataSubmissao: p.criado_em?.split('T')[0] || '',
          conceito: p.conceito ? normalizarConceito(p.conceito) : undefined,
          feedback: p.feedback_geral || undefined,
          avaliacaoDetalhes: mapearAvaliacaoDetalhes(p),
          grupoId: p.grupo_id || 0,
          grupoNome: p.grupo_nome || undefined,
          autor: p.criado_por?.nome || '',
          curtidas: p.total_curtidas || 0,
          curtidasUsuarios: p.usuario_curtiu ? [1] : [],
          linkGithub: p.link_repositorio || '',
          linkProjeto: p.link_demo || '',
          publicadoNoFeed: true,
          curso: p.area_tematica || '',
        })));
      }
    });
  };

  const toggleSoftSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      softSkills: prev.softSkills.includes(skill)
        ? prev.softSkills.filter(s => s !== skill)
        : [...prev.softSkills, skill]
    }));
  };

  const toggleHardSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      hardSkills: prev.hardSkills.includes(skill)
        ? prev.hardSkills.filter(s => s !== skill)
        : [...prev.hardSkills, skill]
    }));
  };

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
                  Painel do Aluno
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Observatório de Projetos Integradores</p>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={() => setCurrentView('profile')}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {profile.foto ? (
                  <img src={profile.foto} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5" style={{ color: '#003D7A' }} />
                )}
              </button>
              <button 
                onClick={() => document.getElementById('aluno-mobile-menu')?.classList.toggle('hidden')}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setCurrentView('feed')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentView === 'feed' ? 'text-white' : 'hover:bg-gray-100'
                }`}
                style={currentView === 'feed' ? { backgroundColor: '#FF6B00' } : { color: '#FF6B00' }}
              >
                <Heart className="w-4 h-4" />
                Avaliados
              </button>
              <button
                onClick={() => setCurrentView('projects')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentView === 'projects' ? 'text-white' : 'hover:bg-gray-100'
                }`}
                style={currentView === 'projects' ? { backgroundColor: '#003D7A' } : { color: '#003D7A' }}
              >
                <BookOpen className="w-4 h-4" />
                Projetos
              </button>
              <button
                onClick={() => setCurrentView('groups')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative ${
                  currentView === 'groups' ? 'text-white' : 'hover:bg-gray-100'
                }`}
                style={currentView === 'groups' ? { backgroundColor: '#5CB85C' } : { color: '#5CB85C' }}
              >
                <Users className="w-4 h-4" />
                Grupos
                {Object.values(naoLidas).reduce((a, b) => a + b, 0) > 0 && currentView !== 'groups' && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: '#FF6B00' }}>
                    {Object.values(naoLidas).reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </button>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => setCurrentView('profile')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  currentView === 'profile' ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                {profile.foto ? (
                  <img src={profile.foto} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5" style={{ color: '#003D7A' }} />
                )}
                <span className="text-sm font-medium" style={{ color: '#003D7A' }}>{userName}</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: '#003D7A' }}
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>

          {/* Mobile Menu Content */}
          <div id="aluno-mobile-menu" className="hidden md:hidden mt-4 pb-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => { setCurrentView('feed'); document.getElementById('aluno-mobile-menu')?.classList.add('hidden'); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all w-full text-left ${
                  currentView === 'feed' ? 'bg-[#FFF4ED] text-[#FF6B00] font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart className="w-5 h-5" />
                Avaliados
              </button>
              <button
                onClick={() => { setCurrentView('projects'); document.getElementById('aluno-mobile-menu')?.classList.add('hidden'); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all w-full text-left ${
                  currentView === 'projects' ? 'bg-[#E6F2FF] text-[#003D7A] font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Projetos
              </button>
              <button
                onClick={() => { setCurrentView('groups'); document.getElementById('aluno-mobile-menu')?.classList.add('hidden'); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all w-full text-left ${
                  currentView === 'groups' ? 'bg-[#E8F5E9] text-[#5CB85C] font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                Grupos
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-all w-full text-left mt-2"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="mb-4 md:mb-6" style={{ color: '#003D7A' }}>
                {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2">Título do Projeto</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2"
                    style={{ borderColor: 'var(--color-border)' }}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 min-h-[100px]"
                    style={{ borderColor: 'var(--color-border)' }}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Turma</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 bg-white"
                    style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}
                    value={formData.turma}
                    onChange={(e) => setFormData({ ...formData, turma: e.target.value, grupoSelecionado: 0 })}
                    required
                  >
                    <option value="">Selecione sua turma</option>
                    {minhasTurmas.map(t => (
                      <option key={t.id} value={String(t.id)}>{t.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Grupo</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 bg-white"
                    style={{ borderColor: 'var(--color-border)', color: '#003D7A' }}
                    value={formData.grupoSelecionado || ''}
                    onChange={(e) => setFormData({ ...formData, grupoSelecionado: Number(e.target.value) })}
                    required
                  >
                    <option value="">{formData.turma ? 'Selecione seu grupo' : 'Selecione uma turma primeiro'}</option>
                    {grupos
                      .filter(g => !formData.turma || g.turmaId === Number(formData.turma))
                      .map(g => (
                      <option key={g.id} value={g.id}>{g.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Tecnologias Utilizadas</label>
                  <input
                    type="text"
                    value={formData.tecnologias}
                    onChange={(e) => setFormData({ ...formData, tecnologias: e.target.value })}
                    placeholder="Ex: Python, Django, PostgreSQL"
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2"
                    style={{ borderColor: 'var(--color-border)' }}
                    required
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-3" style={{ color: '#003D7A' }}>Links do Projeto (Opcional)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block mb-2 text-sm">Link do GitHub</label>
                      <input
                        type="url"
                        value={formData.linkGithub}
                        onChange={(e) => setFormData({ ...formData, linkGithub: e.target.value })}
                        placeholder="https://github.com/usuario/projeto"
                        className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 text-sm"
                        style={{ borderColor: 'var(--color-border)' }}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm">Link do Projeto Funcionando</label>
                      <input
                        type="url"
                        value={formData.linkProjeto}
                        onChange={(e) => setFormData({ ...formData, linkProjeto: e.target.value })}
                        placeholder="https://meuprojeto.com"
                        className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 text-sm"
                        style={{ borderColor: 'var(--color-border)' }}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm">Link da Documentação</label>
                      <input
                        type="url"
                        value={formData.linkDocumentacao}
                        onChange={(e) => setFormData({ ...formData, linkDocumentacao: e.target.value })}
                        placeholder="https://docs.google.com/..."
                        className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 text-sm"
                        style={{ borderColor: 'var(--color-border)' }}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm">Link do Vídeo de Apresentação</label>
                      <input
                        type="url"
                        value={formData.linkVideo}
                        onChange={(e) => setFormData({ ...formData, linkVideo: e.target.value })}
                        placeholder="https://youtube.com/..."
                        className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 text-sm"
                        style={{ borderColor: 'var(--color-border)' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 text-white rounded-lg hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#003D7A' }}
                  >
                    {editingProject ? 'Salvar Alterações' : 'Criar Projeto'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProject(null);
                    }}
                    className="flex-1 py-2 border-2 rounded-lg hover:bg-gray-50 transition-all"
                    style={{ color: '#003D7A', borderColor: '#003D7A' }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects View */}
        {currentView === 'projects' && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 style={{ color: '#003D7A' }}>Meus Projetos</h2>
                <p className="text-sm text-muted-foreground">Gerencie seus projetos integradores</p>
              </div>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingProject(null);
                  setFormData({
                    titulo: '',
                    descricao: '',
                    turma: '',
                    membros: '',
                    tecnologias: '',
                    linkGithub: '',
                    linkProjeto: '',
                    linkDocumentacao: '',
                    linkVideo: '',
                    grupoSelecionado: 0,
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: '#003D7A' }}
              >
                <Plus className="w-5 h-5" />
                Novo Projeto
              </button>
            </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="mb-2" style={{ color: '#003D7A' }}>{project.titulo}</h3>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs text-white"
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  >
                    {project.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.descricao}</p>
              <div className="text-xs text-muted-foreground mb-4">
                {getCurso(project.turma) && <p>Curso: {getCurso(project.turma)}</p>}
                <p>Turma: {project.turma}</p>
                <p>Data: {project.dataSubmissao.split('-').reverse().join('/')}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewingProject(project)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-all"
                    style={{ color: '#003D7A', borderColor: '#003D7A' }}
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  {project.status === 'Pendente' && (
                    <>
                      <button
                        onClick={() => handleEdit(project)}
                        className="flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-all"
                        style={{ color: '#FF6B00', borderColor: '#FF6B00' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    handleSelecionarGrupo(project.grupoId);
                    setCurrentView('groups');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all text-white hover:opacity-90"
                  style={{ backgroundColor: '#5CB85C' }}
                >
                  <Users className="w-4 h-4" />
                  Acessar Grupo
                </button>
              </div>
            </div>
          ))}
        </div>

            {projects.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: '#003D7A', opacity: 0.5 }} />
                <h3 className="mb-2" style={{ color: '#003D7A' }}>Nenhum projeto cadastrado</h3>
                <p className="text-muted-foreground mb-6">Comece criando seu primeiro projeto integrador</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#003D7A' }}
                >
                  <Plus className="w-5 h-5" />
                  Criar Primeiro Projeto
                </button>
              </div>
            )}
          </>
        )}

        {/* Feed View */}
        {currentView === 'feed' && (
          <div>
            <div className="mb-6">
              <h2 style={{ color: '#003D7A' }}>Seus Projetos Avaliados</h2>
              <p className="text-sm text-muted-foreground">Acompanhe e publique seus projetos avaliados no feed</p>
            </div>

            {/* Seção Meus Projetos Avaliados */}
            {projects.filter(p => p.status === 'Avaliado').length > 0 && (
              <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-border">
                <h3 className="mb-4 font-medium" style={{ color: '#003D7A' }}>
                  Meus Projetos Avaliados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects
                    .filter(p => p.status === 'Avaliado')
                    .map((project) => (
                      <div
                        key={project.id}
                        className="p-4 rounded-lg border border-border hover:shadow-md transition-all"
                        style={{ backgroundColor: project.publicadoNoFeed ? '#E6F2FF' : '#F9F9F9' }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium" style={{ color: '#003D7A' }}>
                              {project.titulo}
                            </h4>
                            {project.conceito && (
                              <span
                                className="inline-block px-2 py-1 rounded text-xs text-white mt-1"
                                style={{ backgroundColor: getConceitoColor(project.conceito) }}
                              >
                                {project.conceito}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {project.descricao}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePublicarNoFeed(project.id)}
                            className={`flex-1 px-3 py-2 rounded-lg transition-all text-sm ${
                              project.publicadoNoFeed ? 'text-white' : 'border-2'
                            }`}
                            style={
                              project.publicadoNoFeed
                                ? { backgroundColor: '#5CB85C' }
                                : { color: '#5CB85C', borderColor: '#5CB85C' }
                            }
                          >
                            {project.publicadoNoFeed ? '✓ Publicado no Feed' : 'Publicar no Feed'}
                          </button>
                          {project.publicadoNoFeed && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {project.curtidas || 0}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-medium" style={{ color: '#003D7A' }}>Feed Geral</h3>
              <p className="text-xs text-muted-foreground">Projetos da comunidade ranqueados por curtidas</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-border mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar projetos por título ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
              <div className="w-full md:w-64">
                <select
                  value={selectedCurso}
                  onChange={(e) => setSelectedCurso(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B00] bg-white"
                  style={{ 
                    borderColor: 'var(--color-border)',
                    color: '#003D7A' 
                  }}
                >
                  <option value="Todos os Cursos">Todos os Cursos</option>
                  <option value="Design">Design</option>
                  <option value="Análise e Desenvolvimento de Sistemas">Análise e Desenvolvimento de Sistemas</option>
                  <option value="Gastronomia">Gastronomia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[...feedProjects]
                .filter(project => {
                  const matchesSearch = project.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        project.descricao.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  let projectCurso = project.curso;
                  if (!projectCurso) {
                    if (project.turma.toUpperCase().includes('ADS')) projectCurso = 'Análise e Desenvolvimento de Sistemas';
                    else if (project.turma.toUpperCase().includes('GASTRO')) projectCurso = 'Gastronomia';
                    else if (project.turma.toUpperCase().includes('DESIGN')) projectCurso = 'Design';
                    else projectCurso = 'Outros';
                  }
                  
                  const matchesCurso = selectedCurso === 'Todos os Cursos' || projectCurso === selectedCurso;
                  
                  return matchesSearch && matchesCurso;
                })
                .sort((a, b) => (b.curtidas || 0) - (a.curtidas || 0))
                .map((project, index) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border"
                  >
                    <div className="flex items-start gap-4">
                      {/* Badge de Ranking */}
                      {index < 3 && (
                        <div className="flex flex-col items-center">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            style={{
                              backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                            }}
                          >
                            {index + 1}º
                          </div>
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="mb-1" style={{ color: '#003D7A' }}>{project.titulo}</h3>
                            <p className="text-xs text-muted-foreground">
                              {project.grupoNome ? `Grupo: ${project.grupoNome}` : project.autor} • {project.turma}
                            </p>
                          </div>
                          {project.conceito && (
                            <span
                              className="px-3 py-1 rounded-full text-xs text-white"
                              style={{ backgroundColor: getConceitoColor(project.conceito) }}
                            >
                              {project.conceito}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{project.descricao}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tecnologias.split(',').map((tech, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded text-xs"
                              style={{ backgroundColor: '#E6F2FF', color: '#003D7A' }}
                            >
                              {tech.trim()}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleCurtir(project.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                              project.curtidasUsuarios?.includes(1)
                                ? 'text-white'
                                : 'border-2'
                            }`}
                            style={
                              project.curtidasUsuarios?.includes(1)
                                ? { backgroundColor: '#FF6B00' }
                                : { color: '#FF6B00', borderColor: '#FF6B00' }
                            }
                          >
                            <Heart
                              className="w-5 h-5"
                              fill={project.curtidasUsuarios?.includes(1) ? 'white' : 'none'}
                            />
                            <span className="font-medium">{project.curtidas || 0}</span>
                          </button>

                          <button
                            onClick={() => setViewingProject(project)}
                            className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg hover:bg-gray-50 transition-all"
                            style={{ color: '#003D7A', borderColor: '#003D7A' }}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">Ver detalhes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Groups View */}
        {currentView === 'groups' && (
          <div>
            <div className="mb-6">
              <h2 style={{ color: '#003D7A' }}>Meus Grupos</h2>
              <p className="text-sm text-muted-foreground">Colabore com sua equipe</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Grupos */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
                  <h3 className="mb-4 font-medium" style={{ color: '#003D7A' }}>Seus Grupos</h3>
                  <div className="space-y-2">
                    {grupos.map((grupo) => (
                      <button
                        key={grupo.id}
                        onClick={() => handleSelecionarGrupo(grupo.id)}
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          selectedGroup === grupo.id ? 'shadow-md' : 'hover:bg-gray-50'
                        }`}
                        style={{
                          backgroundColor: selectedGroup === grupo.id ? grupo.cor : 'transparent',
                          color: selectedGroup === grupo.id ? 'white' : '#000'
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: selectedGroup === grupo.id ? 'rgba(255,255,255,0.25)' : grupo.cor }}
                          >
                            <Users className={`w-5 h-5 text-white`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate">{grupo.nome}</h4>
                              {(naoLidas[grupo.id] || 0) > 0 && selectedGroup !== grupo.id && (
                                <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold text-white flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: '#FF6B00' }}>
                                  {naoLidas[grupo.id]}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs ${selectedGroup === grupo.id ? 'text-white opacity-80' : 'text-muted-foreground'}`}>
                              {grupo.membros.length} membros
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Área de Chat/Vídeo */}
              <div className="lg:col-span-2">
                {selectedGroup ? (
                  <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                    {/* Header do Grupo */}
                    <div className="p-4 border-b border-border" style={{ backgroundColor: grupos.find(g => g.id === selectedGroup)?.cor }}>
                      <h3 className="font-medium text-white">{grupos.find(g => g.id === selectedGroup)?.nome}</h3>
                      <p className="text-sm text-white opacity-90">{grupos.find(g => g.id === selectedGroup)?.descricao}</p>
                    </div>

                    {/* Tabs Chat/Vídeo */}
                    <div className="flex border-b border-border">
                      <button
                        onClick={() => setActiveChat('texto')}
                        className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all ${
                          activeChat === 'texto' ? 'border-b-2' : ''
                        }`}
                        style={{
                          borderColor: activeChat === 'texto' ? '#003D7A' : 'transparent',
                          color: activeChat === 'texto' ? '#003D7A' : '#6C757D'
                        }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        Chat de Texto
                      </button>
                      <button
                        onClick={() => setActiveChat('video')}
                        className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all ${
                          activeChat === 'video' ? 'border-b-2' : ''
                        }`}
                        style={{
                          borderColor: activeChat === 'video' ? '#003D7A' : 'transparent',
                          color: activeChat === 'video' ? '#003D7A' : '#6C757D'
                        }}
                      >
                        <Video className="w-5 h-5" />
                        Vídeo Chamada
                      </button>
                      <button
                        onClick={() => {
                          setActiveChat('membros');
                        }}
                        className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all ${
                          activeChat === 'membros' ? 'border-b-2' : ''
                        }`}
                        style={{
                          borderColor: activeChat === 'membros' ? '#003D7A' : 'transparent',
                          color: activeChat === 'membros' ? '#003D7A' : '#6C757D'
                        }}
                      >
                        <Users className="w-5 h-5" />
                        Membros
                      </button>
                    </div>

                    {/* Conteúdo */}
                    {activeChat === 'texto' ? (
                      <div className="flex flex-col h-[500px]">
                        {/* Mensagens */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                          {(mensagens[selectedGroup] || []).map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.userId === String(profile.id) ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  msg.userId === String(profile.id) ? 'text-white' : 'bg-gray-100'
                                }`}
                                style={{
                                  backgroundColor: msg.userId === String(profile.id) ? '#003D7A' : undefined
                                }}
                              >
                                {msg.userId !== String(profile.id) && (
                                  <p className="text-xs font-medium mb-1 opacity-70">{msg.userName}</p>
                                )}
                                {msg.tipo === 'ARQUIVO' && msg.arquivoUrl ? (
                                  <div>
                                    {/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(msg.nomeArquivo || '') ? (
                                      // Imagem: exibe inline com lightbox e download por blob
                                      <div className="relative group">
                                        <img
                                          src={msg.arquivoUrl}
                                          alt={msg.nomeArquivo || 'Imagem'}
                                          className="rounded-lg max-w-[260px] max-h-[200px] object-cover cursor-zoom-in"
                                          onClick={() => setImagemExpandida(msg.arquivoUrl!)}
                                        />
                                        <button
                                          className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                                          title="Baixar imagem"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              const res = await fetch(msg.arquivoUrl!);
                                              const blob = await res.blob();
                                              const url = URL.createObjectURL(blob);
                                              const a = document.createElement('a');
                                              a.href = url;
                                              a.download = msg.nomeArquivo || 'imagem';
                                              a.click();
                                              URL.revokeObjectURL(url);
                                            } catch {
                                              window.open(msg.arquivoUrl, '_blank');
                                            }
                                          }}
                                        >
                                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                          </svg>
                                        </button>
                                      </div>
                                    ) : (
                                      // Outros arquivos: link com ícone
                                      <a
                                        href={msg.arquivoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm underline"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                                      >
                                        <Paperclip className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate max-w-[200px]">{msg.nomeArquivo || 'Arquivo'}</span>
                                      </a>
                                    )}
                                    {msg.text && <p className="text-sm mt-1">{msg.text}</p>}
                                  </div>
                                ) : (
                                  <p className="text-sm">{msg.text}</p>
                                )}
                                <p className="text-xs mt-1 opacity-60">{msg.timestamp}</p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Input de Mensagem */}
                        <div className="p-4 border-t border-border">
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0] || null;
                              setArquivoSelecionado(f);
                              e.target.value = '';
                            }}
                          />
                          {arquivoSelecionado && (
                            <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-sm">
                              <Paperclip className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <span className="flex-1 truncate text-blue-700">{arquivoSelecionado.name}</span>
                              <button onClick={() => setArquivoSelecionado(null)} className="text-blue-400 hover:text-blue-700 flex-shrink-0">✕</button>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Anexar arquivo">
                              <Paperclip className="w-5 h-5" style={{ color: arquivoSelecionado ? '#003D7A' : '#6C757D' }} />
                            </button>
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder={arquivoSelecionado ? 'Adicione uma legenda (opcional)...' : 'Digite sua mensagem...'}
                              className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2"
                              style={{ borderColor: 'var(--color-border)' }}
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={(!newMessage.trim() && !arquivoSelecionado) || enviando}
                              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-40"
                              style={{ backgroundColor: '#003D7A' }}
                            >
                              {enviando
                                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <Send className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : activeChat === 'membros' ? (
                      <div className="p-6 h-[500px] overflow-y-auto">
                        <p className="text-sm text-muted-foreground mb-4">
                          {grupos.find(g => g.id === selectedGroup)?.membros.length || 0} integrante(s) neste grupo
                        </p>
                        <div className="space-y-3">
                          {grupos.find(g => g.id === selectedGroup)?.membros.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-border">
                              {m.foto ? (
                                <img src={m.foto} alt={m.nome}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2"
                                  style={{ borderColor: grupos.find(g => g.id === selectedGroup)?.cor }}
                                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                  style={{ backgroundColor: grupos.find(g => g.id === selectedGroup)?.cor }}
                                >
                                  {(m.nome || '?').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-sm" style={{ color: '#003D7A' }}>{m.nome}</p>
                                <p className="text-xs text-muted-foreground">{m.email}</p>
                                {m.curso && <p className="text-xs text-muted-foreground">{m.curso}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col h-[500px]">
                        {!inCall ? (
                          <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center">
                              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: peersInRoom.length > 0 ? '#E8F5E9' : '#E6F2FF' }}>
                                <Video className="w-12 h-12" style={{ color: peersInRoom.length > 0 ? '#5CB85C' : '#003D7A' }} />
                              </div>
                              <h3 className="mb-2" style={{ color: '#003D7A' }}>Vídeo Chamada</h3>
                              {peersInRoom.length > 0 ? (
                                <>
                                  <div className="flex items-center justify-center gap-2 mb-2">
                                    {peersInRoom.map(p => (
                                      <span key={p.id} className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                                        {(p.nome || '?').charAt(0).toUpperCase()}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-sm text-green-600 font-medium mb-4">
                                    {peersInRoom.map(p => p.nome || 'Participante').join(', ')} {peersInRoom.length === 1 ? 'está' : 'estão'} na chamada
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm text-muted-foreground mb-6">Conecte-se com sua equipe em tempo real</p>
                              )}
                              <button onClick={iniciarChamada} disabled={loadingCall}
                                className="px-8 py-3 text-white rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-60 flex items-center gap-2 mx-auto"
                                style={{ backgroundColor: peersInRoom.length > 0 ? '#5CB85C' : '#003D7A' }}>
                                {loadingCall
                                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Conectando...</>
                                  : <><Video className="w-5 h-5" />{peersInRoom.length > 0 ? 'Entrar na Chamada' : 'Iniciar Chamada'}</>
                                }
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Placeholder quando em chamada (o modal fullscreen é renderizado fora)
                          <div className="h-[500px] flex items-center justify-center bg-gray-900 rounded-b-xl">
                            <div className="text-center text-white opacity-70">
                              <Video className="w-10 h-10 mx-auto mb-2" />
                              <p className="text-sm">Chamada em andamento</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-12 text-center border border-border h-full flex items-center justify-center">
                    <div>
                      <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#5CB85C', opacity: 0.5 }} />
                      <h3 className="mb-2" style={{ color: '#5CB85C' }}>Selecione um Grupo</h3>
                      <p className="text-muted-foreground">
                        Escolha um grupo ao lado para acessar o chat e colaborar com sua equipe
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#003D7A' }}>Meu Perfil</h2>
              <p className="text-muted-foreground">Gerencie suas informações pessoais e profissionais</p>
            </div>
            
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-8 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer w-32 h-32">
                  {profile.foto ? (
                    <img 
                      src={profile.foto} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover border-4 shadow-sm"
                      style={{ borderColor: '#003D7A' }}
                    />
                  ) : (
                    <div 
                      className="w-full h-full rounded-full flex items-center justify-center border-[3px] bg-[#E6F2FF]"
                      style={{ borderColor: '#003D7A' }}
                    >
                      <span className="text-5xl font-bold" style={{ color: '#003D7A' }}>
                        {(userName || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <input
                    ref={fotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (ev) => {
                        const dataUrl = ev.target?.result as string;
                        setProfile(prev => ({ ...prev, foto: dataUrl }));
                        await api.atualizarPerfil({ foto_url: dataUrl });
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ backgroundColor: '#FF6B00', border: '3px solid white' }}
                    onClick={() => fotoInputRef.current?.click()}
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Clique no ícone para alterar</p>
              </div>

              <div className="flex-1 w-full flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-1" style={{ color: '#003D7A' }}>{userName}</h3>
                <p className="text-sm text-muted-foreground mb-6">Aluno SENAC</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs">E-mail</span>
                    </div>
                    <span className="font-medium" style={{ color: '#111' }}>{profile.email}</span>
                  </div>
                  {profile.turmas.length > 0 ? (
                    profile.turmas.map((t, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <BookOpen className="w-4 h-4" />
                          <span className="text-xs">{t.curso === 'Análise e Desenvolvimento de Sistemas' ? 'ADS' : t.curso}</span>
                        </div>
                        <span className="font-medium" style={{ color: '#111' }}>{t.nome}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <BookOpen className="w-4 h-4" />
                          <span className="text-xs">Curso</span>
                        </div>
                        <span className="font-medium" style={{ color: '#111' }}>{profile.curso || '—'}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Users className="w-4 h-4" />
                          <span className="text-xs">Turma</span>
                        </div>
                        <span className="font-medium" style={{ color: '#111' }}>{profile.turma || '—'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Sobre Mim Card */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold" style={{ color: '#003D7A' }}>Sobre Mim</h3>
                <button
                  onClick={async () => {
                    if (isEditingSobreMim) {
                      await api.atualizarPerfil({ sobre_mim: profile.sobreMim });
                    }
                    setIsEditingSobreMim(!isEditingSobreMim);
                  }}
                  className="px-6 py-2 text-white font-medium rounded-lg hover:opacity-90 transition-all text-sm"
                  style={{ backgroundColor: '#003D7A' }}
                >
                  {isEditingSobreMim ? 'Salvar' : 'Editar'}
                </button>
              </div>
              
              {isEditingSobreMim ? (
                <div>
                  <textarea
                    value={profile.sobreMim}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setProfile({ ...profile, sobreMim: e.target.value });
                      }
                    }}
                    className="w-full p-4 border rounded-lg outline-none focus:ring-2 resize-y min-h-[100px]"
                    style={{ borderColor: 'var(--color-border)' }}
                    placeholder="Adicione uma breve apresentação sobre você..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">{profile.sobreMim.length}/500 caracteres</p>
                </div>
              ) : (
                <div>
                  {profile.sobreMim ? (
                    <p className="text-gray-700">{profile.sobreMim}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Clique em "Editar" para adicionar uma breve apresentação sobre você...</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-4">{profile.sobreMim.length}/500 caracteres</p>
                </div>
              )}
            </div>

            {/* Soft Skills Card */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: '#003D7A' }}>Soft Skills</h3>
                  <p className="text-sm text-muted-foreground">Competências comportamentais e interpessoais</p>
                </div>
                <button
                  onClick={async () => {
                    if (isEditingSoftSkills) {
                      await api.atualizarPerfil({ soft_skills: profile.softSkills });
                    }
                    setIsEditingSoftSkills(!isEditingSoftSkills);
                  }}
                  className="px-6 py-2 text-white font-medium rounded-lg hover:opacity-90 transition-all text-sm"
                  style={{ backgroundColor: '#FF6B00' }}
                >
                  {isEditingSoftSkills ? 'Concluir' : 'Adicionar'}
                </button>
              </div>

              {!isEditingSoftSkills && profile.softSkills.length === 0 && (
                <p className="text-muted-foreground italic mt-4">Nenhuma soft skill selecionada. Clique em "Adicionar" para escolher.</p>
              )}

              {!isEditingSoftSkills && profile.softSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.softSkills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{skill}</span>
                  ))}
                </div>
              )}

              {isEditingSoftSkills && (
                <div className="mt-4 p-6 rounded-xl border-2 border-dashed" style={{ borderColor: '#FF6B00' }}>
                  <p className="font-medium mb-4" style={{ color: '#003D7A' }}>Selecione suas soft skills:</p>
                  <div className="flex flex-wrap gap-3">
                    {availableSoftSkills.map((skill) => {
                      const isSelected = profile.softSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => toggleSoftSkill(skill)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            isSelected ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          style={{
                            backgroundColor: isSelected ? '#FF6B00' : undefined
                          }}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Hard Skills Card */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: '#003D7A' }}>Hard Skills</h3>
                  <p className="text-sm text-muted-foreground">Competências técnicas e ferramentas</p>
                </div>
                <button
                  onClick={async () => {
                    if (isEditingHardSkills) {
                      await api.atualizarPerfil({ hard_skills: profile.hardSkills });
                    }
                    setIsEditingHardSkills(!isEditingHardSkills);
                  }}
                  className="px-6 py-2 text-white font-medium rounded-lg hover:opacity-90 transition-all text-sm"
                  style={{ backgroundColor: '#003D7A' }}
                >
                  {isEditingHardSkills ? 'Concluir' : 'Adicionar'}
                </button>
              </div>

              {!isEditingHardSkills && profile.hardSkills.length === 0 && (
                <p className="text-muted-foreground italic mt-4">Nenhuma hard skill selecionada. Clique em "Adicionar" para escolher.</p>
              )}

              {!isEditingHardSkills && profile.hardSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.hardSkills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{skill}</span>
                  ))}
                </div>
              )}

              {isEditingHardSkills && (
                <div className="mt-4 p-6 rounded-xl border-2 border-dashed" style={{ borderColor: '#003D7A' }}>
                  <p className="font-medium mb-4" style={{ color: '#003D7A' }}>Selecione suas hard skills:</p>
                  <div className="flex flex-wrap gap-3">
                    {availableHardSkills.map((skill) => {
                      const isSelected = profile.hardSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => toggleHardSkill(skill)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            isSelected ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          style={{
                            backgroundColor: isSelected ? '#003D7A' : undefined
                          }}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Modal fullscreen da videochamada */}
        {inCall && (
          <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#111' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3" style={{ backgroundColor: '#1a1a1a' }}>
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">
                  {grupos.find(g => g.id === selectedGroup)?.nome || 'Videochamada'}
                </span>
                <span className="text-xs text-gray-400">
                  {remotePeers.filter(p => p.id !== profile.id).length + 1} participante(s)
                </span>
              </div>
            </div>

            {/* Grade de vídeos */}
            <div className="flex-1 p-4 grid gap-3 overflow-hidden" style={{
              gridTemplateColumns: remotePeers.filter(p => p.id !== profile.id).length === 0
                ? '1fr'
                : remotePeers.filter(p => p.id !== profile.id).length === 1
                  ? '1fr 1fr'
                  : remotePeers.filter(p => p.id !== profile.id).length === 2
                    ? 'repeat(3, 1fr)'
                    : 'repeat(2, 1fr)',
              gridAutoRows: '1fr',
            }}>
              {/* Vídeo local */}
              <div className="relative rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#222' }}>
                <video
                  ref={el => {
                    (localVideoRef as any).current = el;
                    if (el && localStream) el.srcObject = localStream;
                    else if (el) el.srcObject = null;
                  }}
                  autoPlay muted playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)', display: (localStream && camOn) ? 'block' : 'none' }}
                />
                {(!localStream || !camOn) && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#222' }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: '#003D7A' }}>
                      {(profile.nome || 'Eu').charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-xs text-white bg-black bg-opacity-60 px-2 py-1 rounded-full">
                    Você {!micOn && '🔇'}
                  </span>
                </div>
              </div>

              {/* Vídeos remotos */}
              {remotePeers.filter(p => p.id !== profile.id).map(peer => (
                <div key={peer.channel} className="relative rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#222' }}>
                  {peer.stream ? (
                    <video autoPlay playsInline className="w-full h-full object-cover"
                      ref={el => { if (el) el.srcObject = peer.stream!; }} />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: '#003D7A' }}>
                        {(peer.nome || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-400">Conectando...</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs text-white bg-black bg-opacity-60 px-2 py-1 rounded-full">
                      {peer.nome || 'Participante'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Controles */}
            <div className="flex items-center justify-center gap-6 py-5" style={{ backgroundColor: '#1a1a1a' }}>
              <button onClick={toggleMic}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                style={{ backgroundColor: micOn ? '#374151' : '#EF4444' }}
                title={micOn ? 'Silenciar' : 'Ativar microfone'}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  {micOn
                    ? <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    : <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c.57-.08 1.13-.24 1.64-.47l4.09 4.09 1.27-1.27L4.27 3z"/>}
                </svg>
              </button>
              <button onClick={toggleCam}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                style={{ backgroundColor: camOn ? '#374151' : '#EF4444' }}
                title={camOn ? 'Desligar câmera' : 'Ligar câmera'}>
                <Video className="w-6 h-6 text-white" />
              </button>
              <button onClick={sairDaChamada}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                style={{ backgroundColor: '#EF4444' }}
                title="Encerrar chamada">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Lightbox de imagem */}
        {imagemExpandida && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 cursor-zoom-out"
            onClick={() => setImagemExpandida(null)}
          >
            <img
              src={imagemExpandida}
              alt="Imagem expandida"
              className="max-w-full max-h-full object-contain rounded-lg select-none"
              onClick={e => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 p-2 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-all"
              onClick={() => setImagemExpandida(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* View Modal */}
        {viewingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 style={{ color: '#003D7A' }}>{viewingProject.titulo}</h3>
                <span
                  className="px-3 py-1 rounded-full text-sm text-white"
                  style={{ backgroundColor: getStatusColor(viewingProject.status) }}
                >
                  {viewingProject.status}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="font-medium" style={{ color: '#003D7A' }}>Descrição</label>
                  <p className="text-muted-foreground mt-1">{viewingProject.descricao}</p>
                </div>
                {getCurso(viewingProject.turma) && (
                  <div>
                    <label className="font-medium" style={{ color: '#003D7A' }}>Curso</label>
                    <p className="text-muted-foreground mt-1">{getCurso(viewingProject.turma)}</p>
                  </div>
                )}
                <div>
                  <label className="font-medium" style={{ color: '#003D7A' }}>Turma</label>
                  <p className="text-muted-foreground mt-1">{viewingProject.turma}</p>
                </div>
                <div>
                  <label className="font-medium" style={{ color: '#003D7A' }}>Membros</label>
                  <p className="text-muted-foreground mt-1">{viewingProject.membros}</p>
                </div>
                <div>
                  <label className="font-medium" style={{ color: '#003D7A' }}>Tecnologias</label>
                  <p className="text-muted-foreground mt-1">{viewingProject.tecnologias}</p>
                </div>
                <div>
                  <label className="font-medium" style={{ color: '#003D7A' }}>Data de Submissão</label>
                  <p className="text-muted-foreground mt-1">{viewingProject.dataSubmissao.split('-').reverse().join('/')}</p>
                </div>
                {viewingProject.status === 'Avaliado' && viewingProject.conceito && (
                  <div className="pt-4 border-t-2 border-border space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-block px-4 py-2 rounded-lg text-lg font-bold text-white" style={{ backgroundColor: getConceitoColor(viewingProject.conceito) }}>
                        {viewingProject.conceito}
                      </span>
                    </div>

                    {viewingProject.avaliacaoDetalhes && (
                      <>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                          {viewingProject.avaliacaoDetalhes.professorNome && (
                            <div className="flex items-center gap-2 mb-2 text-sm">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span><strong>Avaliado por:</strong> {viewingProject.avaliacaoDetalhes.professorNome}</span>
                            </div>
                          )}
                          {viewingProject.avaliacaoDetalhes.data && (
                            <div className="flex items-center gap-2 text-sm">
                              <BookOpen className="w-4 h-4 text-muted-foreground" />
                              <span><strong>Data:</strong> {viewingProject.avaliacaoDetalhes.data.split('T')[0].split('-').reverse().join('/')}</span>
                            </div>
                          )}
                        </div>

                        {viewingProject.avaliacaoDetalhes.rubricas.length > 0 && (
                          <div className="space-y-3">
                            <label className="font-medium block" style={{ color: '#003D7A' }}>Critérios Avaliados</label>
                            {viewingProject.avaliacaoDetalhes.rubricas.map((r, i) => (
                              <div key={i} className="p-3 rounded-lg border" style={{ backgroundColor: '#FAFAFA', borderColor: '#E5E7EB' }}>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm" style={{ color: '#003D7A' }}>{r.criterioNome}</p>
                                    {r.criterioDescricao && <p className="text-xs text-muted-foreground mt-0.5">{r.criterioDescricao}</p>}
                                  </div>
                                  <span className="px-2 py-1 rounded text-xs font-bold text-white ml-2 flex-shrink-0" style={{ backgroundColor: getConceitoColor(r.conceito) }}>
                                    {r.conceito}
                                  </span>
                                </div>
                                {r.observacao && <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{r.observacao}</p>}
                              </div>
                            ))}
                          </div>
                        )}

                        <div>
                          <label className="font-medium block mb-1" style={{ color: '#003D7A' }}>Feedback do Professor</label>
                          <p className="text-sm text-muted-foreground">{viewingProject.feedback}</p>
                        </div>

                        {viewingProject.avaliacaoDetalhes.rubricaAssinatura && (
                          <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: '#FF6B00', backgroundColor: '#FFFBF0' }}>
                            <label className="font-medium text-sm block mb-2" style={{ color: '#003D7A' }}>Rubrica (Assinatura)</label>
                            <p className="text-xl text-center" style={{ fontFamily: 'cursive', fontStyle: 'italic', color: '#003D7A' }}>
                              {viewingProject.avaliacaoDetalhes.rubricaAssinatura}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

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
                          GitHub do Projeto
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
                          <BookOpen className="w-4 h-4" />
                          Documentação
                        </a>
                      )}
                      {viewingProject.linkVideo && (
                        <a
                          href={viewingProject.linkVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:underline"
                          style={{ color: '#003D7A' }}
                        >
                          <Video className="w-4 h-4" />
                          Vídeo de Apresentação
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setViewingProject(null)}
                className="w-full mt-6 py-2 text-white rounded-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: '#003D7A' }}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
