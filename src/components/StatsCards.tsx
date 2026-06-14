import { FileText, AlertTriangle, CheckCircle, Clock, ClipboardCheck, FileWarning, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function StatsCards() {
  const { getFilteredRecords, handovers, exceptions } = useAppStore();
  const records = getFilteredRecords();

  const total = records.length;
  const deficiencyCount = records.filter((r) => r.hasDeficiency).length;
  const passedCount = records.filter((r) => r.reviewStatus === 'passed').length;
  const pendingCount = records.filter((r) => r.reviewStatus === 'pending').length;
  const reviewRate = total > 0 ? Math.round(((total - pendingCount) / total) * 100) : 0;

  const batchIdsFromRecords = [...new Set(records.map((r) => r.batchId))];
  const completedBatches = batchIdsFromRecords.filter((bid) =>
    handovers.some((h) => h.batchId === bid && h.signStatus === 'completed')
  ).length;
  const exceptionBatches = batchIdsFromRecords.filter((bid) =>
    handovers.some((h) => h.batchId === bid && h.signStatus === 'exception')
  ).length;
  const pendingSignBatches = batchIdsFromRecords.filter((bid) => {
    const h = handovers.find((hv) => hv.batchId === bid);
    return h && (h.signStatus === 'pending' || h.signStatus === 'in_progress');
  }).length;
  const handoverRate = batchIdsFromRecords.length > 0
    ? Math.round((completedBatches / batchIdsFromRecords.length) * 100)
    : 0;

  const totalExceptions = exceptions.length;
  const pendingExceptions = exceptions.filter((e) => e.status === 'pending').length;
  const processingExceptions = exceptions.filter((e) => e.status === 'processing').length;
  const unresolvedExceptions = pendingExceptions + processingExceptions;
  const closedExceptions = exceptions.filter(
    (e) => e.status === 'resolved' || e.status === 'closed' || e.status === 'no_action'
  ).length;
  const closeRate = totalExceptions > 0
    ? Math.round((closedExceptions / totalExceptions) * 100)
    : 0;

  const stats = [
    {
      label: '总记录数',
      value: total,
      icon: FileText,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-100',
    },
    {
      label: '缺漏记录',
      value: deficiencyCount,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      label: '已通过',
      value: passedCount,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      label: '已复核比例',
      value: `${reviewRate}%`,
      icon: Clock,
      color: 'text-navy-600',
      bgColor: 'bg-navy-50',
      borderColor: 'border-navy-100',
      subtext: `${total - pendingCount} / ${total} 条`,
    },
    {
      label: '已签收批次',
      value: completedBatches,
      icon: ClipboardCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      subtext: `签收率 ${handoverRate}%`,
    },
    {
      label: '异常批次',
      value: exceptionBatches,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      subtext: pendingSignBatches > 0 ? `${pendingSignBatches} 批次待签收` : undefined,
    },
    {
      label: '异常总数',
      value: totalExceptions,
      icon: FileWarning,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      subtext: `待处理 ${unresolvedExceptions} 条`,
    },
    {
      label: '已闭环异常',
      value: closedExceptions,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      subtext: `闭环率 ${closeRate}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-white rounded-xl p-5 border ${stat.borderColor} shadow-card hover:shadow-card-hover transition-shadow duration-200`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-navy-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-navy-900 mt-1">{stat.value}</p>
              {stat.subtext && (
                <p className="text-xs text-navy-400 mt-1">{stat.subtext}</p>
              )}
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
