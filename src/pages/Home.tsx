import Header from '@/components/Header';
import StatsCards from '@/components/StatsCards';
import FilterBar from '@/components/FilterBar';
import RecordTable from '@/components/RecordTable';
import BatchActions from '@/components/BatchActions';
import BatchModal from '@/components/BatchModal';
import TemplateModal from '@/components/TemplateModal';
import PreviewModal from '@/components/PreviewModal';
import HandoverModal from '@/components/HandoverModal';
import ExceptionModal from '@/components/ExceptionModal';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <StatsCards />
          <FilterBar />
          <BatchActions />
          <RecordTable />
        </div>
      </main>
      <BatchModal />
      <TemplateModal />
      <PreviewModal />
      <HandoverModal />
      <ExceptionModal />
    </div>
  );
}
