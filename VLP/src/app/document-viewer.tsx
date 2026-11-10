import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDocuments } from '../documents/document-context';
import { readText, type RecentDocument } from '../documents/storage';
import PdfViewer from '../documents/pdf-viewer';
import { colors } from '../styles/colors';
import { useTheme, type Palette } from '../styles/theme';

function DocumentContent({ document }: { document: RecentDocument }) {
  const { palette } = useTheme();
  const styles = createStyles(palette);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (document.kind === 'text') {
      readText(document)
        .then((content) => { if (active) setText(content); })
        .catch(() => { if (active) setError('Could not read this document. Try selecting it again.'); });
    }
    return () => { active = false; };
  }, [document]);

  if (error) return <Text accessibilityRole="alert" style={styles.message}>{error}</Text>;
  if (document.kind === 'pdf') return <PdfViewer document={document} />;
  if (document.kind === 'image') {
    return <Image source={{ uri: document.uri }} style={styles.image} resizeMode="contain" onError={() => setError('Could not display this image. Try selecting it again.')} />;
  }
  if (text === null) return <ActivityIndicator style={styles.loading} color={colors.orange} />;
  return <ScrollView style={styles.textContainer}><Text selectable style={styles.documentText}>{text}</Text></ScrollView>;
}

export default function DocumentViewer() {
  const { selected } = useDocuments();
  const { palette } = useTheme();
  const styles = createStyles(palette);
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close document" onPress={() => router.dismissTo('/')} style={styles.backButton}>
          <Text style={styles.backText}>‹ Close</Text>
        </Pressable>
        <Text numberOfLines={1} style={styles.title}>{selected?.name ?? 'Document viewer'}</Text>
      </View>
      {selected ? (
        <DocumentContent key={`${selected.id}-${selected.lastOpened}`} document={selected} />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No document open</Text>
          <Text style={styles.message}>Choose a document from Home to start viewing.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (palette: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: palette.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  backButton: { marginRight: 20, paddingVertical: 4 },
  backText: { color: palette.accent, fontWeight: '600', fontSize: 16 },
  title: { color: palette.text, fontSize: 16, fontWeight: '700', flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { color: palette.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  message: { color: palette.secondary, textAlign: 'center', padding: 20 },
  loading: { flex: 1 },
  image: { flex: 1, width: '100%' },
  textContainer: { flex: 1, backgroundColor: palette.surface, padding: 24 },
  documentText: { color: palette.text, fontSize: 16, lineHeight: 25 },
});
