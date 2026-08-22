import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import analyticsApi from '../../services/analyticsApi';
import { useAuth } from '../../context/AuthContext';

// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — START =====
const formatValue = (value) => (value === null || value === undefined ? '—' : Number(value).toLocaleString());

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [payload, setPayload] = useState({ events: [], averages: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?._id) return;
    const load = async () => {
      try {
        const res = await analyticsApi.getSponsorRoi(user._id);
        setPayload(res.data.data || { events: [], averages: {} });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id]);

  const chartData = (payload.events || []).map((row) => ({
    name: row.eventName,
    costPerReach: row.costPerReach,
    costPerEngagement: row.costPerEngagement,
    audienceGrowth: row.audienceGrowth,
  }));

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-900">Sponsorship analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cost-per-reach, cost-per-engagement, and audience growth versus your own historical average.
        </p>

        {loading && (
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-amber-500" />
          </div>
        )}
        {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {!loading && !chartData.length && (
          <p className="mt-8 text-sm text-slate-500">
            No organizer-submitted post-event numbers yet. KPI charts appear after an event report is saved.
          </p>
        )}

        {chartData.length > 0 && (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Avg cost / reach</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{formatValue(payload.averages?.costPerReach)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Avg cost / engagement</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{formatValue(payload.averages?.costPerEngagement)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Avg audience growth</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{formatValue(payload.averages?.audienceGrowth)}%</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Cost efficiency vs your average</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="costPerReach" name="Cost per reach" fill="#f59e0b" />
                    <Bar dataKey="costPerEngagement" name="Cost per engagement" fill="#1e2337" />
                    {payload.averages?.costPerReach != null && (
                      <ReferenceLine
                        y={payload.averages.costPerReach}
                        stroke="#f59e0b"
                        strokeDasharray="6 4"
                        label="Avg reach cost"
                      />
                    )}
                    {payload.averages?.costPerEngagement != null && (
                      <ReferenceLine
                        y={payload.averages.costPerEngagement}
                        stroke="#1e2337"
                        strokeDasharray="6 4"
                        label="Avg engagement cost"
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Audience growth trend</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="audienceGrowth" name="Audience growth %" stroke="#2563eb" strokeWidth={2} />
                    {payload.averages?.audienceGrowth != null && (
                      <ReferenceLine y={payload.averages.audienceGrowth} stroke="#94a3b8" strokeDasharray="6 4" label="Your average" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Cost / reach</th>
                    <th className="px-4 py-3">vs avg</th>
                    <th className="px-4 py-3">Cost / engagement</th>
                    <th className="px-4 py-3">vs avg</th>
                    <th className="px-4 py-3">Audience growth</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.events.map((row) => (
                    <tr key={row.proposalId} className="border-t">
                      <td className="px-4 py-3 font-medium text-slate-800">{row.eventName}</td>
                      <td className="px-4 py-3">{formatValue(row.costPerReach)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatValue(row.benchmarks?.costPerReach)}</td>
                      <td className="px-4 py-3">{formatValue(row.costPerEngagement)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatValue(row.benchmarks?.costPerEngagement)}</td>
                      <td className="px-4 py-3">{row.audienceGrowth == null ? '—' : `${row.audienceGrowth}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsDashboard;
// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — END =====
