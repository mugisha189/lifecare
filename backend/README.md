# LifeCare Backend

A comprehensive NestJS-based ride-sharing platform with JWT authentication, role-based access control, real-time capabilities, and seamless role switching.

---

## 📋 Overview

**Tech Stack:**
- **Framework:** NestJS (Node.js v22+)
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis
- **Auth:** JWT with refresh tokens
- **Mail:** Nodemailer (Gmail/SMTP)
- **SMS:** Pindo API
- **API Docs:** Swagger/OpenAPI
- **i18n:** English, French, Kinyarwanda

**Key Features:**
- JWT authentication with access & refresh tokens
- Role-based access control (ADMIN, DRIVER, RIDER, CORPORATE)
- **Role Switching** - Users can switch between DRIVER and RIDER roles
- **Profile Management** - Create and manage driver/passenger profiles
- Global authentication guards (secure by default)
- Email notifications (password changes, account actions)
- SMS notifications (verification, password reset)
- Rate limiting and request logging
- Multi-language support
- Soft delete and activity tracking
- Comprehensive analytics for all user types
- Real-time live tracking
- Vehicle management with driver association

---

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
yarn install

# Copy environment file
cp .env.example .env
```

### 2. Environment Setup

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lifecare"

# Server
PORT=3000
NODE_ENV=development
HOST=localhost
CORS_ORIGIN=*

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600

# JWT (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Mail Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_FROM="LifeCare <your-email@gmail.com>"

# SMS Configuration (Pindo)
PINDO_API_KEY=your-pindo-api-key
PINDO_API_URL=https://api.pindo.io/v1

# Client Configuration
CLIENT_URL=http://localhost:3000

# Push Notifications (OneSignal - Optional)
ONESIGNAL_APP_ID=your-onesignal-app-id
ONESIGNAL_API_KEY=your-onesignal-api-key

# Admin User (for seeding)
ADMIN_EMAIL=admin@lifecare.com
ADMIN_PASSWORD=SecurePassword123!
ADMIN_NAME=System Administrator
ADMIN_PHONE=+250788000000
ADMIN_CITY=Kigali
ADMIN_COUNTRY=Rwanda
```

### 3. Database Setup

```bash
# Generate Prisma Client
yarn prisma:generate

# Run migrations
yarn prisma:migrate

# Seed database with roles and admin user
yarn prisma:seed
```

### 4. Start Application

```bash
# Development mode (hot-reload)
yarn start:dev

# Production build
yarn build && yarn start:prod
```

**API will be available at:**
- API: `http://localhost:3000/api/v1`
- Swagger Docs: `http://localhost:3000/api/docs`
- Health Check: `http://localhost:3000/health`

---

## 📁 Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── decorators/          # @Public(), @Roles(), @CurrentUser()
│   ├── guards/              # JWT & Roles guards (global)
│   ├── strategies/          # Passport strategies
│   ├── middleware/          # Auth logging & rate limiting
│   └── dto/                 # Login, Register, RefreshToken, SwitchRole DTOs
│
├── users/                   # User management
├── roles/                   # Role management
├── driver-profiles/         # Driver profile management
├── passenger-profiles/      # Passenger profile management
├── corporate-profiles/      # Corporate profile management
├── vehicles/                # Vehicle management (includes driver user info)
├── vehicle-categories/      # Vehicle category management
├── rides/                   # Ride management
├── bookings/                # Booking management
├── reviews/                 # Review and rating system
├── analytics/               # Analytics for all user types
├── mail/                    # Email service (Nodemailer)
├── sms-service/             # SMS service (Pindo)
├── devices/                 # Device registration for push notifications
├── currencies/              # Currency management
├── discounts/               # Discount and promo code management
├── issues/                  # Issue reporting and management
├── live-tracking/           # Real-time location tracking
├── nearby-rides/            # Find rides near location
├── ride-requests/           # Ride request management
├── prisma/                  # Prisma service
├── redis/                   # Redis service
├── i18n/                    # Translations (en, fr, rw)
├── config/                  # Configuration loader
├── assets/                  # Static assets (logo.png)
├── types/                   # Shared TypeScript types
└── common/                  # Common helpers (RoleContextHelper)

prisma/
├── schema.prisma            # Database schema
├── migrations/              # Database migrations
└── seed.ts                  # Database seeding
```

---

## 🔐 Authentication & Authorization

### System Design

**Global Guards (Secure by Default):**
- All routes require authentication unless marked with `@Public()`
- Role checks automatically applied with `@Roles()` decorator
- No need to manually add guards to controllers

### Authentication Endpoints

#### Public Endpoints
```
POST   /api/v1/auth/register    # User registration
POST   /api/v1/auth/login       # Login (email or phone)
POST   /api/v1/auth/refresh     # Refresh access token
GET    /api/v1/roles            # List available roles
GET    /health                  # Health check
```

#### Protected Endpoints
```
POST   /api/v1/auth/logout      # Logout & revoke tokens
GET    /api/v1/auth/me          # Get current user with available roles
PATCH  /api/v1/auth/me          # Update profile
POST   /api/v1/auth/change-password  # Change password
GET    /api/v1/auth/profile-status   # Check profile status
POST   /api/v1/auth/switch-role      # Switch between DRIVER/RIDER roles
```

### Usage Examples

#### Register a User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+250788123456",
    "password": "SecurePass123!",
    "roleId": "<role-id>",
    "gender": "MALE",
    "country": "Rwanda",
    "city": "Kigali",
    "preferredLanguage": "EN"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "ok": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "...", "role": {...} },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 3600
  }
}
```

#### Use Protected Endpoint
```bash
curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <access-token>"
```

### Code Usage

#### Protected Route (Authenticated Users)
```typescript
@Controller('rides')
export class RidesController {
  // Any authenticated user can access (global guard applies)
  @Get('my-rides')
  getMyRides(@CurrentUser('sub') userId: string) {
    return this.ridesService.findByUser(userId);
  }
}
```

#### Role-Based Protection
```typescript
@Controller('admin')
export class AdminController {
  // Only ADMIN role can access
  @Roles('ADMIN')
  @Get('dashboard')
  getDashboard() {
    return { message: 'Admin dashboard' };
  }

  // Multiple roles allowed
  @Roles('ADMIN', 'CORPORATE')
  @Get('reports')
  getReports() {
    return this.reportsService.findAll();
  }
}
```

#### Public Route
```typescript
@Controller('public')
export class PublicController {
  // Bypass authentication
  @Public()
  @Get('info')
  getPublicInfo() {
    return { message: 'Public information' };
  }
}
```

#### Get Current User
```typescript
@Get('profile')
getProfile(@CurrentUser() user) {
  // user = { sub, email, roleId, roleName }
  return user;
}

// Get specific property
@Get('email')
getUserEmail(@CurrentUser('email') email: string) {
  return { email };
}
```

---

## 🔄 Role Switching & Profile Management

### Overview

Users can seamlessly switch between **DRIVER** and **RIDER** roles when they have both profiles. This enables flexible use of the platform - drive in the morning, ride in the evening!

### Key Concepts

**One Account, Multiple Profiles:**
- Single user account with email/phone
- Optional driver profile (for offering rides)
- Optional passenger profile (for booking rides)
- Switch roles anytime based on needs

**Data Architecture:**
- Driver data linked via `driverProfileId` (rides, vehicles, earnings)
- Passenger data linked via `userId` (bookings, ride requests, spending)
- All history preserved regardless of current role
- No data duplication or conflicts

### Profile Status Endpoint

**GET `/api/v1/auth/profile-status`**

Check which profiles exist, their status, and available actions.

**Response Example:**
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

### Role Switching

**POST `/api/v1/auth/switch-role`**

Switch between DRIVER and RIDER roles.

**Request:**
```json
{
  "role": "DRIVER"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Role switched successfully to DRIVER",
  "data": {
    "role": { "id": "...", "name": "DRIVER" },
    "accessToken": "new-jwt-token",
    "refreshToken": "new-refresh-token",
    "expiresIn": 3600
  }
}
```

**Validation Rules:**
- **To switch to DRIVER:** Must have driver profile with status ACTIVE, INACTIVE, or ON_BREAK
- **To switch to RIDER:** Must have passenger profile
- Cannot switch if already in requested role
- Cannot switch if driver profile is PENDING_APPROVAL or SUSPENDED
- All existing refresh tokens are revoked for security

### Profile Creation

**Create Driver Profile:**
**POST `/api/v1/driver-profiles/create-my-profile`**

Works regardless of current role. Profile status will be `PENDING_APPROVAL` until admin approves.

**Create Passenger Profile:**
**POST `/api/v1/passenger-profiles/create-my-profile`**

Works regardless of current role. Profile is immediately active - no approval needed.

### Complete User Journey

1. **New User:** Register → Check profile status → Create missing profiles
2. **Driver Approval:** Create driver profile → Wait for admin approval → Can switch to DRIVER
3. **Daily Use:** Switch to DRIVER → Offer rides → Switch to RIDER → Book rides

---

## 🗄️ Database Schema

### Key Models

- **User** - User accounts with authentication
- **Role** - User roles (ADMIN, DRIVER, RIDER, CORPORATE)
- **DriverProfile** - Driver-specific data (linked via userId)
- **PassengerProfile** - Passenger-specific data (linked via userId)
- **CorporateProfile** - Corporate account data
- **Vehicle** - Vehicles (linked via driverProfileId, includes driver user info)
- **Ride** - Rides offered by drivers (linked via driverProfileId)
- **Booking** - Rides booked by passengers (linked via userId)
- **RefreshToken** - Active refresh tokens
- **UserActivity** - User action logs (login, logout, etc.)
- **SuspensionHistory** - Account suspension tracking

### Data Relationships

**Driver Data (uses driverProfileId):**
- Rides → `driverProfileId`
- Vehicles → `driverProfileId` (includes driver user info)
- DriverDocuments → `driverProfileId`
- LiveTracking → `driverProfileId`

**Passenger Data (uses userId):**
- Bookings → `userId`
- RideRequests → `userId`
- Reviews → `userId`

**Key Insight:** When a user switches roles, they're not creating a new account - they're changing which profile context is active. All data remains intact and separate!

### Roles

Seeded roles:
- **ADMIN** - Full system access
- **DRIVER** - Offer rides
- **RIDER** - Book rides (passenger)
- **CORPORATE** - Business accounts

### Prisma Commands

```bash
# Open database GUI
yarn prisma:studio

# Create migration after schema changes
yarn prisma:migrate

# Generate TypeScript types
yarn prisma:generate

# Reset database (development only)
yarn prisma:reset
```

---

## 🛡️ Security Features

- **Password Hashing:** bcrypt (10 rounds)
- **JWT Tokens:** Access (1h) + Refresh (7d)
- **Token Rotation:** Refresh tokens are single-use
- **Token Revocation:** Stored in database, can be invalidated
- **Role Switching Security:** All refresh tokens revoked on role switch
- **Rate Limiting:** 5 requests per 15 minutes on auth endpoints
- **Account Protection:** Suspension, activation, soft delete
- **Activity Logging:** Tracks login, logout, signup events
- **Global Guards:** All routes protected by default

---

## 📜 Available Scripts

### Development
```bash
yarn start:dev           # Hot-reload development
yarn start:debug         # Debug mode
yarn build               # Build for production
yarn start:prod          # Run production build
```

### Code Quality
```bash
yarn lint                # Lint and fix with ESLint
yarn format              # Format code with Prettier
```

### Database (Prisma)
```bash
yarn prisma:generate     # Generate Prisma Client
yarn prisma:migrate      # Create & apply migration
yarn prisma:studio       # Open Prisma Studio GUI
yarn prisma:seed         # Seed database
yarn prisma:reset        # Reset database (WARNING: deletes data)
yarn db:push             # Push schema without migration (dev only)
```

---

## 🌍 Internationalization

Languages supported: **English**, **French**, **Kinyarwanda**

Set language via:
```
Header: x-language: en
Header: accept-language: en
Query: ?lang=en
```

---

## 📧 Mail and SMS Services

### Mail Service

Email notifications using Nodemailer with support for Gmail/SMTP.

**Location:** `src/mail/`

**Email Types:**
- Welcome email (new user registration)
- Email verification (with verification code)
- Password reset (with reset link)
- Account suspension notification
- Account unsuspension notification
- Password changed confirmation

**Configuration:**

Add to your `.env`:
```env
# Mail Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM="LifeCare <your-email@gmail.com>"
```

**Gmail Setup:**
1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `MAIL_PASSWORD`

**Features:**
- Professional HTML email templates
- Logo embedding (place at `src/assets/logo.png`)
- Multi-language support (EN, FR, RW)
- Automatic email sending on password changes and account actions

### SMS Service

SMS notifications using Pindo API for Rwanda.

**Location:** `src/sms-service/`

**SMS Types:**
- Verification code SMS
- Password reset code SMS
- Ride notifications

**Configuration:**

Add to your `.env`:
```env
# SMS Configuration (Pindo)
PINDO_API_KEY=your-pindo-api-key
PINDO_API_URL=https://api.pindo.io/v1
```

**Get API Key:**
1. Sign up at https://pindo.io
2. Navigate to API section
3. Copy your API key

**Features:**
- Integration with Pindo API
- Multi-language SMS messages
- Proper error handling and logging
- Non-blocking (failures don't interrupt operations)

---

## 📱 Device Management

The Devices module manages device registrations for push notifications using OneSignal.

**Key Endpoints:**
- `POST /devices` - Register or update device
- `GET /devices/user/:userId` - Get all user devices
- `DELETE /devices/:id` - Soft delete device
- `DELETE /devices/unsubscribe/:userId` - Unsubscribe all user devices

**Features:**
- Automatic device registration on login
- Automatic unsubscription on logout
- Supports iOS, Android, and Web
- OneSignal Player ID integration

**See:** `src/devices/README.md` for complete mobile app integration guide

---

## 💰 Currency Management

Complete CRUD operations for managing currencies.

**Key Endpoints:**
- `GET /currencies` - Get all currencies (filter by isActive)
- `POST /currencies` - Create currency (Admin only)
- `PATCH /currencies/:id` - Update currency (Admin only)
- `PATCH /currencies/:id/activate` - Activate currency (Admin only)
- `PATCH /currencies/:id/deactivate` - Deactivate currency (Admin only)
- `DELETE /currencies/:id` - Delete currency (Admin only, soft delete)

**Features:**
- Multi-language support
- Protection against deleting currencies in use
- Activate/deactivate functionality

**See:** `src/currencies/README.md` for complete documentation

---

## 📊 Analytics

Comprehensive analytics for drivers, passengers, corporate accounts, and platform-wide metrics.

**Endpoints:**
- `GET /analytics/driver/me` - Driver analytics (DRIVER role)
- `GET /analytics/driver/:driverId` - Driver analytics by ID (ADMIN only)
- `GET /analytics/passenger/me` - Passenger analytics (RIDER role)
- `GET /analytics/passenger/:passengerId` - Passenger analytics by ID (ADMIN only)
- `GET /analytics/corporate/me` - Corporate analytics (CORPORATE role)
- `GET /analytics/corporate/:corporateId` - Corporate analytics by ID (ADMIN only)
- `GET /analytics/platform` - Platform-wide analytics (ADMIN only)

**Query Parameters:**
- `period`: `TODAY` | `WEEK` | `MONTH` | `YEAR` | `CUSTOM`
- `startDate`: Required if period is `CUSTOM` (ISO 8601)
- `endDate`: Required if period is `CUSTOM` (ISO 8601)
- `limit`: Limit for top items (default: 10)

**Platform Analytics Includes:**
- User statistics (total, active, new users)
- Driver statistics (total, active, verified)
- Ride statistics (total, completed, ongoing, cancelled)
- Revenue metrics
- Review statistics
- Issue tracking
- Payment method breakdown
- Top performing drivers
- Daily activity trends

---

## 🔧 Common Tasks

### Activate Admin User

After seeding, activate admin via Prisma Studio:
```bash
yarn prisma:studio
# Navigate to User table → Find admin → Set active = true
```

Or regenerate with updated seed:
```bash
yarn prisma:reset  # Resets and re-seeds with active admin
```

### Generate JWT Secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Reset Database

```bash
yarn prisma:reset  # Deletes all data, re-runs migrations and seed
```

### Check Database Connection

```bash
npx prisma db pull
```

---

## 🛠️ Troubleshooting

**Prisma Client Not Found:**
```bash
yarn prisma:generate
```

**Port Already in Use:**
```bash
# Change PORT in .env
PORT=3001
```

**Login Error: "Account is inactive":**
- Activate user in Prisma Studio or re-seed database

**JWT Token Invalid:**
- Check JWT_SECRET in .env matches
- Ensure token hasn't expired
- Verify Authorization header format: `Bearer <token>`

**Rate Limit Exceeded:**
- Redis must be running
- Clear rate limit: `redis-cli DEL rate-limit:auth:<ip>`

**401 Unauthorized on Analytics:**
- Ensure you have ADMIN role
- Verify JWT token includes correct roleName
- Check that guards are properly configured (should use global guards)

---

## 📚 API Documentation

**Swagger UI:** `http://localhost:3000/api/docs`

**Complete API Reference:** See `API_DOCUMENTATION.md` for detailed endpoint documentation including:
- All authentication endpoints
- Role switching and profile management
- User, driver, and passenger profile endpoints
- Vehicle management (with driver user information)
- Rides, bookings, and ride requests
- Analytics endpoints
- And much more!

Features:
- Interactive API testing
- Request/response examples
- Authentication with Bearer token
- Multi-language error messages

---

## 🐳 Docker (Optional)

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app
```

---

## 🎯 Best Practices Implemented

✅ **Security**
- Global authentication guards (secure by default)
- JWT with refresh token rotation
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Activity logging
- Token revocation on role switch

✅ **Architecture**
- Separation of concerns (Auth vs Users modules)
- User registration only through `/auth/register`
- Modular, scalable design
- Role-aware data access helpers

✅ **Code Quality**
- TypeScript for type safety
- Comprehensive DTOs with validation
- Clean, documented code
- Proper error handling

✅ **Developer Experience**
- Swagger documentation
- Multi-language support
- Clear error messages
- Comprehensive README

✅ **Data Management**
- One user account, multiple profiles
- Proper foreign key relationships
- Data isolation between roles
- Complete history preservation

---

## 📝 Future Enhancements

- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Multi-factor authentication (MFA)
- [ ] OAuth integration (Google, Facebook)
- [ ] Account lockout after failed attempts
- [ ] Device management and fingerprinting
- [ ] Session management dashboard
- [ ] Email queue system (Bull) for better performance
- [ ] SMS delivery tracking and reporting
- [ ] Role switch history tracking
- [ ] Scheduled role switching

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review `API_DOCUMENTATION.md` for complete API reference
3. Review Swagger documentation at `/api/docs`
4. Check NestJS docs: https://docs.nestjs.com
5. Check Prisma docs: https://www.prisma.io/docs

---

**Built with NestJS, Prisma, and PostgreSQL** 🚀
