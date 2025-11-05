
import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { generatePdf } from './PDFGenerator';

interface ResultsDisplayProps {
  result: AnalysisResult;
  imagePreviewUrl: string;
  onNewAnalysis: () => void;
}

const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 transition-transform"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-200 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <h3 className="text-lg font-semibold text-black">{title}</h3>
                <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 bg-white">{children}</div>}
        </div>
    );
};

const ProgressBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
    const getColor = (val: number) => {
        if (val < 40) return 'bg-red-500';
        if (val < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm font-semibold text-black">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`${getColor(value)} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, imagePreviewUrl, onNewAnalysis }) => {
  const handleExportPdf = () => {
    generatePdf(result, imagePreviewUrl);
  };
    
  return (
    <div className="bg-white text-black min-h-screen py-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Relatório de Análise de Fitólito</h1>
          <p className="text-gray-500 mt-2">ID da amostra: {result.sample_site_details.id_sample} | Análise Completa</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
                <img src={imagePreviewUrl} alt="Fitólito analisado" className="w-full h-auto object-contain rounded-md border border-gray-300 mb-4" />
                <a href={imagePreviewUrl} download="phytolith_image.png" className="w-full text-center py-2 px-4 bg-gray-200 text-black font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                    Download Imagem
                </a>
            </div>
            <div className="lg:col-span-2 bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-3xl font-bold text-black">{result.morphotype}</h2>
                <p className="text-lg text-gray-600 mt-1">{result.family} / {result.subfamily}</p>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div><strong className="block text-gray-800">Tipo de célula:</strong> {result.cell_type}</div>
                    <div><strong className="block text-gray-800">Parte da planta:</strong> {result.plant_part}</div>
                </div>
            </div>
        </div>

        <div className="space-y-4 mb-8">
          <AccordionItem title="📊 Descrição Morfológica">
            <div className="prose max-w-none">
              <ul>
                <li><strong>Forma:</strong> {result.morphological_description.shape}</li>
                <li><strong>Dimensões:</strong> {result.morphological_description.dimensions}</li>
                <li><strong>Ornamentação superficial:</strong> {result.morphological_description.surface_ornamentation}</li>
                <li><strong>Características diagnósticas:</strong> {result.morphological_description.diagnostic_features}</li>
                <li><strong>Estado de preservação:</strong> {result.morphological_description.preservation_state}</li>
              </ul>
            </div>
          </AccordionItem>
          <AccordionItem title="🕰️ Datação e Período">
            <div className="space-y-4">
              <div><strong className="text-gray-800">Período:</strong> <span className="text-lg font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{result.historical_period.geological_cultural_period}</span></div>
              <div><strong className="text-gray-800">Intervalo de anos:</strong> {result.historical_period.estimated_age_range}</div>
              <div><strong className="text-gray-800">Base da datação:</strong> {result.historical_period.dating_basis}</div>
              <ProgressBar label="Confiança na datação" value={result.historical_period.confidence_percentage} />
            </div>
          </AccordionItem>
          <AccordionItem title="🏺 Contexto Arqueológico e Interpretação" defaultOpen={true}>
             <div className="prose max-w-none">
                <ul>
                    <li><strong>Uso provável da planta:</strong> {result.archaeological_context_interpretation.plant_use}</li>
                    <li><strong>Significância cultural:</strong> {result.archaeological_context_interpretation.cultural_significance}</li>
                    <li><strong>Análise de impacto do fogo:</strong> {result.archaeological_context_interpretation.fire_impact_analysis}</li>
                    <li><strong>Associação com artefatos:</strong> {result.archaeological_context_interpretation.association_with_artifacts}</li>
                    <li><strong>Estratégia de subsistência:</strong> {result.archaeological_context_interpretation.subsistence_strategy}</li>
                    <li><strong>Reconstrução ambiental:</strong> {result.archaeological_context_interpretation.environmental_reconstruction}</li>
                </ul>
             </div>
          </AccordionItem>
           <AccordionItem title="🌿 Possíveis Espécies">
                <div className="space-y-3">
                    <p><strong>Correspondências:</strong> {result.species.possible_matches.join(', ')}</p>
                    <p><strong>Nível de confiança:</strong> {result.species.confidence_level}</p>
                    <p><strong>Justificativa:</strong> {result.species.reasoning}</p>
                </div>
           </AccordionItem>
           <AccordionItem title="🔬 Dados da Amostra">
                <div className="grid grid-cols-2 gap-4">
                    <div><strong>Tipo de amostra:</strong> {result.sample_site_details.sample_type}</div>
                    <div><strong>Local do sítio:</strong> {result.sample_site_details.sample_site}</div>
                </div>
           </AccordionItem>
            <AccordionItem title="📝 Observações e Recomendações">
                <p>{result.additional_observations}</p>
                <h4 className="font-semibold mt-4 mb-2">Recomendações:</h4>
                <p>{result.recommendations}</p>
           </AccordionItem>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-black mb-4">Análise de Confiança</h3>
            <div className="space-y-3">
                {Object.entries(result.confidence_analysis).map(([key, value]) => (
                    <ProgressBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')} value={value} />
                ))}
            </div>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-white bg-opacity-90 backdrop-blur-sm border-t border-gray-200 p-4 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button onClick={handleExportPdf} className="w-full sm:w-auto px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors">📄 Exportar Relatório PDF</button>
              <button className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-black font-semibold rounded-lg hover:bg-gray-300 transition-colors">💾 Salvar Análise</button>
              <button onClick={onNewAnalysis} className="w-full sm:w-auto px-6 py-3 bg-white text-black font-semibold rounded-lg border-2 border-black hover:bg-gray-100 transition-colors">🔄 Nova Análise</button>
          </div>
      </footer>
    </div>
  );
};
