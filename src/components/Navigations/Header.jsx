import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div className="h-24 lg:h-14 bg-white -mx-3 lg:m-0 flex justify-center shadow-sm border-b">
      <div className="py-3 max-w-6xl w-full flex items-center justify-between lg:justify-center">
        <div className="flex lg:hidden items-center gap-1.5">
          <img
            src="/assets/images/vignan-logo.png"
            width={42}
            height={42}
            alt="Vignan Logo"
          />
          <span className="text-violet-900 font-semibold text-lg whitespace-nowrap xs:text-base">
            Assessment Portal
          </span>
        </div>

        {/* Centered Vignan Header */}
        <div className="flex items-center justify-center flex-1">
          <Link to="/">
            <img
              src="/assets/images/vignan-header.jpeg"
              className="h-20 w-full object-contain"
              alt="Vignan Header"
            />
          </Link>
        </div>

        {/* Only logout button, no welcome message */}
        <div className="flex items-center">
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title="Logout"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              <span className="hidden lg:block">Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
