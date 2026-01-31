import { Sparkles, Package, Heart } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">About Us</h1>
          <p className="text-gray-400 text-center italic">Aesthetic • Elegant • Beauty</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <p className="text-xl text-gray-300 leading-relaxed">
              Welcome to Kikuubo Suppliers, your premier destination for quality cosmetics
              and body supplements. Located in the heart of Kampala at Kikuubo Business
              Center Lane, we are committed to bringing you the finest beauty products
              from around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-400">
                We source only the finest products from trusted suppliers worldwide
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                <Package className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-400">
                Quick and reliable shipping to Uganda and international destinations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                <Heart className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer First</h3>
              <p className="text-gray-400">
                Your satisfaction is our top priority, always
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Founded with a passion for beauty and wellness, Kikuubo Suppliers has grown
              to become a trusted name in quality cosmetics and supplements. We believe
              that everyone deserves access to premium beauty products that enhance their
              natural beauty and boost their confidence.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Our team carefully curates each product in our collection, ensuring that
              every item meets our high standards for quality, safety, and effectiveness.
              Whether you're looking for skincare, makeup, or wellness supplements, we're
              here to help you find the perfect products for your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
