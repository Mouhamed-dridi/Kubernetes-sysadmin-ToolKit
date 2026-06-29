import { useState } from 'react';
import { Link } from 'react-router-dom';
import { offers, departmentColors } from '../data/offers';

const departments = ['All', 'Engineering', 'Marketing', 'Finance', 'Design', 'HR'];

export default function Offers() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');

  const filtered = offers.filter((offer) => {
    const matchesDept = department === 'All' || offer.department === department;
    const query = search.toLowerCase();
    const matchesSearch =
      offer.title.toLowerCase().includes(query) ||
      offer.department.toLowerCase().includes(query);
    return matchesDept && matchesSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Available Internships</h1>
          <p className="text-gray-500 text-lg">Find the perfect opportunity to grow your career.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          {/* Department filter */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer transition"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-5">
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> {filtered.length === 1 ? 'offer' : 'offers'}
          {search && <span> for "<span className="text-blue-600">{search}</span>"</span>}
          {department !== 'All' && <span> in <span className="text-blue-600">{department}</span></span>}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No offers found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferCard({ offer }) {
  const badgeClass = departmentColors[offer.department] || 'bg-gray-100 text-gray-700';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Colored top accent */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
      
      <div className="p-6 flex flex-col flex-1">
        {/* Department badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}>
            {offer.department}
          </span>
          <div className="text-xs text-gray-400 font-medium whitespace-nowrap">{offer.duration}</div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">{offer.title}</h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {offer.location}
        </div>

        {/* Description - 2 lines */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-5 flex-1">{offer.description}</p>

        {/* Action */}
        <Link
          to={`/offers/${offer.id}`}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors duration-200 text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
