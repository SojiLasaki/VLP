import type { DocumentPickerAsset } from 'expo-document-picker';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { copyDocument, deleteDocument, loadDocuments, saveDocuments, type RecentDocument } from './storage';

type DocumentContextValue = {
  documents: RecentDocument[];
  selected: RecentDocument | null;
  loading: boolean;
  error: string | null;
  addDocument: (asset: DocumentPickerAsset) => Promise<RecentDocument>;
  openDocument: (id: string) => Promise<RecentDocument>;
  removeDocument: (id: string) => Promise<void>;
};

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<RecentDocument[]>([]);
  const [selected, setSelected] = useState<RecentDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments()
      .then(setDocuments)
      .catch(() => setError('Could not load recent documents. Please restart the app and try again.'))
      .finally(() => setLoading(false));
  }, []);

  async function addDocument(asset: DocumentPickerAsset) {
    const document = await copyDocument(asset);
    const updated = [document, ...documents];
    try {
      await saveDocuments(updated);
    } catch (cause) {
      await deleteDocument(document);
      throw cause;
    }
    setDocuments(updated);
    setSelected(document);
    return document;
  }

  async function openDocument(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) throw new Error('This document is no longer in your recent list.');
    const opened = { ...document, lastOpened: Date.now() };
    const updated = [opened, ...documents.filter((item) => item.id !== id)];
    await saveDocuments(updated);
    setDocuments(updated);
    setSelected(opened);
    return opened;
  }

  async function removeDocument(id: string) {
    const document = documents.find((item) => item.id === id);
    if (!document) throw new Error('This document is no longer in your recent list.');
    const updated = documents.filter((item) => item.id !== id);
    await saveDocuments(updated);
    setDocuments(updated);
    if (selected?.id === id) setSelected(null);
    await deleteDocument(document);
  }

  return (
    <DocumentContext.Provider value={{ documents, selected, loading, error, addDocument, openDocument, removeDocument }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) throw new Error('useDocuments must be used within DocumentProvider.');
  return context;
}
