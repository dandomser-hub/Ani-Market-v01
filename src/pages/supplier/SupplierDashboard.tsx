import { Link } from 'react-router-dom';
import { Search, CheckSquare, ArrowLeftRight, CreditCard, ArrowRight, TrendingUp } from 'lucide-react';
import { mockResponses, mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import { useApp } from '../../context/AppContext';
import { formatTargetPrice, getGate1Demands } from '../../data/gate1DemandData';

export default function SupplierDashboard() {
  const { currentUser } = useApp();
  const demands = getGate1Demands();
  const openDemands = demands.filter(demand =>
    (demand.status === 'Open for Offers' || (!demand.qualification && ['Open', 'Posted', 'Response Received'].includes(demand.status))) &&
    demand.buyerId !== currentUser?.id
  );
  const myResponses = mockResponses.filter(response => response.supplierId === currentUser?.id);
  const myTransactions = mockTransactions.filter(transaction => transaction.supplierId === currentUser?.id);
  const paymentPending = myTransactions.filter(transaction => transaction.paymentProofStatus === 'Not Submitted').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="page-header"><div><h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1><p className="text-sm text-gray-500 mt-1">Welcome back, {currentUser?.name}</p></div><Link to="/supplier/marketplace" className="btn-primary"><Search size={16} /> New Opportunity for Your Crops</Link></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Qualified Opportunities" value={openDemands.length} icon={<Search size={20} className="text-green-600" />} bg="bg-green-50" border="border-green-200" color="text-green-700" trend={<TrendingUp size={14} className="text-gray-300" />} />
        <StatCard label="My Active Responses" value={myResponses.filter(response => response.status === 'Pending').length} icon={<CheckSquare size={20} className="text-blue-600" />} bg="bg-blue-50" border="border-blue-200" color="text-blue-700" trend={<TrendingUp size={14} className="text-gray-300" />} />
        <StatCard label="Legacy / Active Transactions" value={myTransactions.length} icon={<ArrowLeftRight size={20} className="text-amber-600" />} bg="bg-amber-50" border="border-amber-200" color="text-amber-700" trend={<TrendingUp size={14} className="text-gray-300" />} />
        <StatCard label="Payment Proof Pending" value={paymentPending} icon={<CreditCard size={20} className="text-red-500" />} bg="bg-red-50" border="border-red-200" color="text-red-700" trend={<TrendingUp size={14} className="text-gray-300" />} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4"><h2 className="section-title">New Opportunity for Your Crops</h2><Link to="/supplier/marketplace" className="text-sm text-green-600 hover:underline flex items-center gap-1">View All <ArrowRight size={14} /></Link></div>
        {openDemands.length === 0 ? <div className="text-center py-8 text-gray-400 text-sm">No qualified Demand opportunities right now.</div> : <div className="space-y-3">{openDemands.slice(0, 4).map(demand => <div key={demand.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-green-200 transition-colors"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-semibold text-gray-900 text-sm">{demand.cropName}</span><StatusBadge status={demand.status} /></div><div className="text-xs text-gray-500">{demand.buyerName} • {demand.quantity.toLocaleString()} {demand.unit} • {formatTargetPrice(demand.targetPriceProfile, demand.targetPrice)} target • {demand.location}</div></div><Link to={`/supplier/marketplace/${demand.id}`} className="btn-secondary text-xs py-1.5 ml-3 flex-shrink-0">View</Link></div>)}</div>}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4"><h2 className="section-title">My Recent Responses</h2><Link to="/supplier/responses" className="text-sm text-green-600 hover:underline flex items-center gap-1">View All <ArrowRight size={14} /></Link></div>
        {myResponses.length === 0 ? <div className="text-center py-6 text-gray-400 text-sm">No responses submitted yet.</div> : <div className="space-y-3">{myResponses.slice(0, 3).map(response => { const demand = demands.find(item => item.id === response.demandId); return <div key={response.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"><div><div className="font-medium text-gray-900 text-sm">{demand?.cropName}</div><div className="text-xs text-gray-500">{response.availableQuantity.toLocaleString()} {response.unit} @ ₱{response.offeredPrice.toLocaleString()}</div></div><StatusBadge status={response.status} /></div>; })}</div>}
      </div>
    </div>
  );
}
