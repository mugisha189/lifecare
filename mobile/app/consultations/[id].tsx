import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import consultationsService from '@/services/consultations.service';
import prescriptionsService from '@/services/prescriptions.service';
import type { Consultation, LabTestSummary } from '@/services/consultations.service';
import { Prescription } from '@/services/prescriptions.service';

function getStatusConfig(status: string) {
  const u = (status || '').toUpperCase();
  if (u === 'COMPLETED') return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'checkmark-circle' as const };
  if (u === 'CANCELLED') return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'close-circle' as const };
  if (u === 'IN_PROGRESS') return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'play-circle' as const };
  return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'time' as const };
}

function LabTestFoldableCard({ labTest }: { labTest: LabTestSummary }) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = getStatusConfig(labTest.status);
  const hasResults = labTest.status === 'COMPLETED' && labTest.results && Object.keys(labTest.results).length > 0;
  const questions = labTest.labTestType?.questions ?? [];

  const getLabel = (key: string) => {
    const q = questions.find((qu) => qu.id === key);
    return q?.label ?? key;
  };

  return (
    <View className="mb-3 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        className="flex-row items-center justify-between p-3"
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        <View className="flex-row items-center flex-1">
          <Ionicons name="flask-outline" size={20} color="#6B7280" />
          <Text className="ml-2 font-poppins-semibold text-sm text-gray-900 flex-1" numberOfLines={1}>
            {labTest.testName}
          </Text>
        </View>
        <View className={`flex-row items-center rounded-lg border px-2 py-1 ${statusConfig.bg} ${statusConfig.border}`}>
          <Text className={`text-xs font-semibold ${statusConfig.text}`}>{labTest.status}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
          style={{ marginLeft: 8 }}
        />
      </Pressable>
      {expanded && (
        <View className="border-t border-gray-200 px-3 py-3 bg-white">
          {hasResults ? (
            <View className="gap-2">
              {Object.entries(labTest.results!).map(([key, value]) => (
                <View key={key} className="flex-row justify-between items-start">
                  <Text className="font-poppins-regular text-sm text-gray-600 flex-1">{getLabel(key)}</Text>
                  <Text className="font-poppins-medium text-sm text-gray-900 ml-2">{String(value)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="font-poppins-regular text-sm text-gray-500">No results yet.</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function ConsultationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      const [consultResult, prescResult] = await Promise.all([
        consultationsService.getConsultationById(id),
        prescriptionsService.getMyPrescriptions(),
      ]);
      if (consultResult.ok && consultResult.data) {
        setConsultation(consultResult.data);
      } else {
        setConsultation(null);
      }
      if (prescResult.ok && prescResult.data && Array.isArray(prescResult.data)) {
        const forThis = (prescResult.data as Prescription[]).filter(p => p.consultationId === id);
        setPrescriptions(forThis);
      } else {
        setPrescriptions([]);
      }
    } catch (_e) {
      setConsultation(null);
      setPrescriptions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (!id) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Stack.Screen options={{ title: 'Consultation', headerBackTitle: 'Back' }} />
        <View className="flex-1 items-center justify-center p-4">
          <Text className="font-poppins-regular text-gray-600">Invalid consultation</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !consultation) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Stack.Screen options={{ title: 'Consultation', headerBackTitle: 'Back' }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#002D62" />
        </View>
      </SafeAreaView>
    );
  }

  if (!consultation) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Stack.Screen options={{ title: 'Consultation', headerBackTitle: 'Back' }} />
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
          <Text className="mt-4 text-center font-poppins-medium text-gray-600">Consultation not found</Text>
          <Text className="mt-2 text-center text-sm text-gray-500">It may have been removed or you don't have access.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(consultation.scheduledAt || consultation.date);
  const statusConfig = getStatusConfig(consultation.status);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{
          title: consultation.code || 'Consultation',
          headerBackTitle: 'Back',
          headerTitleStyle: { fontFamily: 'Poppins-SemiBold', fontSize: 18 },
        }}
      />
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#002D62']} />}
      >
        <View className="px-4 pb-8 pt-2">
          {/* Status & Code */}
          <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-poppins-bold text-lg text-gray-900">
                {consultation.code || 'Consultation'}
              </Text>
              <View className={`flex-row items-center rounded-lg border px-2.5 py-1.5 ${statusConfig.bg} ${statusConfig.border}`}>
                <Ionicons name={statusConfig.icon} size={16} color="#002D62" />
                <Text className={`ml-1.5 text-sm font-semibold ${statusConfig.text}`}>
                  {consultation.status}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center text-gray-500">
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
              <Text className="ml-2 font-poppins-regular text-sm text-gray-600">
                {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center text-gray-500">
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text className="ml-2 font-poppins-regular text-sm text-gray-600">
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          {/* Doctor */}
          {consultation.doctor && (
            <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
              <Text className="mb-3 font-poppins-semibold text-base text-gray-800">Doctor</Text>
              <View className="flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                  <Ionicons name="person" size={24} color="#002D62" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-poppins-semibold text-base text-gray-900">
                    Dr. {consultation.doctor.user?.name ?? '—'}
                  </Text>
                  {consultation.doctor.specialization && (
                    <Text className="mt-0.5 font-poppins-regular text-sm text-gray-500">
                      {consultation.doctor.specialization}
                    </Text>
                  )}
                  {consultation.doctor.user?.phoneNumber && (
                    <Text className="mt-1 font-poppins-regular text-sm text-gray-600">
                      {consultation.doctor.user.phoneNumber}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Hospital (from doctor or top-level) */}
          {(consultation.hospital || consultation.doctor?.hospital) && (
            <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
              <Text className="mb-2 font-poppins-semibold text-base text-gray-800">Hospital</Text>
              <View className="flex-row items-start">
                <Ionicons name="business-outline" size={20} color="#6B7280" />
                <View className="ml-2 flex-1">
                  <Text className="font-poppins-medium text-base text-gray-900">
                    {(consultation.hospital || consultation.doctor?.hospital)?.name ?? '—'}
                  </Text>
                  {(consultation.hospital?.address ?? consultation.doctor?.hospital?.address) && (
                    <Text className="mt-1 font-poppins-regular text-sm text-gray-500">
                      {consultation.hospital?.address ?? consultation.doctor?.hospital?.address}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Notes - always shown for the user */}
          <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-2 font-poppins-semibold text-base text-gray-800">Notes</Text>
            <Text className="font-poppins-regular text-sm leading-5 text-gray-600">
              {consultation.reason || consultation.clinicalNotes || 'No notes recorded for this consultation.'}
            </Text>
          </View>

          {/* Lab test results – foldable */}
          {consultation.labTests && consultation.labTests.length > 0 && (
            <View className="mb-4 rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <Text className="mb-3 px-4 pt-4 font-poppins-semibold text-base text-gray-800">
                Lab test results ({consultation.labTests.length})
              </Text>
              <View className="px-4 pb-4">
                {consultation.labTests.map((lab) => (
                  <LabTestFoldableCard key={lab.id} labTest={lab} />
                ))}
              </View>
            </View>
          )}

          {/* Prescriptions - only when consultation is completed */}
          <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-3 font-poppins-semibold text-base text-gray-800">
              Prescriptions {consultation.status === 'COMPLETED' && prescriptions.length > 0 ? `(${prescriptions.length})` : ''}
            </Text>
            {consultation.status !== 'COMPLETED' ? (
              <View className="py-4 items-center">
                <Ionicons name="medical-outline" size={32} color="#9CA3AF" />
                <Text className="mt-2 text-center font-poppins-regular text-sm text-gray-500">
                  Prescriptions will be shown here once the consultation is completed.
                </Text>
              </View>
            ) : prescriptions.length === 0 ? (
              <View className="py-4 items-center">
                <Ionicons name="medical-outline" size={32} color="#9CA3AF" />
                <Text className="mt-2 font-poppins-regular text-sm text-gray-500">No prescriptions for this consultation</Text>
              </View>
            ) : (
              <View className="gap-3">
                {prescriptions.map(p => (
                  <View key={p.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className={`flex-row items-center rounded-lg border px-2 py-1 ${p.status === 'DISPENSED' ? 'bg-green-50 border-green-200' : p.status === 'CANCELLED' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                        <Text className={`text-xs font-semibold ${p.status === 'DISPENSED' ? 'text-green-700' : p.status === 'CANCELLED' ? 'text-red-700' : 'text-amber-700'}`}>
                          {p.status}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {p.medicines && p.medicines.length > 0 && (
                      <View className="mt-2">
                        {p.medicines.map((med, idx) => (
                          <Text key={idx} className="font-poppins-regular text-sm text-gray-700">
                            • {med.medicine?.name ?? 'Medicine'} – {med.dosage} {med.frequency}
                            {med.instructions ? ` (${med.instructions})` : ''}
                          </Text>
                        ))}
                      </View>
                    )}
                    {p.notes ? (
                      <Text className="mt-2 font-poppins-regular text-sm text-gray-500">{p.notes}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Meta */}
          <View className="rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-2 font-poppins-semibold text-base text-gray-800">Details</Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="font-poppins-regular text-sm text-gray-500">Created</Text>
                <Text className="font-poppins-medium text-sm text-gray-700">
                  {new Date(consultation.createdAt).toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="font-poppins-regular text-sm text-gray-500">Last updated</Text>
                <Text className="font-poppins-medium text-sm text-gray-700">
                  {new Date(consultation.updatedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
