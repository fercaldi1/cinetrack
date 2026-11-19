// Nota em estrelas: sempre 5 símbolos (cheios e vazios).
export default function StarRating({ value }) {
  const filled = Number.isInteger(value) ? Math.min(Math.max(value, 0), 5) : 0;

  return (
    <p className="rating">
      <span aria-hidden="true">
        <span className="star-filled">{'★'.repeat(filled)}</span>
        <span className="star-empty">{'☆'.repeat(5 - filled)}</span>
      </span>
      <span className="visually-hidden">{filled ? `Nota ${filled} de 5` : 'Sem nota'}</span>
    </p>
  );
}
