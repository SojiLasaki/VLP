import { View } from 'react-native';
import styles from '../styles/nav.styles';
import { Link, Stack } from 'expo-router';

export default function NotFound() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops! Not Found' }} />
            <View style={styles.container}>
                <Link href="/" style={styles.button}>
                Go back to Home screen!
                </Link>
            </View>        
      </>
  );
}

