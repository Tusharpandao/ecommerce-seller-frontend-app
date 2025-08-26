'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ShoppingBag, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface SellerDashboardLayoutProps {
  children: React.ReactNode;
}

export default function SellerDashboardLayout({ children }: SellerDashboardLayoutProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/seller/products', icon: Package },
    { name: 'Orders', href: '/seller/orders', icon: ShoppingBag },
    { name: 'Settings', href: '/seller/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">Seller Panel</h2>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                pathname === item.href ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}>
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="w-full bg-white shadow-sm p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            {navItems.find(item => pathname.startsWith(item.href))?.name || 'Dashboard'}
          </h1>
          {/* User/Profile Placeholder */}
          <div className="flex items-center">
            <span className="text-gray-700">Seller Name</span>
            {/* <img src="/path/to/avatar.jpg" alt="User Avatar" className="w-8 h-8 rounded-full ml-3" /> */}
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
