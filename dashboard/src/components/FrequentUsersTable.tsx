import { useMemo } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConsultations } from '@/hooks/useConsultations';

interface FrequentUser {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  gender: string;
  consultations: number;
  status: 'Active' | 'Inactive';
}

export default function FrequentUsersTable() {
  const { users, loading: usersLoading } = useUsers();
  const { consultations, loading: consultationsLoading } = useConsultations({ limit: 1000 }); // Get all consultations to count per user

  // Calculate consultations per user (count doctor and patient consultations)
  const userConsultationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    consultations.forEach(consultation => {
      if (consultation.doctor?.id) {
        counts[consultation.doctor.id] = (counts[consultation.doctor.id] || 0) + 1;
      }
      if (consultation.patient?.id) {
        counts[consultation.patient.id] = (counts[consultation.patient.id] || 0) + 1;
      }
    });
    return counts;
  }, [consultations]);

  // Transform users to frequent users format
  const frequentUsers: FrequentUser[] = useMemo(() => {
    return users
      .filter(u => u.role.name !== 'PATIENT') // Exclude patients from dashboard frequent users
      .map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.profilePicture,
        role: user.role.name === 'DOCTOR' ? 'Doctor' : user.role.name === 'PHARMACIST' ? 'Pharmacist' : user.role.name === 'LABORATORY_STAFF' ? 'Lab Staff' : user.role.name,
        gender: user.gender === 'MALE' ? 'Male' : user.gender === 'FEMALE' ? 'Female' : user.gender || 'N/A',
        consultations: userConsultationCounts[user.id] || 0,
        status: user.active ? ('Active' as const) : ('Inactive' as const),
      }))
      .sort((a, b) => {
        // Sort by consultations count descending, then by active status
        if (b.consultations !== a.consultations) return b.consultations - a.consultations;
        return a.status === 'Active' ? -1 : 1;
      })
      .slice(0, 7); // Get top 7 users
  }, [users, userConsultationCounts]);

  const loading = usersLoading || consultationsLoading;

  return (
    <div className='bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_6px_18px_rgba(6,47,113,0.04)]'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-base font-bold text-[#062F71]'>Frequent Users</h2>
        <button className='text-xs text-gray-600 font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
          View All
        </button>
      </div>

      {loading ? (
        <div className='space-y-3'>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className='h-12 w-full' />
          ))}
        </div>
      ) : frequentUsers.length === 0 ? (
        <div className='text-center py-8 text-gray-500 text-sm'>No frequent users found</div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-100'>
                <th className='text-left py-2.5 px-3 text-xs font-semibold text-gray-500'>User Name</th>
                <th className='text-left py-2.5 px-3 text-xs font-semibold text-gray-500'>Preferred Role</th>
                <th className='text-left py-2.5 px-3 text-xs font-semibold text-gray-500'>Gender</th>
                <th className='text-left py-2.5 px-3 text-xs font-semibold text-gray-500'>Consultations</th>
                <th className='text-left py-2.5 px-3 text-xs font-semibold text-gray-500'>Status</th>
              </tr>
            </thead>
            <tbody>
              {frequentUsers.map(user => (
                <tr key={user.id} className='border-b border-gray-50 hover:bg-gray-50/60 transition-colors'>
                  <td className='py-3 px-3'>
                    <div className='flex items-center gap-2'>
                      <Avatar className='w-7 h-7 shrink-0'>
                        <AvatarImage src={user.avatar || undefined} alt={user.name} />
                        <AvatarFallback className='bg-gray-200 text-gray-600 text-xs'>
                          {user.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-sm font-semibold text-[#062F71]'>{user.name}</span>
                    </div>
                  </td>
                  <td className='py-3 px-3'>
                    <span className='text-sm text-gray-600'>{user.role}</span>
                  </td>
                  <td className='py-3 px-3'>
                    <span className='text-sm text-gray-600'>{user.gender}</span>
                  </td>
                  <td className='py-3 px-3'>
                    <span className='text-sm text-gray-600'>{user.consultations}</span>
                  </td>
                  <td className='py-3 px-3'>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        user.status === 'Active'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
