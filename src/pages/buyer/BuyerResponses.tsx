import { Link } from 'react-router-dom';
import { mockResponses, mockDemandPosts } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

export default function BuyerResponses() {
  const { currentUser } = useApp();
  const myDemandIds = mockDemandPosts
    .filter(d => d.buyerId === currentUser?.id)
    .map(d => d.id);
  const pendingResponses = mockResponses.filter(r =>
    r.status === 'Pending' && myDemandIds.includes(r.demandId)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Supplier Responses</h1>
      </div>

      {pendingResponses.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-sm">No pending supplier responses at this time.</p>
          <Link to="/buyer/demands" className="btn-primary mt-4 inline-flex">View My Demand Posts</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingResponses.map(r => {
            const demand = mockDemandPosts.find(d => d.id === r.demandId);
            return (
              <div key={r.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Response to demand:</div>
                    <div className="font-bold text-gray-900">{demand?.cropName}</div>
                    <div className="text-xs text-gray-500">{demand?.location}</div>
                  </div>
                  <StatusBadge status={r.status} size="md" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Supplier</div>
                    <div className="text-sm font-medium text-gray-900">{r.supplierName}</div>
                    <div className="text-xs text-gray-400 capitalize">{r.supplierType.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Available Qty</div>
                    <div className="text-sm font-semibold text-gray-900">{r.availableQuantity.toLocaleString()} {r.unit}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Offered Price</div>
                    <div className="text-sm font-semibold text-green-700">₱{r.offeredPrice.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">vs target ₱{demand?.targetPrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Fulfillment Date</div>
                    <div className="text-sm font-medium text-gray-900">{r.fulfillmentDate}</div>
                  </div>
                </div>

                {r.qualityConfirmation && (
                  <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs text-green-700 font-medium mb-1">Quality Confirmation</div>
                    <p className="text-xs text-green-600">{r.qualityConfirmation}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button className="btn-primary flex-1 justify-center text-sm">Accept & Match</button>
                  <button className="btn-danger flex-1 justify-center text-sm">Decline</button>
                  <Link to={`/buyer/demands/${r.demandId}`} className="btn-secondary justify-center text-sm px-4">View Demand</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
