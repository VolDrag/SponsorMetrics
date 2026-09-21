import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminApi, paymentApi, disputeApi } from '../../services/platformApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [kyc, setKyc] = useState([]);
  const [payments, setPayments] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [dash, queue, pay, disp] = await Promise.all([
        adminApi.dashboard(),
        adminApi.kyc('pending'),
        paymentApi.list(),
        disputeApi.list(),
      ]);
      setStats(dash.data.data);
      setKyc(queue.data.data || []);
      setPayments((pay.data.data || []).filter((row) => row.escrowStatus === 'held' || row.status === 'initiated'));
      setDisputes((disp.data.data || []).filter((row) => row.status === 'open'));
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

      <h2 className="mt-10 text-lg font-semibold">Escrow needing attention</h2>
      <p className="text-sm text-slate-500"><Link to="/payments" className="text-amber-700">Open the payments desk</Link> to release or refund.</p>
      <div className="mt-3 space-y-2">
        {payments.slice(0, 8).map((row) => (
          <article key={row._id} className="flex items-center justify-between rounded-xl border bg-white p-4 text-sm">
            <span>{row.campaignId?.eventId?.name || row.invoiceNumber} · BDT {Number(row.amount || 0).toLocaleString()}</span>
            <span className="capitalize text-slate-500">{row.escrowStatus} / {row.status}</span>
          </article>
        ))}
        {!payments.length && <p className="text-sm text-slate-500">No held or pending payments.</p>}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Open disputes</h2>
      <p className="text-sm text-slate-500"><Link to="/disputes" className="text-amber-700">Resolve on the disputes page</Link></p>
      <div className="mt-3 space-y-2">
        {disputes.slice(0, 8).map((row) => (
          <article key={row._id} className="rounded-xl border bg-white p-4 text-sm">
            <p className="font-medium">{row.campaignId?.eventId?.name || 'Dispute'}</p>
            <p className="text-slate-500">{row.reason}</p>
          </article>
        ))}
        {!disputes.length && <p className="text-sm text-slate-500">No open disputes.</p>}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
