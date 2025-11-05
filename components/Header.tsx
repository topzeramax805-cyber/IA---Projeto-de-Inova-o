import React from 'react';

export const Header: React.FC = () => (
  <header className="bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-black rounded-full"></div>
        <h1 className="text-2xl font-semibold text-black">
          Sistema de Análise de fitólito
        </h1>
      </div>
    </div>
  </header>
);