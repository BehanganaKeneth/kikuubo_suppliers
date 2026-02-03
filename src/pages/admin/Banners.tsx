import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('promotional_banners')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('promotional_banners')
          .insert(formData);

        if (error) throw error;
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        link: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
      });
      await loadBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    }
  };

  const editBanner = (banner: Banner) => {
    setEditingId(banner.id);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image_url: banner.image_url || '',
      link: banner.link || '',
      start_date: banner.start_date.split('T')[0],
      end_date: banner.end_date.split('T')[0],
      is_active: banner.is_active,
    });
    setShowForm(true);
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { error } = await supabase
        .from('promotional_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Promotional Banners</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              image_url: '',
              link: '',
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              is_active: true,
            });
            setShowForm(!showForm);
          }}
          className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          <Plus className="w-5 h-5" />
          <span>New Banner</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Link (Optional)</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
              />
            </div>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>Active</span>
            </label>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-white text-black py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                {editingId ? 'Update Banner' : 'Create Banner'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-800 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{banner.title}</h3>
                {banner.description && <p className="text-gray-400 mt-1">{banner.description}</p>}
                <div className="text-sm text-gray-500 mt-2">
                  {new Date(banner.start_date).toLocaleDateString()} -{' '}
                  {new Date(banner.end_date).toLocaleDateString()}
                </div>
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                    banner.is_active
                      ? 'bg-green-900/20 text-green-400'
                      : 'bg-red-900/20 text-red-400'
                  }`}
                >
                  {banner.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => editBanner(banner)}
                  className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteBanner(banner.id)}
                  className="p-2 bg-red-900/20 rounded hover:bg-red-900/30 transition text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
