import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, MapPin, Calendar, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { itemsApi, filesApi } from '../services/api';

export const ReportLostPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('WALLETS');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('11:00');

  // Location
  const [city, setCity] = useState('Gurugram');
  const [campus, setCampus] = useState('Cyber City');
  const [building, setBuilding] = useState('Tower A');
  const [floor, setFloor] = useState('3');
  const [areaDetails, setAreaDetails] = useState('');

  // Image upload
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');
    try {
      const res = await filesApi.uploadImage(file);
      if (res.data?.url) {
        setImageUrls((prev) => [...prev, res.data.url]);
      }
    } catch (err) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        location: {
          city,
          campus,
          building,
          floor,
          areaDetails,
        },
        imageUrls: imageUrls.length > 0 ? imageUrls : [
          'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80'
        ],
        eventDate,
        eventTime,
      };

      await itemsApi.createLostItem(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-posts');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit lost item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Explore
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report Lost Item</h1>
          <p className="text-xs text-slate-500 mt-1">
            Let the campus community and central desks know what you lost so it can be quickly returned when found.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Lost Item Reported!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your lost item report has been published to the Explore feed. You will be immediately notified when someone reports finding it.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Item Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Black Wallet, AirTags, Blue Umbrella"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                >
                  <option value="WALLETS">Wallets & Purses</option>
                  <option value="ELECTRONICS">Electronics (Phones, Laptops, Earphones)</option>
                  <option value="BAGS">Bags & Backpacks</option>
                  <option value="KEYS">Keys & Keychains</option>
                  <option value="DOCUMENTS_CARDS">Cards & Official IDs</option>
                  <option value="CLOTHING_ACCESSORIES">Clothing & Wearables</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Description *</label>
              <textarea
                rows="3"
                placeholder="Describe your missing belonging (color, brand, any unique marks)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Date Lost *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Approximate Time</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Where Was It Lost?
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Building *</label>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Floor</label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Area Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Conference Room 302, Washroom entrance"
                    value={areaDetails}
                    onChange={(e) => setAreaDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block">Photo of Item (Optional)</label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-3 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl cursor-pointer flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors bg-slate-50/50">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Reference Photo'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                </label>
                {imageUrls.map((url, i) => (
                  <div key={i} className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden">
                    <img src={url.startsWith('http') ? url : `http://localhost:8080${url}`} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Publishing Report...' : 'Publish Lost Item Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportLostPage;
