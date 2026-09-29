import React, { useState } from 'react';
import { X, Heart, Award, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardsApi } from '../../services/api';

export const RewardModal = ({ claim, isOpen, onClose, onRewardProcessed }) => {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('Thank you so much for returning my belonging safely!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !claim) return null;

  const presetAmounts = [50, 100, 200, 500];

  const handleReward = async (isSkip = false) => {
    setLoading(true);
    setError('');

    const amount = isSkip ? 0 : (customAmount ? parseFloat(customAmount) : selectedAmount);

    try {
      await rewardsApi.processReward({
        claimId: claim.id,
        amount: isSkip ? null : amount,
        skipReward: isSkip,
        thankYouMessage: message,
      });

      setSuccess(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });

      setTimeout(() => {
        onClose();
        if (onRewardProcessed) onRewardProcessed();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to process reward.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-500">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Thank the Finder</h2>
              <p className="text-[11px] text-slate-500">Encourage community honesty with a small token of gratitude</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {success ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">Gratitude Sent!</h3>
              <p className="text-xs text-slate-500">
                The finder has been notified and awarded community gratitude. Thank you for making our campus better!
              </p>
            </div>
          ) : (
            <>
              {/* Preset Buttons */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Select Reward Amount</label>
                <div className="grid grid-cols-4 gap-2">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedAmount === amt && !customAmount
                          ? 'bg-amber-400 border-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Or Enter Custom Amount (₹)</label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  placeholder="e.g. 250"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Note to Finder (Optional)</label>
                <textarea
                  rows="2"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>If skipped, the finder is still awarded <strong>+10 Karma Points</strong> for their honesty!</span>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleReward(true)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Skip (Award Karma Only)
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleReward(false)}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send ₹{customAmount || selectedAmount}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default RewardModal;
