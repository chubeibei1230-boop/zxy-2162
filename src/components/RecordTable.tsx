import { ChevronDown, ChevronRight, Plus, Layers, FileText, ClipboardCheck, CheckCircle, AlertTriangle, Clock, Play, ShieldAlert, Shield, ShieldCheck } from 'lucide-react';
import { Fragment } from 'react';
import { useAppStore } from '@/store/useAppStore';
import RecordRow from './RecordRow';
import { cn } from '@/lib/utils';
import { PackageRecord, HANDOVER_STATUS_LABELS, BATCH_RISK_LABELS, BatchRiskLevel } from '@/types';

export default function RecordTable() {
  const {
    getRecordsByBatch,
    courses,
    templates,
    expandedBatches,
    toggleBatchExpand,
    generateRecordsFromTemplate,
    currentRole,
    selectedIds,
    selectAll,
    clearSelection,
    addRecord,
    handovers,
    setShowHandoverModal,
    setActiveHandoverBatchId,
    setShowExceptionModal,
    setActiveExceptionBatchId,
    setActiveExceptionHandoverId,
    getExceptionStats,
    getBatchRiskLevel,
  } = useAppStore();

  const recordsByBatch = getRecordsByBatch();
  const batchIds = Object.keys(recordsByBatch);

  const allFilteredIds = batchIds.flatMap((bid) => recordsByBatch[bid].map((r) => r.id));
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.includes(id));

  const handleToggleAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(allFilteredIds);
    }
  };

  const handleAddRecord = (batchId: string) => {
    const batch = courses.find((c) => c.id === batchId);
    if (!batch) return;
    addRecord({
      materialName: '新资料',
      category: 'handout',
      packageQuantity: 0,
      actualQuantity: 0,
      batchId: batch.id,
      courseName: batch.courseName,
      batchNumber: batch.batchNumber,
      responsiblePerson: '',
      reviewStatus: 'pending',
      hasDeficiency: false,
      deficiencyNote: '',
      replenishmentNote: '',
    });
  };

  const getBatchStats = (records: PackageRecord[]) => {
    const total = records.length;
    const deficient = records.filter((r) => r.hasDeficiency).length;
    const passed = records.filter((r) => r.reviewStatus === 'passed').length;
    const pending = records.filter((r) => r.reviewStatus === 'pending').length;
    return { total, deficient, passed, pending };
  };

  const handoverStatusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
    pending: { icon: Clock, color: 'text-navy-500', bg: 'bg-navy-50' },
    in_progress: { icon: Play, color: 'text-blue-600', bg: 'bg-blue-50' },
    completed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    exception: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  };

  const riskLevelConfig: Record<BatchRiskLevel, { icon: typeof Shield; color: string; bg: string }> = {
    normal: { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    warning: { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
    danger: { icon: ShieldAlert, color: 'text-danger', bg: 'bg-rose-50' },
  };

  const handleOpenException = (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const handover = handovers.find((h) => h.batchId === batchId);
    setActiveExceptionBatchId(batchId);
    setActiveExceptionHandoverId(handover?.id || null);
    setShowExceptionModal(true);
  };

  const handleOpenHandover = (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveHandoverBatchId(batchId);
    setShowHandoverModal(true);
  };

  if (batchIds.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card border border-navy-100 p-12 text-center">
        <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-navy-400" />
        </div>
        <h3 className="text-lg font-medium text-navy-700 mb-2">暂无分装记录</h3>
        <p className="text-sm text-navy-500 mb-4">
          {courses.length === 0
            ? '请先在批次管理中创建课程批次'
            : templates.length === 0
            ? '请先在资料模板中添加资料模板'
            : '点击"从模板生成"快速创建分装记录'}
        </p>
        {courses.length > 0 && templates.length > 0 && currentRole === 'manager' && (
          <button
            onClick={() => generateRecordsFromTemplate(courses[0].id)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            从模板生成记录
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-navy-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-navy-50 border-b border-navy-100">
            <tr>
              <th className="px-3 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleAll}
                  className="w-4 h-4 text-primary-600 border-navy-300 rounded focus:ring-primary-500 cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider">
                资料名称
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider w-24">
                类别
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-navy-600 uppercase tracking-wider w-20">
                包内数量
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-navy-600 uppercase tracking-wider w-24">
                实际数量
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider w-44">
                课程/批次
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider w-24">
                负责人
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider w-24">
                复核状态
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider w-32">
                缺漏情况
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-navy-600 uppercase tracking-wider w-36">
                补装备注
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-navy-600 uppercase tracking-wider w-20">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {batchIds.map((batchId) => {
              const batch = courses.find((c) => c.id === batchId);
              const records = recordsByBatch[batchId];
              const isExpanded = expandedBatches[batchId] ?? true;
              const stats = getBatchStats(records);
              const handover = handovers.find((h) => h.batchId === batchId);
              const hStatus = handover?.signStatus;
              const hConfig = hStatus ? handoverStatusConfig[hStatus] : null;
              const HIcon = hConfig?.icon;
              const exceptionStats = getExceptionStats(batchId);
              const riskLevel = getBatchRiskLevel(batchId);
              const riskConfig = riskLevelConfig[riskLevel];
              const RiskIcon = riskConfig.icon;
              const unresolvedExceptions = exceptionStats.pending + exceptionStats.processing;
              const closedExceptions = exceptionStats.resolved + exceptionStats.closed + exceptionStats.noAction;

              return (
                <Fragment key={batchId}>
                  <tr
                    key={`header-${batchId}`}
                    className="bg-primary-50/60 cursor-pointer hover:bg-primary-50 transition-colors"
                    onClick={() => toggleBatchExpand(batchId)}
                  >
                    <td colSpan={11} className="px-3 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-primary-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-primary-600" />
                          )}
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-primary-600" />
                            <span className="font-semibold text-primary-700">
                              {batch?.courseName || '未知课程'}
                            </span>
                            <span className="text-sm text-primary-500 bg-white px-2 py-0.5 rounded border border-primary-100">
                              {batch?.batchNumber || '-'}
                            </span>
                          </div>
                          {hStatus && HIcon && (
                            <button
                              onClick={(e) => handleOpenHandover(batchId, e)}
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
                                hConfig?.bg,
                                hConfig?.color
                              )}
                            >
                              <HIcon className="w-3 h-3" />
                              {HANDOVER_STATUS_LABELS[hStatus]}
                            </button>
                          )}
                          {exceptionStats.total > 0 && (
                            <button
                              onClick={(e) => handleOpenException(batchId, e)}
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
                                riskConfig.bg,
                                riskConfig.color
                              )}
                            >
                              <RiskIcon className="w-3 h-3" />
                              {BATCH_RISK_LABELS[riskLevel]}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-navy-600">
                            共 <span className="font-medium text-navy-800">{stats.total}</span> 项
                          </span>
                          <span className="text-emerald-600">
                            已通过 <span className="font-medium">{stats.passed}</span>
                          </span>
                          <span className="text-amber-600">
                            缺漏 <span className="font-medium">{stats.deficient}</span>
                          </span>
                          <span className="text-navy-500">
                            待复核 <span className="font-medium">{stats.pending}</span>
                          </span>
                          {exceptionStats.total > 0 && (
                            <button
                              onClick={(e) => handleOpenException(batchId, e)}
                              className="text-amber-600 hover:text-amber-700 hover:underline"
                            >
                              异常 <span className="font-medium">{exceptionStats.total}</span>
                              {unresolvedExceptions > 0 && (
                                <span className="text-danger">
                                  （待处理 {unresolvedExceptions}）
                                </span>
                              )}
                            </button>
                          )}
                          {closedExceptions > 0 && (
                            <span className="text-emerald-600">
                              已闭环 <span className="font-medium">{closedExceptions}</span>
                            </span>
                          )}
                          {!hStatus && currentRole === 'manager' && (
                            <button
                              onClick={(e) => handleOpenHandover(batchId, e)}
                              className="ml-1 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 bg-white border border-primary-200 rounded hover:bg-primary-50 transition-colors"
                            >
                              <ClipboardCheck className="w-3 h-3" />
                              发起交接
                            </button>
                          )}
                          {currentRole === 'manager' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddRecord(batchId);
                              }}
                              className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 bg-white border border-primary-200 rounded hover:bg-primary-50 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              添加记录
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  {isExpanded &&
                    records.map((record) => (
                      <RecordRow key={record.id} record={record} />
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
