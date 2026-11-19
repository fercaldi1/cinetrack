import MovieCard from './MovieCard.jsx';

// Grade de filmes. Cada card recebe as ações vindas do App.
export default function MovieList({ movies, onEdit, onDelete, deletingId }) {
  return (
    <ul id="movie-list" className="movie-grid">
      {movies.map(movie => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === movie.id}
        />
      ))}
    </ul>
  );
}
