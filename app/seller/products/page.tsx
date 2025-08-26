'use client';

import { useState } from 'react';
import SellerDashboardLayout from '@/components/layout/SellerDashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Product, Category } from '@/lib/types';
import toast from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, Search, XCircle } from 'lucide-react';

export default function SellerProductsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', currentPage, searchTerm],
    queryFn: () => apiClient.getProducts(currentPage, productsPerPage, { name: searchTerm || undefined }),
    keepPreviousData: true,
  });

  // Fetch categories for product form
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  const products = productsData?.data?.data || [];
  const totalPages = productsData?.data?.pagination?.totalPages || 1;
  const categories = categoriesData?.data || [];

  // Mutations for product actions
  const createProductMutation = useMutation({
    mutationFn: apiClient.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
      setIsModalOpen(false);
      setEditingProduct(null);
    },
    onError: (err: any) => {
      toast.error(`Error creating product: ${err.message || err.error}`);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => apiClient.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully!');
      setIsModalOpen(false);
      setEditingProduct(null);
    },
    onError: (err: any) => {
      toast.error(`Error updating product: ${err.message || err.error}`);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: apiClient.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(`Error deleting product: ${err.message || err.error}`);
    },
  });

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const ProductForm = ({ product, onClose }: { product: Product | null; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      categoryId: product?.category?.id || '',
      stock: product?.stockQuantity || 0,
      images: product?.images.join(', ') || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const productData = {
        ...formData,
        images: formData.images.split(',').map((img) => img.trim()).filter(Boolean),
      };

      if (product) {
        updateProductMutation.mutate({ id: product.id, data: productData });
      } else {
        createProductMutation.mutate(productData);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category</label>
              <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
              <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700">Image URLs (comma-separated)</label>
              <input type="text" id="images" name="images" value={formData.images} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="url1, url2, url3" />
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                {product ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <SellerDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Loading products...</p>
        </div>
      </SellerDashboardLayout>
    );
  }

  if (error) {
    return (
      <SellerDashboardLayout>
        <div className="text-red-600">Error loading products: {error.message}</div>
      </SellerDashboardLayout>
    );
  }

  return (
    <SellerDashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusCircle size={20} className="mr-2" /> Add New Product
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center mb-6 space-x-2">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button type="submit" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Search</button>
        {searchTerm && (
          <button type="button" onClick={() => setSearchTerm('')} className="px-3 py-2 text-gray-600 hover:text-gray-800">
            <XCircle size={20} />
          </button>
        )}
      </form>

      {/* Products Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={product.images[0] || '/placeholder-product.svg'} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stockQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-900 mr-3">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(product.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
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

      {isModalOpen && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </SellerDashboardLayout>
  );
}