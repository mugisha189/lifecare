import React, { useState } from 'react';
import { View, TouchableOpacity, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Input } from './Input';

// Temporarily using Input until @react-native-community/datetimepicker is installed
// TODO: Install package: npm install @react-native-community/datetimepicker
// Then uncomment the DateTimePicker imports and implementation below

// import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  minimumDate,
  maximumDate,
  mode = 'date',
  placeholder = 'Select date',
}: DatePickerProps) {
  const [dateString, setDateString] = useState(value.toISOString().split('T')[0]);

  const handleDateChange = (text: string) => {
    setDateString(text);

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(text)) {
      const newDate = new Date(text);
      if (!isNaN(newDate.getTime())) {
        onChange(newDate);
      }
    }
  };

  // Temporary fallback: Use Input field until DateTimePicker package is installed
  return (
    <View className="mb-4">
      <Input
        label={label}
        value={dateString}
        onChangeText={handleDateChange}
        placeholder={placeholder || 'YYYY-MM-DD'}
        error={error}
        variant="outlined"
        leftIcon="calendar-outline"
      />
      <Text variant="caption" className="mt-1 text-gray-500">
        Format: YYYY-MM-DD (e.g., 2026-12-31)
      </Text>
    </View>
  );
}

/* 
// Full DatePicker implementation (uncomment after installing package)

export function DatePicker({
  label,
  value,
  onChange,
  error,
  minimumDate,
  maximumDate,
  mode = 'date',
  placeholder = 'Select date',
}: DatePickerProps) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleIOSConfirm = () => {
    onChange(tempDate);
    setShow(false);
  };

  const handleIOSCancel = () => {
    setTempDate(value);
    setShow(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  return (
    <View className="mb-4">
      {label && (
        <Text variant="caption" weight="medium" className="mb-2 text-gray-700">
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setShow(true)}
        className={`flex-row items-center justify-between rounded-lg border px-4 py-3 ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
        }`}
        activeOpacity={0.7}
      >
        <Text
          variant="body"
          className={value ? 'text-gray-900' : 'text-gray-400'}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {error && (
        <Text variant="caption" className="mt-1 text-red-500">
          {error}
        </Text>
      )}

      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {Platform.OS === 'ios' && show && (
        <Modal visible={show} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white">
              <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
                <TouchableOpacity onPress={handleIOSCancel}>
                  <Text variant="body" weight="medium" className="text-blue-600">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text variant="body" weight="semibold" className="text-gray-900">
                  Select Date
                </Text>
                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text variant="body" weight="semibold" className="text-blue-600">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
*/
