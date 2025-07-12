import React from 'react';
import { Link } from 'react-router-dom';
// Removed unused import: ThumbsDown
import { Eye, ThumbsUp, Clock, User, Building } from 'lucide-react';

const QuestionCard = ({ question }) => {
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

  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link to={`/question/${question._id}`} className="block">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 mb-2">
              {question.title}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {question.content}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
          {question.difficulty}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {question.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Building size={14} />
            <span>{question.company?.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <User size={14} />
            <span>{question.role}</span>
          </div>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
            {question.roundType}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Eye size={14} />
            <span>{question.views}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ThumbsUp size={14} />
            <span>{question.upvotes?.length || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>By {question.author?.name}</span>
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;