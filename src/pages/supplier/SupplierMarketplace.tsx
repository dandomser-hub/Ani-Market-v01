import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, MapPin, Calendar, Package, DollarSign, ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import ResponseModal from '../../components/ResponseModal';
import { useApp } from '../../context/AppContext';
import { formatTargetPrice, getGate1Demands, getServiceAreas } from '../../data/gate1DemandData';
import type { DemandPost } from '../../types';

function isBrowseableDemand(demand: DemandPost) {
  if (demand.status === 'Open for Offers') return true;
  // Temporary migration compatibility for pre-Gate-1 demo data only.
  return !demand.qualification && ['Open', 'Posted', 'Response Received'].includes(demand.status);
}

function DemandCard({ demand, onRespond }: { demand: DemandPost; onRespond: () => void }) {
  return (
    <div className="card-hover">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div><h3 className="font-bold text-gray-900">{demand.cropName}</h3><div className="text-xs text-gray-500 mt-0.5">{demand.cropCategory} • {demand.variety}</div></div>
        <StatusBadge status={demand.status} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="flex items-center gap-1.5"><Package size={14} className="text-gray-400" /><div><div className="text-xs text-gray-500">Quantity</div><div className="text-sm font-semibold text-gray-800">{demand.quantity.toLocaleString()} {demand.unit}</div>{demand.minimumSupplierQuantity ? <div className="text-xs text-gray-400">Min {demand.minimumSupplierQuantity.toLocaleString()}</div> : null}</div></div>
        <div className="flex items-center gap-1.5"><DollarSign size={14} className="text-gray-400" /><div><div className="text-xs text-gray-500">Buyer Target</div><div className="text-sm font-semibold text-green-700">{formatTargetPrice(demand.targetPriceProfile, demand.targetPrice)}</div></div></div>
        <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /><div><div className="text-xs text-gray-500">Location</div><div className="text-sm text-gray-700">{demand.location}</div></div></div>
        <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /><div><div className="text-xs text-gray-500">Required</div><div className="text-sm text-gray-700">{demand.requiredDate}</div></div></div>
      </div>
      <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-2 text-xs text-gray-500"><span className="bg-gray-100 px-2 py-1 rounded">{demand.deliveryPreference}</span><span className="bg-gray-100 px-2 py-1 rounded">{demand.buyerType}</span><span className="bg-gray-100 px-2 py-1 rounded">Offers close {demand.expirationDate}</span></div>
        <div className="flex gap-2"><Link to={`/supplier/marketplace/${demand.id}`} className="btn-secondary text-xs py-1.5 flex-1 text-center">View</Link><button onClick={onRespond} className="btn-primary text-xs py-1.5 flex-1 text-center">Make Offer</button></div>
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
  const demands = getGate1Demands();
  const serviceAreas = getServiceAreas().filter(area => area.active);

  const browseable = demands.filter(demand => isBrowseableDemand(demand) && demand.buyerId !== currentUser?.id);
  const categories = Array.from(new Set(browseable.map(demand => demand.cropCategory))).sort();
  const filtered = browseable.filter(demand => {
    const matchSearch = !search || demand.cropName.toLowerCase().includes(search.toLowerCase());
    const matchProvince = !province || demand.province === province;
    const matchCategory = !category || demand.cropCategory === category;
    return matchSearch && matchProvince && matchCategory;
  });

  if (id) {
    const demand = demands.find(item => item.id === id);
    if (!demand) return <div className="card max-w-3xl mx-auto">Demand not found.</div>;
    const actionable = isBrowseableDemand(demand);
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3"><Link to="/supplier/marketplace" className="btn-ghost py-1.5 px-3"><ArrowLeft size={16} /> Back</Link><h1 className="text-xl font-bold text-gray-900">{demand.cropName}</h1><StatusBadge status={demand.status} /></div>
        <div className="card">
          <div className="flex items-center justify-between mb-4"><h2 className="section-title">Qualified Demand Details</h2><span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">Offer deadline: {demand.expirationDate}</span></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Category', value: demand.cropCategory },
              { label: 'Variety / Spec', value: demand.variety || '—' },
              { label: 'Requested Quantity', value: `${demand.quantity.toLocaleString()} ${demand.unit}` },
              { label: 'Minimum per Supplier', value: demand.minimumSupplierQuantity ? `${demand.minimumSupplierQuantity.toLocaleString()} ${demand.unit}` : 'No buyer minimum' },
              { label: 'Buyer Target', value: `${formatTargetPrice(demand.targetPriceProfile, demand.targetPrice)}/${demand.unit}` },
              { label: 'Location', value: demand.location },
              { label: 'Fulfillment', value: demand.deliveryPreference },
              { label: 'Required', value: demand.fulfillmentWindowEnd ? `${demand.requiredDate} → ${demand.fulfillmentWindowEnd}` : demand.requiredDate },
              { label: 'Buyer Type', value: demand.buyerType },
            ].map(row => <div key={row.label}><div className="text-xs text-gray-500">{row.label}</div><div className="text-sm font-medium text-gray-900">{row.value}</div></div>)}
          </div>
          {demand.qualitySpecs && <div className="mt-4 p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500 mb-1">Quality / Product Specifications</div><p className="text-sm text-gray-700">{demand.qualitySpecs}</p></div>}
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">The Buyer target is guidance only. Suppliers may submit their own Offered Price. Ani Market does not automatically select a winning Supplier.</div>
          {actionable && <button onClick={() => setRespondingTo(demand.id)} className="btn-primary mt-5">Make Offer</button>}
        </div>
        {respondingTo && <ResponseModal demand={demand} onClose={() => setRespondingTo(null)} />}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="page-header"><div><h1 className="text-2xl font-bold text-gray-900">New Opportunity for Your Crops</h1><p className="text-sm text-gray-500 mt-1">Only qualified and currently open procurement requirements are actionable.</p></div><div className="text-sm text-gray-500">{filtered.length} available</div></div>
      <div className="card"><div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="input pl-9" placeholder="Search crops..." value={search} onChange={event => setSearch(event.target.value)} /></div><div className="flex gap-2"><select className="input w-44" value={province} onChange={event => setProvince(event.target.value)}><option value="">All Service Areas</option>{serviceAreas.map(area => <option key={area.id}>{area.province}</option>)}</select><select className="input w-44" value={category} onChange={event => setCategory(event.target.value)}><option value="">All Categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select></div></div></div>
      {filtered.length === 0 ? <div className="card text-center py-12 text-gray-400 text-sm">No qualified Demand opportunities match your filters.</div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{filtered.map(demand => <DemandCard key={demand.id} demand={demand} onRespond={() => setRespondingTo(demand.id)} />)}</div>}
      {respondingTo && (() => { const demand = demands.find(item => item.id === respondingTo); return demand ? <ResponseModal demand={demand} onClose={() => setRespondingTo(null)} /> : null; })()}
    </div>
  );
}
