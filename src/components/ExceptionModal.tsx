import { useEffect, useState } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  ArrowLeft,
  FileWarning,
  CheckSquare,
  User,
  Calendar,
  Tag,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  EXCEPTION_STATUS_LABELS,
  EXCEPTION_RESOLUTION_LABELS,
  ANOMALY_TYPE_LABELS,
  ExceptionStatus,
  ExceptionResolution,
  ExceptionRecord,
} from '@/types';
import { formatDateTime, formatDate } from '@/utils/helpers';
import { cn } from '@/lib/utils';

type ModalView = 'list' | 'detail' | 'create' | 'edit';

export default function ExceptionModal() {
  const {
    showExceptionModal,
    setShowExceptionModal,
    exceptions,
    handovers,
    records,
    courses,
    activeExceptionBatchId,
    activeExceptionHandoverId,
    editingExceptionId,
    setEditingExceptionId,
    setActiveExceptionBatchId,
    setActiveExceptionHandoverId,
    addException,
    updateException,
    deleteException,
    updateExceptionStatus,
    currentRole,
  } = useAppStore();

  const [view, setView] = useState<ModalView>('list');
  const [formData, setFormData] = useState<Partial<ExceptionRecord> | null>(null);

  const batchId = activeExceptionBatchId || '';
  const handoverId = activeExceptionHandoverId || '';

  const batch = courses.find((c) => c.id === batchId);
  const handover = handovers.find((h) => h.id === handoverId);
  const batchExceptions = exceptions.filter((e) => e.batchId === batchId);
  const selectedException = editingExceptionId
    ? exceptions.find((e) => e.id === editingExceptionId)
    : null;

  const batchRecords = batchId ? records.filter((r) => r.batchId === batchId) : [];

  const canManage = currentRole === 'manager' || currentRole === 'executor';

  useEffect(() => {
    if (!showExceptionModal) return;
    if (editingExceptionId) {
      const exc = exceptions.find((e) => e.id === editingExceptionId);
      if (exc) {
        setFormData(exc);
        setView('detail');
      }
    } else {
      setView('list');
    }
  }, [showExceptionModal, editingExceptionId, exceptions]);

  const handleClose = () => {
    setShowExceptionModal(false);
    setActiveExceptionBatchId(null);
    setActiveExceptionHandoverId(null);
    setEditingExceptionId(null);
    setView('list');
    setFormData(null);
  };

  const handleViewDetail = (id: string) => {
    const exc = exceptions.find((e) => e.id === id);
    if (exc) {
      setFormData(exc);
      setEditingExceptionId(id);
      setView('detail');
    }
  };

  const handleStartCreate = () => {
    const now = new Date().toISOString();
    setFormData({
      handoverId: handoverId,
      batchId: batchId,
      courseName: batch?.courseName || '',
      batchNumber: batch?.batchNumber || '',
      recordId: '',
      materialName: '',
      anomalyType: 'missing',
      reason: '',
      responsiblePerson: '',
      resolution: 'reissue',
      resolutionDetail: '',
      expectedFinishDate: '',
      actualFinishDate: '',
      status: 'pending',
      result: '',
    } as Partial<ExceptionRecord>);
    setView('create');
  };

  const handleStartEdit = () => {
    if (selectedException) {
      setFormData(selectedException);
      setView('edit');
    }
  };

  const handleSave = () => {
    if (!formData) return;
    if (!formData.reason?.trim() || !formData.responsiblePerson?.trim()) {
      alert('请填写异常原因和责任人');
      return;
    }
    if (formData.expectedFinishDate) {
      const date = new Date(formData.expectedFinishDate);
      if (isNaN(date.getTime())) {
        alert('请填写有效的预计完成时间');
        return;
      }
    }

    if (view === 'create') {
      addException(formData as Omit<ExceptionRecord, 'id' | 'createdAt' | 'updatedAt'>);
      setView('list');
    } else if (view === 'edit') {
      if (editingExceptionId) {
        updateException(editingExceptionId, formData);
        setView('detail');
      }
    }
    setFormData(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条异常处理记录吗？')) {
      deleteException(id);
      if (editingExceptionId === id) setEditingExceptionId(null);
      if (view !== 'list') setView('list');
    }
  };

  const handleStatusChange = (status: ExceptionStatus) => {
    if (!editingExceptionId) return;
    let result = '';
    if (status === 'resolved' || status === 'closed' || status === 'no_action') {
      result = prompt('请填写处理结果：') || '';
    }
    updateExceptionStatus(editingExceptionId, status, result);
    const updated = exceptions.find((e) => e.id === editingExceptionId);
    if (updated) {
      setFormData(updated);
    }
  };

  const statusConfig: Record<
    ExceptionStatus,
    { icon: typeof Clock; color: string; bg: string; border: string }
  > = {
    pending: { icon: Clock, color: 'text-navy-600', bg: 'bg-navy-50', border: 'border-navy-200' },
    processing: { icon: Play, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    resolved: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    no_action: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
    closed: { icon: CheckSquare, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  };

  if (!showExceptionModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
              <FileWarning className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-900">异常闭环处理</h2>
              <p className="text-xs text-navy-500">
                {batch ? `${batch.courseName} - ${batch.batchNumber}` : '批次异常处理管理'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view !== 'list' && (
              <button
                onClick={() => {
                  setView('list');
                  setEditingExceptionId(null);
                  setFormData(null);
                }}
                className="px-3 py-1.5 text-sm font-medium text-navy-600 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                返回列表
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {view === 'list' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-navy-700">
                  异常处理记录
                  <span className="ml-2 text-xs font-normal text-navy-500">
                    共 {batchExceptions.length} 条
                  </span>
                </h3>
                {canManage && (
                  <button
                    onClick={handleStartCreate}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    新建异常单
                  </button>
                )}
              </div>

              {batchExceptions.length === 0 ? (
                <div className="text-center py-12 text-navy-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无异常处理记录</p>
                  {canManage && (
                    <p className="text-xs mt-2">点击上方按钮创建异常处理单</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {batchExceptions.map((exc) => {
                    const StatusIcon = statusConfig[exc.status].icon;
                    return (
                      <div
                        key={exc.id}
                        className="border border-navy-100 rounded-xl p-4 hover:border-amber-200 hover:bg-amber-50/20 transition-colors cursor-pointer"
                        onClick={() => handleViewDetail(exc.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center',
                                statusConfig[exc.status].bg
                              )}
                            >
                              <StatusIcon
                                className={cn('w-5 h-5', statusConfig[exc.status].color)}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-navy-900">
                                {exc.materialName || '批次级异常'}
                              </div>
                              <div className="text-xs text-navy-500">
                                异常类型：{ANOMALY_TYPE_LABELS[exc.anomalyType]}
                              </div>
                            </div>
                          </div>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full',
                              statusConfig[exc.status].bg,
                              statusConfig[exc.status].color
                            )}
                          >
                            {EXCEPTION_STATUS_LABELS[exc.status]}
                          </span>
                        </div>
                        <div className="mt-3 text-sm text-navy-600 line-clamp-2">
                          {exc.reason}
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-navy-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            责任人：{exc.responsiblePerson || '-'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            创建：{formatDateTime(exc.createdAt)}
                          </span>
                          {exc.expectedFinishDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              预计：{formatDate(exc.expectedFinishDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {view === 'detail' && selectedException && formData && (
            <div className="p-6 space-y-5">
              <div className="bg-navy-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-navy-900">
                    {formData.materialName || '批次级异常'}
                  </h3>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full',
                      statusConfig[formData.status].bg,
                      statusConfig[formData.status].color
                    )}
                  >
                    {EXCEPTION_STATUS_LABELS[formData.status]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-navy-500">异常类型</span>
                    <div className="font-medium text-navy-900 mt-1">
                      {ANOMALY_TYPE_LABELS[formData.anomalyType]}
                    </div>
                  </div>
                  <div>
                    <span className="text-navy-500">处理方式</span>
                    <div className="font-medium text-navy-900 mt-1">
                      {EXCEPTION_RESOLUTION_LABELS[formData.resolution]}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="border border-navy-100 rounded-lg p-3">
                  <div className="text-xs text-navy-500 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                    责任人
                  </div>
                  <div className="font-medium text-navy-900">
                    {formData.responsiblePerson || '-'}
                  </div>
                </div>
                <div className="border border-navy-100 rounded-lg p-3">
                  <div className="text-xs text-navy-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    预计完成时间
                  </div>
                  <div className="font-medium text-navy-900">
                    {formData.expectedFinishDate
                      ? formatDate(formData.expectedFinishDate)
                      : '-'}
                  </div>
                </div>
                <div className="border border-navy-100 rounded-lg p-3">
                  <div className="text-xs text-navy-500 mb-1">创建时间</div>
                  <div className="font-medium text-navy-900">
                    {formatDateTime(formData.createdAt)}
                  </div>
                </div>
                <div className="border border-navy-100 rounded-lg p-3">
                  <div className="text-xs text-navy-500 mb-1">实际完成时间</div>
                  <div className="font-medium text-navy-900">
                    {formData.actualFinishDate
                      ? formatDateTime(formData.actualFinishDate)
                      : '-'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-navy-700 mb-2 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  异常原因
                </h4>
                <div className="border border-navy-100 rounded-lg p-3 text-sm text-navy-700 bg-navy-50/50">
                  {formData.reason || '-'}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-navy-700 mb-2 flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  处理方案
                </h4>
                <div className="border border-navy-100 rounded-lg p-3 text-sm text-navy-700 bg-navy-50/50">
                  {formData.resolutionDetail || '-'}
                </div>
              </div>

              {formData.result && (
                <div>
                  <h4 className="text-sm font-semibold text-navy-700 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    处理结果
                  </h4>
                  <div className="border border-emerald-100 rounded-lg p-3 text-sm text-emerald-700 bg-emerald-50/50">
                    {formData.result}
                  </div>
                </div>
              )}

              {canManage && formData.status !== 'closed' && (
                <div className="border border-navy-100 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-navy-700 mb-3">状态流转</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange('processing')}
                        className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <Play className="w-4 h-4 inline mr-1" />
                        开始处理
                      </button>
                    )}
                    {formData.status === 'processing' && (
                      <>
                        <button
                          onClick={() => handleStatusChange('resolved')}
                          className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          已补齐
                        </button>
                        <button
                          onClick={() => handleStatusChange('no_action')}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4 inline mr-1" />
                          无需处理
                        </button>
                      </>
                    )}
                    {(formData.status === 'resolved' || formData.status === 'no_action') && (
                      <button
                        onClick={() => handleStatusChange('closed')}
                        className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                      >
                        <CheckSquare className="w-4 h-4 inline mr-1" />
                        关闭
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2 border-t border-navy-100">
                {canManage && (formData.status === 'pending' || formData.status === 'processing') && (
                  <button
                    onClick={handleStartEdit}
                    className="px-4 py-2 text-sm font-medium text-navy-600 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 inline mr-1" />
                    编辑
                  </button>
                )}
                {canManage && formData.status === 'pending' && (
                  <button
                    onClick={() => handleDelete(selectedException.id)}
                    className="px-4 py-2 text-sm font-medium text-danger bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    删除
                  </button>
                )}
              </div>
            </div>
          )}

          {(view === 'create' || view === 'edit') && formData && (
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-navy-700">
                {view === 'create' ? '新建异常处理单' : '编辑异常处理单'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-navy-500 mb-1">
                  关联资料
                  <span className="text-danger">*</span>
                </label>
                  <select
                    value={formData.recordId || ''}
                    onChange={(e) => {
                      const record = batchRecords.find((r) => r.id === e.target.value);
                      setFormData({
                        ...formData,
                        recordId: e.target.value || undefined,
                        materialName: record?.materialName || '',
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="">批次级异常（不关联具体资料）</option>
                    {batchRecords.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.materialName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-navy-500 mb-1">
                    异常类型
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    value={formData.anomalyType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        anomalyType: e.target.value as ExceptionRecord['anomalyType'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {Object.entries(ANOMALY_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-navy-500 mb-1">
                  异常原因
                  <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="请详细描述异常原因"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-navy-500 mb-1">
                    责任人
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.responsiblePerson || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, responsiblePerson: e.target.value })
                    }
                    placeholder="请填写责任人姓名"
                    className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-500 mb-1">
                    预计完成时间
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      formData.expectedFinishDate
                        ? formData.expectedFinishDate.slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedFinishDate: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : '',
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-navy-500 mb-1">处理方式</label>
                  <select
                    value={formData.resolution}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resolution: e.target.value as ExceptionResolution,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {Object.entries(EXCEPTION_RESOLUTION_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-navy-500 mb-1">处理状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ExceptionStatus,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {Object.entries(EXCEPTION_STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-navy-500 mb-1">处理方案详情</label>
                <textarea
                  value={formData.resolutionDetail || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, resolutionDetail: e.target.value })
                  }
                  placeholder="请描述具体的处理方案"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-navy-500 mb-1">处理结果</label>
                <textarea
                  value={formData.result || ''}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  placeholder="处理完成后的结果说明"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-navy-100">
                <button
                  onClick={() => {
                    if (view === 'edit' && selectedException) {
                      setFormData(selectedException);
                      setView('detail');
                    } else {
                      setView('list');
                      setFormData(null);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-navy-600 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  保存
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
