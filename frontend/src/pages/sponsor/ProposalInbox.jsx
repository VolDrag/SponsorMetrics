import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import proposalApi from '../../services/proposalApi';

// MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — sponsor inbox
const statusStyles = {
  sent: 'bg-blue-100 text-blue-700 border-blue-200',
  viewed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  negotiation: 'bg-amber-100 text-amber-700 border-amber-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const formatBdt = (value) => `BDT ${Number(value || 0).toLocaleString()}`;

const ProposalInbox = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await proposalApi.getInbox();
        setProposals(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load proposals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-slate-900">Proposal inbox</h1>
        <p className="mt-1 mb-8 text-sm text-slate-500">
          Review sent proposals and negotiate in-platform instead of moving to WhatsApp.
        </p>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500" />
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}

        {!loading && proposals.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No proposals yet</h3>
            <p className="text-gray-500">When organizers send you a pitch, it will appear here.</p>
          </div>
        )}

        <div className="grid gap-4">
          {proposals.map((proposal) => (
            <div key={proposal._id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {proposal.eventId?.name || 'Event'}
                    </h3>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[proposal.status] || statusStyles.sent}`}>
                      {proposal.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {proposal.organizerId?.organizationName || proposal.organizerId?.name || 'Organizer'}
                    {' · '}
                    {proposal.selectedTierId?.name || 'Package'}
                    {' · '}
                    {formatBdt(proposal.proposedBudget)}
                  </p>
                </div>
                <Link
                  to={`/sponsor/proposals/${proposal._id}`}
                  className="rounded-lg bg-[#1E2337] px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProposalInbox;

