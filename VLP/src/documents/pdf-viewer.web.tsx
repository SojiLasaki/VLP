import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { useTheme } from '../styles/theme';
import type { RecentDocument } from './storage';

export default function PdfViewer({ document }: { document: RecentDocument }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const { palette } = useTheme();

  useEffect(() => {
    let objectUrl: string | undefined;
    let active = true;
    fetch(document.uri)
      .then((response) => {
        if (!response.ok) throw new Error('Could not read PDF.');
        return response.blob();
      })
      .then((blob) => {
        if (active) {
          objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          setUrl(objectUrl);
        }
      })
      .catch(() => { if (active) setError(true); });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document.uri]);

  if (error) return <View style={styles.center}><Text style={{ color: palette.text }}>Could not display this PDF. Try selecting it again.</Text></View>;
  if (!url) return <ActivityIndicator style={styles.center} color={colors.orange} />;
  return <iframe title={document.name} src={url} style={{ border: 0, width: '100%', flex: 1 }} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
