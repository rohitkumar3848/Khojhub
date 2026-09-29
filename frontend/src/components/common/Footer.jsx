import React from 'react';
import { Package, ShieldCheck, Heart, MapPin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 text-white font-bold text-lg mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Package className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span>Khoj<span className="text-amber-400">Hub</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A trusted lost and found platform for university campuses, institutions, and corporate facilities.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Workflow</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/explore" className="hover:text-amber-400 transition-colors">Search Belongings</Link></li>
              <li><Link to="/report/found" className="hover:text-amber-400 transition-colors">Report Found Item</Link></li>
              <li><Link to="/report/lost" className="hover:text-amber-400 transition-colors">Report Lost Item</Link></li>
              <li><Link to="/my-claims" className="hover:text-amber-400 transition-colors">Track Ownership Claims</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Security & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> 5-Question Challenge</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> Verified Custody Desks</li>
              <li className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-amber-400" /> Honest Samaritan Rewards</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Central Desks</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              All physical custody items are verified and held securely at Tower B Reception & Main Library Help Desk.
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Mail className="w-3.5 h-3.5" /> lostandfound@khojhub.local
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KhojHub. Find it. Verify it. Return it.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with Spring Boot, MongoDB & React
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
