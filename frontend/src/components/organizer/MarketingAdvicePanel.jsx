import React, { useState } from 'react';
import { Sparkles, X, RefreshCw } from 'lucide-react';
import marketingApi from '../../services/marketingApi';

// ===== MODULE 4 FEATURE 4: AI-Powered Marketing Consultation — START =====
const categoryStyles = {
  channel: 'bg-blue-100 text-blue-700',
  content: 'bg-amber-100 text-amber-800',
  pricing: 'bg-green-100 text-green-700',
};

const MarketingAdvicePanel = ({ eventId, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const loadAdvice = async () => {
    if (!eventId) {
      setError('Save or select an event first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await marketingApi.getEventAdvice(eventId);
      setRecommendations(res.data.data.recommendations || []);
      setSource(res.data.data.source || '');
      setOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate advice');
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={loadAdvice}
        disabled={disabled || loading || !eventId}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4 text-amber-400" />
        {loading ? 'Writing…' : 'Get Marketing Advice'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Marketing advice</h2>
                <p className="text-xs text-slate-500">
                  {source === 'gemini' ? 'Grounded in this event · Gemini' : 'Grounded in this event · local assistant'}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <div className="space-y-3">
              {recommendations.map((item) => (
                <article key={item.title} className="rounded-xl border border-gray-200 p-4">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${categoryStyles[item.category] || categoryStyles.content}`}>
                    {item.category}
                  </span>
                  <h3 className="mt-2 font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>

            <button
              type="button"
              onClick={loadAdvice}
              disabled={loading}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              {loading ? 'Writing…' : 'Regenerate'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingAdvicePanel;
// ===== MODULE 4 FEATURE 4: AI-Powered Marketing Consultation — END =====
