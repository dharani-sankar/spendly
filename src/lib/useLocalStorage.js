import { useEffect, useState } from 'react';

// useState that persists to localStorage. `initial` may be a value or a function.
export function useLocalStorage(key, initial) {
  const resolveInitial = () => (typeof initial === 'function' ? initial() : initial);

  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        const fallback = resolveInitial();
        // Guard against corrupted storage: keep the same shape as the default.
        if (Array.isArray(fallback) ? Array.isArray(parsed) : typeof parsed === typeof fallback) {
          return parsed;
        }
      }
    } catch {
      /* ignore and fall through */
    }
    return resolveInitial();
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked: the app keeps working in memory */
    }
  }, [key, value]);

  return [value, setValue];
}
