import { useRef, useState } from 'react';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDocuments } from '../../documents/document-context';
import { openDocumentPreview } from '../../documents/open-document';
import { fileLabel } from '../../documents/file-label';
import type { RecentDocument } from '../../documents/storage';
import createHomeStyles from '../../styles/home.styles';
import { colors } from '../../styles/colors';
import { useTheme } from '../../styles/theme';

export default function Index() {
  const { documents, loading, error, addDocument, openDocument, removeDocument } = useDocuments();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const pendingView = useRef<string | null>(null);
  const { palette } = useTheme();
  const homeStyles = createHomeStyles(palette);
  const menuFile = documents.find((file) => file.id === menuId);

  async function showDocument(document: RecentDocument) {
    if (!(await openDocumentPreview(document))) {
      router.push('/document-viewer');
    }
  }

  async function selectFileFromDevice() {
    try {
      setActionError(null);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
        base64: true,
      });
      if (result.canceled) return;
      setBusy(true);
      const document = await addDocument(result.assets[0]);
      await showDocument(document);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not open the document.');
    } finally {
      setBusy(false);
    }
  }

  async function openRecent(id: string) {
    setBusy(true);
    setActionError(null);
    try {
      const document = await openDocument(id);
      await showDocument(document);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not open the document.');
    } finally {
      setBusy(false);
    }
  }

  async function removeRecent(id: string) {
    setMenuId(null);
    setConfirming(false);
    setBusy(true);
    setActionError(null);
    try {
      await removeDocument(id);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not remove the document.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={homeStyles.container} edges={['top']}>
      <ScrollView contentContainerStyle={homeStyles.content}>
        <Text style={homeStyles.eyebrow}>VLP</Text>
        <Text style={homeStyles.title}>Welcome</Text>
        <Text style={homeStyles.subtitle}>Pick up where you left off, or open something new.</Text>

        <View style={homeStyles.uploadCard}>
          <Text style={homeStyles.uploadIcon}>↑</Text>
          <Text style={homeStyles.uploadTitle}>Open a document</Text>
          <Text style={homeStyles.uploadDescription}>
            Select a file from your device to view it here.
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={busy || loading || !!error}
            onPress={selectFileFromDevice}
            style={({ pressed }) => [homeStyles.selectButton, pressed && homeStyles.pressed]}
          >
            <Text style={homeStyles.selectButtonText}>Choose a file</Text>
          </Pressable>
          <Text style={homeStyles.fileHint}>PDF, TXT, JPG or PNG</Text>
        </View>

        <View style={homeStyles.sectionHeading}>
          <View>
            <Text style={homeStyles.sectionTitle}>Recently viewed</Text>
            <Text style={homeStyles.sectionSubtitle}>Your documents, ready when you are.</Text>
          </View>
        </View>
        {(error || actionError) && (
          <Text accessibilityRole="alert" style={homeStyles.errorText}>{error || actionError}</Text>
        )}
        {loading ? (
          <ActivityIndicator color={colors.orange} />
        ) : documents.length === 0 ? (
          <View style={homeStyles.emptyState}>
            <Text style={homeStyles.emptyTitle}>No recent documents yet</Text>
            <Text style={homeStyles.emptyText}>Files you open will appear here.</Text>
          </View>
        ) : (
          <View style={homeStyles.list}>
            {documents.map((file) => (
              <View key={file.id} style={homeStyles.fileRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${file.name}`}
                  disabled={busy}
                  onPress={() => openRecent(file.id)}
                  style={({ pressed }) => [homeStyles.fileButton, pressed && homeStyles.pressed]}
                >
                  <View style={homeStyles.fileIcon}><Text style={homeStyles.fileIconText}>{fileLabel(file)}</Text></View>
                  <View style={homeStyles.fileDetails}>
                    <Text numberOfLines={1} style={homeStyles.fileName}>{file.name}</Text>
                    <Text style={homeStyles.fileTime}>
                      Opened {new Date(file.lastOpened).toLocaleString()}
                    </Text>
                  </View>
                  <View style={homeStyles.iconButton} accessible={false}>
                    <View style={homeStyles.chevron} />
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Options for ${file.name}`}
                  disabled={busy}
                  onPress={() => { setMenuId(file.id); setConfirming(false); }}
                  style={homeStyles.removeButton}
                >
                  <View style={homeStyles.dots} accessible={false}>
                    <View style={homeStyles.dot} />
                    <View style={homeStyles.dot} />
                    <View style={homeStyles.dot} />
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <Modal
        visible={!!menuFile}
        transparent
        animationType="fade"
        onRequestClose={() => { setMenuId(null); setConfirming(false); }}
        onDismiss={() => {
          if (pendingView.current) {
            const id = pendingView.current;
            pendingView.current = null;
            void openRecent(id);
          }
        }}
      >
        <View style={homeStyles.modalOverlay}>
          <View style={homeStyles.modalCard} accessibilityViewIsModal>
            <Text style={homeStyles.modalTitle}>{confirming ? 'Remove document?' : menuFile?.name}</Text>
            {confirming && (
              <Text style={homeStyles.modalDescription}>
                Remove {menuFile?.name} from recent documents? The original file will not be deleted.
              </Text>
            )}
            {confirming ? (
              <Pressable accessibilityRole="button" onPress={() => { if (menuFile) void removeRecent(menuFile.id); }} style={homeStyles.modalAction}>
                <Text style={homeStyles.destructiveText}>Remove</Text>
              </Pressable>
            ) : (
              <>
                <Pressable accessibilityRole="button" onPress={() => {
                  if (menuFile) {
                    if (Platform.OS === 'ios') pendingView.current = menuFile.id;
                    else void openRecent(menuFile.id);
                    setMenuId(null);
                  }
                }} style={homeStyles.modalAction}>
                  <Text style={homeStyles.modalActionText}>View</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => setConfirming(true)} style={homeStyles.modalAction}>
                  <Text style={homeStyles.destructiveText}>Remove</Text>
                </Pressable>
              </>
            )}
            <Pressable accessibilityRole="button" onPress={() => { setMenuId(null); setConfirming(false); }} style={homeStyles.modalAction}>
              <Text style={homeStyles.modalActionText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
