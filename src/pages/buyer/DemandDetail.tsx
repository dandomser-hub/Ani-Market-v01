import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Package, DollarSign, User, AlertTriangle } from 'lucide-react';
import { mockDemandPosts, mockResponses } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function DemandDetail() {
  const { id } = useParams();
  const demand = mockDemandPosts.find(d => d.id === id) ?? mockDemandPosts[0];
  const responses = mockResponses.filter(r => r.demandId === demand.id);

  const isMatchable = demand.status === 'Response Received';
  const isMatched = demand.status === 'Matched' || demand.status === 'In Transaction';

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/buyer/demands" className="btn-ghost py-1.5 px-3">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{demand.cropName}</h1>
        <StatusBadge status={demand.status} size="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Summary */}
          <div className="card">
            <h2 className="section-title mb-4">Demand Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: <Package size={16} className="text-gray-400" />, label: 'Category', value: demand.cropCategory },
                { icon: <Package size={16} className="text-gray-400" />, label: 'Variety', value: demand.variety || '—' },
                { icon: <Package size={16} className="text-gray-400" />, label: 'Quantity', value: `${demand.quantity.toLocaleString()} ${demand.unit}` },
                { icon: <DollarSign size={16} className="text-gray-400" />, label: 'Target Price', value: `₱${demand.targetPrice.toLocaleString()}/${demand.unit}` },
                { icon: <MapPin size={16} className="text-gray-400" />, label: 'Location', value: demand.location },
                { icon: <Package size={16} className="text-gray-400" />, label: 'Delivery Pref.', value: demand.deliveryPreference },
                { icon: <Calendar size={16} className="text-gray-400" />, label: 'Required Date', value: demand.requiredDate },
                { icon: <Calendar size={16} className="text-gray-400" />, label: 'Expiration', value: demand.expirationDate },
                { icon: <User size={16} className="text-gray-400" />, label: 'Buyer Type', value: demand.buyerType },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">{row.icon}{row.label}</div>
                  <div className="text-sm font-medium text-gray-900">{row.value}</div>
                </div>
              ))}
            </div>

            {demand.qualitySpecs && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Quality Specifications</div>
                <p className="text-sm text-gray-700">{demand.qualitySpecs}</p>
              </div>
            )}
            {demand.notes && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-1">Notes</div>
                <p className="text-sm text-gray-700">{demand.notes}</p>
              </div>
            )}
          </div>

          {/* Supplier Responses */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Supplier Responses ({responses.length})</h2>
            </div>
            {responses.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No responses yet. Your demand post is visible to verified suppliers.</div>
            ) : (
              <div className="space-y-4">
                {responses.map(r => (
                  <div key={r.id} className={`rounded-xl border p-4 ${r.status === 'Matched' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{r.supplierName}</div>
                        <div className="text-xs text-gray-500 capitalize">{r.supplierType.replace('_', ' ')}</div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div><span className="text-xs text-gray-500 block">Offered Qty</span>{r.availableQuantity.toLocaleString()} {r.unit}</div>
                      <div><span className="text-xs text-gray-500 block">Offered Price</span>₱{r.offeredPrice.toLocaleString()}</div>
                      <div><span className="text-xs text-gray-500 block">Fulfillment Date</span>{r.fulfillmentDate}</div>
                      <div><span className="text-xs text-gray-500 block">Submitted</span>{r.createdAt}</div>
                    </div>
                    {r.remarks && <p className="text-xs text-gray-500 mt-2 italic">"{r.remarks}"</p>}
                    {isMatchable && r.status === 'Pending' && (
                      <div className="mt-3 flex gap-2">
                        <button className="btn-primary text-xs py-1.5">Accept & Match</button>
                        <button className="btn-danger text-xs py-1.5">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">Status Timeline</h3>
            <div className="space-y-3">
              {[
                { label: 'Demand Created', date: demand.createdAt, done: true },
                { label: 'Posted / Open', date: demand.createdAt, done: demand.status !== 'Draft' },
                { label: 'Response Received', date: responses[0]?.createdAt, done: demand.responseCount > 0 },
                { label: 'Matched', date: '—', done: isMatched },
                { label: 'In Transaction', date: '—', done: demand.status === 'In Transaction' },
                { label: 'Completed', date: '—', done: demand.status === 'Completed' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2 ${item.done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`} />
                  <div>
                    <div className={`text-sm font-medium ${item.done ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</div>
                    {item.date && item.done && <div className="text-xs text-gray-400">{item.date}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isMatched && (
            <Link to="/transactions" className="btn-primary w-full justify-center">
              View Transaction Workspace
            </Link>
          )}

          {demand.status !== 'Completed' && demand.status !== 'Cancelled' && demand.status !== 'Expired' && (
            <div className="card border-red-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" /> Actions
              </h3>
              <div className="space-y-2">
                <button className="btn-danger w-full justify-center text-xs">Request Cancellation</button>
                {isMatched && <button className="btn-danger w-full justify-center text-xs bg-orange-600 hover:bg-orange-700">Raise Dispute</button>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
