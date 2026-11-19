// Cabeçalho com o logotipo, o campo de busca e o botão de adicionar.
export default function Header({ searchTerm, onSearchChange, onAdd }) {
  return (
    <header className="site-header">
      <div className="container header-content">
        <h1 className="logo">
          Cine<span>Track</span>
        </h1>

        <div className="search" role="search">
          <label htmlFor="search-input" className="visually-hidden">
            Buscar por título
          </label>
          <input
            type="search"
            id="search-input"
            placeholder="Buscar por título..."
            autoComplete="off"
            aria-controls="movie-list"
            value={searchTerm}
            onChange={event => onSearchChange(event.target.value)}
          />
        </div>

        <button type="button" className="btn btn-primary" onClick={onAdd}>
          + Adicionar
        </button>
      </div>
    </header>
  );
}
