import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import reviewApi from '../../services/reviewApi';
import { useAuth } from '../../context/AuthContext';

// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — START =====
const ScoreCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-bold text-slate-900">{Number(value || 0).toFixed(1)}<span className="text-sm font-medium text-slate-400"> / 5</span></p>
  </div>
);

const PublicProfile = () => {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await reviewApi.getUserReviews(userId);
        setProfile(res.data.data.user);
        setScores(res.data.data.scores);
        setReviews(res.data.data.reviews || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const backTo = me?.role === 'sponsor' ? '/sponsor/discovery' : '/organizer/events';

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <Link to={backTo} className="mb-4 inline-flex text-sm text-slate-500 hover:text-slate-800">
          ← Back
        </Link>

        {loading && (
          <div className="flex h-40 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-amber-500" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!loading && profile && (
          <>
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{profile.role}</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {profile.organizationName || profile.name}
              </h1>
              {profile.organizationName && (
                <p className="text-sm text-slate-500">{profile.name}</p>
              )}
              <p className="mt-2 text-sm text-slate-600">
                {[profile.industry, profile.organizationType, profile.budgetTier]
                  .filter(Boolean)
                  .join(' · ') || 'Public credibility profile'}
              </p>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              <ScoreCard label="Reliability" value={scores?.avgReliability} />
              <ScoreCard label="Communication" value={scores?.avgCommunication} />
              <ScoreCard label="Reviews" value={scores?.reviewCount} />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Received reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-slate-500">No written reviews yet.</p>
              ) : (
                <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                  {reviews.map((review) => (
                    <article key={review._id} className="rounded-lg border border-gray-100 bg-slate-50 p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {review.reviewerId?.organizationName || review.reviewerId?.name || 'Partner'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600">
                        Reliability {review.reliabilityScore}/5 · Communication {review.communicationScore}/5
                      </p>
                      {review.comment && (
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">{review.comment}</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PublicProfile;
// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — END =====
