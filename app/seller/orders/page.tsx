'use client';

import { useState } from 'react';
import SellerDashboardLayout from '@/components/layout/SellerDashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Order, OrderStatus } from '@/lib/types';
import toast from 'react-hot-toast';
import { Package, CheckCircle, XCircle, Truck } from 'lucide-react';

export default function SellerOrdersPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Fetch orders
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['orders', currentPage],
    queryFn: () => apiClient.getOrders(currentPage, ordersPerPage),
    keepPreviousData: true,
  });

  const orders = ordersData?.data?.data || [];
  const totalPages = ordersData?.data?.pagination?.totalPages || 1;

  // Mutation for updating order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      apiClient.updateOrderStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully!');
    },
    onError: (err: any) => {
      toast.error(`Error updating order status: ${err.message || err.error}`);
    },
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    if (confirm(`Are you sure you want to change the status of order ${orderId} to ${newStatus}?`)) {
      updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <SellerDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Loading orders...</p>
        </div>
      </SellerDashboardLayout>
    );
  }

  if (error) {
    return (
      <SellerDashboardLayout>
        <div className="text-red-600">Error loading orders: {error.message}</div>
      </SellerDashboardLayout>
    );
  }

  return (
    <SellerDashboardLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 border border-gray-300 rounded-md ${
                currentPage === index + 1 ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </SellerDashboardLayout>
  );
}