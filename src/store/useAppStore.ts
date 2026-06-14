import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CourseBatch,
  MaterialTemplate,
  PackageRecord,
  Filters,
  UserRole,
  ReviewStatus,
} from '@/types';
import { generateId } from '@/utils/helpers';
import { mockCourses, mockTemplates, mockRecords } from '@/data/mockData';

interface AppState {
  courses: CourseBatch[];
  templates: MaterialTemplate[];
  records: PackageRecord[];
  filters: Filters;
  currentRole: UserRole;
  expandedBatches: Record<string, boolean>;
  selectedIds: string[];
  showBatchModal: boolean;
  showTemplateModal: boolean;
  showPreview: boolean;
  editingRecordId: string | null;

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
  setEditingRecordId: (id: string | null) => void;

  getFilteredRecords: () => PackageRecord[];
  getRecordsByBatch: () => Record<string, PackageRecord[]>;
}

const initialFilters: Filters = {
  courseName: '',
  category: '',
  reviewStatus: '',
  responsiblePerson: '',
  hasDeficiency: '',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      courses: mockCourses,
      templates: mockTemplates,
      records: mockRecords,
      filters: initialFilters,
      currentRole: 'manager',
      expandedBatches: {},
      selectedIds: [],
      showBatchModal: false,
      showTemplateModal: false,
      showPreview: false,
      editingRecordId: null,

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
          return { courses: updatedCourses, records: updatedRecords };
        });
      },

      deleteCourse: (id) => {
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
          records: state.records.filter((r) => r.batchId !== id),
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
        set((state) => ({
          records: [...state.records, newRecord],
        }));
      },

      updateRecord: (id, record) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id
              ? { ...r, ...record, updatedAt: new Date().toISOString() }
              : r
          ),
        }));
      },

      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        }));
      },

      deleteRecords: (ids) => {
        set((state) => ({
          records: state.records.filter((r) => !ids.includes(r.id)),
          selectedIds: state.selectedIds.filter((sid) => !ids.includes(sid)),
        }));
      },

      generateRecordsFromTemplate: (batchId) => {
        const { courses, templates } = get();
        const batch = courses.find((c) => c.id === batchId);
        if (!batch) return;

        const newRecords: PackageRecord[] = templates.map((t) => {
          const now = new Date().toISOString();
          return {
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
          };
        });

        set((state) => ({
          records: [...state.records, ...newRecords],
          expandedBatches: { ...state.expandedBatches, [batchId]: true },
        }));
      },

      batchSetReviewStatus: (ids, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          records: state.records.map((r) =>
            ids.includes(r.id)
              ? {
                  ...r,
                  reviewStatus: status,
                  hasDeficiency: status === 'failed',
                  updatedAt: now,
                }
              : r
          ),
        }));
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
      setEditingRecordId: (id) => set({ editingRecordId: id }),

      getFilteredRecords: () => {
        const { records, filters } = get();
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
        filters: state.filters,
        currentRole: state.currentRole,
        expandedBatches: state.expandedBatches,
      }),
    }
  )
);
