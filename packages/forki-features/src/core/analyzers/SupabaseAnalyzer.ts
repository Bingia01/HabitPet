import type { Analyzer, AnalyzeInput, AnalyzeOutput } from '../../types';

const FUNCTION_PATH = '/functions/v1/analyze_food';

export class SupabaseAnalyzer implements Analyzer {
  private baseUrl: string;
  private anonKey: string;

  constructor(baseUrl: string, anonKey: string) {
    this.baseUrl = baseUrl;
    this.anonKey = anonKey;
  }

  async analyze(input: AnalyzeInput): Promise<AnalyzeOutput> {
    if (!this.baseUrl || !this.anonKey) {
      throw new Error('Supabase credentials missing');
    }

    const endpoint = new URL(FUNCTION_PATH, this.baseUrl).toString();
    const payload = {
      imageUrl: input.imageUrl,
      imageBase64: input.imageBase64,
      region: input.region,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: this.anonKey,
        Authorization: `Bearer ${this.anonKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase analyzer failed: ${response.status} - ${text}`);
    }

    const data = (await response.json()) as AnalyzeOutput;
    if (!data?.items?.length) {
      throw new Error('Supabase analyzer returned empty payload');
    }

    return {
      ...data,
      meta: {
        used: ['supabase'],
        ...data.meta,
      },
    };
  }
}

