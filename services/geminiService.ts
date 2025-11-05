
import { GoogleGenAI } from "@google/genai";
import type { FormData, AnalysisResult } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const buildPrompt = (formData: FormData): string => {
  const dating_info = formData.has_dating === 'sim' 
    ? `${formData.dating_years} anos AP` 
    : `Período estimado: ${formData.estimated_period}`;

  return `Você é um especialista sênior em análise de fitólitos com décadas de experiência em arqueobotânica, paleoecologia e análise de contextos arqueológicos.

CONTEXTO COMPLETO DA AMOSTRA:

ESTRATIGRAFIA:
- Profundidade: ${formData.depth} cm
- Tipo de contexto: ${formData.context_type}
- Tipo de sítio: ${formData.site_type}

LOCALIZAÇÃO:
- País: ${formData.country}
- Região: ${formData.region}

CRONOLOGIA:
- Datação: ${dating_info}

CONTEXTO ARQUEOLÓGICO COMPLETO:
- Artefatos associados: ${formData.artifacts.join(', ')}
- Tipo de ocupação: ${formData.occupation_type}
- Evidências de uso do fogo: ${formData.fire_evidence}
- Observações contextuais detalhadas: ${formData.notes}

TAREFA DE ANÁLISE:
Analise o fitólito na imagem fornecida e produza um relatório científico estruturado em JSON com os seguintes campos:

{
  "morphotype": "Classificação morfológica detalhada",
  "cell_type": "Tipo de célula específico (short cell, long cell, bulliform, hair cell, etc.)",
  "family": "Família botânica",
  "subfamily": "Subfamília (se identificável, caso contrário 'Indeterminado')",
  "species": {
    "possible_matches": ["espécie 1", "espécie 2", "espécie 3"],
    "confidence_level": "Alta/Média/Baixa",
    "reasoning": "Justificativa para as correspondências"
  },
  "plant_part": "Parte da planta de origem (folha, caule, inflorescência, raiz)",
  "morphological_description": {
    "shape": "Descrição detalhada da forma",
    "dimensions": "Dimensões estimadas em micrometros",
    "surface_ornamentation": "Ornamentação da superfície",
    "diagnostic_features": "Características diagnósticas principais",
    "preservation_state": "Estado de preservação"
  },
  "historical_period": {
    "geological_cultural_period": "Período geológico/cultural baseado no contexto",
    "estimated_age_range": "Intervalo de anos estimado",
    "confidence_percentage": 85,
    "dating_basis": "Base para a estimativa (estratigrafia, datação C14, artefatos associados)"
  },
  "archaeological_context_interpretation": {
    "plant_use": "Uso provável da planta (alimentação, construção, combustível, ritual, medicinal, etc.)",
    "cultural_significance": "Significância cultural no contexto",
    "fire_impact_analysis": "Análise de impacto do fogo (se aplicável)",
    "association_with_artifacts": "Interpretação das associações com artefatos",
    "subsistence_strategy": "Estratégia de subsistência indicada",
    "environmental_reconstruction": "Reconstrução ambiental sugerida"
  },
  "sample_site_details": {
    "sample_type": "Tipo de amostra",
    "sample_site": "Local da amostra",
    "research_group": "Grupo de pesquisa (se fornecido)",
    "id_sample": "ID da amostra (gerar código único)"
  },
  "additional_observations": "Qualquer informação técnica ou contexto adicional relevante",
  "confidence_analysis": {
    "morphotype": 90,
    "family": 85,
    "subfamily": 70,
    "species": 60,
    "period": 75,
    "archaeological_interpretation": 80
  },
  "recommendations": "Recomendações para análises complementares ou validações necessárias"
}

DIRETRIZES CRÍTICAS:
- Use o contexto arqueológico COMPLETO fornecido para fazer interpretações culturais
- A datação deve considerar PRIMARIAMENTE: estratigrafia > datação C14 > artefatos associados > morfologia
- Seja específico sobre o uso cultural da planta no contexto arqueológico fornecido
- Considere a geografia para espécies prováveis da região
- Seja honesto sobre incertezas e indique nível de confiança
- Use terminologia científica apropriada
- Interprete as associações com artefatos e tipo de ocupação
- Analise evidências de processamento/uso do fogo se presente

Retorne APENAS um objeto JSON válido, sem markdown, sem \`\`\`json, sem texto adicional.`;
};

export const analyzePhytolith = async (imageFile: File, formData: FormData): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const imagePart = await fileToGenerativePart(imageFile);
  const textPart = { text: buildPrompt(formData) };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
    });
    
    let text = response.text.trim();
    if (text.startsWith('```json')) {
      text = text.substring(7, text.length - 3).trim();
    } else if (text.startsWith('```')) {
        text = text.substring(3, text.length - 3).trim();
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a valid response from the AI model. Please check the console for details.");
  }
};
