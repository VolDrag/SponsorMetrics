import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import proposalApi from '../../services/proposalApi';

// MODULE 2 | Feature 1: Proposal Creator — organizer list of drafts/sent proposals
const statusStyles = {
  drafted: 'bg-gray-100 text-gray-700 border-gray-200',
  sent: 'bg-blue-100 text-blue-700 border-blue-200',
  viewed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  negotiation: 'bg-amber-100 text-amber-700 border-amber-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const formatBdt = (value) => `BDT ${Number(value || 0).toLocaleString()}`;

const MyProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await proposalApi.getMyProposals();
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Proposals</h1>
            <p className="mt-1 text-sm text-slate-500">Draft, send, and track sponsorship proposals.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* MODULE 2 | Feature 4: Proposal Status Tracker */}
            <Link
              to="/organizer/proposal-tracker"
              className="rounded-lg border border-gray-200 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Status tracker
            </Link>
            {/* MODULE 2 | Feature 1: Proposal Creator */}
            <Link
              to="/organizer/proposals/new"
              className="rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-white hover:bg-amber-600"
            >
              + New Proposal
            </Link>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500" />
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {!loading && proposals.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No proposals yet</h3>
            <p className="mb-6 text-gray-500">Link an event, pick a package, and write your pitch.</p>
            <Link to="/organizer/proposals/new" className="font-medium text-amber-600">
              Create your first proposal →
            </Link>
          </div>
        )}

        <div className="grid gap-4">
          {proposals.map((proposal) => (
            <div key={proposal._id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {proposal.eventId?.name || 'Untitled event'}
                    </h3>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[proposal.status] || statusStyles.drafted}`}>
                      {proposal.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {proposal.selectedTierId?.name || 'No package'} · {formatBdt(proposal.proposedBudget)}
                    {proposal.sponsorId ? ` · To ${proposal.sponsorId.organizationName || proposal.sponsorId.name}` : ' · Not sent'}
                  </p>
                </div>
                {/* MODULE 2 | Feature 2: open proposal for review / negotiation */}
                <Link
                  to={`/organizer/proposals/${proposal._id}`}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  View
                </Link>
              </div>
              {proposal.body && (
                <p className="mt-3 line-clamp-2 text-sm text-gray-600">{proposal.body}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyProposals;
