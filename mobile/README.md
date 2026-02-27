# LifeCare V1 - Architecture & Best Practices

## System Architecture

LifeCare V2 follows a **hybrid architecture** pattern that leverages the
strengths of different technologies for optimal performance and maintainability.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  MOBILE APPLICATION                     │
│            (React Native + Expo Router)                 │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   BACKEND    │  │   FIREBASE   │  │  ONESIGNAL   │
│   REST API   │  │   FIRESTORE  │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Technology Responsibilities

### 1. Backend REST API (Your Custom Server)

**Handles:**

- User Authentication & Authorization
- User Profile Management
- Ride Request Processing
- Driver Matching Algorithm
- Fare Calculation
- Payment Processing
- Ride History & Analytics
- Driver Verification & Onboarding
- Business Rules & Logic

**Why Backend?**

- Full control over authentication flow
- Secure payment processing
- Complex business logic
- Integration with third-party services
- Audit trails and compliance
- Single source of truth for user data

---

### 2. Firebase Firestore (Real-time Database)

**Handles:**

- In-App Chat (Rider ↔ Driver)
- Live Driver Location Tracking
- Active Ride Status Updates
- Real-time Notifications (in-app)

**Why Firebase?**

- Sub-100ms real-time updates
- Automatic offline support
- WebSocket connections managed by Google
- Scales automatically
- Reduces backend server load
- Better user experience for real-time features

**Data Flow Example:**

```javascript
// Driver updates location every 3 seconds
firestore()
  .collection('activeRides')
  .doc(rideId)
  .update({
    driverLocation: { lat: 37.7749, lng: -122.4194 },
    lastUpdated: new Date(),
  });

// Rider sees driver moving on map INSTANTLY
firestore()
  .collection('activeRides')
  .doc(rideId)
  .onSnapshot(doc => {
    updateMapMarker(doc.data().driverLocation);
  });
```

---

### 3. OneSignal (Push Notifications)

**Handles:**

- Push Notifications (iOS & Android)
- Driver assignment notifications
- Ride status updates
- Promotional messages
- Payment confirmations

**Why OneSignal?**

- Better analytics dashboard
- Easier notification management
- Cross-platform support
- A/B testing capabilities
- Scheduled notifications

---

## Authentication Flow

LifeCare uses **backend-only authentication** with Firebase for real-time
features.

### Login Flow

```
┌─────────┐
│  USER   │
└────┬────┘
     │
     │ 1. Login Request (phone/email + password)
     ▼
┌─────────────────┐
│  BACKEND API    │
│  /auth/login    │
└────┬────────────┘
     │
     │ 2. Validate Credentials
     │ 3. Generate JWT Token
     │ 4. Return { token, userId, user }
     ▼
┌─────────────────┐
│  MOBILE APP     │
│  Store Token    │
└────┬────────────┘
     │
     │ 5. Use token for backend API calls
     │ 6. Use userId for Firebase Firestore queries
     ▼
┌─────────────────┐    ┌─────────────────┐
│  BACKEND API    │    │    FIREBASE     │
│  (Authorized)   │    │   (Real-time)   │
└─────────────────┘    └─────────────────┘
```

### Key Points

- **Backend is the source of truth** for user authentication
- **Firebase is NOT used for authentication**
- **JWT tokens secure backend API calls**
- **User IDs secure Firebase Firestore access**
- **No duplicate user data between systems**

---

## Data Storage Strategy

### Backend Database (PostgreSQL/MongoDB/MySQL)

**Stores:**

- User profiles (name, email, phone, password hash)
- Driver information (license, vehicle, ratings)
- Ride history (completed, cancelled)
- Payment records
- Transaction logs
- Analytics data

### Firebase Firestore

**Stores (Temporarily):**

- Active ride sessions (during trip only)
- Chat messages (last 30 days)
- Live driver locations (active drivers only)

**Note:** Data in Firestore is temporary and syncs to backend database for
permanent storage.

---

## Why This Architecture?

### Advantages

1. **Separation of Concerns**
   - Backend handles business logic
   - Firebase handles real-time features
   - Clear boundaries between services

2. **Cost Optimization**
   - Backend handles heavy computation once
   - Firebase only for real-time updates
   - Reduced server costs

3. **Performance**
   - Real-time features are instant (<100ms)
   - Backend isn't overloaded with location updates
   - Better user experience

4. **Scalability**
   - Firebase scales automatically for real-time features
   - Backend scales for business logic
   - Each system optimized for its purpose

5. **Maintainability**
   - Clear separation makes debugging easier
   - Teams can work independently
   - Easier to upgrade individual components

### Trade-offs

1. **Complexity**
   - Managing two data stores
   - Keeping data in sync
   - More services to monitor

2. **Cost**
   - Firebase costs (though offset by reduced backend load)
   - OneSignal subscription

**Verdict:** The benefits far outweigh the trade-offs for a ride-sharing app.

---

## Security Considerations

### Backend API Security

```javascript
// All API calls require authentication
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Firebase Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Active rides - read/write only if you're the rider or driver
    match /activeRides/{rideId} {
      allow read: if request.auth != null &&
                     (resource.data.riderId == request.auth.uid ||
                      resource.data.driverId == request.auth.uid);
      allow write: if request.auth != null;
    }

    // Chat messages - read/write only if you're in the chat
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Technology Stack Summary

### Frontend

- **Framework:** React Native 0.76.6
- **Routing:** Expo Router 4.0.17
- **State Management:** Jotai 2.10.3
- **UI Library:** React Native Paper 5.12.5
- **HTTP Client:** Axios 1.7.7

### Backend

- **Your Custom Backend** (Node.js/Express, Python/Django, etc.)

### Real-time Services

- **Database:** Firebase Firestore
- **Push Notifications:** OneSignal

### Maps & Location

- **Maps:** React Native Maps
- **Location:** Expo Location
- **Directions:** React Native Maps Directions

---

## Complete Installation Flow

### Phase 1: Core Dependencies

```bash
npm install jotai react-native-paper axios
```

### Phase 2: Firebase (Real-time Features)

```bash
npm install @react-native-firebase/app @react-native-firebase/firestore
```

### Phase 3: Maps & Location

```bash
npm install react-native-maps expo-location
```

### Phase 4: Push Notifications

```bash
npm install react-native-onesignal onesignal-expo-plugin
```

### Phase 5: Chat

```bash
npm install @flyerhq/react-native-chat-ui @flyerhq/react-native-firebase-chat-core
```

### Phase 6: UI Components

```bash
npm install react-native-toast-message @react-native-async-storage/async-storage
npm install react-native-gesture-handler react-native-reanimated
npm install react-native-safe-area-context
```

### Phase 7: Forms & Input

```bash
npm install react-native-phone-number-input react-native-otp-entry
npm install react-native-dropdown-picker react-native-date-picker
```

### Phase 8: Media

```bash
npm install expo-image-picker expo-document-picker
```

---

## Project Structure

```
lifecare-mobile-v1/
├── app/                              # Expo Router screens (file-based routing)
│   ├── (auth)/                          # Auth group - not shown in URL
│   │   ├── _layout.tsx                  # Auth screens layout (no tabs/header)
│   │   ├── index.tsx                    # Landing/Welcome screen
│   │   ├── signin.tsx                   # Sign in screen
│   │   ├── signup.tsx                   # Sign up screen
│   │   ├── otp.tsx                      # OTP verification
│   │   └── forgot-password.tsx          # Password recovery
│   │
│   ├── (tabs)/                          # Main app - tab navigation
│   │   ├── _layout.tsx                  # Tab bar configuration
│   │   ├── index.tsx                    # Home/Map screen (ride booking)
│   │   ├── rides.tsx                    # Ride history
│   │   ├── profile.tsx                  # User profile & settings
│   │   └── wallet.tsx                   # Wallet/Payments (optional)
│   │
│   ├── ride/                            # Ride-related screens (modals/stacks)
│   │   ├── [id].tsx                     # Active ride details (dynamic route)
│   │   ├── booking.tsx                  # Ride booking flow
│   │   ├── confirmation.tsx             # Ride confirmation
│   │   └── rating.tsx                   # Rate driver after ride
│   │
│   ├── driver/                          # Driver profile screens
│   │   └── [id].tsx                     # Driver profile (dynamic route)
│   │
│   ├── _layout.tsx                      # Root layout (splash, auth check)
│   └── +not-found.tsx                   # 404 handler
│
├── components/                       # Reusable UI components
│   ├── auth/                            # Authentication components
│   │   ├── AuthForm.tsx                 # Reusable auth form wrapper
│   │   ├── PhoneInput.tsx               # Phone number input
│   │   ├── OTPInput.tsx                 # OTP verification input
│   │   └── SocialAuthButtons.tsx        # Google/Apple sign in
│   │
│   ├── common/                          # Generic reusable components
│   │   ├── Button.tsx                   # Custom button component
│   │   ├── Input.tsx                    # Custom input field
│   │   ├── Card.tsx                     # Card wrapper
│   │   ├── Avatar.tsx                   # User/Driver avatar
│   │   ├── Loading.tsx                  # Loading spinner
│   │   ├── ErrorBoundary.tsx            # Error boundary wrapper
│   │   └── EmptyState.tsx               # Empty state placeholder
│   │
│   ├── home/                            # Home/Map screen components
│   │   ├── MapView.tsx                  # Map component wrapper
│   │   ├── LocationSearch.tsx           # Pickup/dropoff search
│   │   ├── RideTypeSelector.tsx         # Economy/Premium/XL selector
│   │   ├── FareEstimate.tsx             # Fare estimate display
│   │   ├── DriverCard.tsx               # Driver info card (when matched)
│   │   └── ActiveRideCard.tsx           # Active ride bottom sheet
│   │
│   ├── rides/                           # Ride history components
│   │   ├── RideHistoryCard.tsx          # Single ride card
│   │   ├── RideFilters.tsx              # Filter by date/status
│   │   └── RideReceipt.tsx              # Ride receipt/details
│   │
│   ├── profile/                         # Profile screen components
│   │   ├── ProfileHeader.tsx            # Profile header with avatar
│   │   ├── SettingsList.tsx             # Settings list
│   │   ├── PaymentMethodCard.tsx        # Payment method item
│   │   └── EmergencyContact.tsx         # Emergency contact card
│   │
│   ├── chat/                            # Chat components
│   │   ├── ChatBubble.tsx               # Message bubble
│   │   ├── ChatInput.tsx                # Message input
│   │   └── ChatHeader.tsx               # Chat header
│   │
│   └── useColorScheme.ts                # Dark/light mode helper
│
├── atoms/                            # Jotai state management (atomic state)
│   ├── authAtoms.ts                     # Auth state (user, token, isAuthenticated)
│   ├── rideAtoms.ts                     # Active ride state (current ride, status)
│   ├── locationAtoms.ts                 # Location state (pickup, dropoff, current)
│   ├── driverAtoms.ts                   # Driver state (assigned driver info)
│   ├── uiAtoms.ts                       # UI state (modals, loading, toasts)
│   └── index.ts                         # Export all atoms
│
├── services/                         # External service integrations
│   ├── api/                             # Backend REST API
│   │   ├── client.ts                    # Axios instance with interceptors
│   │   ├── auth.ts                      # Auth endpoints (/login, /signup, etc.)
│   │   ├── rides.ts                     # Ride endpoints (/rides/*, etc.)
│   │   ├── users.ts                     # User endpoints (/users/*, etc.)
│   │   ├── payments.ts                  # Payment endpoints
│   │   └── index.ts                     # Export all API services
│   │
│   ├── firebase/                        # Firebase Firestore services
│   │   ├── config.ts                    # Firebase initialization
│   │   ├── rides.ts                     # Active rides listeners
│   │   ├── chat.ts                      # Chat messages listeners
│   │   ├── location.ts                  # Driver location tracking
│   │   └── index.ts                     # Export all Firebase services
│   │
│   ├── onesignal/                       # OneSignal push notifications
│   │   ├── config.ts                    # OneSignal initialization
│   │   ├── notifications.ts             # Notification handlers
│   │   └── index.ts                     # Export OneSignal services
│   │
│   └── location/                        # Location services
│       ├── permissions.ts               # Location permission handling
│       ├── tracking.ts                  # Location tracking logic
│       └── geocoding.ts                 # Address <-> Coordinates conversion
│
├── hooks/                            # Custom React hooks
│   ├── useAuth.ts                       # Auth hook (login, logout, signup)
│   ├── useRide.ts                       # Ride hook (request, cancel, complete)
│   ├── useLocation.ts                   # Location hook (get current, watch)
│   ├── useFirestore.ts                  # Firestore real-time hook
│   ├── useChat.ts                       # Chat hook (send, listen)
│   ├── usePayment.ts                    # Payment hook
│   └── usePermissions.ts                # Permission handling hook
│
├── types/                            # TypeScript type definitions
│   ├── api.ts                           # API request/response types
│   ├── models.ts                        # Data models (User, Ride, Driver, etc.)
│   ├── navigation.ts                    # Navigation types
│   ├── firestore.ts                     # Firestore document types
│   └── index.ts                         # Export all types
│
├── constants/                        # App constants
│   ├── Colors.ts                        # Color palette
│   ├── index.ts                         # App constants (API URL, keys, etc.)
│   ├── theme.ts                         # React Native Paper theme config
│   ├── localization.ts                  # i18n strings (future)
│   └── rideTypes.ts                     # Ride types (Economy, Premium, XL)
│
├── utils/                            # Utility functions
│   ├── storage.ts                       # AsyncStorage helpers
│   ├── validators.ts                    # Form validation functions
│   ├── formatters.ts                    # Date/currency/distance formatters
│   ├── permissions.ts                   # Permission utilities
│   ├── toast.ts                         # Toast notification helpers
│   └── index.ts                         # Export all utils
│
├── assets/                           # Static assets
│   ├── images/                          # Images
│   │   ├── icon.png                     # App icon
│   │   ├── splash-icon.png              # Splash screen
│   │   ├── adaptive-icon.png            # Android adaptive icon
│   │   ├── logo.png                     # App logo
│   │   └── (car type images)            # Car category icons
│   └── fonts/                           # Custom fonts
│
├── Configuration Files
├── .env                                 # Environment variables (gitignored)
├── .env.example                         # Example env file
├── .prettierrc                          # Prettier configuration
├── .prettierignore                      # Prettier ignore patterns
├── app.json                             # Expo configuration
├── babel.config.js                      # Babel configuration
├── metro.config.js                      # Metro bundler configuration
├── tailwind.config.js                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
├── global.css                           # Global Tailwind styles
├── nativewind-env.d.ts                  # NativeWind TypeScript types
├── package.json                         # Project dependencies
├── README-ARCHITECTURE.md               # This file
└── OPTIMIZATION.md                      # Optimization log
```

---

## Data Synchronization Flow

### Example: Ride Request

```
1. USER REQUESTS RIDE
   ↓
   Mobile App
   ↓
2. POST /api/rides/request → BACKEND
   - Validate user
   - Find nearby drivers
   - Calculate fare
   - Create ride record in DB
   - Return rideId
   ↓
3. Create Firebase document → FIRESTORE
   firestore().collection('activeRides').doc(rideId).set({
     riderId, status: 'searching', pickupLocation, etc.
   })
   ↓
4. Send push notification → ONESIGNAL
   - Notify nearby drivers
   ↓
5. DRIVER ACCEPTS
   ↓
6. POST /api/rides/accept → BACKEND
   - Update ride in DB
   - Assign driver
   ↓
7. Update Firebase → FIRESTORE
   firestore().collection('activeRides').doc(rideId).update({
     driverId, status: 'accepted'
   })
   ↓
8. RIDER SEES UPDATE (Real-time via Firebase listener)
   ↓
9. LIVE LOCATION TRACKING
   - Driver app updates location every 3s → Firebase
   - Rider app listens to location changes → Real-time map updates
   ↓
10. RIDE COMPLETED
    ↓
11. POST /api/rides/complete → BACKEND
    - Update ride status
    - Process payment
    - Calculate ratings
    ↓
12. Delete Firebase document → FIRESTORE
    firestore().collection('activeRides').doc(rideId).delete()
    (Temporary data removed, permanent data in backend DB)
```

---

## References

- [Firebase Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [React Native Architecture](https://reactnative.dev/docs/architecture-overview)
- [OneSignal Documentation](https://documentation.onesignal.com/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Jotai Documentation](https://jotai.org/)

---

## Contributing

When contributing to LifeCare V2, please follow these guidelines:

1. **Backend changes** - Create PR in backend repository
2. **Mobile app changes** - Create PR in this repository
3. **Firebase schema changes** - Document in `docs/FIRESTORE-SCHEMA.md`
4. **API changes** - Update API documentation

---

## License

MIT
