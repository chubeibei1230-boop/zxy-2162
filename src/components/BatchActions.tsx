import { CheckSquare, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ReviewStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function BatchActions() {
  const { selectedIds, clearSelection, batchSetReviewStatus, deleteRecords, currentRole } =
    useAppStore();

  const count = selectedIds.length;

  if (count === 0) return null;

  const canReview = currentRole === 'reviewer' || currentRole === 'manager';
  const canDelete = currentRole === 'manager';

  const handleBatchStatus = (status: ReviewStatus) => {
    if (count === 0) return;
    if (confirm(`确定将选中的 ${count} 条记录设置为"${status === 'passed' ? '已通过' : status === 'failed' ? '有缺漏' : '待复核'}"吗？`)) {
      batchSetReviewStatus(selectedIds, status);
      clearSelection();
    }
  };

  const handleBatchDelete = () => {
    if (count === 0) return;
    if (confirm(`确定删除选中的 ${count} 条记录吗？此操作不可恢复。`)) {
      deleteRecords(selectedIds);
      clearSelection();
    }
  };

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 flex items-center justify-between animate-slide-in">
      <div className="flex items-center gap-2">
        <CheckSquare className="w-5 h-5 text-primary-600" />
        <span className="text-sm font-medium text-primary-700">
          已选择 <span className="font-bold">{count}</span> 条记录
        </span>
      </div>
      <div className="flex items-center gap-2">
        {canReview && (
          <>
            <button
              onClick={() => handleBatchStatus('passed')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-success bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              批量通过
            </button>
            <button
              onClick={() => handleBatchStatus('failed')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-warning bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              批量标记缺漏
            </button>
          </>
        )}
        {canDelete && (
          <button
            onClick={handleBatchDelete}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              'text-danger bg-white border border-rose-200 hover:bg-rose-50'
            )}
          >
            <Trash2 className="w-4 h-4" />
            批量删除
          </button>
        )}
        <button
          onClick={clearSelection}
          className="px-3 py-1.5 text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-white rounded-lg transition-colors"
        >
          取消选择
        </button>
      </div>
    </div>
  );
}
