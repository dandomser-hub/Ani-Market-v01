import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, MessageSquare, ArrowLeftRight,
  AlertTriangle, User, Search, CheckSquare, CreditCard, ShieldCheck,
  Users, Settings, BarChart2, BookOpen, DollarSign, Flag, LogOut,
  ChevronRight,
} from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

function buyerNav(): NavItem[] {
  return [
    { to: '/buyer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/buyer/demands', label: 'My Demand Posts', icon: <FileText size={18} /> },
    { to: '/buyer/demands/new', label: 'Post New Demand', icon: <PlusCircle size={18} /> },
    { to: '/buyer/responses', label: 'Responses', icon: <MessageSquare size={18} /> },
    { to: '/transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
    { to: '/disputes', label: 'Disputes & Cancellations', icon: <AlertTriangle size={18} /> },
    { to: '/profile', label: 'Profile', icon: <User size={18} /> },
  ];
}

function supplierNav(): NavItem[] {
  return [
    { to: '/supplier/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/supplier/marketplace', label: 'Browse Demand', icon: <Search size={18} /> },
    { to: '/supplier/responses', label: 'My Responses', icon: <CheckSquare size={18} /> },
    { to: '/transactions', label: 'Matched Transactions', icon: <ArrowLeftRight size={18} /> },
    { to: '/payment-proof', label: 'Payment Proof / Refs', icon: <CreditCard size={18} /> },
    { to: '/disputes', label: 'Disputes & Cancellations', icon: <AlertTriangle size={18} /> },
    { to: '/profile', label: 'Profile', icon: <User size={18} /> },
  ];
}

function adminNav(): NavItem[] {
  return [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/users', label: 'Users & Roles', icon: <Users size={18} /> },
    { to: '/admin/demands', label: 'Demand Posts', icon: <FileText size={18} /> },
    { to: '/admin/matches', label: 'Matches', icon: <CheckSquare size={18} /> },
    { to: '/admin/transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
    { to: '/admin/proof-review', label: 'Proof / Ref Review', icon: <ShieldCheck size={18} /> },
    { to: '/admin/cancellations', label: 'Cancellations', icon: <Flag size={18} /> },
    { to: '/admin/disputes', label: 'Disputes', icon: <AlertTriangle size={18} /> },
    { to: '/admin/crop-catalog', label: 'Crop Catalog', icon: <BookOpen size={18} /> },
    { to: '/admin/fee-settings', label: 'Fee Settings', icon: <DollarSign size={18} /> },
    { to: '/admin/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
    { to: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];
}

interface Props {
  collapsed?: boolean;
}

export default function AppSidebar({ collapsed = false }: Props) {
  const { currentRole, currentUser, logout } = useApp();
  const location = useLocation();

  const nav = currentRole === 'admin' ? adminNav() : currentRole === 'supplier' ? supplierNav() : buyerNav();

  const roleLabel = currentRole === 'admin' ? 'Admin' : currentRole === 'supplier' ? 'Supplier' : 'Buyer';
  const roleBg = currentRole === 'admin' ? 'bg-purple-100 text-purple-700' : currentRole === 'supplier' ? 'bg-leaf-100 text-leaf-700' : 'bg-amber-100 text-amber-700';

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${collapsed ? 'w-16' : 'w-64'} transition-all`}>
      <div className="p-4 border-b border-gray-100">
        <Link to="/">
          {collapsed ? (
            <div className="bg-green-600 rounded-lg p-1.5 flex items-center justify-center w-9 h-9">
              <span className="text-white font-bold text-sm">A</span>
            </div>
          ) : (
            <Logo />
          )}
        </Link>
      </div>

      {!collapsed && currentUser && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Logged in as</div>
          <div className="text-sm font-semibold text-gray-800 truncate">{currentUser.name}</div>
          <span className={`badge mt-1 ${roleBg}`}>{roleLabel}</span>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {nav.map(item => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={active ? 'text-green-600' : 'text-gray-400'}>{item.icon}</span>
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && active && <ChevronRight size={14} className="text-green-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
