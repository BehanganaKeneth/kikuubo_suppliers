import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <header className="bg-black text-white border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold tracking-wider">
              KIKUUBO
            </div>
            <div className="hidden sm:block text-xs text-gray-400 italic">
              Aesthetic • Elegant • Beauty
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-gray-300 transition">Home</Link>
            <Link to="/shop" className="hover:text-gray-300 transition">Shop</Link>
            <Link to="/about" className="hover:text-gray-300 transition">About</Link>
            <Link to="/contact" className="hover:text-gray-300 transition">Contact</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="hover:text-gray-300 transition relative">
              <ShoppingCart className="w-6 h-6" />
            </Link>

            {user ? (
              <div className="relative group">
                <button className="hover:text-gray-300 transition flex items-center space-x-2">
                  <User className="w-6 h-6" />
                  <span className="hidden sm:inline text-sm">{profile?.full_name || 'Account'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/account" className="block px-4 py-2 hover:bg-gray-800 transition">
                    My Account
                  </Link>
                  <Link to="/orders" className="block px-4 py-2 hover:bg-gray-800 transition">
                    My Orders
                  </Link>
                  {profile?.is_admin && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-gray-800 transition text-yellow-400">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 hover:bg-gray-800 transition flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hover:text-gray-300 transition flex items-center space-x-2">
                <User className="w-6 h-6" />
                <span className="hidden sm:inline text-sm">Login</span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden hover:text-gray-300 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-800">
            <Link
              to="/"
              className="block py-2 hover:text-gray-300 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="block py-2 hover:text-gray-300 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="block py-2 hover:text-gray-300 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block py-2 hover:text-gray-300 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
