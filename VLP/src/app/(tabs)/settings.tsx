import Constants from 'expo-constants';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, type AppearancePreference, type Palette } from '../../styles/theme';

const choices: { value: AppearancePreference; title: string; description: string }[] = [
  { value: 'system', title: 'System', description: 'Match your device settings' },
  { value: 'light', title: 'Light', description: 'Always use a light appearance' },
  { value: 'dark', title: 'Dark', description: 'Always use a dark appearance' },
];

export default function Settings() {
  const { preference, palette, loading, error, setPreference } = useTheme();
  const styles = createStyles(palette);
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>VLP</Text>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Make the app feel like yours.</Text>
        <Text style={styles.section}>Appearance</Text>
        <Text style={styles.sectionDescription}>Choose how VLP looks on this device.</Text>
        {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <View style={styles.card}>
          {choices.map((choice) => (
            <Pressable
              key={choice.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: preference === choice.value, disabled: loading }}
              aria-checked={preference === choice.value}
              disabled={loading}
              onPress={() => { void setPreference(choice.value); }}
              style={styles.choice}
            >
              <View style={styles.choiceText}>
                <Text style={styles.choiceTitle}>{choice.title}</Text>
                <Text style={styles.choiceDescription}>{choice.description}</Text>
              </View>
              <View style={[styles.radio, preference === choice.value && styles.radioSelected]}>
                {preference === choice.value && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          ))}
        </View>
        <Text style={styles.section}>About</Text>
        <View style={styles.versionCard}>
          <Text style={styles.choiceTitle}>App version</Text>
          <Text style={styles.version}>{Constants.expoConfig?.version ?? 'Unavailable'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (palette: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, maxWidth: 720, width: '100%', alignSelf: 'center' },
  eyebrow: { color: palette.accent, fontWeight: '700', fontSize: 11, letterSpacing: 1.5, marginBottom: 10 },
  title: { color: palette.text, fontSize: 34, fontWeight: '700', letterSpacing: -1 },
  subtitle: { color: palette.secondary, fontSize: 15, marginTop: 8 },
  section: { color: palette.text, fontSize: 20, fontWeight: '700', marginTop: 38, marginBottom: 8 },
  sectionDescription: { color: palette.secondary, fontSize: 13, marginBottom: 16 },
  error: { color: palette.error, marginBottom: 12 },
  card: { backgroundColor: palette.surface, borderRadius: 14, overflow: 'hidden' },
  choice: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  choiceText: { flex: 1 },
  choiceTitle: { color: palette.text, fontSize: 15, fontWeight: '600' },
  choiceDescription: { color: palette.secondary, fontSize: 13, marginTop: 5 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: palette.muted, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: palette.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.accent },
  versionCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: palette.surface, borderRadius: 14, padding: 18 },
  version: { color: palette.secondary, fontSize: 15 },
});
