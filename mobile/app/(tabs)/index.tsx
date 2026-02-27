import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import consultationsService from '@/services/consultations.service';
import { Consultation } from '@/services/consultations.service';

function getStatusStyle(status: string) {
  const u = status.toUpperCase();
  if (u === 'COMPLETED') return { bg: 'bg-green-50', text: 'text-green-700', icon: 'checkmark-circle' as const };
  if (u === 'CANCELLED') return { bg: 'bg-red-50', text: 'text-red-700', icon: 'close-circle' as const };
  return { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'time' as const };
}

export default function HomeScreen() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const result = await consultationsService.getMyConsultations({});
      if (result.ok && result.data) {
        setConsultations(result.data);
      } else {
        setConsultations([]);
      }
    } catch (_e) {
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcoming = consultations
    .filter(c => {
      const status = (c.status || '').toUpperCase();
      if (status !== 'SCHEDULED' && status !== 'PENDING') return false;
      const d = new Date(c.scheduledAt || c.date || 0);
      return d >= now;
    })
    .sort((a, b) => new Date(a.scheduledAt || a.date).getTime() - new Date(b.scheduledAt || b.date).getTime())
    .slice(0, 3);

  const recentActivity = [...consultations]
    .sort((a, b) => new Date(b.scheduledAt || b.date || b.createdAt).getTime() - new Date(a.scheduledAt || a.date || a.createdAt).getTime())
    .slice(0, 5);

  const quickActions = [
    { id: 'consultation', title: 'Book Consultation', icon: 'calendar-outline' as const, route: '/consultations/book', primary: true },
    { id: 'prescriptions', title: 'My Prescriptions', icon: 'medical-outline' as const, route: '/(tabs)/prescriptions', primary: false },
    { id: 'emergency', title: 'Emergency', icon: 'call-outline' as const, route: '/emergency', primary: false, danger: true },
  ];

  const handleEmergencyPress = () => {
    const number = '912';
    Alert.alert(
      'Emergency call',
      `Do you want to call ${number} now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          style: 'destructive',
          onPress: async () => {
            const url = `tel:${number}`;
            const supported = await Linking.canOpenURL(url);
            if (!supported) {
              Alert.alert(
                'Cannot place call',
                `Your device cannot start a phone call to ${number}.`,
              );
              return;
            }
            await Linking.openURL(url);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          <View className="mb-6">
            <Text variant="h1" weight="bold" className="mb-1">
              Welcome to LifeCare
            </Text>
            <Text variant="body" color="muted">
              Manage your health and access healthcare services
            </Text>
          </View>

          <View className="mb-6">
            <Text variant="h3" weight="semibold" className="mb-3">
              Quick Actions
            </Text>
            <View className="gap-3">
              {quickActions.map(action => (
                <TouchableOpacity
                  key={action.id}
                  onPress={() =>
                    action.id === 'emergency'
                      ? handleEmergencyPress()
                      : router.push(action.route as any)
                  }
                  className={`rounded-xl border p-4 ${
                    action.primary
                      ? 'bg-primaryAlt border-primaryAlt'
                      : action.danger
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-gray-200'
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`mr-4 h-12 w-12 items-center justify-center rounded-full ${
                        action.primary ? 'bg-white' : action.danger ? 'bg-red-100' : 'bg-primary-50'
                      }`}
                    >
                      <Ionicons
                        name={action.icon}
                        size={24}
                        color={action.primary ? '#002D62' : action.danger ? '#EF4444' : '#002D62'}
                      />
                    </View>
                    <Text
                      className={`flex-1 font-poppins-semibold text-base ${
                        action.primary ? 'text-white' : action.danger ? 'text-red-700' : 'text-gray-900'
                      }`}
                    >
                      {action.title}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={action.primary ? 'white' : action.danger ? '#EF4444' : '#687076'}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text variant="h3" weight="semibold" className="mb-3">
              Upcoming Consultations
            </Text>
            <View className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              {loading ? (
                <View className="items-center justify-center py-10">
                  <ActivityIndicator size="small" color="#002D62" />
                </View>
              ) : upcoming.length === 0 ? (
                <View className="items-center justify-center py-8">
                  <Ionicons name="calendar-outline" size={48} color="#687076" />
                  <Text className="mt-3 text-center font-poppins-medium text-sm text-gray-500">
                    No upcoming consultations
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/consultations/book' as any)}
                    className="mt-4 rounded-lg bg-primaryAlt px-4 py-2"
                  >
                    <Text className="font-poppins-semibold text-sm text-white">
                      Book a Consultation
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {upcoming.map(c => {
                    const style = getStatusStyle(c.status);
                    const date = new Date(c.scheduledAt || c.date);
                    return (
                      <TouchableOpacity
                        key={c.id}
                        onPress={() => router.push(`/consultations/${c.id}` as any)}
                        className="flex-row items-center border-b border-gray-100 px-4 py-3 last:border-b-0"
                        activeOpacity={0.7}
                      >
                        <View className={`mr-3 h-9 w-9 items-center justify-center rounded-lg ${style.bg}`}>
                          <Ionicons name={style.icon} size={18} color="#002D62" />
                        </View>
                        <View className="flex-1">
                          <Text className="font-poppins-semibold text-base text-gray-900">
                            {c.code || 'Consultation'}
                          </Text>
                          <Text className="mt-0.5 text-sm text-gray-500">
                            {c.doctor?.user?.name ? `Dr. ${c.doctor.user.name}` : '—'} · {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/consultations' as any)}
                    className="items-center py-3"
                  >
                    <Text className="font-poppins-medium text-sm text-primaryAlt">View all</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View>
            <Text variant="h3" weight="semibold" className="mb-3">
              Recent Activity
            </Text>
            <View className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              {loading ? (
                <View className="items-center justify-center py-8">
                  <ActivityIndicator size="small" color="#002D62" />
                </View>
              ) : recentActivity.length === 0 ? (
                <View className="items-center justify-center py-6">
                  <Ionicons name="document-text-outline" size={40} color="#687076" />
                  <Text className="mt-2 text-center font-poppins-medium text-sm text-gray-500">
                    No recent activity
                  </Text>
                </View>
              ) : (
                <View>
                  {recentActivity.map(c => {
                    const style = getStatusStyle(c.status);
                    const date = new Date(c.scheduledAt || c.date || c.createdAt);
                    return (
                      <TouchableOpacity
                        key={c.id}
                        onPress={() => router.push(`/consultations/${c.id}` as any)}
                        className="flex-row items-center border-b border-gray-100 px-4 py-3 last:border-b-0"
                        activeOpacity={0.7}
                      >
                        <View className={`mr-3 h-9 w-9 items-center justify-center rounded-lg ${style.bg}`}>
                          <Ionicons name={style.icon} size={18} color="#002D62" />
                        </View>
                        <View className="flex-1">
                          <Text className="font-poppins-medium text-base text-gray-900">
                            {c.code || 'Consultation'}
                          </Text>
                          <Text className="mt-0.5 text-sm text-gray-500">
                            {c.doctor?.user?.name ? `Dr. ${c.doctor.user.name}` : '—'} · {date.toLocaleDateString()} · {c.status}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/consultations' as any)}
                    className="items-center py-3"
                  >
                    <Text className="font-poppins-medium text-sm text-primaryAlt">View all</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
