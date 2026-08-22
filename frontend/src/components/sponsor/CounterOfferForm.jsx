import React, { useMemo, useState } from 'react';
import { benefitPresets } from '../../services/tierApi';

// MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — counter-offer form
const CounterOfferForm = ({ tier, currentBudget, onSubmit, onCancel, loading }) => {
  const [proposedBudget, setProposedBudget] = useState(currentBudget || '');
  const [swapFrom, setSwapFrom] = useState('');
  const [swapTo, setSwapTo] = useState('');
  const [message, setMessage] = useState('');

  const items = useMemo(() => {
    const fromTier = (tier?.benefits || []).map((benefit) => benefit.label);
    const fromPresets = benefitPresets.map((preset) => preset.label);
    return [...new Set([...fromTier, ...fromPresets])];
  }, [tier]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      proposedBudget: proposedBudget === '' ? undefined : Number(proposedBudget),
      swapFrom,
      swapTo,
      message,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <h3 className="font-semibold text-gray-900">Counter offer</h3>
      <p className="text-sm text-gray-600">
        Propose a different budget or swap a package item (for example banner ad for booth space) without leaving the platform.
      </p>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">Proposed budget (BDT)</label>
        <input
          type="number"
          min="0"
          value={proposedBudget}
          onChange={(e) => setProposedBudget(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Replace this item</label>
          <select
            value={swapFrom}
            onChange={(e) => setSwapFrom(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">No swap</option>
            {items.map((item) => (
              <option key={`from-${item}`} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">With this item</label>
          <select
            value={swapTo}
            onChange={(e) => setSwapTo(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">No swap</option>
            {items.map((item) => (
              <option key={`to-${item}`} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Gold is high for our Q3 budget — happy to proceed at this figure with booth space instead of a banner."
          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Submit counter-offer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CounterOfferForm;
