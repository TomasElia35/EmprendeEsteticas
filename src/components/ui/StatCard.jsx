import React from 'react';

const StatCard = ({ label, value, sub, icon, color = 'primary' }) => {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <div className={`rounded-xl border p-5 flex items-center gap-4 ${colorMap[color]}`}>
      {icon && (
        <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg bg-white/60 shadow-sm">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider opacity-70 truncate">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

export default StatCard;
