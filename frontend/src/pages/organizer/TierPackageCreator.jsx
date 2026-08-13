import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Blocks,
  Pencil,
  LayoutDashboard,
  Store,
  Target,
  BarChart3,
  FileText,
  Settings,
  Search,
  Plus,
  HelpCircle,
  LogOut,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import TierCard from '../../components/organizer/TierCard';
import tierApi, { benefitPresets } from '../../services/tierApi';

class TierErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TierPackageCreator error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white border border-red-200 rounded-xl p-8 max-w-md text-center shadow-lg">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-6">
              {this.state.error?.message || 'An error occurred while loading sponsorship tiers.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => (window.location.href = '/organizer/events')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Back to Events
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const TierPackageCreatorContent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || '');
  const [tiers, setTiers] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [savingTierId, setSavingTierId] = useState('');
  const [deletingTierId, setDeletingTierId] = useState('');
  const [generatingStandard, setGeneratingStandard] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sponsorshipDetails, setSponsorshipDetails] = useState(
    "I need sponsor's for my university clubs function. The club works as an advocate of cultural diversity of our country.\n\nFor the event we need financial backing to cover:\n• Event Budgets: Funding for guest speaker fees, venue bookings, production setups, and prize pools for competitions.\n• Club Merchandise: Subsidizing the cost of club t-shirts, hoodies, and lanyards so our members can wear them proudly without breaking the bank.\n• Operational Costs: Web hosting for our site, registration fees for national competitions, and general administrative needs."
  );

  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      setError('');
      try {
        const data = await tierApi.getOrganizerEvents();
        const eventList = Array.isArray(data?.events)
          ? data.events
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setEvents(eventList);

        if (eventId && eventList.some((e) => e && String(e._id) === String(eventId))) {
          setSelectedEventId(String(eventId));
        } else if (eventList.length > 0 && eventList[0]?._id) {
          setSelectedEventId(String(eventList[0]._id));
        }
      } catch (apiError) {
        setError(apiError?.response?.data?.message || apiError?.message || 'Failed to load events.');
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [eventId]);

  useEffect(() => {
    if (!selectedEventId) {
      setTiers([]);
      return;
    }
    const fetchTiers = async () => {
      setLoadingTiers(true);
      setError('');
      try {
        const data = await tierApi.getTiersByEvent(selectedEventId);
        const fetchedTiers = Array.isArray(data?.tiers)
          ? data.tiers
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setTiers(fetchedTiers);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || apiError?.message || 'Failed to load tiers.');
      } finally {
        setLoadingTiers(false);
      }
    };
    fetchTiers();
  }, [selectedEventId]);

  const handleEventChange = (newEventId) => {
    setSelectedEventId(newEventId);
    if (newEventId) {
      navigate(`/organizer/events/${newEventId}/tiers`);
    }
  };

  const handleAddTier = async () => {
    if (!selectedEventId) return;
    setError('');
    setMessage('');
    try {
      const payload = {
        eventId: selectedEventId,
        name: `Tier ${tiers.length + 1}`,
        price: 0,
        isCustom: true,
        benefits: [],
      };
      const data = await tierApi.createTier(payload);
      if (data?.tier) {
        setTiers((prev) => [...prev, data.tier]);
        setMessage('Tier added successfully.');
      }
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to add tier.');
    }
  };

  const handleSetupStandardPackages = async () => {
    if (!selectedEventId) return;
    setGeneratingStandard(true);
    setError('');
    setMessage('');

    const standardPackages = [
      {
        name: 'Gold',
        price: 50000,
        isCustom: false,
        benefits: [
          { label: 'Logo on Main Banner', detail: 'Logo placement on the main stage/event banner' },
          { label: 'Speaking Slot', detail: '10-minute speaking slot during the event program' },
          { label: 'Facebook Posts', detail: '5 dedicated Facebook posts' },
          { label: 'Booth Space', detail: 'Dedicated booth space at the event venue' },
          { label: 'Banner Placement', detail: 'Banner placement in high-traffic venue areas' },
          { label: 'Email Mention', detail: 'Sponsor mention in organizer email campaigns' },
        ],
      },
      {
        name: 'Silver',
        price: 30000,
        isCustom: false,
        benefits: [
          { label: 'Logo on Main Banner', detail: 'Logo placement on the main stage/event banner' },
          { label: 'Facebook Posts', detail: '5 dedicated Facebook posts' },
          { label: 'Banner Placement', detail: 'Banner placement in high-traffic venue areas' },
          { label: 'Email Mention', detail: 'Sponsor mention in organizer email campaigns' },
        ],
      },
      {
        name: 'Bronze',
        price: 15000,
        isCustom: false,
        benefits: [
          { label: 'Logo on Main Banner', detail: 'Logo placement on the main stage/event banner' },
          { label: 'Facebook Posts', detail: '5 dedicated Facebook posts' },
        ],
      },
    ];

    try {
      const createdTiers = [];
      for (const pkg of standardPackages) {
        const data = await tierApi.createTier({
          eventId: selectedEventId,
          ...pkg,
        });
        if (data?.tier) {
          createdTiers.push(data.tier);
        }
      }
      setTiers((prev) => [...prev, ...createdTiers]);
      setMessage('Standard Gold, Silver, and Bronze packages created successfully!');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to create standard packages.');
    } finally {
      setGeneratingStandard(false);
    }
  };

  const handleSaveTier = async (tierId, payload) => {
    setSavingTierId(tierId);
    setError('');
    setMessage('');
    try {
      const data = await tierApi.updateTier(tierId, payload);
      if (data?.tier) {
        setTiers((prev) => prev.map((t) => (t && t._id === tierId ? data.tier : t)));
        setMessage('Tier updated successfully.');
      }
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to update tier.');
    } finally {
      setSavingTierId('');
    }
  };

  const handleDeleteTier = async (tierId) => {
    setDeletingTierId(tierId);
    setError('');
    setMessage('');
    try {
      await tierApi.deleteTier(tierId);
      setTiers((prev) => prev.filter((t) => t && t._id !== tierId));
      setMessage('Tier deleted successfully.');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to delete tier.');
    } finally {
      setDeletingTierId('');
    }
  };

  const selectedEvent = events?.find((e) => e && String(e._id) === String(selectedEventId));

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/organizer/events', active: false },
    { icon: Store, label: 'Marketplace', path: '/organizer/events', active: false },
    { icon: Target, label: 'Campaigns', path: '/organizer/events', active: false },
    { icon: BarChart3, label: 'Analytics', path: '/organizer/events', active: false },
    { icon: FileText, label: 'Manage Tiers', path: `/organizer/events/${selectedEventId || ''}/tiers`, active: true },
    { icon: Settings, label: 'Settings', path: '/organizer/events', active: false },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">SponsorMetrics BD</h1>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5 font-medium">
            Enterprise Console
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <IconComponent className="h-4 w-4" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <Link
            to="/organizer/events/new"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={2} /> New Campaign
          </Link>
        </div>

        <div className="p-3 border-t border-slate-800 space-y-0.5">
          <Link
            to="/organizer/events"
            className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            <HelpCircle className="h-4 w-4" strokeWidth={1.75} /> Help Center
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors text-left"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Link
              to="/organizer/events"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Events
            </Link>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Search proposals..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white border border-transparent focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#161B2E]">Sponsorship Tier Package Creator</h1>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedEvent
                    ? `Set up Gold, Silver, Bronze, or custom packages for ${selectedEvent.name}.`
                    : 'Select an event to configure its sponsorship packages.'}
                </p>
              </div>

              {events && events.length > 0 && (
                <select
                  value={selectedEventId}
                  onChange={(e) => handleEventChange(e.target.value)}
                  disabled={loadingEvents}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 font-medium outline-none focus:border-amber-500 shadow-sm"
                >
                  {events.map((eventItem) => (
                    <option key={eventItem._id} value={eventItem._id}>
                      {eventItem.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tier Packages Section Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Blocks className="h-5 w-5 text-amber-600" strokeWidth={1.75} />
                <h2 className="font-display text-lg font-bold text-[#161B2E]">
                  Tier Packages {loadingTiers ? '' : `(${tiers.length})`}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSetupStandardPackages}
                  disabled={!selectedEventId || generatingStandard}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  {generatingStandard ? 'Creating Tiers...' : 'Add Gold, Silver, Bronze'}
                </button>

                <button
                  type="button"
                  onClick={handleAddTier}
                  disabled={!selectedEventId}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} /> Add Custom Tier
                </button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200 font-medium">
                {error}
              </p>
            )}
            {message && (
              <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-200 font-medium">
                {message}
              </p>
            )}

            {/* Tier Cards Grid */}
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {loadingTiers ? (
                <div className="md:col-span-3 py-12 text-center text-sm text-slate-500 font-medium">
                  Loading sponsorship packages...
                </div>
              ) : tiers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 md:col-span-3 text-center">
                  <p className="text-slate-600 font-medium mb-4">No packages set up yet for this event.</p>
                  <button
                    type="button"
                    onClick={handleSetupStandardPackages}
                    disabled={!selectedEventId || generatingStandard}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors shadow-sm"
                  >
                    <Sparkles className="h-4 w-4" /> Setup Standard Gold, Silver & Bronze Tiers
                  </button>
                </div>
              ) : (
                tiers.map((tier, index) => (
                  <TierCard
                    key={tier?._id || index}
                    tier={tier}
                    index={index}
                    benefitPresets={benefitPresets}
                    onSave={(payload) => handleSaveTier(tier?._id, payload)}
                    onDelete={() => handleDeleteTier(tier?._id)}
                    saving={savingTierId === tier?._id}
                    deleting={deletingTierId === tier?._id}
                  />
                ))
              )}
            </div>

            {/* Sponsorship Details Section */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-amber-700 mb-1 flex items-center gap-2">
                <FileText className="h-5 w-5" strokeWidth={1.75} />
                Sponsorship Proposal Details
              </h2>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Provide general sponsorship terms & information
              </p>
              <textarea
                value={sponsorshipDetails}
                onChange={(e) => setSponsorshipDetails(e.target.value)}
                placeholder="Describe your sponsorship needs, event goals, and what sponsors will gain..."
                rows={7}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const TierPackageCreator = () => {
  return (
    <TierErrorBoundary>
      <TierPackageCreatorContent />
    </TierErrorBoundary>
  );
};

export default TierPackageCreator;