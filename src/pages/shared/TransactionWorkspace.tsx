import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Upload, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import { mockTransactions, mockDemandPosts } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function TransactionWorkspace() {
  const { id } = useParams();
  const tx = mockTransactions.find(t => t.id === id) ?? mockTransactions[0];
  const demand = mockDemandPosts.find(d => d.id === tx?.demandId);

  const feeAmount = tx.totalAmount * tx.platformFeeRate;
  const netAmount = tx.totalAmount - feeAmount;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/transactions" className="btn-ghost py-1.5 px-3"><ArrowLeft size={16} /> Back</Link>
        <h1 className="text-xl font-bold text-gray-900">Transaction Workspace</h1>
        <StatusBadge status={tx.status} size="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Match Summary */}
          <div className="card">
            <h2 className="section-title mb-4">Match Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="text-xs text-green-600 font-medium mb-1">Buyer</div>
                <div className="font-semibold text-green-900 text-sm">{tx.buyerName}</div>
              </div>
              <div className="p-3 bg-leaf-50 rounded-xl border border-leaf-200 bg-green-50">
                <div className="text-xs text-gray-500 font-medium mb-1">Supplier</div>
                <div className="font-semibold text-gray-900 text-sm">{tx.supplierName}</div>
                <div className="text-xs text-gray-500 capitalize">{tx.supplierType.replace('_', ' ')}</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-xs text-amber-600 font-medium mb-1">Crop</div>
                <div className="font-semibold text-amber-900 text-sm">{tx.cropName}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><div className="text-xs text-gray-500">Quantity</div><div className="font-semibold text-gray-900 text-sm">{tx.quantity.toLocaleString()} {tx.unit}</div></div>
              <div><div className="text-xs text-gray-500">Agreed Price</div><div className="font-semibold text-gray-900 text-sm">₱{tx.agreedPrice.toLocaleString()}</div></div>
              <div><div className="text-xs text-gray-500">Total Amount</div><div className="font-semibold text-gray-900 text-sm">₱{tx.totalAmount.toLocaleString()}</div></div>
              <div><div className="text-xs text-gray-500">Matched Date</div><div className="font-semibold text-gray-900 text-sm">{tx.matchedAt}</div></div>
            </div>
          </div>

          {/* Platform Fee */}
          <div className="card bg-amber-50 border-amber-200">
            <h2 className="section-title mb-4 text-amber-800">Platform Fee Computation (Seller-Side)</h2>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Total Transaction Amount', value: `₱${tx.totalAmount.toLocaleString()}` },
                { label: `Platform Fee (${(tx.platformFeeRate * 100).toFixed(0)}% seller-side)`, value: `₱${feeAmount.toLocaleString()}` },
                { label: 'Net Supplier Proceeds (before fee)', value: `₱${netAmount.toLocaleString()}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-amber-200 last:border-0">
                  <span className="text-amber-700">{row.label}</span>
                  <span className="font-semibold text-amber-900">{row.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-600 mt-3 italic">
              Fee computation only. Ani Market does not collect or process funds. Actual fee arrangement is separate.
            </p>
          </div>

          {/* Payment Proof */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-blue-600" />
              <h2 className="section-title">Payment Reference &amp; Proof</h2>
              <StatusBadge status={tx.paymentProofStatus} />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
              <p className="text-xs font-semibold text-blue-700">
                FOR RECORDING AND EVIDENCE ONLY — Ani Market does not process or hold funds.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="label">Payment Method Reference Type</label>
                <select className="input">
                  <option>Bank Transfer</option>
                  <option>GCash</option>
                  <option>Maya</option>
                  <option>QR Code Payment</option>
                </select>
              </div>
              <div>
                <label className="label">Reference Number</label>
                <input className="input" placeholder="Bank/GCash/Maya reference no." defaultValue={tx.paymentProofStatus !== 'Not Submitted' ? 'REF-2025-012345' : ''} readOnly={tx.paymentProofStatus !== 'Not Submitted'} />
              </div>
            </div>
            <div>
              <label className="label">Payment Instructions</label>
              <textarea className="input resize-none" rows={2} placeholder="e.g., Transfer to BDO account 0123456789, Account Name: Polangui Farmers Assoc." defaultValue="" />
            </div>
            <div className="mt-4 border-2 border-dashed border-blue-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 transition-colors bg-blue-50">
              <Upload size={24} className="text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-blue-600 font-medium">Upload Payment Proof Screenshot</p>
              <p className="text-xs text-blue-400 mt-1">JPG, PNG up to 5MB — evidence recording only, not a payment gateway</p>
            </div>
            {tx.paymentProofStatus !== 'Not Submitted' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm text-green-700">Payment proof uploaded on 2025-01-20 by {tx.supplierName}</span>
              </div>
            )}
            {tx.paymentProofStatus === 'Not Submitted' && (
              <button className="btn-primary mt-4">Submit Payment Proof</button>
            )}
          </div>

          {/* Notes / Messages */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-gray-500" />
              <h2 className="section-title">Notes &amp; Messages</h2>
            </div>
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-700">Ani Market System</span>
                  <span className="text-xs text-gray-400">{tx.matchedAt}</span>
                </div>
                <p className="text-sm text-gray-600">{tx.notes}</p>
              </div>
            </div>
            <textarea className="input resize-none mb-3" rows={2} placeholder="Add a note..." />
            <button className="btn-secondary text-sm">Add Note</button>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Status Timeline */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Status Timeline</h3>
            <div className="space-y-3">
              {[
                { label: 'Matched', done: true, date: tx.matchedAt },
                { label: 'Awaiting Payment Proof', done: tx.paymentProofStatus !== 'Not Submitted', date: '' },
                { label: 'Payment Proof Submitted', done: ['Under Review', 'Accepted for Record'].includes(tx.paymentProofStatus), date: tx.paymentProofStatus !== 'Not Submitted' ? '2025-01-20' : '' },
                { label: 'Payment Accepted for Record', done: tx.paymentProofStatus === 'Accepted for Record', date: '' },
                { label: 'For Delivery / Pickup', done: false, date: '' },
                { label: 'Completed', done: tx.status === 'Completed', date: '' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2 ${item.done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`} />
                  <div>
                    <div className={`text-sm font-medium ${item.done ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</div>
                    {item.date && <div className="text-xs text-gray-400">{item.date}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery/Pickup */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">Delivery / Pickup Coordination</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div><span className="text-xs text-gray-500 block">Preference</span>{demand?.deliveryPreference}</div>
              <div><span className="text-xs text-gray-500 block">Buyer Location</span>{demand?.location}</div>
              <div><span className="text-xs text-gray-500 block">Required By</span>{demand?.requiredDate}</div>
            </div>
          </div>

          {/* Dispute / Cancel */}
          <div className="card border-red-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" /> Actions
            </h3>
            <div className="space-y-2">
              <Link to="/disputes" className="btn-danger w-full justify-center text-xs">Raise Dispute</Link>
              <button className="btn-danger w-full justify-center text-xs bg-orange-600 hover:bg-orange-700">Request Cancellation</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
