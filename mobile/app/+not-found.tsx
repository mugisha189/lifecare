import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text
          className="mb-4 text-2xl font-bold"
          style={{
            color: Colors.light.text,
            fontFamily: 'Poppins-Bold',
          }}
        >
          This screen doesn't exist.
        </Text>

        <Link
          href="/"
          className="mt-4 rounded-lg px-6 py-3"
          style={{ backgroundColor: Colors.light.tint }}
        >
          <Text
            className="text-base"
            style={{
              color: Colors.light.background,
              fontFamily: 'Poppins-Medium',
            }}
          >
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}
