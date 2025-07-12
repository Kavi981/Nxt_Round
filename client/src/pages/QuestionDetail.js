import React, { useState, useEffect } from 'react'; // Import useEffect
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  User,
  Building,
  Bookmark,
  Edit,
  Trash2,
  ArrowLeft
} from 'lucide-react';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [userVote, setUserVote] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch question details
  const { data: question, isLoading, error } = useQuery(
    ['question', id],
    () => axios.get(`/api/questions/${id}`).then(res => res.data),
    {
      onSuccess: (data) => {
        // Check if user has voted
        if (user) {
          const hasUpvoted = data.upvotes?.some(vote => vote.user === user.id);
          const hasDownvoted = data.downvotes?.some(vote => vote.user === user.id);
          setUserVote(hasUpvoted ? 'upvote' : hasDownvoted ? 'downvote' : null);

          // Check if user has bookmarked
          // Note: This requires fetching user's bookmarks or adding bookmark status to question API
          // For now, we'll rely on the separate bookmark mutation success/failure
          // A better approach would be to fetch user bookmarks on load or add a field to the question API
          // Let's add a simple check based on the user's profile data if available
          queryClient.getQueryData('userBookmarks')?.questions?.some(q => q._id === id)
          setIsBookmarked(user?.bookmarks?.includes(id) || false); // Assuming user object has bookmarks array
        }
      }
    }
  );

  // Effect to update bookmark state if user data or question data changes
  useEffect(() => {
    if (user && question) {
       setIsBookmarked(user?.bookmarks?.includes(question._id) || false);
    }
  }, [user, question]);


  // Vote mutation
  const voteMutation = useMutation(
    (voteData) => axios.post(`/api/questions/${id}/vote`, voteData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['question', id]); // Refetch question to update counts
        toast.success('Vote recorded!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to vote');
      }
    }
  );

  // Bookmark mutation
  const bookmarkMutation = useMutation(
    () => axios.post(`/api/users/bookmark/${id}`),
    {
      onSuccess: (data) => {
        setIsBookmarked(data.data.isBookmarked);
        toast.success(data.data.message);
        queryClient.invalidateQueries('userBookmarks'); // Invalidate user bookmarks to update profile/dashboard
        queryClient.invalidateQueries(['question', id]); // Invalidate question to potentially update bookmark status if added to API
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to bookmark');
      }
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    () => axios.delete(`/api/questions/${id}`),
    {
      onSuccess: () => {
        toast.success('Question deleted successfully!');
        queryClient.invalidateQueries('userQuestions'); // Invalidate user's questions list
        navigate('/dashboard');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete question');
      }
    }
  );

  const handleVote = (voteType) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    // If clicking the same vote, remove it
    const finalVoteType = userVote === voteType ? '' : voteType;
    setUserVote(finalVoteType || null);

    voteMutation.mutate({ voteType: finalVoteType });
  };

  const handleBookmark = () => {
    if (!user) {
      toast.error('Please login to bookmark');
      return;
    }
    bookmarkMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteMutation.mutate();
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h2>
        <p className="text-gray-600 mb-6">The question you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Question Header */}
      <div className="card p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Building size={16} />
                <span>{question.company?.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User size={16} />
                <span>{question.role}</span>
              </div>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {question.roundType}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {user && (
              <button
                onClick={handleBookmark}
                className={`btn ${isBookmarked ? 'btn-primary' : 'btn-outline'}`}
                disabled={bookmarkMutation.isLoading}
              >
                <Bookmark size={16} />
              </button>
            )}

            {user && (question.author?._id === user.id || user.role === 'admin') && (
              <>
                <Link
                  to={`/edit-question/${question._id}`}
                  className="btn btn-outline"
                >
                  <Edit size={16} />
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn bg-red-50 text-red-600 hover:bg-red-100"
                  disabled={deleteMutation.isLoading}
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Question Content */}
        <div className="prose max-w-none mb-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Question:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{question.content}</p>
          </div>
        </div>

        {/* Answer Section */}
        {question.answer && (
          <div className="mb-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-green-800">Answer/Solution:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{question.answer}</p>
            </div>
          </div>
        )}

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Voting and Stats */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-6">
            {/* Voting */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote('upvote')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  userVote === 'upvote'
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                disabled={!user || voteMutation.isLoading}
              >
                <ThumbsUp size={16} />
                <span>{question.upvotes?.length || 0}</span>
              </button>
              <button
                onClick={() => handleVote('downvote')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  userVote === 'downvote'
                    ? 'bg-red-100 text-red-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                disabled={!user || voteMutation.isLoading}
              >
                <ThumbsDown size={16} />
                <span>{question.downvotes?.length || 0}</span>
              </button>
            </div>

            {/* Views */}
            <div className="flex items-center space-x-1 text-gray-600">
              <Eye size={16} />
              <span>{question.views} views</span> {/* Displaying views */}
            </div>
          </div>

          {/* Author and Date */}
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock size={14} />
              <span>Posted on {new Date(question.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-right mt-1">
              <span>By {question.author?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      {question.company && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">About {question.company.name}</h3>
          <div className="flex items-center space-x-4">
            {question.company.logo && (
              <img
                src={question.company.logo}
                alt={question.company.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h4 className="font-medium text-gray-900">{question.company.name}</h4>
              {question.company.description && (
                <p className="text-gray-600 text-sm mt-1">{question.company.description}</p>
              )}
              <Link
                to={`/company/${question.company._id}`}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
              >
                View all questions from {question.company.name} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDetail;