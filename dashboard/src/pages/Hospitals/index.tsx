import Layout from '@/components/LayoutWithNav';
import HospitalsTable from './HospitalsTable';

export default function HospitalsPage() {
  return (
    <Layout>
      <div className='p-6 space-y-6'>
        <HospitalsTable />
      </div>
    </Layout>
  );
}
