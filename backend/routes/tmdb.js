// routes/tmdb.js
// Proxy opcional para a API do TMDB (RF-07). A chave fica apenas no servidor,
// lida da variável de ambiente TMDB_API_KEY, e nunca é enviada ao navegador.

import { TMDB_API_KEY } from '../env.js';

const TMDB_URL = 'https://api.themoviedb.org/3/search/movie';
const IMAGEM_URL = 'https://image.tmdb.org/t/p/w342';

function montarRequisicao(titulo) {
  const url = new URL(TMDB_URL);
  url.searchParams.set('query', titulo);
  url.searchParams.set('language', 'pt-BR');

  const headers = { Accept: 'application/json' };

  // O token de leitura (v4) é um JWT e começa com "eyJ"; a chave v3 vai na URL.
  if (TMDB_API_KEY.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${TMDB_API_KEY}`;
  } else {
    url.searchParams.set('api_key', TMDB_API_KEY);
  }

  return { url, headers };
}

export default function rotasTmdb(app) {
  // GET /tmdb/busca?titulo=Duna
  app.get('/tmdb/busca', async (req, res) => {
    const titulo = (req.query.titulo || '').trim();

    if (!titulo) {
      res.status(400).json({ erro: 'Informe o parâmetro "titulo".' });
      return;
    }

    if (!TMDB_API_KEY) {
      res.status(503).json({ erro: 'A busca no TMDB não está configurada no servidor.' });
      return;
    }

    const { url, headers } = montarRequisicao(titulo);

    let resposta;
    try {
      resposta = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    } catch {
      res.status(502).json({ erro: 'Não foi possível consultar o TMDB.' });
      return;
    }

    if (!resposta.ok) {
      res.status(502).json({ erro: `O TMDB respondeu com erro (${resposta.status}).` });
      return;
    }

    const dados = await resposta.json();
    const resultados = (dados.results || []).slice(0, 5).map(filme => ({
      tmdbId: filme.id,
      titulo: filme.title,
      ano: filme.release_date ? Number(filme.release_date.slice(0, 4)) : null,
      poster: filme.poster_path ? `${IMAGEM_URL}${filme.poster_path}` : ''
    }));

    res.json(resultados);
  });
}
