import { useEffect, useState } from 'react';
import {
  X,
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Play,
  Flag,
  Plus,
  Trash2,
  FileWarning,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  HANDOVER_STATUS_LABELS,
  ANOMALY_TYPE_LABELS,
  EXCEPTION_STATUS_LABELS,
  HandoverItemAnomaly,
  HandoverStatus,
} from '@/types';
import { formatDateTime } from '@/utils/helpers';
import { cn } from '@/lib/utils';

type ModalView = 'list' | 'detail' | 'create' | 'sign';

export default function HandoverModal() {
  const {
    showHandoverModal,
    setShowHandoverModal,
    handovers,
    courses,
    records,
    activeHandoverBatchId,
    setActiveHandoverBatchId,
    createHandover,
    startHandoverSign,
    completeHandoverSign,
    markHandoverException,
    addHandoverAnomaly,
    removeHandoverAnomaly,
    currentRole,
    exceptions,
    setShowExceptionModal,
    setActiveExceptionBatchId,
    setActiveExceptionHandoverId,
    getExceptionStats,
  } = useAppStore();

  const [view, setView] = useState<ModalView>('list');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [createPerson, setCreatePerson] = useState('');
  const [createBatchId, setCreateBatchId] = useState('');
  const [signReceiver, setSignReceiver] = useState('');
  const [exceptionNote, setExceptionNote] = useState('');
  const [anomalyRecordId, setAnomalyRecordId] = useState('');
  const [anomalyType, setAnomalyType] = useState<HandoverItemAnomaly['anomalyType']>('missing');
  const [anomalyNote, setAnomalyNote] = useState('');

  const selectedHandover = selectedBatchId
    ? handovers.find((h) => h.batchId === selectedBatchId)
    : null;

  const batchesWithoutHandover = courses.filter(
    (c) => !handovers.some((h) => h.batchId === c.id)
  );

  const canCreate = currentRole === 'manager';
  const canSign = currentRole === 'manager' || currentRole === 'executor';

  const isBatchReadyForHandover = (batchId: string) => {
    const batchRecords = records.filter((r) => r.batchId === batchId);
    return batchRecords.length > 0 && batchRecords.every((r) => r.reviewStatus !== 'pending');
  };

  useEffect(() => {
    if (!showHandoverModal || !activeHandoverBatchId) return;

    const handover = handovers.find((h) => h.batchId === activeHandoverBatchId);
    setSelectedBatchId(activeHandoverBatchId);
    if (handover) {
      setView('detail');
    } else {
      setCreateBatchId(activeHandoverBatchId);
      setView('list');
    }
  }, [activeHandoverBatchId, handovers, showHandoverModal]);

  const statusConfig: Record<
    HandoverStatus,
    { icon: typeof CheckCircle; color: string; bg: string }
  > = {
    pending: { icon: Clock, color: 'text-navy-500', bg: 'bg-navy-50' },
    in_progress: { icon: Play, color: 'text-blue-600', bg: 'bg-blue-50' },
    completed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    exception: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  };

  const handleCreate = () => {
    if (!createBatchId || !createPerson.trim()) {
      alert('请选择批次并填写交接人');
      return;
    }
    const created = createHandover(createBatchId, createPerson.trim());
    if (!created) return;
    setSelectedBatchId(createBatchId);
    setView('detail');
    setCreatePerson('');
    setCreateBatchId('');
  };

  const handleStartSign = () => {
    if (!selectedHandover) return;
    if (!signReceiver.trim()) {
      alert('请填写接收人');
      return;
    }
    startHandoverSign(selectedHandover.id, signReceiver.trim());
    setSignReceiver('');
  };

  const handleComplete = () => {
    if (!selectedHandover) return;
    completeHandoverSign(selectedHandover.id);
  };

  const handleMarkException = () => {
    if (!selectedHandover) return;
    if (!exceptionNote.trim()) {
      alert('请填写异常说明');
      return;
    }
    markHandoverException(selectedHandover.id, exceptionNote.trim());
    setExceptionNote('');
  };

  const handleAddAnomaly = () => {
    if (!selectedHandover) return;
    if (!anomalyRecordId || !anomalyNote.trim()) {
      alert('请选择资料项并填写备注');
      return;
    }
    const record = records.find((r) => r.id === anomalyRecordId);
    if (!record) return;
    addHandoverAnomaly(selectedHandover.id, {
      recordId: anomalyRecordId,
      materialName: record.materialName,
      anomalyType,
      note: anomalyNote.trim(),
    });
    setAnomalyRecordId('');
    setAnomalyNote('');
    setAnomalyType('missing');
  };

  const handleOpenException = () => {
    if (!selectedHandover) return;
    setActiveExceptionHandoverId(selectedHandover.id);
    setActiveExceptionBatchId(selectedHandover.batchId);
    setShowExceptionModal(true);
  };

  const handleClose = () => {
    setShowHandoverModal(false);
    setActiveHandoverBatchId(null);
    setView('list');
    setSelectedBatchId('');
  };

  const handleViewDetail = (batchId: string) => {
    setSelectedBatchId(batchId);
    setView('detail');
  };

  const batchRecords = selectedBatchId
    ? records.filter((r) => r.batchId === selectedBatchId)
    : [];

  if (!showHandoverModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-900">交接签收</h2>
              <p className="text-xs text-navy-500">管理课程批次的资料包交接与签收流程</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view !== 'list' && (
              <button
                onClick={() => {
                  setView('list');
                  setSelectedBatchId('');
                }}
                className="px-3 py-1.5 text-sm font-medium text-navy-600 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors"
              >
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
              {canCreate && batchesWithoutHandover.length > 0 && (
                <div className="mb-6 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                  <h3 className="text-sm font-semibold text-primary-700 mb-3">发起新交接</h3>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-navy-500 mb-1">选择批次</label>
                      <select
                        value={createBatchId}
                        onChange={(e) => setCreateBatchId(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      >
                        <option value="">请选择课程批次</option>
                        {batchesWithoutHandover.map((c) => (
                          <option
                            key={c.id}
                            value={c.id}
                            disabled={!isBatchReadyForHandover(c.id)}
                          >
                            {c.courseName} - {c.batchNumber}
                            {!isBatchReadyForHandover(c.id) ? '（待完成分装/复核）' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-navy-500 mb-1">交接人</label>
                      <input
                        type="text"
                        value={createPerson}
                        onChange={(e) => setCreatePerson(e.target.value)}
                        placeholder="请填写交接人姓名"
                        className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </div>
                    <button
                      onClick={handleCreate}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors whitespace-nowrap"
                    >
                      发起交接
                    </button>
                  </div>
                </div>
              )}

              {handovers.length === 0 ? (
                <div className="text-center py-12 text-navy-400">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无交接签收记录</p>
                  {canCreate && (
                    <p className="text-xs mt-2">请在上方选择批次并发起交接流程</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {handovers.map((handover) => {
                    const StatusIcon = statusConfig[handover.signStatus].icon;
                    return (
                      <div
                        key={handover.id}
                        className="border border-navy-100 rounded-xl p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors cursor-pointer"
                        onClick={() => handleViewDetail(handover.batchId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center',
                                statusConfig[handover.signStatus].bg
                              )}
                            >
                              <StatusIcon
                                className={cn(
                                  'w-5 h-5',
                                  statusConfig[handover.signStatus].color
                                )}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-navy-900">
                                {handover.courseName}
                              </div>
                              <div className="text-xs text-navy-500">
                                {handover.batchNumber}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <div className="text-navy-600">
                                交接人：{handover.handoverPerson || '-'}
                              </div>
                              <div className="text-navy-500 text-xs">
                                接收人：{handover.receiverPerson || '待指定'}
                              </div>
                            </div>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full',
                                statusConfig[handover.signStatus].bg,
                                statusConfig[handover.signStatus].color
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {HANDOVER_STATUS_LABELS[handover.signStatus]}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-6 text-xs text-navy-500">
                          <span>
                            应发 <span className="font-medium text-navy-700">{handover.expectedCount}</span> 项
                          </span>
                          <span>
                            实发 <span className="font-medium text-navy-700">{handover.actualCount}</span> 项
                          </span>
                          {handover.missingCount > 0 && (
                            <span className="text-amber-600">
                              缺漏 <span className="font-medium">{handover.missingCount}</span> 项
                            </span>
                          )}
                          {handover.replenishedCount > 0 && (
                            <span className="text-emerald-600">
                              补装 <span className="font-medium">{handover.replenishedCount}</span> 项
                            </span>
                          )}
                          {handover.handoverTime && (
                            <span>交接时间：{formatDateTime(handover.handoverTime)}</span>
                          )}
                        </div>
                        {handover.exceptionNote && (
                          <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                            异常说明：{handover.exceptionNote}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {view === 'detail' && selectedHandover && (
            <div className="p-6 space-y-6">
              <div className="bg-navy-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-navy-900">
                    {selectedHandover.courseName} - {selectedHandover.batchNumber}
                  </h3>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full',
                      statusConfig[selectedHandover.signStatus].bg,
                      statusConfig[selectedHandover.signStatus].color
                    )}
                  >
                    {HANDOVER_STATUS_LABELS[selectedHandover.signStatus]}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-navy-900">
                      {selectedHandover.expectedCount}
                    </div>
                    <div className="text-xs text-navy-500">应发项数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary-700">
                      {selectedHandover.actualCount}
                    </div>
                    <div className="text-xs text-primary-600">实发项数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-600">
                      {selectedHandover.missingCount}
                    </div>
                    <div className="text-xs text-amber-600">缺漏项数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-600">
                      {selectedHandover.replenishedCount}
                    </div>
                    <div className="text-xs text-emerald-600">补装项数</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="border border-navy-100 rounded-lg p-3">
                  <div className="text-xs text-navy-500 mb-1">交接人</div>
                  <div className="font-medium text-navy-900">
                    {selectedHandover.handoverPerson}
                  </div>
                </div>
                <div className="border border-navy-100 rounded-lg p-3">
                  <div className="text-xs text-navy-500 mb-1">接收人</div>
                  <div className="font-medium text-navy-900">
                    {selectedHandover.receiverPerson || '待指定'}
                  </div>
                </div>
                <div className="border border-navy-100 rounded-lg p-3">
                  <div className="text-xs text-navy-500 mb-1">交接时间</div>
                  <div className="font-medium text-navy-900">
                    {selectedHandover.handoverTime
                      ? formatDateTime(selectedHandover.handoverTime)
                      : '待发起'}
                  </div>
                </div>
                <div className="border border-navy-100 rounded-lg p-3">
                  <div className="text-xs text-navy-500 mb-1">完成时间</div>
                  <div className="font-medium text-navy-900">
                    {selectedHandover.completedTime
                      ? formatDateTime(selectedHandover.completedTime)
                      : '待签收'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-navy-700 mb-3">批次资料明细</h4>
                <div className="border border-navy-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-navy-50 border-b border-navy-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-navy-600">
                          资料名称
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-navy-600">
                          应发
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-navy-600">
                          实发
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-navy-600">
                          状态
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-navy-600">
                          缺漏说明
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchRecords.map((record) => {
                        const isAnomaly = selectedHandover.anomalies.some(
                          (a) => a.recordId === record.id
                        );
                        return (
                          <tr
                            key={record.id}
                            className={cn(
                              'border-b border-navy-50',
                              isAnomaly && 'bg-amber-50/50'
                            )}
                          >
                            <td className="px-3 py-2 font-medium text-navy-900">
                              {record.materialName}
                              {isAnomaly && (
                                <span className="ml-1 text-xs text-amber-600">⚠ 异常</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center text-navy-700">
                              {record.packageQuantity}
                            </td>
                            <td
                              className={cn(
                                'px-3 py-2 text-center font-medium',
                                record.actualQuantity < record.packageQuantity
                                  ? 'text-danger'
                                  : 'text-navy-900'
                              )}
                            >
                              {record.actualQuantity}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span
                                className={cn(
                                  'inline-flex items-center text-xs px-2 py-0.5 rounded-full',
                                  record.reviewStatus === 'passed'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : record.reviewStatus === 'failed'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-navy-100 text-navy-600'
                                )}
                              >
                                {record.reviewStatus === 'passed'
                                  ? '已通过'
                                  : record.reviewStatus === 'failed'
                                  ? '有缺漏'
                                  : '待复核'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs text-navy-500">
                              {record.hasDeficiency ? record.deficiencyNote || '有缺漏' : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedHandover.anomalies.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-navy-700 mb-3">
                    异常资料标记
                    <span className="ml-2 text-xs font-normal text-amber-600">
                      {selectedHandover.anomalies.length} 项
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {selectedHandover.anomalies.map((anomaly) => (
                      <div
                        key={anomaly.recordId}
                        className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-navy-900 text-sm">
                              {anomaly.materialName}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                              {ANOMALY_TYPE_LABELS[anomaly.anomalyType]}
                            </span>
                          </div>
                          <p className="text-xs text-navy-600 mt-0.5">{anomaly.note}</p>
                        </div>
                        {selectedHandover.signStatus !== 'completed' && canSign && (
                          <button
                            onClick={() =>
                              removeHandoverAnomaly(selectedHandover.id, anomaly.recordId)
                            }
                            className="p-1 text-navy-400 hover:text-danger hover:bg-rose-50 rounded transition-colors flex-shrink-0"
                            title="移除异常标记"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(() => {
                const batchExceptions = exceptions.filter(
                  (e) => e.handoverId === selectedHandover.id
                );
                const exceptionStats = getExceptionStats(selectedHandover.batchId);
                const unresolved = exceptionStats.pending + exceptionStats.processing;
                const closed = exceptionStats.resolved + exceptionStats.closed + exceptionStats.noAction;

                return (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-navy-700 flex items-center gap-1">
                        <FileWarning className="w-4 h-4 text-amber-600" />
                        异常闭环处理
                        <span className="ml-2 text-xs font-normal text-navy-500">
                          共 {batchExceptions.length} 条
                        </span>
                      </h4>
                      <button
                        onClick={handleOpenException}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        管理异常单
                      </button>
                    </div>

                    {batchExceptions.length === 0 ? (
                      <div className="text-center py-6 text-navy-400 text-sm bg-navy-50/50 rounded-lg border border-dashed border-navy-200">
                        暂无异常处理记录
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {batchExceptions.slice(0, 3).map((exc) => (
                          <div
                            key={exc.id}
                            className="flex items-center gap-3 p-3 bg-navy-50/50 border border-navy-100 rounded-lg"
                          >
                            <div
                              className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                exc.status === 'pending'
                                  ? 'bg-navy-100'
                                  : exc.status === 'processing'
                                  ? 'bg-blue-100'
                                  : exc.status === 'resolved'
                                  ? 'bg-emerald-100'
                                  : exc.status === 'closed'
                                  ? 'bg-purple-100'
                                  : 'bg-gray-100'
                              )}
                            >
                              <FileWarning
                                className={cn(
                                  'w-4 h-4',
                                  exc.status === 'pending'
                                    ? 'text-navy-600'
                                    : exc.status === 'processing'
                                    ? 'text-blue-600'
                                    : exc.status === 'resolved'
                                    ? 'text-emerald-600'
                                    : exc.status === 'closed'
                                    ? 'text-purple-600'
                                    : 'text-gray-600'
                                )}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-navy-900">
                                  {exc.materialName || '批次级异常'}
                                </span>
                                <span
                                  className={cn(
                                    'text-xs px-1.5 py-0.5 rounded',
                                    exc.status === 'pending'
                                      ? 'bg-navy-100 text-navy-700'
                                      : exc.status === 'processing'
                                      ? 'bg-blue-100 text-blue-700'
                                      : exc.status === 'resolved'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : exc.status === 'closed'
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-gray-100 text-gray-700'
                                  )}
                                >
                                  {EXCEPTION_STATUS_LABELS[exc.status]}
                                </span>
                              </div>
                              <p className="text-xs text-navy-500 mt-0.5 line-clamp-1">
                                {exc.reason}
                              </p>
                            </div>
                          </div>
                        ))}
                        {batchExceptions.length > 3 && (
                          <button
                            onClick={handleOpenException}
                            className="w-full text-center text-xs text-navy-500 hover:text-navy-700 py-1"
                          >
                            查看全部 {batchExceptions.length} 条异常处理记录 →
                          </button>
                        )}
                      </div>
                    )}

                    {batchExceptions.length > 0 && (
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <span className="text-navy-500">
                          待处理 <span className="font-medium text-amber-600">{unresolved}</span> 项
                        </span>
                        <span className="text-navy-500">
                          已闭环 <span className="font-medium text-emerald-600">{closed}</span> 项
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {selectedHandover.signStatus !== 'completed' && !selectedHandover.completedTime && canSign && (
                <div className="border border-navy-100 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-navy-700">签收操作</h4>

                  {selectedHandover.signStatus === 'pending' && (
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-navy-500 mb-1">接收人</label>
                        <input
                          type="text"
                          value={signReceiver}
                          onChange={(e) => setSignReceiver(e.target.value)}
                          placeholder="请填写接收人姓名"
                          className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                      </div>
                      <button
                        onClick={handleStartSign}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
                      >
                        开始签收
                      </button>
                    </div>
                  )}

                  {(selectedHandover.signStatus === 'in_progress' || selectedHandover.signStatus === 'exception') && (
                    <div className="space-y-4">
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-navy-500 mb-1">
                            标记异常资料
                          </label>
                          <select
                            value={anomalyRecordId}
                            onChange={(e) => setAnomalyRecordId(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          >
                            <option value="">选择资料项</option>
                            {batchRecords
                              .filter(
                                (r) =>
                                  !selectedHandover.anomalies.some(
                                    (a) => a.recordId === r.id
                                  )
                              )
                              .map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.materialName}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="w-28">
                          <label className="block text-xs text-navy-500 mb-1">异常类型</label>
                          <select
                            value={anomalyType}
                            onChange={(e) =>
                              setAnomalyType(
                                e.target.value as HandoverItemAnomaly['anomalyType']
                              )
                            }
                            className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          >
                            {Object.entries(ANOMALY_TYPE_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-navy-500 mb-1">备注</label>
                          <input
                            type="text"
                            value={anomalyNote}
                            onChange={(e) => setAnomalyNote(e.target.value)}
                            placeholder="异常说明"
                            className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          />
                        </div>
                        <button
                          onClick={handleAddAnomaly}
                          className="px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Plus className="w-4 h-4 inline-block mr-1" />
                          标记异常
                        </button>
                      </div>

                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-navy-500 mb-1">异常说明</label>
                          <input
                            type="text"
                            value={exceptionNote}
                            onChange={(e) => setExceptionNote(e.target.value)}
                            placeholder="填写批次级异常说明（可选）"
                            className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          />
                        </div>
                        <button
                          onClick={handleMarkException}
                          className="px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Flag className="w-4 h-4 inline-block mr-1" />
                          标记异常
                        </button>
                      </div>

                      <div className="flex gap-3 pt-2 border-t border-navy-100">
                        <button
                          onClick={handleComplete}
                          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 inline-block mr-1" />
                          确认签收完成
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedHandover.signStatus === 'exception' && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                        该批次存在异常：
                        {selectedHandover.exceptionNote || '请查看异常资料标记'}
                      </div>

                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-navy-500 mb-1">
                            更新异常说明
                          </label>
                          <input
                            type="text"
                            value={exceptionNote}
                            onChange={(e) => setExceptionNote(e.target.value)}
                            placeholder="更新异常说明"
                            className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          />
                        </div>
                        <button
                          onClick={handleMarkException}
                          className="px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap"
                        >
                          更新说明
                        </button>
                      </div>

                      <div className="flex gap-3 pt-2 border-t border-navy-100">
                        <button
                          onClick={handleComplete}
                          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 inline-block mr-1" />
                          确认签收完成
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(selectedHandover.signStatus === 'completed' || selectedHandover.completedTime) && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-medium text-emerald-700">
                    {selectedHandover.signStatus === 'exception' ? '异常签收已确认' : '签收已完成'}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    完成时间：{formatDateTime(selectedHandover.completedTime)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
