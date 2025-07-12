import React from 'react';
import { Link } from 'react-router-dom';
// Removed unused imports: Building, MessageSquare, Users
// import { Building, MessageSquare, Users } from 'lucide-react';
import { Building } from 'lucide-react'; // Keep Building for the logo placeholder

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Logo and Description */}
          <div className="flex-shrink-0 text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start space-x-2 mb-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">NR</span>
              </div>
              <span className="text-xl font-bold text-white">Nxt Round</span>
            </Link>
            <p className="text-sm max-w-xs">
              Your platform for sharing and finding interview questions and experiences.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-12">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Explore</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/companies" className="hover:text-white">Companies</Link></li>
                <li><Link to="/post-question" className="hover:text-white">Post Question</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Account</h3>
              <ul className="space-y-2 text-sm">
                 {/* Removed Login/Register links as they are replaced by Google OAuth */}
                {/* <li><Link to="/login" className="hover:text-white">Login</Link></li> */}
                {/* <li><Link to="/register" className="hover:text-white">Register</Link></li> */}
                <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/profile" className="hover:text-white">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                {/* Changed placeholder <a> tags to buttons or removed if not needed */}
                {/* If these links should navigate, replace '#' with actual paths */}
                <li><button className="hover:text-white text-left">About Us</button></li>
                <li><button className="hover:text-white text-left">Contact</button></li>
                <li><button className="hover:text-white text-left">Privacy Policy</button></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Nxt Round. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;