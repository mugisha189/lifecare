import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import TopNav from '@/components/TopNav';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { RequireHospitalAssignment } from '@/components/RequireHospitalAssignment';

interface LayoutProps {
  children: ReactNode;
}

export default function LayoutWithNav({ children }: LayoutProps) {
  return (
    <WorkspaceProvider>
      <SidebarProvider>
        <div className='flex min-h-screen w-full bg-white'>
          <AppSidebar />

          {/* Main Content Area - add left margin for sidebar */}
          <div className='flex-1 flex flex-col ml-[266px] min-w-0 bg-white'>
            {/* Fixed TopNav */}
            <header className='fixed top-0 right-0 left-[266px] h-16 bg-white border-b border-gray-200 z-40'>
              <TopNav />
            </header>

            <main className='flex-1 p-6 bg-white mt-16'>
              <RequireHospitalAssignment>{children}</RequireHospitalAssignment>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
