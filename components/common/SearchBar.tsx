'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    inStock: false,
  });
  
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchTerm.trim());
      
      // Add filters
      if (filters.category) params.set('category', filters.category);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.rating) params.set('rating', filters.rating);
      if (filters.inStock) params.set('inStock', 'true');
      
      router.push(`/products?${params.toString()}`);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStock: false,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false
  );

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border-t border-r border-b border-gray-300 ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700'
            } hover:bg-blue-600 hover:text-white transition-colors`}
          >
            <Filter className="w-5 h-5" />
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Search
          </button>
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <input
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          </div>

          {/* In Stock Filter */}
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">In Stock Only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
