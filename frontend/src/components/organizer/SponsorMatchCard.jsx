import React from 'react';
import { Building, ShieldCheck, PieChart, Star } from 'lucide-react';

const SponsorMatchCard = ({ matchData }) => {
  const { sponsor, matchScore, matchReason } = matchData;
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{sponsor.organizationName || sponsor.name}</h3>
            <span className="text-sm font-medium text-slate-500">{sponsor.industry || 'General Industry'}</span>
          </div>
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
            {matchScore}% Match
          </span>
        </div>
        
        <p className="text-sm text-slate-500 mb-6 line-clamp-2">
          {matchReason}
        </p>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-slate-600 mb-6">
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-2 opacity-70" />
            <span className="capitalize">{sponsor.budgetTier || 'Starter'} Tier</span>
          </div>
          <div className="flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 opacity-70" />
            <span>Verified Partner</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-2 opacity-70 text-yellow-500" />
            <span>{sponsor.credibilityScore || 0}/5 Credibility</span>
          </div>
          <div className="flex items-center">
            <PieChart className="w-4 h-4 mr-2 opacity-70" />
            <span>High ROI Target</span>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 px-6 py-4 border-t flex justify-end items-center">
        <button className="bg-[#1E2337] hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Pitch Proposal
        </button>
      </div>
    </div>
  );
};

export default SponsorMatchCard;
