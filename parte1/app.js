const STORAGE_KEY = 'cinetrack-filmes';
const MIN_YEAR = 1888;
const MAX_YEAR = new Date().getFullYear() + 5;

const STATUS_LABELS = {
  assistido: 'Assistido',
  assistindo: 'Assistindo',
  quero: 'Quero assistir'
};

const initialMovies = [
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

let movies = [];
let currentFilter = 'todos';
let searchTerm = '';
let editingMovieId = null;

const movieList = document.getElementById('movie-list');
const resultCount = document.getElementById('result-count');
const emptyMessage = document.getElementById('empty-message');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const addButton = document.getElementById('add-btn');
const movieDialog = document.getElementById('movie-dialog');
const dialogTitle = document.getElementById('dialog-title');
const movieForm = document.getElementById('movie-form');
const formMessage = document.getElementById('form-message');
const submitButton = document.getElementById('submit-btn');
const cancelButton = document.getElementById('cancel-btn');
const fields = movieForm.elements;

function loadMovies() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      movies = JSON.parse(saved);
      return;
    } catch {
      console.warn('Não foi possível ler os filmes salvos. A lista inicial foi restaurada.');
    }
  }

  movies = initialMovies.map(movie => ({ ...movie }));
  saveMovies();
}

function saveMovies() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

function normalizeText(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function filterMovies() {
  const term = normalizeText(searchTerm.trim());

  return movies.filter(movie => {
    const matchesStatus = currentFilter === 'todos' || movie.status === currentFilter;
    const matchesTitle = normalizeText(movie.titulo).includes(term);
    return matchesStatus && matchesTitle;
  });
}

function placeholderPoster(title) {
  return `https://placehold.co/200x300?text=${encodeURIComponent(title)}`;
}

function createMovieCard(movie) {
  const card = document.createElement('li');
  card.className = 'movie-card';
  card.dataset.id = movie.id;
  card.innerHTML = `
    <img class="poster" width="200" height="300" loading="lazy">
    <div class="card-body">
      <h3 class="movie-title"></h3>
      <span class="badge"></span>
      <p class="movie-meta"></p>
      <p class="rating">
        <span aria-hidden="true"><span class="star-filled"></span><span class="star-empty"></span></span>
        <span class="visually-hidden rating-text"></span>
      </p>
      <p class="comment"></p>
      <div class="card-actions">
        <button type="button" class="btn btn-secondary btn-small" data-action="edit">Editar</button>
        <button type="button" class="btn btn-danger btn-small" data-action="delete">Remover</button>
      </div>
    </div>
  `;

  const poster = card.querySelector('.poster');
  poster.src = movie.poster || placeholderPoster(movie.titulo);
  poster.alt = `Pôster do filme ${movie.titulo}`;
  poster.addEventListener('error', () => {
    poster.src = placeholderPoster(movie.titulo);
  }, { once: true });

  const badge = card.querySelector('.badge');
  badge.textContent = STATUS_LABELS[movie.status];
  badge.classList.add(`badge-${movie.status}`);

  card.querySelector('.movie-title').textContent = movie.titulo;
  card.querySelector('.movie-meta').textContent = `${movie.ano} · ${movie.genero}`;
  card.querySelector('.star-filled').textContent = '★'.repeat(movie.nota);
  card.querySelector('.star-empty').textContent = '☆'.repeat(5 - movie.nota);
  card.querySelector('.rating-text').textContent = `Nota ${movie.nota} de 5`;

  const comment = card.querySelector('.comment');
  if (movie.comentario) {
    comment.textContent = `"${movie.comentario}"`;
  } else {
    comment.remove();
  }

  card.querySelector('[data-action="edit"]').setAttribute('aria-label', `Editar ${movie.titulo}`);
  card.querySelector('[data-action="delete"]').setAttribute('aria-label', `Remover ${movie.titulo}`);

  return card;
}

function renderMovies() {
  const visibleMovies = filterMovies();

  movieList.replaceChildren(...visibleMovies.map(createMovieCard));

  const total = movies.length;
  resultCount.textContent = `Mostrando ${visibleMovies.length} de ${total} ${total === 1 ? 'filme' : 'filmes'}`;

  emptyMessage.hidden = visibleMovies.length > 0;
  emptyMessage.textContent = total === 0
    ? 'Nenhum filme cadastrado ainda. Clique em "+ Adicionar" para começar.'
    : 'Nenhum filme encontrado com essa busca e filtro.';
}

function setFilter(status) {
  currentFilter = status;

  filterButtons.forEach(button => {
    const isActive = button.dataset.status === status;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive);
  });

  renderMovies();
}

function clearErrors() {
  formMessage.textContent = '';
  movieForm.querySelectorAll('.field-error').forEach(error => {
    error.textContent = '';
  });
  movieForm.querySelectorAll('[aria-invalid]').forEach(field => {
    field.removeAttribute('aria-invalid');
  });
}

function showErrors(errors) {
  const fieldNames = Object.keys(errors);

  fieldNames.forEach(name => {
    fields[name].setAttribute('aria-invalid', 'true');
    document.getElementById(`${name}-error`).textContent = errors[name];
  });

  formMessage.textContent = 'Não foi possível salvar. Corrija os campos destacados.';
  fields[fieldNames[0]].focus();
}

function openMovieModal(movie = null) {
  movieForm.reset();
  clearErrors();
  editingMovieId = movie ? movie.id : null;

  if (movie) {
    dialogTitle.textContent = 'Editar filme';
    submitButton.textContent = 'Salvar alterações';
    fields.titulo.value = movie.titulo;
    fields.ano.value = movie.ano;
    fields.genero.value = movie.genero;
    fields.poster.value = movie.poster;
    fields.status.value = movie.status;
    fields.nota.value = movie.nota;
    fields.comentario.value = movie.comentario;
  } else {
    dialogTitle.textContent = 'Adicionar filme';
    submitButton.textContent = 'Adicionar';
  }

  movieDialog.showModal();
  fields.titulo.focus();
}

function closeMovieModal() {
  movieDialog.close();
  editingMovieId = null;
}

function validateMovie(movie) {
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

function getNextId() {
  return movies.reduce((maxId, movie) => Math.max(maxId, movie.id), 0) + 1;
}

function handleMovieSubmit(event) {
  event.preventDefault();
  clearErrors();

  const movieData = {
    titulo: fields.titulo.value.trim(),
    ano: Number(fields.ano.value),
    genero: fields.genero.value.trim(),
    poster: fields.poster.value.trim(),
    status: fields.status.value,
    nota: Number(fields.nota.value),
    comentario: fields.comentario.value.trim()
  };

  const errors = validateMovie(movieData);
  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    return;
  }

  if (editingMovieId === null) {
    movies.push({ id: getNextId(), ...movieData });
  } else {
    movies = movies.map(movie =>
      movie.id === editingMovieId ? { ...movie, ...movieData } : movie
    );
  }

  saveMovies();
  renderMovies();
  closeMovieModal();
}

function editMovie(id) {
  const movie = movies.find(item => item.id === id);
  if (movie) {
    openMovieModal(movie);
  }
}

function deleteMovie(id) {
  const movie = movies.find(item => item.id === id);
  if (!movie || !confirm(`Deseja remover "${movie.titulo}" da sua lista?`)) {
    return;
  }

  movies = movies.filter(item => item.id !== id);
  saveMovies();
  renderMovies();
}

searchInput.addEventListener('input', () => {
  searchTerm = searchInput.value;
  renderMovies();
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => setFilter(button.dataset.status));
});

movieList.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const id = Number(button.closest('.movie-card').dataset.id);

  if (button.dataset.action === 'edit') {
    editMovie(id);
  } else if (button.dataset.action === 'delete') {
    deleteMovie(id);
  }
});

addButton.addEventListener('click', () => openMovieModal());
cancelButton.addEventListener('click', closeMovieModal);
movieForm.addEventListener('submit', handleMovieSubmit);

movieDialog.addEventListener('cancel', event => {
  event.preventDefault();
  closeMovieModal();
});

movieForm.addEventListener('input', event => {
  const field = event.target;
  if (field.getAttribute('aria-invalid') === 'true') {
    field.removeAttribute('aria-invalid');
    document.getElementById(`${field.name}-error`).textContent = '';
  }
});

fields.ano.min = MIN_YEAR;
fields.ano.max = MAX_YEAR;

loadMovies();
renderMovies();
