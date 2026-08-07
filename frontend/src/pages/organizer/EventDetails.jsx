import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import eventApi from '../../services/eventApi';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await eventApi.getEvent(id);
      setEvent(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      await eventApi.publishEvent(id);
      setEvent({ ...event, status: 'published' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    try {
      await eventApi.deleteEvent(id);
      navigate('/organizer/events');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="p-8">Loading event details...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!event) return <div className="p-8">Event not found</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - same as MyEvents */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold">SponsorMetrics BD</h1>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Enterprise Console</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link to="/organizer/events" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg">
            ← Back to Events
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  event.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' :
                  event.status === 'draft' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  {event.status}
                </span>
              </div>
              <p className="text-gray-500">Event details and management</p>
            </div>
            <div className="flex gap-2">
              {event.status === 'draft' && (
                <>
                  <button
                    onClick={handlePublish}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    Publish
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-medium"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Event Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Event Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Venue</label>
                <p className="text-sm text-gray-900">{event.venue}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
                <p className="text-sm text-gray-900">
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Expected Crowd</label>
                <p className="text-sm text-gray-900">{event.expectedCrowdSize?.toLocaleString()} attendees</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Social Media Reach</label>
                <p className="text-sm text-gray-900">{event.socialMediaReach?.toLocaleString()} followers</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Location</label>
                <p className="text-sm text-gray-900">
                  Lat: {event.location?.lat}, Lng: {event.location?.lng}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(event.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Sponsorship Tiers */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Sponsorship Tiers</h2>
              <Link
                to={`/organizer/events/${id}/tiers`}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Manage Tiers →
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              {event.status === 'published' 
                ? 'Your event is published and visible to sponsors.' 
                : 'Publish your event to make it visible to sponsors.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetails;