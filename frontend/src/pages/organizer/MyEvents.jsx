import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import eventApi from '../../services/eventApi';

const MyEvents = () => {
  const { logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventApi.getMyEvents();
      setEvents(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-green-100 text-green-700 border-green-200',
      draft: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return styles[status] || styles.draft;
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    try {
      await eventApi.deleteEvent(eventId);
      setEvents(events.filter((e) => e._id !== eventId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handlePublish = async (eventId) => {
    try {
      await eventApi.publishEvent(eventId);
      setEvents(events.map((e) =>
        e._id === eventId ? { ...e, status: 'published' } : e
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold">SponsorMetrics BD</h1>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Enterprise Console</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link to="/organizer/events" className="flex items-center gap-3 px-4 py-3 bg-amber-600/20 text-amber-400 rounded-lg">
            My Events
          </Link>
          <Link to="/organizer/proposals" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            Proposals
          </Link>
          <Link to="/organizer/proposal-tracker" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            Status Tracker
          </Link>
          <Link to="/organizer/proposal-analyzer" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors">
            Proposal Analyzer
          </Link>
        </nav>
        <div className="p-4">
          <Link
            to="/organizer/events/new"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
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

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
              <p className="text-gray-500 text-sm mt-1">Manage your events and sponsorship proposals</p>
            </div>
            <Link
              to="/organizer/events/new"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2"
            >
              Create New Event
            </Link>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-500 mb-6">Start building your first sponsorship proposal</p>
              <Link
                to="/organizer/events/new"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Create your first event →
              </Link>
            </div>
          )}

          {!loading && events.length > 0 && (
            <div className="grid gap-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{event.venue}</span>
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span>{event.expectedCrowdSize?.toLocaleString()} expected</span>
                        <span>{event.socialMediaReach?.toLocaleString()} reach</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Link
                      to={`/organizer/events/${event._id}`}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </Link>

                    {event.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handlePublish(event._id)}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}

                    <Link
                      to={`/organizer/events/${event._id}/tiers`}
                      className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                    >
                      Manage Tiers →
                    </Link>

                    {event.status === 'published' && (
                      <Link
                        to={`/organizer/events/${event._id}/matches`}
                        className="px-3 py-1.5 text-sm bg-[#1E2337] text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                      >
                        Top Matches
                      </Link>
                    )}

                    <Link
                      to={`/organizer/proposals/new?eventId=${event._id}`}
                      className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                    >
                      Create Proposal
                    </Link>

                    <Link
                      to="/organizer/proposal-analyzer"
                      className="px-3 py-1.5 text-sm bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors font-semibold"
                    >
                      Analyze Strength
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyEvents;
