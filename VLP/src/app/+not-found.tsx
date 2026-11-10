import { StyleSheet, View } from 'react-native';
import styles from '../styles/nav.styles';
import { Link, Stack } from 'expo-router';
import { useTheme } from '../styles/theme';

export default function NotFound() {
    const { palette } = useTheme();
    return (
        <>
            <Stack.Screen options={{ title: 'Oops! Not Found' }} />
            <View style={[pageStyles.container, { backgroundColor: palette.background }]}>
                <Link href="/" style={[styles.button, { color: palette.accent }]}>
                Go back to Home screen!
                </Link>
            </View>        
      </>
  );
}

const pageStyles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
