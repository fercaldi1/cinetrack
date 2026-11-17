// Módulo único de acesso aos dados: toda a comunicação com o backend passa por aqui.

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const options = { method };

  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    // fetch só falha aqui quando não há resposta (servidor desligado, sem rede, CORS).
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
  }

  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.erro || `O servidor respondeu com erro (${response.status}).`;
    throw new ApiError(message, response.status, data?.erros || null);
  }

  return data;
}

export function listarFilmes() {
  return request('/filmes');
}

export function criarFilme(filme) {
  return request('/filmes', { method: 'POST', body: filme });
}

export function atualizarFilme(id, filme) {
  return request(`/filmes/${id}`, { method: 'PUT', body: filme });
}

export function removerFilme(id) {
  return request(`/filmes/${id}`, { method: 'DELETE' });
}

// Opcional (RF-07): busca de pôster pelo proxy do TMDB no backend.
export function buscarNoTmdb(titulo) {
  return request(`/tmdb/busca?titulo=${encodeURIComponent(titulo)}`);
}
