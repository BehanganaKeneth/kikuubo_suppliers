import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CartItemWithProduct } from '../types/database';
import { CreditCard, MapPin, Package } from 'lucide-react';

export function Checkout() {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCodeId, setPromoCodeId] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Uganda');
  const [deliveryType, setDeliveryType] = useState<'free' | 'normal' | 'express'>('normal');
  const [paymentMethod, setPaymentMethod] = useState('mtn-momo');
  const [customerNotes, setCustomerNotes] = useState('');

  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadCart();
      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setCountry(profile.country || 'Uganda');
      }
    } else {
      navigate('/login');
    }
  }, [user, profile]);

  const loadCart = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (!data || data.length === 0) {
        navigate('/cart');
        return;
      }

      setCartItems(data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyPromoCode = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        alert('Invalid promo code');
        return;
      }

      const now = new Date();
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);

      if (now < startDate || now > endDate) {
        alert('This promo code has expired');
        return;
      }

      if (data.max_uses && data.current_uses >= data.max_uses) {
        alert('This promo code has reached its usage limit');
        return;
      }

      const subtotal = calculateSubtotal();
      let discount = 0;

      if (data.discount_type === 'percentage') {
        discount = (subtotal * data.discount_value) / 100;
      } else {
        discount = data.discount_value;
      }

      setPromoDiscount(discount);
      setPromoCodeId(data.id);
      alert('Promo code applied successfully!');
    } catch (error) {
      console.error('Error applying promo code:', error);
      alert('Failed to apply promo code');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price_type === 'retail'
        ? item.product.retail_price_ugx
        : item.product.wholesale_price_ugx;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateDeliveryFee = () => {
    if (deliveryType === 'free') return 0;
    if (country === 'Uganda') {
      const subtotal = calculateSubtotal();
      if (subtotal >= 500000) return 0;
      return 20000;
    }
    return deliveryType === 'express' ? 100000 : 50000;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = calculateDeliveryFee();
    return subtotal - promoDiscount + deliveryFee;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) return;
    setProcessing(true);

    try {
      const orderNumber = await generateOrderNumber();
      const subtotal = calculateSubtotal();
      const deliveryFee = calculateDeliveryFee();
      const total = calculateTotal();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          status: 'pending',
          currency: 'UGX',
          subtotal,
          discount_amount: promoDiscount,
          delivery_fee: deliveryFee,
          total_amount: total,
          promo_code_id: promoCodeId,
          payment_method: paymentMethod,
          payment_status: 'pending',
          delivery_type: deliveryType,
          delivery_address: {
            full_name: fullName,
            phone,
            address,
            city,
            country,
          },
          delivery_provider: country === 'Uganda' ? 'HDL' : 'FedEx',
          customer_notes: customerNotes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => {
        const price = item.price_type === 'retail'
          ? item.product.retail_price_ugx
          : item.product.wholesale_price_ugx;

        return {
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product.name,
          quantity: item.quantity,
          price_type: item.price_type,
          unit_price: price,
          subtotal: price * item.quantity,
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      if (promoCodeId) {
        const { error: promoError } = await supabase.rpc('increment', {
          table_name: 'promo_codes',
          row_id: promoCodeId,
          column_name: 'current_uses',
        });
        if (promoError) console.error('Error updating promo code usage:', promoError);
      }

      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (clearCartError) throw clearCartError;

      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const generateOrderNumber = async (): Promise<string> => {
    const { data } = await supabase.rpc('generate_order_number');
    return data || `KKB${Date.now()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">Checkout</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
                <MapPin className="w-6 h-6" />
                <span>Delivery Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Country *</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
                <Package className="w-6 h-6" />
                <span>Delivery Options</span>
              </h2>

              <div className="space-y-3">
                {country === 'Uganda' && calculateSubtotal() >= 500000 && (
                  <label className="flex items-center space-x-3 cursor-pointer p-4 bg-black rounded-lg border border-gray-800 hover:border-gray-700">
                    <input
                      type="radio"
                      name="delivery"
                      value="free"
                      checked={deliveryType === 'free'}
                      onChange={() => setDeliveryType('free')}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Free Delivery</div>
                      <div className="text-sm text-gray-400">Orders over UGX 500,000</div>
                    </div>
                    <div className="text-green-400 font-semibold">FREE</div>
                  </label>
                )}

                <label className="flex items-center space-x-3 cursor-pointer p-4 bg-black rounded-lg border border-gray-800 hover:border-gray-700">
                  <input
                    type="radio"
                    name="delivery"
                    value="normal"
                    checked={deliveryType === 'normal'}
                    onChange={() => setDeliveryType('normal')}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">Normal Delivery</div>
                    <div className="text-sm text-gray-400">5-7 business days</div>
                  </div>
                  <div className="font-semibold">
                    UGX {(country === 'Uganda' ? 20000 : 50000).toLocaleString()}
                  </div>
                </label>

                {country !== 'Uganda' && (
                  <label className="flex items-center space-x-3 cursor-pointer p-4 bg-black rounded-lg border border-gray-800 hover:border-gray-700">
                    <input
                      type="radio"
                      name="delivery"
                      value="express"
                      checked={deliveryType === 'express'}
                      onChange={() => setDeliveryType('express')}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Express Delivery</div>
                      <div className="text-sm text-gray-400">2-3 business days</div>
                    </div>
                    <div className="font-semibold">UGX 100,000</div>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
                <CreditCard className="w-6 h-6" />
                <span>Payment Method</span>
              </h2>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer p-4 bg-black rounded-lg border border-gray-800 hover:border-gray-700">
                  <input
                    type="radio"
                    name="payment"
                    value="mtn-momo"
                    checked={paymentMethod === 'mtn-momo'}
                    onChange={() => setPaymentMethod('mtn-momo')}
                  />
                  <span>MTN Mobile Money</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-4 bg-black rounded-lg border border-gray-800 hover:border-gray-700">
                  <input
                    type="radio"
                    name="payment"
                    value="airtel-momo"
                    checked={paymentMethod === 'airtel-momo'}
                    onChange={() => setPaymentMethod('airtel-momo')}
                  />
                  <span>Airtel Mobile Money</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-4 bg-black rounded-lg border border-gray-800 hover:border-gray-700">
                  <input
                    type="radio"
                    name="payment"
                    value="visa"
                    checked={paymentMethod === 'visa'}
                    onChange={() => setPaymentMethod('visa')}
                  />
                  <span>Visa</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-4 bg-black rounded-lg border border-gray-800 hover:border-gray-700">
                  <input
                    type="radio"
                    name="payment"
                    value="mastercard"
                    checked={paymentMethod === 'mastercard'}
                    onChange={() => setPaymentMethod('mastercard')}
                  />
                  <span>MasterCard</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                placeholder="Any special instructions for your order..."
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 sticky top-20">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cartItems.map((item) => {
                  const price = item.price_type === 'retail'
                    ? item.product.retail_price_ugx
                    : item.product.wholesale_price_ugx;

                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>UGX {(price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Promo Code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                    placeholder="Enter code"
                  />
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6 border-t border-gray-800 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>UGX {calculateSubtotal().toLocaleString()}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-UGX {promoDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery</span>
                  <span>
                    {calculateDeliveryFee() === 0
                      ? 'FREE'
                      : `UGX ${calculateDeliveryFee().toLocaleString()}`}
                  </span>
                </div>

                <div className="border-t border-gray-800 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>UGX {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-white text-black py-4 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
