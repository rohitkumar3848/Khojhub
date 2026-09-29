import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  FileQuestion,
  PlusCircle,
  ShieldCheck,
  Building,
  MessageSquare,
  Gift,
  Filter,
  RotateCcw,
  Loader2,
  PackageOpen
} from 'lucide-react';
import { itemsApi } from '../services/api';
import ItemCard from '../components/items/ItemCard';
import ClaimVerificationModal from '../components/items/ClaimVerificationModal';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [itemType, setItemType] = useState(''); // '', 'FOUND', 'LOST'
  const [category, setCategory] = useState('');
  const [building, setBuilding] = useState('');

  // Claim modal state
  const [selectedItemForClaim, setSelectedItemForClaim] = useState(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [itemType, category, building]);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (itemType) params.type = itemType;
      if (category) params.category = category;
      if (building) params.building = building;

      const res = await itemsApi.getPublicItems(params);
      setItems(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load items.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setItemType('');
    setCategory('');
    setBuilding('');
  };

  const handleClaimClick = (item) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedItemForClaim(item);
    setIsClaimModalOpen(true);
  };

  const handleFoundMatchClick = (lostItem) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/items/${lostItem.id}`);
  };

  return (
    <div className="flex-1 flex flex-col pb-16">
      
      {/* 1. HERO SECTION (Matching Screen 1 Mockup) */}
      <section className="bg-gradient-to-b from-[#0B132B] via-[#111C3D] to-[#1C2541] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          
          {/* Left Text & Call to Action */}
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Lost something? <br />
              <span className="text-amber-400">Found something?</span> <br />
              Let's bring it back.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              A trusted platform for your campus or office to report, discover and return lost items with verified custody and ownership proof.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/report/lost"
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <FileQuestion className="w-4 h-4 stroke-[2.5]" />
                Report Lost
              </Link>
              <Link
                to="/report/found"
                className="px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/80 shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                Report Found
              </Link>
            </div>
          </div>

          {/* Right Highlight Feature Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 w-full lg:max-w-xs shrink-0">
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-3 rounded-xl flex items-center gap-3 shadow-md">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Secure verification</p>
                <p className="text-[11px] text-slate-400">5-question ownership challenge</p>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-3 rounded-xl flex items-center gap-3 shadow-md">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Central custody</p>
                <p className="text-[11px] text-slate-400">Items stored at verified desks</p>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-3 rounded-xl flex items-center gap-3 shadow-md">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Private chat</p>
                <p className="text-[11px] text-slate-400">Talk securely after quiz pass</p>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-3 rounded-xl flex items-center gap-3 shadow-md">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Optional rewards</p>
                <p className="text-[11px] text-slate-400">Encourage honest returns</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SEARCH AND FILTER TOOLBAR (Matching Mockup) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 z-20 w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-3.5 sm:p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lost or found items... (e.g. phone, wallet, laptop)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
              />
            </div>

            {/* Filter: Item Type */}
            <div className="w-full sm:w-auto min-w-[130px]">
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
              >
                <option value="">All Items</option>
                <option value="FOUND">Found Only</option>
                <option value="LOST">Lost Only</option>
              </select>
            </div>

            {/* Filter: Category */}
            <div className="w-full sm:w-auto min-w-[140px]">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
              >
                <option value="">Category (All)</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="WALLETS">Wallets</option>
                <option value="BAGS">Bags & Backpacks</option>
                <option value="KEYS">Keys & Keychain</option>
                <option value="DOCUMENTS_CARDS">Cards & Documents</option>
                <option value="CLOTHING_ACCESSORIES">Clothing & Wearables</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Filter: Building */}
            <div className="w-full sm:w-auto min-w-[140px]">
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
              >
                <option value="">Location (All)</option>
                <option value="Tower A">Tower A</option>
                <option value="Tower B">Tower B</option>
                <option value="Tower C">Tower C</option>
                <option value="Main Library">Main Library</option>
                <option value="Main Campus">Main Campus</option>
                <option value="Admin Block">Admin Block</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm transition-all"
              >
                Search
              </button>
              {(searchQuery || itemType || category || building) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

          </form>
        </div>
      </div>

      {/* 3. LATEST LOST & FOUND ITEMS GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 w-full">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Latest Lost & Found Items
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse recently reported items in your campus or office.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {items.length} {items.length === 1 ? 'item' : 'items'} available
          </span>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
            <span className="text-xs font-medium">Loading items...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-3">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
              <PackageOpen className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No items found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No reported items matched your filter criteria. Try resetting the filters or report a new lost/found item.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Items Grid (4 columns desktop, 2 columns tablet, 1 column mobile) */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClaimClick={handleClaimClick}
                onFoundMatchClick={handleFoundMatchClick}
              />
            ))}
          </div>
        )}

      </main>

      {/* 5-Question Claim Verification Challenge Modal */}
      <ClaimVerificationModal
        item={selectedItemForClaim}
        isOpen={isClaimModalOpen}
        onClose={() => {
          setIsClaimModalOpen(false);
          setSelectedItemForClaim(null);
        }}
      />

    </div>
  );
};

export default HomePage;
