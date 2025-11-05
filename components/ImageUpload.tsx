
import React, { useState, useCallback } from 'react';
import { MAX_FILE_SIZE } from '../constants';

interface ImageUploadProps {
  onImageUpload: (image: { file: File; previewUrl: string } | null) => void;
  image: { file: File; previewUrl: string } | null;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);


export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, image }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/bmp', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, TIFF, BMP, or WEBP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onImageUpload({ file, previewUrl });
  }, [onImageUpload]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl text-black mb-4">1. Upload de Imagem</h2>
      <p className="text-gray-500 mb-6">Arraste e solte a imagem do fitólito ou selecione um arquivo. Formatos aceitos: JPG, PNG, TIFF, BMP, WEBP (máx. 10MB).</p>
      
      {image ? (
        <div className="text-center">
          <img src={image.previewUrl} alt="Phytolith preview" className="max-h-80 w-auto mx-auto rounded-md object-contain border border-gray-300" />
          <button onClick={() => onImageUpload(null)} className="mt-4 text-sm text-red-600 hover:text-red-800">Remover Imagem</button>
        </div>
      ) : (
        <div 
          onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragging ? 'border-black bg-gray-100' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <input type="file" id="file-upload" className="hidden" onChange={onFileChange} accept="image/jpeg,image/png,image/tiff,image/bmp,image/webp" />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <UploadIcon />
            <p className="mt-2 text-sm text-gray-600">Arraste e solte ou <span className="font-semibold text-black">clique para selecionar</span></p>
          </label>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      
      <div className="mt-6 p-4 bg-gray-100 rounded-md text-sm text-gray-600">
        <h4 className="font-semibold text-gray-800 mb-2">Captura do Microscópio (Futuro)</h4>
        <p>A integração com Raspberry Pi para captura automática de imagens será disponibilizada em uma futura atualização.</p>
        <button className="mt-2 w-full bg-gray-300 text-gray-500 font-semibold py-2 px-4 rounded-md cursor-not-allowed" disabled>
          Capturar do Microscópio
        </button>
      </div>
    </div>
  );
};
