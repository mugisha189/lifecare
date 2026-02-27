// routes/index.tsx
import AuthGuard, { PublicOnlyRoute } from '@/authGuard';
import RoleGuard from '@/components/RoleGuard';
import { Navigate, type RouteObject } from 'react-router-dom';

import RootRedirect from '@/components/RootRedirect';
import LoginPage from '@/pages/Authentication/Login';
import ResetPasswordPage from '@/pages/Authentication/ResetPassword';
import DashboardPage from '@/pages/Dashboard';
import UsersPage from '@/pages/Users';
import SettingsPage from '@/pages/Settings';
import ConsultationsPage from '@/pages/Consultations';
import ConsultationDetails from '@/pages/Consultations/ConsultationDetails';
import DoctorProfilesPage from '@/pages/driver-profiles';
import PrescriptionsPage from '@/pages/Prescriptions';
import PrescriptionRecordPage from '@/pages/Prescriptions/PrescriptionRecordPage';
import MedicinesPage from '@/pages/Medicines';
import LabTestsPage from '@/pages/LabTests';
import LabTestDetailPage from '@/pages/LabTests/LabTestDetailPage';
import LabTestTypesPage from '@/pages/LabTestTypes';
import HospitalsPage from '@/pages/Hospitals';
import HospitalDetails from '@/pages/Hospitals/HospitalDetails';
import PharmaciesPage from '@/pages/Pharmacies';
import PharmacyDetails from '@/pages/Pharmacies/PharmacyDetails';
import PharmacyInventoryPage from '@/pages/PharmacyInventory';
import InsuranceProvidersPage from '@/pages/InsuranceProviders';

const routes: RouteObject[] = [
  { path: '/', element: <RootRedirect /> },

  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: <PublicOnlyRoute />,
        children: [{ path: '', element: <LoginPage /> }],
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },

  {
    path: '/dashboard',
    element: <AuthGuard />, // Blocks PATIENT role automatically
    children: [
      { path: '', element: <DashboardPage /> }, // All dashboard roles can access
      { path: 'settings', element: <SettingsPage /> }, // All dashboard roles can access
      
      // Admin-only routes
      {
        path: 'users',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <UsersPage />
          </RoleGuard>
        ),
      },
      {
        path: 'doctors',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <DoctorProfilesPage />
          </RoleGuard>
        ),
      },
      // Keep old route for backward compatibility
      {
        path: 'driver-profiles',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <Navigate to='/dashboard/doctors' replace />
          </RoleGuard>
        ),
      },
      {
        path: 'hospitals',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <HospitalsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'hospitals/:id',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <HospitalDetails />
          </RoleGuard>
        ),
      },
      {
        path: 'pharmacies',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <PharmaciesPage />
          </RoleGuard>
        ),
      },
      {
        path: 'pharmacies/:id',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <PharmacyDetails />
          </RoleGuard>
        ),
      },
      {
        path: 'pharmacy-inventory',
        element: (
          <RoleGuard allowedRoles={['PHARMACIST']}>
            <PharmacyInventoryPage />
          </RoleGuard>
        ),
      },
      {
        path: 'insurance-providers',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <InsuranceProvidersPage />
          </RoleGuard>
        ),
      },
      
      // Consultations routes - List and Details for Admin and Doctor
      {
        path: 'consultations',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'DOCTOR']}>
            <ConsultationsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'consultations/:id',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'DOCTOR']}>
            <ConsultationDetails />
          </RoleGuard>
        ),
      },
      
      // Old rides routes (redirect to consultations for backward compatibility)
      {
        path: 'rides',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'DOCTOR']}>
            <Navigate to='/dashboard/consultations/history' replace />
          </RoleGuard>
        ),
      },
      {
        path: 'rides/ride_analytics',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'DOCTOR']}>
            <Navigate to='/dashboard/consultations/history' replace />
          </RoleGuard>
        ),
      },
      {
        path: 'rides/fleet',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'DOCTOR']}>
            <Navigate to='/dashboard/consultations/schedule' replace />
          </RoleGuard>
        ),
      },
      {
        path: 'rides/history',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'DOCTOR']}>
            <Navigate to='/dashboard/consultations/history' replace />
          </RoleGuard>
        ),
      },
      
      // Prescriptions routes - Admin, Doctor, and Pharmacist
      {
        path: 'prescriptions',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'DOCTOR', 'PHARMACIST']}>
            <PrescriptionsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'prescriptions/record',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'PHARMACIST']}>
            <PrescriptionRecordPage />
          </RoleGuard>
        ),
      },
      
      // Lab Test Types - Admin only
      {
        path: 'lab-test-types',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <LabTestTypesPage />
          </RoleGuard>
        ),
      },
      // Lab Tests routes - Admin, Doctor, and Lab Staff
      {
        path: 'lab-tests',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'DOCTOR', 'LABORATORY_STAFF']}>
            <LabTestsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'lab-tests/:id',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'DOCTOR', 'LABORATORY_STAFF']}>
            <LabTestDetailPage />
          </RoleGuard>
        ),
      },
      
      // Medicines routes - Admin and Pharmacist
      {
        path: 'medicines',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'PHARMACIST']}>
            <MedicinesPage />
          </RoleGuard>
        ),
      },
      // Keep old route for backward compatibility
      {
        path: 'vehicles',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'PHARMACIST']}>
            <Navigate to='/dashboard/medicines' replace />
          </RoleGuard>
        ),
      },
    ],
  },

  { path: '*', element: <Navigate to='/' replace /> },
];

export default routes;
