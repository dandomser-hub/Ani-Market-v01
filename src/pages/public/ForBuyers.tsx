import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, FileText, Search, GitMerge, UploadCloud, ShieldCheck } from 'lucide-react';

export default function ForBuyers() {
  const benefits = [
    { icon: <FileText size={24} className="text-green-600" />, title: 'Post Your Exact Requirement', desc: 'Define crop, variety, quantity, target price, quality specs, and timeline. Suppliers respond to YOUR need.' },
    { icon: <Search size={24} className="text-blue-600" />, title: 'Verified Supplier Pool', desc: 'Browse responses from verified farmers, cooperatives, and organized suppliers in Mainland Bicol.' },
    { icon: <GitMerge size={24} className="text-amber-600" />, title: 'Clean One-to-One Matching', desc: 'MVP uses one demand matched to one supplier — no partial fulfillment confusion in this phase.' },
    { icon: <UploadCloud size={24} className="text-teal-600" />, title: 'Transparent Payment Recording', desc: 'Payment reference numbers and proof uploaded for evidence. No hidden fund processing.' },
    { icon: <ShieldCheck size={24} className="text-purple-600" />, title: 'Admin Support', desc: 'Platform admin available for disputes, cancellations, and exceptional cases.' },
  ];

  const buyerTypes = [
    'Rice Mills & Grain Processors', 'Food Manufacturing Companies',
    'Restaurant & Food Service Suppliers', 'Institutional Buyers (Schools, Hospitals)',
    'Trading Businesses', 'Cooperative Buyers', 'Agri Enterprises',
  ];

  return (
    <div className="bg-white">
      <div className="bg-amber-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">For Buyers</h1>
          <p className="text-amber-100 text-lg max-w-2xl mx-auto">
            Post your crop demand and let verified Bicol farmers and suppliers come to you — with the exact crop, quantity, and quality you need.
          </p>
          <Link to="/register?role=buyer" className="btn-primary mt-8 text-base px-8 py-3 inline-flex">
            Register as Buyer <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Buyers Use Ani Market</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(b => (
            <div key={b.title} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="w-11 h-11 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center mb-4">
                {b.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Who Can Register as Buyer?</h2>
            <ul className="space-y-2">
              {buyerTypes.map(t => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
            <h3 className="font-bold text-green-800 mb-4">Demand Post Requirements</h3>
            <ul className="space-y-2.5 text-sm text-green-700">
              {[
                'Crop name and category', 'Variety (if applicable)',
                'Required quantity and unit', 'Target price per unit',
                'Delivery or pickup preference', 'Required date and expiration date',
                'Location (Mainland Bicol only)', 'Quality / specification notes',
              ].map(r => (
                <li key={r} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
            <Link to="/register?role=buyer" className="btn-primary w-full justify-center mt-6">
              Create Buyer Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
