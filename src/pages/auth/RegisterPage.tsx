import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Logo from '../../components/Logo';
import { useApp } from '../../context/AppContext';
import { MUNICIPALITIES, PROVINCES } from '../../data/mockData';
import { savePrototypeUser } from '../../data/gate1TrustData';
import type { SupplierType, User } from '../../types';

export default function RegisterPage() {
  const [params] = useSearchParams();
  const defaultRole = params.get('role') === 'supplier' ? 'supplier' : 'buyer';
  const [role, setRole] = useState<'buyer' | 'supplier'>(defaultRole);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', contactNumber: '',
    province: 'Camarines Sur', municipality: '', supplierType: 'individual_farmer',
    buyerType: 'Rice Mill', agreeTerms: false,
  });
  const [submittedUserId, setSubmittedUserId] = useState<string | null>(null);
  const { login } = useApp();
  const navigate = useNavigate();

  const municipalities = [...(MUNICIPALITIES[form.province] ?? [])].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  const update = (key: string, value: string | boolean) => setForm(current => ({ ...current, [key]: value }));
  const passwordsMatch = form.password.length > 0 && form.password === form.confirmPassword;

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordsMatch) return;

    const id = `reg-${Date.now()}`;
    const createdAt = new Date().toISOString().slice(0, 10);
    const user: User = {
      id,
      name: form.name,
      email: form.email,
      role,
      supplierType: role === 'supplier' ? form.supplierType as SupplierType : undefined,
      municipality: form.municipality,
      province: form.province,
      contactNumber: form.contactNumber,
      verificationStatus: 'Pending',
      accountStatus: 'Active',
      createdAt,
      accountVerification: { emailStatus: 'Unverified', mobileStatus: 'Unverified' },
      roleVerifications: {
        [role]: {
          role,
          profileCompleteness: 'In Progress',
          marketplaceVerificationStatus: 'Not Submitted',
          transactionAccessStatus: 'Disabled',
        },
      },
      roleContext: { activeRole: role, availableRoles: [role] },
      onboardingProgress: { [role]: 'Account Created' },
      buyerProfile: role === 'buyer' ? { userId: id, organizationName: form.name, businessType: form.buyerType } : undefined,
      supplierProfile: role === 'supplier' ? { userId: id, supplierType: form.supplierType as SupplierType, farmOrOrganizationName: form.name, operatingLocation: `${form.municipality}, ${form.province}` } : undefined,
    };

    savePrototypeUser(user);
    setSubmittedUserId(id);
  };

  const continueToOnboarding = () => {
    if (!submittedUserId) return;
    login(submittedUserId, role);
    navigate('/onboarding');
  };

  if (submittedUserId) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"><CheckCircle size={32} className="text-green-600" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created</h2>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">Your account is registered, but marketplace transactions are not yet enabled. Complete email/mobile verification, your role profile, supporting evidence, and marketplace verification next.</p>
          <div className="text-left text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 space-y-1">
            <div><strong>Account:</strong> Active</div>
            <div><strong>Profile:</strong> In Progress</div>
            <div><strong>Marketplace Verification:</strong> Not Submitted</div>
            <div><strong>Transaction Access:</strong> Disabled</div>
          </div>
          <button onClick={continueToOnboarding} className="btn-primary w-full justify-center py-2.5">Continue to Onboarding</button>
          <Link to="/login" className="block mt-3 text-sm text-gray-500 hover:text-gray-700">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8"><div className="flex justify-center mb-3"><Link to="/"><Logo size="lg" /></Link></div><p className="text-gray-500 text-sm">Create your Ani Market account</p></div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <p className="label">I am registering as a</p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {(['buyer', 'supplier'] as const).map(item => (
                <button key={item} type="button" onClick={() => setRole(item)} className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${role === item ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>{item === 'buyer' ? 'Buyer / Business' : 'Farmer / Supplier'}</button>
              ))}
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div><label className="label">{role === 'buyer' ? 'Business / Organization Name' : 'Full Name or Organization Name'}</label><input className="input" placeholder={role === 'buyer' ? 'e.g., Naga Valley Rice Mill' : 'e.g., Pedro Santos or Polangui Farmers Assoc.'} value={form.name} onChange={e => update('name', e.target.value)} required /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Email Address</label><input type="email" className="input" placeholder="your@email.com" value={form.email} onChange={e => update('email', e.target.value)} required /></div>
              <div><label className="label">Contact Number</label><input className="input" placeholder="09XXXXXXXXX" value={form.contactNumber} onChange={e => update('contactNumber', e.target.value)} required /></div>
            </div>

            {role === 'buyer' && <div><label className="label">Buyer / Business Type</label><select className="input" value={form.buyerType} onChange={e => update('buyerType', e.target.value)}>{['Rice Mill', 'Food Processor', 'Restaurant Supplier', 'Institutional Buyer', 'Trading Business', 'Cooperative Buyer', 'Agri Enterprise'].map(type => <option key={type}>{type}</option>)}</select></div>}
            {role === 'supplier' && <div><label className="label">Supplier Type</label><select className="input" value={form.supplierType} onChange={e => update('supplierType', e.target.value)}><option value="individual_farmer">Individual Farmer</option><option value="cooperative">Cooperative / Association</option><option value="organized_supplier">Organized Supplier</option><option value="aggregator">Crop Aggregator</option></select></div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Province</label><select className="input" value={form.province} onChange={e => { update('province', e.target.value); update('municipality', ''); }}>{PROVINCES.map(province => <option key={province}>{province}</option>)}</select></div>
              <div><label className="label">Municipality / City</label><select className="input" value={form.municipality} onChange={e => update('municipality', e.target.value)} required><option value="">Select municipality</option>{municipalities.map(municipality => <option key={municipality}>{municipality}</option>)}</select></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Password</label><input type="password" className="input" placeholder="Create password" value={form.password} onChange={e => update('password', e.target.value)} required /></div>
              <div><label className="label">Confirm Password</label><input type="password" className="input" placeholder="Repeat password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />{form.confirmPassword && !passwordsMatch && <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>}</div>
            </div>

            <div className="flex items-start gap-3 pt-2"><input type="checkbox" id="terms" checked={form.agreeTerms} onChange={e => update('agreeTerms', e.target.checked)} className="mt-0.5" required /><label htmlFor="terms" className="text-sm text-gray-600">I agree to the <span className="text-green-700 font-medium">Terms of Service</span> and <span className="text-green-700 font-medium">Privacy Policy</span>. I understand Ani Market is a marketplace facilitator only and does not process or hold buyer-to-supplier funds.</label></div>

            <button type="submit" disabled={!passwordsMatch || !form.agreeTerms} className="btn-primary w-full justify-center py-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">Create Account</button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-600">Already have an account? <Link to="/login" className="text-green-700 font-medium hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
