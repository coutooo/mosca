export interface AnalysisMetrics {
  ommatidiaCount: number; // 0 to 800 facets
  phototaxisScore: number; // 0 to 100
  edgeContrast: number; // 0 to 100 (Lamina L1/L2)
  saccadeFixation: number; // 0 to 100 (% of gaze)
  dopamineDelta: number; // -50% to +100%
  giantFiberReflex: number; // 0 to 100% (escape risk)
  overallAttractiveness: number; // 0 to 100
  spectralUVBlue: number; // 0 to 100 (Rh1/Rh3/Rh5 excitation)
}

export interface ComparisonResult {
  winner: 'A' | 'B' | 'TIE';
  winnerMargin: number; // percentage points
  metricsA: AnalysisMetrics;
  metricsB: AnalysisMetrics;
  projectedCtrLift: string;
  scientificVerdict: string;
  quip: string;
  roast: string;
  asaRecommendation: string;
  timestamp: string;
}

export interface PresetPair {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  nameA: string;
  nameB: string;
  iconAUrl: string;
  iconBUrl: string;
}

export type VisionMode = 'normal' | 'ommatidia' | 'spectral' | 'saliency';
