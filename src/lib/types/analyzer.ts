export type AnalyzerSource = 'supabase' | 'openai' | 'stub';

export type AnalyzeInput = {
  imageUrl?: string;
  imageBase64?: string;
  region?: string;
};

export type AnalyzeItem = {
  label: string;
  confidence: number;
  calories?: number;
  weightGrams?: number;
  volumeML?: number;
  priors?: {
    kcalPerG: { mu: number; sigma: number };
    density: { mu: number; sigma: number };
  };
  evidence?: string[];
};

export type AnalyzeOutput = {
  items: AnalyzeItem[];
  meta?: {
    used: AnalyzerSource[];
    latencyMs?: number;
    isFallback?: boolean;
  };
};

export interface Analyzer {
  analyze(input: AnalyzeInput): Promise<AnalyzeOutput>;
}
