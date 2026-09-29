import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Building2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const ItemCard = ({ item, onClaimClick, onFoundMatchClick }) => {
  const isFound = item.type === 'FOUND';
  const defaultImage = isFound
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80'
    : 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80';

  const imageUrl = item.imageUrls && item.imageUrls.length > 0
    ? (item.imageUrls[0].startsWith('http') ? item.imageUrls[0] : `http://localhost:8080${item.imageUrls[0]}`)
    : defaultImage;

  const locationText = item.location
    ? `${item.location.building || ''}${item.location.areaDetails ? ' - ' + item.location.areaDetails : ''}`
    : 'Campus Location';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col overflow-hidden group">
      
      {/* Thumbnail and Status Badge */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = defaultImage; }}
        />
        
        {/* Type Badge: FOUND vs LOST */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${
            isFound
              ? 'bg-amber-400 text-slate-950 font-bold border border-amber-300'
              : 'bg-indigo-600 text-white font-bold border border-indigo-500'
          }`}>
            {item.type}
          </span>
          {item.status === 'RETURNED' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500 text-white shadow-sm">
              Returned
            </span>
          )}
        </div>

        {/* Category Label */}
        {item.category && (
          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/75 backdrop-blur-sm text-slate-100">
            {item.category.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Body Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-amber-600 transition-colors">
            {item.title}
          </h3>

          <div className="mt-2 space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{isFound ? 'Found' : 'Lost'} on: {item.eventDate || 'Recently'}</span>
            </div>
          </div>

          <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Central Desk & Footer Controls */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
          
          {item.centralDropLocation?.name && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
              <Building2 className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate font-medium">Desk: {item.centralDropLocation.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-1">
            {isFound ? (
              <>
                {item.canClaim ? (
                  <button
                    onClick={() => onClaimClick(item)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    Claim This Item
                  </button>
                ) : (
                  <Link
                    to={`/items/${item.id}`}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center transition-colors"
                  >
                    View Details
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to={`/items/${item.id}`}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center transition-colors"
                >
                  View Details
                </Link>
                {!item.isOwnerOrFinder && onFoundMatchClick && (
                  <button
                    onClick={() => onFoundMatchClick(item)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors text-center"
                  >
                    I Found This
                  </button>
                )}
              </>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default ItemCard;
