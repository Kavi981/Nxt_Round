import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import QuestionCard from '../components/QuestionCard';
import { User, MessageSquare, BookOpen, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('questions');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || ''
  });

  // Fetch user's questions
  const { data: userQuestions, isLoading: questionsLoading } = useQuery(
    'userQuestions',
    () => axios.get('/api/users/questions').then(res => res.data)
  );

  // Fetch user's bookmarks
  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery(
    'userBookmarks',
    () => axios.get('/api/users/bookmarks').then(res => res.data)
  );

  const handleSaveProfile = async () => {
    try {
      await axios.put('/api/users/profile', editData);
      setIsEditing(false);
      // You might want to refetch user data or update context here
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const stats = [
    {
      title: 'Questions Posted',
      value: userQuestions?.total || 0,
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      title: 'Bookmarks',
      value: bookmarks?.total || 0,
      icon: BookOpen,
      color: 'text-green-600'
    },
    {
      title: 'Total Views',
      value: userQuestions?.questions?.reduce((sum, q) => sum + (q.views || 0), 0) || 0,
      icon: User,
      color: 'text-purple-600'
    }
  ];

  const tabs = [
    { id: 'questions', label: 'My Questions', count: userQuestions?.total || 0 },
    { id: 'bookmarks', label: 'Bookmarks', count: bookmarks?.total || 0 }
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="card p-8">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="text-primary-600" size={32} />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="text-2xl font-bold bg-transparent border-b border-gray-300 focus:border-primary-500 outline-none"
                />
                <input
                  type="url"
                  value={editData.avatar}
                  onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                  placeholder="Avatar URL"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center space-x-2 btn btn-primary"
                  >
                    <Save size={16} />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 btn btn-secondary"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit2 size={20} />
                  </button>
                </div>
                <p className="text-gray-600">{user?.email}</p>
                <div className="mt-4">
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                    {user?.role === 'admin' ? 'Administrator' : 'Student'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6 text-center">
            <stat.icon className={`mx-auto mb-3 ${stat.color}`} size={32} />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card p-6">
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'questions' && (
            <div>
              {questionsLoading ? (
                <div className="grid gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : userQuestions?.questions?.length > 0 ? (
                <div className="grid gap-6">
                  {userQuestions.questions.map((question) => (
                    <QuestionCard key={question._id} question={question} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-600">
                    Share your interview experience by posting your first question.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div>
              {bookmarksLoading ? (
                <div className="grid gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : bookmarks?.questions?.length > 0 ? (
                <div className="grid gap-6">
                  {bookmarks.questions.map((question) => (
                    <QuestionCard key={question._id} question={question} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
                  <p className="text-gray-600">
                    Bookmark interesting questions to save them for later.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;