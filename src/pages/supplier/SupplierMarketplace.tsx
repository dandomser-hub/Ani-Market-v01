import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, MapPin, Calendar, Package, DollarSign, ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import OfferModal from '../../components/OfferModal';
import { useApp } from '../../context/AppContext';
import { formatTargetPrice, getGate1Demands, getServiceAreas } from '../../data/gate1DemandData';
import { getActiveOfferForSupplierDemand } from '../../data/gate1OfferData';
import type { DemandPost } from '../../types';

function isBrowseableDemand(demand: DemandPost) {
  if (demand.status === 'Open for Offers' || demand.status === 'Partially Allocated') return true;
  return !demand.qualification && ['Open', 'Posted', 'Response Received'].includes(demand.status);
}

function DemandCard({ demand, hasOffer, onOffer }: { demand: DemandPost; hasOffer: boolean; onOffer: () => void }) {
  return (
    <div className="card-hover">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div><h3 className="font-bold text-gray-900">{demand.cropName}</h3><div className="mt-0.5 text-xs text-gray-500">{demand.cropCategory} • {demand.variety}</div></div>
        <StatusBadge status={demand.status} />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-1.5"><Package size={14} className="text-gray-400" /><div><div className="text-xs text-gray-500">Quantity</div><div className="text-sm font-semibold text-gray-800">{demand.quantity.toLocaleString()} {demand.unit}</div>{demand.minimumSupplierQuantity ? <div className="text-xs text-gray-400">Min {demand.minimumSupplierQuantity.toLocaleString()}</div> : null}</div></div>
        <div className="flex items-center gap-1.5"><DollarSign size={14} className="text-gray-400" /><div><div className="text-xs text-gray-500">Buyer Target</div><div className="text-sm font-semibold text-green-700">{formatTargetPrice(demand.targetPriceProfile, demand.targetPrice)}</div></div></div>
        <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /><div><div className="text-xs text-gray-500">Location</div><div className="text-sm text-gray-700">{demand.location}</div></div></div>
        <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /><div><div className="text-xs text-gray-500">Required</div><div className="text-sm text-gray-700">{demand.requiredDate}</div></div></div>
      </div>
      <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
        <div className="flex flex-wrap gap-2 text-xs text-gray-500"><span className="rounded bg-gray-100 px-2 py-1">{demand.deliveryPreference}</span><span className="rounded bg-gray-100 px-2 py-1">{demand.buyerType}</span><span className="rounded bg-gray-100 px-2 py-1">Offers close {demand.expirationDate}</span></div>
        <div className="flex gap-2">
          <Link to={`/supplier/marketplace/${demand.id}`} className="btn-secondary flex-1 py-1.5 text-center text-xs">View</Link>
          {hasOffer ? <Link to="/supplier/responses" className="btn-secondary flex-1 py-1.5 text-center text-xs">View My Offer</Link> : <button onClick={onOffer} className="btn-primary flex-1 py-1.5 text-center text-xs">Make Offer</button>}
        </div>
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
  const [offeringTo, setOfferingTo] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const demands = getGate1Demands();
  const serviceAreas = getServiceAreas().filter(area => area.active);
  void revision;

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
    if (!demand) return <div className="card mx-auto max-w-3xl">Demand not found.</div>;
    const actionable = isBrowseableDemand(demand);
    const myOffer = currentUser ? getActiveOfferForSupplierDemand(currentUser.id, demand.id) : undefined;
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex items-center gap-3"><Link to="/supplier/marketplace" className="btn-ghost px-3 py-1.5"><ArrowLeft size={16} /> Back</Link><h1 className="text-xl font-bold text-gray-900">{demand.cropName}</h1><StatusBadge status={demand.status} /></div>
        <div className="card">
          <div className="mb-4 flex items-center justify-between"><h2 className="section-title">Qualified Demand Details</h2><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">Offer deadline: {demand.expirationDate}</span></div>
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
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
          {demand.qualitySpecs && <div className="mt-4 rounded-lg bg-gray-50 p-3"><div className="mb-1 text-xs text-gray-500">Quality / Product Specifications</div><p className="text-sm text-gray-700">{demand.qualitySpecs}</p></div>}
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">The Buyer target is guidance only. Submit your own Offered Price. Competing Supplier Offers are confidential and Ani Market does not automatically select a winner.</div>
          {myOffer && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">You already have an active Offer for this Demand. Use <strong>My Offers</strong> to revise or withdraw it while it remains eligible.</div>}
          {actionable && (myOffer ? <Link to="/supplier/responses" className="btn-secondary mt-5">View My Offer</Link> : <button onClick={() => setOfferingTo(demand.id)} className="btn-primary mt-5">Make Offer</button>)}
        </div>
        {offeringTo && <OfferModal demand={demand} onClose={() => setOfferingTo(null)} onSaved={() => setRevision(value => value + 1)} />}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="page-header"><div><h1 className="text-2xl font-bold text-gray-900">New Opportunity for Your Crops</h1><p className="mt-1 text-sm text-gray-500">Only qualified and currently open procurement requirements are actionable.</p></div><div className="text-sm text-gray-500">{filtered.length} available</div></div>
      <div className="card"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="input pl-9" placeholder="Search crops..." value={search} onChange={event => setSearch(event.target.value)} /></div><div className="flex gap-2"><select className="input w-44" value={province} onChange={event => setProvince(event.target.value)}><option value="">All Service Areas</option>{serviceAreas.map(area => <option key={area.id}>{area.province}</option>)}</select><select className="input w-44" value={category} onChange={event => setCategory(event.target.value)}><option value="">All Categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select></div></div></div>
      {filtered.length === 0 ? <div className="card py-12 text-center text-sm text-gray-400">No qualified Demand opportunities match your filters.</div> : <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{filtered.map(demand => <DemandCard key={demand.id} demand={demand} hasOffer={Boolean(currentUser && getActiveOfferForSupplierDemand(currentUser.id, demand.id))} onOffer={() => setOfferingTo(demand.id)} />)}</div>}
      {offeringTo && (() => { const demand = demands.find(item => item.id === offeringTo); return demand ? <OfferModal demand={demand} onClose={() => setOfferingTo(null)} onSaved={() => setRevision(value => value + 1)} /> : null; })()}
    </div>
  );
}
