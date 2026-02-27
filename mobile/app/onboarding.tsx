import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSetAtom } from 'jotai';
import { completeOnboardingAtom } from '../store/onboardingAtoms';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  image: any;
  title: string;
  description: string;
  isLast?: boolean;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    image: require('../assets/images/onboarding_1.png'),
    title: 'Manage Your Health',
    description: 'Access your medical records, prescriptions, and consultations all in one place. Stay connected with your healthcare providers.',
  },
  {
    id: 2,
    image: require('../assets/images/onboarding_2.png'),
    title: 'Book Consultations',
    description: 'Schedule appointments with doctors, view available time slots, and manage your healthcare appointments easily.',
  },
  {
    id: 3,
    image: require('../assets/images/onboarding_3.png'),
    title: 'Get Started',
    description: 'Join LifeCare today and take control of your health journey. Access quality healthcare services at your fingertips.',
    isLast: true,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const completeOnboarding = useSetAtom(completeOnboardingAtom);
  const router = useRouter();


  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Mark onboarding as completed before navigating to login
      completeOnboarding();
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    // Mark onboarding as completed before navigating to login
    completeOnboarding();
    router.replace('/login');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.65 }}>
        <View
          className="relative overflow-hidden"
          style={{
            height: SCREEN_HEIGHT * 0.56,
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
          }}
        >
          <Image source={item.image} className="h-full w-full" resizeMode="cover" />
        </View>

        <View className="bg-primary px-6 pb-2 pt-10" style={{ height: SCREEN_HEIGHT * 0.12 }}>
          <View className="items-center justify-center">
            <Text className="mb-4 px-4 text-center font-poppins-bold text-[22px] leading-7 text-white">
              {item.title}
            </Text>
            <Text className="mb-8 px-6 text-center font-poppins-regular text-[14px] leading-5 text-white/90">
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const currentSlide = slides[currentIndex];

  return (
    <View className="flex-1 bg-primary">
      <StatusBar style="light" />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={item => item.id.toString()}
        bounces={false}
      />

      <View
        className="bg-primary px-6 pb-4"
        style={{
          position: 'absolute',
          top: SCREEN_HEIGHT * 0.68,
          left: 0,
          right: 0,
          paddingTop: 8,
        }}
      >
        <View className="items-center">
          <View className="mb-8 flex-row items-center justify-center">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`mx-1 h-[6px] rounded-full ${
                  index === currentIndex ? 'w-8 bg-white' : 'w-[6px] bg-white/30'
                }`}
              />
            ))}
          </View>

          <View className="w-full items-center" style={{ gap: 20 }}>
            <TouchableOpacity
              onPress={handleNext}
              className="w-full rounded-full bg-white py-3 shadow-sm"
              activeOpacity={0.85}
            >
              <Text className="text-center font-poppins-bold text-[17px] text-primary">
                {currentSlide?.isLast ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkip} className="py-2" activeOpacity={0.7}>
              <Text className="text-center font-poppins-medium text-[16px] text-white">
                Skip
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
