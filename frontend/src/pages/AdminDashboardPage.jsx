import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  Clock,
  ClipboardCheck,
  Building2,
  CheckCircle2,
  Gift,
  ShieldCheck,
  Check,
  X,
  Trash2,
  Loader2,
  Search,
  QrCode,
  FileText
} from 'lucide-react';
import { adminApi, custodyApi } from '../services/api';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, approvals, items, custody, users, audit
  const [stats, setStats] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [returnedItems, setReturnedItems] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [custodyRecords, setCustodyRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handover form state
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('ID verified and item handed over.');
  const [handoverSubmitting, setHandoverSubmitting] = useState(false);
  const [handoverMessage, setHandoverMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await adminApi.getStats();
      setStats(statsRes.data);

      if (activeTab === 'overview' || activeTab === 'approvals') {
        const pendingRes = await adminApi.getPendingItems();
        setPendingItems(pendingRes.data || []);
      }

      if (activeTab === 'items') {
        const itemsRes = await adminApi.getAllItems();
        setAllItems(itemsRes.data || []);
        const retRes = await adminApi.getReturnedItems();
        setReturnedItems(retRes.data || []);
      }

      if (activeTab === 'users') {
        const usersRes = await adminApi.getUsers();
        setUsersList(usersRes.data || []);
      }

      if (activeTab === 'custody') {
        const custodyRes = await adminApi.getCustodyRecords();
        setCustodyRecords(custodyRes.data || []);
      }

      if (activeTab === 'audit') {
        const auditRes = await adminApi.getAuditLogs(60);
        setAuditLogs(auditRes.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId) => {
    try {
      await adminApi.approveItem(itemId);
      setPendingItems((prev) => prev.filter((item) => item.id !== itemId));
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to approve item.');
    }
  };

  const handleReject = async (itemId) => {
    const reason = window.prompt('Enter reason for rejecting this item:');
    if (reason === null) return;
    try {
      await adminApi.rejectItem(itemId, reason);
      setPendingItems((prev) => prev.filter((item) => item.id !== itemId));
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to reject item.');
    }
  };

  const handleHandoverSubmit = async (e) => {
    e.preventDefault();
    if (!pickupCodeInput.trim()) return;

    setHandoverSubmitting(true);
    setHandoverMessage({ type: '', text: '' });

    try {
      const res = await custodyApi.completeHandover({
        pickupReferenceCode: pickupCodeInput.trim(),
        verificationNotes: handoverNotes,
      });
      setHandoverMessage({
        type: 'success',
        text: `Handover successful! Item "${res.data.itemTitle}" has been marked RETURNED.`,
      });
      setPickupCodeInput('');
      fetchDashboardData();
    } catch (err) {
      setHandoverMessage({
        type: 'error',
        text: err.message || 'Failed to verify handover.',
      });
    } finally {
      setHandoverSubmitting(false);
    }
  };

  const handleToggleUser = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Set user status to ${newStatus}?`)) return;
    try {
      await adminApi.toggleUserStatus(userId, newStatus);
      setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    } catch (err) {
      alert(err.message || 'Failed to toggle user status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Admin Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-md">
            <h2 className="text-sm font-bold flex items-center gap-2 text-amber-400">
              <ShieldCheck className="w-5 h-5" /> Admin Console
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">Campus Moderation & Central Desk</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-2 space-y-1 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                activeTab === 'overview' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                activeTab === 'approvals' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Pending Approvals</span>
              {stats?.pendingApprovals > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                  {stats.pendingApprovals}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('custody')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                activeTab === 'custody' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" /> Custody & Handover
            </button>

            <button
              onClick={() => setActiveTab('items')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                activeTab === 'items' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" /> Items & Returned
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                activeTab === 'users' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" /> Users Management
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                activeTab === 'audit' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" /> Audit Logs
            </button>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Top 4 Stat Cards (Screen #7 Mockup) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">{stats?.totalUsers || 0}</p>
                <p className="text-[11px] font-medium text-slate-500">Total Users</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">{stats?.totalLostItems || 0}</p>
                <p className="text-[11px] font-medium text-slate-500">Lost Items</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">{stats?.totalFoundItems || 0}</p>
                <p className="text-[11px] font-medium text-slate-500">Found Items</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-amber-600">{stats?.pendingApprovals || 0}</p>
                <p className="text-[11px] font-medium text-slate-500">Pending Approvals</p>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & APPROVALS (Screen #7 Mockup) */}
          {(activeTab === 'overview' || activeTab === 'approvals') && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Pending Found Item Approvals</h3>
                  <p className="text-[11px] text-slate-500">Approve submissions to publish them to the Explore feed.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  {pendingItems.length} Pending
                </span>
              </div>

              {pendingItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  All found items and match responses have been reviewed!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Image</th>
                        <th className="py-3 px-4">Item Name</th>
                        <th className="py-3 px-4">Submitted By</th>
                        <th className="py-3 px-4">Custody Desk</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                              <img
                                src={item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80'}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {item.title}
                            <span className="block text-[10px] text-slate-400 font-normal">{item.location?.building}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {item.finderName || 'Student / Employee'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {item.centralDropLocation?.name || 'Reception Desk'}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {item.eventDate}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 inline-flex items-center justify-center transition-colors"
                              title="Approve and Publish"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              className="w-7 h-7 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 inline-flex items-center justify-center transition-colors"
                              title="Reject Submission"
                            >
                              <X className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CUSTODY & DESK HANDOVER (Rule 26, 27) */}
          {activeTab === 'custody' && (
            <div className="space-y-6">
              
              {/* Handover Verification Form */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Central Reception Handover Desk</h3>
                    <p className="text-xs text-slate-500">Verify Claimant's Pickup Reference Code and complete final physical handover.</p>
                  </div>
                </div>

                {handoverMessage.text && (
                  <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                    handoverMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {handoverMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-600" />}
                    <span>{handoverMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleHandoverSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Pickup Reference Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. KH-2026-000921"
                      value={pickupCodeInput}
                      onChange={(e) => setPickupCodeInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold tracking-wider uppercase focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Handover Audit Notes</label>
                    <input
                      type="text"
                      value={handoverNotes}
                      onChange={(e) => setHandoverNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-end">
                    <button
                      type="submit"
                      disabled={handoverSubmitting}
                      className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {handoverSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Handover
                    </button>
                  </div>
                </form>
              </div>

              {/* Custody Records Table */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Physical Storage Records</h4>
                  <span className="text-xs text-slate-500">{custodyRecords.length} items logged</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">Item</th>
                        <th className="py-2.5 px-4">Drop Location</th>
                        <th className="py-2.5 px-4">Pickup Code</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Handed Over To</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {custodyRecords.map((r) => (
                        <tr key={r.id}>
                          <td className="py-3 px-4 font-semibold text-slate-900">{r.itemTitle}</td>
                          <td className="py-3 px-4 text-slate-600">{r.locationName}</td>
                          <td className="py-3 px-4 font-mono font-bold text-amber-700">{r.pickupReferenceCode || 'Pending Confirmation'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'HANDED_OVER' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{r.handoverToUserName || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ALL ITEMS & RETURNED */}
          {activeTab === 'items' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Returned Items History ({returnedItems.length})</h3>
                <p className="text-xs text-slate-500 mb-4">Complete archival of successfully reunited belongings.</p>
                
                <div className="space-y-3">
                  {returnedItems.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{item.title}</span>
                        <span className="text-slate-500">{item.location?.building} • Found by {item.finderName || 'Samaritan'}</span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs">
                        Returned & Completed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Campus Directory & Permissions</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">Department</th>
                      <th className="py-2.5 px-4">Karma</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 px-4 font-semibold text-slate-900">{u.fullName}</td>
                        <td className="py-3 px-4 text-slate-500">{u.email}</td>
                        <td className="py-3 px-4 text-slate-600">{u.department || '—'}</td>
                        <td className="py-3 px-4 font-bold text-amber-600">{u.karmaPoints} pts</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleUser(u.id, u.status)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200 hover:bg-slate-100 text-slate-700"
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">System Security & Activity Audit Trail</h4>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-amber-400">
                          {log.action}
                        </span>
                        <span className="text-slate-500">{log.entityType} #{log.entityId}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{log.details}</p>
                      <p className="text-[10px] text-slate-400">Actor: {log.actorEmail || 'System'}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
