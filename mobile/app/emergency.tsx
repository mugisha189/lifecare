import React, { useEffect } from 'react';
import { View, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';

const EMERGENCY_NUMBER = '912';

async function callEmergencyNumber() {
  const url = `tel:${EMERGENCY_NUMBER}`;
  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    Alert.alert(
      'Cannot place call',
      `Your device cannot start a phone call to ${EMERGENCY_NUMBER}.`,
    );
    return;
  }
  await Linking.openURL(url);
}

export default function EmergencyScreen() {
  useEffect(() => {
    // Immediately prompt the user to call emergency when screen opens
    Alert.alert(
      'Emergency call',
      `Do you want to call ${EMERGENCY_NUMBER} now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          style: 'destructive',
          onPress: () => {
            void callEmergencyNumber();
          },
        },
      ],
    );
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-red-50" edges={['top']}>
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-6 items-center">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Ionicons name="warning-outline" size={40} color="#B91C1C" />
          </View>
          <Text className="text-center font-poppins-bold text-2xl text-red-800">
            Emergency Assistance
          </Text>
          <Text className="mt-2 text-center font-poppins-regular text-sm text-red-700">
            If you are in immediate danger or having a medical emergency, please call {EMERGENCY_NUMBER} right away.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => void callEmergencyNumber()}
          className="mt-4 w-full max-w-xs flex-row items-center justify-center rounded-full bg-red-600 px-6 py-3"
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text className="ml-2 font-poppins-semibold text-base text-white">
            Call {EMERGENCY_NUMBER} now
          </Text>
        </TouchableOpacity>

        <Text className="mt-4 text-center font-poppins-regular text-xs text-red-700 px-4">
          Only use this emergency button for real emergencies. For non-urgent medical questions, please book a consultation instead.
        </Text>
      </View>
    </SafeAreaView>
  );
}

