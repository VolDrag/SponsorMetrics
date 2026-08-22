import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import volunteerApi from '../../services/volunteerApi';

// ===== MODULE 4 FEATURE 1: Volunteer Management System — START =====
const emptyForm = { name: '', email: '', phone: '', role: 'General', shiftTime: '', notes: '' };

const VolunteerManagement = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const res = await volunteerApi.list(eventId);
      setEvent(res.data.data.event);
      setVolunteers(res.data.data.volunteers || []);
      setEmailLogs(res.data.data.emailLogs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const roles = useMemo(
    () => [...new Set(volunteers.map((row) => row.role).filter(Boolean))],
    [volunteers]
  );

  const visible = volunteers.filter((row) => !roleFilter || row.role === roleFilter);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (volunteer) => {
    setEditing(volunteer);
    setForm({
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone || '',
      role: volunteer.role || 'General',
      shiftTime: volunteer.shiftTime || '',
      notes: volunteer.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (eventSubmit) => {
    eventSubmit.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await volunteerApi.update(editing._id, form);
      } else {
        await volunteerApi.create(eventId, form);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save volunteer');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckIn = async (volunteer) => {
    const res = await volunteerApi.toggleCheckIn(volunteer._id, !volunteer.checkedIn);
    setVolunteers((prev) => prev.map((row) => (row._id === volunteer._id ? res.data.data : row)));
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleEmail = async (eventSubmit) => {
    eventSubmit.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        subject: emailForm.subject,
        body: emailForm.body,
      };
      if (selectedIds.length) payload.volunteerIds = selectedIds;
      else if (roleFilter) payload.role = roleFilter;
      const res = await volunteerApi.email(eventId, payload);
      setMessage(res.data.message);
      setEmailForm({ subject: '', body: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSaving(false);
    }
  };

  const signupUrl = `${window.location.origin}/volunteer-signup/${eventId}`;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <Link to={`/organizer/events/${eventId}`} className="mb-4 inline-flex text-sm text-slate-500 hover:text-slate-800">
          ← Back to event
        </Link>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Volunteer management</h1>
            <p className="text-sm text-slate-500">{event?.name || 'Event roster, check-in, and instructions'}</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            + Add volunteer
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

        <div className="mb-4 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-slate-600">
          Public signup link:{' '}
          <a href={signupUrl} className="font-medium text-amber-700 break-all">{signupUrl}</a>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <p className="text-sm text-slate-500">{visible.filter((row) => row.checkedIn).length}/{visible.length} checked in</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3"></th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Role / shift</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="px-3 py-3">Check-in</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((volunteer) => (
                  <tr key={volunteer._id} className="border-t">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(volunteer._id)}
                        onChange={() => toggleSelected(volunteer._id)}
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-800">
                      {volunteer.name}
                      {volunteer.source === 'self_signup' && (
                        <span className="ml-2 text-xs text-slate-400">self-signup</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {volunteer.role || 'General'}
                      {volunteer.shiftTime ? ` · ${volunteer.shiftTime}` : ''}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {volunteer.email}
                      {volunteer.phone ? ` · ${volunteer.phone}` : ''}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => handleCheckIn(volunteer)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          volunteer.checkedIn ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {volunteer.checkedIn ? 'Checked in' : 'Not in'}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button type="button" onClick={() => openEdit(volunteer)} className="text-sm text-amber-700">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visible.length && <p className="px-4 py-8 text-center text-sm text-slate-500">No volunteers on this roster yet.</p>}
          </div>
        )}

        <form onSubmit={handleEmail} className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Send instructions</h2>
          <p className="mb-3 text-xs text-slate-500">
            Sends to selected volunteers, or everyone in the current role filter, or the full roster.
          </p>
          <input
            value={emailForm.subject}
            onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
            placeholder="Subject"
            className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <textarea
            value={emailForm.body}
            onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
            rows={5}
            placeholder="Shift notes, check-in location, dress code…"
            className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? 'Sending…' : 'Send email'}
          </button>
        </form>

        {emailLogs.length > 0 && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-slate-900">Sent emails</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              {emailLogs.map((log) => (
                <li key={log._id}>
                  {new Date(log.sentAt).toLocaleString()} · {log.subject} · {log.recipientCount} recipients
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={handleSave} className="w-full max-w-md space-y-3 rounded-xl bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit volunteer' : 'Add volunteer'}</h2>
            {['name', 'email', 'phone', 'role', 'shiftTime'].map((field) => (
              <input
                key={field}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={field}
                required={field === 'name' || field === 'email'}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              />
            ))}
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="notes"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border px-4 py-2 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VolunteerManagement;
// ===== MODULE 4 FEATURE 1: Volunteer Management System — END =====
