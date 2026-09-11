import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminApi } from '../../services/platformApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [kyc, setKyc] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [dash, queue] = await Promise.all([adminApi.dashboard(), adminApi.kyc('pending')]);
      setStats(dash.data.data);
      setKyc(queue.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Admin load failed');
    }
  };

  useEffect(() => { load(); }, []);

  const decide = async (id, decision) => {
    const reason = decision === 'rejected' ? window.prompt('Rejection reason') || 'Does not meet KYC' : '';
    await adminApi.reviewKyc(id, decision, reason);
    load();
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
      {error && <p className="mt-3 text-red-600">{error}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats && Object.entries(stats).map(([key, value]) => (
          <div key={key} className="rounded-xl border bg-white p-4">
            <p className="text-xs uppercase text-slate-500">{key}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 text-lg font-semibold">KYC queue</h2>
      <div className="mt-3 space-y-3">
        {kyc.map((row) => (
          <article key={row._id} className="flex items-center justify-between rounded-xl border bg-white p-4">
            <div>
              <p className="font-medium">{row.userId?.organizationName || row.userId?.name}</p>
              <p className="text-sm text-slate-500">{row.documentType} · {row.userId?.email}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => decide(row._id, 'approved')} className="rounded bg-green-600 px-3 py-1.5 text-sm text-white">Approve</button>
              <button type="button" onClick={() => decide(row._id, 'rejected')} className="rounded bg-red-600 px-3 py-1.5 text-sm text-white">Reject</button>
            </div>
          </article>
        ))}
        {!kyc.length && <p className="text-sm text-slate-500">No pending verifications.</p>}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
