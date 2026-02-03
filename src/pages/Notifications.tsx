import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Bell } from 'lucide-react';

interface NotificationPreferences {
  id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  order_updates: boolean;
  promotions: boolean;
}

export function Notifications() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            email_notifications: true,
            sms_notifications: true,
            order_updates: true,
            promotions: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newPrefs);
      } else {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: keyof NotificationPreferences) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        [field]: !preferences[field],
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!preferences) return;

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          email_notifications: preferences.email_notifications,
          sms_notifications: preferences.sms_notifications,
          order_updates: preferences.order_updates,
          promotions: preferences.promotions,
        })
        .eq('id', preferences.id);

      if (error) throw error;
      setMessage('Preferences updated successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Failed to update preferences');
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-4xl md:text-5xl font-bold text-center">Notification Preferences</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            {message && (
              <div className={`mb-6 px-4 py-3 rounded ${
                message.includes('successfully')
                  ? 'bg-green-900/20 border border-green-900 text-green-400'
                  : 'bg-red-900/20 border border-red-900 text-red-400'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-t border-gray-800 pt-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  <span>Communication Preferences</span>
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center space-x-4 p-4 bg-black rounded-lg border border-gray-800 hover:border-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences?.email_notifications || false}
                      onChange={() => handleToggle('email_notifications')}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">Email Notifications</p>
                      <p className="text-sm text-gray-400">Receive updates via email</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-4 p-4 bg-black rounded-lg border border-gray-800 hover:border-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences?.sms_notifications || false}
                      onChange={() => handleToggle('sms_notifications')}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">SMS Notifications</p>
                      <p className="text-sm text-gray-400">Receive updates via SMS</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-semibold mb-4">Notification Types</h3>

                <div className="space-y-4">
                  <label className="flex items-center space-x-4 p-4 bg-black rounded-lg border border-gray-800 hover:border-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences?.order_updates || false}
                      onChange={() => handleToggle('order_updates')}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">Order Updates</p>
                      <p className="text-sm text-gray-400">
                        Order confirmation, dispatch, and delivery status
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-4 p-4 bg-black rounded-lg border border-gray-800 hover:border-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences?.promotions || false}
                      onChange={() => handleToggle('promotions')}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">Promotions & Offers</p>
                      <p className="text-sm text-gray-400">
                        New products, discounts, and special offers
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
