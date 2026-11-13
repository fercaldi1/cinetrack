// env.js
// Carrega as variáveis do arquivo .env (se existir) para process.env,
// usando apenas módulos nativos. O arquivo .env nunca vai para o git;
// use o .env.example como modelo.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILE = path.join(__dirname, '.env');

function carregarEnv() {
  let conteudo;
  try {
    conteudo = readFileSync(ENV_FILE, 'utf8');
  } catch {
    return; // sem .env: usa os valores padrão
  }

  for (const linha of conteudo.split(/\r?\n/)) {
    const texto = linha.trim();
    if (!texto || texto.startsWith('#')) continue;

    const separador = texto.indexOf('=');
    if (separador === -1) continue;

    const chave = texto.slice(0, separador).trim();
    let valor = texto.slice(separador + 1).trim();

    if (/^(['"]).*\1$/.test(valor)) {
      valor = valor.slice(1, -1);
    }

    // Variáveis já definidas no sistema têm prioridade sobre o arquivo.
    if (!(chave in process.env)) {
      process.env[chave] = valor;
    }
  }
}

carregarEnv();

export const PORT = Number(process.env.PORT) || 3000;
export const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
