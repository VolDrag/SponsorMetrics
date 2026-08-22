import React from 'react';
import { resolveUploadUrl } from '../../services/campaignApi';

// MODULE 2 | Feature 3: Sponsor Portfolio Handler — campaign card
const healthStyles = {
  green: { dot: 'bg-green-500', label: 'On track', ring: 'ring-green-200' },
  yellow: { dot: 'bg-yellow-400', label: 'Watch', ring: 'ring-yellow-200' },
  red: { dot: 'bg-red-500', label: 'At risk', ring: 'ring-red-200' },
};

const statusStyles = {
  active: 'bg-green-100 text-green-700 border-green-200',
  upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
};

const formatBdt = (value) => `BDT ${Number(value || 0).toLocaleString()}`;
const formatNum = (value) => Number(value || 0).toLocaleString();

const hasReport = (report) => Boolean(report?.submittedAt);

const PortfolioCard = ({ campaign, onStatusChange, updating, onEditReport, onViewReport }) => {
  const health = healthStyles[campaign.healthIndicator] || healthStyles.green;
  const event = campaign.eventId || {};
  const report = campaign.eventReport || {};
  const isCompleted = campaign.status === 'completed';
  const photos = (report.photos || []).slice(0, 3);

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ring-2 ${health.ring}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{event.name || 'Sponsored event'}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {event.venue || 'Venue TBC'}
            {event.date ? ` · ${new Date(event.date).toLocaleDateString()}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1">
          <span className={`h-2.5 w-2.5 rounded-full ${health.dot}`} />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            {health.label}
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[campaign.status] || statusStyles.upcoming}`}>
          {campaign.status}
        </span>
        <span className="text-sm font-semibold text-slate-900">{formatBdt(campaign.spend)} spend</span>
      </div>

      {/* ========== MODULE 2 | Feature 3 Event Editing — START ========== */}
      {hasReport(report) && (
        <div className="mb-4 rounded-lg border border-gray-100 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Event report</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
            <p>Reach: <span className="font-semibold">{formatNum(report.reach)}</span></p>
            <p>Attendance: <span className="font-semibold">{formatNum(report.attendance)}</span></p>
            <p>Revenue: <span className="font-semibold">{formatBdt(report.revenue)}</span></p>
            <p>Profit: <span className="font-semibold">{formatBdt(report.profit)}</span></p>
          </div>
          {photos.length > 0 && (
            <div className="mt-3 flex gap-1.5">
              {photos.map((photo) => (
                <img
                  key={photo}
                  src={resolveUploadUrl(photo)}
                  alt=""
                  className="h-12 w-12 rounded object-cover"
                />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => onViewReport(campaign)}
            className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-800"
          >
            View full details →
          </button>
        </div>
      )}
      {/* ========== MODULE 2 | Feature 3 Event Editing summary — END ========== */}

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-500">Manage status</label>
        <select
          value={campaign.status}
          disabled={updating}
          onChange={(e) => onStatusChange(campaign._id, e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
        >
          <option value="upcoming">Upcoming</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* MODULE 2 | Feature 3 Event Editing — only enabled when status is Completed */}
      <button
        type="button"
        disabled={!isCompleted}
        onClick={() => isCompleted && onEditReport(campaign)}
        title={isCompleted ? 'Add post-event stats and photos' : 'Mark this sponsorship as Completed to edit the event report'}
        className="mt-3 w-full rounded-lg bg-[#1E2337] px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      >
        Edit Event Report
      </button>
    </div>
  );
};

export default PortfolioCard;
