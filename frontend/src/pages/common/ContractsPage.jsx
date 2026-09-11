import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { contractApi } from '../../services/platformApi';

const ContractsPage = () => {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const res = await contractApi.list();
    setRows(res.data.data || []);
  };
  useEffect(() => { load().catch((err) => setError(err.response?.data?.message || 'Failed to load')); }, []);

  const sign = async (id) => {
    if (!name.trim()) return setError('Type your full legal name first');
    await contractApi.sign(id, name.trim());
    load();
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">Contracts</h1>
      <p className="mt-1 text-sm text-slate-500">Typed name + timestamp + IP is the lightweight e-signature. Both parties must sign before the contract is executed.</p>
      {error && <p className="mt-3 text-red-600">{error}</p>}
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type full name to sign" className="mt-4 w-full max-w-md rounded border px-3 py-2" />
      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <article key={row._id} className="rounded-xl border bg-white p-4">
            <p className="font-semibold">BDT {Number(row.agreedBudget || 0).toLocaleString()} · {row.status}</p>
            <p className="text-sm text-slate-500">Organizer signed: {row.signedByOrganizer ? 'yes' : 'no'} · Sponsor signed: {row.signedBySponsor ? 'yes' : 'no'}</p>
            <div className="mt-3 flex gap-3">
              {row.pdfUrl && <a href={row.pdfUrl} target="_blank" rel="noreferrer" className="text-sm text-amber-700">Download PDF</a>}
              {row.status !== 'executed' && (
                <button type="button" onClick={() => sign(row._id)} className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">Sign</button>
              )}
            </div>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ContractsPage;
