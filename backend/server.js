// server.js
// Ponto de entrada da API do CineTrack.

import { PORT } from './env.js';
import miniExpress from './mini-express.js';
import rotasFilmes from './routes/filmes.js';
import rotasTmdb from './routes/tmdb.js';

const app = miniExpress();

// Libera o acesso do frontend em desenvolvimento (qualquer porta de localhost).
const ORIGEM_LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use((req, res, next) => {
  const origem = req.headers.origin;

  if (origem && ORIGEM_LOCAL.test(origem)) {
    res.set('Access-Control-Allow-Origin', origem);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  }

  // Requisição de "preflight" enviada pelo navegador antes de POST/PUT/DELETE.
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

// Todas as respostas da API saem como JSON.
app.use((req, res, next) => {
  res.set('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(miniExpress.json());

app.get('/', (req, res) => {
  res.json({ nome: 'CineTrack API', rotas: ['/filmes', '/filmes/:id', '/tmdb/busca?titulo='] });
});

rotasFilmes(app);
rotasTmdb(app);

app.listen(PORT, () => {
  console.log(`CineTrack API rodando em http://localhost:${PORT}`);
});
