// seed.js
// Popula (ou restaura) data/filmes.json com os 6 filmes de exemplo da Parte 1.
// Uso: npm run seed

import { salvarFilmes, DATA_FILE } from './db.js';

const filmesIniciais = [
  {
    id: 1,
    titulo: 'A Origem',
    ano: 2010,
    genero: 'Ficção científica',
    poster: 'https://placehold.co/200x300?text=A+Origem',
    nota: 5,
    status: 'assistido',
    comentario: 'Revejo sempre.'
  },
  {
    id: 2,
    titulo: 'Parasita',
    ano: 2019,
    genero: 'Suspense',
    poster: 'https://placehold.co/200x300?text=Parasita',
    nota: 4,
    status: 'assistido',
    comentario: ''
  },
  {
    id: 3,
    titulo: 'O Auto da Compadecida',
    ano: 2000,
    genero: 'Comédia',
    poster: 'https://placehold.co/200x300?text=Compadecida',
    nota: 5,
    status: 'assistido',
    comentario: 'Classico nacional.'
  },
  {
    id: 4,
    titulo: 'Duna: Parte Dois',
    ano: 2024,
    genero: 'Ficção científica',
    poster: 'https://placehold.co/200x300?text=Duna+2',
    nota: 4,
    status: 'assistindo',
    comentario: ''
  },
  {
    id: 5,
    titulo: 'Interestelar',
    ano: 2014,
    genero: 'Ficção científica',
    poster: 'https://placehold.co/200x300?text=Interestelar',
    nota: 5,
    status: 'quero',
    comentario: ''
  },
  {
    id: 6,
    titulo: 'Cidade de Deus',
    ano: 2002,
    genero: 'Drama',
    poster: 'https://placehold.co/200x300?text=Cidade+de+Deus',
    nota: 4,
    status: 'quero',
    comentario: ''
  }
];

try {
  await salvarFilmes(filmesIniciais);
  console.log(`${filmesIniciais.length} filmes gravados em ${DATA_FILE}`);
} catch (error) {
  console.error('Não foi possível gravar os filmes de exemplo:', error.message);
  process.exitCode = 1;
}
