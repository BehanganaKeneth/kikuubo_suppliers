import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, MessageCircle, Package } from 'lucide-react';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [priceType, setPriceType] = useState<'retail' | 'wholesale'>('retail');
  const [addingToCart, setAddingToCart] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product) return;

    setAddingToCart(true);

    try {
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .eq('price_type', priceType)
        .maybeSingle();

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity,
            price_type: priceType,
          });

        if (error) throw error;
      }

      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWhatsAppInquiry = () => {
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
    const message = `Hi, I'm interested in ${product?.name}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-400">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const price = priceType === 'retail' ? product.retail_price_ugx : product.wholesale_price_ugx;

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  No Image Available
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            {product.origin && (
              <div className="flex items-center space-x-2 text-gray-400 mb-4">
                <Package className="w-5 h-5" />
                <span>Origin: {product.origin}</span>
              </div>
            )}

            <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-800">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Price Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priceType"
                      value="retail"
                      checked={priceType === 'retail'}
                      onChange={() => setPriceType('retail')}
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
                      onChange={() => setPriceType('wholesale')}
                      className="text-white"
                    />
                    <span>Wholesale</span>
                  </label>
                </div>
              </div>

              <div className="text-3xl font-bold mb-4">
                UGX {price.toLocaleString()}
              </div>

              {product.stock_quantity > 0 ? (
                <p className="text-green-400">In Stock ({product.stock_quantity} available)</p>
              ) : (
                <p className="text-red-400">Out of Stock</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={product.stock_quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
              />
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || addingToCart}
                className="w-full flex items-center justify-center space-x-2 bg-white text-black py-4 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleWhatsAppInquiry}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Inquire on WhatsApp</span>
              </button>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-400 leading-relaxed">
                {product.description || 'No description available.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
