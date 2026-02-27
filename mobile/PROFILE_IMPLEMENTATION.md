# Profile Implementation Summary

## Overview

This document describes the implementation of the profile functionality for both
**Driver** and **Rider (Passenger)** accounts in the LifeCare mobile
application.

## API Endpoint

The profile functionality uses the `/api/v1/auth/me` endpoint:

- **Method**: GET
- **Headers**:
  - `Authorization: Bearer {token}`
  - `x-language: en|fr|rw`
- **Response**: Returns user data with role-specific profile information

## Implementation Details

### 1. Type Definitions

**Location**: [types/user.types.ts](types/user.types.ts)

Created comprehensive TypeScript types for:

- `User` - Main user interface
- `DriverProfile` - Driver-specific profile data
- `PassengerProfile` - Passenger-specific profile data
- `UserRole` - User role information
- `UpdateProfileDto` - Profile update data transfer object
- `UpdateDriverProfileDto` - Driver profile update DTO
- `UpdatePassengerProfileDto` - Passenger profile update DTO

### 2. Profile Service

**Location**: [services/profile.service.ts](services/profile.service.ts)

Added new methods to the `ProfileService` class:

- `getUserProfile()` - Fetches current user profile from `/auth/me`
- `updateUserProfile(data)` - Updates user profile via PATCH `/auth/me`
- `updateDriverProfile(data)` - Updates driver-specific profile via PATCH
  `/driver-profiles/my-profile`
- `updatePassengerProfile(data)` - Updates passenger-specific profile via PATCH
  `/passenger-profiles/my-profile`

### 3. Auth Context (Optional)

**Location**: [contexts/AuthContext.tsx](contexts/AuthContext.tsx)

Created an optional `AuthContext` for centralized user state management:

- `useAuth()` hook for accessing user data
- `login()` - Authentication method
- `logout()` - Logout method
- `refreshUser()` - Refresh user data from API
- `updateUser()` - Update local user state

**Note**: The app currently uses Jotai atoms for state management, so this
context is optional.

### 4. Reusable Profile Components

**Location**: [components/profile/](components/profile/)

Created reusable UI components:

#### ProfileHeader

Displays user avatar, name, and email with optional edit button.

#### ProfileField

Displays a labeled field with icon and optional edit capability:

- Shows field label and value
- Supports custom icons
- Can be made editable with onPress handler
- Handles empty values gracefully

#### ProfileSection

Groups related profile fields under a titled section:

- Section title
- Container for ProfileField components

#### StatCard

Displays statistics in a card format:

- Icon with customizable color
- Value (number or string)
- Label text
- Perfect for showing ratings, trip counts, earnings, etc.

### 5. Profile Screen

**Location**: [app/profile.tsx](app/profile.tsx)

Implemented a dynamic profile screen that:

- **Automatically detects user role** (Driver or Passenger)
- **Shows role-specific information**
- **Supports pull-to-refresh**
- **Handles loading and error states**

#### Features:

##### Common to All Users:

- Profile header with avatar, name, and email
- Personal information (name, email, phone, gender, NID)
- Location information (country, city)
- Account status (active, email verified, verification status)

##### Driver-Specific Sections:

- **Stats Cards**: Rating, Total Trips, Total Earnings
- **Driver Information**: License number, years of experience, status,
  verification status
- **Emergency Contact**: Name and phone
- **Performance Metrics**:
  - Acceptance rate
  - Cancellation rate
  - Total earnings
  - Current balance

##### Passenger-Specific Sections:

- **Stats Cards**: Rating, Total Trips, Wallet Balance
- **Passenger Information**: Preferred payment method, total spent, wallet
  balance
- **Emergency Contact** (if available): Name and phone

## How It Works

### Data Flow:

1. User opens profile screen
2. Screen calls `ProfileService.getUserProfile()`
3. API returns user data with `role.name` and role-specific profile
4. Screen checks role (`user.role.name === 'DRIVER'` or `'PASSENGER'`)
5. Screen conditionally renders appropriate sections based on role
6. Pull-to-refresh allows users to update their profile data

### Role Detection:

```typescript
const isDriver = user.role.name === 'DRIVER';
const isPassenger = user.role.name === 'PASSENGER';
```

The screen then conditionally renders sections:

```typescript
{isDriver && user.driverProfile && (
  // Driver-specific UI
)}

{isPassenger && user.passengerProfile && (
  // Passenger-specific UI
)}
```

## API Response Structure

### Driver Response:

```json
{
  "ok": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "role": {
      "name": "DRIVER"
    },
    "driverProfile": {
      "id": "...",
      "driverLicenseNumber": "123455",
      "yearsOfExperience": 5,
      "averageRating": 4.5,
      "totalRidesCompleted": 100,
      "totalEarnings": "5000.00"
      // ... more driver fields
    },
    "passengerProfile": null
  }
}
```

### Passenger Response:

```json
{
  "ok": true,
  "data": {
    "id": "...",
    "name": "Jane Smith",
    "email": "user@example.com",
    "role": {
      "name": "PASSENGER"
    },
    "driverProfile": null,
    "passengerProfile": {
      "id": "...",
      "preferredPaymentMethod": "MOBILE_MONEY",
      "averageRating": 4.8,
      "totalRidesCompleted": 50,
      "currentWalletBalance": "100.00"
      // ... more passenger fields
    }
  }
}
```

## Testing

To test the profile functionality:

1. **As a Driver**:
   - Login with driver credentials
   - Navigate to Profile tab
   - Verify driver stats (rating, trips, earnings) are displayed
   - Verify driver-specific sections appear (license, performance metrics)
   - Pull down to refresh and verify data updates

2. **As a Passenger**:
   - Login with passenger credentials
   - Navigate to Profile tab
   - Verify passenger stats (rating, trips, balance) are displayed
   - Verify passenger-specific sections appear (payment method, wallet)
   - Pull down to refresh and verify data updates

## Future Enhancements

Potential improvements for the profile feature:

1. **Profile Editing**:
   - Add edit screens for personal information
   - Add image picker for profile picture
   - Implement form validation

2. **Driver-Specific**:
   - Document upload interface
   - Vehicle management
   - Earnings breakdown and withdrawal

3. **Passenger-Specific**:
   - Saved addresses management
   - Payment methods management
   - Ride preferences

4. **Common**:
   - Settings integration
   - Language preferences
   - Notification preferences
   - Account deletion

## Files Created/Modified

### Created:

- `types/user.types.ts` - TypeScript type definitions
- `contexts/AuthContext.tsx` - Optional auth context (if needed)
- `components/profile/ProfileHeader.tsx` - Profile header component
- `components/profile/ProfileField.tsx` - Profile field component
- `components/profile/ProfileSection.tsx` - Profile section component
- `components/profile/StatCard.tsx` - Statistics card component
- `components/profile/index.ts` - Component exports

### Modified:

- `services/profile.service.ts` - Added getUserProfile and update methods
- `app/profile.tsx` - Completely reimplemented with dynamic role-based UI

## Conclusion

The profile implementation successfully handles both Driver and Passenger
accounts using a single dynamic screen that adapts based on the user's role. The
implementation is clean, type-safe, and follows React Native best practices.
