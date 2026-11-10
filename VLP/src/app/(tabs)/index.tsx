import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import styles from '../../styles/nav.styles';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, World!</Text>
      <Link href="/settings" style={styles.button}>Go to Settings</Link>
    </View>
  );
}

