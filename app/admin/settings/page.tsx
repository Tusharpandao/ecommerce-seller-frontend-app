'use client';

import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';

export default function AdminSettingsPage() {
  return (
    <AdminDashboardLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Settings</h1>
      <p>Here you can manage global platform settings.</p>
      {/* Admin settings UI will go here */}
    </AdminDashboardLayout>
  );
}
