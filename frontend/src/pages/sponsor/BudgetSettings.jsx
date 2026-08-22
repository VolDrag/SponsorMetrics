import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import budgetApi from '../../services/budgetApi';

// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — START =====
const defaultQuarter = () => {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const start = new Date(now.getFullYear(), quarter * 3, 1);
  const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
  return { start, end };
};

const toInputDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const BudgetSettings = () => {
  const quarter = defaultQuarter();
  const [form, setForm] = useState({
    periodType: 'quarterly',
    periodStart: toInputDate(quarter.start),
    periodEnd: toInputDate(quarter.end),
    budgetAmount: '',
  });
  const [budgets, setBudgets] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const res = await budgetApi.listBudgets();
      setBudgets(res.data.data || []);
    } catch {
      setBudgets([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePeriodType = (periodType) => {
    const now = new Date();
    if (periodType === 'annual') {
      setForm((prev) => ({
        ...prev,
        periodType,
        periodStart: `${now.getFullYear()}-01-01`,
        periodEnd: `${now.getFullYear()}-12-31`,
      }));
      return;
    }
    const q = defaultQuarter();
    setForm((prev) => ({
      ...prev,
      periodType,
      periodStart: toInputDate(q.start),
      periodEnd: toInputDate(q.end),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await budgetApi.upsertBudget({
        ...form,
        budgetAmount: Number(form.budgetAmount),
      });
      setMessage('Budget saved.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Budget settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Set a quarterly and/or annual sponsorship budget. Pacing alerts email you if projected overspend exceeds 10%.
        </p>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Period</span>
            <select
              value={form.periodType}
              onChange={(e) => handlePeriodType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">Start</span>
              <input
                type="date"
                value={form.periodStart}
                onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">End</span>
              <input
                type="date"
                value={form.periodEnd}
                onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Budget amount (BDT)</span>
            <input
              type="number"
              min="0"
              value={form.budgetAmount}
              onChange={(e) => setForm({ ...form, budgetAmount: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save budget'}
          </button>
        </form>

        {budgets.length > 0 && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-slate-900">Saved periods</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              {budgets.map((budget) => (
                <li key={budget._id} className="flex justify-between gap-3">
                  <span className="capitalize">{budget.periodType}</span>
                  <span>
                    {new Date(budget.periodStart).toLocaleDateString()} – {new Date(budget.periodEnd).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-slate-800">
                    BDT {Number(budget.budgetAmount || 0).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BudgetSettings;
// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — END =====
