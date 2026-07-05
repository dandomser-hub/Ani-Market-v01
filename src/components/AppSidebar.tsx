import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, MessageSquare, ArrowLeftRight,
  AlertTriangle, User, Search, CheckSquare, CreditCard, ShieldCheck,
  Users, Settings, BarChart2, BookOpen, DollarSign, Flag, LogOut,
  ChevronRight,
} from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';
import { mockResponses, mockDemandPosts, mockDisputes, mockTransactions } from '../data/mockData';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function buyerNav(userId: string): NavItem[] {
  const myDemandIds = mockDemandPosts.filter(d => d.buyerId === userId).map(d => d.id);
  const pendingResponseCount = mockResponses.filter(r => r.status === 'Pending' && myDemandIds.includes(r.demandId)).length;
  const openDisputeCount = mockDisputes.filter(d => d.raisedById === userId && d.status === 'Under Review').length;
  return [
    { to: '/buyer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/buyer/demands', label: 'My Demand Posts', icon: <FileText size={18} /> },
    { to: '/buyer/demands/new', label: 'Post New Demand', icon: <PlusCircle size={18} /> },
    { to: '/buyer/responses', label: 'Responses', icon: <MessageSquare size={18} />, badge: pendingResponseCount || undefined },
    { to: '/transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
    { to: '/disputes', label: 'Disputes & Cancellations', icon: <AlertTriangle size={18} />, badge: openDisputeCount || undefined },
    { to: '/profile', label: 'Profile', icon: <User size={18} /> },
  ];
}

function supplierNav(userId: string): NavItem[] {
  const myResponses = mockResponses.filter(r => r.supplierId === userId);
  const pendingPayment = mockTransactions.filter(t => t.supplierId === userId && t.paymentProofStatus === 'Not Submitted').length;
  const activeResponseCount = myResponses.filter(r => r.status === 'Pending').length;
  return [
    { to: '/supplier/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/supplier/marketplace', label: 'Browse Demand', icon: <Search size={18} /> },
    { to: '/supplier/responses', label: 'My Responses', icon: <CheckSquare size={18} />, badge: activeResponseCount || undefined },
    { to: '/transactions', label: 'Matched Transactions', icon: <ArrowLeftRight size={18} /> },
    { to: '/payment-proof', label: 'Payment Proof / Refs', icon: <CreditCard size={18} />, badge: pendingPayment || undefined },
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
    { to: '/admin/proof-review', label: 'Proof / Ref Review', icon: <ShieldCheck size={18} />, badge: 1 },
    { to: '/admin/cancellations', label: 'Cancellations', icon: <Flag size={18} />, badge: 1 },
    { to: '/admin/disputes', label: 'Disputes', icon: <AlertTriangle size={18} />, badge: mockDisputes.filter(d => d.status === 'Under Review').length || undefined },
    { to: '/admin/crop-catalog', label: 'Crop Catalog', icon: <BookOpen size={18} /> },
    { to: '/admin/fee-settings', label: 'Fee Settings', icon: <DollarSign size={18} /> },
    { to: '/admin/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
    { to: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];
}

interface Props {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function AppSidebar({ collapsed = false, onNavigate }: Props) {
  const { currentRole, currentUser, logout } = useApp();
  const location = useLocation();

  const uid = currentUser?.id ?? '';
  const nav = currentRole === 'admin' ? adminNav() : currentRole === 'supplier' ? supplierNav(uid) : buyerNav(uid);

  const roleLabel = currentRole === 'admin' ? 'Admin' : currentRole === 'supplier' ? 'Supplier' : 'Buyer';
  const roleBg = currentRole === 'admin' ? 'bg-slate-100 text-slate-700' : currentRole === 'supplier' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';

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
          const active = location.pathname === item.to ||
            (item.to !== '/buyer/demands' && location.pathname.startsWith(item.to + '/'));
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={active ? 'text-green-600' : 'text-gray-400'}>{item.icon}</span>
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold flex-shrink-0">
                  {item.badge}
                </span>
              )}
              {!collapsed && active && !item.badge && <ChevronRight size={14} className="text-green-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => { logout(); onNavigate?.(); }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
