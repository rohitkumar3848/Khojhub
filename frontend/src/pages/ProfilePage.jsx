import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  FolderOpen,
  ClipboardCheck,
  MessageSquare,
  Bell,
  Settings,
  Award,
  PlusCircle,
  FileQuestion,
  CheckCircle2,
  Building,
  Mail,
  Briefcase,
  MapPin,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [officeLocation, setOfficeLocation] = useState(user?.officeLocation || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await authApi.updateProfile({
        fullName,
        department,
        officeLocation,
        phoneNumber,
      });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Sidebar Navigation (Screen #6 Mockup) */}
        <div className="md:col-span-3 space-y-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-1 shadow-sm">
            <button className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-400/15 text-amber-600 flex items-center gap-2.5">
              <UserIcon className="w-4 h-4" /> Profile
            </button>
            <Link to="/my-posts" className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-2.5">
              <FolderOpen className="w-4 h-4 text-slate-400" /> My Posts
            </Link>
            <Link to="/my-claims" className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-2.5">
              <ClipboardCheck className="w-4 h-4 text-slate-400" /> My Claims
            </Link>
            <Link to="/chats" className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-slate-400" /> Chats
            </Link>
            <Link to="/notifications" className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-slate-400" /> Notifications
            </Link>
          </div>

          {/* Karma Points Card */}
          <div className="bg-gradient-to-br from-amber-500 to-yellow-400 rounded-2xl p-5 text-slate-950 shadow-md shadow-amber-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Good Samaritan</span>
              <Award className="w-5 h-5 text-slate-950" />
            </div>
            <p className="text-3xl font-extrabold">{user?.karmaPoints || 0}</p>
            <p className="text-[11px] font-medium opacity-90 mt-1">
              Karma Points earned by returning lost belongings and honest participation.
            </p>
          </div>
        </div>

        {/* Center: Profile Form (Screen #6 Mockup) */}
        <div className="md:col-span-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-2xl border border-amber-200">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{user?.fullName}</h2>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {user?.department || 'Department Member'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    {user?.officeLocation || 'Campus'}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email (Cannot be modified)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    placeholder="e.g. Engineering, Sales"
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Office / Campus Location</label>
                  <input
                    type="text"
                    value={officeLocation}
                    placeholder="e.g. Tower B - Floor 4"
                    onChange={(e) => setOfficeLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  placeholder="+91 98765 43210"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>

          </div>
        </div>

        {/* Right: Quick Actions (Screen #6 Mockup) */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Quick Actions</h3>
            
            <div className="space-y-2">
              <Link
                to="/report/lost"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-200/70"
              >
                <FileQuestion className="w-4 h-4 text-indigo-600" />
                Create Lost Item
              </Link>
              <Link
                to="/report/found"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-200/70"
              >
                <PlusCircle className="w-4 h-4 text-amber-500" />
                Create Found Item
              </Link>
              <Link
                to="/my-posts"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-200/70"
              >
                <FolderOpen className="w-4 h-4 text-slate-600" />
                View My Posts
              </Link>
              <Link
                to="/my-claims"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-200/70"
              >
                <ClipboardCheck className="w-4 h-4 text-slate-600" />
                View My Claims
              </Link>
              <Link
                to="/chats"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-200/70"
              >
                <MessageSquare className="w-4 h-4 text-slate-600" />
                View My Chats
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
