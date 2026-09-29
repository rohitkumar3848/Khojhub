import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  MessageSquare,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Heart,
  QrCode,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { claimsApi } from '../services/api';
import RewardModal from '../components/items/RewardModal';

export const MyClaimsPage = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reward modal
  const [selectedClaimForReward, setSelectedClaimForReward] = useState(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  useEffect(() => {
    fetchMyClaims();
  }, []);

  const fetchMyClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimsApi.getMyClaims();
      setClaims(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your claims.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Ownership Claims</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your 5-question verification scores, active private chats, and central desk pickup codes.
        </p>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
          <span className="text-xs">Loading claims...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-6">
          {error}
        </div>
      )}

      {!loading && claims.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-3">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No claims yet</h3>
          <p className="text-xs text-slate-500">
            You haven't claimed any found items yet. If you see your lost belonging on the Explore feed, click "Claim This Item".
          </p>
          <Link
            to="/explore"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold"
          >
            Explore Found Items
          </Link>
        </div>
      )}

      {!loading && claims.length > 0 && (
        <div className="space-y-4">
          {claims.map((claim) => {
            const isConfirmed = claim.status === 'CONFIRMED_BY_FINDER' || claim.status === 'READY_FOR_PICKUP';
            const isReturned = claim.status === 'COMPLETED';
            const hasChat = claim.conversationId && (claim.status === 'CHAT_ACTIVE' || claim.status === 'QUIZ_PASSED' || isConfirmed || isReturned);

            return (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-slate-300 transition-all"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src={claim.itemImageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80'}
                      alt={claim.itemTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-sm">{claim.itemTitle}</h3>

                      {/* Score Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${claim.score >= 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                        Score: {claim.score}/5
                      </span>

                      {/* Status */}
                      {claim.status === 'QUIZ_FAILED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-500" /> Quiz Failed
                        </span>
                      )}
                      {(claim.status === 'QUIZ_PASSED' || claim.status === 'CHAT_ACTIVE') && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-blue-500" /> Chat Active
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" /> Confirmed by Finder
                        </span>
                      )}
                      {isReturned && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Returned Successfully
                        </span>
                      )}
                    </div>

                    {/* Central Desk */}
                    {claim.itemDropLocation && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        Custody: {claim.itemDropLocation}
                      </p>
                    )}

                    {/* Pickup Reference Code Box */}
                    {claim.pickupReferenceCode && (
                      <div className="mt-2 inline-flex items-center gap-2 bg-amber-50 border border-amber-300/80 px-3 py-1.5 rounded-xl">
                        <QrCode className="w-4 h-4 text-amber-700" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-800 block">Pickup Reference Code</span>
                          <span className="font-mono text-xs font-extrabold text-slate-950 tracking-wider">
                            {claim.pickupReferenceCode}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                  {hasChat && (
                    <Link
                      to={`/chats/${claim.conversationId}`}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      Open Chat
                    </Link>
                  )}

                  {isReturned && (
                    <button
                      onClick={() => {
                        setSelectedClaimForReward(claim);
                        setIsRewardModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      Thank Finder
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Reward Modal */}
      <RewardModal
        claim={selectedClaimForReward}
        isOpen={isRewardModalOpen}
        onClose={() => {
          setIsRewardModalOpen(false);
          setSelectedClaimForReward(null);
        }}
        onRewardProcessed={fetchMyClaims}
      />

    </div>
  );
};

export default MyClaimsPage;
