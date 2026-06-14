import { X, Printer, Download, FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_LABELS, REVIEW_STATUS_LABELS } from '@/types';
import { formatDate } from '@/utils/helpers';

export default function PreviewModal() {
  const { showPreview, setShowPreview, getFilteredRecords, getRecordsByBatch, courses } =
    useAppStore();

  const recordsByBatch = getRecordsByBatch();
  const batchIds = Object.keys(recordsByBatch);
  const allRecords = getFilteredRecords();

  const totalPackages = allRecords.reduce((sum, r) => sum + r.packageQuantity, 0);
  const totalActual = allRecords.reduce((sum, r) => sum + r.actualQuantity, 0);
  const deficiencyCount = allRecords.filter((r) => r.hasDeficiency).length;
  const passedCount = allRecords.filter((r) => r.reviewStatus === 'passed').length;
  const pendingCount = allRecords.filter((r) => r.reviewStatus === 'pending').length;
  const reviewRate = allRecords.length > 0
    ? Math.round(((allRecords.length - pendingCount) / allRecords.length) * 100)
    : 0;

  const handlePrint = () => {
    window.print();
  };

  if (!showPreview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 print:p-4 print:static print:bg-white print:z-0">
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in print:hidden"
        onClick={() => setShowPreview(false)}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-in print:shadow-none print:rounded-none print:max-h-none print:h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-navy-900">发放单预览</h2>
            <p className="text-xs text-navy-500 mt-0.5">按课程批次分组的只读清单</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-navy-700 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              打印
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] print:max-h-none">
          <div className="p-8 print:p-6">
            <div className="text-center mb-8 pb-6 border-b-2 border-navy-200">
              <h1 className="text-2xl font-bold text-navy-900">培训资料包发放单</h1>
              <p className="text-sm text-navy-500 mt-2">
                生成日期：{formatDate(new Date().toISOString())}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-navy-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-navy-900">{allRecords.length}</div>
                <div className="text-xs text-navy-500 mt-1">资料种类</div>
              </div>
              <div className="bg-primary-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary-700">{totalPackages}</div>
                <div className="text-xs text-primary-600 mt-1">应发总份数</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{deficiencyCount}</div>
                <div className="text-xs text-amber-600 mt-1">缺漏项</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{reviewRate}%</div>
                <div className="text-xs text-emerald-600 mt-1">已复核比例</div>
              </div>
            </div>

            {batchIds.length === 0 ? (
              <div className="text-center py-12 text-navy-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无记录</p>
            </div>
          ) : (
            <div className="space-y-8">
              {batchIds.map((batchId) => {
                const batch = courses.find((c) => c.id === batchId);
                const records = recordsByBatch[batchId];
                const batchTotal = records.reduce((sum, r) => sum + r.packageQuantity, 0);
                const batchActual = records.reduce((sum, r) => sum + r.actualQuantity, 0);
                const batchDeficient = records.filter((r) => r.hasDeficiency).length;
                const batchPassed = records.filter((r) => r.reviewStatus === 'passed').length;

                return (
                  <div key={batchId} className="break-inside-avoid">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-navy-200">
                      <div>
                        <h3 className="text-lg font-bold text-navy-900">
                          {batch?.courseName || '未知课程'}
                        </h3>
                        <p className="text-sm text-navy-500">
                          批次号：{batch?.batchNumber || '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-navy-600">
                          共 {records.length} 项 · {batchTotal} 份
                        </span>
                        <span className="text-emerald-600">
                          已通过 {batchPassed}
                        </span>
                        {batchDeficient > 0 && (
                          <span className="text-amber-600">
                            缺漏 {batchDeficient}
                          </span>
                        )}
                      </div>
                    </div>

                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-navy-500 border-b border-navy-100">
                          <th className="py-2 font-medium w-12">序号</th>
                          <th className="py-2 font-medium">资料名称</th>
                          <th className="py-2 font-medium w-24">类别</th>
                          <th className="py-2 font-medium w-20 text-center">应发</th>
                          <th className="py-2 font-medium w-20 text-center">实发</th>
                          <th className="py-2 font-medium w-24">负责人</th>
                          <th className="py-2 font-medium w-24">状态</th>
                          <th className="py-2 font-medium">缺漏说明</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record, index) => (
                          <tr key={record.id} className="border-b border-navy-50">
                            <td className="py-2 text-navy-400">{index + 1}</td>
                            <td className="py-2 font-medium text-navy-900">
                              {record.materialName}
                            </td>
                            <td className="py-2 text-navy-600">
                              {CATEGORY_LABELS[record.category]}
                            </td>
                            <td className="py-2 text-center text-navy-700">
                              {record.packageQuantity}
                            </td>
                            <td className={`py-2 text-center font-medium ${
                              record.actualQuantity < record.packageQuantity
                                ? 'text-danger'
                                : 'text-navy-900'
                            }`}>
                              {record.actualQuantity}
                            </td>
                            <td className="py-2 text-navy-600">
                              {record.responsiblePerson || '-'}
                            </td>
                            <td className="py-2">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                record.reviewStatus === 'passed'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : record.reviewStatus === 'failed'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-navy-100 text-navy-600'
                              }`}>
                                {record.reviewStatus === 'passed' && <CheckCircle className="w-3 h-3" />}
                                {record.reviewStatus === 'failed' && <AlertTriangle className="w-3 h-3" />}
                                {record.reviewStatus === 'pending' && <Clock className="w-3 h-3" />}
                                {REVIEW_STATUS_LABELS[record.reviewStatus]}
                              </span>
                            </td>
                            <td className="py-2 text-xs text-navy-500 max-w-40 truncate">
                              {record.hasDeficiency
                                ? record.deficiencyNote || '有缺漏'
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-medium text-navy-700 bg-navy-50">
                          <td colSpan={3} className="py-2 pl-4 text-right">
                            小计
                          </td>
                          <td className="py-2 text-center">{batchTotal}</td>
                          <td className="py-2 text-center">{batchActual}</td>
                          <td colSpan={3}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

            <div className="mt-10 pt-6 border-t border-navy-200 text-xs text-navy-400 flex justify-between print:mt-12">
              <div>
                <p>发放人签字：____________</p>
                <p className="mt-4">日期：____________</p>
              </div>
              <div>
                <p>接收人签字：____________</p>
                <p className="mt-4">日期：____________</p>
              </div>
              <div>
                <p>复核人签字：____________</p>
                <p className="mt-4">日期：____________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
