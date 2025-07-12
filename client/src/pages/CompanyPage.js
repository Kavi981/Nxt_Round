import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import QuestionCard from '../components/QuestionCard';
import { Building, ArrowLeft, ExternalLink, MessageSquare, Users, TrendingUp } from 'lucide-react';

const CompanyPage = () => {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [selectedRoundType, setSelectedRoundType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // Fetch company details
  const { data: company, isLoading: companyLoading } = useQuery(
    ['company', id],
    () => axios.get(`/api/companies/${id}`).then(res => res.data)
  );

  // Fetch company questions
  const { data: questionsData, isLoading: questionsLoading } = useQuery(
    ['companyQuestions', id, page, selectedRoundType, selectedDifficulty],
    () => axios.get('/api/questions', {
      params: {
        company: id,
        page,
        limit: 10,
        roundType: selectedRoundType,
        difficulty: selectedDifficulty
      }
    }).then(res => res.data),
    { keepPreviousData: true }
  );

  const roundTypes = ['Aptitude', 'Coding', 'HR', 'System Design', 'Technical', 'Behavioral'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  if (companyLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h2>
        <Link to="/companies" className="btn btn-primary">
          Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        to="/companies"
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft size={20} />
        <span>Back to Companies</span>
      </Link>

      {/* Company Header */}
      <div className="card p-8">
        <div className="flex items-start space-x-6">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-primary-100 rounded-lg flex items-center justify-center">
              <Building className="text-primary-600" size={32} />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
            <div className="flex items-center space-x-4 text-gray-600 mb-4">
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {company.industry || 'Technology'}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {company.size || 'Medium'} Company
              </span>
            </div>
            
            {company.description && (
              <p className="text-gray-700 mb-4">{company.description}</p>
            )}
            
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <span>Visit Website</span>
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <MessageSquare className="mx-auto text-primary-600 mb-3" size={32} />
          <div className="text-2xl font-bold text-gray-900">{questionsData?.total || 0}</div>
          <div className="text-sm text-gray-600">Questions</div>
        </div>
        <div className="card p-6 text-center">
          <Users className="mx-auto text-green-600 mb-3" size={32} />
          <div className="text-2xl font-bold text-gray-900">
            {questionsData?.questions?.length > 0 
              ? new Set(questionsData.questions.map(q => q.author?._id)).size 
              : 0}
          </div>
          <div className="text-sm text-gray-600">Contributors</div>
        </div>
        <div className="card p-6 text-center">
          <TrendingUp className="mx-auto text-blue-600 mb-3" size={32} />
          <div className="text-2xl font-bold text-gray-900">
            {questionsData?.questions?.reduce((sum, q) => sum + (q.views || 0), 0) || 0}
          </div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Round Type
            </label>
            <select
              value={selectedRoundType}
              onChange={(e) => setSelectedRoundType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Rounds</option>
              {roundTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              {difficulties.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Interview Questions ({questionsData?.total || 0})
        </h2>
        
        {questionsLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : questionsData?.questions?.length > 0 ? (
          <div className="grid gap-6">
            {questionsData.questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No questions found
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedRoundType || selectedDifficulty 
                ? 'Try adjusting your filters to see more questions.'
                : `Be the first to share an interview question from ${company.name}!`}
            </p>
            <Link to="/post-question" className="btn btn-primary">
              Post a Question
            </Link>
          </div>
        )}

        {/* Pagination */}
        {questionsData?.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {[...Array(questionsData.totalPages)].map((_, i) => (
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
      </div>
    </div>
  );
};

export default CompanyPage;