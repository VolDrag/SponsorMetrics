import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import campaignApi, { resolveUploadUrl } from '../../services/campaignApi';

// MODULE 2 | Feature 3 Event Editing — form/modal for stats, profit, photos
const STAT_FIELDS = [
  { name: 'reach', label: 'Reach' },
  { name: 'engagement', label: 'Engagement' },
  { name: 'leads', label: 'Leads' },
  { name: 'conversions', label: 'Conversions' },
  { name: 'likes', label: 'Likes' },
  { name: 'shares', label: 'Shares' },
  { name: 'attendance', label: 'Attendance' },
  { name: 'audienceGrowth', label: 'Audience growth' },
];

const emptyForm = {
  reach: '',
  engagement: '',
  leads: '',
  conversions: '',
  likes: '',
  shares: '',
  attendance: '',
  audienceGrowth: '',
  revenue: '',
  profit: '',
};

const fromReport = (report = {}) => ({
  reach: report.reach ?? '',
  engagement: report.engagement ?? '',
  leads: report.leads ?? '',
  conversions: report.conversions ?? '',
  likes: report.likes ?? '',
  shares: report.shares ?? '',
  attendance: report.attendance ?? '',
  audienceGrowth: report.audienceGrowth ?? '',
  revenue: report.revenue ?? '',
  profit: report.profit ?? '',
});

const EventReportModal = ({ campaign, mode = 'edit', onClose, onSaved }) => {
  const report = campaign.eventReport || {};
  const [form, setForm] = useState(fromReport(report));
  const [existingPhotos, setExistingPhotos] = useState(report.photos || []);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(fromReport(campaign.eventReport));
    setExistingPhotos(campaign.eventReport?.photos || []);
    setNewFiles([]);
    setError('');
  }, [campaign]);

  const previews = useMemo(
    () => newFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [newFiles]
  );

  useEffect(() => {
    return () => previews.forEach((item) => URL.revokeObjectURL(item.url));
  }, [previews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setNewFiles((prev) => [...prev, ...picked].slice(0, 10));
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      formData.append('existingPhotos', JSON.stringify(existingPhotos));
      newFiles.forEach((file) => formData.append('photos', file));

      const res = await campaignApi.updateEventReport(campaign._id, formData);
      onSaved(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event report');
    } finally {
      setLoading(false);
    }
  };

  const eventName = campaign.eventId?.name || 'Sponsored event';
  const isView = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4">
      <div className="my-8 w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isView ? 'Event report' : 'Edit event report'}
            </h2>
            <p className="text-sm text-gray-500">{eventName}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Post-event stats</h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {STAT_FIELDS.map((field) => (
                <label key={field.name} className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600">{field.label}</span>
                  <input
                    type="number"
                    min="0"
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    readOnly={isView}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 read-only:bg-gray-50"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Financials</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-gray-600">Revenue (BDT)</span>
                <input
                  type="number"
                  min="0"
                  name="revenue"
                  value={form.revenue}
                  onChange={handleChange}
                  readOnly={isView}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 read-only:bg-gray-50"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-gray-600">Profit (BDT)</span>
                <input
                  type="number"
                  name="profit"
                  value={form.profit}
                  onChange={handleChange}
                  readOnly={isView}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 read-only:bg-gray-50"
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Event photos</h3>
            {existingPhotos.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-2 md:grid-cols-4">
                {existingPhotos.map((photo) => (
                  <div key={photo} className="relative">
                    <img
                      src={resolveUploadUrl(photo)}
                      alt="Event"
                      className="h-24 w-full rounded-lg object-cover"
                    />
                    {!isView && (
                      <button
                        type="button"
                        onClick={() => setExistingPhotos((prev) => prev.filter((item) => item !== photo))}
                        className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-gray-700 hover:bg-white"
                        aria-label="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {previews.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-2 md:grid-cols-4">
                {previews.map((item, index) => (
                  <div key={item.url} className="relative">
                    <img src={item.url} alt="New upload" className="h-24 w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== index))}
                      className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-gray-700 hover:bg-white"
                      aria-label="Remove new photo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!isView && (
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleFiles}
                className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-amber-700 hover:file:bg-amber-100"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {isView ? 'Close' : 'Cancel'}
            </button>
            {!isView && (
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Save report'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventReportModal;
