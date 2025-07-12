import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import QuestionCard from '../components/QuestionCard';
import { Plus, BookOpen, MessageSquare, Star, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

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

  const stats = [
    {
      title: 'Questions Posted',
      value: userQuestions?.total || 0,
      icon: MessageSquare,
      color: 'bg-blue-500'
    },
    {
      title: 'Bookmarks',
      value: bookmarks?.total || 0,
      icon: BookOpen,
      color: 'bg-green-500'
    },
    {
      title: 'Total Views',
      value: userQuestions?.questions?.reduce((sum, q) => sum + q.views, 0) || 0,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Upvotes',
      value: userQuestions?.questions?.reduce((sum, q) => sum + (q.upvotes?.length || 0), 0) || 0,
      icon: Star,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-primary-100 mb-6">
          Here's an overview of your activity and contributions to the community.
        </p>
        <Link
          to="/post-question"
          className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <Plus size={20} />
          <span>Post New Question</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} rounded-full p-3`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Questions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Recent Questions</h2>
          <Link
            to="/profile"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View all
          </Link>
        </div>

        {questionsLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : userQuestions?.questions?.length > 0 ? (
          <div className="grid gap-6">
            {userQuestions.questions.slice(0, 3).map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600 mb-4">
              Share your interview experience by posting your first question.
            </p>
            <Link
              to="/post-question"
              className="btn btn-primary"
            >
              Post Your First Question
            </Link>
          </div>
        )}
      </div>

      {/* Recent Bookmarks */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Bookmarks</h2>
          <Link
            to="/profile"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View all
          </Link>
        </div>

        {bookmarksLoading ? (
          <div className="grid gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : bookmarks?.questions?.length > 0 ? (
          <div className="grid gap-6">
            {bookmarks.questions.slice(0, 2).map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
            <p className="text-gray-600">
              Bookmark interesting questions to save them for later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;