import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { claimsApi } from '../../services/api';

export const ClaimVerificationModal = ({ item, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !item) return null;

  const questions = item.verificationQuestions || [];

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setResult(null);

    // Ensure all 5 questions have answers
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || '',
    }));

    const missing = formattedAnswers.some((a) => !a.answer.trim());
    if (missing) {
      setErrorMessage('Please answer all 5 questions before submitting verification.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await claimsApi.submitClaim(item.id, { answers: formattedAnswers });
      const claimData = response.data;
      setResult(claimData);

      if (claimData.score >= 3) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Redirect to chat after 1.5 seconds
        setTimeout(() => {
          onClose();
          if (claimData.conversationId) {
            navigate(`/chats/${claimData.conversationId}`);
          } else {
            navigate('/my-claims');
          }
        }, 1600);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit ownership claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Verify Ownership
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Answer at least <span className="font-semibold text-amber-600">3 out of 5</span> questions correctly to verify that this item belongs to you.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* Item Overview Mini Badge */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-200/50 flex items-center justify-center overflow-hidden shrink-0">
              {item.imageUrls && item.imageUrls[0] ? (
                <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">{item.title}</p>
              <p className="text-[11px] text-slate-500">{item.location?.building || 'Campus'} • Found by {item.finderName || 'Good Samaritan'}</p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success or Failure Result Banner */}
          {result && (
            <div className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${result.score >= 3
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
              {result.score >= 3 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {result.score >= 3 ? 'Ownership Verification Passed!' : 'Verification Failed'}
                </p>
                <p className="mt-1">
                  You scored <span className="font-bold">{result.score}/5</span>.
                  {result.score >= 3
                    ? ' Establishing direct private chat with the finder...'
                    : ' You did not meet the 3/5 passing threshold. You can review your details and attempt claiming again later.'}
                </p>
              </div>
            </div>
          )}

          {/* 5 Questions Inputs */}
          <form id="quiz-form" onSubmit={handleSubmit} className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id || idx} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>
                    <span className="text-amber-600 font-bold mr-1.5">Q{idx + 1}.</span>
                    {q.question}
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  disabled={submitting || (result && result.score >= 3)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs text-slate-900 bg-white placeholder:text-slate-400 disabled:bg-slate-50 transition-all"
                  required
                />
              </div>
            ))}
          </form>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          {(!result || result.score < 3) && (
            <button
              type="submit"
              form="quiz-form"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-sm shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Evaluating Answers...' : 'Submit Answers'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ClaimVerificationModal;
