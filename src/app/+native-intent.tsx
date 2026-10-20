import { planLinkData } from '@/data/plan-link';

/** A plan link keeps its data in the fragment, which the router drops; it becomes a parameter of the import screen. */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  const data = planLinkData(path);
  return data ? `/plan/import?d=${data}` : path;
}
