import { useState } from 'react';
import { AlertTriangle, Upload } from 'lucide-react';
import { mockDisputes, mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function DisputesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Disputes &amp; Cancellations</h1>
        <button onClick={() => setShowForm(true)} className="btn-danger">
          <AlertTriangle size={16} /> Raise Dispute / Cancellation
        </button>
      </div>

      {showForm && (
        <div className="card border-red-200 bg-red-50">
          <h2 className="text-lg font-bold text-red-800 mb-4">New Dispute / Cancellation Request</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Related Transaction</label>
                <select className="input">
                  {mockTransactions.map(t => (
                    <option key={t.id} value={t.id}>{t.cropName} — {t.buyerName} / {t.supplierName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Request Type</label>
                <select className="input">
                  <option>Dispute</option>
                  <option>Cancellation Request</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Dispute / Issue Type</label>
              <select className="input">
                <option>Quality Issue</option>
                <option>Quantity Discrepancy</option>
                <option>Non-Delivery</option>
                <option>Payment Issue</option>
                <option>Misrepresentation</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea className="input resize-none" rows={4} placeholder="Describe the issue in detail..." />
            </div>
            <div className="border-2 border-dashed border-red-200 rounded-xl p-5 text-center cursor-pointer hover:border-red-400 transition-colors">
              <Upload size={20} className="text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-600">Upload supporting evidence (photos, documents)</p>
              <p className="text-xs text-red-400 mt-1">Placeholder — not functional in prototype</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => { alert('Dispute submitted. Admin will review. (Demo)'); setShowForm(false); }} className="btn-danger flex-1 justify-center">Submit Request</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {mockDisputes.map(d => {
          const tx = mockTransactions.find(t => t.id === d.transactionId);
          return (
            <div key={d.id} className="card border-orange-200">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="font-bold text-gray-900">{d.disputeType}</div>
                  <div className="text-xs text-gray-500">{tx?.cropName} • Raised by {d.raisedByName} on {d.createdAt}</div>
                </div>
                <StatusBadge status={d.status} size="md" />
              </div>
              <p className="text-sm text-gray-700 mb-3">{d.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div><div className="text-xs text-gray-500">Evidence Uploaded</div><div className="font-medium">{d.evidenceUploaded ? 'Yes' : 'No'}</div></div>
                <div><div className="text-xs text-gray-500">Admin Notes</div><div className="text-gray-700">{d.adminNotes || '—'}</div></div>
                <div><div className="text-xs text-gray-500">Transaction</div><div className="text-gray-700">{tx?.cropName} • ₱{tx?.totalAmount.toLocaleString()}</div></div>
              </div>
            </div>
          );
        })}
        {mockDisputes.length === 0 && (
          <div className="card text-center py-12 text-gray-400 text-sm">No disputes or cancellation requests.</div>
        )}
      </div>
    </div>
  );
}
