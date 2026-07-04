import { mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import { Shield, Upload } from 'lucide-react';

export default function PaymentProof() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Payment Proof / References</h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Shield size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 font-medium">
          FOR RECORDING AND EVIDENCE ONLY. Ani Market does not process, hold, or release funds. All payment proof submitted here is for reference recording only.
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label">Payment Method Type</label>
                <select className="input" disabled={t.paymentProofStatus !== 'Not Submitted'}>
                  <option>Bank Transfer</option>
                  <option>GCash</option>
                  <option>Maya</option>
                  <option>QR Code Payment</option>
                </select>
              </div>
              <div>
                <label className="label">Reference Number</label>
                <input className="input" placeholder="Enter reference number"
                  defaultValue={t.paymentProofStatus !== 'Not Submitted' ? 'REF-2025-012345' : ''}
                  readOnly={t.paymentProofStatus !== 'Not Submitted'} />
              </div>
              <div>
                <label className="label">Review Status</label>
                <div className="mt-1"><StatusBadge status={t.paymentProofStatus} size="md" /></div>
              </div>
            </div>

            {t.paymentProofStatus !== 'Not Submitted' ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                Proof uploaded. Admin review status: <strong>{t.paymentProofStatus}</strong>
              </div>
            ) : (
              <div className="border-2 border-dashed border-blue-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 transition-colors">
                <Upload size={22} className="text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-blue-600">Upload proof screenshot (bank receipt, GCash/Maya confirmation)</p>
                <p className="text-xs text-blue-400 mt-1">For evidence recording only</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
