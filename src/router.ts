/**
 * Misses Trollz - Tiny hash router.
 *
 * Hash links (#/manifesto) work everywhere the app runs: from the downloaded
 * single file opened by double click, from a static host, and from `npm run
 * dev`. A host that serves the app at a real path (/manifesto) also lands on
 * the right page, because the last path segment is read when the hash is empty.
 */
import { useEffect, useState } from 'react';

export type Route = 'play' | 'manifesto' | 'governance' | 'child-safety';

export const NAV: ReadonlyArray<{ route: Route; href: string; label: string; title: string }> = [
  { route: 'play', href: '#/misses-trollz', label: 'Misses Trollz', title: 'Misses Trollz' },
  { route: 'manifesto', href: '#/manifesto', label: 'Manifesto', title: 'Manifesto | Misses Trollz' },
  { route: 'governance', href: '#/governance', label: 'Governance', title: 'Governance | Misses Trollz' },
  { route: 'child-safety', href: '#/child-safety', label: 'Child Safety', title: 'Child Safety | Misses Trollz' },
];

const BY_SLUG: Record<string, Route> = {
  '': 'play',
  'misses-trollz': 'play',
  manifesto: 'manifesto',
  governance: 'governance',
  'child-safety': 'child-safety',
};

/** Hash first, then the last path segment; anything unknown is the play screen. */
export function parseRoute(hash: string, pathname = ''): Route {
  const fromHash = hash.replace(/^#\/?/, '').split(/[?#]/)[0].replace(/\/+$/, '').toLowerCase();
  if (fromHash) return BY_SLUG[fromHash] ?? 'play';
  const last = pathname.replace(/\/+$/, '').split('/').pop()?.replace(/\.html?$/i, '').toLowerCase() ?? '';
  return BY_SLUG[last] ?? 'play';
}

export function titleOf(route: Route): string {
  return NAV.find((n) => n.route === route)?.title ?? 'Misses Trollz';
}

export function useRoute(): Route {
  const read = () => (typeof window === 'undefined' ? 'play' : parseRoute(window.location.hash, window.location.pathname));
  const [route, setRoute] = useState<Route>(read);
  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
