import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/for-buyers', label: 'For Buyers' },
    { to: '/for-suppliers', label: 'For Farmers & Suppliers' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === l.to
                    ? 'text-green-700'
                    : 'text-gray-600 hover:text-green-700'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="btn-secondary py-1.5 px-4 text-sm">
              Login
            </Link>
            <Link to="/register" className="btn-primary py-1.5 px-4 text-sm">
              Register
            </Link>
          </div>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-gray-700 py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Link to="/login" className="btn-secondary flex-1 justify-center" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link to="/register" className="btn-primary flex-1 justify-center" onClick={() => setOpen(false)}>
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
