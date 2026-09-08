'use client';

import { useEffect } from 'react';
import { useParams as useNextParams, usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation';

export function useNavigate() {
  const router = useRouter();
  return (to: string, options?: { replace?: boolean }) => {
    if (options?.replace) router.replace(to);
    else router.push(to);
  };
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  const query = searchParams.toString();
  return { pathname, search: query ? `?${query}` : '', state: null };
}

export function useParams<T extends Record<string, string> = Record<string, string>>() { return useNextParams() as unknown as T; }
export const useSearchParams = useNextSearchParams;
