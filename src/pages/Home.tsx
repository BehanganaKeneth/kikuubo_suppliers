import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types/database';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(6);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-5xl md:text-7xl font-bold tracking-wider">
              KIKUUBO
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mb-2 italic">
            Aesthetic • Elegant • Beauty
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover premium cosmetics and body supplements that enhance your natural beauty
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-200 transition-all transform hover:scale-105"
          >
            <span>Register to Shop</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-gray-400">Handpicked selections for you</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
                  <div className="bg-gray-800 h-64 rounded-lg mb-4"></div>
                  <div className="bg-gray-800 h-6 rounded mb-2"></div>
                  <div className="bg-gray-800 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all border border-gray-800 hover:border-gray-700"
                >
                  <div className="aspect-square bg-gray-800">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="text-lg font-bold">
                          UGX {product.retail_price_ugx.toLocaleString()}
                        </p>
                      </div>
                      <span className="text-sm text-gray-400">{product.origin}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No featured products available at the moment.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 border border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all"
            >
              <span>View All Products</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-400">
                Only the finest cosmetics and supplements from trusted sources
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-400">
                Quick and reliable shipping to your doorstep
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-400">
                Multiple payment options for your convenience
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
