import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import consultationsService from '@/services/consultations.service';
import { Consultation } from '@/services/consultations.service';

export default function ConsultationsScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    loadConsultations();
  }, [selectedStatus]);

  const loadConsultations = async () => {
    try {
      setIsLoading(true);
      // Mobile app is patient-only, always get patient consultations
      const result = await consultationsService.getMyConsultations({
        status: selectedStatus ? (selectedStatus as 'SCHEDULED' | 'PENDING' | 'COMPLETED' | 'CANCELLED') : undefined,
      });

      if (result.ok && result.data) {
        setConsultations(result.data);
      } else {
        Alert.alert('Error', result.message || 'Failed to load consultations');
      }
    } catch (error: any) {
      console.error('Error loading consultations:', error);
      Alert.alert('Error', 'Failed to load consultations. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadConsultations();
  };

  const getStatusConfig = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED':
      case 'CONFIRMED':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'checkmark-circle',
          iconColor: '#10B981',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'close-circle',
          iconColor: '#EF4444',
        };
      case 'PENDING':
      case 'SCHEDULED':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'time',
          iconColor: '#F59E0B',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'help-circle',
          iconColor: '#687076',
        };
    }
  };

  const renderEmptyState = () => (
    <View className="items-center justify-center px-6 py-12">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary-50">
        <Ionicons name="calendar-outline" size={28} color="#002D62" />
      </View>
      <Text className="mb-1.5 text-center text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins-SemiBold' }}>
        No Consultations Yet
      </Text>
      <Text className="text-center text-sm text-gray-500" style={{ fontFamily: 'Poppins-Regular' }}>
        Your consultation history will appear here once you book appointments
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/consultations/book' as any)}
        className="mt-4 rounded-lg bg-primaryAlt px-4 py-2"
      >
        <Text className="font-poppins-semibold text-sm text-white">
          Book a Consultation
        </Text>
      </TouchableOpacity>
    </View>
  );

  const statusFilters = [
    { label: 'All', value: '', icon: 'list' },
    { label: 'Scheduled', value: 'SCHEDULED', icon: 'calendar' },
    { label: 'Pending', value: 'PENDING', icon: 'time' },
    { label: 'Completed', value: 'COMPLETED', icon: 'checkmark-circle' },
    { label: 'Cancelled', value: 'CANCELLED', icon: 'close-circle' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#002D62']} />}
      >
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-5 pt-4 pb-3">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins-Bold' }}>
              Consultations
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/consultations/book' as any)}
              className="h-10 w-10 items-center justify-center rounded-full bg-primaryAlt"
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Status Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {statusFilters.map(filter => {
              const isSelected = selectedStatus === filter.value;
              return (
                <TouchableOpacity
                  key={filter.value}
                  onPress={() => setSelectedStatus(filter.value)}
                  className={`flex-row items-center rounded-lg border px-3 py-1.5 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={filter.icon as any}
                    size={14}
                    color={isSelected ? '#002D62' : '#687076'}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-medium ${
                      isSelected ? 'text-primary-950' : 'text-gray-700'
                    }`}
                    style={{ fontFamily: 'Poppins-Medium' }}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Content */}
        <View className="pt-4">
          {isLoading ? (
            <View className="items-center justify-center py-12">
              <Text className="font-poppins-regular text-sm text-gray-500" style={{ fontFamily: 'Poppins-Regular' }}>
                Loading...
              </Text>
            </View>
          ) : consultations.length === 0 ? (
            renderEmptyState()
          ) : (
            <View className="pb-6">
              {consultations.map(consultation => (
                <TouchableOpacity
                  key={consultation.id}
                  className="mx-4 mb-3 rounded-2xl border border-gray-200 bg-white p-4"
                  activeOpacity={0.7}
                  onPress={() => router.push(`/consultations/${consultation.id}` as any)}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className={`flex-row items-center rounded-lg border px-2.5 py-1 ${getStatusConfig(consultation.status).bg} ${getStatusConfig(consultation.status).border}`}>
                      <Ionicons name={getStatusConfig(consultation.status).icon as any} size={12} color={getStatusConfig(consultation.status).iconColor} />
                      <Text className={`ml-1.5 text-xs font-semibold ${getStatusConfig(consultation.status).text}`} style={{ fontFamily: 'Poppins-SemiBold' }}>
                        {consultation.status}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500" style={{ fontFamily: 'Poppins-Regular' }}>
                      {new Date(consultation.scheduledAt || consultation.date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {consultation.doctor && (
                    <Text className="mb-1 font-poppins-semibold text-base text-gray-900" style={{ fontFamily: 'Poppins-SemiBold' }}>
                      Dr. {consultation.doctor.user?.name ?? '—'}
                      {consultation.doctor.specialization && ` - ${consultation.doctor.specialization}`}
                    </Text>
                  )}
                  
                  {(consultation.reason || consultation.clinicalNotes) && (
                    <Text className="mb-2 text-sm text-gray-600" style={{ fontFamily: 'Poppins-Regular' }}>
                      {consultation.reason || consultation.clinicalNotes}
                    </Text>
                  )}
                  
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="time-outline" size={14} color="#687076" />
                    <Text className="ml-1.5 text-xs text-gray-500" style={{ fontFamily: 'Poppins-Regular' }}>
                      {new Date(consultation.scheduledAt || consultation.date).toLocaleString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
