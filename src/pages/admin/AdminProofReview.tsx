import { Shield, FileCheck, MessageSquare } from 'lucide-react';
import { mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function AdminProofReview() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Proof / Reference Review</h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Shield size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          <strong>Evidence recording only.</strong> Admin reviews uploaded payment references and updates review status. Ani Market does not process, hold, or release transaction funds.
        </p>
      </div>

      <div className="space-y-4">
        {mockTransactions.map(t => (
          <div key={t.id} className="card">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="font-bold text-gray-900">{t.cropName}</div>
                <div className="text-xs text-gray-500">{t.buyerName} / {t.supplierName} • ₱{t.totalAmount.toLocaleString()}</div>
              </div>
              <StatusBadge status={t.paymentProofStatus} size="md" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
              <div><div className="text-xs text-gray-500">Payment Method</div><div className="font-medium">Bank Transfer</div></div>
              <div><div className="text-xs text-gray-500">Reference No.</div><div className="font-medium font-mono">{t.paymentProofStatus !== 'Not Submitted' ? 'REF-2025-012345' : '—'}</div></div>
              <div><div className="text-xs text-gray-500">Uploaded By</div><div className="font-medium">{t.supplierName}</div></div>
              <div><div className="text-xs text-gray-500">Upload Date</div><div className="font-medium">{t.paymentProofStatus !== 'Not Submitted' ? '2025-01-20' : '—'}</div></div>
            </div>

            {t.paymentProofStatus !== 'Not Submitted' && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                  <FileCheck size={13} /> Uploaded proof screenshot placeholder
                </div>
                <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-400">
                  Payment Proof Image Preview (Prototype Placeholder)
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="label">Admin Review Notes</label>
                <textarea className="input resize-none" rows={2} placeholder="Add review notes..." defaultValue={t.paymentProofStatus === 'Under Review' ? 'Reference number confirmed. Awaiting bank confirmation.' : ''} />
              </div>
              <div>
                <label className="label">Update Status</label>
                <select className="input max-w-xs">
                  {['Not Submitted', 'Submitted', 'Under Review', 'Accepted for Record', 'Needs Clarification', 'Disputed'].map(s => (
                    <option key={s} selected={s === t.paymentProofStatus}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary text-sm">
                  <FileCheck size={14} /> Accept for Record
                </button>
                <button className="btn-secondary text-sm">
                  <MessageSquare size={14} /> Request Clarification
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
