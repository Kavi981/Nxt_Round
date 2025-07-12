import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, X } from 'lucide-react';

const EditQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  // Fetch question data
  const { data: question, isLoading: questionLoading, error: questionError } = useQuery(
    ['question', id],
    () => axios.get(`/api/questions/${id}`).then(res => res.data),
    {
      onSuccess: (data) => {
        // Pre-fill form with existing data
        setValue('title', data.title);
        setValue('content', data.content);
        setValue('answer', data.answer || '');
        setValue('company', data.company?._id);
        setValue('role', data.role);
        setValue('roundType', data.roundType);
        setValue('difficulty', data.difficulty);
        setTags(data.tags || []);

        // Check if user is authorized to edit
        if (!user || (user.id !== data.author?._id && user.role !== 'admin')) {
          toast.error('You are not authorized to edit this question.');
          navigate(`/question/${id}`);
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to load question');
        navigate('/');
      }
    }
  );

  // Fetch companies for dropdown
  const { data: companiesData, isLoading: companiesLoading } = useQuery(
    'companies',
    () => axios.get('/api/companies').then(res => res.data)
  );

  // Update question mutation
  const updateQuestionMutation = useMutation(
    (updatedQuestionData) => axios.put(`/api/questions/${id}`, updatedQuestionData),
    {
      onSuccess: () => {
        toast.success('Question updated successfully!');
        queryClient.invalidateQueries(['question', id]);
        queryClient.invalidateQueries('userQuestions');
        navigate(`/question/${id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update question');
      }
    }
  );

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data) => {
    const updatedQuestionData = {
      ...data,
      tags
    };
    updateQuestionMutation.mutate(updatedQuestionData);
  };

  const roundTypes = ['Aptitude', 'Coding', 'HR', 'System Design', 'Technical', 'Behavioral'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  if (questionLoading || companiesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (questionError || !question) {
    return null;
  }

  if (!user || (user.id !== question.author?._id && user.role !== 'admin')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h2>
        <p className="text-gray-600 mb-6">You do not have permission to edit this question.</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Question</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Question</h1>
          <p className="text-gray-600">
            Update the details of this interview question.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Reverse a linked list in O(n) time"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Description *
            </label>
            <textarea
              {...register('content', { required: 'Description is required' })}
              rows={6}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe the question in detail. Include any constraints, examples, or additional context..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer/Solution (Optional)
            </label>
            <textarea
              {...register('answer')}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Share your answer or approach to solving this question..."
            />
          </div>

          {/* Company and Role Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <select
                {...register('company', { required: 'Company is required' })}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a company</option>
                {companiesData?.companies?.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <input
                {...register('role', { required: 'Role is required' })}
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Software Engineer, Data Analyst, QA Engineer"
              />
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>
          </div>

          {/* Round Type and Difficulty Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Round Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Round Type *
              </label>
              <select
                {...register('roundType', { required: 'Round type is required' })}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select round type</option>
                {roundTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.roundType && (
                <p className="mt-1 text-sm text-red-600">{errors.roundType.message}</p>
              )}
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                {...register('difficulty')}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select difficulty</option>
                {difficulties.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Add tags (e.g., arrays, algorithms, data structures)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-secondary"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={updateQuestionMutation.isLoading}
              className="btn btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateQuestionMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary px-8 py-3 text-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestion;