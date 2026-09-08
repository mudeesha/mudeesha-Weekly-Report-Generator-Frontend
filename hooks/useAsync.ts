'use client';

import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '@/lib/api-client';
/** The loader must be memoized with useCallback. Cancels stale route/filter requests. */
export function useAsync<T>(loader: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    loader(controller.signal).then(value => {
      if (!controller.signal.aborted)
        setData(value);
    }).catch(e => {
      if (!controller.signal.aborted) {
        setData(null);
        setError(errorMessage(e));
      }
    }).finally(() => {
      if (!controller.signal.aborted)
        setLoading(false);
    });
    return () => controller.abort();
  }, [loader, revision]);
  return { data, loading, error, retry, setData };
}
