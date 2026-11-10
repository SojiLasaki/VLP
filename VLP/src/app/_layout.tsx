import { Stack } from "expo-router";
import { DocumentProvider } from "../documents/document-context";
import { ThemeProvider, useTheme } from "../styles/theme";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

function Navigation() {
  const { dark, initializing, palette } = useTheme();
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {initializing ? (
        <View style={[styles.loading, { backgroundColor: palette.background }]}>
          <Text style={[styles.brand, { color: palette.accent }]}>VLP</Text>
          <ActivityIndicator color={colors.orange} accessibilityLabel="Loading app" />
        </View>
      ) : (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
          <Stack.Screen name="document-viewer" options={{ headerShown: false }}/>
        </Stack>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 44, fontWeight: '800', letterSpacing: 4, marginBottom: 22 },
});

export default function RootLayout() {
  return(
    <ThemeProvider>
      <DocumentProvider>
        <Navigation />
      </DocumentProvider>
    </ThemeProvider>
  )
}
