import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Input, Button, Text, Toast, useToast, DatePicker } from '@/components/ui';
import { ProfileService, DoctorProfileData } from '@/services/profile.service';
import { CloudinaryService } from '@/services/cloudinary.service';

interface DocumentData {
  uri: string;
  name: string;
  type: 'MEDICAL_LICENSE' | 'NATIONAL_ID' | 'MEDICAL_CERTIFICATE' | 'OTHER';
}

export default function DoctorOnboardingScreen() {
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form data
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState(new Date());
  const [specialization, setSpecialization] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [bio, setBio] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!licenseNumber.trim()) {
      newErrors.licenseNumber = 'Medical license number is required';
    }

    if (!specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
    }

    if (!emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    if (documents.length < 2) {
      showError('Please upload at least 2 documents (medical license + one more)');
      return false;
    }

    const hasLicense = documents.some(doc => doc.type === 'MEDICAL_LICENSE');
    if (!hasLicense) {
      showError('Medical license document is required');
      return false;
    }

    return true;
  };

  const handlePickDocument = async () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Choose from Gallery', 'Browse Files'],
          cancelButtonIndex: 0,
        },
        async buttonIndex => {
          if (buttonIndex === 1) {
            await pickImage();
          } else if (buttonIndex === 2) {
            await pickFile();
          }
        }
      );
    } else {
      Alert.alert(
        'Upload Document',
        '',
        [
          { text: 'Choose from Gallery', onPress: pickImage },
          { text: 'Browse Files', onPress: pickFile },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await selectDocumentType(asset.uri, asset.uri.split('/').pop() || 'image.jpg');
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await selectDocumentType(asset.uri, asset.name);
    }
  };

  const selectDocumentType = (uri: string, name: string) => {
    const types = [
      { label: 'Medical License', value: 'MEDICAL_LICENSE' },
      { label: 'National ID', value: 'NATIONAL_ID' },
      { label: 'Medical Certificate', value: 'MEDICAL_CERTIFICATE' },
      { label: 'Other', value: 'OTHER' },
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Select Document Type',
          options: ['Cancel', ...types.map(t => t.label)],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex > 0) {
            const type = types[buttonIndex - 1].value as DocumentData['type'];
            setDocuments(prev => [...prev, { uri, name, type }]);
          }
        }
      );
    } else {
      Alert.alert(
        'Select Document Type',
        '',
        [
          ...types.map(t => ({
            text: t.label,
            onPress: () => {
              const type = t.value as DocumentData['type'];
              setDocuments(prev => [...prev, { uri, name, type }]);
            },
          })),
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      return;
    }

    setIsLoading(true);
    try {
      // Upload documents to Cloudinary
      const uploadedDocuments = await Promise.all(
        documents.map(async doc => {
          const uploadResult = await CloudinaryService.uploadImage(doc.uri, 'doctor-documents');
          return {
            documentType: doc.type,
            documentURL: uploadResult.url,
          };
        })
      );

      const profileData: DoctorProfileData = {
        licenseNumber,
        licenseExpiryDate: licenseExpiryDate.toISOString(),
        specialization,
        qualifications: qualifications.split(',').map(q => q.trim()).filter(Boolean),
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
        bio,
        emergencyContactName,
        emergencyContactPhone,
        hospitalId: hospitalId || undefined,
        documents: uploadedDocuments,
      };

      // Call doctor profile creation endpoint
      const result = await ProfileService.createDoctorProfile(profileData);

      if (result.ok) {
        showSuccess('Doctor profile created successfully!');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
      } else {
        showError(result.message || 'Failed to create doctor profile');
      }
    } catch (error: any) {
      console.error('Error creating doctor profile:', error);
      showError(error.message || 'Failed to create doctor profile');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text className="mb-1 font-poppins-semibold text-base text-gray-900">Medical License Number</Text>
      <Input
        value={licenseNumber}
        onChangeText={text => {
          setLicenseNumber(text);
          if (errors.licenseNumber) setErrors({ ...errors, licenseNumber: '' });
        }}
        placeholder="Enter your medical license number"
        error={errors.licenseNumber}
        variant="outlined"
      />

      <Text className="mb-1 mt-4 font-poppins-semibold text-base text-gray-900">License Expiry Date</Text>
      <DatePicker
        value={licenseExpiryDate}
        onChange={setLicenseExpiryDate}
        mode="date"
        minimumDate={new Date()}
      />

      <Text className="mb-1 mt-4 font-poppins-semibold text-base text-gray-900">Specialization</Text>
      <Input
        value={specialization}
        onChangeText={text => {
          setSpecialization(text);
          if (errors.specialization) setErrors({ ...errors, specialization: '' });
        }}
        placeholder="e.g., Cardiology, Pediatrics"
        error={errors.specialization}
        variant="outlined"
      />

      <Text className="mb-1 mt-4 font-poppins-semibold text-base text-gray-900">Qualifications</Text>
      <Input
        value={qualifications}
        onChangeText={setQualifications}
        placeholder="Comma-separated qualifications"
        variant="outlined"
        multiline
        numberOfLines={3}
      />

      <Text className="mb-1 mt-4 font-poppins-semibold text-base text-gray-900">Years of Experience</Text>
      <Input
        value={yearsOfExperience}
        onChangeText={setYearsOfExperience}
        placeholder="Years of medical experience"
        keyboardType="numeric"
        variant="outlined"
      />

      <Text className="mb-1 mt-4 font-poppins-semibold text-base text-gray-900">Bio</Text>
      <Input
        value={bio}
        onChangeText={setBio}
        placeholder="Tell us about yourself"
        variant="outlined"
        multiline
        numberOfLines={4}
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text className="mb-1 font-poppins-semibold text-base text-gray-900">Emergency Contact Name</Text>
      <Input
        value={emergencyContactName}
        onChangeText={text => {
          setEmergencyContactName(text);
          if (errors.emergencyContactName) setErrors({ ...errors, emergencyContactName: '' });
        }}
        placeholder="Full name"
        error={errors.emergencyContactName}
        variant="outlined"
      />

      <Text className="mb-1 mt-4 font-poppins-semibold text-base text-gray-900">Emergency Contact Phone</Text>
      <Input
        value={emergencyContactPhone}
        onChangeText={text => {
          setEmergencyContactPhone(text);
          if (errors.emergencyContactPhone) setErrors({ ...errors, emergencyContactPhone: '' });
        }}
        placeholder="07XXXXXXXX"
        keyboardType="phone-pad"
        error={errors.emergencyContactPhone}
        variant="outlined"
      />

      <Text className="mb-1 mt-4 font-poppins-semibold text-base text-gray-900">Hospital ID (Optional)</Text>
      <Input
        value={hospitalId}
        onChangeText={setHospitalId}
        placeholder="Associated hospital ID"
        variant="outlined"
      />
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text className="mb-4 font-poppins-semibold text-base text-gray-900">
        Upload Documents
      </Text>
      <Text className="mb-4 text-sm text-gray-600">
        Please upload your medical license and other relevant documents. At least 2 documents are required.
      </Text>

      <TouchableOpacity
        onPress={handlePickDocument}
        className="mb-4 flex-row items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-6"
      >
        <Ionicons name="cloud-upload-outline" size={24} color="#687076" />
        <Text className="ml-2 font-poppins-medium text-base text-gray-700">Upload Document</Text>
      </TouchableOpacity>

      {documents.length > 0 && (
        <View className="mt-4">
          {documents.map((doc, index) => (
            <View
              key={index}
              className="mb-2 flex-row items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
            >
              <View className="flex-1">
                <Text className="font-poppins-medium text-sm text-gray-900">{doc.name}</Text>
                <Text className="text-xs text-gray-500">{doc.type.replace('_', ' ')}</Text>
              </View>
              <TouchableOpacity onPress={() => removeDocument(index)}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="border-b border-gray-200 bg-white px-5 pt-4 pb-3">
            <Text className="mb-2 font-poppins-bold text-2xl text-gray-900">Doctor Profile Setup</Text>
            <Text className="text-sm text-gray-600">
              Step {currentStep} of 3
            </Text>
            <View className="mt-3 h-1.5 w-full rounded-full bg-gray-200">
              <View
                className="h-full rounded-full bg-primaryAlt"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </View>
          </View>

          {/* Content */}
          <View className="px-5 py-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="border-t border-gray-200 bg-white px-5 py-4">
          <View className="flex-row gap-3">
            {currentStep > 1 && (
              <Button
                title="Back"
                onPress={() => setCurrentStep(currentStep - 1)}
                variant="outline"
                className="flex-1"
              />
            )}
            {currentStep < 3 ? (
              <Button
                title="Next"
                onPress={handleNext}
                variant="primary"
                className="flex-1"
              />
            ) : (
              <Button
                title={isLoading ? 'Submitting...' : 'Submit'}
                onPress={handleSubmit}
                variant="primary"
                className="flex-1"
                loading={isLoading}
                disabled={isLoading}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </SafeAreaView>
  );
}
