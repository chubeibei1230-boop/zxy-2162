import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_LABELS, REVIEW_STATUS_LABELS, HANDOVER_STATUS_LABELS } from '@/types';

export default function FilterBar() {
  const { filters, setFilters, resetFilters, records, courses, expandAllBatches, collapseAllBatches } =
    useAppStore();

  const courseNames = [...new Set(courses.map((c) => c.courseName))];
  const persons = [...new Set(records.map((r) => r.responsiblePerson).filter(Boolean))];

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const handoverFilterOptions: Record<string, string> = {
    none: '未发起',
    ...HANDOVER_STATUS_LABELS,
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-4 border border-navy-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-navy-500" />
          <span className="text-sm font-medium text-navy-700">筛选条件</span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 ml-2"
            >
              <X className="w-3 h-3" />
              清除筛选
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAllBatches}
            className="flex items-center gap-1 text-xs text-navy-600 hover:text-navy-900 px-2 py-1 rounded hover:bg-navy-50 transition-colors"
          >
            <ChevronDown className="w-3 h-3" />
            全部展开
          </button>
          <button
            onClick={collapseAllBatches}
            className="flex items-center gap-1 text-xs text-navy-600 hover:text-navy-900 px-2 py-1 rounded hover:bg-navy-50 transition-colors"
          >
            <ChevronUp className="w-3 h-3" />
            全部折叠
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div>
          <label className="block text-xs text-navy-500 mb-1.5">课程名称</label>
          <select
            value={filters.courseName}
            onChange={(e) => setFilters({ courseName: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          >
            <option value="">全部课程</option>
            {courseNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-navy-500 mb-1.5">资料类别</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          >
            <option value="">全部类别</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-navy-500 mb-1.5">复核状态</label>
          <select
            value={filters.reviewStatus}
            onChange={(e) => setFilters({ reviewStatus: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          >
            <option value="">全部状态</option>
            {Object.entries(REVIEW_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-navy-500 mb-1.5">负责人员</label>
          <select
            value={filters.responsiblePerson}
            onChange={(e) => setFilters({ responsiblePerson: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          >
            <option value="">全部人员</option>
            {persons.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-navy-500 mb-1.5">是否缺漏</label>
          <select
            value={filters.hasDeficiency}
            onChange={(e) => setFilters({ hasDeficiency: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          >
            <option value="">全部</option>
            <option value="yes">有缺漏</option>
            <option value="no">无缺漏</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-navy-500 mb-1.5">签收状态</label>
          <select
            value={filters.handoverStatus}
            onChange={(e) => setFilters({ handoverStatus: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          >
            <option value="">全部状态</option>
            {Object.entries(handoverFilterOptions).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
