
import React, { useState } from 'react';
import { Plus, Search, Calendar, Clock, CheckCircle2, AlertCircle, Clock3, Filter, MoreVertical, FileText, ChevronRight } from 'lucide-react';
import { Visit, VisitStatus } from '../types';

interface DashboardProps {
  visits: Visit[];
  onStartNewVisit: (info?: any) => void;
  onReviewVisit: (visit: Visit) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ visits, onStartNewVisit, onReviewVisit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVisits = visits.filter(v => 
    v.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    today: visits.filter(v => new Date(v.timestamp).toDateString() === new Date().toDateString()).length,
    timeSaved: Math.floor(visits.length * 12.5), // Roughly 12.5 mins saved per visit
    avgDocTime: "2.4m"
  };

  const getStatusBadge = (status: VisitStatus) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 size={12}/> Approved</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><AlertCircle size={12}/> Pending Review</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 animate-pulse"><Clock3 size={12}/> Recording</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Header / Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, Dr. Sterling</h2>
          <p className="text-gray-500 mt-1">You have {visits.filter(v => v.status === 'pending').length} clinical notes awaiting review.</p>
        </div>
        <button 
          onClick={() => onStartNewVisit()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={20} />
          <span>Start New Visit</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">+12%</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Visits Today</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.today}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Time Saved</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.timeSaved} hrs</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Avg. Documentation Time</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.avgDocTime}</h3>
        </div>
      </div>

      {/* Visit List Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Visits</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search patients or complaints..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg border border-gray-200">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {filteredVisits.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No visits found matching your search.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredVisits.map((visit) => (
              <div 
                key={visit.id} 
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group flex items-center gap-4"
                onClick={() => onReviewVisit(visit)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">{visit.patientName}</h4>
                    {getStatusBadge(visit.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><FileText size={14}/> {visit.chiefComplaint}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {Math.floor(visit.duration / 60)}m {visit.duration % 60}s</span>
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(visit.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">AI Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${visit.confidence > 90 ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${visit.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{visit.confidence}%</span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
