import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, MessageSquare, ArrowLeftRight,
  AlertTriangle, User, Search, CheckSquare, CreditCard, ShieldCheck,
  Users, Settings, BarChart2, BookOpen, DollarSign, Flag, LogOut,
  ChevronRight,
} from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';
import { mockDisputes, mockTransactions } from '../data/mockData';
import { getGate1Demands } from '../data/gate1DemandData';
import { getGate1Offers, getGate1Selections } from '../data/gate1OfferData';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function buyerNav(userId: string): NavItem[] {
  const myDemandIds = getGate1Demands().filter(demand => demand.buyerId === userId).map(demand => demand.id);
  const activeOfferCount = getGate1Offers().filter(offer => myDemandIds.includes(offer.demandId) && (offer.status === 'Active' || offer.status === 'Selected')).length;
  const activeSelectionCount = getGate1Selections().filter(selection => selection.buyerId === userId && selection.status === 'Pending Supplier Confirmation').length;
  const openDisputeCount = mockDisputes.filter(dispute => dispute.raisedById === userId && dispute.status === 'Under Review').length;
  return [
    { to: '/buyer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/buyer/demands', label: 'My Demand Posts', icon: <FileText size={18} /> },
    { to: '/buyer/demands/new', label: 'Post New Demand', icon: <PlusCircle size={18} /> },
    { to: '/buyer/responses', label: 'Offers & Selections', icon: <MessageSquare size={18} />, badge: (activeSelectionCount || activeOfferCount) || undefined },
    { to: '/transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
    { to: '/disputes', label: 'Disputes & Cancellations', icon: <AlertTriangle size={18} />, badge: openDisputeCount || undefined },
    { to: '/profile', label: 'Profile', icon: <User size={18} /> },
  ];
}

function supplierNav(userId: string): NavItem[] {
  const myOffers = getGate1Offers().filter(offer => offer.supplierId === userId);
  const pendingSelectionCount = getGate1Selections().filter(selection => selection.supplierId === userId && selection.status === 'Pending Supplier Confirmation').length;
  const pendingPayment = mockTransactions.filter(transaction => transaction.supplierId === userId && transaction.paymentProofStatus === 'Not Submitted').length;
  const activeOfferCount = myOffers.filter(offer => offer.status === 'Active' || offer.status === 'Selected').length;
  return [
    { to: '/supplier/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/supplier/marketplace', label: 'New Opportunities', icon: <Search size={18} /> },
    { to: '/supplier/responses', label: 'My Offers', icon: <CheckSquare size={18} />, badge: (pendingSelectionCount || activeOfferCount) || undefined },
    { to: '/transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
    { to: '/payment-proof', label: 'Payment Proof / Refs (Legacy)', icon: <CreditCard size={18} />, badge: pendingPayment || undefined },
    { to: '/disputes', label: 'Disputes & Cancellations', icon: <AlertTriangle size={18} /> },
    { to: '/profile', label: 'Profile', icon: <User size={18} /> },
  ];
}

function adminNav(): NavItem[] {
  return [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/users', label: 'Users & Roles', icon: <Users size={18} /> },
    { to: '/admin/demands', label: 'Demand Posts', icon: <FileText size={18} /> },
    { to: '/admin/matches', label: 'Selections & Commitments', icon: <CheckSquare size={18} /> },
    { to: '/admin/transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
    { to: '/admin/proof-review', label: 'Proof / Ref Review (Legacy)', icon: <ShieldCheck size={18} />, badge: 1 },
    { to: '/admin/cancellations', label: 'Cancellations', icon: <Flag size={18} />, badge: 1 },
    { to: '/admin/disputes', label: 'Disputes', icon: <AlertTriangle size={18} />, badge: mockDisputes.filter(dispute => dispute.status === 'Under Review').length || undefined },
    { to: '/admin/crop-catalog', label: 'Crop Catalog', icon: <BookOpen size={18} /> },
    { to: '/admin/fee-settings', label: 'Fee Settings (Pending Chunk 8)', icon: <DollarSign size={18} /> },
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
  const roleBg = currentRole === 'admin'
    ? 'bg-brand-primaryDark text-white'
    : currentRole === 'supplier'
      ? 'bg-brand-primary text-brand-ink'
      : 'bg-white text-brand-primaryDark border border-brand-primary';

  return (
    <div className={`flex h-full flex-col border-r border-green-100 bg-white ${collapsed ? 'w-16' : 'w-64'} transition-all`}>
      <div className="border-b border-gray-100 p-4">
        <Link to="/" aria-label="Ani Market home">
          {collapsed ? <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary p-1.5"><span className="text-sm font-bold text-white">A</span></div> : <Logo />}
        </Link>
      </div>

      {!collapsed && currentUser && (
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="mb-1 text-xs text-gray-500">Logged in as</div>
          <div className="truncate text-sm font-semibold text-gray-800">{currentUser.name}</div>
          <span className={`badge mt-1 ${roleBg}`}>{roleLabel}</span>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label={`${roleLabel} navigation`}>
        {nav.map(item => {
          const active = location.pathname === item.to || (item.to !== '/buyer/demands' && location.pathname.startsWith(item.to + '/'));
          return (
            <Link key={item.to} to={item.to} onClick={onNavigate} aria-current={active ? 'page' : undefined} title={collapsed ? item.label : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? 'border border-green-200 bg-brand-primaryLight text-brand-primaryDark' : 'text-brand-ink/70 hover:bg-brand-primaryLight hover:text-brand-primaryDark'}`}>
              <span className={active ? 'text-green-600' : 'text-gray-400'} aria-hidden="true">{item.icon}</span>
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge && <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white" aria-label={`${item.badge} pending`}>{item.badge}</span>}
              {!collapsed && active && !item.badge && <ChevronRight size={14} className="text-green-400" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <button onClick={() => { logout(); onNavigate?.(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50" title={collapsed ? 'Logout' : undefined}><LogOut size={18} aria-hidden="true" />{!collapsed && <span>Logout</span>}</button>
      </div>
    </div>
  );
}
