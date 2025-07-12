import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import QuestionCard from '../components/QuestionCard';
import SearchFilter from '../components/SearchFilter';
import { TrendingUp, Users, Building, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedRoundType, setSelectedRoundType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [page, setPage] = useState(1);

  const { user } = useAuth();

  // Fetch questions
  const { data: questionsData, isLoading: questionsLoading } = useQuery(
    ['questions', page, searchTerm, selectedCompany, selectedRole, selectedRoundType, selectedDifficulty],
    () => axios.get('/api/questions', {
      params: {
        page,
        limit: 10,
        search: searchTerm,
        company: selectedCompany,
        role: selectedRole,
        roundType: selectedRoundType,
        difficulty: selectedDifficulty
      }
    }).then(res => res.data),
    { keepPreviousData: true }
  );

  // Fetch companies for filter
  const { data: companiesData } = useQuery(
    'companies',
    () => axios.get('/api/companies').then(res => res.data)
  );

  // Fetch platform stats
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'platformStats',
    () => axios.get('/api/stats').then(res => res.data)
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Share Your Interview Experience
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            Help fellow job seekers by sharing interview questions and experiences from top companies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/post-question" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
                Post a Question
              </Link>
            ) : (
              <span className="text-white text-lg">Login to post questions</span>
            )}
            <Link to="/companies" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg">
              Browse Companies
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-6 text-center">
              <div className="mx-auto bg-gray-200 rounded-full h-8 w-8 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : statsData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="card p-6 text-center">
            <MessageSquare className="mx-auto text-primary-600 mb-3" size={32} />
            <div className="text-2xl font-bold text-gray-900">{statsData.totalQuestions}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="card p-6 text-center">
            <Building className="mx-auto text-green-600 mb-3" size={32} />
            <div className="text-2xl font-bold text-gray-900">{statsData.totalCompanies}</div>
            <div className="text-sm text-gray-600">Companies</div>
          </div>
          <div className="card p-6 text-center">
            <Users className="mx-auto text-blue-600 mb-3" size={32} />
            <div className="text-2xl font-bold text-gray-900">{statsData.totalUsers}</div>
            <div className="text-sm text-gray-600">Users</div>
          </div>
          <div className="card p-6 text-center">
            <TrendingUp className="mx-auto text-purple-600 mb-3" size={32} />
            <div className="text-2xl font-bold text-gray-900">{statsData.totalExperiences}</div>
            <div className="text-sm text-gray-600">Experiences</div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedRoundType={selectedRoundType}
        onRoundTypeChange={setSelectedRoundType}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        companies={companiesData?.companies || []}
      />

      {/* Questions List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Questions</h2>

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
        ) : (
          <div className="grid gap-6">
            {questionsData?.questions?.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
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

export default Home;