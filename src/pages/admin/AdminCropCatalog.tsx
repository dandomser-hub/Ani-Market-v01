import { useState } from 'react';
import { PlusCircle, Search, MapPin } from 'lucide-react';
import { CROP_CATEGORIES, UNITS } from '../../data/mockData';
import {
  getCropCatalog,
  getServiceAreas,
  saveCropCatalog,
  saveServiceAreas,
} from '../../data/gate1DemandData';
import type { CropCatalogItem } from '../../types';

const emptyForm = { name: '', category: 'Rice', variety: '', unit: 'kg', notes: '' };

export default function AdminCropCatalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [catalog, setCatalog] = useState(getCropCatalog());
  const [serviceAreas, setServiceAreas] = useState(getServiceAreas());

  const filtered = catalog.filter(crop => {
    const matchSearch = !search || crop.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || crop.category === category;
    return matchSearch && matchCat;
  });

  const persistCatalog = (next: CropCatalogItem[]) => {
    setCatalog(next);
    saveCropCatalog(next);
  };

  const addCrop = () => {
    if (!form.name.trim()) return;
    const item: CropCatalogItem = {
      id: `c-g1-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      variety: form.variety.trim(),
      unit: form.unit,
      active: true,
      notes: form.notes.trim(),
    };
    persistCatalog([...catalog, item]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const toggleCrop = (id: string) => {
    persistCatalog(catalog.map(crop => crop.id === id ? { ...crop, active: !crop.active } : crop));
  };

  const toggleServiceArea = (id: string) => {
    const next = serviceAreas.map(area => area.id === id ? { ...area, active: !area.active } : area);
    setServiceAreas(next);
    saveServiceAreas(next);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="page-header">
        <div><h1 className="text-2xl font-bold text-gray-900">Marketplace Catalog & Service Areas</h1><p className="text-sm text-gray-500 mt-1">These controls drive Demand qualification. Inactive commodities or service areas cannot become Open for Offers.</p></div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><PlusCircle size={16} /> Add Crop</button>
      </div>

      {showForm && (
        <div className="card border-green-200 bg-green-50">
          <h2 className="text-lg font-bold text-green-800 mb-4">Add Controlled Commodity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label className="label">Crop Name *</label><input className="input" placeholder="e.g., Palay (RC-216)" value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} /></div>
            <div><label className="label">Category *</label><select className="input" value={form.category} onChange={event => setForm(current => ({ ...current, category: event.target.value }))}>{CROP_CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></div>
            <div><label className="label">Variety</label><input className="input" value={form.variety} onChange={event => setForm(current => ({ ...current, variety: event.target.value }))} /></div>
            <div><label className="label">Default Unit</label><select className="input" value={form.unit} onChange={event => setForm(current => ({ ...current, unit: event.target.value }))}>{UNITS.map(unit => <option key={unit}>{unit}</option>)}</select></div>
          </div>
          <div className="mb-4"><label className="label">Notes</label><input className="input" value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} /></div>
          <div className="flex gap-3"><button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button><button onClick={addCrop} disabled={!form.name.trim()} className="btn-primary flex-1 justify-center disabled:opacity-50">Save Crop</button></div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4"><MapPin size={18} className="text-green-600" /><h2 className="section-title">Service Areas</h2></div>
        <p className="text-xs text-gray-500 mb-4">The initial MVP configuration is Mainland Bicol, but geography is controlled here rather than hard-coded into Demand eligibility.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {serviceAreas.map(area => (
            <div key={area.id} className={`rounded-xl border p-4 ${area.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between gap-3"><div><div className="font-semibold text-gray-900">{area.province}</div><div className="text-xs text-gray-500">{area.municipalities.length} configured municipalities/cities</div></div><button onClick={() => toggleServiceArea(area.id)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${area.active ? 'border-red-200 text-red-600 bg-white' : 'border-green-200 text-green-700 bg-white'}`}>{area.active ? 'Disable' : 'Enable'}</button></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="input pl-9" placeholder="Search crops..." value={search} onChange={event => setSearch(event.target.value)} /></div>
        <select className="input w-44" value={category} onChange={event => setCategory(event.target.value)}><option value="">All Categories</option>{CROP_CATEGORIES.map(item => <option key={item}>{item}</option>)}</select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200">{['Crop Name', 'Category', 'Variety', 'Unit', 'Qualification Status', 'Notes', ''].map(header => <th key={header} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold">{header}</th>)}</tr></thead>
          <tbody>
            {filtered.map(crop => (
              <tr key={crop.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-2 font-medium text-gray-900">{crop.name}</td>
                <td className="py-3 px-2"><span className="badge bg-green-100 text-green-700 text-xs">{crop.category}</span></td>
                <td className="py-3 px-2 text-gray-600 text-xs">{crop.variety || '—'}</td>
                <td className="py-3 px-2 text-gray-600 text-xs">{crop.unit}</td>
                <td className="py-3 px-2"><span className={`badge text-xs ${crop.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{crop.active ? 'Enabled' : 'Disabled'}</span></td>
                <td className="py-3 px-2 text-gray-400 text-xs max-w-[200px] truncate">{crop.notes || '—'}</td>
                <td className="py-3 px-2"><button onClick={() => toggleCrop(crop.id)} className={`text-xs hover:underline ${crop.active ? 'text-red-500' : 'text-green-600'}`}>{crop.active ? 'Deactivate' : 'Activate'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
