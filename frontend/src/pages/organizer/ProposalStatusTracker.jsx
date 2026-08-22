import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProposalPipelineCard from '../../components/organizer/ProposalPipelineCard';
import proposalApi from '../../services/proposalApi';

// MODULE 2 | Feature 4: Proposal Status Tracker — kanban pipeline
const COLUMNS = [
  { key: 'drafted', label: 'Drafted', hint: 'Not sent yet' },
  { key: 'sent', label: 'Sent', hint: 'Waiting on sponsor' },
  { key: 'viewed', label: 'Viewed by Sponsor', hint: 'Opened in-platform' },
  { key: 'negotiation', label: 'Under Negotiation', hint: 'Counter-offers in play' },
  { key: 'accepted', label: 'Accepted', hint: 'Deal closed' },
  { key: 'rejected', label: 'Rejected', hint: 'Declined' },
];

const columnColors = {
  drafted: 'border-t-gray-400',
  sent: 'border-t-blue-500',
  viewed: 'border-t-indigo-500',
  negotiation: 'border-t-amber-500',
  accepted: 'border-t-green-500',
  rejected: 'border-t-red-500',
};

const ProposalStatusTracker = () => {
  const [columns, setColumns] = useState({});
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await proposalApi.getPipeline();
        setColumns(res.data.data.columns || {});
        setCounts(res.data.data.counts || {});
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load proposal pipeline');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proposal status tracker</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live pipeline — Drafted → Sent → Viewed by Sponsor → Under Negotiation → Accepted or Rejected.
          </p>
        </div>
        <Link
          to="/organizer/proposals/new"
          className="rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-white hover:bg-amber-600"
        >
          + New Proposal
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500" />
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
      )}

      {!loading && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <section
              key={column.key}
              className={`w-64 flex-shrink-0 rounded-xl border border-gray-200 border-t-4 bg-slate-50 ${columnColors[column.key]}`}
            >
              <header className="px-3 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">{column.label}</h2>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {counts[column.key] || 0}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{column.hint}</p>
              </header>
              <div className="space-y-2 px-3 pb-3">
                {(columns[column.key] || []).length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-6 text-center text-xs text-gray-400">
                    Empty
                  </p>
                ) : (
                  (columns[column.key] || []).map((proposal) => (
                    <ProposalPipelineCard key={proposal._id} proposal={proposal} />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProposalStatusTracker;
