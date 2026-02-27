import { useState, useMemo } from 'react';
import {
  UsersRound,
  ScrollText,
  Wallet,
  Stethoscope,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Star,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Pill,
  FlaskConical,
  HeartPulse,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Layout from '@/components/LayoutWithNav';
import FrequentUsersTable from '@/components/FrequentUsersTable';
import { useDashboard, type DashboardFilters } from '@/hooks/useDashboard';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useUserRole } from '@/hooks/useRole';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  loading: boolean;
  value: number | null;
  subtitle?: string;
  emptyMessage: string;
}

// Pie Chart Component using Recharts
interface PieChartComponentProps {
  data: Array<{ name: string; value: number; color: string }>;
  loading: boolean;
  title: string;
}

const PieChartComponent = ({ data, loading, title }: PieChartComponentProps) => {
  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[320px]'>
        <Skeleton className='w-[200px] h-[200px] rounded-full mb-4' />
        <Skeleton className='h-4 w-32 mb-2' />
        <div className='flex items-center justify-center gap-4 flex-wrap'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='flex items-center gap-2'>
              <Skeleton className='w-3 h-3 rounded-full' />
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-8' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[320px]'>
        <div className='text-gray-400 text-sm'>{title}</div>
        <div className='text-gray-300 text-2xl font-semibold mt-2'>No data</div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map(item => ({
    name: item.name,
    value: item.value,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }));

  const COLORS = data.map(item => item.color);

  return (
    <div className='flex flex-col items-center justify-center min-h-[320px]'>
      <h3 className='text-sm font-medium text-gray-600 mb-3'>{title}</h3>
      <ResponsiveContainer width='100%' height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx='50%'
            cy='50%'
            labelLine={false}
            label={props => {
              const dataEntry = props as { percentage?: number };
              return dataEntry.percentage ? `${dataEntry.percentage}%` : '';
            }}
            outerRadius={90}
            fill='#8884d8'
            dataKey='value'
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className='flex items-center justify-center gap-4 flex-wrap mt-3'>
        {data.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={index} className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }}></div>
              <span className='text-gray-700 font-medium text-sm'>{item.name}</span>
              <span className='text-gray-900 font-bold text-base'>{item.value}</span>
              <span className='text-gray-500 text-xs'>({percentage}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Bar Chart Component
interface BarChartComponentProps {
  data: Array<{ name: string; value: number }>;
  loading: boolean;
  title: string;
  color?: string;
}

const BarChartComponent = ({ data, loading, title, color = '#6366f1' }: BarChartComponentProps) => {
  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[240px]'>
        <Skeleton className='h-4 w-32 mb-3' />
        <Skeleton className='w-full h-[180px]' />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[240px]'>
        <div className='text-gray-400 text-sm'>{title}</div>
        <div className='text-gray-300 text-lg font-semibold mt-2'>No data</div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-[240px]'>
      {title && <h3 className='text-sm font-medium text-gray-600 mb-3'>{title}</h3>}
      <ResponsiveContainer width='100%' height={200}>
        <BarChart data={data}>
          <XAxis dataKey='name' stroke='#6b7280' fontSize={12} />
          <YAxis stroke='#6b7280' fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey='value' fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, loading, value, subtitle }: StatCardProps) => (
  <div className='bg-white border border-gray-100 rounded-xl p-4 h-full flex flex-col'>
    <div className='flex items-center gap-2 mb-3'>
      <div className='bg-primary/10 rounded-lg p-1.5 flex justify-center items-center'>
        <Icon className='w-3.5 h-3.5 text-primary' />
      </div>
      <h2 className='text-sm font-medium text-gray-600 text-base'>{title}</h2>
    </div>

    {loading ? (
      <div className='space-y-2 flex-1'>
        <Skeleton className='h-9 w-24' />
        {subtitle && <Skeleton className='h-4 w-32' />}
      </div>
    ) : value !== null ? (
      <div className='flex-1'>
        <h1 className='text-3xl font-bold text-gray-900 mb-1'>{value.toLocaleString()}</h1>
        {subtitle && <p className='text-xs text-gray-500'>{subtitle}</p>}
      </div>
    ) : (
      <div className='flex-1'>
        <h1 className='text-3xl font-bold text-gray-300 mb-1'>0</h1>
        <p className='text-xs text-gray-400'>No data available</p>
      </div>
    )}
  </div>
);

export default function DashboardPage() {
  const userRole = useUserRole();
  const isDoctor = userRole === 'DOCTOR';
  const isAdmin = userRole === 'ADMIN';

  const [showFilters, setShowFilters] = useState(false);
  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM'>(isDoctor ? 'MONTH' : 'YEAR');
  const [startDate, setStartDate] = useState<string>(
    format(new Date(Date.now() - (isDoctor ? 30 : 365) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const filters = useMemo<DashboardFilters>(
    () => ({
      period,
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T23:59:59Z`,
    }),
    [period, startDate, endDate]
  );

  const { analytics, loading, error, refetch } = useDashboard(filters);

  // Prepare chart data with better colors
  const usersChartData = analytics?.users
    ? [
        { name: 'Active', value: analytics.users.activeUsers, color: '#10b981' },
        { name: 'Inactive', value: analytics.users.inactiveUsers, color: '#ef4444' },
        { name: 'New', value: analytics.users.newUsers, color: '#6366f1' },
      ].filter(item => item.value > 0)
    : [];

  const doctorsChartData = analytics?.doctors || analytics?.drivers
    ? [
        { name: 'Active', value: (analytics?.doctors?.activeDoctors ?? analytics?.drivers?.activeDrivers) || 0, color: '#10b981' },
        { name: 'Verified', value: (analytics?.doctors?.verifiedDoctors ?? analytics?.drivers?.verifiedDrivers) || 0, color: '#6366f1' },
        { name: 'Pending', value: (analytics?.doctors?.pendingVerification ?? analytics?.drivers?.pendingVerification) || 0, color: '#f59e0b' },
      ].filter(item => item.value > 0)
    : [];

  const consultationsChartData = analytics?.consultations || analytics?.rides
    ? [
        { name: 'Completed', value: (analytics?.consultations?.completedConsultations ?? analytics?.rides?.completedRides) || 0, color: '#10b981' },
        { name: 'Scheduled', value: (analytics?.consultations?.scheduledConsultations ?? analytics?.rides?.ongoingRides) || 0, color: '#6366f1' },
        { name: 'Cancelled', value: (analytics?.consultations?.cancelledConsultations ?? analytics?.rides?.cancelledRides) || 0, color: '#ef4444' },
      ].filter(item => item.value > 0)
    : [];

  const prescriptionsBarData = analytics?.prescriptions || analytics?.bookings
    ? [
        { name: 'Total', value: (analytics?.prescriptions?.total ?? analytics?.bookings?.totalBookings) || 0 },
        { name: 'Pending', value: (analytics?.prescriptions?.pending ?? 0) || 0 },
        { name: 'Dispensed', value: (analytics?.prescriptions?.dispensed ?? analytics?.bookings?.confirmedBookings) || 0 },
      ]
    : [];

  const handleApplyFilters = () => {
    refetch();
  };

  return (
    <Layout>
      <div className='min-h-screen bg-white'>
        <div className='max-w-7xl mx-auto'>
          {/* Filters Section - Inline with content */}
          <div className='bg-white border border-gray-100 rounded-xl p-2 mb-2'>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                onClick={() => setShowFilters(!showFilters)}
                className='flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              >
                <SlidersHorizontal className='w-4 h-4' />
                <span className='text-sm font-medium'>Filters</span>
                {showFilters ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
              </Button>
              {analytics?.dateRange && (
                <div className='flex items-center gap-1 text-xs text-gray-600 flex-1'>
                  <span className='font-medium'>Range:</span>
                  <span>{format(new Date(analytics.dateRange.startDate), 'MMM d, yyyy')}</span>
                  <span className='text-gray-400'>to</span>
                  <span>{format(new Date(analytics.dateRange.endDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              {showFilters && (
                <Button onClick={handleApplyFilters} className='bg-primary hover:bg-primary/90 text-white ml-auto'>
                  Apply Filters
                </Button>
              )}
            </div>
            {showFilters && (
              <div className='mt-2 pt-2 border-t border-gray-100'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
                  <div>
                    <Label className='text-xs mb-1 block'>Period</Label>
                    <Select value={period} onValueChange={value => setPeriod(value as typeof period)}>
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='DAY'>Day</SelectItem>
                        <SelectItem value='WEEK'>Week</SelectItem>
                        <SelectItem value='MONTH'>Month</SelectItem>
                        <SelectItem value='YEAR'>Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='startDate' className='text-xs mb-1 block'>
                      Start Date
                    </Label>
                    <Input
                      id='startDate'
                      type='date'
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className='w-full'
                    />
                  </div>
                  <div>
                    <Label htmlFor='endDate' className='text-xs mb-1 block'>
                      End Date
                    </Label>
                    <Input
                      id='endDate'
                      type='date'
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className='w-full'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {error && (
            <div className='mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm'>{error}</div>
          )}

          {/* Main Stats Grid - Different for Doctor vs Admin */}
          {isDoctor ? (
            /* Doctor Dashboard Stats */
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2'>
              <StatCard
                icon={Stethoscope}
                title='My Consultations'
                loading={loading}
                value={(analytics?.consultations?.total ?? 0)}
                subtitle={`${(analytics?.consultations?.completed ?? 0)} completed`}
                emptyMessage='No consultations'
              />
              <StatCard
                icon={ScrollText}
                title='Today'
                loading={loading}
                value={(analytics?.consultations?.today ?? 0)}
                subtitle={`Consultations today`}
                emptyMessage='No consultations today'
              />
              <StatCard
                icon={Pill}
                title='Prescriptions'
                loading={loading}
                value={(analytics?.prescriptions?.total ?? 0)}
                subtitle={`${(analytics?.prescriptions?.pending ?? 0)} pending`}
                emptyMessage='No prescriptions'
              />
              <StatCard
                icon={HeartPulse}
                title='Patients'
                loading={loading}
                value={(analytics?.patients?.total ?? 0)}
                emptyMessage='No patients'
              />
            </div>
          ) : (
            /* Admin Dashboard Stats */
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2'>
              <StatCard
                icon={UsersRound}
                title='Total Users'
                loading={loading}
                value={analytics?.users.totalUsers ?? null}
                subtitle={`${analytics?.users.activeUsers || 0} active`}
                emptyMessage='No users data'
              />
              <StatCard
                icon={Stethoscope}
                title='Total Doctors'
                loading={loading}
                value={(analytics?.doctors?.totalDoctors ?? analytics?.drivers?.totalDrivers) ?? null}
                subtitle={`${(analytics?.doctors?.verifiedDoctors ?? analytics?.drivers?.verifiedDrivers) || 0} verified`}
                emptyMessage='No doctors data'
              />
              <StatCard
                icon={ScrollText}
                title='Total Consultations'
                loading={loading}
                value={(analytics?.consultations?.total ?? analytics?.rides?.totalRides) ?? null}
                subtitle={`${(analytics?.consultations?.completionRate ?? analytics?.rides?.completionRate) || 0}% completion rate`}
                emptyMessage='No consultations data'
              />
              <StatCard
                icon={Pill}
                title='Pending Prescriptions'
                loading={loading}
                value={(analytics?.prescriptions?.pending ?? analytics?.bookings?.totalBookings) ?? null}
                subtitle={`${(analytics?.prescriptions?.dispensed ?? analytics?.bookings?.confirmedBookings) || 0} dispensed`}
                emptyMessage='No prescriptions data'
              />
            </div>
          )}

          {/* Charts Grid - Only show for Admin */}
          {isAdmin && (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2'>
              {/* Users Distribution Pie Chart */}
              <div className='bg-white border border-gray-100 rounded-xl p-4 h-full'>
                <PieChartComponent data={usersChartData} loading={loading} title='Users Distribution' />
              </div>

              {/* Doctors Distribution Pie Chart */}
              <div className='bg-white border border-gray-100 rounded-xl p-4 h-full'>
                <PieChartComponent data={doctorsChartData} loading={loading} title='Doctors Status' />
              </div>
            </div>
          )}

          {/* Consultations & Prescriptions Charts */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2'>
            {/* Consultations Distribution Pie Chart */}
            <div className='bg-white border border-gray-100 rounded-xl p-4 h-full'>
              <PieChartComponent 
                data={consultationsChartData} 
                loading={loading} 
                title={isDoctor ? 'My Consultations Status' : 'Consultations Status'} 
              />
            </div>

            {/* Prescriptions Bar Chart */}
            <div className='bg-white border border-gray-100 rounded-xl p-4 h-full'>
              <div className='mb-3'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-base font-semibold text-gray-900'>
                    {isDoctor ? 'My Prescriptions' : 'Prescriptions'}
                  </h3>
                  {analytics?.prescriptions?.total !== undefined && (
                    <span className='text-sm text-gray-600'>
                      Total: {analytics.prescriptions.total}
                    </span>
                  )}
                </div>
              </div>
              <BarChartComponent data={prescriptionsBarData} loading={loading} title='' color='#10b981' />
            </div>
          </div>

          {/* Additional Stats - Only for Admin */}
          {isAdmin && (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
                <StatCard
                  icon={HeartPulse}
                  title='Patients'
                  loading={loading}
                  value={(analytics?.patients?.total ?? analytics?.passengers?.totalPassengers) ?? null}
                  emptyMessage='No patients data'
                />
                <StatCard
                  icon={FlaskConical}
                  title='Medicines'
                  loading={loading}
                  value={analytics?.medicines?.total ?? null}
                  subtitle={`${analytics?.medicines?.active || 0} active`}
                  emptyMessage='No medicines data'
                />
                <StatCard
                  icon={Pill}
                  title='Prescriptions'
                  loading={loading}
                  value={(analytics?.prescriptions?.total ?? analytics?.bookings?.totalBookings) ?? null}
                  subtitle={`${(analytics?.prescriptions?.dispensed ?? analytics?.bookings?.confirmedBookings) || 0} dispensed`}
                  emptyMessage='No prescriptions data'
                />
              </div>
              
              {/* Frequent Users Table from Feature Branch */}
              <div className='mt-2'>
                <FrequentUsersTable />
              </div>
            </>
          )}

        </div>
      </div>
    </Layout>
  );
}
