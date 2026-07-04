import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, MapPin, Calendar, Package, DollarSign, ArrowLeft } from 'lucide-react';
import { mockDemandPosts, PROVINCES, CROP_CATEGORIES } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

function DemandCard({ demand, onRespond }: { demand: typeof mockDemandPosts[0]; onRespond: () => void }) {
  return (
    <div className="card-hover">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{demand.cropName}</h3>
          <div className="text-xs text-gray-500 mt-0.5">{demand.cropCategory} • {demand.variety}</div>
        </div>
        <StatusBadge status={demand.status} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <Package size={14} className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Quantity</div>
            <div className="text-sm font-semibold text-gray-800">{demand.quantity.toLocaleString()} {demand.unit}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Target Price</div>
            <div className="text-sm font-semibold text-green-700">₱{demand.targetPrice.toLocaleString()}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Location</div>
            <div className="text-sm text-gray-700">{demand.location}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Required By</div>
            <div className="text-sm text-gray-700">{demand.requiredDate}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded">{demand.deliveryPreference}</span>
          <span className="bg-gray-100 px-2 py-1 rounded">{demand.buyerType}</span>
          <span className="bg-gray-100 px-2 py-1 rounded">{demand.responseCount} responses</span>
        </div>
        <div className="flex gap-2">
          <Link to={`/supplier/marketplace/${demand.id}`} className="btn-secondary text-xs py-1.5">View</Link>
          {demand.status !== 'Matched' && demand.status !== 'Completed' && (
            <button onClick={onRespond} className="btn-primary text-xs py-1.5">Respond</button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResponseModal({ demand, onClose }: { demand: typeof mockDemandPosts[0]; onClose: () => void }) {
  const [form, setForm] = useState({ qty: '', price: demand.targetPrice.toString(), fulfillmentDate: '', note: '', qualityConfirm: '', remarks: '' });
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const handle = (e: React.FormEvent) => { e.preventDefault(); alert('Response submitted! (Demo)'); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Submit Response</h3>
            <p className="text-sm text-gray-500">{demand.cropName} — {demand.buyerName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Available Quantity ({demand.unit}) *</label>
              <input type="number" className="input" placeholder={demand.quantity.toString()} value={form.qty} onChange={e => update('qty', e.target.value)} required />
            </div>
            <div>
              <label className="label">Offered Price (₱) *</label>
              <input type="number" className="input" value={form.price} onChange={e => update('price', e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="label">Fulfillment Date *</label>
            <input type="date" className="input" value={form.fulfillmentDate} onChange={e => update('fulfillmentDate', e.target.value)} required />
          </div>
          <div>
            <label className="label">Pickup / Delivery Note</label>
            <input className="input" placeholder="e.g., Can deliver to Naga City" value={form.note} onChange={e => update('note', e.target.value)} />
          </div>
          <div>
            <label className="label">Quality Spec Confirmation *</label>
            <textarea className="input resize-none" rows={2} placeholder="Confirm you meet the buyer's quality specs..." value={form.qualityConfirm} onChange={e => update('qualityConfirm', e.target.value)} required />
          </div>
          <div>
            <label className="label">Remarks</label>
            <textarea className="input resize-none" rows={2} placeholder="Any additional notes..." value={form.remarks} onChange={e => update('remarks', e.target.value)} />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            By submitting, you confirm that you are not responding to your own demand post. One demand may be matched to one supplier only (Lean MVP).
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Submit Response</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SupplierMarketplace() {
  const { id } = useParams();
  const { currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [category, setCategory] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const browseable = mockDemandPosts.filter(d =>
    ['Open', 'Posted', 'Response Received'].includes(d.status) &&
    d.buyerId !== currentUser?.id
  );

  const filtered = browseable.filter(d => {
    const matchSearch = !search || d.cropName.toLowerCase().includes(search.toLowerCase());
    const matchProvince = !province || d.province === province;
    const matchCategory = !category || d.cropCategory === category;
    return matchSearch && matchProvince && matchCategory;
  });

  if (id) {
    const demand = mockDemandPosts.find(d => d.id === id) ?? mockDemandPosts[0];
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/supplier/marketplace" className="btn-ghost py-1.5 px-3"><ArrowLeft size={16} /> Back</Link>
          <h1 className="text-xl font-bold text-gray-900">{demand.cropName}</h1>
          <StatusBadge status={demand.status} />
        </div>
        <div className="card">
          <h2 className="section-title mb-4">Demand Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Category', value: demand.cropCategory },
              { label: 'Variety', value: demand.variety || '—' },
              { label: 'Quantity', value: `${demand.quantity.toLocaleString()} ${demand.unit}` },
              { label: 'Target Price', value: `₱${demand.targetPrice.toLocaleString()}` },
              { label: 'Location', value: demand.location },
              { label: 'Delivery', value: demand.deliveryPreference },
              { label: 'Required By', value: demand.requiredDate },
              { label: 'Expires', value: demand.expirationDate },
              { label: 'Buyer Type', value: demand.buyerType },
            ].map(row => (
              <div key={row.label}>
                <div className="text-xs text-gray-500">{row.label}</div>
                <div className="text-sm font-medium text-gray-900">{row.value}</div>
              </div>
            ))}
          </div>
          {demand.qualitySpecs && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Quality Specifications</div>
              <p className="text-sm text-gray-700">{demand.qualitySpecs}</p>
            </div>
          )}
          {demand.status !== 'Matched' && demand.status !== 'Completed' && (
            <button onClick={() => setRespondingTo(demand.id)} className="btn-primary mt-5">Submit Response</button>
          )}
        </div>
        {respondingTo && <ResponseModal demand={demand} onClose={() => setRespondingTo(null)} />}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Browse Demand</h1>
        <div className="text-sm text-gray-500">{filtered.length} available demands</div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search crops..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <select className="input w-44" value={province} onChange={e => setProvince(e.target.value)}>
              <option value="">All Provinces</option>
              {PROVINCES.map(p => <option key={p}>{p}</option>)}
            </select>
            <select className="input w-44" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CROP_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400 text-sm">No available demand posts match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(d => (
            <DemandCard key={d.id} demand={d} onRespond={() => setRespondingTo(d.id)} />
          ))}
        </div>
      )}
      {respondingTo && (
        <ResponseModal demand={mockDemandPosts.find(d => d.id === respondingTo)!} onClose={() => setRespondingTo(null)} />
      )}
    </div>
  );
}
