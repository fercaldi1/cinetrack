// mini-express.js
// Versão simplificada do Express construída apenas com o módulo nativo "http".
// Oferece o essencial para uma API REST: rotas por método, parâmetros de rota
// (ex.: /filmes/:id), query string, middlewares com next() e leitura de JSON.

import http from 'node:http';

const MAX_BODY_SIZE = 1024 * 1024; // 1 MB

// Converte um caminho como "/filmes/:id" em uma expressão regular
// e guarda os nomes dos parâmetros (["id"]).
function compilePath(path) {
  const paramNames = [];
  const pattern = path
    .split('/')
    .map(segment => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1));
        return '([^/]+)';
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');

  return { regex: new RegExp(`^${pattern}/?$`), paramNames };
}

// Acrescenta ao objeto de resposta nativo os atalhos usados no Express.
function enhanceResponse(res) {
  res.status = code => {
    res.statusCode = code;
    return res;
  };

  res.set = (name, value) => {
    res.setHeader(name, value);
    return res;
  };

  res.json = data => {
    if (!res.hasHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(data));
    return res;
  };

  res.send = body => {
    if (body === undefined) {
      res.end();
    } else if (typeof body === 'object') {
      res.json(body);
    } else {
      res.end(String(body));
    }
    return res;
  };

  res.sendStatus = code => {
    res.statusCode = code;
    res.end();
    return res;
  };
}

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Middleware equivalente ao express.json(): lê o corpo da requisição
// e o transforma em objeto em req.body.
function json() {
  return (req, res, next) => {
    req.body = {};

    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      next();
      return;
    }

    let raw = '';
    let size = 0;
    let aborted = false;

    req.setEncoding('utf8');

    req.on('data', chunk => {
      if (aborted) return;
      size += Buffer.byteLength(chunk);
      if (size > MAX_BODY_SIZE) {
        aborted = true;
        next(createError(413, 'O corpo da requisição é grande demais.'));
        return;
      }
      raw += chunk;
    });

    req.on('end', () => {
      if (aborted) return;
      if (raw.trim() === '') {
        next();
        return;
      }

      try {
        req.body = JSON.parse(raw);
        next();
      } catch {
        next(createError(400, 'O corpo da requisição não é um JSON válido.'));
      }
    });

    req.on('error', next);
  };
}

export default function miniExpress() {
  const stack = []; // middlewares e rotas, na ordem em que foram registrados
  const errorHandlers = [];

  function app(req, res) {
    enhanceResponse(res);

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    req.path = decodeURIComponent(url.pathname);
    req.query = Object.fromEntries(url.searchParams);
    req.params = {};

    let index = 0;

    function handleError(error) {
      for (const handler of errorHandlers) {
        try {
          handler(error, req, res, () => {});
          return;
        } catch (handlerError) {
          error = handlerError;
        }
      }

      if (!res.headersSent) {
        const status = error.status || 500;
        res.status(status).json({
          erro: status === 500 ? 'Erro interno do servidor.' : error.message
        });
      }
      if (!error.status) {
        console.error(error);
      }
    }

    async function next(error) {
      if (error) {
        handleError(error);
        return;
      }

      const layer = stack[index++];

      if (!layer) {
        res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.path}` });
        return;
      }

      if (layer.method && layer.method !== req.method) {
        next();
        return;
      }

      if (layer.route) {
        const match = req.path.match(layer.route.regex);
        if (!match) {
          next();
          return;
        }
        req.params = Object.fromEntries(
          layer.route.paramNames.map((name, i) => [name, decodeURIComponent(match[i + 1])])
        );
      }

      try {
        await layer.handler(req, res, next);
      } catch (handlerError) {
        handleError(handlerError);
      }
    }

    next();
  }

  // Middleware global (sem caminho). Uma função com 4 parâmetros
  // (erro, req, res, next) é tratada como manipulador de erros.
  app.use = handler => {
    if (handler.length === 4) {
      errorHandlers.push(handler);
    } else {
      stack.push({ handler });
    }
    return app;
  };

  for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
    app[method] = (path, ...handlers) => {
      const route = compilePath(path);
      for (const handler of handlers) {
        stack.push({ method: method.toUpperCase(), route, handler });
      }
      return app;
    };
  }

  app.listen = (port, callback) => http.createServer(app).listen(port, callback);

  return app;
}

miniExpress.json = json;
export { createError };
