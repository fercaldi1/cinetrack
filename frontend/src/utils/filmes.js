// Constantes e funções auxiliares sobre filmes, usadas por vários componentes.

export const MIN_YEAR = 1888;
export const MAX_YEAR = new Date().getFullYear() + 5;

export const STATUS_LABELS = {
  assistido: 'Assistido',
  assistindo: 'Assistindo',
  quero: 'Quero assistir'
};

export const STATUS_FILTERS = [
  { value: 'todos', label: 'Todos' },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))
];

export function normalizeText(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function filterMovies(movies, searchTerm, status) {
  const term = normalizeText(searchTerm.trim());

  return movies.filter(movie => {
    const matchesStatus = status === 'todos' || movie.status === status;
    const matchesTitle = normalizeText(movie.titulo).includes(term);
    return matchesStatus && matchesTitle;
  });
}

export function placeholderPoster(title) {
  return `https://placehold.co/200x300?text=${encodeURIComponent(title)}`;
}

// Mesma validação da Parte 1: devolve um objeto { campo: mensagem }.
export function validateMovie(movie) {
  const errors = {};

  if (!movie.titulo) {
    errors.titulo = 'Informe o título do filme.';
  }

  if (!Number.isInteger(movie.ano) || movie.ano < MIN_YEAR || movie.ano > MAX_YEAR) {
    errors.ano = `Informe um ano entre ${MIN_YEAR} e ${MAX_YEAR}.`;
  }

  if (!movie.genero) {
    errors.genero = 'Informe o gênero.';
  }

  if (movie.poster && !/^https?:\/\/\S+$/i.test(movie.poster)) {
    errors.poster = 'Informe uma URL válida, começando com http:// ou https://.';
  }

  if (!Object.keys(STATUS_LABELS).includes(movie.status)) {
    errors.status = 'Selecione um status.';
  }

  if (!Number.isInteger(movie.nota) || movie.nota < 1 || movie.nota > 5) {
    errors.nota = 'A nota deve ser um número inteiro de 1 a 5.';
  }

  return errors;
}
