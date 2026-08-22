import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import experimentApi from '../../services/experimentApi';

// ===== MODULE 3 FEATURE 4: A/B Experiment Tracker for Sponsorship Formats — START =====
const FORMAT_OPTIONS = [
  { value: 'banner', label: 'Banner' },
  { value: 'booth', label: 'Booth' },
  { value: 'speaking_slot', label: 'Speaking slot' },
  { value: 'social_post', label: 'Social post' },
  { value: 'other', label: 'Other' },
];

const METRIC_OPTIONS = [
  { value: 'costPerReach', label: 'Cost per reach' },
  { value: 'costPerEngagement', label: 'Cost per engagement' },
  { value: 'audienceGrowth', label: 'Audience growth' },
  { value: 'engagementRate', label: 'Engagement rate' },
];

const emptyVariant = () => ({
  label: '',
  formatType: 'banner',
  taggedEventIds: [],
  isControl: false,
});

const Experiments = () => {
  const [events, setEvents] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    name: '',
    primaryMetric: 'costPerReach',
    variants: [emptyVariant(), emptyVariant()],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [eventRes, expRes] = await Promise.all([
        experimentApi.listEvents(),
        experimentApi.listExperiments(),
      ]);
      setEvents(eventRes.data.data || []);
      setExperiments(expRes.data.data || []);
      if (!selected && expRes.data.data?.[0]) setSelected(expRes.data.data[0]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load experiments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateVariant = (index, patch) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], ...patch };
      return { ...prev, variants };
    });
  };

  const toggleEvent = (index, eventId) => {
    const current = form.variants[index].taggedEventIds || [];
    const next = current.includes(eventId)
      ? current.filter((id) => id !== eventId)
      : [...current, eventId];
    updateVariant(index, { taggedEventIds: next });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await experimentApi.createExperiment(form);
      setExperiments((prev) => [res.data.data, ...prev]);
      setSelected(res.data.data);
      setForm({ name: '', primaryMetric: 'costPerReach', variants: [emptyVariant(), emptyVariant()] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create experiment');
    } finally {
      setSaving(false);
    }
  };

  const chartData = (selected?.variants || []).map((variant) => ({
    name: variant.label,
    value: variant.average,
    isWinner: variant.isWinner,
  }));

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-900">Format experiments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare banner vs booth vs speaking slot across similar events and see which format wins on your chosen KPI.
        </p>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading && (
          <div className="mt-10 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-amber-500" />
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">New experiment</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">Primary metric</span>
              <select
                value={form.primaryMetric}
                onChange={(e) => setForm({ ...form, primaryMetric: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
              >
                {METRIC_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {form.variants.map((variant, index) => (
              <div key={index} className="rounded-lg border border-gray-100 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-700">Variant {index + 1}</p>
                <input
                  value={variant.label}
                  onChange={(e) => updateVariant(index, { label: e.target.value })}
                  placeholder="Label"
                  className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <select
                  value={variant.formatType}
                  onChange={(e) => updateVariant(index, { formatType: e.target.value })}
                  className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {FORMAT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <label className="mb-2 flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={variant.isControl}
                    onChange={(e) => updateVariant(index, { isControl: e.target.checked })}
                  />
                  Mark as control
                </label>
                <p className="mb-1 text-xs font-medium text-slate-500">Tag events</p>
                <div className="max-h-32 space-y-1 overflow-y-auto text-xs">
                  {events.map((item) => (
                    <label key={`${index}-${item.eventId}`} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={variant.taggedEventIds.includes(item.eventId)}
                        onChange={() => toggleEvent(index, item.eventId)}
                      />
                      <span>{item.eventName} ({item.formatType})</span>
                    </label>
                  ))}
                  {!events.length && <p className="text-slate-400">No accepted events yet.</p>}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }))}
            className="mt-3 text-sm font-medium text-amber-600"
          >
            + Add variant
          </button>
          <div>
            <button
              type="submit"
              disabled={saving}
              className="mt-4 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Create experiment'}
            </button>
          </div>
        </form>

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-bold text-slate-900">Saved</h2>
            <ul className="space-y-1">
              {experiments.map((item) => (
                <li key={item.experiment._id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      selected?.experiment?._id === item.experiment._id
                        ? 'bg-amber-50 font-semibold text-amber-800'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {item.experiment.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {selected && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selected.experiment.name}</h2>
                  <p className="text-sm text-slate-500">
                    {METRIC_OPTIONS.find((option) => option.value === selected.primaryMetric)?.label} · {selected.metricDirection.replaceAll('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Primary metric">
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.isWinner ? '#16a34a' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {selected.variants.map((variant) => (
                  <li key={variant._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2">
                    <span className="font-medium">
                      {variant.label} ({variant.formatType})
                      {variant.isControl ? ' · control' : ''}
                    </span>
                    <span>
                      avg {variant.average ?? '—'}
                      {variant.liftPercent !== null && !variant.isControl ? ` · lift ${variant.liftPercent}%` : ''}
                    </span>
                    {variant.isWinner && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Winner</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Experiments;
// ===== MODULE 3 FEATURE 4: A/B Experiment Tracker for Sponsorship Formats — END =====
