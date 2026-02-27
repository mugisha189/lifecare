import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import notificationsService, { MedicationReminderSummary } from '@/services/notifications.service';
import { useFocusEffect } from 'expo-router';

export default function ReminderScreen() {
  const [reminders, setReminders] = useState<MedicationReminderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await notificationsService.getMedicationReminders();
      setReminders(list);
    } catch (e) {
      Alert.alert('Error', 'Failed to load reminders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleDelete = async (id: string) => {
    try {
      await notificationsService.cancelMedicationReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch {
      Alert.alert('Error', 'Failed to delete reminder.');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View className="py-15 flex-1 items-center justify-center">
          <Ionicons name="time-outline" size={40} color="#9CA3AF" />
          <Text className="mt-3 font-poppins-regular text-sm text-gray-500">
            Loading reminders...
          </Text>
        </View>
      );
    }

    if (!reminders.length) {
      return (
        <View className="py-15 flex-1 items-center justify-center">
          <Ionicons name="notifications" size={48} color="#002D62" />
          <Text className="mt-4 font-poppins-bold text-2xl text-gray-800">
            Reminders
          </Text>
          <Text className="mt-1 font-poppins-regular text-sm text-gray-500">
            Medication and appointment reminders
          </Text>
        </View>
      );
    }

    return (
      <View className="pb-8">
        {reminders.map(reminder => (
          <View
            key={reminder.id}
            className="mb-3 rounded-2xl border border-gray-200 bg-white px-4 py-3"
          >
            <View className="mb-1.5 flex-row items-center justify-between">
              <Text className="font-poppins-semibold text-sm text-gray-900">
                {reminder.body || reminder.title}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(reminder.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <View className="mt-1 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="repeat" size={14} color="#6B7280" />
                <Text className="ml-1 text-xs text-gray-600">
                  {reminder.frequency === 'DAILY'
                    ? 'Daily'
                    : reminder.frequency === 'WEEKLY'
                      ? 'Weekly'
                      : reminder.frequency === 'MONTHLY'
                        ? 'Monthly'
                        : 'Repeats'}
                </Text>
              </View>
              {reminder.time && (
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text className="ml-1 text-xs text-gray-600">
                    {reminder.time}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="border-b border-gray-200 bg-white px-5 pt-4 pb-3">
          <Text className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins-Bold' }}>
            Reminders
          </Text>
          <Text className="mt-1 text-sm text-gray-500" style={{ fontFamily: 'Poppins-Regular' }}>
            Medication reminders you&apos;ve scheduled from prescriptions
          </Text>
        </View>

        <View className="px-5">
          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
