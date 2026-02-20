import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface UseFetchResult<T> {
  data: T | null;
  refetch: () => void;
}

export function useFetch<T>(endpoint: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api${endpoint}`);
            if (!res.ok) throw new Error(`Falha ao carregar dados`);
            const json = await res.json();
            if (!cancelled) setData(json);
        } catch (err) {
            console.error(err);
            toast.error('Erro ao carregar dados!');
        }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [endpoint, trigger]);

  const refetch = () => setTrigger(t => t + 1);

  return { data, refetch };
}