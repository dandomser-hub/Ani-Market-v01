import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Sprout, ShoppingBag, GitMerge, Shield,
  MapPin, BadgePercent, Users, Leaf,
} from 'lucide-react';
import {
  CONVENIENCE_FEE_UPDATED_EVENT,
  formatConvenienceFeeRate,
  getConvenienceFeeRate,
} from '../../config/convenienceFee';

const howItWorks = [
  {
    step: 1,
    icon: <ShoppingBag size={28} className="text-amber-600" />,
    title: 'Buyers Post Crop Demand',
    desc: 'Businesses, rice mills, food processors, and institutional buyers post exactly what crop they need — quantity, quality, location, price target, and timeline.',
  },
  {
    step: 2,
    icon: <Sprout size={28} className="text-green-600" />,
    title: 'Farmers & Suppliers Respond',
    desc: 'Individual farmers, cooperatives, and organized suppliers browse real buyer demand and submit responses with their available crop, price, and fulfillment details.',
  },
  {
    step: 3,
    icon: <GitMerge size={28} className="text-leaf-600" />,
    title: 'Matching is Recorded',
    desc: 'When a supplier meets all buyer conditions, a match is recorded. One demand is matched to one supplier in the MVP — clean and transparent.',
  },
  {
    step: 4,
    icon: <Shield size={28} className="text-blue-600" />,
    title: 'Payment Reference Recorded',
    desc: 'Proof-of-payment is uploaded for evidence only. Ani Market does not process, hold, or release funds. Payments happen directly between parties.',
  },
];

const crops = [
  'Palay', 'Corn', 'Coconut', 'Abaca', 'Pili Nut', 'Cassava',
  'Banana', 'Cacao', 'Coffee', 'Sweet Potato', 'Tomato', 'Eggplant',
  'Pineapple', 'Ginger', 'Mongo', '+ All Philippine Crops',
];

export default function LandingPage() {
  const [convenienceFeeRate, setConvenienceFeeRate] = useState(getConvenienceFeeRate);
  const feeLabel = formatConvenienceFeeRate(convenienceFeeRate);

  useEffect(() => {
    const syncFee = () => setConvenienceFeeRate(getConvenienceFeeRate());

    window.addEventListener('storage', syncFee);
    window.addEventListener(CONVENIENCE_FEE_UPDATED_EVENT, syncFee);

    return () => {
      window.removeEventListener('storage', syncFee);
      window.removeEventListener(CONVENIENCE_FEE_UPDATED_EVENT, syncFee);
    };
  }, []);

  const stats = useMemo(() => [
    { value: '4', label: 'Mainland Bicol Provinces', icon: <MapPin size={20} className="text-green-600" /> },
    { value: '100+', label: 'Crop Varieties Supported', icon: <Leaf size={20} className="text-leaf-600" /> },
    { value: 'Low', label: 'Convenience Fee', icon: <BadgePercent size={20} className="text-amber-600" /> },
    { value: '0', label: 'Funds Held by Platform', icon: <Shield size={20} className="text-blue-600" /> },
  ], []);

  return (
    <div className="bg-white">
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-leaf-400 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-400 rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium text-green-100 mb-6 border border-white/20">
              <MapPin size={14} />
              <span>MVP Scope: Mainland Bicol</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Where Crop Demand<br />
              <span className="text-leaf-300">Meets the Farm</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl leading-relaxed">
              Ani Market is a demand-driven agricultural marketplace for Mainland Bicol. Buyers post what they need. Farmers respond with what they have. Matching happens — transparently.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register?role=buyer" className="btn-amber text-base px-6 py-3">
                Post Crop Demand <ArrowRight size={18} />
              </Link>
              <Link to="/register?role=supplier" className="bg-white/15 backdrop-blur border border-white/30 text-white inline-flex items-center gap-2 text-base px-6 py-3 rounded-lg hover:bg-white/25 transition-colors font-medium">
                Join as Farmer / Supplier <ArrowRight size={18} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-5">
              {['Demand-Driven', 'Farm-to-Business', 'B2B Crop Trade', 'All Philippine Crops'].map(tag => (
                <div key={tag} className="flex items-center gap-1.5 text-sm text-green-200">
                  <CheckCircle size={14} className="text-leaf-400" />
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                  {s.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">Simple Process</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">How Ani Market Works</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            A straightforward, transparent four-step process from demand to matched transaction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((step) => (
            <div key={step.step} className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4 text-4xl font-black text-gray-50">{step.step}</div>
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">{step.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/how-it-works" className="btn-secondary">
            Learn More About the Process <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="bg-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">All Philippine Agricultural Crops</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              From staple grains to specialty crops — Ani Market supports the full breadth of Bicol's agricultural output.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {crops.map(crop => (
              <span key={crop} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-green-700 border border-green-200 shadow-sm">
                {crop}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Payment Transparency</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">No Funds Held. Ever.</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Ani Market is a marketplace facilitator — not a bank, payment processor, or escrow service. Payments happen directly between buyers and suppliers.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Upload bank transfer or GCash/Maya reference',
                'Proof-of-payment recorded for evidence only',
                'Admin verifies payment reference records',
                'Ani Market never touches transaction funds',
                `${feeLabel} convenience fee applies based on the current platform setting`,
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-5">
              <Shield size={24} className="text-amber-600" />
              <span className="font-semibold text-amber-800">Platform Payment Policy</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Direct Fund Processing', value: 'Not done by platform' },
                { label: 'Escrow Service', value: 'Not provided' },
                { label: 'Payment Gateway', value: 'Not integrated' },
                { label: 'Payment Evidence', value: 'Recorded for reference only' },
                { label: 'Accepted References', value: 'Bank, GCash, Maya, QR Code' },
                { label: 'Convenience Fee', value: `${feeLabel} current setting` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-amber-200 last:border-0">
                  <span className="text-sm text-amber-700">{row.label}</span>
                  <span className="text-sm font-medium text-amber-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Users size={40} className="text-leaf-300 mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-white mb-4">Join Ani Market Today</h2>
          <p className="text-green-200 mb-8 max-w-lg mx-auto">
            Whether you're a buyer looking for reliable crop supply, or a farmer ready to respond to real demand — Ani Market is built for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=buyer" className="btn-amber text-base px-8 py-3">I'm a Buyer / Business</Link>
            <Link to="/register?role=supplier" className="bg-white/15 border border-white/30 text-white inline-flex items-center justify-center gap-2 text-base px-8 py-3 rounded-lg hover:bg-white/25 transition-colors font-medium">
              I'm a Farmer / Supplier
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
