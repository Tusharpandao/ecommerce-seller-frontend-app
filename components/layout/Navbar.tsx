'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { 
  User, 
  LogOut, 
  Menu, 
  X,
  Package,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const getRoleBasedLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
          { href: '/admin/products', label: 'Products', icon: Package },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/orders', label: 'Orders', icon: Package },
          { href: '/admin/categories', label: 'Categories', icon: Package },
        ];
      case 'seller':
        return [
          { href: '/seller/dashboard', label: 'Dashboard', icon: BarChart3 },
          { href: '/seller/products', label: 'My Products', icon: Package },
          { href: '/seller/add-product', label: 'Add Product', icon: Package },
          { href: '/seller/orders', label: 'Orders', icon: Package },
        ];
      default:
        return [];
    }
  };

  const roleLinks = getRoleBasedLinks();

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">E-Store</span>
            </Link>
            
            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {isAuthenticated && roleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Auth and mobile menu button */}
          <div className="flex items-center">
            {/* Desktop auth */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {user?.firstName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-md"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {isAuthenticated ? (
              <>
                {roleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
                <div className="border-t pt-4">
                  <span className="block px-3 py-2 text-sm text-gray-500">
                    Welcome, {user?.firstName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-gray-900 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t pt-4 space-y-2">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}