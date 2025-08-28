'use client';

import { useState } from 'react';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Product } from '@/lib/types';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminProductApprovalsPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const productsPerPage = 10;

  // Fetch products (assuming admin can see all products, including inactive ones)
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', currentPage],
    queryFn: () => apiClient.getProducts(currentPage, productsPerPage),
    keepPreviousData: true,
  });

  const products = productsData?.data?.data || [];
  const totalPages = productsData?.data?.pagination?.totalPages || 1;

  // Mutation for updating product status (approving/rejecting)
  const updateProductStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.updateProduct(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product status updated successfully!');
    },
    onError: (err: any) => {
      toast.error(`Error updating product status: ${err.message || err.error}`);
    },
  });

  const handleToggleProductStatus = (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    if (confirm(`Are you sure you want to ${newStatus ? 'approve' : 'reject'} this product?`)) {
      updateProductStatusMutation.mutate({ id, isActive: newStatus });
    }
  };

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Loading products for approval...</p>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="text-red-600">Error loading products: {error.message}</div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Product Approvals</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No products awaiting approval.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => setSelectedProduct(product)} className="block">
                      <img src={product.thumbnail || '/placeholder-product.svg'} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {product.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.seller.firstName} {product.seller.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleProductStatus(product.id, product.isActive)}
                      className={`text-white px-3 py-1 rounded-md ${
                        product.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {product.isActive ? 'Reject' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

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
    </AdminDashboardLayout>
  );
}