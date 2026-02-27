# LifeCare Dashboard

A modern, feature-rich admin dashboard for managing the LifeCare transportation platform. Built with React, TypeScript,
and Tailwind CSS, this dashboard provides comprehensive tools for managing users, vehicles, rides, payments, and
analytics.

## Features

### Core Functionality

- **User Management**: Complete CRUD operations for users, including activation, suspension, and activity tracking
- **Vehicle Management**: Register, update, and manage vehicles with approval/rejection workflows
- **Ride Management**: Monitor rides, fleet analytics, and ride history
- **Payment Processing**: Track payments and transactions
- **Analytics Dashboard**: Real-time insights with charts and statistics
- **Driver Profiles**: Manage driver profiles and verification status
- **Reviews & Ratings**: Monitor and moderate user reviews
- **Discount Management**: Create and manage promotional discounts
- **Issue Tracking**: Handle and resolve platform issues
- **Transaction Management**: Monitor top-ups and transactions

### User Experience

- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Authentication**: Secure login, signup, and password reset flows
- **Network Status**: Real-time network connectivity monitoring
- **Protected Routes**: Role-based access control with authentication guards

## Tech Stack

### Core

- **React 19.2.0**: Modern React with latest features
- **TypeScript**: Type-safe development
- **Vite 7.2.2**: Fast build tool and dev server

### UI & Styling

- **Tailwind CSS 4.1.17**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icon library
- **Recharts**: Data visualization library

### State Management & Data Fetching

- **TanStack Query (React Query) 5.90.10**: Powerful data synchronization
- **Axios 1.13.2**: HTTP client for API requests

### Routing & Forms

- **React Router DOM 7.9.5**: Client-side routing
- **React Hook Form 7.66.0**: Performant form management

### Utilities

- **date-fns 4.1.0**: Date manipulation and formatting
- **jwt-decode 4.0.0**: JWT token decoding
- **js-cookie 3.0.5**: Cookie management
- **sonner 2.0.7**: Toast notifications

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **Yarn** (v1.22.22+ as specified in package.json)
- **Git**

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd lifecare-dashboard-v1
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory (if needed):

   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Start the development server**

   ```bash
   yarn dev
   ```

   The application will be available at `http://localhost:5173` (or the port specified by Vite).

## Available Scripts

- **`yarn dev`**: Start the development server with hot module replacement
- **`yarn build`**: Build the application for production (TypeScript compilation + Vite build)
- **`yarn preview`**: Preview the production build locally
- **`yarn lint`**: Run ESLint to check code quality
- **`yarn format`**: Format code using Prettier

## Project Structure

```
lifecare-dashboard-v1/
├── src/
│   ├── assets/              # Static assets (images, logos)
│   ├── authGuard/           # Authentication guard components
│   ├── components/          # Reusable UI components
│   │   ├── charts/          # Chart components
│   │   ├── ui/              # Base UI components (shadcn/ui)
│   │   └── ...              # Other components
│   ├── context/             # React context providers
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.tsx      # Authentication hook
│   │   ├── useDashboard.ts  # Dashboard data hook
│   │   ├── useUsers.ts      # User management hook
│   │   ├── useVehicle.ts    # Vehicle management hook
│   │   └── ...              # Other hooks
│   ├── lib/                 # Utility libraries
│   │   ├── api.ts           # API endpoint definitions
│   │   ├── apiClient.ts     # Axios client configuration
│   │   ├── queryClient.ts   # React Query client setup
│   │   ├── storage.ts       # Local storage utilities
│   │   └── utils.ts         # General utilities
│   ├── pages/               # Page components
│   │   ├── authentication/  # Login, Signup, Reset Password
│   │   ├── Dashboard.tsx    # Main dashboard page
│   │   ├── users/           # User management pages
│   │   ├── vehicles/        # Vehicle management pages
│   │   ├── rides/           # Ride management pages
│   │   ├── payments/        # Payment pages
│   │   ├── settings/        # Settings page
│   │   └── ...              # Other pages
│   ├── routes/              # Route configuration
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Public static files
├── dist/                    # Production build output
├── API_DOCUMENTATION.md     # Complete API documentation
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## Authentication

The dashboard uses JWT-based authentication. Key authentication features:

- **Login/Signup**: Email and password or Google OAuth
- **Password Reset**: OTP-based password reset flow
- **Token Management**: Automatic token refresh
- **Protected Routes**: Routes are protected by `AuthGuard` component
- **Role-Based Access**: Different access levels for admin, driver, and rider roles

## Key Pages

### Dashboard

- Platform-wide analytics and statistics
- Revenue and user metrics
- Ride statistics with charts
- Filterable by date range and period

### Users

- View all users with pagination
- Create, update, and delete users
- Activate/deactivate accounts
- Suspend/unsuspend users
- View user activity logs
- Send SMS notifications

### Vehicles

- Register and manage vehicles
- Approve/reject vehicle registrations
- Update vehicle status
- View vehicle details
- Manage vehicle categories

### Rides

- Ride analytics and statistics
- Fleet management
- Ride history
- Filter and search rides

### Payments & Transactions

- Payment tracking
- Transaction history
- Top-up management

### Settings

- User profile management
- Password change
- Account settings

## API Integration

The dashboard integrates with the LifeCare backend API. All API endpoints are defined in `src/lib/api.ts` and use a
centralized `apiClient` configured in `src/lib/apiClient.ts`.

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Base URL

The API base URL can be configured in the environment variables or in the API client configuration.

## UI Components

The project uses a combination of:

- **Radix UI**: For accessible, unstyled components
- **Custom Components**: Built on top of Radix UI with Tailwind CSS
- **Recharts**: For data visualization (pie charts, bar charts, etc.)

All UI components are located in `src/components/ui/` and follow the shadcn/ui pattern.

## Custom Hooks

The project includes several custom hooks for data management:

- **`useAuth`**: Authentication state and methods
- **`useDashboard`**: Dashboard analytics data
- **`useUsers`**: User management operations
- **`useVehicle`**: Vehicle management operations
- **`useSettings`**: User settings management
- **`useMobile`**: Mobile device detection
- **`useNetwork`**: Network connectivity status

All hooks use React Query for efficient data fetching, caching, and state management.

## Building for Production

1. **Build the application**

   ```bash
   yarn build
   ```

2. **Preview the production build**
   ```bash
   yarn preview
   ```

The production build will be output to the `dist/` directory.

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in `vite.config.ts` or use a different port via CLI: `yarn dev --port 3001`

2. **API connection errors**
   - Verify the API base URL is correct
   - Check if the backend server is running
   - Verify CORS settings on the backend

3. **TypeScript errors**
   - Run `yarn build` to check for type errors
   - Ensure all dependencies are installed: `yarn install`

## Code Style

The project uses:

- **ESLint**: For code linting
- **Prettier**: For code formatting
- **TypeScript**: For type safety

Run `yarn format` to format all code according to the project's Prettier configuration.

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure code passes linting: `yarn lint`
4. Format code: `yarn format`
5. Submit a pull request

## License

[Specify your license here]

## Support

For issues, questions, or contributions, please contact the development team or open an issue in the repository.

---

**Built for LifeCare**
