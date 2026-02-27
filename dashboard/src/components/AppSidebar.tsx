import { Logo } from '@/assets';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Settings,
  UsersRound,
  ChevronRight,
  Stethoscope,
  Pill,
  FlaskConical,
  Building2,
  Shield,
  ClipboardList,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useRole';
import type { UserRole } from '@/hooks/useRole';
import { useWorkspaceOptional } from '@/context/WorkspaceContext';

// Menu items with nested structure - Healthcare Dashboard (for Doctors, Pharmacists, Lab Staff, Admin)
// Each item includes allowedRoles array - empty array means all dashboard roles can access
interface MenuItem {
  title: string;
  url: string;
  icon: any;
  children?: MenuItem[];
  allowedRoles?: UserRole[]; // If undefined, accessible to all dashboard roles
}

const allMenuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Users', url: '/dashboard/users', icon: UsersRound, allowedRoles: ['ADMIN'] },
  { title: 'Hospitals', url: '/dashboard/hospitals', icon: Building2, allowedRoles: ['ADMIN'] },
  { title: 'Pharmacies', url: '/dashboard/pharmacies', icon: Pill, allowedRoles: ['ADMIN'] },
  { title: 'Insurance Providers', url: '/dashboard/insurance-providers', icon: Shield, allowedRoles: ['ADMIN'] },
  { title: 'Lab Test Types', url: '/dashboard/lab-test-types', icon: ClipboardList, allowedRoles: ['ADMIN'] },
  { title: 'Consultations', url: '/dashboard/consultations', icon: Stethoscope, allowedRoles: ['ADMIN', 'DOCTOR'] },
  { title: 'Prescriptions', url: '/dashboard/prescriptions', icon: Pill, allowedRoles: ['ADMIN', 'PHARMACIST'] },
  { title: 'Lab Tests', url: '/dashboard/lab-tests', icon: FlaskConical, allowedRoles: ['ADMIN', 'LABORATORY_STAFF'] },
  { title: 'Medicines', url: '/dashboard/medicines', icon: Pill, allowedRoles: ['ADMIN'] },
  { title: 'My Inventory', url: '/dashboard/pharmacy-inventory', icon: Pill, allowedRoles: ['PHARMACIST'] },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const userRole = useUserRole();
  const workspace = useWorkspaceOptional();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const showHospitalToggle = (userRole === 'DOCTOR' || userRole === 'LABORATORY_STAFF') && workspace;
  const showPharmacyToggle = userRole === 'PHARMACIST' && workspace;

  // Filter menu items based on user role
  const items = allMenuItems.filter(item => {
    // If no allowedRoles specified, item is accessible to all dashboard roles
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true;
    }
    
    // If user has no role, show nothing
    if (!userRole) {
      return false;
    }

    // Check if user role is in allowed roles
    return item.allowedRoles.includes(userRole);
  }).map(item => {
    // Filter children as well if they exist
    if (item.children) {
      return {
        ...item,
        children: item.children.filter(child => {
          if (!child.allowedRoles || child.allowedRoles.length === 0) {
            return true;
          }
          return userRole ? child.allowedRoles.includes(userRole) : false;
        }),
      };
    }
    return item;
  });

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => (prev.includes(title) ? prev.filter(item => item !== title) : [...prev, title]));
  };

  const isActive = (url: string) => location.pathname === url;
  const isParentActive = (item: (typeof items)[0]) => {
    if (!item.children) return false;
    return item.children.some(child => isActive(child.url));
  };

  // Automatically expand dropdowns when their children are active
  useEffect(() => {
    const activeParents = items
      .filter(item => {
        if (!item.children) return false;
        return item.children.some(child => location.pathname === child.url);
      })
      .map(item => item.title);

    setExpandedItems(prev => {
      const newExpanded = [...new Set([...prev, ...activeParents])];
      return newExpanded;
    });
  }, [location.pathname]);

  return (
    <div className='fixed left-0 top-0 h-screen w-[266px] bg-white z-50'>
      <Sidebar collapsible='none' className='h-full w-full bg-transparent border-0'>
        <SidebarContent className='flex flex-col h-full pt-3 pb-3 pl-3'>
          {/* Inner gray rounded container with padding */}
          <div className='flex flex-col h-full bg-gray-100 rounded-2xl pt-5 pb-5 px-2'>
            <div className='px-3 pb-2'>
              <img src={Logo} alt='LIFECARE Logo' className='w-[130px] h-auto' />
            </div>

            {showHospitalToggle && (
              <div className='px-3 pb-3'>
                <label className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block'>
                  Hospital
                </label>
                <Select
                  value={workspace.hospitalId ?? ''}
                  onValueChange={(v) => workspace.setHospitalId(v || null)}
                  disabled={workspace.isLoadingHospitals}
                >
                  <SelectTrigger className='h-9 text-sm bg-white border-gray-200'>
                    <SelectValue placeholder='Select hospital' />
                  </SelectTrigger>
                  <SelectContent>
                    {workspace.hospitals.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showPharmacyToggle && (
              <div className='px-3 pb-3'>
                <label className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block'>
                  Pharmacy
                </label>
                <Select
                  value={workspace.pharmacyId ?? ''}
                  onValueChange={(v) => workspace.setPharmacyId(v || null)}
                  disabled={workspace.isLoadingPharmacies}
                >
                  <SelectTrigger className='h-9 text-sm bg-white border-gray-200'>
                    <SelectValue placeholder='Select pharmacy' />
                  </SelectTrigger>
                  <SelectContent>
                    {workspace.pharmacies.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <SidebarGroup className='flex-1 overflow-y-auto scrollbar-hidden'>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map(item => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedItems.includes(item.title);
                    const itemActive = isActive(item.url) || isParentActive(item);

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={hasChildren ? '#' : item.url}
                            onClick={e => {
                              if (hasChildren) {
                                e.preventDefault();
                                toggleExpanded(item.title);
                              }
                            }}
                            className={`group flex items-center gap-2 px-3 py-1.5 py-5 rounded-lg relative transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                              ${itemActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-primary/5 hover:text-primary'}`}
                          >
                            {/* Left primary indicator - full height border */}
                            {itemActive && (
                              <span className='absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]' />
                            )}

                            <item.icon
                              className={`w-6 h-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                                itemActive
                                  ? 'stroke-primary text-primary'
                                  : 'stroke-gray-500 text-gray-500 group-hover:stroke-primary group-hover:text-primary'
                              }`}
                            />
                            <span
                              className={`font-medium text-base flex-1 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                                itemActive ? 'text-primary' : 'text-gray-700 group-hover:text-primary'
                              }`}
                            >
                              {item.title}
                            </span>

                            {/* Chevron for expandable items */}
                            {hasChildren && (
                              <ChevronRight
                                className={`w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'rotate-90' : ''} ${
                                  itemActive
                                    ? 'stroke-primary text-primary'
                                    : 'stroke-gray-500 text-gray-500 group-hover:stroke-primary group-hover:text-primary'
                                }`}
                              />
                            )}
                          </Link>
                        </SidebarMenuButton>

                        {/* Submenu */}
                        {hasChildren && (
                          <div
                            className='grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]'
                            style={{
                              gridTemplateRows: isExpanded ? '1fr' : '0fr',
                              transition: 'grid-template-rows 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          >
                            <div className='overflow-hidden'>
                              <SidebarMenuSub className='mt-0'>
                                {item.children.map(child => {
                                  const childActive = isActive(child.url);

                                  return (
                                    <SidebarMenuSubItem key={child.title}>
                                      <SidebarMenuSubButton asChild>
                                        <Link
                                          to={child.url}
                                          className={`group flex items-center gap-2 px-3 py-1.5 py-4 rounded-lg relative ml-4 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                                            ${
                                              childActive
                                                ? 'text-primary'
                                                : 'text-gray-700 hover:bg-primary/5 hover:text-primary'
                                            }`}
                                        >
                                          {/* Bullet point instead of icon */}
                                          <div
                                            className={`w-2 h-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                                              childActive ? 'bg-primary' : 'bg-gray-400 group-hover:bg-primary'
                                            }`}
                                          />
                                          <span
                                            className={`font-medium text-base transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                                              childActive ? 'text-primary' : 'text-gray-700 group-hover:text-primary'
                                            }`}
                                          >
                                            {child.title}
                                          </span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  );
                                })}
                              </SidebarMenuSub>
                            </div>
                          </div>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
