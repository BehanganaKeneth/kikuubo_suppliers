import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'completed');

      const revenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        pendingOrders: pendingCount || 0,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your e-commerce platform</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold">{stats.totalProducts}</span>
            </div>
            <h3 className="text-gray-400">Total Products</h3>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold">{stats.totalOrders}</span>
            </div>
            <h3 className="text-gray-400">Total Orders</h3>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold">{stats.pendingOrders}</span>
            </div>
            <h3 className="text-gray-400">Pending Orders</h3>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold">
                UGX {stats.totalRevenue.toLocaleString()}
              </span>
            </div>
            <h3 className="text-gray-400">Total Revenue</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/products"
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition"
          >
            <Package className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Products</h3>
            <p className="text-gray-400">Manage your product catalog</p>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition"
          >
            <ShoppingCart className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Orders</h3>
            <p className="text-gray-400">View and manage orders</p>
          </Link>

          <Link
            to="/admin/categories"
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition"
          >
            <Package className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Categories</h3>
            <p className="text-gray-400">Manage product categories</p>
          </Link>

          <Link
            to="/admin/promo-codes"
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition"
          >
            <DollarSign className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Promo Codes</h3>
            <p className="text-gray-400">Create and manage promo codes</p>
          </Link>

          <Link
            to="/admin/discounts"
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition"
          >
            <DollarSign className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Seasonal Discounts</h3>
            <p className="text-gray-400">Manage seasonal promotions</p>
          </Link>

          <Link
            to="/admin/banners"
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition"
          >
            <Package className="w-12 h-12 text-pink-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Promotional Banners</h3>
            <p className="text-gray-400">Create and manage banners</p>
          </Link>

          <Link
            to="/admin/reports"
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition"
          >
            <Users className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Reports</h3>
            <p className="text-gray-400">View sales and analytics</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
