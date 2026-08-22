import React, { useState } from 'react';
import reviewApi from '../../services/reviewApi';

// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — START =====
const ScorePicker = ({ label, value, onChange }) => (
  <div>
    <p className="mb-2 text-sm font-semibold text-slate-700">{label}</p>
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          className={`h-9 w-9 rounded-full text-sm font-semibold ${
            value === score
              ? 'bg-amber-500 text-white'
              : 'border border-gray-200 bg-white text-slate-600 hover:bg-amber-50'
          }`}
        >
          {score}
        </button>
      ))}
    </div>
  </div>
);

const RateDealModal = ({ deal, onClose, onSubmitted }) => {
  const [reliabilityScore, setReliabilityScore] = useState(0);
  const [communicationScore, setCommunicationScore] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const counterpart =
    deal?.sponsorId?.organizationName ||
    deal?.sponsorId?.name ||
    deal?.organizerId?.organizationName ||
    deal?.organizerId?.name ||
    'your partner';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!reliabilityScore || !communicationScore) {
      setError('Rate both reliability and communication (1–5).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await reviewApi.createReview({
        proposalId: deal._id,
        reliabilityScore,
        communicationScore,
        comment,
      });
      onSubmitted?.(deal._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold text-slate-900">Rate this deal</h2>
        <p className="mt-1 text-sm text-slate-500">
          How was working with {counterpart} on {deal?.eventId?.name || 'this event'}?
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <ScorePicker label="Reliability" value={reliabilityScore} onChange={setReliabilityScore} />
          <ScorePicker label="Communication" value={communicationScore} onChange={setCommunicationScore} />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={2000}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="What went well, or what could be better next time?"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
            >
              Later
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateDealModal;
// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — END =====
