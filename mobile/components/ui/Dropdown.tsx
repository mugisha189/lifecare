import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type DropdownOption = string | { label: string; value: string };

export interface DropdownProps {
  label?: string;
  value: string;
  options: DropdownOption[];
  onSelect?: (value: string) => void;
  onValueChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

function normalizeOptions(options: DropdownOption[]): { label: string; value: string }[] {
  return options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt,
  );
}

export function Dropdown({
  label,
  value,
  options,
  onSelect,
  onValueChange,
  error,
  placeholder = 'Select an option',
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);

  const displayLabel = useMemo(() => {
    const selected = normalizedOptions.find(opt => opt.value === value);
    return selected ? selected.label : '';
  }, [normalizedOptions, value]);

  const handleSelect = (selectedValue: string) => {
    (onValueChange ?? onSelect)?.(selectedValue);
    setIsOpen(false);
  };

  return (
    <View className="mb-4">
      {/* Label */}
      {label && <Text className="mb-2 font-poppins-medium text-[13px] text-gray-700">{label}</Text>}

      {/* Dropdown Button */}
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        className={`flex-row items-center justify-between rounded-xl border px-4 py-4 ${
          error
            ? 'border-red-400 bg-red-50'
            : disabled
              ? 'border-gray-200 bg-gray-100'
              : 'border-gray-300 bg-white'
        }`}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text
          className={`font-poppins-regular text-[15px] ${
            displayLabel ? 'text-gray-900' : 'text-gray-400'
          }`}
          numberOfLines={1}
        >
          {displayLabel || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={error ? '#F87171' : '#9CA3AF'} />
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <View className="mt-1 flex-row items-center">
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text className="ml-1 font-poppins-regular text-[12px] text-red-500">{error}</Text>
        </View>
      )}

      {/* Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <TouchableOpacity activeOpacity={1} onPress={() => setIsOpen(false)} className="flex-1" />
          <View className="max-h-96 overflow-hidden rounded-t-3xl bg-white p-6">
            {/* Header */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-poppins-semibold text-[16px] text-gray-900">
                {label || 'Select'}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <FlatList
              data={normalizedOptions}
              keyExtractor={(item) => item.value + item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  className="border-b border-gray-100 py-4"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`font-poppins-medium text-[15px] ${
                        item.value === value ? 'text-primary' : 'text-gray-700'
                      }`}
                      numberOfLines={2}
                    >
                      {item.label}
                    </Text>
                    {item.value === value && <Ionicons name="checkmark" size={20} color="#16A34A" />}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default Dropdown;
