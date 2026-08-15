import React from 'react';

// MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — history of counter-offers
const formatBdt = (value) => `BDT ${Number(value || 0).toLocaleString()}`;

const roleLabel = (offer) => {
  if (offer.role === 'sponsor') return 'Sponsor';
  if (offer.role === 'organizer') return 'Organizer';
  return offer.offeredBy?.organizationName || offer.offeredBy?.name || 'Party';
};

const NegotiationHistory = ({ counterOffers = [] }) => {
  if (!counterOffers.length) {
    return (
      <p className="text-sm text-gray-500">No counter-offers yet. Negotiation stays on this page.</p>
    );
  }

  return (
    <ol className="space-y-3">
      {counterOffers.map((offer, index) => (
        <li key={offer._id || index} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">
              {roleLabel(offer)} · Counter-offer #{index + 1}
            </p>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              offer.status === 'accepted'
                ? 'bg-green-100 text-green-700'
                : offer.status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
            }`}>
              {offer.status}
            </span>
          </div>
          <p className="text-sm text-gray-700">Budget: {formatBdt(offer.proposedBudget)}</p>
          {(offer.swapFrom || offer.swapTo) && (
            <p className="mt-1 text-sm text-gray-700">
              Swap: {offer.swapFrom || '—'} → {offer.swapTo || '—'}
            </p>
          )}
          {offer.message && (
            <p className="mt-2 text-sm text-gray-600">{offer.message}</p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {offer.createdAt ? new Date(offer.createdAt).toLocaleString() : ''}
          </p>
        </li>
      ))}
    </ol>
  );
};

export default NegotiationHistory;

