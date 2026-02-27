// Load environment variables
// Note: Expo automatically loads EXPO_PUBLIC_* variables, but dotenv ensures .env file is loaded
require('dotenv').config({ path: '.env' });

module.exports = {
  expo: {
    name: 'LifeCare',
    slug: 'lifecare-mobile-v1',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'lifecaremobilev1',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.nijohn.lifecare',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'LifeCare needs your location to show nearby drivers and provide ride services.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "LifeCare needs your location to track your ride and show your driver's location.",
        NSLocationAlwaysUsageDescription:
          "LifeCare needs your location to track your ride and show your driver's location.",
        UIBackgroundModes: ['location'],
      },
      config: {
        useAppleMaps: true,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#062F71',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.nijohn.lifecare',
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION',
      ],
      config: {
        googleMaps: {
          apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
        },
      },
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/logo.png',
          resizeMode: 'contain',
          backgroundColor: '#062F71',
          enableFullScreen_legacy: true,
        },
      ],
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/Inter-Variable.ttf',
            './assets/fonts/Poppins-Black.ttf',
            './assets/fonts/Poppins-Bold.ttf',
            './assets/fonts/Poppins-ExtraBold.ttf',
            './assets/fonts/Poppins-ExtraLight.ttf',
            './assets/fonts/Poppins-Light.ttf',
            './assets/fonts/Poppins-Medium.ttf',
            './assets/fonts/Poppins-Regular.ttf',
          ],
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you upload documents and images.',
          cameraPermission: 'The app accesses your camera to let you take photos of documents.',
        },
      ],
      ['expo-document-picker'],
      'expo-web-browser',
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow LifeCare to use your location to show nearby drivers and provide ride services.',
          locationWhenInUsePermission:
            'Allow LifeCare to use your location to show nearby drivers and provide ride services.',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: 'YOUR_EAS_PROJECT_ID',
      },
      // Environment variables accessible via Constants.expoConfig.extra
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081/api/v1',
      cloudinaryCloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      cloudinaryApiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY,
    },
    owner: 'nijohn',
  },
};
