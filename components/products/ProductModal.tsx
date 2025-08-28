import { Product } from '@/lib/types';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  if (!isOpen) return null;

  // Parse dimensions if it's a string
  const dimensions = product.dimensions ? JSON.parse(product.dimensions) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
            <p className="text-sm text-gray-500">Brand: {product.brand}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div className="relative h-80 rounded-lg overflow-hidden">
              <Image
                src={product.thumbnail || '/placeholder-product.svg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images?.map((image) => (
                <div key={image.id} className="relative h-20 rounded-lg overflow-hidden">
                  <Image
                    src={image.imageUrl}
                    alt={image.altText || product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Regular Price</h3>
                <p className="text-gray-600">${product.price.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Sale Price</h3>
                <p className="text-gray-600">${product.salePrice.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Stock</h3>
                <p className="text-gray-600">{product.stockQuantity} units</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Discount</h3>
                <p className="text-gray-600">{product.discountPercentage}% off</p>
              </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">SKU</h3>
                <p className="text-gray-600">{product.sku}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Barcode</h3>
                <p className="text-gray-600">{product.barcode}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Weight</h3>
                <p className="text-gray-600">{product.weight}g</p>
              </div>
              {dimensions && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Dimensions</h3>
                  <p className="text-gray-600">
                    {dimensions.width}W x {dimensions.height}H x {dimensions.depth}D cm
                  </p>
                </div>
              )}
            </div>

            {/* Category & Tags */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Category</h3>
              <p className="text-gray-600 mb-2">{product.category?.name}</p>
              {product.tags && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping & Warranty */}
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Shipping Information</h3>
                <p className="text-gray-600">{product.shippingInformation}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Warranty</h3>
                <p className="text-gray-600">{product.warrantyInformation}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Return Policy</h3>
                <p className="text-gray-600">{product.returnPolicy}</p>
              </div>
            </div>

            {/* Rating & Reviews */}
            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(product.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Seller Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Seller Information</h3>
              <p className="text-gray-600">
                {product.seller?.firstName} {product.seller?.lastName}
              </p>
              <p className="text-gray-600">{product.seller?.email}</p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  product.isFeatured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {product.isFeatured ? 'Featured' : 'Not Featured'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
