import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestOAuth = () => {
  const { login } = useAuth();

  const handleTestLogin = () => {
    console.log('Testing OAuth login...');
    login();
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">OAuth Test</h2>
      <p className="mb-4 text-gray-600">
        This page tests the OAuth login flow. Click the button below to test the redirect.
      </p>
      <button
        onClick={handleTestLogin}
        className="w-full btn btn-primary"
      >
        Test Google OAuth Login
      </button>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Should redirect to http://localhost:5000/api/auth/google</li>
          <li>• Backend should redirect to Google OAuth page</li>
          <li>• After auth, should redirect back to /dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default TestOAuth; 