import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import NegotiationHistory from '../../components/common/NegotiationHistory';
import CounterOfferForm from '../../components/sponsor/CounterOfferForm';
import proposalApi from '../../services/proposalApi';
import { useAuth } from '../../context/AuthContext';

// MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — review page + counter-offer
const statusStyles = {
  drafted: 'bg-gray-100 text-gray-700 border-gray-200',
  sent: 'bg-blue-100 text-blue-700 border-blue-200',
  viewed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  negotiation: 'bg-amber-100 text-amber-700 border-amber-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const formatBdt = (value) => `BDT ${Number(value || 0).toLocaleString()}`;

const ProposalReview = ({ backTo, backLabel }) => {
  const { proposalId } = useParams();
  const { user } = useAuth();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');
  const [showCounter, setShowCounter] = useState(false);
  const [sponsors, setSponsors] = useState([]);
  const [sendSponsorId, setSendSponsorId] = useState('');

  const load = async () => {
    try {
      const res = await proposalApi.getProposal(proposalId);
      setProposal(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [proposalId]);

  useEffect(() => {
    if (user?.role !== 'organizer') return;
    proposalApi.getSponsors()
      .then((res) => setSponsors(res.data.data || []))
      .catch(() => {});
  }, [user?.role]);

  const openForAction = proposal && ['sent', 'viewed', 'negotiation'].includes(proposal.status);
  const pending = [...(proposal?.counterOffers || [])]
    .reverse()
    .find((offer) => offer.status === 'pending');
  const pendingIsMine = Boolean(
    pending && String(pending.offeredBy?._id || pending.offeredBy) === String(user?._id)
  );

  const runAction = async (fn) => {
    setActing(true);
    setError('');
    try {
      const res = await fn();
      setProposal(res.data.data);
      setShowCounter(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-amber-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!proposal) {
    return (
      <DashboardLayout>
        <p className="text-red-600">{error || 'Proposal not found'}</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <Link to={backTo} className="mb-4 inline-flex text-sm text-slate-500 hover:text-slate-800">
          ← {backLabel}
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{proposal.eventId?.name || 'Proposal'}</h1>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[proposal.status]}`}>
            {proposal.status}
          </span>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Proposal details</h2>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <p><span className="font-semibold text-gray-500">Organizer:</span> {proposal.organizerId?.organizationName || proposal.organizerId?.name}</p>
            <p><span className="font-semibold text-gray-500">Sponsor:</span> {proposal.sponsorId?.organizationName || proposal.sponsorId?.name || '—'}</p>
            <p><span className="font-semibold text-gray-500">Venue:</span> {proposal.eventId?.venue || '—'}</p>
            <p><span className="font-semibold text-gray-500">Date:</span> {proposal.eventId?.date ? new Date(proposal.eventId.date).toLocaleDateString() : '—'}</p>
            <p><span className="font-semibold text-gray-500">Package:</span> {proposal.selectedTierId?.name || '—'}</p>
            <p><span className="font-semibold text-gray-500">Budget:</span> {formatBdt(proposal.proposedBudget)}</p>
          </div>
          {proposal.goals && <p className="mt-4 text-sm"><span className="font-semibold text-gray-500">Goals:</span> {proposal.goals}</p>}
          {proposal.notes && <p className="mt-2 text-sm"><span className="font-semibold text-gray-500">Notes:</span> {proposal.notes}</p>}
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
            {proposal.body || proposal.rawBulletPoints || 'No written proposal body.'}
          </p>
          {proposal.selectedTierId?.benefits?.length > 0 && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-600">
              {proposal.selectedTierId.benefits.map((benefit) => (
                <li key={benefit.label}>{benefit.label}{benefit.detail ? ` — ${benefit.detail}` : ''}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Negotiation history</h2>
          <NegotiationHistory counterOffers={proposal.counterOffers} />
        </div>

        {openForAction && (
          <div className="space-y-4">
            {pendingIsMine && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Waiting for the other party to respond to your latest counter-offer.
              </p>
            )}

            {showCounter ? (
              <CounterOfferForm
                tier={proposal.selectedTierId}
                currentBudget={proposal.proposedBudget}
                loading={acting}
                onCancel={() => setShowCounter(false)}
                onSubmit={(payload) => runAction(() => proposalApi.counterOffer(proposal._id, payload))}
              />
            ) : (
              <div className="flex flex-wrap gap-3">
                {!pendingIsMine && (
                  <>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => runAction(() => proposalApi.acceptProposal(proposal._id))}
                      className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => runAction(() => proposalApi.rejectProposal(proposal._id))}
                      className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  disabled={acting}
                  onClick={() => setShowCounter(true)}
                  className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  Counter Offer
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODULE 2 | Feature 1: Proposal Creator — send a saved draft */}
        {user?.role === 'organizer' && proposal.status === 'drafted' && (
          <div className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <div className="min-w-[220px] flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Send to sponsor</label>
              <select
                value={sendSponsorId || proposal.sponsorId?._id || ''}
                onChange={(e) => setSendSponsorId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select a sponsor</option>
                {sponsors.map((sponsor) => (
                  <option key={sponsor._id} value={sponsor._id}>
                    {sponsor.organizationName || sponsor.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={acting}
              onClick={() =>
                runAction(() =>
                  proposalApi.sendProposal(proposal._id, {
                    sponsorId: sendSponsorId || proposal.sponsorId?._id,
                  })
                )
              }
              className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              Send proposal
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const SponsorProposalReview = () => (
  <ProposalReview backTo="/sponsor/proposals" backLabel="Back to inbox" />
);

export const OrganizerProposalReview = () => (
  <ProposalReview backTo="/organizer/proposals" backLabel="Back to proposals" />
);

export default SponsorProposalReview;

