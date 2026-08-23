import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Send, Info, Truck, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { UNITS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import TransactionAccessNotice from '../../components/TransactionAccessNotice';
import {
  createDemandId,
  getCropCatalog,
  getServiceAreas,
  qualifyDemand,
  representativeTargetPrice,
  saveDemandEvent,
  saveGate1Demand,
} from '../../data/gate1DemandData';
import type { DemandPost, DemandQualificationResult, TargetPriceProfile, TargetPriceType } from '../../types';

type DeliveryPreference = 'Delivery' | 'Pickup';

export default function NewDemand() {
  const navigate = useNavigate();
  const { canTransact, currentUser } = useApp();
  const catalog = getCropCatalog().filter(item => item.active);
  const serviceAreas = getServiceAreas().filter(item => item.active);
  const categories = Array.from(new Set(catalog.map(item => item.category))).sort();

  const [form, setForm] = useState({
    cropCategory: categories[0] ?? '',
    cropName: '',
    variety: '',
    quantity: '',
    unit: 'kg',
    minimumSupplierQuantity: '',
    targetPriceType: 'Approximate' as TargetPriceType,
    targetPrice: '',
    targetPriceMin: '',
    targetPriceMax: '',
    deliveryPreference: '' as DeliveryPreference | '',
    province: serviceAreas[0]?.province ?? '',
    municipality: '',
    requiredDate: '',
    fulfillmentWindowEnd: '',
    expirationDate: '',
    qualitySpecs: '',
    notes: '',
    buyerSeriousnessDeclared: false,
  });
  const [qualification, setQualification] = useState<DemandQualificationResult | null>(null);

  const update = (key: string, value: string | boolean) => {
    setQualification(null);
    setForm(current => ({ ...current, [key]: value }));
  };

  const crops = catalog.filter(item => item.category === form.cropCategory);
  const selectedCrop = catalog.find(item => item.name === form.cropName);
  const selectedArea = serviceAreas.find(item => item.province === form.province);
  const municipalities = selectedArea?.municipalities ?? [];

  const buildTargetPrice = (): TargetPriceProfile => form.targetPriceType === 'Range'
    ? {
        type: 'Range',
        currency: 'PHP',
        minimumPrice: Number(form.targetPriceMin),
        maximumPrice: Number(form.targetPriceMax),
      }
    : {
        type: form.targetPriceType,
        currency: 'PHP',
        unitPrice: Number(form.targetPrice),
      };

  const buildDemand = (id: string): DemandPost => {
    const targetPriceProfile = buildTargetPrice();
    const now = new Date().toISOString();
    return {
      id,
      buyerId: currentUser?.id ?? 'prototype-buyer',
      buyerName: currentUser?.name ?? 'Prototype Buyer',
      buyerType: currentUser?.buyerProfile?.businessType ?? 'Buyer / Business',
      cropName: form.cropName,
      cropCategory: form.cropCategory,
      variety: form.variety || selectedCrop?.variety || '',
      quantity: Number(form.quantity),
      unit: form.unit,
      targetPrice: representativeTargetPrice(targetPriceProfile),
      targetPriceProfile,
      minimumSupplierQuantity: form.minimumSupplierQuantity ? Number(form.minimumSupplierQuantity) : undefined,
      deliveryPreference: form.deliveryPreference || 'Delivery',
      location: `${form.municipality}, ${form.province}`,
      province: form.province,
      municipality: form.municipality,
      serviceAreaId: selectedArea?.id,
      requiredDate: form.requiredDate,
      fulfillmentWindowEnd: form.fulfillmentWindowEnd || undefined,
      expirationDate: form.expirationDate,
      qualitySpecs: form.qualitySpecs,
      notes: form.notes,
      buyerSeriousnessDeclared: form.buyerSeriousnessDeclared,
      status: 'Draft',
      createdAt: now,
      updatedAt: now,
      responseCount: 0,
    };
  };

  const handleSaveDraft = () => {
    const demand = buildDemand(createDemandId());
    saveGate1Demand(demand);
    saveDemandEvent({
      id: `de-${Date.now()}`,
      demandId: demand.id,
      eventType: 'Draft Saved',
      actorId: demand.buyerId,
      actorRole: 'buyer',
      createdAt: new Date().toISOString(),
    });
    navigate('/buyer/demands');
  };

  const handleSubmit = () => {
    const demand = buildDemand(createDemandId());
    const result = qualifyDemand({ ...demand, status: 'Submitted for Qualification' }, { buyerTransactionEnabled: canTransact });
    setQualification(result);

    const nextDemand: DemandPost = {
      ...demand,
      qualification: result,
      status: result.status === 'Qualified' ? 'Open for Offers' : 'Needs Correction',
      updatedAt: new Date().toISOString(),
    };
    saveGate1Demand(nextDemand);
    saveDemandEvent({
      id: `de-${Date.now()}-submitted`,
      demandId: nextDemand.id,
      eventType: 'Submitted',
      actorId: nextDemand.buyerId,
      actorRole: 'buyer',
      createdAt: new Date().toISOString(),
    });
    saveDemandEvent({
      id: `de-${Date.now()}-result`,
      demandId: nextDemand.id,
      eventType: result.status === 'Qualified' ? 'Qualified' : 'Needs Correction',
      actorId: 'system',
      actorRole: 'admin',
      createdAt: new Date().toISOString(),
    });

    if (result.status === 'Qualified') {
      navigate('/buyer/demands');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="page-header"><h1 className="text-2xl font-bold text-gray-900">Create Qualified Demand</h1></div>

      {!canTransact && <TransactionAccessNotice role="buyer" />}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Saving a draft never publishes it. When you submit, Ani Market checks buyer eligibility, commodity, quantity, target-price structure, service area, fulfillment dates, offer deadline, and your procurement declaration. Only a qualified Demand becomes <strong>Open for Offers</strong>.
        </p>
      </div>

      {qualification && qualification.status === 'Needs Correction' && (
        <div className="card border-amber-300 bg-amber-50">
          <div className="flex items-center gap-2 mb-3"><AlertCircle size={18} className="text-amber-600" /><h2 className="font-bold text-amber-900">Demand needs correction</h2></div>
          <div className="space-y-2">
            {qualification.checks.map(check => (
              <div key={check.key} className="flex items-start gap-2 text-sm">
                {check.passed ? <CheckCircle size={16} className="text-green-600 mt-0.5" /> : <AlertCircle size={16} className="text-amber-600 mt-0.5" />}
                <div><div className={check.passed ? 'text-green-800' : 'text-amber-900'}>{check.label}</div>{check.message && <div className="text-xs text-amber-700">{check.message}</div>}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card space-y-5">
        <h2 className="section-title border-b border-gray-100 pb-3">Commodity & Quantity</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Crop Category *</label>
            <select className="input" value={form.cropCategory} onChange={event => { update('cropCategory', event.target.value); setForm(current => ({ ...current, cropCategory: event.target.value, cropName: '' })); }}>
              {categories.map(category => <option key={category}>{category}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Enabled Commodity *</label>
            <select className="input" value={form.cropName} onChange={event => {
              const crop = catalog.find(item => item.name === event.target.value);
              setQualification(null);
              setForm(current => ({ ...current, cropName: event.target.value, unit: crop?.unit ?? current.unit, variety: crop?.variety ?? current.variety }));
            }}>
              <option value="">Select commodity</option>
              {crops.map(crop => <option key={crop.id} value={crop.name}>{crop.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Variety / Structured Specification</label>
          <input className="input" placeholder="e.g., RC-216, Grade A, Latundan" value={form.variety} onChange={event => update('variety', event.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Requested Quantity *</label>
            <input type="number" min="0" className="input" value={form.quantity} onChange={event => update('quantity', event.target.value)} />
          </div>
          <div>
            <label className="label">Unit *</label>
            <select className="input" value={form.unit} onChange={event => update('unit', event.target.value)}>{UNITS.map(unit => <option key={unit}>{unit}</option>)}</select>
          </div>
          <div>
            <label className="label">Minimum per Supplier</label>
            <input type="number" min="0" className="input" placeholder="Optional" value={form.minimumSupplierQuantity} onChange={event => update('minimumSupplierQuantity', event.target.value)} />
          </div>
        </div>

        <h2 className="section-title border-b border-gray-100 pb-3 pt-2">Buyer Target Price</h2>
        <div className="grid grid-cols-3 gap-2">
          {(['Approximate', 'Average', 'Range'] as TargetPriceType[]).map(type => (
            <button key={type} type="button" onClick={() => update('targetPriceType', type)} className={`rounded-lg border px-3 py-2 text-sm font-medium ${form.targetPriceType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>{type}</button>
          ))}
        </div>
        {form.targetPriceType === 'Range' ? (
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Minimum Target (₱/{form.unit}) *</label><input type="number" min="0" className="input" value={form.targetPriceMin} onChange={event => update('targetPriceMin', event.target.value)} /></div>
            <div><label className="label">Maximum Target (₱/{form.unit}) *</label><input type="number" min="0" className="input" value={form.targetPriceMax} onChange={event => update('targetPriceMax', event.target.value)} /></div>
          </div>
        ) : (
          <div><label className="label">{form.targetPriceType} Target (₱/{form.unit}) *</label><input type="number" min="0" className="input" value={form.targetPrice} onChange={event => update('targetPrice', event.target.value)} /></div>
        )}
        <p className="text-xs text-gray-500">This is guidance for a lightweight RFQ. Suppliers remain free to submit their own Offered Price.</p>

        <h2 className="section-title border-b border-gray-100 pb-3 pt-2">Fulfillment & Service Area</h2>
        <fieldset>
          <legend className="label">Fulfillment Arrangement *</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {([
              { value: 'Delivery' as const, title: 'Delivery', description: 'Supplier delivers to the buyer-designated location.', icon: <Truck size={20} /> },
              { value: 'Pickup' as const, title: 'Pickup', description: 'Buyer arranges pickup from the supplier-designated location.', icon: <MapPin size={20} /> },
            ]).map(option => (
              <button key={option.value} type="button" onClick={() => update('deliveryPreference', option.value)} className={`rounded-xl border-2 p-4 text-left flex gap-3 ${form.deliveryPreference === option.value ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <span className={form.deliveryPreference === option.value ? 'text-green-600' : 'text-gray-400'}>{option.icon}</span><span><span className="block font-semibold text-sm">{option.title}</span><span className="block text-xs text-gray-500 mt-1">{option.description}</span></span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Enabled Service Area *</label><select className="input" value={form.province} onChange={event => { setQualification(null); setForm(current => ({ ...current, province: event.target.value, municipality: '' })); }}>{serviceAreas.map(area => <option key={area.id}>{area.province}</option>)}</select></div>
          <div><label className="label">Municipality / City *</label><select className="input" value={form.municipality} onChange={event => update('municipality', event.target.value)}><option value="">Select municipality</option>{municipalities.map(municipality => <option key={municipality}>{municipality}</option>)}</select></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="label">Required Date *</label><input type="date" className="input" value={form.requiredDate} onChange={event => update('requiredDate', event.target.value)} /></div>
          <div><label className="label">Window End</label><input type="date" className="input" value={form.fulfillmentWindowEnd} onChange={event => update('fulfillmentWindowEnd', event.target.value)} /></div>
          <div><label className="label">Offer Deadline *</label><input type="date" className="input" value={form.expirationDate} onChange={event => update('expirationDate', event.target.value)} /></div>
        </div>

        <h2 className="section-title border-b border-gray-100 pb-3 pt-2">Specifications & Declaration</h2>
        <div><label className="label">Quality / Product Specifications</label><textarea className="input resize-none" rows={3} value={form.qualitySpecs} onChange={event => update('qualitySpecs', event.target.value)} placeholder="Moisture, grade, size, handling or other material requirements..." /></div>
        <div><label className="label">Additional Procurement Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={event => update('notes', event.target.value)} /></div>

        <label className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <input type="checkbox" className="mt-1" checked={form.buyerSeriousnessDeclared} onChange={event => update('buyerSeriousnessDeclared', event.target.checked)} />
          <span className="text-sm text-green-900"><strong>Buyer seriousness declaration.</strong> I am authorized to source this requirement and am posting a genuine procurement need. I understand that Supplier Offers may differ from my target price and that no Supplier is automatically selected.</span>
        </label>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button onClick={handleSaveDraft} className="btn-secondary flex-1 justify-center"><Save size={16} /> Save Draft</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center"><Send size={16} /> Submit for Qualification</button>
        </div>
      </div>
    </div>
  );
}
