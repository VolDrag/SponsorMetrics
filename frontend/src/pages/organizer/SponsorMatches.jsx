import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SponsorMatchCard from '../../components/organizer/SponsorMatchCard';
import api from '../../services/api';
import { Search, Filter, ArrowLeft } from 'lucide-react';

// Rafi
const SponsorMatches = () => {
  const { eventId } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('any');
  const [budgetFilter, setBudgetFilter] = useState('any');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchSponsorMatches = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (industryFilter !== 'any') params.append('industryFilter', industryFilter);
        if (budgetFilter !== 'any') params.append('budgetFilter', budgetFilter);

        const response = await api.get(`/matches/sponsors/${eventId}?${params.toString()}`);
        setMatches(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load matched sponsors');
      } finally {
        setLoading(false);
      }
    };
    
    if (eventId) {
      fetchSponsorMatches();
    }
  }, [eventId, debouncedSearch, industryFilter, budgetFilter]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link to="/organizer/events" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Top Matches</h1>
        <p className="text-slate-600">Curated list of brands actively looking to fund events like yours.</p>
      </div>

      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by brand name, organization..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="any">Any Industry</option>
            <option value="Tech">Tech</option>
            <option value="Telecommunications">Telecommunications</option>
            <option value="Media">Media</option>
            <option value="Finance">Finance</option>
            <option value="Retail">Retail</option>
          </select>
          
          <select 
            value={budgetFilter}
            onChange={(e) => setBudgetFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="any">Any Budget</option>
            <option value="small">Small (&lt; 50K BDT)</option>
            <option value="medium">Medium (50K - 2L BDT)</option>
            <option value="large">Large (2L - 10L BDT)</option>
            <option value="enterprise">Enterprise (&gt; 10L BDT)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E2337]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No matches found</h3>
          <p className="text-slate-500">We couldn't find any sponsors matching your event's criteria right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <SponsorMatchCard key={match.sponsor._id} matchData={match} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default SponsorMatches;
// Rafi end
