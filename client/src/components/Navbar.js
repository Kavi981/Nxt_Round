import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, User, LogOut, Settings, Home, Building } from 'lucide-react';

const Navbar = () => {
  const { user, logout, login } = useAuth(); // Get login function
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(); // Use the logout function from AuthContext
    navigate('/');
  };

  // Function to handle Google Login click
  const handleGoogleLogin = () => {
    login(); // Call the login function from AuthContext
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">NR</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Nxt Round</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link to="/companies" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
              <Building size={18} />
              <span>Companies</span>
            </Link>
            {user && ( // Show Post Question only if logged in
              <Link to="/post-question" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                <Plus size={18} />
                <span>Post Question</span>
              </Link>
            )}
          </div>

          {/* User Menu / Login */}
          <div className="flex items-center space-x-4">
            {user ? (
              // Logged in state
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                     {user.avatar ? (
                       <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                     ) : (
                       <User size={20} />
                     )}
                    <span className="hidden md:inline">{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings size={16} />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Not logged in state
              <button
                onClick={handleGoogleLogin}
                className="btn btn-primary flex items-center space-x-2"
              >
                 {/* You might add a Google icon here */}
                <span>Login with Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;