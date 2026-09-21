import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { paymentApi, disputeApi, adminApi } from '../../services/platformApi';
import { resolveUploadUrl } from '../../services/campaignApi';

const formatBdt = (value) => `BDT ${Number(value || 0).toLocaleString()}`;

const escrowStyles = {
  none: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-800',
  held: 'bg-blue-100 text-blue-800',
  released: 'bg-green-100 text-green-800',
  refunded: 'bg-red-100 text-red-700',
};

const PaymentsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState('');
  const [disputeFor, setDisputeFor] = useState('');
  const [disputeReason, setDisputeReason] = useState('');

  const load = async () => {
    const res = await paymentApi.list();
    setRows(res.data.data || []);
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load payments'));
  }, []);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'funded') setMessage('Escrow funded. The organizer can see the hold on this page.');
    if (status === 'cancelled') setError('Payment was cancelled before escrow was funded.');
  }, [searchParams]);

  const totals = useMemo(() => {
    const held = rows.filter((row) => row.escrowStatus === 'held').reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const pending = rows.filter((row) => row.status === 'initiated' && row.escrowStatus !== 'held').reduce((sum, row) => sum + Number(row.amount || 0), 0);
    return { held, pending, count: rows.length };
  }, [rows]);

  const eventName = (row) => row.campaignId?.eventId?.name || 'Sponsorship';
  const counterparty = (row) => {
    if (user?.role === 'sponsor') return row.organizerId?.organizationName || row.organizerId?.name || 'Organizer';
    return row.sponsorId?.organizationName || row.sponsorId?.name || 'Sponsor';
  };

  const pay = async (id) => {
    setBusyId(id);
    setError('');
    try {
      const res = await paymentApi.checkout(id);
      if (res.data.bkashURL) {
        window.location.assign(res.data.bkashURL);
        return;
      }
      setMessage(res.data.message || 'Escrow funded');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setBusyId('');
    }
  };

  const refund = async (id) => {
    const reason = window.prompt('Refund reason') || '';
    if (!reason.trim()) return;
    setBusyId(id);
    try {
      await (user?.role === 'admin' ? adminApi.refund(id, reason) : paymentApi.refund(id, reason));
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Refund failed');
    } finally {
      setBusyId('');
    }
  };

  const release = async (id) => {
    setBusyId(id);
    try {
      await adminApi.release(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Release failed');
    } finally {
      setBusyId('');
    }
  };

  const openDispute = async (row) => {
    const campaignId = row.campaignId?._id || row.campaignId;
    if (!campaignId) return setError('This payment is not linked to a campaign yet.');
    if (!disputeReason.trim()) return setError('Describe the dispute first.');
    setBusyId(row._id);
    try {
      await disputeApi.create({ campaignId, reason: disputeReason.trim() });
      setDisputeFor('');
      setDisputeReason('');
      setMessage('Dispute opened. Track it on the Disputes page.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not open dispute');
    } finally {
      setBusyId('');
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-slate-900">Payments & escrow</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user?.role === 'sponsor'
            ? 'Fund escrow after a deal is accepted. Money stays held until you approve the post-event report (or an admin releases it).'
            : 'Track sponsor escrow for your accepted deals. Funds are released after report approval.'}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs uppercase text-slate-500">Payments</p>
            <p className="mt-1 text-2xl font-bold">{totals.count}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs uppercase text-slate-500">Awaiting payment</p>
            <p className="mt-1 text-2xl font-bold">{formatBdt(totals.pending)}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs uppercase text-slate-500">Held in escrow</p>
            <p className="mt-1 text-2xl font-bold">{formatBdt(totals.held)}</p>
          </div>
        </div>

        {message && <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p>}
        {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6 space-y-3">
          {rows.map((row) => {
            const needsPay = user?.role === 'sponsor' && row.status === 'initiated' && row.escrowStatus !== 'held' && row.escrowStatus !== 'released' && row.escrowStatus !== 'refunded';
            const canRefund = (user?.role === 'sponsor' || user?.role === 'admin') && row.escrowStatus === 'held';
            const campaignId = row.campaignId?._id || row.campaignId;
            return (
              <article key={row._id} className="rounded-xl border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{eventName(row)}</p>
                    <p className="text-sm text-slate-500">
                      {counterparty(row)} · {formatBdt(row.amount)} · {row.invoiceNumber || row._id.slice(-8)}
                    </p>
                    {row.trxID && <p className="text-xs text-slate-400">Trx {row.trxID}{row.mock ? ' · sandbox' : ''}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700">{row.status}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${escrowStyles[row.escrowStatus] || escrowStyles.none}`}>
                      escrow {row.escrowStatus}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {needsPay && (
                    <button
                      type="button"
                      disabled={busyId === row._id}
                      onClick={() => pay(row._id)}
                      className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900"
                    >
                      {row.mock ? 'Pay with bKash (sandbox)' : 'Pay with bKash'}
                    </button>
                  )}
                  {row.invoiceUrl && (
                    <a
                      href={resolveUploadUrl(row.invoiceUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border px-4 py-2 text-sm font-medium text-amber-800"
                    >
                      Invoice PDF
                    </a>
                  )}
                  {user?.role === 'admin' && row.escrowStatus === 'held' && (
                    <button type="button" disabled={busyId === row._id} onClick={() => release(row._id)} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white">
                      Release escrow
                    </button>
                  )}
                  {canRefund && (
                    <button type="button" disabled={busyId === row._id} onClick={() => refund(row._id)} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700">
                      Refund
                    </button>
                  )}
                  {campaignId && (
                    <button type="button" onClick={() => setDisputeFor(row._id)} className="rounded-lg border px-4 py-2 text-sm">
                      Open dispute
                    </button>
                  )}
                  <Link to="/disputes" className="rounded-lg px-4 py-2 text-sm text-slate-600">View disputes</Link>
                </div>
                {disputeFor === row._id && (
                  <form
                    className="mt-3 flex flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      openDispute(row);
                    }}
                  >
                    <input
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="What went wrong?"
                      className="min-w-[16rem] flex-1 rounded border px-3 py-2 text-sm"
                    />
                    <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-sm text-white">Submit dispute</button>
                  </form>
                )}
              </article>
            );
          })}
          {!rows.length && (
            <div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">
              No payments yet. When a proposal is accepted, the sponsor funds escrow from this page.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentsPage;
