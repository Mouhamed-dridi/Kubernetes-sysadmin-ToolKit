import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getPasswords } from './api';

const STORAGE_KEY = 'pw_manager_cache';

const PasswordsContext = createContext(null);

export function PasswordsProvider({ children }) {
  const [passwords, setPasswords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passwords));
  }, [passwords]);

  const refreshPasswords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPasswords();
      setPasswords(res.data);
    } catch {
      // keep cached data on error
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PasswordsContext.Provider value={{ passwords, setPasswords, refreshPasswords, loading }}>
      {children}
    </PasswordsContext.Provider>
  );
}

export const usePasswords = () => useContext(PasswordsContext);
