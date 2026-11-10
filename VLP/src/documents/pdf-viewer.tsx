import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { useTheme } from '../styles/theme';
import { openDocumentPreview } from './open-document';
import type { RecentDocument } from './storage';

export default function PdfViewer({ document }: { document: RecentDocument }) {
  const [opening, setOpening] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useRef(false);
  const { palette } = useTheme();

  const openPreview = useCallback(async () => {
    setOpening(true);
    setError(null);
    try {
      await openDocumentPreview(document);
      if (isFocused.current) router.dismissTo('/');
    } catch (cause) {
      if (isFocused.current) {
        setError(cause instanceof Error ? cause.message : 'Could not open this PDF.');
      }
    } finally {
      if (isFocused.current) setOpening(false);
    }
  }, [document]);

  useFocusEffect(useCallback(() => {
    isFocused.current = true;
    void openPreview();
    return () => { isFocused.current = false; };
  }, [openPreview]));

  return (
    <View style={styles.container}>
      {opening ? <ActivityIndicator color={colors.orange} /> : (
        <>
          <Text accessibilityRole={error ? 'alert' : undefined} style={[styles.message, { color: palette.text }]}>
            {error ?? 'Your PDF opens in the device viewer.'}
          </Text>
          <Pressable accessibilityRole="button" onPress={openPreview} style={styles.button}>
            <Text style={styles.buttonText}>{error ? 'Try again' : 'Open PDF'}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { color: '#344054', textAlign: 'center', lineHeight: 22 },
  button: { backgroundColor: colors.orange, borderRadius: 9, paddingVertical: 13, paddingHorizontal: 24, marginTop: 20 },
  buttonText: { color: '#241200', fontWeight: '700' },
});
