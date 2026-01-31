import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

export function Contact() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">Contact Us</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <div className="flex items-start space-x-4 mb-6">
                <MapPin className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Location</h3>
                  <p className="text-gray-400">
                    Kikuubo Business Center Lane<br />
                    Nakivuubo – Kampala<br />
                    Yunia House, Room Y04
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <div className="flex items-start space-x-4 mb-6">
                <Phone className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Phone</h3>
                  <p className="text-gray-400">
                    <a href="tel:0756208873" className="hover:text-white transition">
                      0756208873
                    </a>
                    <br />
                    <a href="tel:0772545119" className="hover:text-white transition">
                      0772545119 (Airtel - WhatsApp)
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <div className="flex items-start space-x-4 mb-6">
                <Mail className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Email</h3>
                  <p className="text-gray-400">
                    <a href="mailto:info@kikuubo.com" className="hover:text-white transition">
                      info@kikuubo.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <div className="flex items-start space-x-4 mb-6">
                <MessageCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Chat with us</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Business Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
              <div className="flex justify-between">
                <span>Monday - Friday:</span>
                <span className="font-semibold">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span className="font-semibold">9:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="font-semibold">Closed</span>
              </div>
              <div className="flex justify-between">
                <span>Public Holidays:</span>
                <span className="font-semibold">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
