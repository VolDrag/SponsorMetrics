import React, { useEffect, useState } from 'react';
import reviewApi from '../../services/reviewApi';
import RateDealModal from './RateDealModal';

// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — START =====
const RateDealBanner = () => {
  const [pending, setPending] = useState([]);
  const [activeDeal, setActiveDeal] = useState(null);

  const load = async () => {
    try {
      const res = await reviewApi.getPending();
      setPending(res.data.data || []);
    } catch {
      setPending([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!pending.length) return null;

  const first = pending[0];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-amber-900">Rate this deal</p>
          <p className="text-sm text-amber-800">
            {first.eventId?.name || 'A closed sponsorship'} is ready for a reliability and communication rating.
            {pending.length > 1 ? ` (${pending.length} waiting)` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveDeal(first)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          Rate now
        </button>
      </div>
      {activeDeal && (
        <RateDealModal
          deal={activeDeal}
          onClose={() => setActiveDeal(null)}
          onSubmitted={(id) => {
            setPending((rows) => rows.filter((row) => row._id !== id));
            setActiveDeal(null);
          }}
        />
      )}
    </>
  );
};

export default RateDealBanner;
// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — END =====
