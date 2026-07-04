import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { mockDemandPosts } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import type { DemandStatus } from '../../types';

const STATUS_OPTIONS: DemandStatus[] = [
  'Draft', 'Posted', 'Open', 'Response Received', 'Matched', 'In Transaction', 'Completed', 'Cancelled', 'Disputed', 'Expired',
];

export default function DemandList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = mockDemandPosts.filter(d => {
    const matchSearch = d.cropName.toLowerCase().includes(search.toLowerCase()) || d.buyerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">My Demand Posts</h1>
        <Link to="/buyer/demands/new" className="btn-primary">
          <PlusCircle size={16} /> New Demand
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search by crop name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select className="input w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Crop', 'Qty & Unit', 'Target Price', 'Location', 'Required Date', 'Expiry', 'Responses', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2">
                    <div className="font-medium text-gray-900">{d.cropName}</div>
                    <div className="text-xs text-gray-400">{d.cropCategory}</div>
                  </td>
                  <td className="py-3 px-2 text-gray-700 whitespace-nowrap">{d.quantity.toLocaleString()} {d.unit}</td>
                  <td className="py-3 px-2 text-gray-700 whitespace-nowrap">₱{d.targetPrice.toLocaleString()}</td>
                  <td className="py-3 px-2 text-gray-500 text-xs">{d.location}</td>
                  <td className="py-3 px-2 text-gray-500 text-xs whitespace-nowrap">{d.requiredDate}</td>
                  <td className="py-3 px-2 text-gray-500 text-xs whitespace-nowrap">{d.expirationDate}</td>
                  <td className="py-3 px-2 text-center">
                    <span className="font-semibold text-gray-800">{d.responseCount}</span>
                  </td>
                  <td className="py-3 px-2"><StatusBadge status={d.status} /></td>
                  <td className="py-3 px-2 text-right">
                    <Link to={`/buyer/demands/${d.id}`} className="text-xs font-medium text-green-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-400">No demand posts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
