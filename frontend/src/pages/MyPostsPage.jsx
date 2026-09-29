import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
  FileQuestion,
  Loader2,
  Trash2,
  Users
} from 'lucide-react';
import { itemsApi } from '../services/api';

export const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, FOUND, LOST

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await itemsApi.getMyPosts();
      setPosts(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this submission?')) return;
    try {
      await itemsApi.deleteItem(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete post.');
    }
  };

  const filtered = posts.filter((p) => {
    if (filterType === 'FOUND') return p.type === 'FOUND';
    if (filterType === 'LOST') return p.type === 'LOST';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
      
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Submissions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track all the lost items you've reported and found belongings you've submitted.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/report/found"
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Report Found
          </Link>
          <Link
            to="/report/lost"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <FileQuestion className="w-4 h-4 text-amber-400" /> Report Lost
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Posts ({posts.length})
        </button>
        <button
          onClick={() => setFilterType('FOUND')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'FOUND' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Found Items ({posts.filter((p) => p.type === 'FOUND').length})
        </button>
        <button
          onClick={() => setFilterType('LOST')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'LOST' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Lost Items ({posts.filter((p) => p.type === 'LOST').length})
        </button>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
          <span className="text-xs">Loading your posts...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-6">
          {error}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No posts yet</h3>
          <p className="text-xs text-slate-500">
            You haven't reported any lost or found items yet.
          </p>
        </div>
      )}

      {/* Posts List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isFound = item.type === 'FOUND';
            const defaultImg = isFound
              ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80'
              : 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80';
            const img = item.imageUrls && item.imageUrls.length > 0
              ? (item.imageUrls[0].startsWith('http') ? item.imageUrls[0] : `http://localhost:8080${item.imageUrls[0]}`)
              : defaultImg;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img src={img} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isFound ? 'bg-amber-100 text-amber-900' : 'bg-indigo-100 text-indigo-900'
                      }`}>
                        {item.type}
                      </span>

                      {/* Status Badges */}
                      {item.status === 'PENDING_ADMIN_APPROVAL' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" /> Pending Admin Approval
                        </span>
                      )}
                      {(item.status === 'APPROVED' || item.status === 'ACTIVE') && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Live on Explore
                        </span>
                      )}
                      {item.status === 'RETURNED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white">
                          Returned
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-500" /> Rejected
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.location?.building}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.eventDate}
                      </span>
                      {item.centralDropLocation?.name && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <Building2 className="w-3 h-3 text-amber-500" />
                            {item.centralDropLocation.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    to={`/items/${item.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    View
                  </Link>

                  {item.status !== 'RETURNED' && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MyPostsPage;
