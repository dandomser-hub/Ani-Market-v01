import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

import LandingPage from './pages/public/LandingPage';
import HowItWorks from './pages/public/HowItWorks';
import ForBuyers from './pages/public/ForBuyers';
import ForSuppliers from './pages/public/ForSuppliers';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OnboardingPage from './pages/auth/OnboardingPage';

import BuyerDashboard from './pages/buyer/BuyerDashboard';
import DemandList from './pages/buyer/DemandList';
import NewDemand from './pages/buyer/NewDemand';
import EditDemand from './pages/buyer/EditDemand';
import DemandDetail from './pages/buyer/DemandDetail';
import BuyerResponses from './pages/buyer/BuyerResponses';

import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierMarketplace from './pages/supplier/SupplierMarketplace';
import SupplierResponses from './pages/supplier/SupplierResponses';

import TransactionList from './pages/shared/TransactionList';
import TransactionWorkspace from './pages/shared/TransactionWorkspace';
import Gate1TransactionWorkspace from './pages/shared/Gate1TransactionWorkspace';
import NegotiationWorkspace from './pages/shared/NegotiationWorkspace';
import PaymentCenter from './pages/shared/PaymentCenter';
import PaymentWorkspace from './pages/shared/PaymentWorkspace';
import PaymentProof from './pages/shared/PaymentProof';
import DisputesPage from './pages/shared/DisputesPage';
import ProfilePage from './pages/shared/ProfilePage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDemands from './pages/admin/AdminDemands';
import AdminMatches from './pages/admin/AdminMatches';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminPaymentReview from './pages/admin/AdminPaymentReview';
import AdminProofReview from './pages/admin/AdminProofReview';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminCancellations from './pages/admin/AdminCancellations';
import AdminCropCatalog from './pages/admin/AdminCropCatalog';
import AdminFeeSettings from './pages/admin/AdminFeeSettings';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import NotFoundPage from './pages/public/NotFoundPage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { currentRole } = useApp();
  if (!currentRole) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentRole)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/for-buyers" element={<ForBuyers />} />
        <Route path="/for-suppliers" element={<ForSuppliers />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/buyer/dashboard" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerDashboard /></ProtectedRoute>} />
        <Route path="/buyer/demands" element={<ProtectedRoute allowedRoles={['buyer']}><DemandList /></ProtectedRoute>} />
        <Route path="/buyer/demands/new" element={<ProtectedRoute allowedRoles={['buyer']}><NewDemand /></ProtectedRoute>} />
        <Route path="/buyer/demands/:id/edit" element={<ProtectedRoute allowedRoles={['buyer']}><EditDemand /></ProtectedRoute>} />
        <Route path="/buyer/demands/:id" element={<ProtectedRoute allowedRoles={['buyer']}><DemandDetail /></ProtectedRoute>} />
        <Route path="/buyer/responses" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerResponses /></ProtectedRoute>} />

        <Route path="/supplier/dashboard" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierDashboard /></ProtectedRoute>} />
        <Route path="/supplier/marketplace" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierMarketplace /></ProtectedRoute>} />
        <Route path="/supplier/marketplace/:id" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierMarketplace /></ProtectedRoute>} />
        <Route path="/supplier/responses" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierResponses /></ProtectedRoute>} />

        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/transactions/:id" element={<TransactionWorkspace />} />
        <Route path="/gate1-transactions/:id" element={<Gate1TransactionWorkspace />} />
        <Route path="/negotiations/:id" element={<NegotiationWorkspace />} />
        <Route path="/payments" element={<PaymentCenter />} />
        <Route path="/payments/:id" element={<PaymentWorkspace />} />
        <Route path="/payment-proof" element={<PaymentProof />} />
        <Route path="/disputes" element={<DisputesPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/demands" element={<ProtectedRoute allowedRoles={['admin']}><AdminDemands /></ProtectedRoute>} />
        <Route path="/admin/matches" element={<ProtectedRoute allowedRoles={['admin']}><AdminMatches /></ProtectedRoute>} />
        <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin']}><AdminTransactions /></ProtectedRoute>} />
        <Route path="/admin/payment-review" element={<ProtectedRoute allowedRoles={['admin']}><AdminPaymentReview /></ProtectedRoute>} />
        <Route path="/admin/proof-review" element={<ProtectedRoute allowedRoles={['admin']}><AdminProofReview /></ProtectedRoute>} />
        <Route path="/admin/cancellations" element={<ProtectedRoute allowedRoles={['admin']}><AdminCancellations /></ProtectedRoute>} />
        <Route path="/admin/disputes" element={<ProtectedRoute allowedRoles={['admin']}><AdminDisputes /></ProtectedRoute>} />
        <Route path="/admin/crop-catalog" element={<ProtectedRoute allowedRoles={['admin']}><AdminCropCatalog /></ProtectedRoute>} />
        <Route path="/admin/fee-settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminFeeSettings /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return <AppProvider><BrowserRouter><AppRoutes /></BrowserRouter></AppProvider>;
}
