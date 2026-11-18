import { useEffect, useState } from 'react';

// Devolve o valor recebido somente depois que ele ficar "parado" por `delay` ms.
// Usado na busca para não refiltrar a lista a cada tecla digitada.
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
