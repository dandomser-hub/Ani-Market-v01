import { useState } from 'react';
import { XCircle, CheckCircle, Clock } from 'lucide-react';
import { mockCancellations, mockTransactions } from '../../data/mockData';

type CancellationStatus = 'Pending Review' | 'Approved' | 'Rejected';

const statusStyles: Record<CancellationStatus, string> = {
  'Pending Review': 'bg-yellow-100 text-yellow-700',
  'Approved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const statusIcons: Record<CancellationStatus, React.ReactNode> = {
  'Pending Review': <Clock size={14} />,
  'Approved': <CheckCircle size={14} />,
  'Rejected': <XCircle size={14} />,
};

export default function AdminCancellations() {
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Cancellation Requests</h1>
        <div className="text-sm text-gray-500">
          {mockCancellations.filter(c => c.status === 'Pending Review').length} pending review
        </div>
      </div>

      {mockCancellations.length === 0 ? (
        <div className="card text-center py-12 text-gray-400 text-sm">No cancellation requests.</div>
      ) : (
        <div className="space-y-4">
          {mockCancellations.map(c => {
            const tx = mockTransactions.find(t => t.id === c.transactionId);
            const status = c.status as CancellationStatus;
            return (
              <div key={c.id} className={`card border ${status === 'Pending Review' ? 'border-yellow-200' : status === 'Approved' ? 'border-green-200' : 'border-red-200'}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="font-bold text-gray-900">
                      {tx ? `${tx.cropName} — ₱${tx.totalAmount.toLocaleString()}` : `Transaction ${c.transactionId}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Requested by <span className="font-medium">{c.requestedByName}</span>
                      {' '}({c.requestedByRole}) on {c.createdAt}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
                    {statusIcons[status]} {status}
                  </span>
                </div>

                {tx && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                    <div><div className="text-xs text-gray-500">Buyer</div><div className="font-medium">{tx.buyerName}</div></div>
                    <div><div className="text-xs text-gray-500">Supplier</div><div className="font-medium">{tx.supplierName}</div></div>
                    <div><div className="text-xs text-gray-500">Quantity</div><div className="font-medium">{tx.quantity.toLocaleString()} {tx.unit}</div></div>
                    <div><div className="text-xs text-gray-500">Tx Status</div><div className="font-medium">{tx.status}</div></div>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="text-xs text-gray-500 mb-1">Cancellation Reason</div>
                  <p className="text-sm text-gray-700">{c.reason}</p>
                </div>

                {c.adminNotes && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <div className="text-xs text-blue-600 font-medium mb-1">Admin Notes</div>
                    <p className="text-sm text-blue-800">{c.adminNotes}</p>
                  </div>
                )}

                {status === 'Pending Review' && (
                  <div className="space-y-3">
                    <div>
                      <label className="label">Admin Decision Notes</label>
                      <textarea
                        className="input resize-none"
                        rows={2}
                        placeholder="Add notes before approving or rejecting..."
                        value={adminNotes[c.id] ?? ''}
                        onChange={e => setAdminNotes(n => ({ ...n, [c.id]: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => alert(`Cancellation approved (Demo)\nNotes: ${adminNotes[c.id] ?? ''}`)}
                        className="btn-primary text-sm flex-1 justify-center"
                      >
                        <CheckCircle size={15} /> Approve Cancellation
                      </button>
                      <button
                        onClick={() => alert(`Cancellation rejected (Demo)\nNotes: ${adminNotes[c.id] ?? ''}`)}
                        className="btn-danger text-sm flex-1 justify-center"
                      >
                        <XCircle size={15} /> Reject Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
