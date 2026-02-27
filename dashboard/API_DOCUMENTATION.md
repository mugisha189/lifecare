# LifeCare API Documentation

Base URL: `http://localhost:3000` (Development)

## Table of Contents

- [Authentication](#authentication)
  - [Role Switching](#role-switching)
- [Users](#users)
- [Driver Profiles](#driver-profiles)
- [Passenger Profiles](#passenger-profiles)
- [Vehicles](#vehicles)
- [Vehicle Categories](#vehicle-categories)
- [Rides](#rides)
- [Ride Requests](#ride-requests)
- [Bookings](#bookings)
- [Nearby Rides](#nearby-rides)
- [Live Tracking](#live-tracking)
- [Reviews](#reviews)
- [Discounts](#discounts)
- [Analytics](#analytics)

---

## Authentication

### POST /auth/register

Register a new user account.

**Access:** Public

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+250788123456",
  "password": "SecurePassword123!",
  "roleId": "role-uuid",
  "gender": "MALE",
  "country": "Rwanda",
  "city": "Kigali",
  "preferredLanguage": "EN"
}
```

**Response:** 201 Created

```json
{
  "ok": true,
  "message": "User registered successfully",
  "data": { ... }
}
```

---

### POST /auth/login

Login with email/phone and password.

**Access:** Public

**Request Body:**

```json
{
  "identifier": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** 200 OK

```json
{
  "ok": true,
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "user": { ... }
  }
}
```

---

### POST /auth/refresh

Refresh access token using refresh token.

**Access:** Public

**Request Body:**

```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:** 200 OK

---

### POST /auth/logout

Logout user and revoke refresh tokens.

**Access:** Authenticated

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:** 200 OK

---

### GET /auth/me

Get current authenticated user profile with available roles for switching.

**Access:** Authenticated

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

```json
{
  "ok": true,
  "data": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "id": "role-uuid",
      "name": "RIDER"
    },
    "driverProfile": {
      "id": "driver-profile-uuid",
      "driverStatus": "ACTIVE",
      "averageRating": 4.8,
      "totalRidesCompleted": 150
    },
    "passengerProfile": {
      "id": "passenger-profile-uuid",
      "totalRides": 45,
      "loyaltyPoints": 320
    },
    "availableRoles": ["DRIVER", "RIDER"],
    "canSwitchRole": true
  }
}
```

**Key Fields:**

- `availableRoles`: Array of roles the user can switch to (based on profile status)
- `canSwitchRole`: Boolean indicating if role switching is available (true if more than one role available)

---

### PATCH /auth/me

Update current user profile.

**Access:** Authenticated

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "name": "Updated Name",
  "phoneNumber": "+250788123456",
  "city": "Kigali"
}
```

**Response:** 200 OK

---

### POST /auth/change-password

Change user password.

**Access:** Authenticated

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response:** 200 OK

---

### GET /auth/profile-status

Get detailed profile status including which profiles exist, their status, and available actions.

**Access:** Authenticated

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

```json
{
  "ok": true,
  "data": {
    "currentRole": "RIDER",
    "hasDriverProfile": true,
    "hasPassengerProfile": true,
    "driverProfile": {
      "status": "ACTIVE",
      "verificationStatus": "VERIFIED",
      "hasDocuments": true,
      "documentsVerified": true,
      "canDrive": true,
      "totalRides": 150,
      "rating": 4.8
    },
    "passengerProfile": {
      "verificationStatus": "VERIFIED",
      "loyaltyPoints": 320,
      "totalRides": 45,
      "rating": 4.5
    },
    "availableRoles": ["DRIVER", "RIDER"],
    "actions": {
      "canSwitchRole": true,
      "canCreateDriverProfile": false,
      "canCreatePassengerProfile": false,
      "needsDriverApproval": false,
      "isDriverSuspended": false
    },
    "recommendations": []
  }
}
```

**Response Scenarios:**

**No Profiles:**

```json
{
  "currentRole": "RIDER",
  "hasDriverProfile": false,
  "hasPassengerProfile": false,
  "driverProfile": null,
  "passengerProfile": null,
  "availableRoles": [],
  "actions": {
    "canSwitchRole": false,
    "canCreateDriverProfile": true,
    "canCreatePassengerProfile": true,
    "needsDriverApproval": false,
    "isDriverSuspended": false
  },
  "recommendations": [
    "Create a driver profile to start earning by offering rides",
    "Create a passenger profile to book rides"
  ]
}
```

**Driver Pending Approval:**

```json
{
  "currentRole": "DRIVER",
  "hasDriverProfile": true,
  "hasPassengerProfile": true,
  "driverProfile": {
    "status": "PENDING_APPROVAL",
    "verificationStatus": "PENDING",
    "hasDocuments": true,
    "documentsVerified": false,
    "canDrive": false,
    "totalRides": 0,
    "rating": null
  },
  "availableRoles": ["RIDER"],
  "actions": {
    "canSwitchRole": false,
    "canCreateDriverProfile": false,
    "canCreatePassengerProfile": false,
    "needsDriverApproval": true,
    "isDriverSuspended": false
  },
  "recommendations": ["Your driver profile is pending approval. You will be notified once approved."]
}
```

**Use Cases:**

- Check which profiles exist before showing creation options
- Determine if user can switch roles
- Show appropriate UI based on profile status
- Get recommendations for next steps

---

**Request Body:**

```json
{
  "role": "DRIVER"
}
```

**Valid role values:**

- `"DRIVER"` - Switch to driver mode (requires active driver profile)
- `"RIDER"` - Switch to rider/passenger mode (requires passenger profile)

**Response:** 200 OK

```json
{
  "ok": true,
  "message": "Role switched successfully to DRIVER",
  "data": {
    "role": {
      "id": "role-uuid",
      "name": "DRIVER"
    },
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-jwt-refresh-token",
    "expiresIn": 3600
  }
}
```

**Error Responses:**

400 Bad Request - Missing required profile:

```json
{
  "ok": false,
  "message": "Driver profile required to switch to DRIVER role"
}
```

400 Bad Request - Driver profile not approved:

```json
{
  "ok": false,
  "message": "Driver profile is pending approval"
}
```

400 Bad Request - Already in requested role:

```json
{
  "ok": false,
  "message": "You are already in DRIVER role"
}
```

401 Unauthorized - Invalid/expired token

**Validation Rules:**

- **To switch to DRIVER:** Must have driver profile with status ACTIVE, INACTIVE, or ON_BREAK
- **To switch to RIDER:** Must have passenger profile
- Cannot switch if already in the requested role
- Cannot switch if driver profile is PENDING_APPROVAL or SUSPENDED
- All existing refresh tokens are revoked for security

**Usage Flow:**

1. User logs in with their credentials (gets initial role)
2. User calls `/auth/profile-status` to check profile status and available actions
3. If `actions.canSwitchRole` is true, user can call `/auth/switch-role` with desired role
4. Client receives new tokens and updates auth state
5. All subsequent requests use new tokens with updated role context

**Example Use Cases:**

- Driver wants to book a ride as a passenger → Switch to RIDER
- Passenger wants to offer rides → Switch to DRIVER (if driver profile exists and approved)
- Driver completed their driving shift → Switch to RIDER for personal travel

---

### POST /auth/verify-otp

Verify email with OTP code.

**Access:** Public

**Request Body:**

```json
{
  "otp": "123456"
}
```

**Response:** 200 OK

---

### POST /auth/resend-otp

Resend OTP verification code.

**Access:** Public

**Request Body:**

```json
{
  "email": "john.doe@example.com"
}
```

**Response:** 200 OK

---

### POST /auth/forgot-password

Request password reset OTP.

**Access:** Public

**Request Body:**

```json
{
  "email": "john.doe@example.com"
}
```

**Response:** 200 OK

---

### POST /auth/reset-password

Reset password with OTP.

**Access:** Public

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123!"
}
```

**Response:** 200 OK

---

## Users

### POST /users

Create user by admin.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+250788123456",
  "password": "Password123!",
  "roleId": "role-uuid",
  "gender": "MALE"
}
```

**Response:** 201 Created

---

### GET /users

Get all users.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### GET /users/:id

Get user by ID.

**Access:** Authenticated

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /users/:id

Update user.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### DELETE /users/:id

Delete user (soft delete).

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### POST /users/:id/activate

Activate or deactivate user.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "active": true
}
```

**Response:** 200 OK

---

### POST /users/:id/suspend

Suspend user account.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "reason": "Violation of terms",
  "suspendedUntil": "2025-12-31T23:59:59Z"
}
```

**Response:** 200 OK

---

### POST /users/:id/unsuspend

Unsuspend user account.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### GET /users/:id/activity

Get user activity logs.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

## Driver Profiles

### POST /driver-profiles/create-my-profile

Create own driver profile. Works regardless of current role - any authenticated user can create a driver profile.

**Access:** Authenticated (any role)

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "driverLicenseNumber": "DL123456789",
  "licenseExpiryDate": "2026-12-31",
  "yearsOfExperience": 5,
  "bio": "Experienced driver, safe and reliable",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+250788999888",
  "documents": [
    {
      "documentType": "DRIVERS_LICENSE",
      "documentURL": "https://example.com/license.pdf",
      "expiryDate": "2026-12-31"
    },
    {
      "documentType": "VEHICLE_REGISTRATION",
      "documentURL": "https://example.com/registration.pdf",
      "expiryDate": "2025-06-30"
    }
  ]
}
```

**Response:** 201 Created

```json
{
  "ok": true,
  "message": "Driver profile created successfully",
  "data": {
    "id": "driver-profile-uuid",
    "userId": "user-uuid",
    "driverStatus": "PENDING_APPROVAL",
    "verificationStatus": "PENDING",
    "hasUploadedDocuments": true,
    "areDocumentsVerified": false,
    "createdAt": "2024-12-17T10:00:00.000Z"
  }
}
```

**Important Notes:**

- Profile status will be `PENDING_APPROVAL` after creation
- User cannot switch to DRIVER role until admin approves
- User can still use passenger profile while waiting for approval
- Check profile status with `GET /auth/profile-status` to see approval status

---

### GET /driver-profiles/my-driver-profile

Get current logged-in driver's profile.

**Access:** Driver

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /driver-profiles/my-profile

Update own driver profile.

**Access:** Driver

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### POST /driver-profiles

Create a driver profile (Admin).

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 201 Created

---

### GET /driver-profiles

Get all driver profiles with filters.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `areDocumentsVerified` (boolean)
- `minRating` (number)
- `driverStatus` (ACTIVE|INACTIVE|PENDING_APPROVAL|SUSPENDED|ON_BREAK)
- `isAvailable` (boolean)
- `page` (number)
- `limit` (number)

**Response:** 200 OK

---

### GET /driver-profiles/:id

Get a driver profile by ID.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /driver-profiles/user/:userId

Update driver profile by user ID.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /driver-profiles/:id/verify

Verify/Unverify driver profile and documents.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### DELETE /driver-profiles/:id

Delete a driver profile (soft delete).

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

## Passenger Profiles

### POST /passenger-profiles/create-my-profile

Create own passenger profile. Works regardless of current role - any authenticated user can create a passenger profile.
Profile is immediately active (no approval needed).

**Access:** Authenticated (any role)

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "preferredPaymentMethod": "MOMO",
  "savedAddresses": {
    "home": "Kigali, Rwanda",
    "work": "Nyarutarama, Kigali"
  },
  "specialRequirements": "Prefer quiet drivers",
  "preferredVehicleTypes": ["SEDAN", "SUV"]
}
```

**Response:** 201 Created

```json
{
  "ok": true,
  "message": "Passenger profile created successfully",
  "data": {
    "id": "passenger-profile-uuid",
    "userId": "user-uuid",
    "verificationStatus": "UNVERIFIED",
    "loyaltyPoints": 0,
    "totalRides": 0,
    "createdAt": "2024-12-17T10:00:00.000Z"
  }
}
```

**Important Notes:**

- Profile is immediately active - no approval needed
- User can book rides right away
- Can earn loyalty points and build rating as passenger
- Check profile status with `GET /auth/profile-status` to see profile details

---

### GET /passenger-profiles/my-passenger-profile

Get current logged-in passenger's profile.

**Access:** Rider

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /passenger-profiles/my-profile

Update own passenger profile.

**Access:** Rider

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### POST /passenger-profiles

Create a passenger profile (Admin).

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 201 Created

---

### GET /passenger-profiles

Get all passenger profiles with filters.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `verificationStatus` (VERIFIED|UNVERIFIED|PENDING)
- `minLoyaltyPoints` (number)
- `page` (number)
- `limit` (number)

**Response:** 200 OK

---

### GET /passenger-profiles/:id

Get a passenger profile by ID.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /passenger-profiles/user/:userId

Update passenger profile by user ID.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /passenger-profiles/:id/verify

Verify passenger profile.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### DELETE /passenger-profiles/:id

Delete a passenger profile (soft delete).

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

## Vehicles

### POST /vehicles

Register a vehicle.

**Access:** Driver only

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "licensePlate": "RAB123C",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "color": "White",
  "categoryId": "category-uuid",
  "seatingCapacity": 4,
  "fuelType": "PETROL"
}
```

**Response:** 201 Created

---

### GET /vehicles

Get all vehicles (own vehicles for drivers, all for admin).

**Access:** Authenticated

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### GET /vehicles/:id

Get vehicle by ID.

**Access:** Authenticated

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /vehicles/:id

Update vehicle.

**Access:** Driver/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /vehicles/:id/status

Update vehicle status.

**Access:** Admin/Driver

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "status": "ACTIVE"
}
```

**Response:** 200 OK

---

### DELETE /vehicles/:id

Delete vehicle (soft delete).

**Access:** Driver/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

## Vehicle Categories

### POST /vehicle-categories

Create vehicle category.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "name": "Sedan",
  "description": "Standard 4-seater sedan",
  "baseFare": 1000,
  "pricePerKm": 500
}
```

**Response:** 201 Created

---

### GET /vehicle-categories

Get all vehicle categories.

**Access:** Public

**Response:** 200 OK

---

### GET /vehicle-categories/:id

Get vehicle category by ID.

**Access:** Public

**Response:** 200 OK

---

### PATCH /vehicle-categories/:id

Update vehicle category.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### DELETE /vehicle-categories/:id

Delete vehicle category.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

## Rides

### POST /rides

Create a new ride.

**Access:** Driver only

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "startLocation": "Kigali City Market",
  "startLat": -1.9441,
  "startLng": 30.0619,
  "endLocation": "Kimironko Market",
  "endLat": -1.9536,
  "endLng": 30.1047,
  "estimatedFare": 5000,
  "departureTime": "2025-10-29T10:00:00Z",
  "distance": 15.5,
  "duration": 30,
  "availableSeats": 3,
  "totalSeats": 4
}
```

**Response:** 201 Created

---

### GET /rides

Get all available rides with filters.

**Access:** Authenticated

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `status` (SCHEDULED|ACTIVE|COMPLETED|CANCELLED)
- `startLocation` (string)
- `endLocation` (string)
- `minSeats` (number)
- `departureDate` (date)
- `page` (number)
- `limit` (number)

**Response:** 200 OK

---

### GET /rides/my-rides

Get driver's own rides.

**Access:** Driver only

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `status` (string)

**Response:** 200 OK

---

### GET /rides/:id

Get ride by ID.

**Access:** Authenticated

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /rides/:id

Update ride.

**Access:** Driver only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /rides/:id/status

Update ride status.

**Access:** Driver only

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "status": "ACTIVE"
}
```

**Response:** 200 OK

---

### POST /rides/:id/cancel

Cancel ride.

**Access:** Driver only

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "reason": "Vehicle maintenance"
}
```

**Response:** 200 OK

---

### DELETE /rides/:id

Delete ride (soft delete).

**Access:** Driver only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

## Ride Requests

### POST /ride-requests

Create a new ride request.

**Access:** Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "pickupLocation": "Kigali City Market",
  "pickupLat": -1.9441,
  "pickupLng": 30.0619,
  "dropoffLocation": "Kimironko Market",
  "dropoffLat": -1.9536,
  "dropoffLng": 30.1047,
  "requestedTime": "2025-10-29T10:00:00Z",
  "numberOfPassengers": 2
}
```

**Response:** 201 Created

---

### GET /ride-requests

Get all ride requests.

**Access:** Admin/Driver

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `status` (PENDING|APPROVED|REJECTED|CANCELLED)
- `page` (number)
- `limit` (number)

**Response:** 200 OK

---

### GET /ride-requests/my-requests

Get current user ride requests.

**Access:** Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### GET /ride-requests/:id

Get a specific ride request.

**Access:** Admin/Driver/Rider

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /ride-requests/:id

Update a ride request.

**Access:** Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### POST /ride-requests/:id/approve

Approve a ride request.

**Access:** Driver/Admin

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "estimatedFare": 5000,
  "estimatedArrivalTime": "2025-10-29T10:30:00Z"
}
```

**Response:** 200 OK

---

### POST /ride-requests/:id/reject

Reject a ride request.

**Access:** Driver/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### POST /ride-requests/:id/cancel

Cancel a ride request.

**Access:** Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "reason": "Change of plans"
}
```

**Response:** 200 OK

---

### DELETE /ride-requests/:id

Delete a ride request.

**Access:** Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

## Bookings

### POST /bookings

Create a new booking.

**Access:** Rider/Corporate

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "rideId": "ride-uuid",
  "seats": 2
}
```

**Response:** 201 Created

---

### GET /bookings

Get all bookings for the current user.

**Access:** Rider/Corporate

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `page` (number)
- `limit` (number)
- `status` (PENDING|CONFIRMED|CANCELLED)

**Response:** 200 OK

---

### GET /bookings/driver/bookings

Get all bookings for a driver's rides.

**Access:** Driver

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `page` (number)
- `limit` (number)
- `status` (PENDING|CONFIRMED|CANCELLED)

**Response:** 200 OK

---

### GET /bookings/:id

Get a single booking by ID.

**Access:** Rider/Corporate

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /bookings/:id

Update a booking status.

**Access:** Rider/Corporate

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "status": "CONFIRMED"
}
```

**Response:** 200 OK

---

### DELETE /bookings/:id

Delete a booking (soft delete).

**Access:** Rider/Corporate

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

## Nearby Rides

### POST /nearby-rides/search

Search for nearby rides based on user location.

**Access:** Rider/Corporate

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "latitude": -1.9441,
  "longitude": 30.0619,
  "radius": 10,
  "departureDate": "2025-10-29"
}
```

**Response:** 200 OK

---

### GET /nearby-rides/my-nearby-rides

Get current user saved nearby rides.

**Access:** Rider/Corporate

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `page` (number)
- `limit` (number)

**Response:** 200 OK

---

### GET /nearby-rides/:id

Get a single nearby ride by ID.

**Access:** Rider/Corporate

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### DELETE /nearby-rides/:id

Remove a nearby ride from saved list.

**Access:** Rider/Corporate

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

## Live Tracking

### POST /live-tracking/update-location

Update driver location.

**Access:** Driver only

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "rideId": "ride-uuid",
  "latitude": -1.9441,
  "longitude": 30.0619,
  "speed": 45,
  "bearing": 180.5
}
```

**Response:** 200 OK

---

### GET /live-tracking/ride/:rideId/latest

Get latest location for a ride.

**Access:** Driver/Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### GET /live-tracking/ride/:rideId/history

Get location history for a ride.

**Access:** Driver/Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `limit` (number, default: 10, max: 100)

**Response:** 200 OK

---

### GET /live-tracking/ride/:rideId/eta

Calculate ETA for a ride.

**Access:** Driver/Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

```json
{
  "ok": true,
  "data": {
    "rideId": "ride-uuid",
    "distanceKm": 5.8,
    "etaMinutes": 12,
    "etaWithTrafficMinutes": 15,
    "etaFormatted": "12 mins",
    "bearing": 180.5,
    "currentSpeed": 45
  }
}
```

---

### POST /live-tracking/calculate-eta

Calculate custom ETA between any two coordinates.

**Access:** Driver/Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "startLat": -1.9441,
  "startLng": 30.0619,
  "endLat": -1.9536,
  "endLng": 30.1047,
  "averageSpeed": 40
}
```

**Response:** 200 OK

---

### GET /live-tracking/ride/:rideId/trackers

Get ride trackers (list of passengers tracking this ride).

**Access:** Driver/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### POST /live-tracking/cleanup

Cleanup old tracking data.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `daysToKeep` (number, default: 7)

**Response:** 200 OK

---

## Reviews

### POST /reviews

Create a new review.

**Access:** Driver/Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "rideId": "ride-uuid",
  "rating": 5,
  "comment": "Excellent service!",
  "tags": ["punctual", "friendly"]
}
```

**Response:** 201 Created

---

### GET /reviews

Get all reviews with filters.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `userId` (string)
- `rideId` (string)
- `driverRecordId` (string)
- `minRating` (number)
- `maxRating` (number)
- `page` (number)
- `limit` (number)

**Response:** 200 OK

---

### GET /reviews/my-reviews

Get reviews by current user.

**Access:** Driver/Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### GET /reviews/driver/:driverRecordId/stats

Get driver review statistics.

**Access:** Driver/Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

```json
{
  "ok": true,
  "data": {
    "driverRecordId": "driver-uuid",
    "averageRating": 4.5,
    "totalReviews": 42,
    "ratingDistribution": {
      "5": 30,
      "4": 8,
      "3": 3,
      "2": 1,
      "1": 0
    }
  }
}
```

---

### GET /reviews/:id

Get a review by ID.

**Access:** Driver/Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### PATCH /reviews/:id

Update a review (own reviews only).

**Access:** Driver/Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Updated review"
}
```

**Response:** 200 OK

---

### DELETE /reviews/:id

Delete a review (soft delete, own reviews only).

**Access:** Driver/Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### POST /reviews/:id/flag

Flag a review for moderation.

**Access:** Driver/Rider/Admin

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "reason": "Inappropriate content"
}
```

**Response:** 200 OK

---

### PATCH /reviews/:id/moderate

Moderate a review.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "status": "APPROVED",
  "moderatorNotes": "Review approved"
}
```

**Response:** 200 OK

---

### GET /reviews/moderation/flagged

Get flagged reviews.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `status` (PENDING|APPROVED|REJECTED|FLAGGED)
- `page` (number)
- `limit` (number)

**Response:** 200 OK

---

### GET /reviews/moderation/stats

Get review moderation statistics.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

## Discounts

### POST /discounts

Create a new discount.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "code": "SAVE20",
  "description": "20% off your next ride",
  "discountType": "PERCENTAGE",
  "value": 20,
  "maxDiscount": 5000,
  "minRideAmount": 10000,
  "validFrom": "2025-01-01T00:00:00Z",
  "validTo": "2025-12-31T23:59:59Z",
  "usageLimit": 100
}
```

**Response:** 201 Created

---

### GET /discounts

Get all discounts.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `isActive` (boolean)
- `page` (number)
- `limit` (number)

**Response:** 200 OK

---

### GET /discounts/active

Get all active discounts.

**Access:** All authenticated users

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### GET /discounts/:id

Get a specific discount.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### GET /discounts/code/:code

Get discount by code.

**Access:** All authenticated users

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### POST /discounts/validate

Validate a discount code.

**Access:** All authenticated users

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "code": "SAVE20",
  "rideAmount": 15000
}
```

**Response:** 200 OK

---

### PATCH /discounts/:id

Update a discount.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### DELETE /discounts/:id

Delete a discount.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

## Analytics

### GET /analytics/driver/me

Get my driver analytics.

**Access:** Driver

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `startDate` (date)
- `endDate` (date)
- `period` (day|week|month|year)

**Response:** 200 OK

```json
{
  "ok": true,
  "data": {
    "earnings": {
      "total": 150000,
      "thisMonth": 45000
    },
    "rides": {
      "total": 120,
      "completed": 115,
      "cancelled": 5
    },
    "ratings": {
      "average": 4.5,
      "total": 98
    }
  }
}
```

---

### GET /analytics/driver/:driverId

Get driver analytics by ID.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### GET /analytics/passenger/me

Get my passenger analytics.

**Access:** Rider

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `startDate` (date)
- `endDate` (date)
- `period` (day|week|month|year)

**Response:** 200 OK

---

### GET /analytics/passenger/:passengerId

Get passenger analytics by ID.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### GET /analytics/corporate/me

Get my corporate analytics.

**Access:** Corporate

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### GET /analytics/corporate/:corporateId

Get corporate analytics by ID.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

---

### GET /analytics/platform

Get platform-wide analytics including user statistics, revenue metrics, ride data, and system insights.

**Access:** Admin only

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `period` (optional): `TODAY` | `WEEK` | `MONTH` | `YEAR` | `CUSTOM` (default: `MONTH`)
- `startDate` (optional, ISO 8601): Required if period is `CUSTOM`
- `endDate` (optional, ISO 8601): Required if period is `CUSTOM`
- `limit` (optional, number): Limit for top items (default: 10)

**Response:** 200 OK

```json
{
  "ok": true,
  "message": "Platform analytics retrieved successfully",
  "data": {
    "period": "MONTH",
    "dateRange": {
      "startDate": "2024-11-01T00:00:00.000Z",
      "endDate": "2024-12-01T00:00:00.000Z"
    },
    "users": {
      "totalUsers": 1500,
      "activeUsers": 1200,
      "newUsers": 150,
      "inactiveUsers": 300
    },
    "drivers": {
      "totalDrivers": 450,
      "activeDrivers": 380,
      "verifiedDrivers": 350,
      "pendingVerification": 100
    },
    "passengers": {
      "totalPassengers": 1050
    },
    "rides": {
      "totalRides": 5000,
      "completedRides": 4800,
      "ongoingRides": 50,
      "cancelledRides": 150,
      "completionRate": 96.0
    },
    "bookings": {
      "totalBookings": 12000,
      "confirmedBookings": 11500,
      "cancellationRate": 4.17
    },
    "revenue": {
      "totalRevenue": 15000000.0,
      "averageRevenuePerRide": 3125.0
    },
    "reviews": {
      "totalReviews": 4500,
      "averagePlatformRating": 4.6,
      "flaggedReviews": 25
    },
    "issues": {
      "totalIssues": 120,
      "resolvedIssues": 100,
      "pendingIssues": 20,
      "resolutionRate": 83.33
    },
    "insights": {
      "paymentMethods": {
        "MOMO": 8000,
        "CREDIT_CARD": 3000,
        "CASH": 1000
      },
      "topDrivers": [
        {
          "driverId": "driver-uuid",
          "driverName": "John Doe",
          "averageRating": 4.9,
          "totalRidesCompleted": 500,
          "totalEarnings": 1500000.0
        }
      ],
      "dailyActivityTrend": [
        {
          "date": "2024-11-01",
          "rides": 150
        },
        {
          "date": "2024-11-02",
          "rides": 180
        }
      ]
    }
  }
}
```

**Error Responses:**

401 Unauthorized - Invalid/expired token or not authenticated

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

403 Forbidden - User does not have ADMIN role

```json
{
  "message": "Access denied. Required role(s): ADMIN",
  "statusCode": 403
}
```

**Note:** This endpoint requires ADMIN role. Ensure your JWT token includes the ADMIN role in the `roleName` claim.

```json
{
  "ok": true,
  "data": {
    "users": {
      "total": 5000,
      "drivers": 500,
      "riders": 4500
    },
    "rides": {
      "total": 12000,
      "today": 150
    },
    "revenue": {
      "total": 25000000,
      "thisMonth": 8500000
    }
  }
}
```

---

## Common Response Codes

- **200 OK:** Request successful
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid request data
- **401 Unauthorized:** Authentication required or invalid token
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource already exists or conflicting state
- **500 Internal Server Error:** Server error

---

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer {your-jwt-token}
```

Tokens are obtained from the `/auth/login` or `/auth/register` endpoints.

---

## Pagination

Many list endpoints support pagination with the following query parameters:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

Response includes pagination metadata:

```json
{
  "ok": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "ok": false,
  "message": "Error description",
  "error": "ErrorType"
}
```

---

## Role-Based Access

- **Public:** No authentication required
- **Authenticated:** Any logged-in user
- **Driver:** Users with DRIVER role
- **Rider:** Users with RIDER role
- **Corporate:** Users with CORPORATE role
- **Admin:** Users with ADMIN role

---

For more information or support, please contact the development team.
