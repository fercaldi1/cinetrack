import { STATUS_FILTERS } from '../utils/filmes.js';

// Botões de filtro por status. O botão ativo recebe destaque e aria-pressed.
export default function StatusFilters({ value, onChange }) {
  return (
    <div className="filters" role="group" aria-label="Filtrar por status">
      {STATUS_FILTERS.map(filter => {
        const isActive = filter.value === value;

        return (
          <button
            key={filter.value}
            type="button"
            className={`filter-btn${isActive ? ' active' : ''}`}
            aria-pressed={isActive}
            onClick={() => onChange(filter.value)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
