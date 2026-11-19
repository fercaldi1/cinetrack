import { useState } from 'react';
import StarRating from './StarRating.jsx';
import { STATUS_LABELS, placeholderPoster } from '../utils/filmes.js';

// Card de um filme. Recebe o filme e as funções de editar e remover.
export default function MovieCard({ movie, onEdit, onDelete, isDeleting = false }) {
  // Guarda a URL que falhou ao carregar para mostrar o placeholder no lugar.
  const [failedPoster, setFailedPoster] = useState(null);

  const posterSrc =
    movie.poster && movie.poster !== failedPoster ? movie.poster : placeholderPoster(movie.titulo);

  return (
    <li className="movie-card">
      <img
        className="poster"
        src={posterSrc}
        alt={`Pôster do filme ${movie.titulo}`}
        width="200"
        height="300"
        loading="lazy"
        onError={() => setFailedPoster(movie.poster)}
      />

      <div className="card-body">
        <h3 className="movie-title">{movie.titulo}</h3>
        <span className={`badge badge-${movie.status}`}>{STATUS_LABELS[movie.status]}</span>
        <p className="movie-meta">
          {movie.ano}
          {movie.genero && ` · ${movie.genero}`}
        </p>
        <StarRating value={movie.nota} />
        {movie.comentario && <p className="comment">"{movie.comentario}"</p>}

        <div className="card-actions">
          <button
            type="button"
            className="btn btn-secondary btn-small"
            aria-label={`Editar ${movie.titulo}`}
            onClick={() => onEdit(movie)}
            disabled={isDeleting}
          >
            Editar
          </button>
          <button
            type="button"
            className="btn btn-danger btn-small"
            aria-label={`Remover ${movie.titulo}`}
            onClick={() => onDelete(movie)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Removendo...' : 'Remover'}
          </button>
        </div>
      </div>
    </li>
  );
}
