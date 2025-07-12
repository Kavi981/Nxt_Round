import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Users,
  MessageSquare,
  Building,
  Shield,
  Eye,
  Trash2,
  Check,
  X,
  TrendingUp,
  Activity,
  BarChart3,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Edit,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Target,
  PieChart,
  LineChart
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const queryClient = useQueryClient();

  // Fetch comprehensive admin stats
  const { data: stats, isLoading: statsLoading } = useQuery(
    'adminStats',
    async () => {
      const [overview, analytics] = await Promise.all([
        axios.get('/api/stats/overview'),
        axios.get(`/api/stats/analytics?period=${selectedPeriod}`)
      ]);
      return {
        ...overview.data,
        analytics: analytics.data
      };
    },
    {
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  );

  // Fetch all users for management
  const { data: users, isLoading: usersLoading } = useQuery(
    ['adminUsers', searchTerm, filterRole],
    () => axios.get(`/api/users/admin/all?search=${searchTerm}&role=${filterRole}`).then(res => res.data)
  );

  // Fetch all companies for management
  const { data: companies, isLoading: companiesLoading } = useQuery(
    ['adminCompanies', searchTerm, filterIndustry],
    () => axios.get(`/api/companies/admin/all?search=${searchTerm}&industry=${filterIndustry}`).then(res => res.data)
  );



  // Fetch all questions for moderation
  const { data: allQuestions } = useQuery(
    'allQuestions',
    () => axios.get('/api/questions?limit=50').then(res => res.data)
  );

  // Fetch recent activities
  const { data: activities } = useQuery(
    'recentActivities',
    () => axios.get('/api/activities/admin/recent?limit=10').then(res => res.data)
  );

  // Fetch activity statistics
  const { data: activityStats } = useQuery(
    ['activityStats', selectedPeriod],
    () => axios.get(`/api/activities/admin/stats?period=${selectedPeriod}`).then(res => res.data)
  );

  // Delete question mutation
  const deleteQuestionMutation = useMutation(
    (questionId) => axios.delete(`/api/questions/${questionId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allQuestions');
        queryClient.invalidateQueries('adminStats');
        toast.success('Question deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete question');
      }
    }
  );

  // User management mutations
  const updateUserRoleMutation = useMutation(
    ({ userId, role }) => axios.put(`/api/users/admin/${userId}/role`, { role }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('User role updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user role');
      }
    }
  );

  const deleteUserMutation = useMutation(
    (userId) => axios.delete(`/api/users/admin/${userId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        queryClient.invalidateQueries('adminStats');
        toast.success('User deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  );



  const deleteCompanyMutation = useMutation(
    (companyId) => axios.delete(`/api/companies/${companyId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCompanies');
        queryClient.invalidateQueries('adminStats');
        toast.success('Company deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete company');
      }
    }
  );

  const handleModerateQuestion = (questionId, action) => {
    if (action === 'delete' && !window.confirm('Are you sure you want to delete this question?')) {
      return;
    }
    deleteQuestionMutation.mutate(questionId);
  };

  const handleUpdateUserRole = (userId, role) => {
    updateUserRoleMutation.mutate({ userId, role });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all their questions.')) {
      deleteUserMutation.mutate(userId);
    }
  };



  const handleDeleteCompany = (companyId) => {
    if (window.confirm('Are you sure you want to delete this company? This will also delete all associated questions.')) {
      deleteCompanyMutation.mutate(companyId);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'companies', label: 'Companies', icon: Building },
    { id: 'questions', label: 'Questions', icon: MessageSquare },
    { id: 'activities', label: 'Activities', icon: Activity }
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGrowthPercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Shield size={32} />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-primary-100">
          Comprehensive platform management and analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 text-center">
          <MessageSquare className="mx-auto text-blue-600 mb-3" size={32} />
          <div className="text-2xl font-bold text-gray-900">{stats?.totalQuestions || 0}</div>
          <div className="text-sm text-gray-600">Total Questions</div>
          {stats?.recentQuestions > 0 && (
            <div className="text-xs text-green-600 mt-1">
              +{stats.recentQuestions} this week
            </div>
          )}
        </div>
        <div className="card p-6 text-center">
          <Building className="mx-auto text-green-600 mb-3" size={32} />
          <div className="text-2xl font-bold text-gray-900">{stats?.totalCompanies || 0}</div>
          <div className="text-sm text-gray-600">Total Companies</div>
        </div>
        <div className="card p-6 text-center">
          <Users className="mx-auto text-purple-600 mb-3" size={32} />
          <div className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
          <div className="text-sm text-gray-600">Total Users</div>
          {stats?.recentUsers > 0 && (
            <div className="text-xs text-green-600 mt-1">
              +{stats.recentUsers} this week
            </div>
          )}
        </div>
        <div className="card p-6 text-center">
          <Activity className="mx-auto text-orange-600 mb-3" size={32} />
          <div className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</div>
          <div className="text-sm text-gray-600">Active Users (30 days)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-6">
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Platform Overview</h3>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Active Content</h4>
                  <p className="text-green-700">
                    {stats?.totalQuestions || 0} questions from {stats?.totalCompanies || 0} companies
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">User Activity</h4>
                  <p className="text-blue-700">
                    {stats?.activeUsers || 0} active users in the last 30 days
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Recent Growth</h4>
                  <p className="text-purple-700">
                    {stats?.recentUsers || 0} new users and {stats?.recentQuestions || 0} new questions this week
                  </p>
                </div>
              </div>

              {/* Top Companies */}
              {stats?.topCompanies && stats.topCompanies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-4">Top Companies by Questions</h4>
                  <div className="grid gap-4">
                    {stats.topCompanies.map((company, index) => (
                      <div key={company._id} className="bg-white p-4 rounded-lg border">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                            <div>
                              <h5 className="font-medium">{company.name}</h5>
                              <p className="text-sm text-gray-600">{company.industry}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">{company.questionCount}</div>
                            <div className="text-xs text-gray-500">questions</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border rounded-md px-3 py-1"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>

              {stats?.analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Growth Chart */}
                  <div className="card p-6">
                    <h4 className="font-medium mb-4">User Growth</h4>
                    <div className="space-y-2">
                      {stats.analytics.userGrowth.map((day, index) => (
                        <div key={day._id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{day._id}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min((day.count / Math.max(...stats.analytics.userGrowth.map(d => d.count))) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{day.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Question Growth Chart */}
                  <div className="card p-6">
                    <h4 className="font-medium mb-4">Question Growth</h4>
                    <div className="space-y-2">
                      {stats.analytics.questionGrowth.map((day, index) => (
                        <div key={day._id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{day._id}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${Math.min((day.count / Math.max(...stats.analytics.questionGrowth.map(d => d.count))) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{day.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Company Performance */}
              {stats?.analytics?.companyStats && (
                <div>
                  <h4 className="font-medium mb-4">Company Performance</h4>
                  <div className="grid gap-4">
                    {stats.analytics.companyStats.slice(0, 10).map((company) => (
                      <div key={company._id} className="bg-white p-4 rounded-lg border">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium">{company.name}</h5>
                            <p className="text-sm text-gray-600">{company.industry}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">{company.questionCount}</div>
                            <div className="text-xs text-gray-500">
                              {company.approvedQuestions} approved
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">User Management</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border rounded-md px-3 py-1 text-sm"
                  />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="border rounded-md px-3 py-1 text-sm"
                  >
                    <option value="">All Roles</option>
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {usersLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <div className="space-y-4">
                  {users?.users?.map((user) => (
                    <div key={user._id} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-medium">{user.name}</h5>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role}
                              </span>
                              <span className="text-xs text-gray-500">
                                {user.questionCount || 0} questions
                              </span>
                              <span className="text-xs text-gray-500">
                                Joined {formatDate(user.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                            className="border rounded-md px-2 py-1 text-xs"
                          >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Company Management</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border rounded-md px-3 py-1 text-sm"
                  />
                  <select
                    value={filterIndustry}
                    onChange={(e) => setFilterIndustry(e.target.value)}
                    className="border rounded-md px-3 py-1 text-sm"
                  >
                    <option value="">All Industries</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Consulting">Consulting</option>
                  </select>
                </div>
              </div>

              {companiesLoading ? (
                <div className="text-center py-8">Loading companies...</div>
              ) : (
                <div className="space-y-4">
                  {companies?.companies?.map((company) => (
                    <div key={company._id} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                                                 <div>
                           <h4 className="font-medium mb-2">{company.name}</h4>
                           <p className="text-sm text-gray-600 mb-2">
                             {company.industry} • {company.size}
                           </p>
                           {company.description && (
                             <p className="text-sm text-gray-700 mb-2">
                               {company.description}
                             </p>
                           )}
                           <div className="flex items-center space-x-4 text-sm text-gray-500">
                             <span>{company.totalQuestions || 0} total questions</span>
                             <span>{company.recentQuestions || 0} this week</span>
                           </div>
                         </div>
                         <div className="flex items-center space-x-2">
                           <button
                             onClick={() => handleDeleteCompany(company._id)}
                             className="text-red-600 hover:text-red-800"
                             title="Delete Company"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Question Management</h3>

              {/* All Questions */}
              <div>
                <h4 className="font-medium mb-4">All Questions</h4>
                <div className="space-y-4">
                  {allQuestions?.questions?.map((question) => (
                    <div key={question._id} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">{question.title}</h5>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleModerateQuestion(question._id, 'delete')}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {question.company?.name} • {question.role} • {question.roundType}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Views: {question.views || 0}</span>
                        <span>Upvotes: {question.upvotes?.length || 0}</span>
                        <span>By: {question.author?.name}</span>
                        <span>{formatDate(question.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Recent Activities</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className="card p-6">
                  <h4 className="font-medium mb-4">Recent Activities</h4>
                  <div className="space-y-3">
                    {activities?.activities?.map((activity) => (
                      <div key={activity._id} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.action.includes('login') ? 'bg-blue-100' :
                          activity.action.includes('post') ? 'bg-green-100' :
                          activity.action.includes('admin') ? 'bg-purple-100' :
                          'bg-gray-100'
                        }`}>
                          {activity.action.includes('login') ? (
                            <Users className="text-blue-600" size={16} />
                          ) : activity.action.includes('post') ? (
                            <MessageSquare className="text-green-600" size={16} />
                          ) : activity.action.includes('admin') ? (
                            <Shield className="text-purple-600" size={16} />
                          ) : (
                            <Activity className="text-gray-600" size={16} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.user?.name}</p>
                          <p className="text-xs text-gray-500">
                            {activity.action.replace('_', ' ')} • {formatDate(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Statistics */}
                <div className="card p-6">
                  <h4 className="font-medium mb-4">Activity Statistics</h4>
                  {activityStats && (
                    <div className="space-y-4">
                      {/* Action Stats */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">By Action Type</h5>
                        <div className="space-y-2">
                          {activityStats.actionStats?.slice(0, 5).map((stat) => (
                            <div key={stat._id} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{stat._id.replace('_', ' ')}</span>
                              <span className="text-sm font-medium">{stat.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Active Users */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Top Active Users</h5>
                        <div className="space-y-2">
                          {activityStats.topUsers?.slice(0, 5).map((user) => (
                            <div key={user._id} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{user.name}</span>
                              <span className="text-sm font-medium">{user.count} actions</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Charts */}
              {activityStats?.dailyActivity && (
                <div className="card p-6">
                  <h4 className="font-medium mb-4">Daily Activity</h4>
                  <div className="space-y-2">
                    {activityStats.dailyActivity.map((day) => (
                      <div key={day._id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{day._id}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((day.count / Math.max(...activityStats.dailyActivity.map(d => d.count))) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{day.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 text-center">
                  <TrendingUp className="mx-auto text-blue-600 mb-3" size={24} />
                  <div className="text-lg font-bold text-gray-900">{stats?.recentUsers || 0}</div>
                  <div className="text-sm text-gray-600">New Users (7 days)</div>
                </div>
                <div className="card p-6 text-center">
                  <Activity className="mx-auto text-green-600 mb-3" size={24} />
                  <div className="text-lg font-bold text-gray-900">{stats?.recentQuestions || 0}</div>
                  <div className="text-sm text-gray-600">New Questions (7 days)</div>
                </div>
                <div className="card p-6 text-center">
                  <Target className="mx-auto text-purple-600 mb-3" size={24} />
                  <div className="text-lg font-bold text-gray-900">{stats?.activeUsers || 0}</div>
                  <div className="text-sm text-gray-600">Active Users (30 days)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;