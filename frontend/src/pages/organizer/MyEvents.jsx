import React from 'react'
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import eventApi from '../../services/eventApi';

const MyEvents = () => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  if (loading) return <div className="p-6">Loading your events...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Link
          to="/organizer/events/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No events yet. Start building your first proposal!</p>
          <Link
            to="/organizer/events/new"
            className="text-blue-600 hover:underline"
          >
            Create your first event →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{event.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    📍 {event.venue} • 📅 {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 text-sm">
                    👥 Expected: {event.expectedCrowdSize.toLocaleString()} • 
                    📢 Reach: {event.socialMediaReach.toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <Link
                  to={`/organizer/events/${event._id}`}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  View Details
                </Link>

                {event.status === 'draft' && (
                  <>
                    <Link
                      to={`/organizer/events/${event._id}/edit`}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handlePublish(event._id)}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </>
                )}

                {event.status === 'published' && (
                  <>
                    <Link
                      to={`/organizer/events/${event._id}/tiers`}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Manage Tiers →
                    </Link>
                    <Link
                      to={`/organizer/events/${event._id}/matches`}
                      className="px-3 py-1.5 text-sm bg-[#F5A623] text-slate-900 font-bold rounded hover:bg-orange-500"
                    >
                      View Top Matches ✨
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;