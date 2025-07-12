import React from 'react';
import { Search, Filter } from 'lucide-react';

const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  selectedCompany, 
  onCompanyChange,
  selectedRole,
  onRoleChange,
  selectedRoundType,
  onRoundTypeChange,
  selectedDifficulty,
  onDifficultyChange,
  companies = []
}) => {
  const roundTypes = ['Aptitude', 'Coding', 'HR', 'System Design', 'Technical', 'Behavioral'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  return (
    <div className="card p-6 mb-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 mb-4">
        <Filter size={20} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters:</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Company Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
          <select
            value={selectedCompany}
            onChange={(e) => onCompanyChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <input
            type="text"
            placeholder="e.g., SDE, QA, Analyst"
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Round Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Round Type</label>
          <select
            value={selectedRoundType}
            onChange={(e) => onRoundTypeChange(e.target.value)}
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

        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
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
  );
};

export default SearchFilter;