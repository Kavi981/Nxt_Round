import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const PostQuestion = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Fetch companies
  const { data: companiesData } = useQuery(
    'companies',
    () => axios.get('/api/companies').then(res => res.data)
  );

  // Create question mutation
  const createQuestionMutation = useMutation(
    (questionData) => axios.post('/api/questions', questionData),
    {
      onSuccess: () => {
        toast.success('Question posted successfully!');
        queryClient.invalidateQueries('questions');
        navigate('/dashboard');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to post question');
      }
    }
  );

  // Create company mutation
  const createCompanyMutation = useMutation(
    (companyData) => axios.post('/api/companies', companyData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('companies');
        toast.success('Company added successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add company');
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

  const handleAddCompany = async () => {
    const companyName = prompt('Enter company name:');
    if (companyName?.trim()) {
      createCompanyMutation.mutate({ name: companyName.trim() });
    }
  };

  const onSubmit = async (data) => {
    const questionData = {
      ...data,
      tags
    };

    createQuestionMutation.mutate(questionData);
  };

  const roundTypes = ['Aptitude', 'Coding', 'HR', 'System Design', 'Technical', 'Behavioral'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Question</h1>
          <p className="text-gray-600">
            Share your interview experience to help other job seekers prepare better.
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company *
                </label>
                <button
                  type="button"
                  onClick={handleAddCompany}
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Add Company</span>
                </button>
              </div>
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
              disabled={createQuestionMutation.isLoading}
              className="btn btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createQuestionMutation.isLoading ? 'Posting...' : 'Post Question'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
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

export default PostQuestion;