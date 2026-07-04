import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import AppSidebar from '../components/AppSidebar';
import { useApp } from '../context/AppContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, currentRole } = useApp();

  const roleLabel = currentRole === 'admin' ? 'Admin' : currentRole === 'supplier' ? 'Supplier' : 'Buyer';

  return (
    <div className="flex h-screen bg-green-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <AppSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex-shrink-0">
            <AppSidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center justify-between flex-shrink-0">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <button className="relative p-1.5 rounded-lg hover:bg-gray-100">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
              <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 text-xs font-bold">
                  {currentUser?.name?.charAt(0) ?? 'U'}
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-gray-800 leading-tight max-w-[140px] truncate">
                  {currentUser?.name}
                </div>
                <div className="text-xs text-gray-500">{roleLabel}</div>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
