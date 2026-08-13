import React, { useState, useCallback } from 'react';
import api from '../../services/api';

const ProposalStrengthPanel = ({ proposalData }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/proposals/analyze', proposalData);
      if (res.data.success) {
        setAnalysis(res.data.data);
      } else {
        throw new Error(res.data.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [proposalData]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getStatusBadge = (score) => {
    if (score >= 80) return { text: 'Excellent', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 60) return { text: 'Good', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (score >= 40) return { text: 'Needs Improvement', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
    return { text: 'Weak', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const status = analysis ? getStatusBadge(analysis.score) : null;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
        Proposal Strength Score
      </h3>

      {analysis ? (
        <div className="text-center mb-5">
          <div className={`text-5xl font-bold ${getScoreColor(analysis.score)} leading-none`}>
            {analysis.score}
          </div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1.5">
            OUT OF 100
          </div>
          {status && (
            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.bg}`}>
              {status.text}
            </span>
          )}
        </div>
      ) : (
        <div className="text-center mb-5 py-6">
          <div className="text-4xl font-bold text-gray-300">--</div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1.5">
            OUT OF 100
          </div>
        </div>
      )}

      <button
        onClick={analyze}
        disabled={loading}
        className="w-full mb-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
      >
        {loading ? 'Analyzing Proposal...' : '🔍 Analyze Proposal Strength'}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
          ⚠️ {error}
        </div>
      )}

      {analysis && analysis.tips.length > 0 && (
        <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">Optimization Tips & Strengths:</p>
          {analysis.tips.map((tip, idx) => (
            <div key={idx} className="p-3 rounded-lg text-xs leading-relaxed bg-amber-50/60 border border-amber-100 text-amber-900">
              {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProposalStrengthPanel;
