import React from 'react';
import Icon from './Icon';

const colorMap = {
  primary: 'bg-primary-100 text-primary-700',
  green:   'bg-primary-100 text-primary-700',
  blue:    'bg-primary-100 text-primary-600',
  purple:  'bg-primary-100 text-primary-700',
  orange:  'bg-primary-100 text-accent',
};

const StatCard = ({ label, value, sub, icon, iconName, color = 'primary' }) => {
  const iconBg = colorMap[color] || colorMap.primary;

  return (
    <div className="stat-card">
      {(iconName || icon) && (
        <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${iconBg} shrink-0`}>
          {iconName ? (
            <Icon name={iconName} className="w-5 h-5" />
          ) : (
            <span className="text-xl leading-none">{icon}</span>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
    </div>
  );
};

export default StatCard;
