import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Send, Info, Truck, MapPin } from 'lucide-react';
import { CROP_CATEGORIES, CROPS_BY_CATEGORY, UNITS, PROVINCES, MUNICIPALITIES } from '../../data/mockData';

type DeliveryPreference = 'Delivery' | 'Pickup';

export default function NewDemand() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cropCategory: 'Rice',
    cropName: '',
    variety: '',
    quantity: '',
    unit: 'sack (50kg)',
    targetPrice: '',
    deliveryPreference: '' as DeliveryPreference | '',
    province: 'Camarines Sur',
    municipality: '',
    requiredDate: '',
    expirationDate: '',
    qualitySpecs: '',
    notes: '',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const canPost =
    form.cropName !== '' &&
    form.quantity.trim() !== '' &&
    form.targetPrice.trim() !== '' &&
    form.deliveryPreference !== '' &&
    form.municipality !== '' &&
    form.requiredDate !== '' &&
    form.expirationDate !== '';

  const crops = CROPS_BY_CATEGORY[form.cropCategory] ?? [];
  const municipalities = MUNICIPALITIES[form.province] ?? [];

  const handleSave = (publish: boolean) => {
    if (publish && !canPost) return;

    alert(publish ? 'Demand posted successfully! (Demo)' : 'Draft saved. (Demo)');
    navigate('/buyer/demands');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Post New Demand</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          This demand will be visible to all verified suppliers in Mainland Bicol. One demand is matched to one supplier in the MVP (first-come-first-serve when all conditions are met).
        </p>
      </div>

      <div className="card space-y-5">
        <h2 className="section-title border-b border-gray-100 pb-3">Crop Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Crop Category *</label>
            <select className="input" value={form.cropCategory} onChange={e => { update('cropCategory', e.target.value); update('cropName', ''); }}>
              {CROP_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Crop Name *</label>
            <select className="input" value={form.cropName} onChange={e => update('cropName', e.target.value)} required>
              <option value="">Select crop</option>
              {crops.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Variety / Specification</label>
          <input className="input" placeholder="e.g., RC-216, Grade A, Latundan" value={form.variety} onChange={e => update('variety', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Required Quantity *</label>
            <input type="number" className="input" placeholder="e.g., 500" value={form.quantity} onChange={e => update('quantity', e.target.value)} required />
          </div>
          <div>
            <label className="label">Unit *</label>
            <select className="input" value={form.unit} onChange={e => update('unit', e.target.value)}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Target Price (per unit, in PHP) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
            <input type="number" className="input pl-7" placeholder="e.g., 1100" value={form.targetPrice} onChange={e => update('targetPrice', e.target.value)} required />
          </div>
          <p className="text-xs text-gray-400 mt-1">This is a target price. Suppliers may offer counter-prices in their responses.</p>
        </div>

        <h2 className="section-title border-b border-gray-100 pb-3 pt-2">Delivery & Location</h2>

        <fieldset>
          <legend className="label">Delivery Preference *</legend>
          <p className="text-xs text-gray-500 mb-3">
            Select exactly one fulfillment arrangement for this demand.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              {
                value: 'Delivery' as const,
                title: 'Delivery',
                description: 'The supplier delivers the crops to the buyer-designated location.',
                icon: <Truck size={20} />,
              },
              {
                value: 'Pickup' as const,
                title: 'Pickup',
                description: 'The buyer arranges pickup from the supplier-designated location.',
                icon: <MapPin size={20} />,
              },
            ]).map(option => {
              const selected = form.deliveryPreference === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => update('deliveryPreference', option.value)}
                  className={`relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                    selected
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                  }`}
                >
                  <span className={`mt-0.5 ${selected ? 'text-green-600' : 'text-gray-400'}`}>
                    {option.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{option.title}</span>
                    <span className="block text-xs mt-1 text-gray-500 leading-relaxed">
                      {option.description}
                    </span>
                  </span>
                  <span
                    className={`absolute top-4 right-4 h-4 w-4 rounded-full border-2 ${
                      selected ? 'border-green-600 bg-green-600 ring-2 ring-green-100' : 'border-gray-300 bg-white'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          {form.deliveryPreference === '' && (
            <p className="text-xs text-amber-600 mt-2">
              Delivery Preference is required before the demand can be posted.
            </p>
          )}
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Province *</label>
            <select className="input" value={form.province} onChange={e => { update('province', e.target.value); update('municipality', ''); }}>
              {PROVINCES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Municipality / City *</label>
            <select className="input" value={form.municipality} onChange={e => update('municipality', e.target.value)}>
              <option value="">Select municipality</option>
              {municipalities.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Required Date *</label>
            <input type="date" className="input" value={form.requiredDate} onChange={e => update('requiredDate', e.target.value)} required />
          </div>
          <div>
            <label className="label">Demand Expiration Date *</label>
            <input type="date" className="input" value={form.expirationDate} onChange={e => update('expirationDate', e.target.value)} required />
            <p className="text-xs text-gray-400 mt-1">After this date, the demand post auto-expires if unmatched.</p>
          </div>
        </div>

        <h2 className="section-title border-b border-gray-100 pb-3 pt-2">Quality & Notes</h2>

        <div>
          <label className="label">Quality Specifications</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="e.g., Moisture content max 14%, clean, no foreign matter, freshly harvested..."
            value={form.qualitySpecs}
            onChange={e => update('qualitySpecs', e.target.value)}
          />
        </div>

        <div>
          <label className="label">Additional Notes</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Any other requirements or instructions for suppliers..."
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button onClick={() => handleSave(false)} className="btn-secondary flex-1 justify-center">
            <Save size={16} /> Save as Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={!canPost}
            className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} /> Post Demand
          </button>
        </div>
      </div>
    </div>
  );
}
