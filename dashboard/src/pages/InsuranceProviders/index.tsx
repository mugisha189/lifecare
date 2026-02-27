import Layout from '@/components/LayoutWithNav';
import InsuranceProvidersTable from './InsuranceProvidersTable';

export default function InsuranceProvidersPage() {
  return (
    <Layout>
      <div className='p-6 space-y-6'>
        <InsuranceProvidersTable />
      </div>
    </Layout>
  );
}
