import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  Search,
  FileQuestion,
  PlusCircle,
  FolderOpen,
  ClipboardCheck,
  MessageSquare,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Award,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#0B132B] text-slate-100 sticky top-0 z-50 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                Khoj<span className="text-amber-400">Hub</span>
              </span>
              <span className="text-[10px] block text-slate-400 -mt-1 font-medium tracking-wide">
                Lost Today, Found Tomorrow
              </span>
            </div>
          </Link>

          {/* Navigation Items (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/explore"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive('/explore') || isActive('/')
                  ? 'bg-amber-400/10 text-amber-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              Explore
            </Link>

            <Link
              to="/report/lost"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive('/report/lost')
                  ? 'bg-amber-400/10 text-amber-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileQuestion className="w-4 h-4" />
              Report Lost
            </Link>

            <Link
              to="/report/found"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive('/report/found')
                  ? 'bg-amber-400/10 text-amber-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Report Found
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/my-posts"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive('/my-posts')
                      ? 'bg-amber-400/10 text-amber-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  My Posts
                </Link>

                <Link
                  to="/my-claims"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive('/my-claims')
                      ? 'bg-amber-400/10 text-amber-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  My Claims
                </Link>

                <Link
                  to="/chats"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 relative ${
                    isActive('/chats')
                      ? 'bg-amber-400/10 text-amber-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chats
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-red-500/20 text-red-400 font-semibold border border-red-500/30'
                        : 'text-red-300 hover:text-white hover:bg-red-950/40'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Portal
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Action Menu: Notifications & User Avatar */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2.5 p-1.5 pl-2.5 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all focus:outline-none"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xs font-bold">
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold max-w-[100px] truncate hidden sm:inline">
                      {user?.fullName || 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-md"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-800/80">
                        <p className="text-xs font-medium text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                          <Award className="w-3.5 h-3.5" />
                          <span>{user?.karmaPoints || 0} Karma Points</span>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        to="/my-posts"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <FolderOpen className="w-4 h-4 text-slate-400" />
                        My Submissions
                      </Link>

                      <Link
                        to="/my-claims"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <ClipboardCheck className="w-4 h-4 text-slate-400" />
                        My Claim Tickets
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-400 hover:bg-slate-800 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-red-400" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-slate-800/80 my-1" />

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm shadow-amber-500/20 transition-all font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
