
import React from 'react';

export const Loader: React.FC = () => (
  <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex flex-col justify-center items-center z-50">
    <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    <h2 className="text-2xl font-semibold text-black mt-6">Analisando fitólito...</h2>
    <p className="text-gray-500 mt-2">Isso pode levar até 30 segundos.</p>
  </div>
);
