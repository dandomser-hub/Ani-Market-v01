import { useState } from 'react';
import { Search, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockDemandPosts } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function AdminDemands() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = mockDemandPosts.filter(d => {
    const matchSearch = !search || d.cropName.toLowerCase().includes(search.toLowerCase()) || d.buyerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Demand Post Monitoring</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search crop or buyer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['Draft','Posted','Open','Response Received','Matched','In Transaction','Completed','Cancelled','Disputed','Expired'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['ID', 'Crop', 'Buyer', 'Quantity', 'Target Price', 'Location', 'Expiry', 'Responses', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2 text-xs text-gray-400 font-mono">{d.id}</td>
                  <td className="py-3 px-2">
                    <div className="font-medium text-gray-900">{d.cropName}</div>
                    <div className="text-xs text-gray-400">{d.cropCategory}</div>
                  </td>
                  <td className="py-3 px-2 text-gray-700 text-xs">{d.buyerName}</td>
                  <td className="py-3 px-2 text-gray-700 whitespace-nowrap text-xs">{d.quantity.toLocaleString()} {d.unit}</td>
                  <td className="py-3 px-2 text-gray-700 text-xs">₱{d.targetPrice.toLocaleString()}</td>
                  <td className="py-3 px-2 text-gray-500 text-xs">{d.location}</td>
                  <td className="py-3 px-2 text-gray-500 text-xs whitespace-nowrap">{d.expirationDate}</td>
                  <td className="py-3 px-2 text-center font-semibold text-gray-800 text-xs">{d.responseCount}</td>
                  <td className="py-3 px-2"><StatusBadge status={d.status} /></td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1.5">
                      <Link to={`/buyer/demands/${d.id}`} className="text-xs text-green-600 hover:underline">View</Link>
                      <button className="text-xs text-orange-500 hover:underline flex items-center gap-0.5">
                        <Flag size={10} /> Flag
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
