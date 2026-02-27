import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import prescriptionsService from '@/services/prescriptions.service';
import { Prescription } from '@/services/prescriptions.service';
import notificationsService, { ReminderFrequency } from '@/services/notifications.service';

type PrescriptionGroup = {
  consultationId: string;
  consultationCode?: string;
  consultationDate?: string;
  doctorName?: string;
  prescriptions: Prescription[];
};

export default function PrescriptionsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reminderFor, setReminderFor] = useState<{
    prescription: Prescription;
    consultationCode?: string;
  } | null>(null);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setIsLoading(true);
      const result = await prescriptionsService.getMyPrescriptions();

      if (result.ok && result.data != null) {
        const list = Array.isArray(result.data) ? result.data : [];
        setPrescriptions(list);
      } else {
        setPrescriptions([]);
        if (result.message) {
          Alert.alert('Error', result.message);
        }
      }
    } catch (error: any) {
      console.error('Error loading prescriptions:', error);
      setPrescriptions([]);
      Alert.alert('Error', 'Failed to load prescriptions. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadPrescriptions();
  };

  const groupedByConsultation = useMemo((): PrescriptionGroup[] => {
    const map = new Map<string, PrescriptionGroup>();
    for (const p of prescriptions) {
      const cid = p.consultationId || p.consultation?.id || 'unknown';
      if (!map.has(cid)) {
        map.set(cid, {
          consultationId: cid,
          consultationCode: p.consultation?.code,
          consultationDate: p.consultation?.date ?? p.consultation?.scheduledAt,
          doctorName: p.doctor?.user?.name,
          prescriptions: [],
        });
      }
      map.get(cid)!.prescriptions.push(p);
    }
    return Array.from(map.values()).sort((a, b) => {
      const dateA = a.consultationDate ? new Date(a.consultationDate).getTime() : 0;
      const dateB = b.consultationDate ? new Date(b.consultationDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [prescriptions]);

  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DISPENSED':
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
      default:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'time',
          iconColor: '#F59E0B',
        };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#002D62']}
          />
        }
      >
        <View className="border-b border-gray-200 bg-white px-5 pt-4 pb-3">
          <Text className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins-Bold' }}>
            Prescriptions
          </Text>
          <Text className="mt-1 text-sm text-gray-500" style={{ fontFamily: 'Poppins-Regular' }}>
            Medicines prescribed for your completed consultations
          </Text>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-12">
            <Text className="font-poppins-regular text-sm text-gray-500">Loading...</Text>
          </View>
        ) : groupedByConsultation.length === 0 ? (
          <View className="items-center justify-center px-5 py-12">
            <Ionicons name="medical" size={48} color="#002D62" />
            <Text className="mt-4 font-poppins-bold text-2xl text-gray-800">
              No prescriptions yet
            </Text>
            <Text className="mt-1 font-poppins-regular text-sm text-gray-500 text-center">
              Prescriptions from your completed consultations will appear here.
            </Text>
          </View>
        ) : (
          <View className="px-5 pb-6 pt-4">
            {groupedByConsultation.map(group => (
              <View key={group.consultationId} className="mb-6">
                <View className="mb-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-poppins-semibold text-base text-gray-900">
                      {group.consultationCode || 'Consultation'}
                    </Text>
                    {group.consultationDate && (
                      <Text className="text-xs text-gray-500">
                        {new Date(group.consultationDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  {group.doctorName && (
                    <Text className="mt-1 text-sm text-gray-600">
                      Dr. {group.doctorName}
                    </Text>
                  )}
                </View>

            {group.prescriptions.map((prescription) => (
                  <View
                    key={prescription.id}
                    className="mb-3 ml-2 rounded-2xl border border-gray-200 bg-white p-4"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className={`flex-row items-center rounded-lg border px-2.5 py-1 ${getStatusConfig(prescription.status).bg} ${getStatusConfig(prescription.status).border}`}>
                        <Ionicons name={getStatusConfig(prescription.status).icon as any} size={12} color={getStatusConfig(prescription.status).iconColor} />
                        <Text className={`ml-1.5 text-xs font-semibold ${getStatusConfig(prescription.status).text}`}>
                          {prescription.status}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500">
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

                    {prescription.medicines && prescription.medicines.length > 0 && (
                      <View className="mt-2">
                        <Text className="mb-1 text-xs font-poppins-semibold text-gray-700">
                          Medicines ({prescription.medicines.length})
                        </Text>
                        {prescription.medicines.map((med, index) => (
                          <Text key={index} className="text-xs text-gray-600">
                            • {med.medicine?.name || 'Unknown'} – {med.dosage} {med.frequency}
                          </Text>
                        ))}
                      </View>
                    )}

                    {prescription.notes ? (
                      <Text className="mt-2 text-sm text-gray-600">
                        {prescription.notes}
                      </Text>
                    ) : null}

                    {prescription.status === 'DISPENSED' && (
                      <TouchableOpacity
                        className="mt-3 self-start rounded-full bg-primary-50 px-3 py-1.5"
                        onPress={() =>
                          setReminderFor({
                            prescription,
                            consultationCode: group.consultationCode,
                          })
                        }
                      >
                        <View className="flex-row items-center">
                          <Ionicons name="alarm-outline" size={14} color="#002D62" />
                          <Text className="ml-1 text-xs font-poppins-medium text-primary-900">
                            Add reminder
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <ReminderModal context={reminderFor} onClose={() => setReminderFor(null)} />
    </SafeAreaView>
  );
}

function ReminderModal({
  context,
  onClose,
}: {
  context: { prescription: Prescription; consultationCode?: string } | null;
  onClose: () => void;
}) {
  const [frequency, setFrequency] = useState<ReminderFrequency>('DAILY');
  const [time, setTime] = useState('08:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (context) {
      setFrequency('DAILY');
      setTime('08:00');
      setSaving(false);
    }
  }, [context]);

  if (!context) return null;

  const { prescription, consultationCode } = context;

  const handleSave = async () => {
    const trimmed = time.trim();
    const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed);
    if (!valid) {
      Alert.alert('Invalid time', 'Please enter a time in 24h format, e.g. 08:00 or 21:30.');
      return;
    }

    try {
      setSaving(true);
      const summaryParts: string[] = [];
      if (prescription.medicines && prescription.medicines.length > 0) {
        summaryParts.push(
          prescription.medicines
            .map(m => m.medicine?.name)
            .filter(Boolean)
            .join(', '),
        );
      }
      const summary =
        summaryParts.join(', ') || `Prescription ${prescription.id.slice(0, 8)}`;

      const [hours, minutes] = trimmed.split(':').map(part => parseInt(part, 10));

      await notificationsService.scheduleMedicationReminder({
        title: 'Medication reminder',
        body: summary,
        frequency,
        hour: Number.isFinite(hours) ? hours : 8,
        minute: Number.isFinite(minutes) ? minutes : 0,
      });

      Alert.alert(
        'Reminder scheduled',
        'Your phone will now remind you at the selected time.',
      );
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Failed to save reminder. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const freqButton = (value: ReminderFrequency, label: string) => (
    <TouchableOpacity
      key={value}
      onPress={() => setFrequency(value)}
      className={`mr-2 mb-2 rounded-full border px-3 py-1.5 ${
        frequency === value ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'
      }`}
    >
      <Text
        className={`text-xs font-poppins-medium ${
          frequency === value ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={!!context}
      onRequestClose={() => {
        if (!saving) onClose();
      }}
    >
      <View className="flex-1 justify-end bg-black/30">
        <View className="rounded-t-3xl bg-white px-5 pb-6 pt-4">
          <View className="mb-3 h-1 w-12 self-center rounded-full bg-gray-300" />
          <Text className="mb-1 text-center font-poppins-semibold text-base text-gray-900">
            Add medication reminder
          </Text>
          {consultationCode && (
            <Text className="mb-3 text-center text-xs text-gray-500">
              {consultationCode}
            </Text>
          )}

          <Text className="mt-1 font-poppins-medium text-xs text-gray-700">
            Frequency
          </Text>
          <View className="mt-2 flex-row flex-wrap">
            {freqButton('DAILY', 'Daily')}
            {freqButton('WEEKLY', 'Weekly')}
            {freqButton('MONTHLY', 'Monthly')}
          </View>

          <Text className="mt-4 font-poppins-medium text-xs text-gray-700">
            Time (24h)
          </Text>
          <View className="mt-2 flex-row items-center rounded-xl border border-gray-300 px-3 py-2">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="08:00"
              keyboardType="numeric"
              maxLength={5}
              className="ml-2 flex-1 font-poppins-regular text-sm text-gray-900"
            />
          </View>

          <View className="mt-5 flex-row justify-end space-x-3">
            <TouchableOpacity
              disabled={saving}
              onPress={onClose}
              className="rounded-full border border-gray-300 px-4 py-2"
            >
              <Text className="text-sm font-poppins-medium text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={saving}
              onPress={handleSave}
              className="rounded-full bg-primary-600 px-4 py-2"
            >
              <Text className="text-sm font-poppins-medium text-white">
                {saving ? 'Saving...' : 'Save reminder'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

