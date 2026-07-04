import { Link } from 'react-router-dom';
import { mockResponses, mockDemandPosts } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function SupplierResponses() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">My Responses</h1>
      </div>

      {mockResponses.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-sm">You haven't submitted any responses yet.</p>
          <Link to="/supplier/marketplace" className="btn-primary mt-4 inline-flex">Browse Demand</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockResponses.map(r => {
            const demand = mockDemandPosts.find(d => d.id === r.demandId);
            return (
              <div key={r.id} className="card">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="font-bold text-gray-900">{demand?.cropName}</div>
                    <div className="text-xs text-gray-500">{demand?.buyerName} • {demand?.location}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={r.status} size="md" />
                    <span className="text-xs text-gray-400">Submitted {r.createdAt}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Qty Offered</div>
                    <div className="text-sm font-semibold text-gray-900">{r.availableQuantity.toLocaleString()} {r.unit}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Price Offered</div>
                    <div className="text-sm font-semibold text-green-700">₱{r.offeredPrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Fulfillment Date</div>
                    <div className="text-sm text-gray-900">{r.fulfillmentDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Delivery Note</div>
                    <div className="text-sm text-gray-700">{r.pickupDeliveryNote || '—'}</div>
                  </div>
                </div>

                {r.status === 'Matched' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link to="/transactions" className="btn-primary text-sm">View Transaction Workspace</Link>
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
