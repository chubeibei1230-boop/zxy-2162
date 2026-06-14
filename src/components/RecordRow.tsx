import { useState } from 'react';
import { Edit2, Trash2, Save, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { PackageRecord, CATEGORY_LABELS, REVIEW_STATUS_LABELS, ReviewStatus, MaterialCategory } from '@/types';
import { hasRecordIssues, runRecordValidations } from '@/utils/validation';
import { cn } from '@/lib/utils';

interface RecordRowProps {
  record: PackageRecord;
}

export default function RecordRow({ record }: RecordRowProps) {
  const {
    updateRecord,
    deleteRecord,
    records,
    selectedIds,
    toggleSelect,
    editingRecordId,
    setEditingRecordId,
    currentRole,
    courses,
  } = useAppStore();

  const [editData, setEditData] = useState<PackageRecord>(record);

  const isEditing = editingRecordId === record.id;
  const hasIssues = hasRecordIssues(record, records);
  const issues = runRecordValidations(record, records);

  const canEdit = currentRole === 'manager' || currentRole === 'executor' || currentRole === 'reviewer';
  const canDelete = currentRole === 'manager';

  const canEditMaterialInfo = currentRole === 'manager';
  const canEditPackageQty = currentRole === 'manager';
  const canEditActualQty = currentRole === 'manager' || currentRole === 'executor';
  const canEditBatch = currentRole === 'manager';
  const canEditPerson = currentRole === 'manager' || currentRole === 'executor';
  const canEditReviewStatus = currentRole === 'manager' || currentRole === 'reviewer';
  const canEditDeficiency = currentRole === 'manager' || currentRole === 'reviewer';
  const canEditReplenishment = currentRole === 'manager' || currentRole === 'reviewer';

  const quantityIssue = issues.find((i) => i.field === 'actualQuantity');
  const deficiencyNoteIssue = issues.find((i) => i.field === 'deficiencyNote');
  const statusIssue = issues.find((i) => i.field === 'reviewStatus');
  const workloadIssue = issues.find((i) => i.field === 'responsiblePerson');

  const handleEdit = () => {
    setEditData(record);
    setEditingRecordId(record.id);
  };

  const handleCancel = () => {
    setEditData(record);
    setEditingRecordId(null);
  };

  const handleSave = () => {
    updateRecord(record.id, editData);
    setEditingRecordId(null);
  };

  const handleDelete = () => {
    if (confirm('确定删除这条记录吗？')) {
      deleteRecord(record.id);
    }
  };

  const statusConfig = {
    pending: { label: REVIEW_STATUS_LABELS.pending, icon: Clock, color: 'text-navy-500 bg-navy-50' },
    passed: { label: REVIEW_STATUS_LABELS.passed, icon: CheckCircle, color: 'text-success bg-emerald-50' },
    failed: { label: REVIEW_STATUS_LABELS.failed, icon: AlertTriangle, color: 'text-warning bg-amber-50' },
  };

  const StatusIcon = statusConfig[record.reviewStatus].icon;

  return (
    <tr
      className={cn(
        'border-b border-navy-100 transition-colors',
        hasIssues && record.reviewStatus !== 'passed' && 'bg-amber-50/30',
        isEditing && 'bg-primary-50/50',
        'hover:bg-navy-50/50'
      )}
    >
      <td className="px-3 py-3 w-10">
        <input
          type="checkbox"
          checked={selectedIds.includes(record.id)}
          onChange={() => toggleSelect(record.id)}
          className="w-4 h-4 text-primary-600 border-navy-300 rounded focus:ring-primary-500 cursor-pointer"
        />
      </td>

      <td className="px-3 py-3 text-sm text-navy-900 font-medium">
        {isEditing && canEditMaterialInfo ? (
          <input
            type="text"
            value={editData.materialName}
            onChange={(e) => setEditData({ ...editData, materialName: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-navy-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        ) : (
          record.materialName
        )}
      </td>

      <td className="px-3 py-3 text-sm text-navy-600">
        {isEditing && canEditMaterialInfo ? (
          <select
            value={editData.category}
            onChange={(e) => setEditData({ ...editData, category: e.target.value as MaterialCategory })}
            className="w-full px-2 py-1 text-sm border border-navy-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        ) : (
          CATEGORY_LABELS[record.category]
        )}
      </td>

      <td className="px-3 py-3 text-sm text-navy-700 text-center">
        {isEditing && canEditPackageQty ? (
          <input
            type="number"
            min={0}
            value={editData.packageQuantity}
            onChange={(e) => setEditData({ ...editData, packageQuantity: parseInt(e.target.value) || 0 })}
            className="w-20 px-2 py-1 text-sm text-center border border-navy-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        ) : (
          record.packageQuantity
        )}
      </td>

      <td className="px-3 py-3 text-center">
        {isEditing && canEditActualQty ? (
          <input
            type="number"
            min={0}
            value={editData.actualQuantity}
            onChange={(e) => setEditData({ ...editData, actualQuantity: parseInt(e.target.value) || 0 })}
            className={cn(
              'w-20 px-2 py-1 text-sm text-center border rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
              quantityIssue && 'border-danger bg-rose-50'
            )}
          />
        ) : (
          <span
            className={cn(
              'text-sm font-medium',
              quantityIssue ? 'text-danger' : 'text-navy-900'
            )}
          >
            {record.actualQuantity}
            {quantityIssue && (
              <span className="ml-1 text-xs text-danger">⚠</span>
            )}
          </span>
        )}
      </td>

      <td className="px-3 py-3 text-sm text-navy-600">
        {isEditing && canEditBatch ? (
          <select
            value={editData.batchId}
            onChange={(e) => {
              const batch = courses.find((c) => c.id === e.target.value);
              setEditData({
                ...editData,
                batchId: e.target.value,
                courseName: batch?.courseName || '',
                batchNumber: batch?.batchNumber || '',
              });
            }}
            className="w-full px-2 py-1 text-sm border border-navy-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseName} - {c.batchNumber}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-sm">
            <div className="text-navy-900 font-medium">{record.courseName}</div>
            <div className="text-xs text-navy-500">{record.batchNumber}</div>
          </div>
        )}
      </td>

      <td className="px-3 py-3">
        {isEditing && canEditPerson ? (
          <input
            type="text"
            value={editData.responsiblePerson}
            onChange={(e) => setEditData({ ...editData, responsiblePerson: e.target.value })}
            className={cn(
              'w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
              workloadIssue && 'border-warning bg-amber-50'
            )}
          />
        ) : (
          <span
            className={cn(
              'text-sm',
              workloadIssue ? 'text-warning font-medium' : 'text-navy-700'
            )}
          >
            {record.responsiblePerson || '-'}
          </span>
        )}
      </td>

      <td className="px-3 py-3">
        {isEditing && canEditReviewStatus ? (
          <select
            value={editData.reviewStatus}
            onChange={(e) => {
              const status = e.target.value as ReviewStatus;
              setEditData({
                ...editData,
                reviewStatus: status,
                hasDeficiency: status === 'failed',
              });
            }}
            className={cn(
              'w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
              statusIssue && 'border-warning bg-amber-50'
            )}
          >
            {Object.entries(REVIEW_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        ) : (
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
              statusConfig[record.reviewStatus].color
            )}
          >
            <StatusIcon className="w-3 h-3" />
            {statusConfig[record.reviewStatus].label}
            {statusIssue && <span className="ml-1">⚠</span>}
          </span>
        )}
      </td>

      <td className="px-3 py-3">
        {isEditing && canEditDeficiency ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`def-${record.id}`}
                checked={editData.hasDeficiency}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setEditData({
                    ...editData,
                    hasDeficiency: checked,
                    reviewStatus: checked ? 'failed' : editData.reviewStatus === 'failed' ? 'pending' : editData.reviewStatus,
                  });
                }}
                className="w-4 h-4 text-primary-600 border-navy-300 rounded focus:ring-primary-500"
              />
              <label htmlFor={`def-${record.id}`} className="text-xs text-navy-600">
                有缺漏
              </label>
            </div>
            {editData.hasDeficiency && (
              <textarea
                value={editData.deficiencyNote}
                onChange={(e) => setEditData({ ...editData, deficiencyNote: e.target.value })}
                placeholder="缺漏说明"
                rows={2}
                className={cn(
                  'w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none',
                  deficiencyNoteIssue && 'border-danger bg-rose-50'
                )}
              />
            )}
          </div>
        ) : record.hasDeficiency ? (
          <div className="text-xs">
            <div className="text-danger font-medium">有缺漏</div>
            <div className="text-navy-500 mt-0.5 line-clamp-2">{record.deficiencyNote || '-'}</div>
          </div>
        ) : (
          <span className="text-xs text-navy-400">无</span>
        )}
      </td>

      <td className="px-3 py-3">
        {isEditing && canEditReplenishment ? (
          <textarea
            value={editData.replenishmentNote}
            onChange={(e) => setEditData({ ...editData, replenishmentNote: e.target.value })}
            placeholder="补装备注"
            rows={2}
            className="w-full px-2 py-1 text-xs border border-navy-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
          />
        ) : (
          <span className="text-xs text-navy-500 line-clamp-2 block max-w-32">
            {record.replenishmentNote || '-'}
          </span>
        )}
      </td>

      <td className="px-3 py-3 w-24">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="p-1.5 text-success bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
              title="保存"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 text-navy-500 bg-navy-50 hover:bg-navy-100 rounded transition-colors"
              title="取消"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {canEdit && (
              <button
                onClick={handleEdit}
                className="p-1.5 text-navy-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                title="编辑"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-navy-400 hover:text-danger hover:bg-rose-50 rounded transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
