import { Package, LayoutGrid, FileText, Eye } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { UserRole, ROLE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export default function Header() {
  const { currentRole, setCurrentRole, setShowPreview, setShowBatchModal, setShowTemplateModal } =
    useAppStore();

  const roles: UserRole[] = ['manager', 'executor', 'reviewer'];

  return (
    <header className="bg-white shadow-sm border-b border-navy-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-navy-900">培训资料包管理</h1>
              <p className="text-xs text-navy-500">分装记录 · 批次管理 · 缺漏确认</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center bg-navy-50 rounded-lg p-1">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  className={cn(
                    'px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                    currentRole === role
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-navy-600 hover:text-navy-900'
                  )}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentRole === 'manager' && (
                <>
                  <button
                    onClick={() => setShowBatchModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-navy-700 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    批次管理
                  </button>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-navy-700 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    资料模板
                  </button>
                </>
              )}
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
              >
                <Eye className="w-4 h-4" />
                发放单预览
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
