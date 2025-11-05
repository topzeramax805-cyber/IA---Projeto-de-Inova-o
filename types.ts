
export interface FormData {
  depth: number;
  context_type: string;
  country: string;
  region: string;
  site_type: string;
  has_dating: 'sim' | 'nao';
  dating_years?: number;
  estimated_period?: string;
  artifacts: string[];
  occupation_type: string;
  fire_evidence: 'sim' | 'nao' | 'incerto';
  notes: string;
}

export interface AnalysisResult {
  morphotype: string;
  cell_type: string;
  family: string;
  subfamily: string;
  species: {
    possible_matches: string[];
    confidence_level: 'Alta' | 'Média' | 'Baixa';
    reasoning: string;
  };
  plant_part: string;
  morphological_description: {
    shape: string;
    dimensions: string;
    surface_ornamentation: string;
    diagnostic_features: string;
    preservation_state: string;
  };
  historical_period: {
    geological_cultural_period: string;
    estimated_age_range: string;
    confidence_percentage: number;
    dating_basis: string;
  };
  archaeological_context_interpretation: {
    plant_use: string;
    cultural_significance: string;
    fire_impact_analysis: string;
    association_with_artifacts: string;
    subsistence_strategy: string;
    environmental_reconstruction: string;
  };
  sample_site_details: {
    sample_type: string;
    sample_site: string;
    research_group: string;
    id_sample: string;
  };
  additional_observations: string;
  confidence_analysis: {
    morphotype: number;
    family: number;
    subfamily: number;
    species: number;
    period: number;
    archaeological_interpretation: number;
  };
  recommendations: string;
}
