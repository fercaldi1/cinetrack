import { useEffect, useRef, useState } from 'react';
import { buscarNoTmdb } from '../api/filmes.js';
import { MAX_YEAR, MIN_YEAR, STATUS_LABELS, validateMovie } from '../utils/filmes.js';

const EMPTY_VALUES = {
  titulo: '',
  ano: '',
  genero: '',
  poster: '',
  status: '',
  nota: '',
  comentario: ''
};

function toFormValues(movie) {
  if (!movie) return EMPTY_VALUES;

  return {
    titulo: movie.titulo ?? '',
    ano: movie.ano != null ? String(movie.ano) : '',
    genero: movie.genero ?? '',
    poster: movie.poster ?? '',
    status: movie.status ?? '',
    nota: movie.nota != null ? String(movie.nota) : '',
    comentario: movie.comentario ?? ''
  };
}

// Formulário de adição e edição, exibido em um <dialog> modal.
// É montado ao abrir e desmontado ao fechar, então sempre começa limpo
// (ou pré-preenchido com o filme que está sendo editado).
export default function MovieForm({ movie, onSubmit, onClose }) {
  const isEditing = Boolean(movie);

  const dialogRef = useRef(null);
  const formRef = useRef(null);

  const [values, setValues] = useState(() => toFormValues(movie));
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [tmdbMessage, setTmdbMessage] = useState('');
  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues(previous => ({ ...previous, [name]: value }));

    if (errors[name]) {
      setErrors(previous => {
        const { [name]: _removed, ...rest } = previous;
        return rest;
      });
    }
  }

  function showErrors(fieldErrors, message) {
    setErrors(fieldErrors);
    setFormMessage(message);

    const firstField = Object.keys(fieldErrors)[0];
    if (firstField) {
      formRef.current.elements[firstField]?.focus();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormMessage('');

    const movieData = {
      titulo: values.titulo.trim(),
      ano: Number(values.ano),
      genero: values.genero.trim(),
      poster: values.poster.trim(),
      status: values.status,
      nota: Number(values.nota),
      comentario: values.comentario.trim()
    };

    const validationErrors = validateMovie(movieData);
    if (Object.keys(validationErrors).length > 0) {
      showErrors(validationErrors, 'Não foi possível salvar. Corrija os campos destacados.');
      return;
    }

    setIsSaving(true);
    try {
      // O App só atualiza a lista e fecha o formulário depois da resposta do servidor.
      await onSubmit(movieData);
    } catch (error) {
      showErrors(error.fieldErrors || {}, error.message);
      setIsSaving(false);
    }
  }

  async function handleTmdbSearch() {
    const title = values.titulo.trim();
    if (!title) {
      setTmdbMessage('Digite o título antes de buscar o pôster.');
      return;
    }

    setIsSearchingTmdb(true);
    setTmdbMessage('');

    try {
      const results = await buscarNoTmdb(title);
      const found = results.find(result => result.poster);

      if (!found) {
        setTmdbMessage('Nenhum pôster encontrado para esse título.');
        return;
      }

      setValues(previous => ({
        ...previous,
        poster: found.poster,
        ano: previous.ano || (found.ano ? String(found.ano) : '')
      }));
      setTmdbMessage(`Pôster de "${found.titulo}"${found.ano ? ` (${found.ano})` : ''} aplicado.`);
    } catch (error) {
      setTmdbMessage(error.message);
    } finally {
      setIsSearchingTmdb(false);
    }
  }

  function handleCancel(event) {
    // Tecla Esc: o próprio <dialog> dispara "cancel".
    event.preventDefault();
    if (!isSaving) onClose();
  }

  function fieldProps(name) {
    return {
      id: name,
      name,
      value: values[name],
      onChange: handleChange,
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': `${name}-error`
    };
  }

  function renderError(name) {
    return (
      <span className="field-error" id={`${name}-error`}>
        {errors[name]}
      </span>
    );
  }

  return (
    <dialog
      ref={dialogRef}
      className="movie-dialog"
      aria-labelledby="dialog-title"
      onCancel={handleCancel}
    >
      <form ref={formRef} className="movie-form" onSubmit={handleSubmit}>
        <h2 id="dialog-title">{isEditing ? 'Editar filme' : 'Adicionar filme'}</h2>

        <p className="form-message" role="alert">
          {formMessage}
        </p>

        <div className="field">
          <label htmlFor="titulo">Título</label>
          <input type="text" maxLength={120} required autoFocus {...fieldProps('titulo')} />
          {renderError('titulo')}
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="ano">Ano</label>
            <input
              type="number"
              min={MIN_YEAR}
              max={MAX_YEAR}
              step="1"
              placeholder="Ex.: 2010"
              required
              {...fieldProps('ano')}
            />
            {renderError('ano')}
          </div>

          <div className="field">
            <label htmlFor="nota">Nota (1 a 5)</label>
            <input type="number" min="1" max="5" step="1" required {...fieldProps('nota')} />
            {renderError('nota')}
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="genero">Gênero</label>
            <input type="text" maxLength={60} placeholder="Ex.: Drama" required {...fieldProps('genero')} />
            {renderError('genero')}
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select required {...fieldProps('status')}>
              <option value="">Selecione...</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {renderError('status')}
          </div>
        </div>

        <div className="field">
          <label htmlFor="poster">
            URL do pôster <span className="optional">(opcional)</span>
          </label>
          <div className="poster-field">
            <input type="url" placeholder="https://..." {...fieldProps('poster')} />
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={handleTmdbSearch}
              disabled={isSearchingTmdb}
            >
              {isSearchingTmdb ? 'Buscando...' : 'Buscar no TMDB'}
            </button>
          </div>
          {renderError('poster')}
          <p className="field-hint" aria-live="polite">
            {tmdbMessage}
          </p>
        </div>

        <div className="field">
          <label htmlFor="comentario">
            Comentário <span className="optional">(opcional)</span>
          </label>
          <textarea rows={3} maxLength={500} {...fieldProps('comentario')} />
          {renderError('comentario')}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Adicionar'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
