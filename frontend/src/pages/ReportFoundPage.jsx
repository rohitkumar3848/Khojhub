import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Building2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { itemsApi, filesApi } from '../services/api';

export const ReportFoundPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ELECTRONICS');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('14:00');

  // Location
  const [city, setCity] = useState('Gurugram');
  const [campus, setCampus] = useState('Cyber City');
  const [building, setBuilding] = useState('Tower B');
  const [floor, setFloor] = useState('4');
  const [areaDetails, setAreaDetails] = useState('');

  // Central Drop Location
  const [dropLocationName, setDropLocationName] = useState('Tower B Ground Floor Reception');
  const [dropInstructions, setDropInstructions] = useState('Submitted to security reception desk on Ground Floor.');

  // Image upload
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Exactly 5 verification questions with correct answers
  const [questions, setQuestions] = useState([
    { id: 1, question: 'What is the lock screen wallpaper?', answer: '' },
    { id: 2, question: 'What color is the phone / item case?', answer: '' },
    { id: 3, question: 'What is the bluetooth device name first letter?', answer: '' },
    { id: 4, question: 'Any scratch or distinguishing mark on the item?', answer: '' },
    { id: 5, question: 'Which charger brand or accessory is with it?', answer: '' },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

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
      setError(err.message || 'Image upload failed. Only jpg, png up to 10MB are supported.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate 5 questions
    if (questions.length !== 5) {
      setError('You must provide exactly 5 verification questions.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim() || !questions[i].answer.trim()) {
        setError(`Please provide both question text and correct answer for Question #${i + 1}.`);
        return;
      }
    }

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
          'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80'
        ],
        centralDropLocation: {
          name: dropLocationName,
          building,
          floor: 'Ground',
          roomOrDesk: 'Security Desk',
          instructions: dropInstructions,
        },
        eventDate,
        eventTime,
        verificationQuestions: questions.map((q, idx) => ({
          id: idx + 1,
          question: q.question.trim(),
          answer: q.answer.trim(),
        })),
      };

      await itemsApi.createFoundItem(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-posts');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit found item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">

      {/* Top back button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Explore
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">

        {/* Title */}
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Report Found Item
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide accurate details to help the rightful owner claim it. Physical items must be deposited at a central reception/security desk.
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
            <h2 className="text-xl font-bold text-slate-900">Found Item Submitted!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your submission has been queued for admin approval with status <strong>Pending Admin Approval</strong>. Once verified, it will be published to the Explore feed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 1. Item Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Item Title *</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 14, Black Leather Wallet"
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
                  <option value="ELECTRONICS">Electronics (Phones, Laptops, Earphones)</option>
                  <option value="WALLETS">Wallets & Purses</option>
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
                placeholder="Add general description without giving away exact secret verification answers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                required
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Found Date *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Found Time (Approx.)</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Location Found */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                Found Location Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Building/Tower *</label>
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
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Area / Room Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Cafeteria near snack rack, Table 4"
                    value={areaDetails}
                    onChange={(e) => setAreaDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Central Custody Drop Location */}
            <div className="space-y-3 pt-2 border-t border-slate-100 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                Physical Item Central Custody Location *
              </h3>
              <p className="text-[11px] text-slate-600">
                You must hand over the physical item to a verified reception desk or security post for safe storage.
              </p>
              <div>
                <select
                  value={dropLocationName}
                  onChange={(e) => setDropLocationName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                >
                  <option value="Tower B Ground Floor Reception">Tower B Ground Floor Reception</option>
                  <option value="Tower A Security Desk">Tower A Security Desk</option>
                  <option value="Main Campus Admin Office">Main Campus Admin Office</option>
                  <option value="Main Library Help Desk">Main Library Help Desk</option>
                  <option value="Cafeteria Lost & Found Box">Cafeteria Lost & Found Box</option>
                </select>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block">Item Image</label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-3 border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl cursor-pointer flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-amber-600 transition-colors bg-slate-50/50">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Image (PNG, JPG)'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                </label>
                {imageUrls.map((url, i) => (
                  <div key={i} className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden relative group">
                    <img src={url.startsWith('http') ? url : `http://localhost:8080${url}`} alt="Item preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* 5 VERIFICATION QUESTIONS (Matching Mockup Screen 2) */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    5 Verification Questions *
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Provide exactly 5 ownership verification questions and their correct answers. Correct answers will be <strong>hashed and never revealed</strong> publicly.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                  5 of 5
                </span>
              </div>

              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Verification Question #${idx + 1}`}
                        value={q.question}
                        onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-1 focus:ring-amber-500 bg-white"
                        required
                      />
                    </div>
                    <div className="pl-8">
                      <input
                        type="text"
                        placeholder="Correct Answer (Will be securely hashed & hidden)"
                        value={q.answer}
                        onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-amber-200/90 text-xs bg-amber-50/50 focus:ring-1 focus:ring-amber-500 placeholder:text-amber-700/50 text-slate-900"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Submitting to Admin...' : 'Submit for Admin Approval'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default ReportFoundPage;
