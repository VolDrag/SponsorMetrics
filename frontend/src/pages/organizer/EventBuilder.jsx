import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import eventApi from '../../services/eventApi';

const EventBuilder = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    expectedCrowdSize: '',
    venue: '',
    location: { lat: '', lng: '' },
    date: '',
    socialMediaReach: '',
    contactPhone: '',
    description: '',
    status: 'draft',
  });

  const [tiers] = useState([
    {
      name: 'Gold',
      price: 1500000,
      icon: '🏆',
      color: 'amber',
      benefits: [
        { label: 'Logo Placement (Primary)', included: true },
        { label: '15-Min Speaking Slot', included: true },
        { label: '10x Social Media Posts', included: true },
        { label: 'Premium Booth (20×20)', included: true },
      ]
    },
    {
      name: 'Silver',
      price: 850000,
      icon: '💰',
      color: 'gray',
      benefits: [
        { label: 'Logo Placement (Secondary)', included: true },
        { label: 'Speaking Slot', included: false },
        { label: '5x Social Media Posts', included: true },
        { label: 'Standard Booth (10×10)', included: true },
      ]
    },
    {
      name: 'Bronze',
      price: 450000,
      icon: '⭐',
      color: 'orange',
      benefits: [
        { label: 'Logo Placement (Screen)', included: true },
        { label: 'Speaking Slot', included: false },
        { label: '2x Social Media Posts', included: true },
        { label: 'Booth Space', included: false },
      ]
    }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lat' || name === 'lng') {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        expectedCrowdSize: parseInt(formData.expectedCrowdSize) || 0,
        socialMediaReach: parseInt(formData.socialMediaReach) || 0,
        location: {
          lat: parseFloat(formData.location.lat) || 0,
          lng: parseFloat(formData.location.lng) || 0,
        },
      };
      await eventApi.createEvent(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        expectedCrowdSize: parseInt(formData.expectedCrowdSize) || 0,
        socialMediaReach: parseInt(formData.socialMediaReach) || 0,
        location: {
          lat: parseFloat(formData.location.lat) || 0,
          lng: parseFloat(formData.location.lng) || 0,
        },
      };
      const res = await eventApi.createEvent(payload);
      await eventApi.publishEvent(res.data.data._id);
      navigate('/organizer/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish event');
    } finally {
      setLoading(false);
    }
  };

  const crowdOptions = [
    'Under 100',
    '100 - 500',
    '500 - 1,000',
    '1,000 - 5,000',
    '5,000 - 10,000',
    '10,000+',
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold">SponsorMetrics BD</h1>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Enterprise Console</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link to="/organizer/events" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            My Events
          </Link>
          <Link to="/organizer/events/new" className="flex items-center gap-3 px-4 py-3 bg-amber-600/20 text-amber-400 rounded-lg">
            New Event
          </Link>
          <Link to="/organizer/proposal-analyzer" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            Proposal Analyzer
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Event Profile and Event Details</h1>
          <p className="text-gray-500 mb-8">Create high-conversion tiers for your upcoming event in Dhaka.</p>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
              <span className={`text-sm font-semibold ${step >= 1 ? 'text-amber-700' : 'text-gray-400'}`}>Event Details</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
              <span className={`text-sm ${step >= 2 ? 'text-amber-700 font-semibold' : 'text-gray-400'}`}>Tier Package Creator</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
              <span className={`text-sm ${step >= 3 ? 'text-amber-700 font-semibold' : 'text-gray-400'}`}>Review & Publish</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
              Event saved as draft successfully!
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-amber-600">📋</span> Step 1: Event Details
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dhaka Tech Summit 2024"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Expected Crowd Size</label>
                <select
                  name="expectedCrowdSize"
                  value={formData.expectedCrowdSize}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Select range</option>
                  {crowdOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Venue</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="International Convention City Bashundhara"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Event Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Event Organiser</label>
                <input
                  type="text"
                  value={user?.organizationName || user?.name || 'BRAC University'}
                  readOnly
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contact</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+880171123451"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Social Media Reach</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Facebook</p>
                    <input
                      type="text"
                      name="socialMediaReach"
                      value={formData.socialMediaReach}
                      onChange={handleChange}
                      placeholder="150K+ Followers"
                      className="text-xs text-gray-500 bg-transparent border-none outline-none w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
                  <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Instagram</p>
                    <p className="text-xs text-gray-500">45K+ Followers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your event..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Latitude</label>
                <input
                  type="number"
                  name="lat"
                  value={formData.location.lat}
                  onChange={handleChange}
                  placeholder="23.8103"
                  step="any"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Longitude</label>
                <input
                  type="number"
                  name="lng"
                  value={formData.location.lng}
                  onChange={handleChange}
                  placeholder="90.4125"
                  step="any"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div> 

 
          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={handlePublish}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Save'} <span>→</span>
            </button>
          </div>
        </div>
      </main>

      {/* Right Panel */}
      <aside className="w-[340px] bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Ask about the event..</h3>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Organizer Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-amber-600">EO</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 max-w-[240px]">
              <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Event Organizer</p>
              <p className="text-xs text-gray-700 leading-relaxed">There are volunteers across the hall to get your food tokens before lunch.</p>
              <p className="text-[10px] text-gray-400 mt-1 text-right">10:45 AM</p>
            </div>
          </div>

          {/* User Message */}
          <div className="flex gap-3 justify-end">
            <div className="bg-slate-800 rounded-lg p-3 max-w-[240px]">
              <p className="text-xs text-white leading-relaxed">Got it. How do I get the gate pass if I am late for the event?</p>
              <p className="text-[10px] text-gray-400 mt-1 text-right">11:12 AM</p>
            </div>
          </div>

          {/* Organizer Reply */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-amber-600">EO</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 max-w-[240px]">
              <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Event Organizer</p>
              <p className="text-xs text-gray-700 leading-relaxed">Contact our Management team. The contact is given at the event description.</p>
              <p className="text-[10px] text-gray-400 mt-1 text-right">11:30 AM</p>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <input
              type="text"
              placeholder="Write a comment or revision request..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-700"
            />
            <button className="text-amber-500 hover:text-amber-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400">Secured by SponsorMetrics Escrow</p>
          <p className="text-[10px] text-gray-400">Protocol. Funds will be released within 24 hours of approval.</p>
        </div>
      </aside>
    </div>
  );
};

export default EventBuilder;