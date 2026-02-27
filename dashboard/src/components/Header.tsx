import { Search, Bell, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useHealthCheck } from '@/hooks/useHealthCheck';

export function Header() {
  const { data, isLoading, isError } = useHealthCheck();

  const isHealthy = data?.status?.toLowerCase().includes('healthy') && !isError;
  const healthLabel = isLoading ? 'Checking API' : isHealthy ? 'API Healthy' : 'API Issue';
  const healthClasses = isHealthy
    ? 'bg-green-50 text-green-700 ring-1 ring-green-100'
    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';

  return (
    <header className='bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-30'>
      <div className='flex items-center justify-between gap-4'>
        {/* Search */}
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search'
            className='pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#062F71] focus:border-transparent placeholder:text-gray-400'
          />
        </div>

        {/* Right side - Notifications and User Profile */}
        <div className='flex items-center gap-4'>
          {/* API Health */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${healthClasses}`}
          >
            {isHealthy ? <CheckCircle2 className='w-4 h-4' /> : <AlertTriangle className='w-4 h-4' />}
            <span className='truncate'>{healthLabel}</span>
          </div>

          {/* Notifications */}
          <button className='relative p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100'>
            <Bell className='w-5 h-5 text-gray-600' aria-label='Notifications' />
            <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full' />
          </button>

          {/* User Profile */}
          <div className='flex items-center gap-3'>
            <div className='text-right'>
              <p className='text-sm font-semibold text-[#062F71]'>Robert Allen</p>
              <p className='text-xs text-gray-500'>Super Admin</p>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-10 h-10 rounded-full bg-gray-200 overflow-hidden'>
                <img
                  src='https://i.pravatar.cc/150?img=12'
                  alt='User'
                  className='w-full h-full object-cover'
                />
              </div>
              <ChevronDown className='w-4 h-4 text-gray-400' />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
