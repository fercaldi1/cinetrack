// db.js
// Persistência dos filmes em um arquivo JSON usando apenas módulos nativos do Node.

import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = path.join(__dirname, 'data');
export const DATA_FILE = path.join(DATA_DIR, 'filmes.json');

// Lê a lista de filmes do arquivo. Se o arquivo ainda não existir,
// devolve uma lista vazia (rode "npm run seed" para popular).
export async function lerFilmes() {
  try {
    const conteudo = await readFile(DATA_FILE, 'utf8');
    const filmes = JSON.parse(conteudo);
    return Array.isArray(filmes) ? filmes : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Grava a lista inteira no arquivo. A escrita é feita primeiro em um arquivo
// temporário e depois renomeada, para não corromper os dados se o processo
// for interrompido no meio da gravação.
export async function salvarFilmes(filmes) {
  await mkdir(DATA_DIR, { recursive: true });
  const temporario = `${DATA_FILE}.tmp`;
  await writeFile(temporario, JSON.stringify(filmes, null, 2) + '\n', 'utf8');
  await rename(temporario, DATA_FILE);
}

export function proximoId(filmes) {
  return filmes.reduce((maior, filme) => Math.max(maior, filme.id), 0) + 1;
}
