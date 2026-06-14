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

export interface Filters {
  courseName: string;
  category: string;
  reviewStatus: string;
  responsiblePerson: string;
  hasDeficiency: string;
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

export const ROLE_LABELS: Record<UserRole, string> = {
  manager: '管理者',
  executor: '执行者',
  reviewer: '复核者',
};
