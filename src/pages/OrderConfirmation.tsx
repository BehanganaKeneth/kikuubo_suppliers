import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { OrderWithItems } from '../types/database';
import { CheckCircle, Package, Download } from 'lucide-react';

export function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      setOrder({ ...orderData, items: itemsData });
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <Link to="/shop" className="text-gray-400 hover:text-white">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-gray-400">Thank you for your purchase</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 mb-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Order Number</p>
                <p className="text-xl font-bold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Order Date</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Payment Method</p>
                <p className="font-semibold capitalize">
                  {order.payment_method.replace('-', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                <p className="text-xl font-bold">
                  {order.currency} {order.total_amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Delivery Information</span>
              </h3>
              <div className="text-gray-400">
                <p>{order.delivery_address.full_name}</p>
                <p>{order.delivery_address.phone}</p>
                <p>{order.delivery_address.address}</p>
                <p>
                  {order.delivery_address.city}, {order.delivery_address.country}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 mt-6">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-400">
                      {item.product_name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {order.currency} {item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition border border-gray-800">
              <Download className="w-5 h-5" />
              <span>Download Receipt</span>
            </button>
            <Link
              to="/orders"
              className="flex-1 text-center bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              View All Orders
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link to="/shop" className="text-gray-400 hover:text-white transition">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
