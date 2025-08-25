'use client';

import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/products/ProductCard';
import { apiClient } from '@/lib/api';
import { Product } from '@/lib/types';

export default function FeaturedProducts() {
  const { data: productsResponse, isLoading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => apiClient.getProducts(1, 8),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded mb-2 w-3/4"></div>
            <div className="bg-gray-200 h-6 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !productsResponse?.success) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          Unable to load featured products at this time.
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const products = productsResponse.data?.data || [];

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No featured products available.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
