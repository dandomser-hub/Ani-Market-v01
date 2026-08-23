import { Link } from 'react-router-dom';
import { Search, CheckSquare, ArrowLeftRight, CreditCard, ArrowRight, TrendingUp } from 'lucide-react';
import { mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import { useApp } from '../../context/AppContext';
import { formatTargetPrice, getGate1Demands } from '../../data/gate1DemandData';
import { getCurrentOfferVersion, getGate1Offers, getGate1Selections } from '../../data/gate1OfferData';

export default function SupplierDashboard() {
  const { currentUser } = useApp();
  const demands = getGate1Demands();
  const openDemands = demands.filter(demand =>
    (demand.status === 'Open for Offers' || demand.status === 'Partially Allocated' || (!demand.qualification && ['Open', 'Posted', 'Response Received'].includes(demand.status))) &&
    demand.buyerId !== currentUser?.id
  );
  const myOffers = getGate1Offers().filter(offer => offer.supplierId === currentUser?.id);
  const mySelections = getGate1Selections().filter(selection => selection.supplierId === currentUser?.id);
  const myTransactions = mockTransactions.filter(transaction => transaction.supplierId === currentUser?.id);
  const paymentPending = myTransactions.filter(transaction => transaction.paymentProofStatus === 'Not Submitted').length;
  const activeOffers = myOffers.filter(offer => offer.status === 'Active' || offer.status === 'Selected');
  const pendingSelections = mySelections.filter(selection => selection.status === 'Pending Supplier Confirmation').length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="page-header"><div><h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1><p className="mt-1 text-sm text-gray-500">Welcome back, {currentUser?.name}</p></div><Link to="/supplier/marketplace" className="btn-primary"><Search size={16} /> New Opportunity for Your Crops</Link></div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Qualified Opportunities" value={openDemands.length} icon={<Search size={20} className="text-green-600" />} bg="bg-green-50" border="border-green-200" color="text-green-700" trend={<TrendingUp size={14} className="text-gray-300" />} />
        <StatCard label="My Active Offers" value={activeOffers.length} icon={<CheckSquare size={20} className="text-blue-600" />} bg="bg-blue-50" border="border-blue-200" color="text-blue-700" trend={<TrendingUp size={14} className="text-gray-300" />} />
        <StatCard label="Buyer Selections Pending" value={pendingSelections} icon={<ArrowLeftRight size={20} className="text-amber-600" />} bg="bg-amber-50" border="border-amber-200" color="text-amber-700" trend={<TrendingUp size={14} className="text-gray-300" />} />
        <StatCard label="Legacy Payment Proof Pending" value={paymentPending} icon={<CreditCard size={20} className="text-red-500" />} bg="bg-red-50" border="border-red-200" color="text-red-700" trend={<TrendingUp size={14} className="text-gray-300" />} />
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between"><h2 className="section-title">New Opportunity for Your Crops</h2><Link to="/supplier/marketplace" className="flex items-center gap-1 text-sm text-green-600 hover:underline">View All <ArrowRight size={14} /></Link></div>
        {openDemands.length === 0 ? <div className="py-8 text-center text-sm text-gray-400">No qualified Demand opportunities right now.</div> : <div className="space-y-3">{openDemands.slice(0, 4).map(demand => <div key={demand.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:border-green-200"><div className="min-w-0 flex-1"><div className="mb-1 flex items-center gap-2"><span className="text-sm font-semibold text-gray-900">{demand.cropName}</span><StatusBadge status={demand.status} /></div><div className="text-xs text-gray-500">{demand.buyerName} • {demand.quantity.toLocaleString()} {demand.unit} • {formatTargetPrice(demand.targetPriceProfile, demand.targetPrice)} target • {demand.location}</div></div><Link to={`/supplier/marketplace/${demand.id}`} className="btn-secondary ml-3 flex-shrink-0 py-1.5 text-xs">View</Link></div>)}</div>}
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between"><h2 className="section-title">My Recent Offers</h2><Link to="/supplier/responses" className="flex items-center gap-1 text-sm text-green-600 hover:underline">View All <ArrowRight size={14} /></Link></div>
        {myOffers.length === 0 ? <div className="py-6 text-center text-sm text-gray-400">No Offers submitted yet.</div> : <div className="space-y-3">{myOffers.slice(0, 4).map(offer => { const demand = demands.find(item => item.id === offer.demandId); const version = getCurrentOfferVersion(offer); return <div key={offer.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"><div><div className="text-sm font-medium text-gray-900">{demand?.cropName}</div><div className="text-xs text-gray-500">{version ? `${version.offeredQuantity.toLocaleString()} ${version.unit} @ ₱${version.offeredPrice.toLocaleString()}` : 'Offer terms unavailable'} · v{offer.currentVersionNumber}</div></div><StatusBadge status={offer.status} /></div>; })}</div>}
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between"><h2 className="section-title">Historical / Downstream Transactions</h2><Link to="/transactions" className="flex items-center gap-1 text-sm text-green-600 hover:underline">View All <ArrowRight size={14} /></Link></div>
        {myTransactions.length === 0 ? <div className="py-6 text-center text-sm text-gray-400">No transactions yet.</div> : <div className="space-y-3">{myTransactions.slice(0, 3).map(transaction => <div key={transaction.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"><div><div className="text-sm font-medium text-gray-900">{transaction.cropName}</div><div className="text-xs text-gray-500">{transaction.quantity.toLocaleString()} {transaction.unit} · {transaction.buyerName}</div></div><StatusBadge status={transaction.status} /></div>)}</div>}
      </div>
    </div>
  );
}
