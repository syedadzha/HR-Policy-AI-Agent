
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-base-100 shadow-sm p-4 md:p-6 border-b border-base-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-3xl mr-3">📘</span> Company Policy Assistant
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ask, explore, and understand your company policies instantly.
        </p>
      </div>
    </header>
  );
};
