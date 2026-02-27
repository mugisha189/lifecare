import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

export function Toast({ visible, message, type = 'info', duration = 4000, onHide }: ToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
          bgColor: 'bg-green-500',
          borderColor: 'border-green-600',
          iconColor: '#FFFFFF',
        };
      case 'error':
        return {
          icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
          bgColor: 'bg-red-500',
          borderColor: 'border-red-600',
          iconColor: '#FFFFFF',
        };
      case 'warning':
        return {
          icon: 'warning' as keyof typeof Ionicons.glyphMap,
          bgColor: 'bg-yellow-500',
          borderColor: 'border-yellow-600',
          iconColor: '#FFFFFF',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as keyof typeof Ionicons.glyphMap,
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-600',
          iconColor: '#FFFFFF',
        };
    }
  };

  if (!visible) return null;

  const config = getToastConfig();

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
      className="absolute bottom-6 left-6 right-6 z-50"
    >
      <View
        className={`flex-row items-center rounded-xl ${config.bgColor} px-3 py-2.5 shadow-md`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        {/* Icon */}
        <Ionicons
          name={config.icon}
          size={18}
          color={config.iconColor}
          style={{ marginRight: 8 }}
        />

        {/* Message */}
        <Text className="flex-1 font-poppins-medium text-[13px] text-white" numberOfLines={2}>
          {message}
        </Text>

        {/* Close Button */}
        <TouchableOpacity
          onPress={hideToast}
          className="ml-2"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={16} color={config.iconColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// Hook for easier toast usage
export function useToast() {
  const [toast, setToast] = React.useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
    showSuccess: (message: string) => showToast(message, 'success'),
    showError: (message: string) => showToast(message, 'error'),
    showWarning: (message: string) => showToast(message, 'warning'),
    showInfo: (message: string) => showToast(message, 'info'),
  };
}
