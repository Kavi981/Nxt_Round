import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
// Removed Login and Register pages
// import Login from './pages/Login';
// import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostQuestion from './pages/PostQuestion';
import QuestionDetail from './pages/QuestionDetail';
import CompanyPage from './pages/CompanyPage';
import Companies from './pages/Companies';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import EditQuestion from './pages/EditQuestion';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import TestOAuth from './pages/TestOAuth';



function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Removed Login and Register routes */}
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/test-oauth" element={<TestOAuth />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/company/:id" element={<CompanyPage />} />
          <Route path="/question/:id" element={<QuestionDetail />} />
          <Route path="/auth-callback" element={<AuthCallback />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/post-question" element={
            <ProtectedRoute>
              <PostQuestion />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/edit-question/:id" element={
            <ProtectedRoute>
              <EditQuestion />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />
          

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;