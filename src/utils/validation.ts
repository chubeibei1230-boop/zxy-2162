import { PackageRecord, ValidationIssue, CourseBatch } from '@/types';

export const WORKLOAD_THRESHOLD = 8;

export function validateQuantity(
  actualQty: number,
  packageQty: number
): boolean {
  return actualQty >= packageQty;
}

export function validateDeficiencyNote(
  hasDeficiency: boolean,
  note: string
): boolean {
  if (hasDeficiency) {
    return note.trim().length > 0;
  }
  return true;
}

export function validateStatusConsistency(
  reviewStatus: string,
  hasDeficiency: boolean
): boolean {
  if (reviewStatus === 'passed' && hasDeficiency) {
    return false;
  }
  if (reviewStatus === 'failed' && !hasDeficiency) {
    return false;
  }
  return true;
}

export function validateBatchDuplicate(
  batchId: string,
  courseName: string,
  batchNumber: string,
  courses: CourseBatch[]
): boolean {
  return !courses.some(
    (c) =>
      c.id !== batchId &&
      c.courseName === courseName &&
      c.batchNumber === batchNumber
  );
}

export function validateWorkload(
  person: string,
  records: PackageRecord[],
  excludeId?: string
): boolean {
  const count = records.filter(
    (r) => r.responsiblePerson === person && r.id !== excludeId
  ).length;
  return count < WORKLOAD_THRESHOLD;
}

export function runRecordValidations(
  record: PackageRecord,
  allRecords: PackageRecord[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!validateQuantity(record.actualQuantity, record.packageQuantity)) {
    issues.push({
      type: 'warning',
      field: 'actualQuantity',
      message: '实际准备数量少于包内数量',
    });
  }

  if (!validateDeficiencyNote(record.hasDeficiency, record.deficiencyNote)) {
    issues.push({
      type: 'error',
      field: 'deficiencyNote',
      message: '存在缺漏但未填写缺漏说明',
    });
  }

  if (
    !validateStatusConsistency(record.reviewStatus, record.hasDeficiency)
  ) {
    issues.push({
      type: 'warning',
      field: 'reviewStatus',
      message: '复核状态与缺漏情况不一致',
    });
  }

  if (
    !validateWorkload(record.responsiblePerson, allRecords, record.id)
  ) {
    issues.push({
      type: 'warning',
      field: 'responsiblePerson',
      message: `该负责人任务过多（超过${WORKLOAD_THRESHOLD}条）`,
    });
  }

  return issues;
}

export function getRecordIssueCount(
  record: PackageRecord,
  allRecords: PackageRecord[]
): { errors: number; warnings: number } {
  const issues = runRecordValidations(record, allRecords);
  return {
    errors: issues.filter((i) => i.type === 'error').length,
    warnings: issues.filter((i) => i.type === 'warning').length,
  };
}

export function hasRecordIssues(
  record: PackageRecord,
  allRecords: PackageRecord[]
): boolean {
  const { errors, warnings } = getRecordIssueCount(record, allRecords);
  return errors > 0 || warnings > 0;
}
