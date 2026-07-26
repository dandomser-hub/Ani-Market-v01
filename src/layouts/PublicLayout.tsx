import { Outlet } from 'react-router-dom';
import PublicNav from '../components/PublicNav';
import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="app-collage-surface min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-brand-primaryDark text-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="mb-4">
                <Link
                  to="/"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-primaryDark"
                  aria-label="Ani Market — return to top of landing page"
                >
                  <img
                    src="/animarket-logo-white.png"
                    alt="Ani Market"
                    className="h-16 w-auto object-contain"
                  />
                </Link>
              </div>
              <p className="text-sm text-[#E8F5E9] leading-relaxed max-w-sm">
                A demand-driven agricultural marketplace for Mainland Bicol. Connecting buyers and farmers through transparent, crop-focused trade.
              </p>
              <div className="mt-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Mail size={14} />
                  <span>info@animarket.ph</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white">
                  <Phone size={14} />
                  <span>+63 (054) 000-0000</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[#E8F5E9] mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-white">
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/for-buyers" className="hover:text-white transition-colors">For Buyers</Link></li>
                <li><Link to="/for-suppliers" className="hover:text-white transition-colors">For Farmers & Suppliers</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#E8F5E9] mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-white">
                <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Data Privacy Act Compliance</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-green-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white">
              &copy; 2025 Ani Market. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
