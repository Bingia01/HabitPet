import type { Analyzer, AnalyzeInput, AnalyzeOutput } from '../../types';

const DEFAULT_RESPONSE: AnalyzeOutput = {
  items: [
    {
      label: 'Grilled Chicken',
      confidence: 0.82,
      calories: 320,
      weightGrams: 180,
      volumeML: 190,
      priors: {
        kcalPerG: { mu: 1.75, sigma: 0.22 },
        density: { mu: 1.05, sigma: 0.08 },
      },
      evidence: ['Stub', 'Geometry'],
    },
  ],
  meta: {
    used: ['stub'],
    latencyMs: 12,
  },
};

export class StubAnalyzer implements Analyzer {
  async analyze(_: AnalyzeInput): Promise<AnalyzeOutput> {
    return DEFAULT_RESPONSE;
  }
}

