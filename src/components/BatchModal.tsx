import { useState } from 'react';
import { X, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CourseBatch } from '@/types';
import { validateBatchDuplicate } from '@/utils/validation';
import { cn } from '@/lib/utils';

export default function BatchModal() {
  const { showBatchModal, setShowBatchModal, courses, addCourse, updateCourse, deleteCourse, records } =
    useAppStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [courseName, setCourseName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setCourseName('');
    setBatchNumber('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    setShowBatchModal(false);
  };

  const handleAdd = () => {
    resetForm();
    setEditingId('new');
  };

  const handleEdit = (course: CourseBatch) => {
    setEditingId(course.id);
    setCourseName(course.courseName);
    setBatchNumber(course.batchNumber);
    setError('');
  };

  const handleDelete = (id: string) => {
    const recordCount = records.filter((r) => r.batchId === id).length;
    const message = recordCount > 0
      ? `该批次下有 ${recordCount} 条分装记录，删除后记录也将被删除。确定删除吗？`
      : '确定删除该批次吗？';
    if (confirm(message)) {
      deleteCourse(id);
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const handleSave = () => {
    setError('');

    if (!courseName.trim()) {
      setError('请输入课程名称');
      return;
    }
    if (!batchNumber.trim()) {
      setError('请输入批次号');
      return;
    }

    if (!validateBatchDuplicate(editingId || '', courseName, batchNumber, courses)) {
      setError('该课程下已存在相同批次号');
      return;
    }

    if (editingId === 'new') {
      addCourse({
        courseName: courseName.trim(),
        batchNumber: batchNumber.trim(),
      });
    } else if (editingId) {
      updateCourse(editingId, {
        courseName: courseName.trim(),
        batchNumber: batchNumber.trim(),
      });
    }

    resetForm();
  };

  if (!showBatchModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
          <h2 className="text-lg font-bold text-navy-900">批次管理</h2>
          <button
            onClick={handleClose}
            className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-navy-500">
              共 {courses.length} 个课程批次
            </p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              新增批次
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">
              {error}
            </div>
          )}

          {editingId && (
            <div className="mb-4 p-4 bg-primary-50 border border-primary-100 rounded-xl">
              <h3 className="text-sm font-medium text-primary-700 mb-3">
                {editingId === 'new' ? '新增批次' : '编辑批次'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-navy-500 mb-1.5">课程名称</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="例如：新员工入职培训"
                    className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-navy-500 mb-1.5">批次号</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="例如：2024-Q1-001"
                    className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-navy-600 bg-white border border-navy-200 rounded-lg hover:bg-navy-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {courses.length === 0 ? (
              <div className="text-center py-8 text-navy-400">
                暂无批次，点击上方按钮新增
              </div>
            ) : (
              courses.map((course) => {
                const recordCount = records.filter((r) => r.batchId === course.id).length;
                return (
                  <div
                    key={course.id}
                    className={cn(
                      'p-4 border rounded-xl flex items-center justify-between transition-all',
                      editingId === course.id
                        ? 'border-primary-300 bg-primary-50/50'
                        : 'border-navy-100 hover:border-navy-200 hover:shadow-sm'
                    )}
                  >
                    <div>
                      <div className="font-medium text-navy-900">{course.courseName}</div>
                      <div className="text-sm text-navy-500 mt-0.5">
                        批次号：{course.batchNumber}
                        <span className="mx-2 text-navy-300">|</span>
                        分装记录：{recordCount} 条
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-2 text-navy-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-navy-400 hover:text-danger hover:bg-rose-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
