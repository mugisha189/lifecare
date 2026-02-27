import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Text, Toast, useToast, DatePicker } from '@/components/ui';
import { useAtom } from 'jotai';
import { userAtom } from '@/store/authAtoms';
import hospitalsService, { Hospital, HospitalDoctor } from '@/services/hospitals.service';
import consultationsService from '@/services/consultations.service';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

export default function BookConsultationScreen() {
  const router = useRouter();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [user] = useAtom(userAtom);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<HospitalDoctor[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<HospitalDoctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingHospitals(true);
      const res = await hospitalsService.getHospitals();
      if (!cancelled && res.ok && Array.isArray(res.data)) {
        setHospitals(res.data);
      } else if (!res.ok && res.message) {
        showError(res.message);
      }
      if (!cancelled) setLoadingHospitals(false);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedHospital?.id) {
      setDoctors([]);
      setSelectedDoctor(null);
      return;
    }
    setSelectedDoctor(null);
    let cancelled = false;
    setLoadingDoctors(true);
    hospitalsService.getHospitalDoctors(selectedHospital.id).then((res) => {
      if (!cancelled && res.ok && Array.isArray(res.data)) {
        setDoctors(res.data);
      } else if (!res.ok && res.message) {
        showError(res.message);
      }
      if (!cancelled) setLoadingDoctors(false);
    });
    return () => { cancelled = true; };
  }, [selectedHospital?.id]);

  const canSubmit =
    !!user?.userId &&
    !!selectedDoctor?.id &&
    !!selectedTime &&
    !isSubmitting;

  const handleBook = async () => {
    if (!canSubmit || !selectedDoctor) return;
    setIsSubmitting(true);
    try {
      const scheduledAt = `${selectedDate.toISOString().split('T')[0]}T${selectedTime}:00`;
      const result = await consultationsService.bookConsultation({
        patientId: String(user!.userId),
        doctorId: selectedDoctor.id,
        scheduledAt,
        duration: 30,
      });
      if (result.ok) {
        showSuccess('Consultation booked successfully');
        setTimeout(() => router.back(), 1500);
      } else {
        showError(result.message || 'Failed to book consultation');
      }
    } catch (e: any) {
      showError(e?.message || 'Failed to book consultation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Book Consultation',
          headerBackTitle: 'Back',
        }}
      />
      <StatusBar style="dark" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* 1. Hospital */}
          <View className="mb-6">
            <Text className="mb-3 font-poppins-semibold text-base text-gray-900">
              Select Hospital
            </Text>
            {loadingHospitals ? (
              <View className="rounded-xl border border-gray-200 bg-gray-50 p-4 items-center">
                <ActivityIndicator size="small" />
                <Text className="mt-2 font-poppins-regular text-sm text-gray-500">Loading hospitals...</Text>
              </View>
            ) : hospitals.length === 0 ? (
              <View className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <Text className="font-poppins-regular text-sm text-gray-500">No hospitals available</Text>
              </View>
            ) : (
              <View className="gap-2">
                {hospitals.map((h) => (
                  <TouchableOpacity
                    key={h.id}
                    onPress={() => setSelectedHospital(h)}
                    className={`rounded-xl border p-4 flex-row items-center justify-between ${
                      selectedHospital?.id === h.id ? 'border-primaryAlt bg-primaryAlt/10' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text
                      className={`font-poppins-medium text-base ${
                        selectedHospital?.id === h.id ? 'text-primaryAlt' : 'text-gray-900'
                      }`}
                    >
                      {h.name}
                    </Text>
                    {selectedHospital?.id === h.id && (
                      <Ionicons name="checkmark-circle" size={22} color="#0D9488" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 2. Doctor (only when hospital selected) */}
          {selectedHospital && (
            <View className="mb-6">
              <Text className="mb-3 font-poppins-semibold text-base text-gray-900">
                Select Doctor
              </Text>
              {loadingDoctors ? (
                <View className="rounded-xl border border-gray-200 bg-gray-50 p-4 items-center">
                  <ActivityIndicator size="small" />
                  <Text className="mt-2 font-poppins-regular text-sm text-gray-500">Loading doctors...</Text>
                </View>
              ) : doctors.length === 0 ? (
                <View className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <Text className="font-poppins-regular text-sm text-gray-500">No doctors at this hospital</Text>
                </View>
              ) : (
                <View className="gap-2">
                  {doctors.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      onPress={() => setSelectedDoctor(d)}
                      className={`rounded-xl border p-4 flex-row items-center justify-between ${
                        selectedDoctor?.id === d.id ? 'border-primaryAlt bg-primaryAlt/10' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <View>
                        <Text
                          className={`font-poppins-medium text-base ${
                            selectedDoctor?.id === d.id ? 'text-primaryAlt' : 'text-gray-900'
                          }`}
                        >
                          {d.user?.name ?? 'Doctor'}
                        </Text>
                        {d.specialization && (
                          <Text className="font-poppins-regular text-sm text-gray-500 mt-0.5">
                            {d.specialization}
                          </Text>
                        )}
                      </View>
                      {selectedDoctor?.id === d.id && (
                        <Ionicons name="checkmark-circle" size={22} color="#0D9488" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* 3. Date */}
          <View className="mb-6">
            <Text className="mb-3 font-poppins-semibold text-base text-gray-900">
              Select Date
            </Text>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              mode="date"
              minimumDate={new Date()}
            />
          </View>

          {/* 4. Time */}
          <View className="mb-6">
            <Text className="mb-3 font-poppins-semibold text-base text-gray-900">
              Select Time
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {TIME_SLOTS.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => setSelectedTime(time)}
                  className={`rounded-lg border px-4 py-2 ${
                    selectedTime === time
                      ? 'border-primaryAlt bg-primaryAlt'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text
                    className={`font-poppins-medium text-sm ${
                      selectedTime === time ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title={isSubmitting ? 'Booking...' : 'Book Consultation'}
            onPress={handleBook}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            disabled={!canSubmit}
          />
        </View>
      </ScrollView>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </SafeAreaView>
  );
}
