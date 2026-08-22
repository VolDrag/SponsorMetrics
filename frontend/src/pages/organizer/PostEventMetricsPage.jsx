import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import analyticsApi from '../../services/analyticsApi';

// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — START =====
const emptyForm = { totalReach: '', totalEngagement: '', attendeeCount: '' };

const PostEventMetricsPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [rows, setRows] = useState([]);
  const [forms, setForms] = useState({});
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await analyticsApi.getEventMetrics(eventId);
      setEvent(res.data.data.event);
      setRows(res.data.data.rows || []);
      const nextForms = {};
      (res.data.data.rows || []).forEach((row) => {
        nextForms[row.proposal._id] = {
          totalReach: row.metrics?.totalReach ?? '',
          totalEngagement: row.metrics?.totalEngagement ?? '',
          attendeeCount: row.metrics?.attendeeCount ?? '',
        };
      });
      setForms(nextForms);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const handleChange = (proposalId, field, value) => {
    setForms((prev) => ({
      ...prev,
      [proposalId]: { ...(prev[proposalId] || emptyForm), [field]: value },
    }));
  };

  const handleSubmit = async (proposalId) => {
    setSavingId(proposalId);
    setError('');
    setMessage('');
    try {
      const form = forms[proposalId] || emptyForm;
      await analyticsApi.submitMetrics({
        proposalId,
        totalReach: Number(form.totalReach),
        totalEngagement: Number(form.totalEngagement),
        attendeeCount: Number(form.attendeeCount),
      });
      setMessage('Post-event numbers saved.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save metrics');
    } finally {
      setSavingId('');
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <Link to={`/organizer/events/${eventId}`} className="mb-4 inline-flex text-sm text-slate-500 hover:text-slate-800">
          ← Back to event
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Post-event metrics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Submit reach, engagement, and attendance for {event?.name || 'this event'} after it ends.
        </p>

        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500" />
          </div>
        )}
        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

        {!loading && rows.length === 0 && (
          <p className="mt-8 text-sm text-slate-500">No accepted sponsorships on this event yet.</p>
        )}

        <div className="mt-6 space-y-4">
          {rows.map((row) => {
            const form = forms[row.proposal._id] || emptyForm;
            return (
              <div key={row.proposal._id} className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="font-semibold text-slate-900">
                  {row.proposal.sponsorId?.organizationName || row.proposal.sponsorId?.name || 'Sponsor'}
                </p>
                <p className="text-sm text-slate-500">
                  {row.proposal.selectedTierId?.name || 'Package'} · BDT {Number(row.proposal.proposedBudget || 0).toLocaleString()}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-600">Total reach</span>
                    <input
                      type="number"
                      min="0"
                      value={form.totalReach}
                      onChange={(e) => handleChange(row.proposal._id, 'totalReach', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-600">Total engagement</span>
                    <input
                      type="number"
                      min="0"
                      value={form.totalEngagement}
                      onChange={(e) => handleChange(row.proposal._id, 'totalEngagement', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-600">Attendee count</span>
                    <input
                      type="number"
                      min="0"
                      value={form.attendeeCount}
                      onChange={(e) => handleChange(row.proposal._id, 'attendeeCount', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  disabled={savingId === row.proposal._id || !row.eventEnded}
                  onClick={() => handleSubmit(row.proposal._id)}
                  className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {savingId === row.proposal._id ? 'Saving…' : row.metrics ? 'Update numbers' : 'Submit numbers'}
                </button>
                {!row.eventEnded && (
                  <p className="mt-2 text-xs text-slate-500">Available after the event end date.</p>
                )}
                <Link
                  to={`/organizer/reports/${row.proposal._id}`}
                  className="ml-3 text-sm font-medium text-amber-700"
                >
                  Photos & submit for review →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PostEventMetricsPage;
// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — END =====
