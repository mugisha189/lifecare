import { View, ActivityIndicator } from 'react-native';

// This screen is shown briefly while _layout.tsx determines the correct initial route
// The actual navigation logic happens in _layout.tsx based on auth state and language selection
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#062F71',
      }}
    >
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}
