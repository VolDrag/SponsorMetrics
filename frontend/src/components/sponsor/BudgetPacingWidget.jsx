import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import budgetApi from '../../services/budgetApi';

// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — START =====
const barColor = (status) => {
  if (status === 'red') return 'bg-red-500';
  if (status === 'yellow') return 'bg-amber-400';
  return 'bg-green-500';
};

const formatBdt = (value) => `BDT ${Number(value || 0).toLocaleString()}`;

const BudgetPacingWidget = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await budgetApi.getPacing();
        setRows(res.data.data || []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return null;

  if (!rows.length) {
    return (
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-900">Budget pacing</h2>
        <p className="mt-1 text-sm text-slate-500">Set a quarterly or annual sponsorship budget to track burn rate.</p>
        <Link to="/sponsor/settings" className="mt-3 inline-block text-sm font-medium text-amber-600">
          Open budget settings →
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4">
      {rows.map((row) => {
        const pct = row.budgetAmount > 0
          ? Math.min(100, Math.round((row.committedSpend / row.budgetAmount) * 100))
          : 0;
        return (
          <div key={row.budgetId} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold capitalize text-slate-900">{row.periodType} budget</h2>
                <p className="text-xs text-slate-500">
                  {new Date(row.periodStart).toLocaleDateString()} – {new Date(row.periodEnd).toLocaleDateString()}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                row.status === 'red'
                  ? 'bg-red-100 text-red-700'
                  : row.status === 'yellow'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-700'
              }`}>
                {row.overspendPercent > 10
                  ? `+${row.overspendPercent}% projected overspend`
                  : row.overspendPercent > 0
                    ? `${row.overspendPercent}% over pace`
                    : 'On track'}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full ${barColor(row.status)}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
              <p>Committed: <span className="font-semibold text-slate-800">{formatBdt(row.committedSpend)}</span></p>
              <p>Burn / day: <span className="font-semibold text-slate-800">{formatBdt(row.dailyBurnRate)}</span></p>
              <p>Projected: <span className="font-semibold text-slate-800">{formatBdt(row.projectedTotalSpend)}</span> vs {formatBdt(row.budgetAmount)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetPacingWidget;
// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — END =====
