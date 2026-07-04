import { mockDisputes, mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function AdminDisputes() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Disputes &amp; Cancellations</h1>
      </div>
      <div className="space-y-4">
        {mockDisputes.map(d => {
          const tx = mockTransactions.find(t => t.id === d.transactionId);
          return (
            <div key={d.id} className="card border-orange-200">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="font-bold text-gray-900">{d.disputeType}</div>
                  <div className="text-xs text-gray-500">Raised by {d.raisedByName} • {d.createdAt}</div>
                </div>
                <StatusBadge status={d.status} size="md" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                <div><div className="text-xs text-gray-500">Related Transaction</div><div className="font-medium">{tx?.cropName} — ₱{tx?.totalAmount.toLocaleString()}</div></div>
                <div><div className="text-xs text-gray-500">Parties</div><div className="font-medium">{tx?.buyerName} / {tx?.supplierName}</div></div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 mb-4">
                <p className="text-sm text-orange-800">{d.description}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="label">Admin Decision Notes</label>
                  <textarea className="input resize-none" rows={2} defaultValue={d.adminNotes} placeholder="Enter admin decision notes..." />
                </div>
                <div>
                  <label className="label">Update Status</label>
                  <select className="input max-w-xs">
                    {['Submitted', 'Under Review', 'Need More Evidence', 'Resolved', 'Rejected', 'Closed'].map(s => (
                      <option key={s} selected={s === d.status}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary text-sm">Save Decision</button>
                  <button className="btn-secondary text-sm">Request More Evidence</button>
                </div>
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
