import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatTargetPrice,
  getCropCatalog,
  getGate1Demands,
  getServiceAreas,
  qualifyDemand,
  representativeTargetPrice,
  saveDemandEvent,
  saveGate1Demand,
} from '../../data/gate1DemandData';
import type { TargetPriceProfile, TargetPriceType } from '../../types';

export default function EditDemand() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canTransact } = useApp();
  const existing = getGate1Demands().find(item => item.id === id);
  const catalog = getCropCatalog().filter(item => item.active);
  const serviceAreas = getServiceAreas().filter(item => item.active);

  if (!existing) return <div className="card max-w-3xl mx-auto">Demand not found.</div>;
  if (existing.responseCount > 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Link to={`/buyer/demands/${existing.id}`} className="btn-ghost"><ArrowLeft size={16} /> Back</Link>
        <div className="card border-amber-300 bg-amber-50"><div className="flex gap-3"><AlertTriangle className="text-amber-600" /><div><h1 className="font-bold text-amber-900">Direct material editing is locked</h1><p className="text-sm text-amber-800 mt-1">At least one Supplier Offer/response already exists. Cancel or close this Demand with a recorded reason, then create a revised Demand so existing Suppliers are never subjected to silent term changes.</p></div></div></div>
      </div>
    );
  }

  const currentProfile: TargetPriceProfile = existing.targetPriceProfile ?? { type: 'Approximate', currency: 'PHP', unitPrice: existing.targetPrice };
  const [form, setForm] = useState({
    quantity: existing.quantity.toString(),
    minimumSupplierQuantity: existing.minimumSupplierQuantity?.toString() ?? '',
    targetPriceType: currentProfile.type as TargetPriceType,
    targetPrice: currentProfile.unitPrice?.toString() ?? existing.targetPrice.toString(),
    targetPriceMin: currentProfile.minimumPrice?.toString() ?? '',
    targetPriceMax: currentProfile.maximumPrice?.toString() ?? '',
    province: existing.province,
    municipality: existing.municipality ?? existing.location.split(',')[0]?.trim() ?? '',
    requiredDate: existing.requiredDate,
    fulfillmentWindowEnd: existing.fulfillmentWindowEnd ?? '',
    expirationDate: existing.expirationDate,
    qualitySpecs: existing.qualitySpecs,
    notes: existing.notes,
    buyerSeriousnessDeclared: existing.buyerSeriousnessDeclared ?? false,
  });
  const [message, setMessage] = useState('');

  const selectedArea = serviceAreas.find(area => area.province === form.province);
  const municipalities = selectedArea?.municipalities ?? [];
  const commodityStillEnabled = catalog.some(item => item.active && item.name === existing.cropName);

  const targetProfile = (): TargetPriceProfile => form.targetPriceType === 'Range'
    ? { type: 'Range', currency: 'PHP', minimumPrice: Number(form.targetPriceMin), maximumPrice: Number(form.targetPriceMax) }
    : { type: form.targetPriceType, currency: 'PHP', unitPrice: Number(form.targetPrice) };

  const saveRevision = () => {
    const targetPriceProfile = targetProfile();
    const now = new Date().toISOString();
    const revised = {
      ...existing,
      quantity: Number(form.quantity),
      minimumSupplierQuantity: form.minimumSupplierQuantity ? Number(form.minimumSupplierQuantity) : undefined,
      targetPriceProfile,
      targetPrice: representativeTargetPrice(targetPriceProfile),
      province: form.province,
      municipality: form.municipality,
      serviceAreaId: selectedArea?.id,
      location: `${form.municipality}, ${form.province}`,
      requiredDate: form.requiredDate,
      fulfillmentWindowEnd: form.fulfillmentWindowEnd || undefined,
      expirationDate: form.expirationDate,
      qualitySpecs: form.qualitySpecs,
      notes: form.notes,
      buyerSeriousnessDeclared: form.buyerSeriousnessDeclared,
      status: 'Submitted for Qualification' as const,
      updatedAt: now,
    };
    const result = qualifyDemand(revised, { buyerTransactionEnabled: canTransact });
    const finalDemand = { ...revised, qualification: result, status: result.status === 'Qualified' ? 'Open for Offers' as const : 'Needs Correction' as const };
    saveGate1Demand(finalDemand);
    saveDemandEvent({ id: `de-${existing.id}-repost-${Date.now()}`, demandId: existing.id, eventType: 'Reposted', actorId: existing.buyerId, actorRole: 'buyer', reason: 'Material terms revised before any Supplier Offer and requalified.', createdAt: now });
    saveDemandEvent({ id: `de-${existing.id}-requal-${Date.now()}`, demandId: existing.id, eventType: result.status === 'Qualified' ? 'Qualified' : 'Needs Correction', actorId: 'system', actorRole: 'admin', createdAt: now });
    if (result.status === 'Qualified') navigate(`/buyer/demands/${existing.id}`);
    else setMessage(result.checks.filter(check => !check.passed).map(check => check.message ?? check.label).join(' • '));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3"><Link to={`/buyer/demands/${existing.id}`} className="btn-ghost"><ArrowLeft size={16} /> Back</Link><div><h1 className="text-2xl font-bold text-gray-900">Edit & Requalify Demand</h1><p className="text-sm text-gray-500">{existing.cropName} · current target {formatTargetPrice(existing.targetPriceProfile, existing.targetPrice)}</p></div></div>
      {!commodityStillEnabled && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">This commodity has been disabled by marketplace administration. The revised Demand cannot requalify until it is enabled again.</div>}
      {message && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{message}</div>}
      <div className="card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="label">Requested Quantity</label><input type="number" className="input" value={form.quantity} onChange={event => setForm(current => ({ ...current, quantity: event.target.value }))} /></div><div><label className="label">Minimum per Supplier</label><input type="number" className="input" value={form.minimumSupplierQuantity} onChange={event => setForm(current => ({ ...current, minimumSupplierQuantity: event.target.value }))} /></div></div>
        <div><label className="label">Target Price Type</label><div className="grid grid-cols-3 gap-2">{(['Approximate','Average','Range'] as TargetPriceType[]).map(type => <button key={type} type="button" onClick={() => setForm(current => ({ ...current, targetPriceType: type }))} className={`rounded-lg border px-3 py-2 text-sm ${form.targetPriceType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}>{type}</button>)}</div></div>
        {form.targetPriceType === 'Range' ? <div className="grid grid-cols-2 gap-4"><div><label className="label">Minimum Target</label><input type="number" className="input" value={form.targetPriceMin} onChange={event => setForm(current => ({ ...current, targetPriceMin: event.target.value }))} /></div><div><label className="label">Maximum Target</label><input type="number" className="input" value={form.targetPriceMax} onChange={event => setForm(current => ({ ...current, targetPriceMax: event.target.value }))} /></div></div> : <div><label className="label">Target Price</label><input type="number" className="input" value={form.targetPrice} onChange={event => setForm(current => ({ ...current, targetPrice: event.target.value }))} /></div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="label">Service Area</label><select className="input" value={form.province} onChange={event => setForm(current => ({ ...current, province: event.target.value, municipality: '' }))}>{serviceAreas.map(area => <option key={area.id}>{area.province}</option>)}</select></div><div><label className="label">Municipality / City</label><select className="input" value={form.municipality} onChange={event => setForm(current => ({ ...current, municipality: event.target.value }))}><option value="">Select</option>{municipalities.map(item => <option key={item}>{item}</option>)}</select></div></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div><label className="label">Required Date</label><input type="date" className="input" value={form.requiredDate} onChange={event => setForm(current => ({ ...current, requiredDate: event.target.value }))} /></div><div><label className="label">Window End</label><input type="date" className="input" value={form.fulfillmentWindowEnd} onChange={event => setForm(current => ({ ...current, fulfillmentWindowEnd: event.target.value }))} /></div><div><label className="label">Offer Deadline</label><input type="date" className="input" value={form.expirationDate} onChange={event => setForm(current => ({ ...current, expirationDate: event.target.value }))} /></div></div>
        <div><label className="label">Quality / Product Specifications</label><textarea className="input resize-none" rows={3} value={form.qualitySpecs} onChange={event => setForm(current => ({ ...current, qualitySpecs: event.target.value }))} /></div>
        <div><label className="label">Procurement Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} /></div>
        <label className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4"><input type="checkbox" className="mt-1" checked={form.buyerSeriousnessDeclared} onChange={event => setForm(current => ({ ...current, buyerSeriousnessDeclared: event.target.checked }))} /><span className="text-sm text-green-900">I reaffirm that this is a genuine procurement requirement and I am authorized to source it.</span></label>
        <button onClick={saveRevision} className="btn-primary w-full justify-center"><Save size={16} /> Save Revision & Requalify</button>
      </div>
    </div>
  );
}
