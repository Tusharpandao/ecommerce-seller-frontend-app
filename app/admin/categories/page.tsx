'use client';

import { useState } from 'react';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Category } from '@/lib/types';
import toast from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, XCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Fetch categories
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  const categories = categoriesData?.data || [];

  // Mutations for category actions
  const createCategoryMutation = useMutation({
    mutationFn: apiClient.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully!');
      setIsModalOpen(false);
      setEditingCategory(null);
    },
    onError: (err: any) => {
      toast.error(`Error creating category: ${err.message || err.error}`);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; description?: string } }) => apiClient.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully!');
      setIsModalOpen(false);
      setEditingCategory(null);
    },
    onError: (err: any) => {
      toast.error(`Error updating category: ${err.message || err.error}`);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: apiClient.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(`Error deleting category: ${err.message || err.error}`);
    },
  });

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const CategoryForm = ({ category, onClose }: { category: Category | null; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: category?.name || '',
      description: category?.description || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (category) {
        updateCategoryMutation.mutate({ id: category.id, data: formData });
      } else {
        createCategoryMutation.mutate(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{category ? 'Edit Category' : 'Add New Category'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                {category ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Loading categories...</p>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="text-red-600">Error loading categories: {error.message}</div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusCircle size={20} className="mr-2" /> Add New Category
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditClick(category)} className="text-blue-600 hover:text-blue-900 mr-3">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(category.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
        />
      )}
    </AdminDashboardLayout>
  );
}
