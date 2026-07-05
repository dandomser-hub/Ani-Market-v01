import { Link } from 'react-router-dom';
import { mockResponses, mockDemandPosts, mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

export default function SupplierResponses() {
  const { currentUser } = useApp();
  const myResponses = mockResponses.filter(r => r.supplierId === currentUser?.id);
  const activeResponses = myResponses.filter(r => r.status === 'Pending' || r.status === 'Accepted');
  const closedResponses = myResponses.filter(r => r.status === 'Matched' || r.status === 'Rejected');

  if (myResponses.length === 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="page-header">
          <h1 className="text-2xl font-bold text-gray-900">My Responses</h1>
        </div>
        <div className="card text-center py-12 text-gray-400">
          <p className="text-sm">You haven't submitted any responses yet.</p>
          <Link to="/supplier/marketplace" className="btn-primary mt-4 inline-flex">Browse Demand</Link>
        </div>
      </div>
    );
  }

  const ResponseCard = ({ r }: { r: typeof myResponses[0] }) => {
    const demand = mockDemandPosts.find(d => d.id === r.demandId);
    const tx = mockTransactions.find(t => t.responseId === r.id);
    const priceDelta = demand ? r.offeredPrice - demand.targetPrice : 0;

    return (
      <div key={r.id} className="card hover:shadow-md transition-shadow">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
          <div>
            <div className="text-xs text-gray-500">Qty Offered</div>
            <div className="text-sm font-semibold text-gray-900">{r.availableQuantity.toLocaleString()} {r.unit}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Price Offered</div>
            <div className="text-sm font-semibold text-green-700">₱{r.offeredPrice.toLocaleString()}</div>
            {demand && (
              <div className={`text-xs mt-0.5 ${priceDelta <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                {priceDelta === 0 ? 'At target' : priceDelta < 0 ? `₱${Math.abs(priceDelta).toLocaleString()} below target` : `₱${priceDelta.toLocaleString()} above target`}
              </div>
            )}
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

        {r.qualityConfirmation && (
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 mb-3">
            <span className="font-medium text-gray-700">Quality confirmation: </span>{r.qualityConfirmation}
          </div>
        )}

        {r.status === 'Matched' && tx && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Link to={`/transactions/${tx.id}`} className="btn-primary text-sm">View Transaction Workspace</Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">My Responses</h1>
        <div className="text-sm text-gray-500">{myResponses.length} total response{myResponses.length !== 1 ? 's' : ''}</div>
      </div>

      {activeResponses.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Active Responses</h2>
          <div className="space-y-4">
            {activeResponses.map(r => <ResponseCard key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {closedResponses.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Past Responses</h2>
          <div className="space-y-4 opacity-80">
            {closedResponses.map(r => <ResponseCard key={r.id} r={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
