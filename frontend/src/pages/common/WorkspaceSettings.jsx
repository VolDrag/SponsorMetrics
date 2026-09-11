import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { teamApi, verificationApi } from '../../services/platformApi';

const WorkspaceSettings = () => {
  const [members, setMembers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [message, setMessage] = useState('');

  const load = async () => {
    const [team, log] = await Promise.all([teamApi.list(), teamApi.activity()]);
    setMembers(team.data.data || []);
    setActivity(log.data.data || []);
  };
  useEffect(() => { load().catch((err) => setMessage(err.response?.data?.message || 'Load failed')); }, []);

  const invite = async (e) => {
    e.preventDefault();
    await teamApi.invite({ email, permission });
    setEmail('');
    load();
  };

  const submitKyc = async (e) => {
    e.preventDefault();
    const files = e.target.documents.files;
    const form = new FormData();
    form.append('documentType', 'trade_license');
    Array.from(files).forEach((file) => form.append('documents', file));
    await verificationApi.submit(form);
    setMessage('KYC submitted for admin review');
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">Workspace</h1>
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      <section className="mt-8 rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Team seats</h2>
        <form onSubmit={invite} className="mt-3 flex flex-wrap gap-2">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@org.com" className="rounded border px-3 py-2" />
          <select value={permission} onChange={(e) => setPermission(e.target.value)} className="rounded border px-3 py-2">
            <option value="view">View-only</option>
            <option value="negotiate">Negotiate</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">Invite</button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {members.map((row) => (
            <li key={row._id} className="flex justify-between">
              <span>{row.invitedEmail} · {row.seatRole || row.permission} · {row.status}</span>
              {row.status !== 'revoked' && (
                <button type="button" className="text-red-600" onClick={() => teamApi.revoke(row._id).then(load)}>Revoke</button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8 rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Organization verification</h2>
        <form onSubmit={submitKyc} className="mt-3 space-y-3">
          <input name="documents" type="file" accept="image/*" multiple required />
          <button type="submit" className="rounded bg-amber-500 px-4 py-2 font-semibold">Upload trade license</button>
        </form>
      </section>
      <section className="mt-8 rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Activity</h2>
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          {activity.map((row) => (
            <li key={row._id}>{new Date(row.createdAt).toLocaleString()} — {row.action}</li>
          ))}
        </ul>
      </section>
    </DashboardLayout>
  );
};

export default WorkspaceSettings;
