'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Product, SearchFilters } from '@/lib/types';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';

interface ProductSearchProps {
  onProductsFound: (products: Product[]) => void;
  onLoading: (loading: boolean) => void;
}

export default function ProductSearch({ onProductsFound, onLoading }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    minPrice: undefined,
    maxPrice: undefined,
    rating: undefined,
    inStock: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!searchTerm.trim() && !Object.values(filters).some(v => v !== '' && v !== false)) {
      return;
    }

    // Add to recent searches
    if (searchTerm.trim()) {
      setRecentSearches(prev => {
        const newSearches = [searchTerm.trim(), ...prev.filter(s => s !== searchTerm.trim())];
        return newSearches.slice(0, 5); // Keep only 5 recent searches
      });
    }

    onLoading(true);
    try {
      let response;
      
      if (Object.values(filters).some(v => v !== '' && v !== false)) {
        // Use filtered search
        response = await apiClient.getProducts(1, 20, filters);
      } else {
        // Use text search
        response = await apiClient.getProducts(1, 20);
      }

      if (response.success && response.data) {
        onProductsFound(response.data.data || []);
      } else {
        console.error('Search failed:', response.error);
        onProductsFound([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      onProductsFound([]);
    } finally {
      onLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: undefined,
      maxPrice: undefined,
      rating: undefined,
      inStock: false
    });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(filters).some(v => 
    v !== '' && v !== undefined && v !== false
  );

  const handleQuickSearch = (term: string) => {
    setSearchTerm(term);
    // Auto-search after setting term
    setTimeout(() => handleSearch(), 100);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Enhanced Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              Search
            </button>
          </div>
        </div>

        {/* Recent Searches Dropdown */}
        {recentSearches.length > 0 && searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Searches</h4>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(search)}
                    className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between group"
                  >
                    <span className="group-hover:text-blue-600">{search}</span>
                    <Search className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <SlidersHorizontal className="w-5 h-5 mr-2 text-blue-600" />
              Advanced Filters
            </h3>
            <div className="flex items-center space-x-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g., Electronics, Clothing"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            {/* Min Price Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            
            {/* Max Price Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="1000"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min Rating
              </label>
              <select
                value={filters.rating || ''}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars ⭐⭐⭐⭐</option>
                <option value="3">3+ Stars ⭐⭐⭐</option>
                <option value="2">2+ Stars ⭐⭐</option>
                <option value="1">1+ Star ⭐</option>
              </select>
            </div>
            
            {/* In Stock Filter */}
            <div className="md:col-span-2 lg:col-span-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                  className="mr-3 w-5 h-5 text-blue-600 focus:ring-4 focus:ring-blue-100 border-gray-300 rounded-lg"
                />
                <span className="text-sm font-semibold text-gray-700">Show only in-stock items</span>
              </label>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
            >
              Clear All
            </button>
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-gray-600 mr-2">Active filters:</span>
          {filters.category && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Category: {filters.category}
              <button
                onClick={() => setFilters({ ...filters, category: '' })}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.minPrice && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Min: ${filters.minPrice}
              <button
                onClick={() => setFilters({ ...filters, minPrice: undefined })}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.maxPrice && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Max: ${filters.maxPrice}
              <button
                onClick={() => setFilters({ ...filters, maxPrice: undefined })}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.rating && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Rating: {filters.rating}+ ⭐
              <button
                onClick={() => setFilters({ ...filters, rating: undefined })}
                className="ml-2 text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.inStock && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              In Stock Only
              <button
                onClick={() => setFilters({ ...filters, inStock: false })}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
