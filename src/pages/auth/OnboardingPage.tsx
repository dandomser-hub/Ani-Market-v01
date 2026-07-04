import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Logo from '../../components/Logo';
import { CROP_CATEGORIES, PROVINCES } from '../../data/mockData';

export default function OnboardingPage() {
  const { currentUser, currentRole } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const totalSteps = 3;

  const handleFinish = () => {
    if (currentRole === 'buyer') navigate('/buyer/dashboard');
    else if (currentRole === 'supplier') navigate('/supplier/dashboard');
    else navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  i + 1 < step ? 'bg-green-600 text-white' :
                  i + 1 === step ? 'bg-green-600 text-white ring-4 ring-green-100' :
                  'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1 < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              {i < totalSteps - 1 && <div className={`w-12 h-0.5 ${i + 1 < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome to Ani Market</h2>
              <p className="text-gray-500 text-sm mb-6">
                Let's complete your profile so buyers and suppliers can find you.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm font-medium text-green-800">Your Role</p>
                  <p className="text-2xl font-bold text-green-700 capitalize mt-1">
                    {currentRole === 'supplier' ? 'Farmer / Supplier' : currentRole === 'buyer' ? 'Buyer / Business' : 'Admin'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Account Name</p>
                  <p className="font-semibold text-gray-900 mt-1">{currentUser?.name ?? 'New User'}</p>
                </div>
                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  MVP scope is Mainland Bicol (Camarines Norte, Camarines Sur, Albay, Sorsogon). Transactions are limited to this geography.
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Location & Crops</h2>
              <p className="text-gray-500 text-sm mb-6">Help us show you the right demand and suppliers.</p>
              <div className="space-y-4">
                <div>
                  <label className="label">Province</label>
                  <select className="input">
                    {PROVINCES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Crop Interests (select all that apply)</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CROP_CATEGORIES.map(cat => (
                      <button key={cat} type="button" className="px-3 py-1.5 rounded-full text-xs font-medium border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Preferred Transaction Area</label>
                  <input className="input" placeholder="e.g., Naga City and nearby municipalities" defaultValue="" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Verification Documents</h2>
              <p className="text-gray-500 text-sm mb-6">Upload supporting documents for account verification.</p>
              <div className="space-y-4">
                {[
                  { label: 'Government-Issued ID', hint: 'PhilSys, UMID, Driver\'s License, Passport' },
                  { label: currentRole === 'supplier' ? 'Farm or Organization Registration' : 'Business Registration / DTI / SEC', hint: 'Official registration document' },
                ].map(doc => (
                  <div key={doc.label}>
                    <label className="label">{doc.label}</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-green-300 transition-colors cursor-pointer bg-gray-50">
                      <p className="text-sm text-gray-500">{doc.hint}</p>
                      <p className="text-xs text-gray-400 mt-1">Click to upload or drag file here (JPG, PNG, PDF)</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400">
                  Documents are reviewed by Ani Market admin. Account is activated upon verification approval. This is a prototype — no actual upload is processed.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1 justify-center">
                Back
              </button>
            )}
            {step < totalSteps ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1 justify-center">
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleFinish} className="btn-primary flex-1 justify-center">
                Go to Dashboard <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
