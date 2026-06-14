import { useState } from 'react';
import { CheckSquare, Trash2, CheckCircle, XCircle, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ReviewStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function BatchActions() {
  const {
    selectedIds,
    clearSelection,
    batchSetReviewStatus,
    deleteRecords,
    currentRole,
    records,
    updateRecord,
  } = useAppStore();

  const [showDeficiencyModal, setShowDeficiencyModal] = useState(false);
  const [deficiencyNote, setDeficiencyNote] = useState('');

  const count = selectedIds.length;
  const selectedRecords = records.filter((r) => selectedIds.includes(r.id));

  if (count === 0) return null;

  const canReview = currentRole === 'reviewer' || currentRole === 'manager';
  const canDelete = currentRole === 'manager';

  const insufficientQtyIds = selectedRecords
    .filter((r) => r.actualQuantity < r.packageQuantity)
    .map((r) => r.id);

  const handleBatchPass = () => {
    if (count === 0) return;

    if (insufficientQtyIds.length > 0) {
      const confirmMsg = `选中的 ${count} 条记录中，有 ${insufficientQtyIds.length} 条实际数量少于包内数量。\n\n确定仍然要将所有选中记录标记为"已通过"吗？`;
      if (!confirm(confirmMsg)) return;
    } else {
      if (!confirm(`确定将选中的 ${count} 条记录设置为"已通过"吗？`)) return;
    }

    batchSetReviewStatus(selectedIds, 'passed');
    clearSelection();
  };

  const handleBatchFailClick = () => {
    setDeficiencyNote('');
    setShowDeficiencyModal(true);
  };

  const handleBatchFailConfirm = () => {
    if (!deficiencyNote.trim()) {
      alert('请填写缺漏说明');
      return;
    }

    batchSetReviewStatus(selectedIds, 'failed');
    selectedIds.forEach((id) => {
      updateRecord(id, { deficiencyNote: deficiencyNote.trim() });
    });

    setShowDeficiencyModal(false);
    setDeficiencyNote('');
    clearSelection();
  };

  const handleBatchDelete = () => {
    if (count === 0) return;
    if (confirm(`确定删除选中的 ${count} 条记录吗？此操作不可恢复。`)) {
      deleteRecords(selectedIds);
      clearSelection();
    }
  };

  return (
    <>
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
                onClick={handleBatchPass}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-success bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                批量通过
              </button>
              <button
                onClick={handleBatchFailClick}
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

      {showDeficiencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowDeficiencyModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy-900">批量标记缺漏</h3>
              <button
                onClick={() => setShowDeficiencyModal(false)}
                className="p-1 text-navy-400 hover:text-navy-600 hover:bg-navy-50 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-navy-600 mb-4">
              将为选中的 <span className="font-medium text-navy-900">{count}</span> 条记录标记为有缺漏
            </p>
            <div className="mb-5">
              <label className="block text-sm font-medium text-navy-700 mb-2">
                缺漏说明 <span className="text-danger">*</span>
              </label>
              <textarea
                value={deficiencyNote}
                onChange={(e) => setDeficiencyNote(e.target.value)}
                placeholder="请填写缺漏说明..."
                rows={4}
                autoFocus
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeficiencyModal(false)}
                className="px-4 py-2 text-sm font-medium text-navy-600 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBatchFailConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-warning hover:bg-amber-600 rounded-lg transition-colors"
              >
                确认标记
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
