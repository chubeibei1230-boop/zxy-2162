import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  FileWarning,
  ClipboardCheck,
  Eye,
  Layers,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  BatchRiskDetail,
  BATCH_RISK_LABELS,
  BatchRiskLevel,
  HANDOVER_STATUS_LABELS,
  HandoverStatus,
} from '@/types';
import { cn } from '@/lib/utils';

interface RiskDashboardProps {
  onViewBatch: (batchId: string) => void;
  onOpenHandover: (batchId: string) => void;
  onOpenException: (batchId: string) => void;
}

const riskLevelConfig: Record<BatchRiskLevel, {
  icon: typeof Shield;
  color: string;
  bg: string;
  border: string;
  ring: string;
  labelBg: string;
}> = {
  normal: {
    icon: ShieldCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    ring: 'ring-emerald-500/10',
    labelBg: 'bg-emerald-100 text-emerald-700',
  },
  warning: {
    icon: ShieldAlert,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    ring: 'ring-amber-500/10',
    labelBg: 'bg-amber-100 text-amber-700',
  },
  danger: {
    icon: ShieldAlert,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    ring: 'ring-rose-500/10',
    labelBg: 'bg-rose-100 text-rose-700',
  },
};

const handoverStatusConfig: Record<string, {
  icon: typeof CheckCircle;
  color: string;
  bg: string;
}> = {
  pending: { icon: Clock, color: 'text-navy-500', bg: 'bg-navy-50' },
  in_progress: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
  completed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  exception: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
};

function ProgressBar({ value, color, size = 'md' }: { value: number; color: string; size?: 'sm' | 'md' }) {
  const heights = size === 'sm' ? 'h-1.5' : 'h-2';
  return (
    <div className={cn('w-full bg-navy-100 rounded-full overflow-hidden', heights)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300', color)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function RiskBadge({ level }: { level: BatchRiskLevel }) {
  const config = riskLevelConfig[level];
  const Icon = config.icon;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full',
      config.labelBg
    )}>
      <Icon className="w-3.5 h-3.5" />
      {BATCH_RISK_LABELS[level]}
    </span>
  );
}

function HandoverBadge({ status }: { status: HandoverStatus | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-navy-100 text-navy-500">
        <Clock className="w-3 h-3" />
        未发起
      </span>
    );
  }
  const config = handoverStatusConfig[status];
  const Icon = config.icon;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
      config.bg,
      config.color
    )}>
      <Icon className="w-3 h-3" />
      {HANDOVER_STATUS_LABELS[status]}
    </span>
  );
}

import type { LucideIcon } from 'lucide-react';

function StatMiniCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  bg,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={cn('rounded-lg p-2.5', bg)}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={cn('w-3.5 h-3.5', color)} />
        <span className={cn('text-xs font-medium', color)}>{label}</span>
      </div>
      <div className="text-lg font-bold text-navy-900">{value}</div>
      {subValue && <div className="text-xs text-navy-500 mt-0.5">{subValue}</div>}
    </div>
  );
}

function RiskCard({
  detail,
  onViewBatch,
  onOpenHandover,
  onOpenException,
}: {
  detail: BatchRiskDetail;
  onViewBatch: (batchId: string) => void;
  onOpenHandover: (batchId: string) => void;
  onOpenException: (batchId: string) => void;
}) {
  const config = riskLevelConfig[detail.riskLevel];
  const isDanger = detail.riskLevel === 'danger';
  const isWarning = detail.riskLevel === 'warning';

  const completionColor = detail.packageCompletionRate >= 100
    ? 'bg-emerald-500'
    : detail.packageCompletionRate >= 80
    ? 'bg-primary-500'
    : 'bg-amber-500';
  const exceptionColor = detail.exceptionProgress >= 100
    ? 'bg-emerald-500'
    : detail.exceptionProgress >= 60
    ? 'bg-primary-500'
    : 'bg-amber-500';

  return (
    <div
      className={cn(
        'bg-white rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden',
        isDanger && `ring-2 ring-offset-1 ${config.ring} ${config.border}`,
        !isDanger && 'border-navy-100',
        isDanger && 'relative'
      )}
    >
      {isDanger && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500" />
      )}
      {isWarning && !isDanger && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400" />
      )}

      <div className={cn('p-4', isDanger || isWarning ? 'pt-5' : '')}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 min-w-0">
                <Layers className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <h3 className="font-semibold text-navy-900 truncate">
                  {detail.courseName}
                </h3>
              </div>
              <RiskBadge level={detail.riskLevel} />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-navy-500 bg-navy-50 px-2 py-0.5 rounded border border-navy-100">
                {detail.batchNumber}
              </span>
              <HandoverBadge status={detail.handoverStatus} />
            </div>
          </div>
          <button
            onClick={() => onViewBatch(detail.batchId)}
            className="flex-shrink-0 ml-2 p-1.5 text-navy-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="查看批次详情"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatMiniCard
            icon={Package}
            label="分装完成"
            value={`${detail.packageCompletionRate}%`}
            subValue={`${detail.packageCompletion}/${detail.totalRecords}项`}
            color="text-primary-600"
            bg="bg-primary-50/60"
          />
          <StatMiniCard
            icon={FileWarning}
            label="缺漏数量"
            value={detail.deficiencyCount}
            subValue={detail.pendingReview > 0 ? `${detail.pendingReview}项待复核` : undefined}
            color={detail.deficiencyCount > 0 ? 'text-amber-600' : 'text-navy-500'}
            bg={detail.deficiencyCount > 0 ? 'bg-amber-50/60' : 'bg-navy-50/60'}
          />
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-navy-600 flex items-center gap-1">
                <Package className="w-3 h-3" />
                分装完成度
              </span>
              <span className={cn(
                'text-xs font-semibold',
                detail.packageCompletionRate >= 100 ? 'text-emerald-600' :
                detail.packageCompletionRate >= 80 ? 'text-primary-600' : 'text-amber-600'
              )}>
                {detail.packageCompletionRate}%
              </span>
            </div>
            <ProgressBar value={detail.packageCompletionRate} color={completionColor} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-navy-600 flex items-center gap-1">
                <FileWarning className="w-3 h-3" />
                异常处理进度
                {detail.exceptionStats.total > 0 && (
                  <span className="text-navy-400 font-normal">
                    ({detail.exceptionStats.total}单)
                  </span>
                )}
              </span>
              <span className={cn(
                'text-xs font-semibold',
                detail.exceptionProgress >= 100 ? 'text-emerald-600' :
                detail.exceptionProgress >= 60 ? 'text-primary-600' : 'text-amber-600'
              )}>
                {detail.exceptionStats.total > 0
                  ? `${detail.exceptionStats.closedCount}/${detail.exceptionStats.total}闭环`
                  : '无异常'}
              </span>
            </div>
            <ProgressBar
              value={detail.exceptionStats.total > 0 ? detail.exceptionProgress : 100}
              color={detail.exceptionStats.total === 0 ? 'bg-emerald-400' : exceptionColor}
              size="sm"
            />
            {detail.exceptionStats.unresolved > 0 && (
              <div className="mt-1 text-xs text-amber-600">
                {detail.exceptionStats.unresolved}个异常待处理
                {detail.exceptionStats.pending > 0 && ` (${detail.exceptionStats.pending}待处理)`}
                {detail.exceptionStats.processing > 0 && ` (${detail.exceptionStats.processing}处理中)`}
              </div>
            )}
          </div>
        </div>

        {detail.riskFactors.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-navy-600 mb-1.5">风险提示</div>
            <div className="flex flex-wrap gap-1">
              {detail.riskFactors.map((factor, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'inline-flex items-center px-1.5 py-0.5 text-xs rounded',
                    isDanger
                      ? 'bg-rose-50 text-rose-600 border border-rose-100'
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  )}
                >
                  <AlertTriangle className="w-3 h-3 mr-0.5 flex-shrink-0" />
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-3 border-t border-navy-100">
          <button
            onClick={() => onViewBatch(detail.batchId)}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-navy-700 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            查看记录
          </button>
          <button
            onClick={() => onOpenHandover(detail.batchId)}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            交接签收
          </button>
          {(detail.exceptionStats.total > 0 || detail.handoverStatus === 'exception') && (
            <button
              onClick={() => onOpenException(detail.batchId)}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                detail.exceptionStats.unresolved > 0
                  ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                  : 'text-amber-600 bg-amber-50 hover:bg-amber-100'
              )}
            >
              <FileWarning className="w-3.5 h-3.5" />
              异常处理
              {detail.exceptionStats.unresolved > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                  {detail.exceptionStats.unresolved}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function RiskSummaryPanel() {
  const { getRiskStats, getFilteredBatchRiskDetails } = useAppStore();
  const stats = getRiskStats();
  const filtered = getFilteredBatchRiskDetails();
  const filteredDanger = filtered.filter((d) => d.riskLevel === 'danger').length;
  const filteredWarning = filtered.filter((d) => d.riskLevel === 'warning').length;

  const summary = [
    {
      label: '总批次',
      value: stats.total,
      icon: Layers,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
      filterValue: filtered.length,
    },
    {
      label: '正常批次',
      value: stats.normal,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      filterValue: filtered.filter((d) => d.riskLevel === 'normal').length,
    },
    {
      label: '关注批次',
      value: stats.warning,
      icon: ShieldAlert,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      filterValue: filteredWarning,
      highlight: stats.warning > 0,
    },
    {
      label: '高风险批次',
      value: stats.danger,
      icon: ShieldAlert,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      filterValue: filteredDanger,
      highlight: stats.danger > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {summary.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={cn(
              'rounded-xl p-4 border transition-all duration-200',
              item.highlight
                ? `${item.bg} border-current/20 ring-1 ring-current/10`
                : 'bg-white border-navy-100'
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className={cn('flex items-center gap-1.5 mb-1', item.color)}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className={cn(
                  'text-2xl font-bold',
                  item.highlight ? item.color : 'text-navy-900'
                )}>
                  {item.value}
                </div>
                {item.filterValue !== item.value && (
                  <div className="text-xs text-navy-500 mt-1">
                    当前筛选 {item.filterValue}
                  </div>
                )}
              </div>
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', item.bg)}>
                <Icon className={cn('w-5 h-5', item.color)} />
              </div>
            </div>
            {item.value > 0 && (
              <div className="mt-3 pt-3 border-t border-navy-100/50">
                <ProgressBar
                  value={(item.value / Math.max(stats.total, 1)) * 100}
                  color={item.color.replace('text-', 'bg-')}
                  size="sm"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RiskDashboard({
  onViewBatch,
  onOpenHandover,
  onOpenException,
}: RiskDashboardProps) {
  const { getFilteredBatchRiskDetails } = useAppStore();
  const riskDetails = getFilteredBatchRiskDetails();

  const dangerBatches = riskDetails.filter((d) => d.riskLevel === 'danger');
  const warningBatches = riskDetails.filter((d) => d.riskLevel === 'warning');
  const normalBatches = riskDetails.filter((d) => d.riskLevel === 'normal');

  const hasActiveItems = dangerBatches.length > 0 || warningBatches.length > 0;

  return (
    <div className="space-y-5">
      <RiskSummaryPanel />

      {dangerBatches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-rose-500 rounded-full" />
            <h3 className="font-semibold text-navy-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              高风险批次
              <span className="text-xs font-normal text-navy-500">
                ({dangerBatches.length}个，需优先处理)
              </span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {dangerBatches.map((detail) => (
              <RiskCard
                key={detail.batchId}
                detail={detail}
                onViewBatch={onViewBatch}
                onOpenHandover={onOpenHandover}
                onOpenException={onOpenException}
              />
            ))}
          </div>
        </div>
      )}

      {warningBatches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-amber-500 rounded-full" />
            <h3 className="font-semibold text-navy-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              关注批次
              <span className="text-xs font-normal text-navy-500">
                ({warningBatches.length}个，建议关注)
              </span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {warningBatches.map((detail) => (
              <RiskCard
                key={detail.batchId}
                detail={detail}
                onViewBatch={onViewBatch}
                onOpenHandover={onOpenHandover}
                onOpenException={onOpenException}
              />
            ))}
          </div>
        </div>
      )}

      {normalBatches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-emerald-500 rounded-full" />
            <h3 className="font-semibold text-navy-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              正常批次
              <span className="text-xs font-normal text-navy-500">
                ({normalBatches.length}个，状态良好)
              </span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {normalBatches.map((detail) => (
              <RiskCard
                key={detail.batchId}
                detail={detail}
                onViewBatch={onViewBatch}
                onOpenHandover={onOpenHandover}
                onOpenException={onOpenException}
              />
            ))}
          </div>
        </div>
      )}

      {riskDetails.length === 0 && (
        <div className="bg-white rounded-xl shadow-card border border-navy-100 p-12 text-center">
          <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-navy-400" />
          </div>
          <h3 className="text-lg font-medium text-navy-700 mb-2">暂无批次数据</h3>
          <p className="text-sm text-navy-500">
            {hasActiveItems
              ? '当前筛选条件下无匹配的批次'
              : '请先在批次管理中创建课程批次并生成分装记录'}
          </p>
        </div>
      )}
    </div>
  );
}
