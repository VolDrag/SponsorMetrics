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
  <div className="mb-6">
    <h3 className="mb-2 text-sm font-semibold text-slate-700">{title}</h3>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {(photos || []).map((photo) => {
        const badge = forensicBadge(photo.mediaForensicsResult);
        return (
          <div key={photo._id || photo.url} className="relative">
            <img src={resolveUploadUrl(photo.url)} alt="" className="h-40 w-full rounded-lg object-cover" />
            <span className={`absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

export const SponsorReportsInbox = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi.getInbox()
      .then((res) => setReports(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">Post-event reports</h1>
        <p className="mt-1 text-sm text-slate-500">Review organizer proof, approve, or request a revision.</p>
        {loading && <div className="mt-8 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500" /></div>}
        <div className="mt-6 space-y-3">
          {reports.map((report) => (
            <Link
              key={report._id}
              to={`/sponsor/reports/${report.proposalId?._id || report.proposalId}`}
              className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-amber-300"
            >
              <p className="font-semibold text-slate-900">{report.eventId?.name}</p>
              <p className="text-sm text-slate-500">{report.status}</p>
            </Link>
          ))}
          {!loading && !reports.length && <p className="text-sm text-slate-500">No reports submitted yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
};

const SponsorReportReview = () => {
  const { proposalId } = useParams();
  const [report, setReport] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [acting, setActing] = useState(false);

  const load = async () => {
    try {
      const res = await reportApi.getReport(proposalId);
      setReport(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report');
    }
  };

  useEffect(() => {
    load();
  }, [proposalId]);

  const locked = report?.status === 'Approved';

  const approve = async () => {
    setActing(true);
    try {
      const res = await reportApi.approveReport(proposalId);
      setReport(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Approve failed');
    } finally {
      setActing(false);
    }
  };

  const requestRevision = async () => {
    setActing(true);
    try {
      const res = await reportApi.requestRevision(proposalId, comment);
      setReport(res.data.data);
      setComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Revision request failed');
    } finally {
      setActing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <Link to="/sponsor/reports" className="mb-4 inline-flex text-sm text-slate-500">← All reports</Link>
        <h1 className="text-2xl font-bold text-slate-900">{report?.eventId?.name || 'Post-event report'}</h1>
        {report && <p className="text-sm text-slate-500">{report.status}{locked ? ' · archived with digital sign-off' : ''}</p>}
        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {report && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 grid gap-3 sm:grid-cols-3 text-sm">
              <p>Reach: <span className="font-semibold">{report.totalReach}</span></p>
              <p>Engagement: <span className="font-semibold">{report.totalEngagement}</span></p>
              <p>Attendees: <span className="font-semibold">{report.attendeeCount}</span></p>
            </div>
            <PhotoGrid title="Crowd photos" photos={report.crowdPhotos} />
            <PhotoGrid title="Engagement screenshots" photos={report.engagementScreenshots} />

            {report.reviewComments?.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold">Revision history</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {report.reviewComments.map((item) => (
                    <li key={item._id} className="rounded-lg bg-slate-50 p-3">
                      {new Date(item.createdAt).toLocaleString()} · {item.comment}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {locked ? (
              <p className="text-sm text-green-700">
                Signed off {report.signOff?.approvedAt ? new Date(report.signOff.approvedAt).toLocaleString() : ''}
              </p>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={acting}
                  onClick={approve}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Approve
                </button>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Request revision with a comment"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={acting || !comment.trim()}
                  onClick={requestRevision}
                  className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-800"
                >
                  Request revision
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SponsorReportReview;
// ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — END =====
