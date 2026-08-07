// ifty
import { useEffect, useState } from 'react';

import TierCard from '../../components/organizer/TierCard';
import tierApi, { benefitPresets } from '../../services/tierApi';

const TierPackageCreator = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [tiers, setTiers] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [savingTierId, setSavingTierId] = useState('');
  const [deletingTierId, setDeletingTierId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      setError('');

      try {
        const data = await tierApi.getOrganizerEvents();
        setEvents(data.events || []);
        if (data.events && data.events.length > 0) {
          setSelectedEventId(String(data.events[0]._id));
        }
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Failed to load events.');
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setTiers([]);
      return;
    }

    const fetchTiers = async () => {
      setLoadingTiers(true);
      setError('');

      try {
        const data = await tierApi.getTiersByEvent(selectedEventId);
        setTiers(data.tiers || []);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Failed to load tiers.');
      } finally {
        setLoadingTiers(false);
      }
    };

    fetchTiers();
  }, [selectedEventId]);

  const handleAddTier = async () => {
    if (!selectedEventId) {
      return;
    }

    setError('');
    setMessage('');

    try {
      const payload = {
        eventId: selectedEventId,
        name: `Tier ${tiers.length + 1}`,
        price: 0,
        isCustom: true,
        benefits: [],
      };
      const data = await tierApi.createTier(payload);
      setTiers((prev) => [...prev, data.tier]);
      setMessage('Tier added successfully.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to add tier.');
    }
  };

  const handleSaveTier = async (tierId, payload) => {
    setSavingTierId(tierId);
    setError('');
    setMessage('');

    try {
      const data = await tierApi.updateTier(tierId, payload);
      setTiers((prev) => prev.map((tier) => (tier._id === tierId ? data.tier : tier)));
      setMessage('Tier updated successfully.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to update tier.');
    } finally {
      setSavingTierId('');
    }
  };

  const handleDeleteTier = async (tierId) => {
    setDeletingTierId(tierId);
    setError('');
    setMessage('');

    try {
      await tierApi.deleteTier(tierId);
      setTiers((prev) => prev.filter((tier) => tier._id !== tierId));
      setMessage('Tier deleted successfully.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to delete tier.');
    } finally {
      setDeletingTierId('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Sponsorship Tier Package Creator</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create and manage event sponsorship tiers with clear deliverables.
          </p>

          <div className="mt-5">
            <label className="mb-1 block text-sm font-medium text-slate-700">Select Event</label>
            <select
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(event.target.value)}
              disabled={loadingEvents || events.length === 0}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            >
              {events.length === 0 ? <option value="">No events available</option> : null}
              {events.map((eventItem) => (
                <option key={eventItem._id} value={eventItem._id}>
                  {eventItem.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleAddTier}
              disabled={!selectedEventId}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              Add Tier
            </button>
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
        </div>

        <div className="mt-6 space-y-4">
          {loadingTiers ? (
            <p className="text-sm text-slate-600">Loading tiers...</p>
          ) : tiers.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-sm text-slate-600 shadow-sm">
              No tiers yet. Add your first tier for this event.
            </p>
          ) : (
            tiers.map((tier) => (
              <TierCard
                key={tier._id}
                tier={tier}
                benefitPresets={benefitPresets}
                onSave={(payload) => handleSaveTier(tier._id, payload)}
                onDelete={() => handleDeleteTier(tier._id)}
                saving={savingTierId === tier._id}
                deleting={deletingTierId === tier._id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TierPackageCreator;
// ifty end
