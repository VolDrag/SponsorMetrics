import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { disputeApi } from '../../services/platformApi';

const DisputesPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [activeId, setActiveId] = useState('');

  const load = async () => {
    const res = await disputeApi.list();
    setRows(res.data.data || []);
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load disputes'));
  }, []);

  const addComment = async (id) => {
    if (!comment.trim()) return;
    await disputeApi.comment(id, comment.trim());
    setComment('');
    setActiveId('');
    load();
  };

  const resolve = async (id, action) => {
    const notes = window.prompt('Resolution notes') || '';
    await disputeApi.resolve(id, action, notes);
    load();
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">Disputes</h1>
        <p className="mt-1 text-sm text-slate-500">Open from the Payments page when delivery or payment needs a human review.</p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-6 space-y-3">
          {rows.map((row) => (
            <article key={row._id} className="rounded-xl border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{row.campaignId?.eventId?.name || 'Campaign dispute'}</p>
                  <p className="text-sm text-slate-500">
                    Opened by {row.openedBy?.organizationName || row.openedBy?.name} · {row.status}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs capitalize">{row.status}</span>
              </div>
              <p className="mt-3 text-sm text-slate-700">{row.reason}</p>
              {row.thread?.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {row.thread.map((item, index) => (
                    <li key={item._id || index} className="rounded bg-slate-50 px-3 py-2">
                      {item.role}: {item.message}
                    </li>
                  ))}
                </ul>
              )}
              {row.status === 'open' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeId === row._id ? (
                    <>
                      <input value={comment} onChange={(e) => setComment(e.target.value)} className="flex-1 rounded border px-3 py-2 text-sm" placeholder="Add a comment" />
                      <button type="button" onClick={() => addComment(row._id)} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Send</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setActiveId(row._id)} className="rounded border px-3 py-2 text-sm">Comment</button>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <button type="button" onClick={() => resolve(row._id, 'release')} className="rounded bg-green-600 px-3 py-2 text-sm text-white">Release funds</button>
                      <button type="button" onClick={() => resolve(row._id, 'refund')} className="rounded bg-red-600 px-3 py-2 text-sm text-white">Refund</button>
                      <button type="button" onClick={() => resolve(row._id, 'closed')} className="rounded border px-3 py-2 text-sm">Close</button>
                    </>
                  )}
                </div>
              )}
            </article>
          ))}
          {!rows.length && <p className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">No disputes yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DisputesPage;
