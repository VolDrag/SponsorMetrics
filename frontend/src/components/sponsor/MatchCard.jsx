// Rafi
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Target, Building } from 'lucide-react';

const MatchCard = ({ matchData }) => {
  const { event, matchScore, matchReason } = matchData;
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-900">{event.name}</h3>
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
            {matchScore}% Match
          </span>
        </div>
        
        <p className="text-sm text-slate-500 mb-6 line-clamp-2">
          {matchReason}
        </p>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-slate-600 mb-6">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 opacity-70" />
            <span>{event.expectedCrowdSize?.toLocaleString()} Attendees</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 opacity-70" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-2 opacity-70" />
            {event.organizerId?._id ? (
              <Link to={`/profile/${event.organizerId._id}`} className="truncate text-amber-700 hover:underline">
                {event.organizerId?.organizationName || 'Organizer'}
              </Link>
            ) : (
              <span className="truncate">{event.organizerId?.organizationName || 'Organizer'}</span>
            )}
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-2 opacity-70" />
            <span>{event.socialMediaReach?.toLocaleString() || 0} Reach</span>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 px-6 py-4 border-t flex justify-between items-center">
        <span className="text-sm font-medium text-slate-500">
          {new Date(event.date).toLocaleDateString()}
        </span>
        <button className="bg-[#1E2337] hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          View Proposal Details
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
// Rafi end
