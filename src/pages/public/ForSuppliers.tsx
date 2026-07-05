import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, DollarSign, MapPin, Users, Sprout, Building2, PackagePlus } from 'lucide-react';

export default function ForSuppliers() {
  const supplierTypes = [
    { label: 'Individual Farmer', icon: <Sprout size={20} className="text-white" />, desc: 'Sell your harvest directly to verified business buyers — no middlemen required.' },
    { label: 'Farmers Cooperative', icon: <Users size={20} className="text-white" />, desc: 'Pool member produce and respond to larger demand volumes as an organized group.' },
    { label: 'Organized Supplier', icon: <Building2 size={20} className="text-white" />, desc: 'Structured supply groups that can reliably fulfill buyer specifications.' },
    { label: 'Crop Aggregator', icon: <PackagePlus size={20} className="text-white" />, desc: 'Aggregate supply from multiple farms and respond to bulk demand requests.' },
  ];

  const benefits = [
    { icon: <DollarSign size={22} className="text-amber-600" />, title: 'Respond to Real Demand', desc: 'See exactly what buyers need and at what price before deciding to respond.' },
    { icon: <MapPin size={22} className="text-green-600" />, title: 'Local Market Focus', desc: 'Demand posts from Mainland Bicol buyers — keeping trade local and accessible.' },
    { icon: <Users size={22} className="text-blue-600" />, title: 'All Supplier Types Welcome', desc: 'Individual farmers, cooperatives, organized groups, and aggregators can all register.' },
    { icon: <Sprout size={22} className="text-leaf-600" />, title: '3% Platform Fee at Match', desc: 'Seller-side fee is 3% of matched transaction — only triggered when you earn.' },
  ];

  return (
    <div className="bg-white">
      <div className="bg-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">For Farmers & Suppliers</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Browse real buyer demand. Respond with your available crop. Get matched and earn — with a transparent, fair marketplace built for Bicol agriculture.
          </p>
          <Link to="/register?role=supplier" className="btn-amber mt-8 text-base px-8 py-3 inline-flex">
            Join as Supplier <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Who Can Join as Supplier?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {supplierTypes.map(s => (
            <div key={s.label} className="bg-green-50 rounded-xl p-5 border border-green-200 text-center">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                {s.icon}
              </div>
              <h3 className="font-semibold text-green-900 mb-2">{s.label}</h3>
              <p className="text-xs text-green-700 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {benefits.map(b => (
            <div key={b.title} className="flex gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center flex-shrink-0">
                {b.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <h3 className="font-bold text-amber-800 text-lg mb-4">Platform Fee — How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Fee Side', value: 'Seller (Supplier)' },
              { label: 'Default Rate', value: '3%' },
              { label: 'Fee Trigger', value: 'At Matched Stage' },
            ].map(row => (
              <div key={row.label} className="bg-white rounded-lg p-4 border border-amber-200 text-center">
                <div className="text-xs text-amber-600 mb-1">{row.label}</div>
                <div className="font-bold text-amber-900">{row.value}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-amber-700">
            <strong>Principle:</strong> The party who earns pays the platform. Ani Market does not collect payment from buyers. The 3% fee applies on the supplier side only, computed at the Matched stage. Actual fee collection process is separate from the platform.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['No upfront fee', 'Fee computed at match', 'Platform earns only when you earn'].map(p => (
              <span key={p} className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
                <CheckCircle size={12} />
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
