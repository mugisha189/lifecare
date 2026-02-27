import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAtom } from 'jotai';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, LogBox, Text, View } from 'react-native';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../global.css';
import { AuthService } from '../services/auth.service';
import { setSessionExpiredCallback } from '../services/api';
import { userAtom } from '../store/authAtoms';
import { onboardingCompletedAtom } from '../store/onboardingAtoms';
import { LanguageProvider } from '../contexts/LanguageContext';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered']);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const router = useRouter();
  const [user, setUser] = useAtom(userAtom);
  const [onboardingCompleted] = useAtom(onboardingCompletedAtom);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const hasNavigated = useRef(false);

  // Re-enable custom fonts
  const [loaded, error] = useFonts({
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-Bold.ttf'), // Map SemiBold to Bold as fallback
    'Inter': require('../assets/fonts/Inter-Variable.ttf'),
  });

  // Log font loading errors
  useEffect(() => {
    if (error) {
      console.error('[Fonts] Error loading fonts:', error);
    }
  }, [error]);

  // When token refresh fails, clear user and redirect to login
  useEffect(() => {
    setSessionExpiredCallback(() => {
      setUser(null);
      router.replace('/login');
    });
    return () => setSessionExpiredCallback(() => {});
  }, [setUser, router]);

  // // Log font loading errors
  // useEffect(() => {
  //   if (error) {
  //     console.error('[Fonts] Error loading fonts:', error);
  //   }
  // }, [error]);

  // Auto-login: Check for stored token and validate with backend
  // Only run once on initial mount
  useEffect(() => {
    // Skip if already initialized (hot reload case)
    if (hasInitialized) {
      console.log('[Auth] Already initialized, skipping auth check (hot reload)');
      setIsCheckingAuth(false);
      return;
    }

    let isMounted = true;

    const runAuthCheck = async () => {
      if (isMounted) {
        await checkAuthentication();
        setHasInitialized(true);
      }
    };

    runAuthCheck();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run on mount

  const checkAuthentication = async () => {
    try {
      console.log('[Auth] Starting authentication check...');

      // Initialize auth token from storage
      await AuthService.initializeAuth();

      // Get stored token and user
      const token = await AuthService.getAuthToken();
      let storedUserStr = await AsyncStorage.getItem('@lifecare_user');

      // Migration: Check old storage location and move to new one
      if (!storedUserStr) {
        const oldUserStr = await AsyncStorage.getItem('user');
        if (oldUserStr) {
          console.log('[Auth] Migrating user from old storage location');
          await AsyncStorage.setItem('@lifecare_user', oldUserStr);
          await AsyncStorage.removeItem('user');
          storedUserStr = oldUserStr;
        }
      }

      console.log('[Auth] Token found in storage:', !!token);
      console.log('[Auth] User found in storage:', !!storedUserStr);

      if (token && storedUserStr) {
        // We have both token and user - restore the session immediately
        try {
          const storedUser = JSON.parse(storedUserStr);

          console.log(
            '[Auth] Restored user from storage:',
            storedUser?.name || storedUser?.email || 'Unknown'
          );

          setUser(storedUser);

          // Then validate token with backend in the background
          const result = await AuthService.getCurrentUser();

          if (result.ok && result.data) {
            // Update user with fresh data from backend
            console.log('[Auth] Token validated, updating user data');
            setUser(result.data as any);
          } else {
            // Token is invalid, clear everything
            console.log('[Auth] Token invalid, clearing auth');
            await AuthService.logout();
            setUser(null);
          }
        } catch (parseError) {
          // Invalid stored user, clear and start fresh
          console.error('[Auth] Error parsing stored user:', parseError);
          await AuthService.logout();
          setUser(null);
        }
      } else if (token) {
        // We have token but no user - fetch from backend
        console.log('[Auth] Token found but no user, fetching from backend...');
        const result = await AuthService.getCurrentUser();

        if (result.ok && result.data) {
          setUser(result.data as any);
        } else {
          await AuthService.logout();
          setUser(null);
        }
      } else {
        console.log('[Auth] No token found');
      }
    } catch (error) {
      console.error('[Auth] Auth check error:', error);
      // On error, clear everything
      await AuthService.logout();
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
      console.log('[Auth] Authentication check complete');
    }
  };

  // Handle initial navigation based on auth state - ONLY RUN ONCE
  useEffect(() => {
    // Don't navigate during auth check, if not initialized, or if already navigated
    if (!loaded || isCheckingAuth || !hasInitialized || hasNavigated.current) return;

    const determineInitialRoute = async () => {
      console.log('[Navigation] Initial auth check:', {
        user: !!user,
        onboardingCompleted,
        hasInitialized,
      });

      // If user is authenticated, go directly to home
      if (user) {
        console.log('[Navigation] User authenticated, redirecting to home');
        hasNavigated.current = true;
        router.replace('/(tabs)');
        return;
      }

      // User is not authenticated - check onboarding status
      if (!onboardingCompleted) {
        console.log('[Navigation] Onboarding not completed, redirecting to onboarding');
        hasNavigated.current = true;
        router.replace('/onboarding');
      } else {
        console.log('[Navigation] Onboarding completed, redirecting to login');
        hasNavigated.current = true;
        router.replace('/login');
      }
    };

    determineInitialRoute();
  }, [loaded, isCheckingAuth, hasInitialized, user, router, onboardingCompleted]);

  useEffect(() => {
    if (loaded && !isCheckingAuth) {
      // Small delay to ensure everything is ready before hiding splash
      setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {
          // Splash screen might already be hidden, ignore error
        });
      }, 100);
    }
  }, [loaded, isCheckingAuth]);

  if (!loaded || isCheckingAuth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#062F71',
        }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 14,
            color: '#FFFFFF',
            // Only use custom font if loaded, otherwise use system font
            ...(loaded && { fontFamily: 'Poppins-Regular' }),
            opacity: 0.9,
          }}
        >
          Verifying authentication...
        </Text>
      </View>
    );
  }

  // If fonts failed to load, log the error but continue
  // The app should still work with system fonts
  if (error) {
    console.error('[RootLayout] Font loading failed, using system fonts:', error);
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen
        name="change-password"
        options={{
          presentation: 'card',
          headerShown: true,
          title: 'Change Password',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          presentation: 'card',
          headerShown: true,
          title: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen name="onboarding-doctor" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-patient" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-pharmacist" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-lab-staff" options={{ headerShown: false }} />
      <Stack.Screen name="consultations/book" options={{ headerShown: false }} />
      <Stack.Screen
        name="consultations/[id]"
        options={{
          presentation: 'card',
          headerShown: true,
          title: 'Consultation',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{
          presentation: 'card',
          headerShown: true,
          title: '',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          presentation: 'card',
          headerShown: true,
          title: 'Profile',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          presentation: 'card',
          headerShown: true,
          title: 'Medical History',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <RootLayoutContent />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
