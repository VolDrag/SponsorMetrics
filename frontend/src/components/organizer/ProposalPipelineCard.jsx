import React from 'react';
import { Link } from 'react-router-dom';

// MODULE 2 | Feature 4: Proposal Status Tracker — card inside a pipeline column
const formatBdt = (value) => `BDT ${Number(value || 0).toLocaleString()}`;

const STEPS = ['drafted', 'sent', 'viewed', 'negotiation'];

const PipelineStepper = ({ status }) => {
  const isTerminal = status === 'accepted' || status === 'rejected';
  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="mt-3 flex items-center gap-1">
      {STEPS.map((step, index) => {
        const done = isTerminal || index <= currentIndex;
        return (
          <React.Fragment key={step}>
            <span
              className={`h-1.5 flex-1 rounded-full ${done ? 'bg-amber-500' : 'bg-gray-200'}`}
            />
          </React.Fragment>
        );
      })}
      <span
        className={`h-1.5 flex-1 rounded-full ${
          status === 'accepted' ? 'bg-green-500' : status === 'rejected' ? 'bg-red-500' : 'bg-gray-200'
        }`}
      />
    </div>
  );
};

const ProposalPipelineCard = ({ proposal }) => {
  return (
    <Link
      to={`/organizer/proposals/${proposal._id}`}
      className="block rounded-lg border border-gray-200 bg-white p-3 hover:border-amber-300 hover:shadow-sm"
    >
      <p className="line-clamp-2 text-sm font-semibold text-gray-900">
        {proposal.eventId?.name || 'Untitled event'}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        {proposal.selectedTierId?.name || 'No package'} · {formatBdt(proposal.proposedBudget)}
      </p>
      <p className="mt-1 truncate text-xs text-gray-400">
        {proposal.sponsorId
          ? proposal.sponsorId.organizationName || proposal.sponsorId.name
          : 'Not sent'}
      </p>
      <PipelineStepper status={proposal.status} />
    </Link>
  );
};

export default ProposalPipelineCard;
