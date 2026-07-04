import { useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { mockCropCatalog, CROP_CATEGORIES, UNITS } from '../../data/mockData';

export default function AdminCropCatalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = mockCropCatalog.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || c.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Crop Catalog</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <PlusCircle size={16} /> Add Crop
        </button>
      </div>

      {showForm && (
        <div className="card border-green-200 bg-green-50">
          <h2 className="text-lg font-bold text-green-800 mb-4">Add New Crop</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Crop Name *</label>
              <input className="input" placeholder="e.g., Palay (RC-216)" />
            </div>
            <div>
              <label className="label">Category *</label>
              <select className="input">
                {CROP_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Variety</label>
              <input className="input" placeholder="e.g., RC-216, Grade A" />
            </div>
            <div>
              <label className="label">Default Unit</label>
              <select className="input">
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="label">Notes</label>
            <input className="input" placeholder="Optional notes..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={() => { alert('Crop added! (Demo)'); setShowForm(false); }} className="btn-primary flex-1 justify-center">Save Crop</button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search crops..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-44" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CROP_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Crop Name', 'Category', 'Variety', 'Unit', 'Status', 'Notes', ''].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-900">{c.name}</td>
                  <td className="py-3 px-2">
                    <span className="badge bg-green-100 text-green-700 text-xs">{c.category}</span>
                  </td>
                  <td className="py-3 px-2 text-gray-600 text-xs">{c.variety || '—'}</td>
                  <td className="py-3 px-2 text-gray-600 text-xs">{c.unit}</td>
                  <td className="py-3 px-2">
                    <span className={`badge text-xs ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-400 text-xs max-w-[200px] truncate">{c.notes || '—'}</td>
                  <td className="py-3 px-2">
                    <div className="flex gap-2">
                      <button className="text-xs text-green-600 hover:underline">Edit</button>
                      <button className={`text-xs hover:underline ${c.active ? 'text-red-500' : 'text-green-500'}`}>
                        {c.active ? 'Deactivate' : 'Activate'}
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
