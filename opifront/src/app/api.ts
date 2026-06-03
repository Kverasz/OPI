const BASE_URL = 'http://127.0.0.1:8000/api';

function getToken() {
  return localStorage.getItem('opi_token');
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

export const api = {
  // Projetos
  async listarProjetos() {
    const res = await fetch(`${BASE_URL}/projetos/`, { headers: headers() });
    return res.json();
  },

  async criarProjeto(data: any) {
    const res = await fetch(`${BASE_URL}/projetos/`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async editarProjeto(id: number, data: any) {
    const res = await fetch(`${BASE_URL}/projetos/${id}/`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deletarProjeto(id: number) {
    const res = await fetch(`${BASE_URL}/projetos/${id}/`, {
      method: 'DELETE',
      headers: headers()
    });
    return res.ok;
  },

  // Feed e curtidas
  async listarFeed() {
    const res = await fetch(`${BASE_URL}/feed/`, { headers: headers() });
    return res.json();
  },

  async curtirProjeto(id: number) {
    const res = await fetch(`${BASE_URL}/feed/${id}/curtir/`, {
      method: 'POST',
      headers: headers()
    });
    return res.json();
  },

  // Turmas
  async listarTurmas() {
    const res = await fetch(`${BASE_URL}/turmas/`, { headers: headers() });
    return res.json();
  },

  async criarTurma(data: any) {
    const res = await fetch(`${BASE_URL}/turmas/`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deletarTurma(id: number) {
    const res = await fetch(`${BASE_URL}/turmas/${id}/`, {
      method: 'DELETE',
      headers: headers()
    });
    return res.ok;
  },

  async listarUsuarios() {
  const res = await fetch(`${BASE_URL}/usuarios/`, { headers: headers() });
  return res.json();
},

async criarUsuario(data: any) {
  const res = await fetch(`${BASE_URL}/usuarios/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data)
  });
  return res.json();
},

async editarUsuario(id: number, data: any) {
  const res = await fetch(`${BASE_URL}/usuarios/${id}/`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data)
  });
  return res.json();
},

async deletarUsuario(id: number) {
  const res = await fetch(`${BASE_URL}/usuarios/${id}/`, {
    method: 'DELETE',
    headers: headers()
  });
  return res.ok;
},

async listarCriterios() {
  const res = await fetch(`${BASE_URL}/criterios-rubrica/`, { headers: headers() });
  return res.json();
},

async iniciarAvaliacao(projetoId: number) {
  const res = await fetch(`${BASE_URL}/avaliacoes/iniciar/${projetoId}/`, {
    method: 'POST',
    headers: headers()
  });
  return res.json();
},

async criarAvaliacao(data: any) {
  const res = await fetch(`${BASE_URL}/avaliacoes/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) return { __status: res.status, ...json };
  return json;
},

async listarPortfolio(filtros?: { tecnologia?: string; area?: string; ano?: string }) {
  let url = `${BASE_URL}/portfolio/`;
  const params = new URLSearchParams();
  if (filtros?.tecnologia) params.append('tecnologia', filtros.tecnologia);
  if (filtros?.area) params.append('area_tematica', filtros.area);
  if (filtros?.ano) params.append('ano', filtros.ano);
  if (params.toString()) url += `?${params.toString()}`;
  const res = await fetch(url, { headers: headers() });
  return res.json();
},

async publicarNoFeed(id: number) {
  const res = await fetch(`${BASE_URL}/projetos/${id}/publicar_feed/`, {
    method: 'POST',
    headers: headers()
  });
  return res.json();
},


async listarGrupos() {
  const res = await fetch(`${BASE_URL}/grupos/`, { headers: headers() });
  return res.json();
},

async criarGrupo(data: any) {
  const res = await fetch(`${BASE_URL}/grupos/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data)
  });
  return res.json();
},

async editarGrupo(id: number, data: any) {
  const res = await fetch(`${BASE_URL}/grupos/${id}/`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data)
  });
  return res.json();
},

async deletarGrupo(id: number) {
  const res = await fetch(`${BASE_URL}/grupos/${id}/`, {
    method: 'DELETE',
    headers: headers()
  });
  return res.ok;
},

async listarMensagens(grupoId: number) {
  const res = await fetch(`${BASE_URL}/chat-grupo/${grupoId}/`, { headers: headers() });
  return res.json();
},

async enviarMensagem(grupoId: number, conteudo: string) {
  const res = await fetch(`${BASE_URL}/chat-grupo/${grupoId}/mensagens/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ conteudo })
  });
  return res.json();
},

async enviarArquivoGrupo(grupoId: number, arquivo: File, conteudo = '') {
  const form = new FormData();
  form.append('arquivo', arquivo);
  if (conteudo) form.append('conteudo', conteudo);
  const res = await fetch(`${BASE_URL}/chat-grupo/${grupoId}/mensagens/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` }, // sem Content-Type, deixa o browser definir o boundary
    body: form
  });
  return res.json();
},

async minhasTurmas() {
  const res = await fetch(`${BASE_URL}/auth/me/`, { headers: headers() });
  const data = await res.json();
  return data.turmas || [];
},

async meuPerfil() {
  const res = await fetch(`${BASE_URL}/auth/me/`, { headers: headers() });
  return res.json();
},

async atualizarPerfil(data: any) {
  const res = await fetch(`${BASE_URL}/auth/me/`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data)
  });
  return res.json();
},

async listarDashboard() {
  const res = await fetch(`${BASE_URL}/dashboard/`, { headers: headers() });
  return res.json();
},
};

