import SellerDashboardLayout from '@/components/layout/SellerDashboardLayout';

export default function SellerDashboardPage() {
  return (
    <SellerDashboardLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Seller Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Dashboard Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Products</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">125</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Pending Orders</h2>
          <p className="text-3xl font-bold text-yellow-600 mt-2">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Sales (Month)</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">$12,345</p>
        </div>
      </div>
      {/* Add more dashboard content here */}
    </SellerDashboardLayout>
  );
}