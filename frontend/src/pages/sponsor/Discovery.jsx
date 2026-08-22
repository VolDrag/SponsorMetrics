import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { Search, Filter, MapPin, Users, Target, Building } from 'lucide-react';

import MatchCard from '../../components/sponsor/MatchCard';
import BudgetPacingWidget from '../../components/sponsor/BudgetPacingWidget';

// Rafi
const Discovery = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('any');
  const [budgetFilter, setBudgetFilter] = useState('any');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (dateFilter !== 'any') params.append('dateFilter', dateFilter);
        if (budgetFilter !== 'any') params.append('budgetFilter', budgetFilter);

        const response = await api.get(`/matches/events?${params.toString()}`);
        setMatches(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, [debouncedSearch, dateFilter, budgetFilter]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Discovery & Matching</h1>
        <p className="text-slate-600">Find the perfect events aligned with your brand's goals and budget.</p>
      </div>

      {/* ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — START ===== */}
      <BudgetPacingWidget />
      {/* ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — END ===== */}

      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by event name or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="any">Any Date</option>
            <option value="this_month">This Month</option>
            <option value="next_month">Next Month</option>
          </select>
          
          <select 
            value={budgetFilter}
            onChange={(e) => setBudgetFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="any">Any Budget</option>
            <option value="under_50k">Under 50k BDT</option>
            <option value="50k_to_2L">50k - 2L BDT</option>
            <option value="over_2L">Over 2L BDT</option>
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
          <p className="text-slate-500">We couldn't find any events matching your criteria right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard key={match.event._id} matchData={match} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
// Rafi end

export default Discovery;
