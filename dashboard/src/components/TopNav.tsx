import { Bell, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Optional: show loading state or minimal UI if user isn't ready
  if (!user) {
    return (
      <div className='flex items-center justify-end h-16 px-6 gap-6'>
        {/* Profile placeholder */}
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-gray-200 animate-pulse' />
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-end  px-6 py-2'>
      {/* Right: Notifications + Profile */}
      <div className='flex items-center gap-4'>
        {/* Notification Bell */}
        <button className='relative p-2 hover:bg-gray-50 rounded-lg transition-colors group'>
          <Bell className='w-5 h-5 text-gray-600 group-hover:text-gray-900' />
          <span className='absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white'></span>
        </button>

        {/* Profile Section with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex items-center gap-2 pl-2 pr-3 py-0.5 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
              <div className='w-10 h-10 rounded-full bg-primary border-2 border-white flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm'>
                <span className='uppercase'>
                  {user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </span>
              </div>
              <div className='hidden sm:flex flex-col items-start min-w-0'>
                <span className='text-sm font-medium text-gray-900 truncate'>{user.name}</span>
                <span className='text-xs text-gray-500 truncate'>{user.role}</span>
              </div>
              <ChevronDown className='hidden sm:block w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0 self-start mt-1' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none'>{user.name}</p>
                <p className='text-xs leading-none text-muted-foreground'>{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              <Settings className='h-4 w-4' />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className='text-red-600'>
              <LogOut className='h-4 w-4 text-red-600' />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
