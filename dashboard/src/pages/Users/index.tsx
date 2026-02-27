import { useState } from 'react';
import Layout from '@/components/LayoutWithNav';
import UsersTable from './UsersTable';
import UserDetailsScreen from './UsersProfile';

const Users = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  console.log('Current selectedUserId:', selectedUserId); // Debug log

  const handleViewUser = (userId: string) => {
    console.log('handleViewUser called with:', userId); // Debug log
    setSelectedUserId(userId);
  };

  const handleBack = () => {
    console.log('handleBack called'); // Debug log
    setSelectedUserId(null);
  };

  // If a user is selected, show the details screen
  if (selectedUserId) {
    return (
      <Layout>
        <UserDetailsScreen userId={selectedUserId} onBack={handleBack} />
      </Layout>
    );
  }

  // Otherwise, show the users table
  return (
    <Layout>
      <div className='space-y-6'>
        {/* Users Table */}
        <UsersTable onViewUser={handleViewUser} />
      </div>
    </Layout>
  );
};

export default Users;
