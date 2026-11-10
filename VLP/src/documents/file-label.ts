import type { RecentDocument } from './storage';

export function fileLabel(document: Pick<RecentDocument, 'name' | 'kind'>): string {
  const extension = document.name.match(/\.([a-z0-9]{1,5})$/i)?.[1];
  if (extension) return extension.toUpperCase();
  return document.kind === 'pdf' ? 'PDF' : document.kind === 'text' ? 'TXT' : 'IMG';
}
