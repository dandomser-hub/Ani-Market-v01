import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { formatTargetPrice, getGate1Demands } from '../../data/gate1DemandData';
import { useApp } from '../../context/AppContext';
import type { DemandStatus } from '../../types';

const STATUS_OPTIONS: DemandStatus[] = [
  'Draft', 'Submitted for Qualification', 'Needs Correction', 'Open for Offers', 'Offer Window Closed',
  'Partially Allocated', 'Fully Reserved', 'Fully Committed', 'Partially Fulfilled', 'Fulfilled',
  'Closed — Accepted Partial Fulfillment', 'Closed — Fulfilled Within Tolerance', 'Cancelled', 'Expired', 'Suspended',
];

export default function DemandList() {
  const { currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const demands = getGate1Demands().filter(demand => !currentUser || demand.buyerId === currentUser.id);

  const filtered = demands.filter(demand => {
    const matchSearch = demand.cropName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || demand.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="page-header">
        <div><h1 className="text-2xl font-bold text-gray-900">My Demand Posts</h1><p className="text-sm text-gray-500 mt-1">Drafts remain private. Only qualified Demands become Open for Offers.</p></div>
        <Link to="/buyer/demands/new" className="btn-primary"><PlusCircle size={16} /> New Demand</Link>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="input pl-9" placeholder="Search by crop name..." value={search} onChange={event => setSearch(event.target.value)} /></div>
          <div className="flex items-center gap-2"><Filter size={16} className="text-gray-400" /><select className="input w-56" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="">All Statuses</option>{STATUS_OPTIONS.map(status => <option key={status}>{status}</option>)}</select></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">{['Crop', 'Qty & Unit', 'Buyer Target', 'Location', 'Required', 'Offer Deadline', 'Offers', 'Status', ''].map(header => <th key={header} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold whitespace-nowrap">{header}</th>)}</tr></thead>
            <tbody>
              {filtered.map(demand => (
                <tr key={demand.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2"><div className="font-medium text-gray-900">{demand.cropName}</div><div className="text-xs text-gray-400">{demand.cropCategory}</div></td>
                  <td className="py-3 px-2 text-gray-700 whitespace-nowrap">{demand.quantity.toLocaleString()} {demand.unit}{demand.minimumSupplierQuantity ? <div className="text-xs text-gray-400">Min/supplier: {demand.minimumSupplierQuantity.toLocaleString()}</div> : null}</td>
                  <td className="py-3 px-2 text-gray-700 whitespace-nowrap">{formatTargetPrice(demand.targetPriceProfile, demand.targetPrice)}<div className="text-xs text-gray-400">per {demand.unit}</div></td>
                  <td className="py-3 px-2 text-gray-500 text-xs">{demand.location}</td>
                  <td className="py-3 px-2 text-gray-500 text-xs whitespace-nowrap">{demand.requiredDate}{demand.fulfillmentWindowEnd ? ` → ${demand.fulfillmentWindowEnd}` : ''}</td>
                  <td className="py-3 px-2 text-gray-500 text-xs whitespace-nowrap">{demand.expirationDate}</td>
                  <td className="py-3 px-2 text-center"><span className="font-semibold text-gray-800">{demand.responseCount}</span></td>
                  <td className="py-3 px-2"><StatusBadge status={demand.status} /></td>
                  <td className="py-3 px-2 text-right"><Link to={`/buyer/demands/${demand.id}`} className="text-xs font-medium text-green-600 hover:underline">View</Link></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-gray-400">No demand posts found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
