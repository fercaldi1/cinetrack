// routes/filmes.js
// Rotas REST do recurso /filmes.

import { lerFilmes, salvarFilmes, proximoId } from '../db.js';

const STATUS_VALIDOS = ['assistido', 'assistindo', 'quero'];
const ANO_MINIMO = 1888;
const ANO_MAXIMO = new Date().getFullYear() + 5;
const CAMPOS = ['titulo', 'ano', 'genero', 'poster', 'nota', 'status', 'comentario'];

const VALORES_PADRAO = {
  genero: '',
  poster: '',
  nota: null,
  status: 'quero',
  comentario: ''
};

function estaVazio(valor) {
  return valor === undefined || valor === null || String(valor).trim() === '';
}

// Copia apenas os campos conhecidos, removendo espaços e convertendo números.
// O id nunca vem do corpo da requisição.
function extrairCampos(corpo) {
  const dados = {};

  for (const campo of CAMPOS) {
    if (!(campo in corpo)) continue;

    const valor = corpo[campo];
    if (campo === 'ano' || campo === 'nota') {
      dados[campo] = estaVazio(valor) ? null : Number(valor);
    } else {
      dados[campo] = typeof valor === 'string' ? valor.trim() : valor;
    }
  }

  return dados;
}

function validarFilme(filme) {
  const erros = {};

  if (typeof filme.titulo !== 'string' || filme.titulo === '') {
    erros.titulo = 'Informe o título do filme.';
  }

  if (!Number.isInteger(filme.ano) || filme.ano < ANO_MINIMO || filme.ano > ANO_MAXIMO) {
    erros.ano = `Informe um ano inteiro entre ${ANO_MINIMO} e ${ANO_MAXIMO}.`;
  }

  if (typeof filme.genero !== 'string') {
    erros.genero = 'O gênero deve ser um texto.';
  }

  if (typeof filme.poster !== 'string' || (filme.poster && !/^https?:\/\/\S+$/i.test(filme.poster))) {
    erros.poster = 'Informe uma URL válida, começando com http:// ou https://.';
  }

  if (!STATUS_VALIDOS.includes(filme.status)) {
    erros.status = `O status deve ser: ${STATUS_VALIDOS.join(', ')}.`;
  }

  if (filme.nota !== null && (!Number.isInteger(filme.nota) || filme.nota < 1 || filme.nota > 5)) {
    erros.nota = 'A nota deve ser um número inteiro de 1 a 5.';
  }

  if (typeof filme.comentario !== 'string') {
    erros.comentario = 'O comentário deve ser um texto.';
  }

  return erros;
}

function corpoEhObjeto(corpo) {
  return corpo !== null && typeof corpo === 'object' && !Array.isArray(corpo);
}

function responderErroValidacao(res, erros) {
  res.status(400).json({ erro: 'Dados do filme inválidos.', erros });
}

function lerId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) ? id : null;
}

export default function rotasFilmes(app) {
  // GET /filmes e GET /filmes?status=assistido
  app.get('/filmes', async (req, res) => {
    const { status } = req.query;

    if (status && !STATUS_VALIDOS.includes(status)) {
      res.status(400).json({ erro: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}.` });
      return;
    }

    const filmes = await lerFilmes();
    res.json(status ? filmes.filter(filme => filme.status === status) : filmes);
  });

  // GET /filmes/:id
  app.get('/filmes/:id', async (req, res) => {
    const id = lerId(req);
    const filmes = await lerFilmes();
    const filme = filmes.find(item => item.id === id);

    if (!filme) {
      res.status(404).json({ erro: 'Filme não encontrado.' });
      return;
    }

    res.json(filme);
  });

  // POST /filmes
  app.post('/filmes', async (req, res) => {
    if (!corpoEhObjeto(req.body)) {
      res.status(400).json({ erro: 'Envie os dados do filme em JSON.' });
      return;
    }

    const dados = extrairCampos(req.body);

    if (estaVazio(dados.titulo) || estaVazio(dados.ano)) {
      res.status(400).json({ erro: 'Os campos título e ano são obrigatórios.' });
      return;
    }

    const filmes = await lerFilmes();
    const novoFilme = { id: proximoId(filmes), titulo: '', ano: null, ...VALORES_PADRAO, ...dados };

    const erros = validarFilme(novoFilme);
    if (Object.keys(erros).length > 0) {
      responderErroValidacao(res, erros);
      return;
    }

    await salvarFilmes([...filmes, novoFilme]);
    res.status(201).json(novoFilme);
  });

  // PUT /filmes/:id
  app.put('/filmes/:id', async (req, res) => {
    if (!corpoEhObjeto(req.body)) {
      res.status(400).json({ erro: 'Envie os dados do filme em JSON.' });
      return;
    }

    const id = lerId(req);
    const filmes = await lerFilmes();
    const atual = filmes.find(item => item.id === id);

    if (!atual) {
      res.status(404).json({ erro: 'Filme não encontrado.' });
      return;
    }

    // O id original é preservado mesmo que o corpo traga outro valor.
    const atualizado = { ...atual, ...extrairCampos(req.body), id: atual.id };

    const erros = validarFilme(atualizado);
    if (Object.keys(erros).length > 0) {
      responderErroValidacao(res, erros);
      return;
    }

    await salvarFilmes(filmes.map(item => (item.id === id ? atualizado : item)));
    res.json(atualizado);
  });

  // DELETE /filmes/:id
  app.delete('/filmes/:id', async (req, res) => {
    const id = lerId(req);
    const filmes = await lerFilmes();

    if (!filmes.some(item => item.id === id)) {
      res.status(404).json({ erro: 'Filme não encontrado.' });
      return;
    }

    await salvarFilmes(filmes.filter(item => item.id !== id));
    res.status(204).end();
  });
}
