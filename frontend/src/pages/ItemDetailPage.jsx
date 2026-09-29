import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  HelpCircle,
  Tag
} from 'lucide-react';
import { itemsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ClaimVerificationModal from '../components/items/ClaimVerificationModal';

export const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Claim modal state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // Found Match state for LOST items
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [matchDescription, setMatchDescription] = useState('');
  const [matchDesk, setMatchDesk] = useState('Tower B Ground Floor Reception');
  const [matchQuestions, setMatchQuestions] = useState([
    { id: 1, question: 'What is the color or specific brand of the item?', answer: '' },
    { id: 2, question: 'Any distinguishing sticker or keymark?', answer: '' },
    { id: 3, question: 'What is inside or attached to the item?', answer: '' },
    { id: 4, question: 'What condition was it found in?', answer: '' },
    { id: 5, question: 'Any unique accessory or pouch?', answer: '' },
  ]);
  const [submittingMatch, setSubmittingMatch] = useState(false);
  const [matchSuccess, setMatchSuccess] = useState(false);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await itemsApi.getItemById(id);
      setItem(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch item details.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchQuestionChange = (index, field, value) => {
    const updated = [...matchQuestions];
    updated[index][field] = value;
    setMatchQuestions(updated);
  };

  const handleFoundMatchSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmittingMatch(true);
    try {
      await itemsApi.reportFoundMatch(item.id, {
        description: matchDescription,
        centralDropLocation: {
          name: matchDesk,
          building: 'Campus',
          floor: 'Ground',
        },
        eventDate: new Date().toISOString().split('T')[0],
        eventTime: '12:00',
        verificationQuestions: matchQuestions.map((q, idx) => ({
          id: idx + 1,
          question: q.question.trim(),
          answer: q.answer.trim(),
        })),
      });

      setMatchSuccess(true);
      setTimeout(() => {
        navigate('/my-posts');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit found match response.');
    } finally {
      setSubmittingMatch(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <span className="text-xs">Loading item details...</span>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl">
          {error || 'Item not found.'}
        </div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  const isFound = item.type === 'FOUND';
  const defaultImage = isFound
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80'
    : 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80';

  const images = item.imageUrls && item.imageUrls.length > 0
    ? item.imageUrls.map((u) => (u.startsWith('http') ? u : `http://localhost:8080${u}`))
    : [defaultImage];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
      
      {/* Top back navigation */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Explore
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image Carousel (Screen #3 Mockup) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
              <img
                src={images[activeImageIndex]}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = defaultImage; }}
              />
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-amber-500 scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isFound
                    ? 'bg-amber-400 text-slate-950 border border-amber-300'
                    : 'bg-indigo-600 text-white border border-indigo-500'
                }`}>
                  {item.type}
                </span>

                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {item.status}
                </span>

                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  {item.category?.replace('_', ' ')}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {item.title}
              </h1>

              {/* Location and Date */}
              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    {item.location?.building}
                    {item.location?.floor && ` • Floor ${item.location.floor}`}
                    {item.location?.areaDetails && ` • ${item.location.areaDetails}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{isFound ? 'Found' : 'Lost'} on: {item.eventDate} {item.eventTime && `at ${item.eventTime}`}</span>
                </div>

                {item.centralDropLocation?.name && (
                  <div className="flex items-center gap-2 pt-1 font-semibold text-slate-800">
                    <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Central Desk: {item.centralDropLocation.name}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white">
                  {item.description}
                </p>
              </div>

            </div>

            {/* ACTION CARD (Matching Screen #3 Mockup) */}
            <div className="pt-6 border-t border-slate-100">
              
              {isFound ? (
                <div>
                  {item.canClaim ? (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            navigate('/login');
                            return;
                          }
                          setIsClaimModalOpen(true);
                        }}
                        className="w-full py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                      >
                        <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                        Claim This Item
                      </button>
                      <p className="text-[11px] text-slate-600 text-center flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Answer 5 verification questions to verify ownership and start a private chat with finder.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                      <p className="text-xs font-semibold text-slate-700">
                        {item.isOwnerOrFinder ? 'You submitted this found item.' : 'This item is currently not available for claims.'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Physical item stored at: {item.centralDropLocation?.name || 'Reception desk'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Lost Item Action */
                <div className="space-y-3">
                  {!item.isOwnerOrFinder && (
                    <>
                      {!showMatchForm ? (
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              navigate('/login');
                              return;
                            }
                            setShowMatchForm(true);
                          }}
                          className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          I Found This Item!
                        </button>
                      ) : (
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                              Submit Found Match Report
                            </h4>
                            <button onClick={() => setShowMatchForm(false)} className="text-xs text-slate-400 hover:text-slate-600">
                              Cancel
                            </button>
                          </div>

                          <form onSubmit={handleFoundMatchSubmit} className="space-y-3">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Found Details *</label>
                              <textarea
                                rows="2"
                                placeholder="Describe where and when you found it..."
                                value={matchDescription}
                                onChange={(e) => setMatchDescription(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Central Drop Location *</label>
                              <select
                                value={matchDesk}
                                onChange={(e) => setMatchDesk(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                                required
                              >
                                <option value="Tower B Ground Floor Reception">Tower B Ground Floor Reception</option>
                                <option value="Tower A Security Desk">Tower A Security Desk</option>
                                <option value="Main Library Help Desk">Main Library Help Desk</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[11px] font-semibold text-slate-700 block">5 Verification Questions & Answers</label>
                              {matchQuestions.map((q, idx) => (
                                <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                                  <input
                                    type="text"
                                    placeholder={`Question ${idx + 1}`}
                                    value={q.question}
                                    onChange={(e) => handleMatchQuestionChange(idx, 'question', e.target.value)}
                                    className="w-full text-xs font-medium border-b pb-1 focus:outline-none"
                                    required
                                  />
                                  <input
                                    type="text"
                                    placeholder="Correct Answer (Will be hashed)"
                                    value={q.answer}
                                    onChange={(e) => handleMatchQuestionChange(idx, 'answer', e.target.value)}
                                    className="w-full text-xs bg-amber-50/50 px-2 py-1 rounded-md text-slate-800"
                                    required
                                  />
                                </div>
                              ))}
                            </div>

                            <button
                              type="submit"
                              disabled={submittingMatch}
                              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              {submittingMatch && <Loader2 className="w-4 h-4 animate-spin" />}
                              Submit Match for Admin Review
                            </button>
                          </form>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>
      </div>

      {/* Claim verification modal */}
      <ClaimVerificationModal
        item={item}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />

    </div>
  );
};

export default ItemDetailPage;
