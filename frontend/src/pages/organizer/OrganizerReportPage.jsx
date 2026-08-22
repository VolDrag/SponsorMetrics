import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import reportApi from '../../services/reportApi';
import { resolveUploadUrl } from '../../services/campaignApi';

// ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — START =====
const forensicBadge = (result) => {
  const status = result?.verificationStatus || 'Unverified';
  if (status === 'Verified') return { label: '✅ Verified', cls: 'bg-green-100 text-green-700' };
  if (status === 'Needs Review') return { label: '⚠ Needs Review', cls: 'bg-amber-100 text-amber-800' };
  return { label: '— Unverified', cls: 'bg-slate-100 text-slate-600' };
};

const PhotoGrid = ({ title, photos }) => (
  <div>
    <h3 className="mb-2 text-sm font-semibold text-slate-700">{title}</h3>
    {!photos?.length && <p className="text-sm text-slate-400">None uploaded yet.</p>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {(photos || []).map((photo) => {
        const badge = forensicBadge(photo.mediaForensicsResult);
        return (
          <div key={photo._id || photo.url} className="relative">
            <img src={resolveUploadUrl(photo.url)} alt="" className="h-32 w-full rounded-lg object-cover" />
            <span className={`absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

const OrganizerReportPage = () => {
  const { proposalId } = useParams();
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({ totalReach: '', totalEngagement: '', attendeeCount: '' });
  const [crowdFiles, setCrowdFiles] = useState([]);
  const [shotFiles, setShotFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const res = await reportApi.getReport(proposalId);
      setReport(res.data.data);
      setForm({
        totalReach: res.data.data.totalReach ?? '',
        totalEngagement: res.data.data.totalEngagement ?? '',
        attendeeCount: res.data.data.attendeeCount ?? '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [proposalId]);

  const locked = report?.status === 'Approved';
  const canEdit = report && ['Draft', 'Revision Requested'].includes(report.status);

  const handleSave = async (submitEvent) => {
    submitEvent.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const data = new FormData();
      data.append('totalReach', form.totalReach);
      data.append('totalEngagement', form.totalEngagement);
      data.append('attendeeCount', form.attendeeCount);
      crowdFiles.forEach((file) => data.append('crowdPhotos', file));
      shotFiles.forEach((file) => data.append('engagementScreenshots', file));
      const res = await reportApi.saveReport(proposalId, data);
      setReport(res.data.data);
      setCrowdFiles([]);
      setShotFiles([]);
      setMessage('Draft saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await reportApi.submitReport(proposalId);
      setReport(res.data.data);
      setMessage('Submitted for sponsor review.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <Link to="/organizer/events" className="mb-4 inline-flex text-sm text-slate-500">← Events</Link>
        <h1 className="text-2xl font-bold text-slate-900">Post-event report</h1>
        {report && (
          <p className="mt-1 text-sm text-slate-500">
            {report.eventId?.name} · {report.status}
            {locked ? ' · archived' : ''}
          </p>
        )}
        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
        {loading && <div className="mt-8 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500" /></div>}

        {report && (
          <form onSubmit={handleSave} className="mt-6 space-y-5 rounded-xl border border-gray-200 bg-white p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {['totalReach', 'totalEngagement', 'attendeeCount'].map((field) => (
                <label key={field} className="text-sm">
                  <span className="mb-1 block font-medium text-slate-600">{field.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="number"
                    min="0"
                    disabled={!canEdit}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 disabled:bg-slate-50"
                  />
                </label>
              ))}
            </div>
            {canEdit && (
              <>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-600">Crowd photos</span>
                  <input type="file" accept="image/*" multiple onChange={(e) => setCrowdFiles([...e.target.files])} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-600">Engagement screenshots</span>
                  <input type="file" accept="image/*" multiple onChange={(e) => setShotFiles([...e.target.files])} />
                </label>
              </>
            )}
            <PhotoGrid title="Crowd photos" photos={report.crowdPhotos} />
            <PhotoGrid title="Engagement screenshots" photos={report.engagementScreenshots} />

            {report.reviewComments?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Revision comments</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {report.reviewComments.map((item) => (
                    <li key={item._id} className="rounded-lg bg-slate-50 p-3">
                      {new Date(item.createdAt).toLocaleString()} · {item.comment}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {canEdit && (
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="rounded-lg border px-4 py-2 text-sm font-medium">
                  Save draft
                </button>
                <button type="button" disabled={saving} onClick={handleSubmit} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
                  Submit for review
                </button>
              </div>
            )}
            {locked && report.signOff?.approvedAt && (
              <p className="text-sm text-green-700">
                Digitally signed {new Date(report.signOff.approvedAt).toLocaleString()}
              </p>
            )}
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrganizerReportPage;
// ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — END =====
