import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react';

export function Account() {
  const { profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [country, setCountry] = useState(profile?.country || 'Uganda');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await updateProfile({
      full_name: fullName,
      phone,
      country,
    });

    if (error) {
      setMessage('Failed to update profile');
    } else {
      setMessage('Profile updated successfully!');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">My Account</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile?.full_name || 'User'}</h2>
                <p className="text-gray-400">{profile?.email}</p>
              </div>
            </div>

            {message && (
              <div className={`mb-6 px-4 py-3 rounded ${
                message.includes('success')
                  ? 'bg-green-900/20 border border-green-900 text-green-400'
                  : 'bg-red-900/20 border border-red-900 text-red-400'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
