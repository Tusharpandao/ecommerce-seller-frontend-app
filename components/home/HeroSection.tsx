import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing
            <span className="block text-yellow-300">Products</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
            Shop the latest trends with confidence. Quality products, secure payments, 
            and fast delivery - all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/products"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2 group"
            >
              <ShoppingBag className="w-6 h-6" />
              Shop Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/register"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Join Now
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">10K+</div>
              <div className="text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">500+</div>
              <div className="text-blue-100">Products Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">24/7</div>
              <div className="text-blue-100">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
}
