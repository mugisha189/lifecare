// src/pages/Consultations/index.tsx
import ConsultationTable from './ConsultationTable';
import Layout from '@/components/LayoutWithNav';

const ConsultationsPage = () => {
  return (
    <Layout>
      <div className='p-6'>
        <ConsultationTable />
      </div>
    </Layout>
  );
};

export default ConsultationsPage;
