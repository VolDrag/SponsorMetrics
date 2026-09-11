import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';

const OrganizerAnalytics = () => {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get('/analytics/organizer').then((res) => setRows(res.data.data.rows || [])).catch(() => {});
  }, []);
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">Event performance</h1>
      <p className="mt-1 text-sm text-slate-500">Cross-sponsor rollup for your accepted deals.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Event</th>
              <th className="px-3 py-2">Sponsor</th>
              <th className="px-3 py-2">Spend</th>
              <th className="px-3 py-2">Reach</th>
              <th className="px-3 py-2">CPR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t">
                <td className="px-3 py-2">{row.eventName}</td>
                <td className="px-3 py-2">{row.sponsorName}</td>
                <td className="px-3 py-2">BDT {Number(row.spend || 0).toLocaleString()}</td>
                <td className="px-3 py-2">{row.totalReach ?? '—'}</td>
                <td className="px-3 py-2">{row.costPerReach ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerAnalytics;
