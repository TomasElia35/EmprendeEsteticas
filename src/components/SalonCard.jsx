import React from 'react';
import Icon from './ui/Icon';

const SalonCard = ({ salon, onClick }) => {
  return (
    <div
      className="card overflow-hidden hover:shadow-card-md transition-shadow cursor-pointer"
      onClick={() => onClick(salon.id)}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={salon.photo}
          alt={salon.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-xl shadow-sm text-sm font-semibold text-primary-800 flex items-center gap-1">
          <Icon name="star" className="w-4 h-4 text-accent" />
          {salon.rating} ({salon.reviews})
        </div>
      </div>
      <div className="p-5 space-y-2">
        <div className="flex flex-wrap gap-2">
          {salon.categories.map((cat, idx) => (
            <span key={idx} className="badge badge-neutral uppercase tracking-wider text-xs">
              {cat}
            </span>
          ))}
        </div>
        <h3 className="font-bold text-secondary text-base">{salon.name}</h3>
        <p className="text-primary-600 text-sm line-clamp-2">{salon.description}</p>
        <div className="flex items-center gap-2 text-sm text-primary-600">
          <Icon name="map-pin" className="w-4 h-4 text-primary-500" />
          {salon.address}
        </div>
      </div>
    </div>
  );
};

export default SalonCard;
