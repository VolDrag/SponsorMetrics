import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProposalStrengthPanel from '../../components/common/ProposalStrengthPanel';

const ProposalStrengthAnalyzer = () => {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    name: 'Dhaka Tech Summit 2026',
    expectedCrowdSize: 7500,
    budget: 1500000,
    description: 'A premier technology summit bringing together industry leaders, innovators, and university students across Bangladesh. The event features keynote speeches, workshops, and startup pitching.',
    venue: 'International Convention City Bashundhara (ICCB)',
    date: '2026-10-15',
    socialMediaReach: 150000,
    contactEmail: 'info@dhakatechsummit.com',
    tiers: [
      { name: 'Gold', price: 1500000 },
      { name: 'Silver', price: 850000 },
      { name: 'Bronze', price: 450000 }
    ]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold">SponsorMetrics BD</h1>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Enterprise Console</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link to="/organizer/events" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            My Events
          </Link>
          <Link to="/organizer/proposal-analyzer" className="flex items-center gap-3 px-4 py-3 bg-amber-600/20 text-amber-400 rounded-lg font-medium">
            Proposal Analyzer
          </Link>
        </nav>
        <div className="p-4">
          <Link
            to="/organizer/events/new"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            New Event
          </Link>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 p-8 flex gap-8 overflow-y-auto">
        <main className="flex-1 max-w-3xl bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-6">
            <Link
              to="/organizer/events"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
            >
              ← Back to Events
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Proposal Strength Analyzer</h1>
            <p className="text-gray-500 text-sm mt-1">Evaluate your sponsorship proposal's readiness, pricing, and audience appeal before sending to sponsors.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Event Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Audience Size</label>
                <input type="number" name="expectedCrowdSize" value={formData.expectedCrowdSize} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Venue Details</label>
                <input type="text" name="venue" value={formData.venue} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Event Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Total Budget (BDT)</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Social Media Reach</label>
                <input type="number" name="socialMediaReach" value={formData.socialMediaReach} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Email</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Proposal Overview & Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
        </main>

        <aside className="w-[360px] flex-shrink-0">
          <ProposalStrengthPanel proposalData={formData} />
        </aside>
      </div>
    </div>
  );
};

export default ProposalStrengthAnalyzer;
