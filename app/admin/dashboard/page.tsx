import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';

export default function AdminDashboardPage() {
  return (
    <AdminDashboardLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Dashboard Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Sellers</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">42</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Pending Product Approvals</h2>
          <p className="text-3xl font-bold text-yellow-600 mt-2">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Orders Processed</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">1,234</p>
        </div>
      </div>
      {/* Add more dashboard content here */}
    </AdminDashboardLayout>
  );
}