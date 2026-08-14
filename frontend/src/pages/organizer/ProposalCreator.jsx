import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AiProposalAssistant from '../../components/organizer/AiProposalAssistant';
import eventApi from '../../services/eventApi';
import tierApi from '../../services/tierApi';
import proposalApi from '../../services/proposalApi';

// MODULE 2 | Feature 1: Proposal Creator — step-by-step form + AI Help Me Write
const STEPS = ['Event', 'Package', 'Story', 'Review'];

const formatBdt = (value) => {
  if (value === undefined || value === null || value === '') return '—';
  return `BDT ${Number(value).toLocaleString()}`;
};

const ProposalCreator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetEventId = searchParams.get('eventId') || '';
  const presetSponsorId = searchParams.get('sponsorId') || '';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const [events, setEvents] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loadingTiers, setLoadingTiers] = useState(false);

  const [formData, setFormData] = useState({
    eventId: presetEventId,
    selectedTierId: '',
    sponsorId: presetSponsorId,
    notes: '',
    goals: '',
    rawBulletPoints: '',
    body: '',
    aiGeneratedText: '',
    proposedBudget: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsRes, sponsorsRes] = await Promise.all([
          eventApi.getMyEvents(),
          proposalApi.getSponsors(),
        ]);
        setEvents(eventsRes.data.data || []);
        setSponsors(sponsorsRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load proposal form data');
      } finally {
        setBootstrapping(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!formData.eventId) {
      setTiers([]);
      return;
    }

    const loadTiers = async () => {
      setLoadingTiers(true);
      try {
        const res = await tierApi.getTiersByEvent(formData.eventId);
        setTiers(res.tiers || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load sponsorship tiers');
      } finally {
        setLoadingTiers(false);
      }
    };

    loadTiers();
  }, [formData.eventId]);

  const selectedEvent = useMemo(
    () => events.find((event) => event._id === formData.eventId),
    [events, formData.eventId]
  );
  const selectedTier = useMemo(
    () => tiers.find((tier) => tier._id === formData.selectedTierId),
    [tiers, formData.selectedTierId]
  );
  const selectedSponsor = useMemo(
    () => sponsors.find((sponsor) => sponsor._id === formData.sponsorId),
    [sponsors, formData.sponsorId]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectTier = (tier) => {
    setFormData((prev) => ({
      ...prev,
      selectedTierId: tier._id,
      proposedBudget: prev.proposedBudget || tier.price,
    }));
  };

  const buildPayload = (send = false) => ({
    eventId: formData.eventId,
    selectedTierId: formData.selectedTierId || undefined,
    sponsorId: formData.sponsorId || undefined,
    notes: formData.notes,
    goals: formData.goals,
    rawBulletPoints: formData.rawBulletPoints,
    body: formData.body,
    aiGeneratedText: formData.aiGeneratedText,
    proposedBudget: formData.proposedBudget === '' ? undefined : Number(formData.proposedBudget),
    send,
  });

  const validateStep = (currentStep) => {
    if (currentStep === 1 && !formData.eventId) {
      return 'Select an event profile from Module 1';
    }
    if (currentStep === 2 && !formData.selectedTierId) {
      return 'Select a sponsorship tier package';
    }
    if (currentStep === 3 && !formData.body.trim() && !formData.rawBulletPoints.trim()) {
      return 'Add notes or accept an AI draft before continuing';
    }
    return '';
  };

  const goNext = () => {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleSave = async (send) => {
    const stepError = validateStep(send ? 4 : step);
    if (!formData.eventId) {
      setError('Select an event profile from Module 1');
      return;
    }
    if (send) {
      if (!formData.selectedTierId) {
        setError('Select a sponsorship tier before sending');
        return;
      }
      if (!formData.sponsorId) {
        setError('Choose a sponsor to send this proposal to');
        return;
      }
    }
    if (stepError && send) {
      setError(stepError);
      return;
    }

    setLoading(true);
    setError('');
    setSaved('');
    try {
      await proposalApi.createProposal(buildPayload(send));
      if (send) {
        navigate('/organizer/proposals');
        return;
      }
      setSaved('Proposal saved as draft');
      setTimeout(() => setSaved(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save proposal');
    } finally {
      setLoading(false);
    }
  };

  const requestRewrite = async ({ bulletPoints }) => {
    const res = await proposalApi.aiAssist({
      bulletPoints,
      eventId: formData.eventId || undefined,
      notes: formData.notes,
      goals: formData.goals,
    });
    return res.data.data;
  };

  if (bootstrapping) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-amber-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            to="/organizer/proposals"
            className="mb-3 inline-flex text-sm text-slate-500 hover:text-slate-800"
          >
            ← Back to proposals
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Proposal Creator</h1>
          <p className="mt-1 text-slate-500">
            Build a sponsorship proposal from an existing event profile, pick a tier, and polish the pitch.
          </p>
        </div>

        <div className="mb-8 flex items-center gap-3">
          {STEPS.map((label, index) => {
            const number = index + 1;
            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      step >= number ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {number}
                  </span>
                  <span className={`text-sm ${step >= number ? 'font-semibold text-amber-700' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {number < STEPS.length && <div className="h-px flex-1 bg-gray-200" />}
              </React.Fragment>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {saved}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {step === 1 && (
            <>
              <h2 className="mb-4 text-lg font-bold text-gray-800">Step 1: Link an event profile</h2>
              {events.length === 0 ? (
                <p className="text-sm text-gray-500">
                  You have no events yet.{' '}
                  <Link to="/organizer/events/new" className="font-medium text-amber-600">
                    Create an event first →
                  </Link>
                </p>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <label
                      key={event._id}
                      className={`block cursor-pointer rounded-xl border p-4 transition-colors ${
                        formData.eventId === event._id
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="eventId"
                          value={event._id}
                          checked={formData.eventId === event._id}
                          onChange={handleChange}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{event.name}</p>
                          <p className="text-sm text-gray-500">
                            {event.venue} · {new Date(event.date).toLocaleDateString()} ·{' '}
                            {event.expectedCrowdSize?.toLocaleString()} expected
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="mb-4 text-lg font-bold text-gray-800">Step 2: Select a tier package</h2>
              {loadingTiers ? (
                <p className="text-sm text-gray-500">Loading packages…</p>
              ) : tiers.length === 0 ? (
                <p className="text-sm text-gray-500">
                  This event has no packages yet.{' '}
                  <Link
                    to={`/organizer/events/${formData.eventId}/tiers`}
                    className="font-medium text-amber-600"
                  >
                    Create tiers →
                  </Link>
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {tiers.map((tier) => (
                    <button
                      type="button"
                      key={tier._id}
                      onClick={() => handleSelectTier(tier)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        formData.selectedTierId === tier._id
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-200'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{tier.name}</p>
                        <p className="text-sm font-bold text-amber-700">{formatBdt(tier.price)}</p>
                      </div>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {(tier.benefits || []).slice(0, 4).map((benefit) => (
                          <li key={benefit.label}>• {benefit.label}</li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5">
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Proposed budget (BDT)
                </label>
                <input
                  type="number"
                  name="proposedBudget"
                  min="0"
                  value={formData.proposedBudget}
                  onChange={handleChange}
                  placeholder={selectedTier ? String(selectedTier.price) : '0'}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="mb-4 text-lg font-bold text-gray-800">Step 3: Notes, goals & AI draft</h2>
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Partnership goals</label>
                <input
                  type="text"
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  placeholder="e.g. Brand awareness among university students, 200 leads"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Internal notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Anything the sponsor should know — timeline, exclusivity, past partners…"
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <AiProposalAssistant
                bulletPoints={formData.rawBulletPoints}
                onBulletPointsChange={(value) =>
                  setFormData((prev) => ({ ...prev, rawBulletPoints: value }))
                }
                context={{ eventId: formData.eventId, notes: formData.notes, goals: formData.goals }}
                requestRewrite={requestRewrite}
                onAccept={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    body: text,
                    aiGeneratedText: text,
                  }))
                }
              />

              <div className="mt-5">
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Final proposal text
                </label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Accept the AI draft or write the professional proposal here."
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="mb-4 text-lg font-bold text-gray-800">Step 4: Review & send</h2>
              <div className="mb-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <p><span className="font-semibold text-slate-900">Event:</span> {selectedEvent?.name || '—'}</p>
                <p><span className="font-semibold text-slate-900">Package:</span> {selectedTier?.name || '—'} · {formatBdt(formData.proposedBudget || selectedTier?.price)}</p>
                <p><span className="font-semibold text-slate-900">Goals:</span> {formData.goals || '—'}</p>
                <p className="whitespace-pre-wrap"><span className="font-semibold text-slate-900">Proposal:</span> {formData.body || formData.rawBulletPoints || '—'}</p>
              </div>

              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Send to sponsor</label>
              <select
                name="sponsorId"
                value={formData.sponsorId}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Save as draft without sending</option>
                {sponsors.map((sponsor) => (
                  <option key={sponsor._id} value={sponsor._id}>
                    {sponsor.organizationName || sponsor.name}
                    {sponsor.industry ? ` · ${sponsor.industry}` : ''}
                  </option>
                ))}
              </select>
              {selectedSponsor && (
                <p className="mt-2 text-sm text-gray-500">
                  {selectedSponsor.email} · {selectedSponsor.budgetTier || 'budget not set'}
                </p>
              )}
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setError('');
              setStep((prev) => Math.max(prev - 1, 1));
            }}
            disabled={step === 1 || loading}
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save as Draft'}
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-white hover:bg-amber-600"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={loading}
                className="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Proposal'}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProposalCreator;

