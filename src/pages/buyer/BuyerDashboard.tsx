import { Link } from 'react-router-dom';
import { FileText, MessageSquare, CheckSquare, AlertTriangle, PlusCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import { useApp } from '../../context/AppContext';
import { formatTargetPrice, getGate1Demands } from '../../data/gate1DemandData';
import { getGate1Offers, getGate1Selections } from '../../data/gate1OfferData';

export default function BuyerDashboard() {
  const { currentUser } = useApp();
  const myDemands = getGate1Demands().filter(demand => demand.buyerId === currentUser?.id);
  const myDemandIds = myDemands.map(demand => demand.id);
  const myTransactions = mockTransactions.filter(transaction => transaction.buyerId === currentUser?.id);
  const myOffers = getGate1Offers().filter(offer => myDemandIds.includes(offer.demandId));
  const mySelections = getGate1Selections().filter(selection => selection.buyerId === currentUser?.id);

  const active = myDemands.filter(demand => demand.status === 'Open for Offers' || demand.status === 'Partially Allocated' || (!demand.qualification && ['Open', 'Posted', 'Response Received'].includes(demand.status))).length;
  const activeOffers = myOffers.filter(offer => offer.status === 'Active' || offer.status === 'Selected').length;
  const pendingSelections = mySelections.filter(selection => selection.status === 'Pending Supplier Confirmation').length;
  const disputes = 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="page-header">
        <div><h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1><p className="mt-1 text-sm text-gray-500">Welcome back, {currentUser?.name}</p></div>
        <Link to="/buyer/demands/new" className="btn-primary"><PlusCircle size={16} /> Create Demand</Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open Qualified Demands" value={active} icon={<FileText size={20} className="text-green-600" />} bg="bg-green-50" border="border-green-200" color="text-green-700" trend={<TrendingUp size={14} className="text-gray-300" />} />
        <StatCard label="Active Supplier Offers" value={activeOffers} icon={<MessageSquare size={20} className="text-blue-600" />} bg="bg-blue-50" border="border-blue-200" color="text-blue-700" trend={<TrendingUp size={14} className="text-gray-300" />} />
        <StatCard label="Pending Selections" value={pendingSelections} icon={<CheckSquare size={20} className="text-amber-600" />} bg="bg-amber-50" border="border-amber-200" color="text-amber-700" trend={<TrendingUp size={14} className="text-gray-300" />} />
        <StatCard label="Disputes / Cancellations" value={disputes} icon={<AlertTriangle size={20} className="text-red-500" />} bg="bg-red-50" border="border-red-200" color="text-red-700" trend={<TrendingUp size={14} className="text-gray-300" />} />
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between"><h2 className="section-title">My Demand Posts</h2><Link to="/buyer/demands" className="flex items-center gap-1 text-sm text-green-600 hover:underline">View All <ArrowRight size={14} /></Link></div>
        {myDemands.length === 0 ? <div className="py-8 text-center text-sm text-gray-400">No Demand posts yet. <Link to="/buyer/demands/new" className="text-green-600 hover:underline">Create your first Demand</Link></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100"><th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Crop</th><th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Quantity</th><th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Buyer Target</th><th className="hidden px-2 py-2 text-left text-xs font-medium text-gray-500 md:table-cell">Required Date</th><th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Status</th><th className="px-2 py-2 text-right text-xs font-medium text-gray-500">Action</th></tr></thead>
              <tbody>{myDemands.slice(0, 6).map(demand => <tr key={demand.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50"><td className="px-2 py-3"><div className="font-medium text-gray-900">{demand.cropName}</div><div className="text-xs text-gray-500">{demand.cropCategory}</div></td><td className="px-2 py-3 text-gray-700">{demand.quantity.toLocaleString()} {demand.unit}</td><td className="px-2 py-3 text-gray-700">{formatTargetPrice(demand.targetPriceProfile, demand.targetPrice)}/{demand.unit}</td><td className="hidden px-2 py-3 text-gray-500 md:table-cell">{demand.requiredDate}</td><td className="px-2 py-3"><StatusBadge status={demand.status} /></td><td className="px-2 py-3 text-right"><Link to={`/buyer/demands/${demand.id}`} className="text-xs font-medium text-green-600 hover:underline">View</Link></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between"><h2 className="section-title">Offers & Selections</h2><Link to="/buyer/responses" className="flex items-center gap-1 text-sm text-green-600 hover:underline">Compare Offers <ArrowRight size={14} /></Link></div>
        {myOffers.length === 0 ? <div className="py-6 text-center text-sm text-gray-400">No Supplier Offers yet.</div> : <div className="space-y-3">{myOffers.slice(0, 4).map(offer => { const demand = myDemands.find(item => item.id === offer.demandId); return <div key={offer.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"><div><div className="text-sm font-medium text-gray-900">{offer.supplierName}</div><div className="text-xs text-gray-500">{demand?.cropName} · Offer v{offer.currentVersionNumber}</div></div><StatusBadge status={offer.status} /></div>; })}</div>}
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between"><h2 className="section-title">Historical / Downstream Transactions</h2><Link to="/transactions" className="flex items-center gap-1 text-sm text-green-600 hover:underline">View All <ArrowRight size={14} /></Link></div>
        {myTransactions.length === 0 ? <div className="py-8 text-center text-sm text-gray-400">No transactions yet.</div> : <div className="space-y-3">{myTransactions.map(transaction => <div key={transaction.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:border-green-200"><div><div className="text-sm font-medium text-gray-900">{transaction.cropName}</div><div className="text-xs text-gray-500">{transaction.supplierName} • {transaction.quantity.toLocaleString()} {transaction.unit}</div></div><div className="flex flex-col items-end gap-1 text-right"><div className="text-sm font-semibold text-gray-900">₱{transaction.totalAmount.toLocaleString()}</div><StatusBadge status={transaction.status} /></div></div>)}</div>}
      </div>
    </div>
  );
}
