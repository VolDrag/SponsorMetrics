import React, { useState } from 'react';
import { Sparkles, Check, Pencil, X } from 'lucide-react';

// MODULE 2 | Feature 1: Proposal Creator — AI Proposal Assistant ("Help Me Write")
const AiProposalAssistant = ({
  bulletPoints,
  onBulletPointsChange,
  context = {},
  onAccept,
  disabled = false,
  requestRewrite,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [source, setSource] = useState('');
  const [editing, setEditing] = useState(false);

  const handleHelpMeWrite = async () => {
    if (!bulletPoints?.trim()) {
      setError('Add a few bullet points first so the assistant has something to rewrite.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await requestRewrite({
        bulletPoints,
        ...context,
      });
      setDraft(result.text || '');
      setSource(result.source || '');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to rewrite your notes');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!draft.trim()) return;
    onAccept(draft.trim());
    setEditing(false);
  };

  const handleDismiss = () => {
    setDraft('');
    setSource('');
    setEditing(false);
    setError('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-xs font-semibold text-gray-600">
          Rough bullet points
        </label>
        <button
          type="button"
          onClick={handleHelpMeWrite}
          disabled={disabled || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          {loading ? 'Writing…' : 'Help Me Write'}
        </button>
      </div>

      <textarea
        value={bulletPoints}
        onChange={(e) => onBulletPointsChange(e.target.value)}
        disabled={disabled}
        rows={5}
        placeholder={'• 2,000 students at campus fest\n• Logo on main stage banner\n• Need Gold package funding for sound system'}
        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {draft && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              AI draft {source === 'gemini' ? '· Gemini' : source === 'fallback' ? '· Local assistant' : ''}
            </p>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Dismiss AI draft"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={8}
              className="mb-3 w-full resize-none rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          ) : (
            <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {draft}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-600"
            >
              <Check className="h-4 w-4" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => setEditing((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              {editing ? 'Preview' : 'Edit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiProposalAssistant;

