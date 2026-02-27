import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function HistoryScreen() {

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Medical History',
          headerBackTitle: 'Back',
          headerTitleStyle: {
            fontFamily: 'Poppins-Medium',
            fontSize: 24,
          },
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: true,
        }}
      />
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Your medical history will appear here
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
