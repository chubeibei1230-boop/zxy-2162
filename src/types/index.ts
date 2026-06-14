export type UserRole = 'manager' | 'executor' | 'reviewer';

export type ReviewStatus = 'pending' | 'passed' | 'failed';

export type MaterialCategory = 'handout' | 'worksheet' | 'certificate' | 'supplies' | 'other';

export interface CourseBatch {
  id: string;
  courseName: string;
  batchNumber: string;
  createdAt: string;
}

export interface MaterialTemplate {
  id: string;
  materialName: string;
  category: MaterialCategory;
  packageQuantity: number;
  description?: string;
}

export interface PackageRecord {
  id: string;
  materialName: string;
  category: MaterialCategory;
  packageQuantity: number;
  actualQuantity: number;
  batchId: string;
  courseName: string;
  batchNumber: string;
  responsiblePerson: string;
  reviewStatus: ReviewStatus;
  hasDeficiency: boolean;
  deficiencyNote: string;
  replenishmentNote: string;
  createdAt: string;
  updatedAt: string;
}

export type HandoverStatus = 'pending' | 'in_progress' | 'completed' | 'exception';

export interface HandoverItemAnomaly {
  recordId: string;
  materialName: string;
  anomalyType: 'missing' | 'damaged' | 'wrong' | 'other';
  note: string;
}

export interface HandoverRecord {
  id: string;
  batchId: string;
  courseName: string;
  batchNumber: string;
  handoverPerson: string;
  receiverPerson: string;
  handoverTime: string;
  signStatus: HandoverStatus;
  exceptionNote: string;
  expectedCount: number;
  actualCount: number;
  missingCount: number;
  replenishedCount: number;
  anomalies: HandoverItemAnomaly[];
  completedTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface Filters {
  courseName: string;
  category: string;
  reviewStatus: string;
  responsiblePerson: string;
  hasDeficiency: string;
  handoverStatus: string;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  field: string;
  message: string;
}

export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  handout: '讲义资料',
  worksheet: '练习册',
  certificate: '证书类',
  supplies: '文具用品',
  other: '其他',
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: '待复核',
  passed: '已通过',
  failed: '有缺漏',
};

export const HANDOVER_STATUS_LABELS: Record<HandoverStatus, string> = {
  pending: '待签收',
  in_progress: '签收中',
  completed: '已完成',
  exception: '有异常',
};

export const ANOMALY_TYPE_LABELS: Record<HandoverItemAnomaly['anomalyType'], string> = {
  missing: '缺漏',
  damaged: '损坏',
  wrong: '错发',
  other: '其他',
};

export type ExceptionStatus = 'pending' | 'processing' | 'resolved' | 'no_action' | 'closed';

export type ExceptionResolution = 'reissue' | 'refund' | 'replacement' | 'other';

export interface ExceptionRecord {
  id: string;
  handoverId: string;
  batchId: string;
  courseName: string;
  batchNumber: string;
  recordId?: string;
  materialName?: string;
  anomalyType: 'missing' | 'damaged' | 'wrong' | 'other';
  reason: string;
  responsiblePerson: string;
  resolution: ExceptionResolution;
  resolutionDetail: string;
  expectedFinishDate: string;
  actualFinishDate: string;
  status: ExceptionStatus;
  result: string;
  createdAt: string;
  updatedAt: string;
}

export const EXCEPTION_STATUS_LABELS: Record<ExceptionStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已补齐',
  no_action: '无需处理',
  closed: '已关闭',
};

export const EXCEPTION_RESOLUTION_LABELS: Record<ExceptionResolution, string> = {
  reissue: '补发',
  refund: '退款',
  replacement: '换货',
  other: '其他',
};

export type BatchRiskLevel = 'normal' | 'warning' | 'danger';

export const BATCH_RISK_LABELS: Record<BatchRiskLevel, string> = {
  normal: '正常',
  warning: '关注',
  danger: '高风险',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  manager: '管理者',
  executor: '执行者',
  reviewer: '复核者',
};
