
import React, { useState, useEffect, useMemo } from 'react';
import type { FormData } from '../types';
import { COUNTRIES, CONTEXT_TYPES, SITE_TYPES, ESTIMATED_PERIODS, ARTIFACTS, OCCUPATION_TYPES, MIN_NOTES_LENGTH } from '../constants';

interface ContextFormProps {
  onFormSubmit: (formData: FormData) => void;
  isImageUploaded: boolean;
}

type FormErrors = { [K in keyof FormData]?: string };

const initialFormData: FormData = {
  depth: 0,
  context_type: '',
  country: '',
  region: '',
  site_type: '',
  has_dating: 'nao',
  dating_years: undefined,
  estimated_period: '',
  artifacts: [],
  occupation_type: '',
  fire_evidence: 'incerto',
  notes: '',
};


export const ContextForm: React.FC<ContextFormProps> = ({ onFormSubmit, isImageUploaded }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (data: FormData): FormErrors => {
    const newErrors: FormErrors = {};
    if (data.depth <= 0) newErrors.depth = 'Profundidade deve ser maior que 0.';
    if (!data.context_type) newErrors.context_type = 'Campo obrigatório.';
    if (!data.country) newErrors.country = 'Campo obrigatório.';
    if (!data.region) newErrors.region = 'Campo obrigatório.';
    if (!data.site_type) newErrors.site_type = 'Campo obrigatório.';
    if (data.has_dating === 'sim' && (!data.dating_years || data.dating_years <= 0)) newErrors.dating_years = 'Datação AP deve ser maior que 0.';
    if (data.has_dating === 'nao' && !data.estimated_period) newErrors.estimated_period = 'Campo obrigatório.';
    if (data.artifacts.length === 0) newErrors.artifacts = 'Selecione ao menos uma opção.';
    if (!data.occupation_type) newErrors.occupation_type = 'Campo obrigatório.';
    if (data.notes.length < MIN_NOTES_LENGTH) newErrors.notes = `Mínimo de ${MIN_NOTES_LENGTH} caracteres.`;
    return newErrors;
  };
  
  const isFormValid = useMemo(() => Object.keys(validate(formData)).length === 0, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = value as 'sim' | 'nao' | 'incerto';
    setFormData(prev => {
        const newState = { ...prev, [name]: val };
        if(name === 'has_dating'){
            if(val === 'sim') newState.estimated_period = '';
            else newState.dating_years = undefined;
        }
        return newState;
    });
  };
  
  const handleArtifactsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      let newArtifacts;
      if (checked) {
        newArtifacts = [...prev.artifacts.filter(a => a !== 'Nenhum'), value];
      } else {
        newArtifacts = prev.artifacts.filter(artifact => artifact !== value);
      }
      if(value === 'Nenhum' && checked){
          newArtifacts = ['Nenhum'];
      }
      return { ...prev, artifacts: newArtifacts };
    });
  };

  useEffect(() => {
    const newErrors = validate(formData);
    setErrors(newErrors);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && isImageUploaded) {
      onFormSubmit(formData);
    }
  };

  const filledFieldsCount = Object.entries(formData).filter(([key, value]) => {
    if (key === 'dating_years' && formData.has_dating === 'nao') return false;
    if (key === 'estimated_period' && formData.has_dating === 'sim') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== '' && value !== 0 && value !== undefined;
  }).length;
  const totalFields = 11;

  const renderError = (field: keyof FormData) => errors[field] ? <span className="text-red-500 text-xs mt-1">{errors[field]}</span> : null;
  const fieldClass = (field: keyof FormData) => `w-full p-2 border ${errors[field] ? 'border-red-400' : 'border-gray-300'} rounded-md bg-white focus:ring-1 focus:ring-black focus:border-black transition-colors`;
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const requiredLabel = (label: string) => <label className={labelClass}>{label} <span className="text-red-500">*</span></label>;


  return (
    <div className="bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-black">2. Questionário Contextual</h2>
        <span className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full">{filledFieldsCount}/{totalFields}</span>
      </div>
       <p className="text-gray-500 mb-6">Todos os campos são obrigatórios para uma análise precisa.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Contexto Estratigráfico */}
        <fieldset className="p-4 border rounded-md">
          <legend className="text-lg font-semibold px-2">Contexto Estratigráfico</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              {requiredLabel('Profundidade da coleta (cm)')}
              <input type="number" name="depth" value={formData.depth || ''} onChange={handleChange} className={fieldClass('depth')} />
              {renderError('depth')}
            </div>
            <div>
              {requiredLabel('Tipo de contexto')}
              <select name="context_type" value={formData.context_type} onChange={handleChange} className={fieldClass('context_type')}>
                <option value="">Selecione...</option>
                {CONTEXT_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {renderError('context_type')}
            </div>
          </div>
        </fieldset>
        
        {/* Localização */}
        <fieldset className="p-4 border rounded-md">
          <legend className="text-lg font-semibold px-2">Localização</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              {requiredLabel('País')}
              <select name="country" value={formData.country} onChange={handleChange} className={fieldClass('country')}>
                <option value="">Selecione...</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {renderError('country')}
            </div>
            <div>
              {requiredLabel('Região/Estado')}
              <input type="text" name="region" value={formData.region} onChange={handleChange} className={fieldClass('region')} />
              {renderError('region')}
            </div>
            <div className="md:col-span-2">
              {requiredLabel('Tipo de sítio')}
              <select name="site_type" value={formData.site_type} onChange={handleChange} className={fieldClass('site_type')}>
                <option value="">Selecione...</option>
                {SITE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {renderError('site_type')}
            </div>
          </div>
        </fieldset>

        {/* Datação */}
        <fieldset className="p-4 border rounded-md">
            <legend className="text-lg font-semibold px-2">Datação</legend>
            <div className="mt-2">
                {requiredLabel('Existe datação radiocarbônica?')}
                <div className="flex items-center space-x-4">
                    <label><input type="radio" name="has_dating" value="sim" checked={formData.has_dating === 'sim'} onChange={handleRadioChange} /> Sim</label>
                    <label><input type="radio" name="has_dating" value="nao" checked={formData.has_dating === 'nao'} onChange={handleRadioChange} /> Não</label>
                </div>
            </div>
            {formData.has_dating === 'sim' ? (
                <div className="mt-4">
                    {requiredLabel('Datação (anos AP)')}
                    <input type="number" name="dating_years" value={formData.dating_years || ''} onChange={handleChange} className={fieldClass('dating_years')} />
                    {renderError('dating_years')}
                </div>
            ) : (
                <div className="mt-4">
                    {requiredLabel('Período estimado')}
                    <select name="estimated_period" value={formData.estimated_period} onChange={handleChange} className={fieldClass('estimated_period')}>
                        <option value="">Selecione...</option>
                        {ESTIMATED_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {renderError('estimated_period')}
                </div>
            )}
        </fieldset>

        {/* Contexto Arqueológico */}
        <fieldset className="p-4 border rounded-md">
          <legend className="text-lg font-semibold px-2">Contexto Arqueológico</legend>
          <div className="space-y-4 mt-2">
            <div>
                {requiredLabel('Presença de artefatos associados')}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {ARTIFACTS.map(artifact => (
                    <label key={artifact} className="flex items-center space-x-2">
                    <input type="checkbox" value={artifact} checked={formData.artifacts.includes(artifact)} onChange={handleArtifactsChange} />
                    <span>{artifact}</span>
                    </label>
                ))}
                </div>
                {renderError('artifacts')}
            </div>
             <div>
                {requiredLabel('Tipo de ocupação')}
                <select name="occupation_type" value={formData.occupation_type} onChange={handleChange} className={fieldClass('occupation_type')}>
                    <option value="">Selecione...</option>
                    {OCCUPATION_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                {renderError('occupation_type')}
            </div>
            <div>
                {requiredLabel('Evidências de uso do fogo')}
                 <div className="flex items-center space-x-4">
                    <label><input type="radio" name="fire_evidence" value="sim" checked={formData.fire_evidence === 'sim'} onChange={handleRadioChange} /> Sim</label>
                    <label><input type="radio" name="fire_evidence" value="nao" checked={formData.fire_evidence === 'nao'} onChange={handleRadioChange} /> Não</label>
                    <label><input type="radio" name="fire_evidence" value="incerto" checked={formData.fire_evidence === 'incerto'} onChange={handleRadioChange} /> Incerto</label>
                </div>
            </div>
            <div>
                {requiredLabel('Observações contextuais')}
                <textarea 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleChange} 
                    className={`${fieldClass('notes')} h-24`}
                    placeholder="Descreva o contexto: estratigrafia, associações, condições de preservação, etc."
                />
                <div className="flex justify-between items-center">
                  {renderError('notes')}
                  <span className={`text-xs ${formData.notes.length < MIN_NOTES_LENGTH ? 'text-gray-500' : 'text-green-600'}`}>
                    {formData.notes.length}/{MIN_NOTES_LENGTH}
                  </span>
                </div>
            </div>
          </div>
        </fieldset>

        <button 
          type="submit" 
          disabled={!isFormValid || !isImageUploaded}
          className="w-full py-3 px-4 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {!isImageUploaded ? 'Faça o upload da imagem primeiro' : !isFormValid ? 'Preencha todos os campos obrigatórios' : 'Analisar Fitólito'}
        </button>
      </form>
    </div>
  );
};
