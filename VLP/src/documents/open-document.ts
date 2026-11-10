import { Directory, File, Paths } from 'expo-file-system';
import type { RecentDocument } from './storage';

export async function openDocumentPreview(document: RecentDocument): Promise<boolean> {
  if (document.kind !== 'pdf') return false;

  const name = document.name.replace(/[\\/\0]/g, '_');
  if (!name || name === '.' || name === '..') {
    throw new Error('The document has an invalid filename.');
  }
  const directory = new Directory(Paths.cache, 'document-previews', document.id);
  directory.create({ intermediates: true, idempotent: true });
  const previewFile = new File(directory, name);
  const source = new File(document.uri);
  if (!source.exists) throw new Error('This document is no longer accessible. Try selecting it again.');
  if (!previewFile.exists) {
    await source.copy(previewFile);
  }
  if (!(await previewFile.canPreview({ mimeType: 'application/pdf' }))) {
    throw new Error('No PDF viewer is available, or this file is no longer accessible.');
  }
  await previewFile.preview({ title: document.name, mimeType: 'application/pdf' });
  return true;
}
