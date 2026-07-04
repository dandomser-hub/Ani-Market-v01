import { Link } from 'react-router-dom';
import { ShoppingBag, Sprout, GitMerge, Shield, CheckCircle, ArrowRight, Info } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <ShoppingBag size={32} className="text-amber-600" />,
      title: '1. Buyer Posts Crop Demand',
      desc: 'A rice mill, food processor, cooperative buyer, or agri enterprise creates a demand post specifying the exact crop, variety, quantity, unit, target price, required date, quality specs, and location.',
      details: [
        'Choose from all Philippine agricultural crops',
        'Set target price per unit (not necessarily the final price)',
        'Specify delivery or pickup preference',
        'Set an expiration date for the demand post',
        'Demand posts are visible to all verified suppliers',
      ],
    },
    {
      icon: <Sprout size={32} className="text-green-600" />,
      title: '2. Suppliers Browse and Respond',
      desc: 'Individual farmers, cooperatives, organized suppliers, and aggregators in Mainland Bicol browse open demand posts and submit a response with their available quantity, price, and fulfillment timeline.',
      details: [
        'Filter demand by crop, province, quantity, and price',
        'View full demand specifications before responding',
        'Submit available quantity, offered price, and fulfillment date',
        'Confirm quality specs and delivery/pickup arrangements',
        'A supplier cannot respond to their own demand post',
      ],
    },
    {
      icon: <GitMerge size={32} className="text-leaf-600" />,
      title: '3. Matching and Transaction Commitment',
      desc: 'When a supplier response meets all buyer conditions, a match is recorded. In the Lean MVP, one buyer demand is matched to one supplier. The match creates a transaction commitment and workspace.',
      details: [
        'First-come-first-serve when all buyer conditions are met',
        'One demand matched to one supplier in MVP',
        'Match creates a transaction workspace for both parties',
        '3% seller-side platform fee computed at match stage',
        'Both buyer and supplier receive match confirmation',
      ],
    },
    {
      icon: <Shield size={32} className="text-blue-600" />,
      title: '4. Payment Reference and Completion',
      desc: 'The buyer and supplier coordinate payment directly. Proof of payment (bank transfer, GCash, Maya, QR code reference) is uploaded to the transaction workspace for recording purposes only.',
      details: [
        'Payment happens directly between buyer and supplier',
        'Upload payment reference number and screenshot',
        'Admin reviews and records payment evidence',
        'Ani Market does NOT process, hold, or release funds',
        'Transaction marked complete upon evidence acceptance',
      ],
    },
  ];

  return (
    <div className="bg-white">
      <div className="bg-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">How Ani Market Works</h1>
          <p className="text-green-200 text-lg max-w-2xl mx-auto">
            A demand-driven, transparent process from crop requirement to matched transaction — built for Mainland Bicol's agricultural trade.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="hidden sm:flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center flex-shrink-0">
                  {step.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px h-12 bg-gray-200 mt-3" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{step.desc}</p>
                <ul className="space-y-2">
                  {step.details.map(d => (
                    <li key={d} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-5 bg-amber-50 border border-amber-200 rounded-xl flex gap-4">
          <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 mb-1">Platform Scope Notice</p>
            <p className="text-sm text-amber-700">
              Ani Market is a marketplace facilitator only. It does not act as a buyer, seller, logistics provider, bank, payment processor, or escrow service. MVP scope is Mainland Bicol (Camarines Norte, Camarines Sur, Albay, Sorsogon). Commodity scope covers all crops in Philippine agriculture — excluding meat, seafood, fresh catch, and non-crop categories.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register?role=buyer" className="btn-primary text-base px-8 py-3 justify-center">
            Post Crop Demand <ArrowRight size={18} />
          </Link>
          <Link to="/register?role=supplier" className="btn-secondary text-base px-8 py-3 justify-center">
            Join as Supplier <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
