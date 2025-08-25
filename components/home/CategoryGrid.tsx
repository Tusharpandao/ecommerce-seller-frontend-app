import Link from 'next/link';
import { 
  Smartphone, 
  Shirt, 
  BookOpen, 
  Home, 
  Zap, 
  Heart,
  Camera,
  Gamepad2
} from 'lucide-react';

const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Latest gadgets and tech',
    icon: Smartphone,
    color: 'from-blue-500 to-blue-600',
    count: '150+ Products'
  },
  {
    id: 'clothing',
    name: 'Fashion',
    description: 'Trendy clothing & accessories',
    icon: Shirt,
    color: 'from-purple-500 to-purple-600',
    count: '200+ Products'
  },
  {
    id: 'books',
    name: 'Books',
    description: 'Knowledge & entertainment',
    icon: BookOpen,
    color: 'from-green-500 to-green-600',
    count: '500+ Products'
  },
  {
    id: 'home',
    name: 'Home & Garden',
    description: 'Make your home beautiful',
    icon: Home,
    color: 'from-orange-500 to-orange-600',
    count: '120+ Products'
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    description: 'Stay active and healthy',
    icon: Zap,
    color: 'from-red-500 to-red-600',
    count: '80+ Products'
  },
  {
    id: 'health',
    name: 'Health & Beauty',
    description: 'Wellness and self-care',
    icon: Heart,
    color: 'from-pink-500 to-pink-600',
    count: '90+ Products'
  },
  {
    id: 'photography',
    name: 'Photography',
    description: 'Capture perfect moments',
    icon: Camera,
    color: 'from-indigo-500 to-indigo-600',
    count: '60+ Products'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Entertainment & fun',
    icon: Gamepad2,
    color: 'from-yellow-500 to-yellow-600',
    count: '70+ Products'
  }
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.id}`}
          className="group block"
        >
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${category.color} p-6 text-white text-center`}>
              <category.icon className="w-12 h-12 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold mb-1">{category.name}</h3>
              <p className="text-sm opacity-90">{category.description}</p>
            </div>
            
            <div className="p-4 text-center">
              <div className="text-sm text-gray-600 mb-2">{category.count}</div>
              <div className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                Explore →
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
