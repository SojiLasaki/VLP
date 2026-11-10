import { Text, View, StyleSheet } from 'react-native';

export default function DocumentViewer() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Document Viewer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffff',
    // backgroundColor: '#242525',
  },
  text: {
    color: '#000000'
  }
});