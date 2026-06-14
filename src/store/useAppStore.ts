import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CourseBatch,
  MaterialTemplate,
  PackageRecord,
  Filters,
  UserRole,
  ReviewStatus,
  HandoverRecord,
  HandoverStatus,
  HandoverItemAnomaly,
} from '@/types';
import { generateId } from '@/utils/helpers';
import { mockCourses, mockTemplates, mockRecords, mockHandovers } from '@/data/mockData';

const getHandoverStats = (
  records: PackageRecord[],
  batchId: string,
  anomalies: HandoverItemAnomaly[] = []
) => {
  const batchRecords = records.filter((r) => r.batchId === batchId);
  const missingIds = new Set(
    batchRecords
      .filter((r) => r.actualQuantity < r.packageQuantity)
      .map((r) => r.id)
  );

  anomalies.forEach((a) => {
    if (a.anomalyType === 'missing') {
      missingIds.add(a.recordId);
    }
  });

  return {
    expectedCount: batchRecords.length,
    actualCount: batchRecords.filter((r) => r.actualQuantity >= r.packageQuantity).length,
    missingCount: missingIds.size,
    replenishedCount: batchRecords.filter((r) => r.replenishmentNote.trim().length > 0).length,
  };
};

const syncHandoversWithRecords = (
  handovers: HandoverRecord[],
  records: PackageRecord[]
) =>
  handovers.map((h) => {
    const batchRecords = records.filter((r) => r.batchId === h.batchId);
    const anomalies = h.anomalies
      .map((a) => {
        const record = batchRecords.find((r) => r.id === a.recordId);
        return record ? { ...a, materialName: record.materialName } : null;
      })
      .filter((a): a is HandoverItemAnomaly => Boolean(a));

    return {
      ...h,
      anomalies,
      ...getHandoverStats(records, h.batchId, anomalies),
    };
  });

interface AppState {
  courses: CourseBatch[];
  templates: MaterialTemplate[];
  records: PackageRecord[];
  handovers: HandoverRecord[];
  filters: Filters;
  currentRole: UserRole;
  expandedBatches: Record<string, boolean>;
  selectedIds: string[];
  showBatchModal: boolean;
  showTemplateModal: boolean;
  showPreview: boolean;
  showHandoverModal: boolean;
  editingRecordId: string | null;
  activeHandoverBatchId: string | null;

  setCurrentRole: (role: UserRole) => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;

  addCourse: (course: Omit<CourseBatch, 'id' | 'createdAt'>) => void;
  updateCourse: (id: string, course: Partial<CourseBatch>) => void;
  deleteCourse: (id: string) => void;

  addTemplate: (template: Omit<MaterialTemplate, 'id'>) => void;
  updateTemplate: (id: string, template: Partial<MaterialTemplate>) => void;
  deleteTemplate: (id: string) => void;

  addRecord: (record: Omit<PackageRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecord: (id: string, record: Partial<PackageRecord>) => void;
  deleteRecord: (id: string) => void;
  deleteRecords: (ids: string[]) => void;

  generateRecordsFromTemplate: (batchId: string) => void;
  batchSetReviewStatus: (ids: string[], status: ReviewStatus) => void;

  toggleBatchExpand: (batchId: string) => void;
  expandAllBatches: () => void;
  collapseAllBatches: () => void;

  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  setShowBatchModal: (show: boolean) => void;
  setShowTemplateModal: (show: boolean) => void;
  setShowPreview: (show: boolean) => void;
  setShowHandoverModal: (show: boolean) => void;
  setEditingRecordId: (id: string | null) => void;
  setActiveHandoverBatchId: (id: string | null) => void;

  createHandover: (batchId: string, handoverPerson: string) => boolean;
  startHandoverSign: (handoverId: string, receiverPerson: string) => void;
  completeHandoverSign: (handoverId: string) => void;
  markHandoverException: (handoverId: string, exceptionNote: string) => void;
  addHandoverAnomaly: (handoverId: string, anomaly: HandoverItemAnomaly) => void;
  removeHandoverAnomaly: (handoverId: string, recordId: string) => void;
  updateHandoverAnomaly: (handoverId: string, recordId: string, anomaly: Partial<HandoverItemAnomaly>) => void;
  getHandoverByBatchId: (batchId: string) => HandoverRecord | undefined;
  getBatchHandoverStatus: (batchId: string) => HandoverStatus | null;

  getFilteredRecords: () => PackageRecord[];
  getRecordsByBatch: () => Record<string, PackageRecord[]>;
}

const initialFilters: Filters = {
  courseName: '',
  category: '',
  reviewStatus: '',
  responsiblePerson: '',
  hasDeficiency: '',
  handoverStatus: '',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      courses: mockCourses,
      templates: mockTemplates,
      records: mockRecords,
      handovers: mockHandovers,
      filters: initialFilters,
      currentRole: 'manager',
      expandedBatches: {},
      selectedIds: [],
      showBatchModal: false,
      showTemplateModal: false,
      showPreview: false,
      showHandoverModal: false,
      editingRecordId: null,
      activeHandoverBatchId: null,

      setCurrentRole: (role) => set({ currentRole: role }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () => set({ filters: initialFilters }),

      addCourse: (course) => {
        const newCourse: CourseBatch = {
          ...course,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          courses: [...state.courses, newCourse],
        }));
      },

      updateCourse: (id, course) => {
        set((state) => {
          const updatedCourses = state.courses.map((c) =>
            c.id === id ? { ...c, ...course } : c
          );
          const updatedRecords = state.records.map((r) => {
            if (r.batchId === id) {
              const updatedCourse = updatedCourses.find((c) => c.id === id);
              return {
                ...r,
                courseName: updatedCourse?.courseName || r.courseName,
                batchNumber: updatedCourse?.batchNumber || r.batchNumber,
              };
            }
            return r;
          });
          const updatedHandovers = state.handovers.map((h) => {
            if (h.batchId !== id) return h;
            const updatedCourse = updatedCourses.find((c) => c.id === id);
            return {
              ...h,
              courseName: updatedCourse?.courseName || h.courseName,
              batchNumber: updatedCourse?.batchNumber || h.batchNumber,
              updatedAt: new Date().toISOString(),
            };
          });
          return { courses: updatedCourses, records: updatedRecords, handovers: updatedHandovers };
        });
      },

      deleteCourse: (id) => {
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
          records: state.records.filter((r) => r.batchId !== id),
          handovers: state.handovers.filter((h) => h.batchId !== id),
        }));
      },

      addTemplate: (template) => {
        const newTemplate: MaterialTemplate = {
          ...template,
          id: generateId(),
        };
        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },

      updateTemplate: (id, template) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...template } : t
          ),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      addRecord: (record) => {
        const now = new Date().toISOString();
        const newRecord: PackageRecord = {
          ...record,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          const updatedRecords = [...state.records, newRecord];
          return {
            records: updatedRecords,
            handovers: syncHandoversWithRecords(state.handovers, updatedRecords),
          };
        });
      },

      updateRecord: (id, record) => {
        set((state) => {
          const updatedRecords = state.records.map((r) =>
            r.id === id
              ? { ...r, ...record, updatedAt: new Date().toISOString() }
              : r
          );
          return {
            records: updatedRecords,
            handovers: syncHandoversWithRecords(state.handovers, updatedRecords),
          };
        });
      },

      deleteRecord: (id) => {
        set((state) => {
          const updatedRecords = state.records.filter((r) => r.id !== id);
          return {
            records: updatedRecords,
            selectedIds: state.selectedIds.filter((sid) => sid !== id),
            handovers: syncHandoversWithRecords(state.handovers, updatedRecords),
          };
        });
      },

      deleteRecords: (ids) => {
        set((state) => {
          const updatedRecords = state.records.filter((r) => !ids.includes(r.id));
          return {
            records: updatedRecords,
            selectedIds: state.selectedIds.filter((sid) => !ids.includes(sid)),
            handovers: syncHandoversWithRecords(state.handovers, updatedRecords),
          };
        });
      },

      generateRecordsFromTemplate: (batchId) => {
        const { courses, templates, records } = get();
        const batch = courses.find((c) => c.id === batchId);
        if (!batch) return;

        const existingNames = new Set(
          records
            .filter((r) => r.batchId === batchId)
            .map((r) => r.materialName)
        );

        const newTemplates = templates.filter(
          (t) => !existingNames.has(t.materialName)
        );

        if (newTemplates.length === 0) {
          alert('该批次下的资料已全部存在，无需重复生成。');
          return;
        }

        const now = new Date().toISOString();
        const newRecords: PackageRecord[] = newTemplates.map((t) => ({
          id: generateId(),
          materialName: t.materialName,
          category: t.category,
          packageQuantity: t.packageQuantity,
          actualQuantity: 0,
          batchId: batch.id,
          courseName: batch.courseName,
          batchNumber: batch.batchNumber,
          responsiblePerson: '',
          reviewStatus: 'pending',
          hasDeficiency: false,
          deficiencyNote: '',
          replenishmentNote: '',
          createdAt: now,
          updatedAt: now,
        }));

        const skipped = templates.length - newTemplates.length;
        const message = skipped > 0
          ? `成功生成 ${newTemplates.length} 条新记录，跳过 ${skipped} 条已存在的记录。`
          : `成功生成 ${newTemplates.length} 条记录。`;
        alert(message);

        set((state) => {
          const updatedRecords = [...state.records, ...newRecords];
          return {
            records: updatedRecords,
            handovers: syncHandoversWithRecords(state.handovers, updatedRecords),
            expandedBatches: { ...state.expandedBatches, [batchId]: true },
          };
        });
      },

      batchSetReviewStatus: (ids, status) => {
        const now = new Date().toISOString();
        set((state) => {
          const updatedRecords = state.records.map((r) =>
            ids.includes(r.id)
              ? {
                  ...r,
                  reviewStatus: status,
                  hasDeficiency: status === 'failed',
                  updatedAt: now,
                }
              : r
          );
          return {
            records: updatedRecords,
            handovers: syncHandoversWithRecords(state.handovers, updatedRecords),
          };
        });
      },

      toggleBatchExpand: (batchId) => {
        set((state) => ({
          expandedBatches: {
            ...state.expandedBatches,
            [batchId]: !state.expandedBatches[batchId],
          },
        }));
      },

      expandAllBatches: () => {
        const { records } = get();
        const batchIds = [...new Set(records.map((r) => r.batchId))];
        const expanded: Record<string, boolean> = {};
        batchIds.forEach((id) => {
          expanded[id] = true;
        });
        set({ expandedBatches: expanded });
      },

      collapseAllBatches: () => {
        set({ expandedBatches: {} });
      },

      toggleSelect: (id) => {
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...state.selectedIds, id],
        }));
      },

      selectAll: (ids) => {
        set({ selectedIds: ids });
      },

      clearSelection: () => {
        set({ selectedIds: [] });
      },

      setShowBatchModal: (show) => set({ showBatchModal: show }),
      setShowTemplateModal: (show) => set({ showTemplateModal: show }),
      setShowPreview: (show) => set({ showPreview: show }),
      setShowHandoverModal: (show) => set({ showHandoverModal: show }),
      setEditingRecordId: (id) => set({ editingRecordId: id }),
      setActiveHandoverBatchId: (id) => set({ activeHandoverBatchId: id }),

      createHandover: (batchId, handoverPerson) => {
        const { courses, records, handovers } = get();
        const batch = courses.find((c) => c.id === batchId);
        if (!batch) return false;

        const existing = handovers.find((h) => h.batchId === batchId);
        if (existing) {
          alert('该批次已存在交接签收记录，不能重复创建。');
          return false;
        }

        const batchRecords = records.filter((r) => r.batchId === batchId);
        if (batchRecords.length === 0) {
          alert('该批次暂无分装记录，不能发起交接。');
          return false;
        }
        if (batchRecords.some((r) => r.reviewStatus === 'pending')) {
          alert('该批次存在待复核资料，请完成复核后再发起交接。');
          return false;
        }
        const now = new Date().toISOString();
        const stats = getHandoverStats(records, batchId);

        const newHandover: HandoverRecord = {
          id: generateId(),
          batchId,
          courseName: batch.courseName,
          batchNumber: batch.batchNumber,
          handoverPerson,
          receiverPerson: '',
          handoverTime: now,
          signStatus: 'pending',
          exceptionNote: '',
          ...stats,
          anomalies: [],
          completedTime: '',
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          handovers: [...state.handovers, newHandover],
          showHandoverModal: true,
          activeHandoverBatchId: batchId,
        }));
        return true;
      },

      startHandoverSign: (handoverId, receiverPerson) => {
        set((state) => ({
          handovers: state.handovers.map((h) =>
            h.id === handoverId
              ? {
                  ...h,
                  receiverPerson,
                  handoverTime: new Date().toISOString(),
                  signStatus: 'in_progress' as HandoverStatus,
                  updatedAt: new Date().toISOString(),
                }
              : h
          ),
        }));
      },

      completeHandoverSign: (handoverId) => {
        set((state) => ({
          handovers: state.handovers.map((h) =>
            h.id === handoverId
              ? {
                  ...h,
                  signStatus:
                    h.missingCount > 0 || h.anomalies.length > 0 || h.exceptionNote.trim()
                      ? ('exception' as HandoverStatus)
                      : ('completed' as HandoverStatus),
                  completedTime: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : h
          ),
        }));
      },

      markHandoverException: (handoverId, exceptionNote) => {
        set((state) => ({
          handovers: state.handovers.map((h) =>
            h.id === handoverId
              ? {
                  ...h,
                  signStatus: 'exception' as HandoverStatus,
                  exceptionNote,
                  updatedAt: new Date().toISOString(),
                }
              : h
          ),
        }));
      },

      addHandoverAnomaly: (handoverId, anomaly) => {
        set((state) => ({
          handovers: state.handovers.map((h) => {
            if (h.id !== handoverId) return h;
            const anomalies = [...h.anomalies, anomaly];
            return {
              ...h,
              anomalies,
              ...getHandoverStats(state.records, h.batchId, anomalies),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeHandoverAnomaly: (handoverId, recordId) => {
        set((state) => ({
          handovers: state.handovers.map((h) => {
            if (h.id !== handoverId) return h;
            const updatedAnomalies = h.anomalies.filter((a) => a.recordId !== recordId);
            return {
              ...h,
              anomalies: updatedAnomalies,
              ...getHandoverStats(state.records, h.batchId, updatedAnomalies),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      updateHandoverAnomaly: (handoverId, recordId, anomaly) => {
        set((state) => ({
          handovers: state.handovers.map((h) => {
            if (h.id !== handoverId) return h;
            const anomalies = h.anomalies.map((a) =>
              a.recordId === recordId ? { ...a, ...anomaly } : a
            );
            return {
              ...h,
              anomalies,
              ...getHandoverStats(state.records, h.batchId, anomalies),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      getHandoverByBatchId: (batchId) => {
        return get().handovers.find((h) => h.batchId === batchId);
      },

      getBatchHandoverStatus: (batchId) => {
        const handover = get().handovers.find((h) => h.batchId === batchId);
        return handover ? handover.signStatus : null;
      },

      getFilteredRecords: () => {
        const { records, filters, handovers } = get();
        return records.filter((r) => {
          if (filters.courseName && r.courseName !== filters.courseName) {
            return false;
          }
          if (filters.category && r.category !== filters.category) {
            return false;
          }
          if (filters.reviewStatus && r.reviewStatus !== filters.reviewStatus) {
            return false;
          }
          if (
            filters.responsiblePerson &&
            r.responsiblePerson !== filters.responsiblePerson
          ) {
            return false;
          }
          if (filters.hasDeficiency === 'yes' && !r.hasDeficiency) {
            return false;
          }
          if (filters.hasDeficiency === 'no' && r.hasDeficiency) {
            return false;
          }
          if (filters.handoverStatus) {
            const handover = handovers.find((h) => h.batchId === r.batchId);
            const batchStatus = handover ? handover.signStatus : 'none';
            if (filters.handoverStatus !== batchStatus) {
              return false;
            }
          }
          return true;
        });
      },

      getRecordsByBatch: () => {
        const filtered = get().getFilteredRecords();
        const grouped: Record<string, PackageRecord[]> = {};
        filtered.forEach((r) => {
          if (!grouped[r.batchId]) {
            grouped[r.batchId] = [];
          }
          grouped[r.batchId].push(r);
        });
        return grouped;
      },
    }),
    {
      name: 'training-pkg-storage',
      partialize: (state) => ({
        courses: state.courses,
        templates: state.templates,
        records: state.records,
        handovers: state.handovers,
        filters: state.filters,
        currentRole: state.currentRole,
        expandedBatches: state.expandedBatches,
      }),
    }
  )
);
