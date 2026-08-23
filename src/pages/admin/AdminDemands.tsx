import { useState } from 'react';
import { Search, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import {
  formatTargetPrice,
  getGate1Demands,
  saveDemandEvent,
  saveGate1Demand,
} from '../../data/gate1DemandData';

export default function AdminDemands() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [revision, setRevision] = useState(0);
  void revision;
  const demands = getGate1Demands();

  const filtered = demands.filter(demand => {
    const matchSearch = !search || demand.cropName.toLowerCase().includes(search.toLowerCase()) || demand.buyerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || demand.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const suspendDemand = (demandId: string) => {
    const demand = demands.find(item => item.id === demandId);
    if (!demand) return;
    const reason = window.prompt('Reason for suspending this Demand?');
    if (!reason?.trim()) return;
    const now = new Date().toISOString();
    saveGate1Demand({ ...demand, status: 'Suspended', updatedAt: now, qualification: demand.qualification ? { ...demand.qualification, status: 'Suspended', evaluatedAt: now } : demand.qualification });
    saveDemandEvent({ id: `de-${demand.id}-suspended-${Date.now()}`, demandId: demand.id, eventType: 'Suspended', actorId: 'admin1', actorRole: 'admin', reason: reason.trim(), createdAt: now });
    setRevision(value => value + 1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header"><div><h1 className="text-2xl font-bold text-gray-900">Demand Monitoring</h1><p className="text-sm text-gray-500 mt-1">Routine Demands qualify automatically. Admin intervention is reserved for override, suspension, and marketplace-control cases.</p></div></div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="input pl-9" placeholder="Search crop or buyer..." value={search} onChange={event => setSearch(event.target.value)} /></div>
        <select className="input w-56" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="">All Statuses</option>{['Draft','Submitted for Qualification','Needs Correction','Open for Offers','Offer Window Closed','Partially Allocated','Fully Reserved','Fully Committed','Partially Fulfilled','Fulfilled','Cancelled','Expired','Suspended'].map(status => <option key={status}>{status}</option>)}</select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200">{['ID', 'Crop', 'Buyer', 'Quantity', 'Buyer Target', 'Location', 'Offer Deadline', 'Qualification', 'Status', ''].map(header => <th key={header} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold whitespace-nowrap">{header}</th>)}</tr></thead>
          <tbody>
            {filtered.map(demand => (
              <tr key={demand.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-2 text-xs text-gray-400 font-mono">{demand.id}</td>
                <td className="py-3 px-2"><div className="font-medium text-gray-900">{demand.cropName}</div><div className="text-xs text-gray-400">{demand.cropCategory}</div></td>
                <td className="py-3 px-2 text-gray-700 text-xs">{demand.buyerName}</td>
                <td className="py-3 px-2 text-gray-700 whitespace-nowrap text-xs">{demand.quantity.toLocaleString()} {demand.unit}</td>
                <td className="py-3 px-2 text-gray-700 text-xs whitespace-nowrap">{formatTargetPrice(demand.targetPriceProfile, demand.targetPrice)}</td>
                <td className="py-3 px-2 text-gray-500 text-xs">{demand.location}</td>
                <td className="py-3 px-2 text-gray-500 text-xs whitespace-nowrap">{demand.expirationDate}</td>
                <td className="py-3 px-2 text-xs"><span className={demand.qualification?.status === 'Qualified' ? 'text-green-700 font-medium' : demand.qualification ? 'text-amber-700 font-medium' : 'text-gray-400'}>{demand.qualification?.status ?? 'Legacy / Not Evaluated'}</span></td>
                <td className="py-3 px-2"><StatusBadge status={demand.status} /></td>
                <td className="py-3 px-2"><div className="flex gap-2"><Link to={`/buyer/demands/${demand.id}`} className="text-xs text-green-600 hover:underline">View</Link>{!['Cancelled','Expired','Suspended','Fulfilled'].includes(demand.status) && <button onClick={() => suspendDemand(demand.id)} className="text-xs text-orange-600 hover:underline flex items-center gap-0.5"><Flag size={10} /> Suspend</button>}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
