import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Sprout, ShoppingBag, GitMerge, Shield,
  MapPin, BadgePercent, Users, Leaf,
} from 'lucide-react';
const howItWorks = [
  {
    step: 1,
    icon: <ShoppingBag size={28} className="text-brand-primary" />,
    title: 'Buyers Post Crop Demand',
    desc: 'Businesses, rice mills, food processors, and institutional buyers post exactly what crop they need — quantity, quality, location, price target, and timeline.',
  },
  {
    step: 2,
    icon: <Sprout size={28} className="text-brand-primary" />,
    title: 'Farmers & Suppliers Respond',
    desc: 'Individual farmers, cooperatives, and organized suppliers browse real buyer demand and submit responses with their available crop, price, and fulfillment details.',
  },
  {
    step: 3,
    icon: <GitMerge size={28} className="text-brand-primary" />,
    title: 'Matching is Recorded',
    desc: 'When a supplier meets all buyer conditions, a match is recorded. One demand is matched to fulfillment — clean and transparent.',
  },
  {
    step: 4,
    icon: <Shield size={28} className="text-brand-primary" />,
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
  const stats = useMemo(() => [
    { value: '4', label: 'Mainland Bicol Provinces', icon: <MapPin size={20} className="text-brand-primary" /> },
    { value: '100+', label: 'Crop Varieties Supported', icon: <Leaf size={20} className="text-brand-primary" /> },
    { value: 'Low', label: 'Convenience Fee', icon: <BadgePercent size={20} className="text-brand-primary" /> },
  ], []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-primaryDark via-green-800 to-brand-primary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-primaryLight rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Where Crop Demand<br />
              <span className="text-green-200">Meets the Farm</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl leading-relaxed">
              Ani Market is a demand-driven agricultural marketplace for Mainland Bicol. Buyers post what they need. Farmers respond with what they have. Matching happens — transparently.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              <Link to="/register?role=supplier" className="bg-brand-primary text-brand-ink border border-white/30 inline-flex items-center justify-center gap-2 w-full text-base px-6 py-3 rounded-lg hover:bg-brand-primaryLight transition-colors font-semibold">
                Join as Farmer / Supplier <ArrowRight size={18} />
              </Link>
              <Link to="/register?role=buyer" className="btn-amber justify-center w-full text-base px-6 py-3">
                Post Crop Demand <ArrowRight size={18} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-5">
              {['Demand-Driven', 'Farm-to-Business', 'B2B Crop Trade', 'All Philippine Crops'].map(tag => (
                <div key={tag} className="flex items-center gap-1.5 text-sm text-green-200">
                  <CheckCircle size={14} className="text-white" />
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

      {/* CTA */}
      <section className="bg-brand-primaryDark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Users size={40} className="text-green-200 mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-white mb-4">Join Ani Market Today</h2>
          <p className="text-green-200 mb-8 max-w-lg mx-auto">
            Whether you're a buyer looking for reliable crop supply, or a farmer ready to respond to real demand — Ani Market is built for you.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link to="/register?role=supplier" className="bg-brand-primary text-brand-ink border border-white/30 inline-flex items-center justify-center gap-2 w-full text-base px-8 py-3 rounded-lg hover:bg-brand-primaryLight transition-colors font-semibold">
              I'm a Farmer / Supplier
            </Link>
            <Link to="/register?role=buyer" className="btn-amber justify-center w-full text-base px-8 py-3">
              I'm a Buyer / Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
