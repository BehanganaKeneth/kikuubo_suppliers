import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types/database';
import { Filter, X } from 'lucide-react';

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');
  const [priceType, setPriceType] = useState<'retail' | 'wholesale'>('retail');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedOrigin, sortBy]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (selectedOrigin) {
        query = query.eq('origin', selectedOrigin);
      }

      const { data, error } = await query;

      if (error) throw error;

      let sortedProducts = data || [];

      if (sortBy === 'name') {
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'price-asc') {
        const priceField = priceType === 'retail' ? 'retail_price_ugx' : 'wholesale_price_ugx';
        sortedProducts.sort((a, b) => a[priceField] - b[priceField]);
      } else if (sortBy === 'price-desc') {
        const priceField = priceType === 'retail' ? 'retail_price_ugx' : 'wholesale_price_ugx';
        sortedProducts.sort((a, b) => b[priceField] - a[priceField]);
      }

      setProducts(sortedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const origins = [...new Set(products.map(p => p.origin).filter(Boolean))];

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Shop</h1>
          <p className="text-gray-400 text-center">Discover our premium collection</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-64 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </h2>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Price Type</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceType"
                        value="retail"
                        checked={priceType === 'retail'}
                        onChange={(e) => setPriceType(e.target.value as 'retail')}
                        className="text-white"
                      />
                      <span>Retail</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceType"
                        value="wholesale"
                        checked={priceType === 'wholesale'}
                        onChange={(e) => setPriceType(e.target.value as 'wholesale')}
                        className="text-white"
                      />
                      <span>Wholesale</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Category</h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Origin</h3>
                  <select
                    value={selectedOrigin}
                    onChange={(e) => setSelectedOrigin(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                  >
                    <option value="">All Origins</option>
                    {origins.map((origin) => (
                      <option key={origin} value={origin}>
                        {origin}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedOrigin('');
                    setPriceType('retail');
                  }}
                  className="w-full py-2 text-sm text-gray-400 hover:text-white transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>

              <div className="flex items-center space-x-4 ml-auto">
                <label className="text-sm text-gray-400">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                >
                  <option value="name">Name</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
                    <div className="bg-gray-800 h-64 rounded-lg mb-4"></div>
                    <div className="bg-gray-800 h-6 rounded mb-2"></div>
                    <div className="bg-gray-800 h-4 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const price = priceType === 'retail' ? product.retail_price_ugx : product.wholesale_price_ugx;
                  return (
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
                            <p className="text-sm text-gray-500">{priceType === 'retail' ? 'Retail' : 'Wholesale'}</p>
                            <p className="text-lg font-bold">
                              UGX {price.toLocaleString()}
                            </p>
                          </div>
                          <span className="text-sm text-gray-400">{product.origin}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
