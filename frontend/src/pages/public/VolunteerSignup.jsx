import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import volunteerApi from '../../services/volunteerApi';

// ===== MODULE 4 FEATURE 1: Volunteer Management System — START =====
const VolunteerSignup = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'General', shiftTime: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    volunteerApi.publicEvent(eventId)
      .then((res) => setEvent(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Event not found'));
  }, [eventId]);

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setSaving(true);
    setError('');
    try {
      await volunteerApi.publicSignup(eventId, form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Volunteer signup</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{event?.name || 'Event'}</h1>
        {event?.venue && <p className="text-sm text-slate-500">{event.venue}</p>}
        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {done ? (
          <p className="mt-6 text-sm text-green-700">You are on the roster. See you at the event.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role (usher, registration…)" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input value={form.shiftTime} onChange={(e) => setForm({ ...form, shiftTime: e.target.value })} placeholder="Preferred shift" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600">
              {saving ? 'Submitting…' : 'Join roster'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VolunteerSignup;
// ===== MODULE 4 FEATURE 1: Volunteer Management System — END =====
