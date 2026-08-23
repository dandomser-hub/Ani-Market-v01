import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Logo from '../../components/Logo';
import { useApp } from '../../context/AppContext';
import { DEMO_ACCOUNTS } from '../../data/mockData';
import type { UserRole } from '../../types';

const QUICK_DEMOS: Array<{ label: string; userId: string; role: UserRole; note: string }> = [
  { label: 'Verified Buyer', userId: 'u1', role: 'buyer', note: 'Transactions enabled' },
  { label: 'Verified Supplier', userId: 'u2', role: 'supplier', note: 'Transactions enabled' },
  { label: 'Pending Buyer', userId: 'u8', role: 'buyer', note: 'Transactions disabled' },
  { label: 'Pending Supplier', userId: 'u5', role: 'supplier', note: 'Transactions disabled' },
  { label: 'Admin', userId: 'admin1', role: 'admin', note: 'Verification review' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const goToRoleHome = (role: UserRole) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'buyer') navigate('/buyer/dashboard');
    else navigate('/supplier/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (!account) {
      setError('Invalid email or password. Try a demo account below.');
      return;
    }
    login(account.userId, account.role);
    goToRoleHome(account.role);
  };

  const quickLogin = (userId: string, role: UserRole) => {
    login(userId, role);
    goToRoleHome(role);
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3"><Link to="/"><Logo size="lg" /></Link></div>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="label">Email Address</label><input type="email" className="input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
            <button type="submit" className="btn-primary w-full justify-center py-2.5"><LogIn size={16} /> Sign In</button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3 font-medium">Gate 1 quick demo states</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_DEMOS.map(demo => (
                <button key={demo.label} onClick={() => quickLogin(demo.userId, demo.role)} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left transition-colors hover:border-green-300 hover:bg-green-50">
                  <span className="block text-xs font-semibold text-gray-800">{demo.label}</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">{demo.note}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-gray-400">Pending demo users are useful for testing verification gating. Admin decisions persist in this browser and affect their next login.</p>
          </div>
        </div>

        <div className="mt-6 text-center"><p className="text-sm text-gray-600">Don't have an account? <Link to="/register" className="text-green-700 font-medium hover:underline">Register here</Link></p></div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 mb-2">Credential demo accounts (password: demo1234)</p>
          <ul className="space-y-1 text-xs text-amber-600"><li><strong>Buyer:</strong> procurement@nagavalley.com</li><li><strong>Supplier:</strong> pfa@farmersph.org</li><li><strong>Admin:</strong> admin@animarket.ph</li></ul>
        </div>
      </div>
    </div>
  );
}
