import { useState } from 'react';
import { X, Plus, Edit2, Trash2, Save, FileText } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { MaterialTemplate, MaterialCategory, CATEGORY_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export default function TemplateModal() {
  const {
    showTemplateModal,
    setShowTemplateModal,
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    courses,
    generateRecordsFromTemplate,
    currentRole,
  } = useAppStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [materialName, setMaterialName] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('handout');
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setMaterialName('');
    setCategory('handout');
    setPackageQuantity(1);
    setDescription('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    setShowTemplateModal(false);
  };

  const handleAdd = () => {
    resetForm();
    setEditingId('new');
  };

  const handleEdit = (template: MaterialTemplate) => {
    setEditingId(template.id);
    setMaterialName(template.materialName);
    setCategory(template.category);
    setPackageQuantity(template.packageQuantity);
    setDescription(template.description || '');
    setError('');
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除该资料模板吗？')) {
      deleteTemplate(id);
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const handleSave = () => {
    setError('');

    if (!materialName.trim()) {
      setError('请输入资料名称');
      return;
    }
    if (packageQuantity <= 0) {
      setError('包内数量必须大于0');
      return;
    }

    if (editingId === 'new') {
      addTemplate({
        materialName: materialName.trim(),
        category,
        packageQuantity,
        description: description.trim(),
      });
    } else if (editingId) {
      updateTemplate(editingId, {
        materialName: materialName.trim(),
        category,
        packageQuantity,
        description: description.trim(),
      });
    }

    resetForm();
  };

  const handleGenerate = (batchId: string) => {
    if (confirm('确定基于模板为该批次生成分装记录吗？已有的记录不会被覆盖。')) {
      generateRecordsFromTemplate(batchId);
      setShowTemplateModal(false);
    }
  };

  if (!showTemplateModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
          <div>
            <h2 className="text-lg font-bold text-navy-900">资料模板管理</h2>
            <p className="text-xs text-navy-500 mt-0.5">预设的资料模板可快速生成分装记录</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-navy-500">
              共 {templates.length} 个资料模板
            </p>
            <div className="flex items-center gap-2">
              {currentRole === 'manager' && courses.length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleGenerate(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  <option value="" disabled>
                    生成到批次...
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName} - {c.batchNumber}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                新增模板
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">
              {error}
            </div>
          )}

          {editingId && (
            <div className="mb-6 p-4 bg-primary-50 border border-primary-100 rounded-xl">
              <h3 className="text-sm font-medium text-primary-700 mb-3">
                {editingId === 'new' ? '新增模板' : '编辑模板'}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-navy-500 mb-1.5">资料名称</label>
                  <input
                    type="text"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    placeholder="资料名称"
                    className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-navy-500 mb-1.5">资料类别</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                    className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-navy-500 mb-1.5">包内数量</label>
                  <input
                    type="number"
                    min={1}
                    value={packageQuantity}
                    onChange={(e) => setPackageQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs text-navy-500 mb-1.5">描述（可选）</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="资料描述说明"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-navy-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无模板，点击上方按钮新增</p>
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    'p-4 border rounded-xl transition-all',
                    editingId === template.id
                      ? 'border-primary-300 bg-primary-50/50'
                      : 'border-navy-100 hover:border-navy-200 hover:shadow-sm'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-navy-900">
                          {template.materialName}
                        </div>
                        <div className="text-xs text-navy-500 mt-1">
                          {CATEGORY_LABELS[template.category]}
                          <span className="mx-1.5 text-navy-300">·</span>
                          包内 {template.packageQuantity} 份
                        </div>
                        {template.description && (
                          <p className="text-xs text-navy-400 mt-2 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-1.5 text-navy-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-1.5 text-navy-400 hover:text-danger hover:bg-rose-50 rounded-md transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
