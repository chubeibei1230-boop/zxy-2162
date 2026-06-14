import { useState } from 'react';
import { Layers, Shield, List } from 'lucide-react';
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
import RiskDashboard from '@/components/RiskDashboard';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

type ViewMode = 'records' | 'risk';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('risk');
  const {
    currentRole,
    setShowHandoverModal,
    setActiveHandoverBatchId,
    setShowExceptionModal,
    setActiveExceptionBatchId,
    setActiveExceptionHandoverId,
    handovers,
    expandedBatches,
    toggleBatchExpand,
  } = useAppStore();

  const handleViewBatch = (batchId: string) => {
    setViewMode('records');
    if (!expandedBatches[batchId]) {
      toggleBatchExpand(batchId);
    }
  };

  const handleOpenHandover = (batchId: string) => {
    setActiveHandoverBatchId(batchId);
    setShowHandoverModal(true);
  };

  const handleOpenException = (batchId: string) => {
    const handover = handovers.find((h) => h.batchId === batchId);
    setActiveExceptionBatchId(batchId);
    setActiveExceptionHandoverId(handover?.id || null);
    setShowExceptionModal(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                {viewMode === 'risk' ? (
                  <>
                    <Shield className="w-6 h-6 text-primary-600" />
                    批次风险看板
                  </>
                ) : (
                  <>
                    <Layers className="w-6 h-6 text-primary-600" />
                    分装记录管理
                  </>
                )}
              </h2>
              <p className="text-sm text-navy-500 mt-1">
                {viewMode === 'risk'
                  ? '按批次查看分装完成度、缺漏情况、签收状态及异常处理进度，高风险批次优先展示'
                  : '管理课程批次的分装记录，进行复核、交接签收及异常处理'}
              </p>
            </div>

            {currentRole === 'manager' && (
              <div className="inline-flex items-center p-1 bg-navy-100/60 rounded-xl border border-navy-200">
                <button
                  onClick={() => setViewMode('risk')}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    viewMode === 'risk'
                      ? 'bg-white text-primary-600 shadow-sm border border-navy-200'
                      : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                  )}
                >
                  <Shield className="w-4 h-4" />
                  风险看板
                </button>
                <button
                  onClick={() => setViewMode('records')}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    viewMode === 'records'
                      ? 'bg-white text-primary-600 shadow-sm border border-navy-200'
                      : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                  )}
                >
                  <List className="w-4 h-4" />
                  记录列表
                </button>
              </div>
            )}
          </div>

          <StatsCards />
          <FilterBar />

          {viewMode === 'records' && <BatchActions />}

          {viewMode === 'risk' ? (
            <RiskDashboard
              onViewBatch={handleViewBatch}
              onOpenHandover={handleOpenHandover}
              onOpenException={handleOpenException}
            />
          ) : (
            <RecordTable />
          )}
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
