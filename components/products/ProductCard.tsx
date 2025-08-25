'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { Star, ShoppingCart, LogIn, Heart, Eye, Share2 } from 'lucide-react';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Toast, { ToastType } from '@/components/common/Toast';
import LoginModal from '@/components/common/LoginModal';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await apiClient.addToCart(product.id, 1);
      if (response.success) {
        showToast('Product added to cart successfully!', 'success');
      } else {
        showToast(response.error || 'Failed to add product to cart', 'error');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      showToast('Error adding product to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleLoginSuccess = () => {
    handleAddToCart();
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setIsWishlisted(!isWishlisted);
    showToast(
      isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 
      'success'
    );
  };

  const handleQuickView = () => {
    router.push(`/products/${product.id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 text-yellow-400 fill-current" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" />
      );
    }

    return stars;
  };

  const calculateDiscount = () => {
    if (product.salePrice && product.salePrice < product.price) {
      return Math.round(((product.price - product.salePrice) / product.price) * 100);
    }
    return 0;
  };

  const discount = calculateDiscount();

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="flex">
          {/* Product Image */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <Image
              src={product.thumbnail || '/placeholder-product.svg'}
              alt={product.name}
              width={200}
              height={200}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-product.svg';
              }}
              priority={false}
              loading="lazy"
            />
            {discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                {discount}% OFF
              </div>
            )}
            {!product.isActive && (
              <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                Out of Stock
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="text-sm text-blue-600 font-medium mb-2 uppercase tracking-wide">
                  {product.category?.name}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                  {product.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center mr-2">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Stock Status */}
                <div className="text-sm text-gray-600 mb-4">
                  {product.stockQuantity > 0 ? (
                    <span className="text-green-600 font-medium">
                      ✓ In Stock ({product.stockQuantity} available)
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">✗ Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Price Section */}
              <div className="text-right ml-6">
                <div className="mb-2">
                  {discount > 0 ? (
                    <>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(product.salePrice)}
                      </div>
                      <div className="text-lg text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.isActive || product.stockQuantity === 0 || isAddingToCart}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                      !product.isActive || product.stockQuantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                    }`}
                  >
                    {isAddingToCart ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </div>
                    ) : !isAuthenticated ? (
                      <>
                        <LogIn className="w-4 h-4 mr-2 inline" />
                        Login to Add
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2 inline" />
                        Add to Cart
                      </>
                    )}
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleWishlist}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                        isWishlisted
                          ? 'border-red-500 text-red-600 bg-red-50'
                          : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 inline mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                      Wishlist
                    </button>
                    <button
                      onClick={handleQuickView}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      Quick View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleLoginSuccess} />
        )}
        
        <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.thumbnail || '/placeholder-product.svg'}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.svg';
          }}
          priority={false}
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
            {discount}% OFF
          </div>
        )}
        
        {/* Stock Badge */}
        {!product.isActive && (
          <div className="absolute top-3 right-3 bg-gray-800 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            Out of Stock
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
          <button
            onClick={handleWishlist}
            className={`w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-colors ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleQuickView}
            className="w-8 h-8 bg-white text-gray-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart Button Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            disabled={!product.isActive || product.stockQuantity === 0 || isAddingToCart}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              !product.isActive || product.stockQuantity === 0
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-white text-gray-900 hover:bg-blue-50'
            }`}
          >
            {isAddingToCart ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Adding...
              </div>
            ) : !isAuthenticated ? (
              <>
                <LogIn className="w-4 h-4 mr-2 inline" />
                Login to Add
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2 inline" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <div className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wide">
          {product.category?.name}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer group-hover:text-blue-600">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center mr-2">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-gray-600">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="mb-3">
          {discount > 0 ? (
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="text-sm text-gray-600 mb-3">
          {product.stockQuantity > 0 ? (
            <span className="text-green-600 font-medium">
              ✓ In Stock ({product.stockQuantity})
            </span>
          ) : (
            <span className="text-red-600 font-medium">✗ Out of Stock</span>
          )}
        </div>

        {/* Mobile Add to Cart Button (visible on mobile) */}
        <button
          onClick={handleAddToCart}
          disabled={!product.isActive || product.stockQuantity === 0 || isAddingToCart}
          className={`lg:hidden w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
            !product.isActive || product.stockQuantity === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {isAddingToCart ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </div>
          ) : !isAuthenticated ? (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Login to Add
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </button>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleLoginSuccess} />
      )}
      
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
    </div>
  );
}
