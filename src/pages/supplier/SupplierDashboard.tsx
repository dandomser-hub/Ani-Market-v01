import { Link } from 'react-router-dom';
import { Search, CheckSquare, ArrowLeftRight, CreditCard, ArrowRight, TrendingUp } from 'lucide-react';
import { mockDemandPosts, mockResponses, mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

export default function SupplierDashboard() {
  const { currentUser } = useApp();

  const openDemands = mockDemandPosts.filter(d => ['Open', 'Posted', 'Response Received'].includes(d.status));
  const myResponses = mockResponses.filter(r => r.supplierId === currentUser?.id || r.status === 'Pending');
  const matched = mockTransactions.filter(t => t.supplierId === currentUser?.id || t.status !== 'Completed');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {currentUser?.name}</p>
        </div>
        <Link to="/supplier/marketplace" className="btn-primary">
          <Search size={16} /> Browse Demand
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available Demand Posts', value: openDemands.length, icon: <Search size={20} className="text-green-600" />, bg: 'bg-green-50', border: 'border-green-200', color: 'text-green-700' },
          { label: 'My Active Responses', value: myResponses.length, icon: <CheckSquare size={20} className="text-blue-600" />, bg: 'bg-blue-50', border: 'border-blue-200', color: 'text-blue-700' },
          { label: 'Matched Transactions', value: matched.length, icon: <ArrowLeftRight size={20} className="text-amber-600" />, bg: 'bg-amber-50', border: 'border-amber-200', color: 'text-amber-700' },
          { label: 'Payment Proof Pending', value: 1, icon: <CreditCard size={20} className="text-purple-600" />, bg: 'bg-purple-50', border: 'border-purple-200', color: 'text-purple-700' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.bg} border ${s.border}`}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                {s.icon}
              </div>
              <TrendingUp size={14} className="text-gray-300" />
            </div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Open Demand Opportunities */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Available Demand Opportunities</h2>
          <Link to="/supplier/marketplace" className="text-sm text-green-600 hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {openDemands.slice(0, 4).map(d => (
            <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-green-200 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{d.cropName}</span>
                  <StatusBadge status={d.status} />
                </div>
                <div className="text-xs text-gray-500">
                  {d.buyerName} • {d.quantity.toLocaleString()} {d.unit} • ₱{d.targetPrice.toLocaleString()} target • {d.location}
                </div>
              </div>
              <Link to={`/supplier/marketplace/${d.id}`} className="btn-secondary text-xs py-1.5 ml-3 flex-shrink-0">Respond</Link>
            </div>
          ))}
        </div>
      </div>

      {/* My Responses */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">My Recent Responses</h2>
          <Link to="/supplier/responses" className="text-sm text-green-600 hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {myResponses.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">No responses submitted yet.</div>
        ) : (
          <div className="space-y-3">
            {myResponses.slice(0, 3).map(r => {
              const demand = mockDemandPosts.find(d => d.id === r.demandId);
              return (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{demand?.cropName}</div>
                    <div className="text-xs text-gray-500">{r.availableQuantity.toLocaleString()} {r.unit} @ ₱{r.offeredPrice.toLocaleString()}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
