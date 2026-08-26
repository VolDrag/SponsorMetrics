import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import analyticsApi from '../../services/analyticsApi';

// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — AI insights — START =====
const SUGGESTED_QUESTIONS = [
  'Explain these stats in plain language',
  'Where are the setbacks?',
  'How can I improve cost-per-reach and engagement?',
  'Which events underperformed versus my average?',
];

const AnalyticsInsightPanel = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState('');

  const ask = async (text) => {
    const nextQuestion = String(text || '').trim();
    if (!nextQuestion || loading) return;

    setLoading(true);
    setError('');
    setQuestion('');

    const history = messages.map((item) => ({
      role: item.role,
      content: item.content,
    }));

    try {
      const res = await analyticsApi.askAboutRoi({ question: nextQuestion, history });
      const answer = res.data.data.text || '';
      setSource(res.data.data.source || '');
      if (res.data.data.error && res.data.data.source !== 'gemini') {
        setError(res.data.data.error);
      }
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: nextQuestion },
        { role: 'assistant', content: answer },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate insight');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    ask(question);
  };

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Ask about your stats
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Gemini reads this dashboard and can explain KPIs, flag setbacks, and suggest how to improve.
            {source === 'gemini' ? ' · Gemini' : source === 'fallback' ? ' · Local assistant' : ''}
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => ask(item)}
            disabled={loading}
            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
          >
            {item}
          </button>
        ))}
      </div>

      {messages.length > 0 && (
        <div className="mb-4 max-h-80 space-y-3 overflow-y-auto rounded-lg border border-gray-100 bg-slate-50 p-3">
          {messages.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                item.role === 'user'
                  ? 'ml-8 bg-slate-900 text-white'
                  : 'mr-8 whitespace-pre-wrap bg-white text-slate-800'
              }`}
            >
              {item.content}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
          placeholder="Ask anything about these numbers…"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </form>
    </div>
  );
};

export default AnalyticsInsightPanel;
// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — AI insights — END =====
