import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export type DocumentKind = 'pdf' | 'text' | 'image';
export type RecentDocument = {
  id: string;
  name: string;
  uri: string;
  kind: DocumentKind;
  lastOpened: number;
};

const STORAGE_KEY = 'recent-documents-v1';

function documentKind(asset: DocumentPickerAsset): DocumentKind {
  const name = asset.name.toLowerCase();
  if (asset.mimeType === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (asset.mimeType === 'text/plain' || name.endsWith('.txt')) return 'text';
  if (['image/jpeg', 'image/png'].includes(asset.mimeType ?? '') || /\.(jpe?g|png)$/.test(name)) return 'image';
  throw new Error('Please choose a PDF, TXT, JPG or PNG file.');
}

function webDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('vlp-documents', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('documents');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not access document storage.'));
  });
}

async function webStorage(value?: RecentDocument[]): Promise<RecentDocument[]> {
  const db = await webDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('documents', value ? 'readwrite' : 'readonly');
      const store = transaction.objectStore('documents');
      const request = value ? store.put(value, STORAGE_KEY) : store.get(STORAGE_KEY);
      transaction.oncomplete = () => resolve(value ?? request.result ?? []);
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not access document storage.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Document storage was interrupted.'));
    });
  } finally {
    db.close();
  }
}

export async function loadDocuments(): Promise<RecentDocument[]> {
  if (Platform.OS === 'web') return webStorage();
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function saveDocuments(documents: RecentDocument[]): Promise<void> {
  if (Platform.OS === 'web') {
    await webStorage(documents);
  } else {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }
}

export async function copyDocument(asset: DocumentPickerAsset): Promise<RecentDocument> {
  const kind = documentKind(asset);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let uri: string;
  if (Platform.OS === 'web') {
    if (!asset.base64) throw new Error('Could not read the selected document.');
    uri = asset.base64;
    URL.revokeObjectURL(asset.uri);
  } else {
    const extension = kind === 'pdf' ? '.pdf' : kind === 'text' ? '.txt' : asset.name.toLowerCase().endsWith('.png') || asset.mimeType === 'image/png' ? '.png' : '.jpg';
    const destination = new File(Paths.document, `${id}${extension}`);
    await new File(asset.uri).copy(destination);
    uri = destination.uri;
  }
  return { id, name: asset.name, uri, kind, lastOpened: Date.now() };
}

export async function deleteDocument(document: RecentDocument): Promise<void> {
  if (Platform.OS !== 'web') {
    const file = new File(document.uri);
    if (file.exists) await file.delete();
    const previewDirectory = new Directory(Paths.cache, 'document-previews', document.id);
    if (previewDirectory.exists) await previewDirectory.delete();
  }
}

export async function readText(document: RecentDocument): Promise<string> {
  if (Platform.OS === 'web') {
    const response = await fetch(document.uri);
    if (!response.ok) throw new Error('Could not read the document.');
    return response.text();
  }
  return new File(document.uri).text();
}
