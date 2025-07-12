import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Building, Search, MessageSquare } from 'lucide-react';

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data: companiesData, isLoading } = useQuery(
    ['companies', page, searchTerm],
    () => axios.get('/api/companies', {
      params: {
        page,
        limit: 12,
        search: searchTerm
      }
    }).then(res => res.data),
    { keepPreviousData: true }
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Companies</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore interview questions from top companies. Find questions specific to your target company.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companiesData?.companies?.map((company) => (
            <Link
              key={company._id}
              to={`/company/${company._id}`}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building className="text-primary-600" size={24} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.industry || 'Technology'}</p>
                </div>
              </div>

              {company.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {company.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {company.questionCount || 0} questions
                  </span>
                </div>
                <span className="text-primary-600 font-medium text-sm">
                  View Questions →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {companiesData?.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {[...Array(companiesData.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-md ${
                  page === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {companiesData?.companies?.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'No companies have been added yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Companies;