import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PortfolioCard from '../../components/sponsor/PortfolioCard';
import EventReportModal from '../../components/sponsor/EventReportModal';
import campaignApi from '../../services/campaignApi';
import BudgetPacingWidget from '../../components/sponsor/BudgetPacingWidget';

// MODULE 2 | Feature 3: Sponsor Portfolio Handler
const Portfolio = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  // MODULE 2 | Feature 3 Event Editing
  const [reportCampaign, setReportCampaign] = useState(null);
  const [reportMode, setReportMode] = useState('edit');

  const load = async () => {
    try {
      const res = await campaignApi.getMyPortfolio();
      setCampaigns(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (campaignId, status) => {
    setUpdatingId(campaignId);
    setError('');
    try {
      const res = await campaignApi.updateCampaign(campaignId, { status });
      setCampaigns((prev) =>
        prev.map((campaign) => (campaign._id === campaignId ? res.data.data : campaign))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update campaign');
    } finally {
      setUpdatingId('');
    }
  };

  const handleSavedReport = (updated) => {
    setCampaigns((prev) =>
      prev.map((campaign) => (campaign._id === updated._id ? updated : campaign))
    );
    setReportCampaign(null);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-900">Sponsorship portfolio</h1>
        <p className="mt-1 mb-8 text-sm text-slate-500">
          Every sponsored event as a card — spend, live status, and a green / yellow / red health signal.
        </p>

        {/* ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — START ===== */}
        <BudgetPacingWidget />
        {/* ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — END ===== */}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500" />
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}

        {!loading && campaigns.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No sponsored events yet</h3>
            <p className="text-gray-500">Accepted proposals appear here as portfolio campaigns.</p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <PortfolioCard
              key={campaign._id}
              campaign={campaign}
              updating={updatingId === campaign._id}
              onStatusChange={handleStatusChange}
              onEditReport={(item) => {
                setReportMode('edit');
                setReportCampaign(item);
              }}
              onViewReport={(item) => {
                setReportMode('view');
                setReportCampaign(item);
              }}
            />
          ))}
        </div>
      </div>

      {/* MODULE 2 | Feature 3 Event Editing */}
      {reportCampaign && (
        <EventReportModal
          campaign={reportCampaign}
          mode={reportMode}
          onClose={() => setReportCampaign(null)}
          onSaved={handleSavedReport}
        />
      )}
    </DashboardLayout>
  );
};

export default Portfolio;
