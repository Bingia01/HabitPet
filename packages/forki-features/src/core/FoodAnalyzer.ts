import type { AnalyzeInput, AnalyzeOutput, FoodAnalysisResult, AnalyzerSource } from '../types';
import { SupabaseAnalyzer } from './analyzers/SupabaseAnalyzer';
import { OpenAIAnalyzer } from './analyzers/OpenAIAnalyzer';
import { StubAnalyzer } from './analyzers/StubAnalyzer';
import { getFallbackChain, getAnalyzerAvailability } from '../config/getConfig';

export interface FoodAnalyzerConfig {
  apiUrl?: string; // Optional: if provided, uses API endpoint instead of direct analyzers
  supabaseUrl?: string;
  supabaseKey?: string;
  openaiKey?: string;
  openaiModel?: string;
}

export class FoodAnalyzer {
  private config: FoodAnalyzerConfig;
  private useApiEndpoint: boolean;

  constructor(config: FoodAnalyzerConfig = {}) {
    this.config = config;
    // If apiUrl is provided, use API endpoint; otherwise use direct analyzers
    this.useApiEndpoint = !!config.apiUrl;
  }

  /**
   * Analyzes a food image and returns calorie/macro information
   * @param image - Can be Blob, File, base64 string, or image URL
   * @returns FoodAnalysisResult with calories, macros, weight, etc.
   */
  async analyzeImage(
    image: Blob | File | string
  ): Promise<FoodAnalysisResult> {
    let analysis: AnalyzeOutput;

    if (this.useApiEndpoint && this.config.apiUrl) {
      // Use API endpoint (Next.js route) - send FormData for Blob/File, JSON for string
      analysis = await this.analyzeViaAPI(image);
    } else {
      // Use direct analyzers with fallback chain
      const input = await this.convertImageToInput(image);
      analysis = await this.analyzeViaDirectAnalyzers(input);
    }

    // Map to FoodAnalysisResult format
    return this.mapToResult(analysis);
  }

  /**
   * Analyzes via API endpoint (Next.js route)
   * Handles both FormData (for Blob/File) and JSON (for base64/URL)
   */
  private async analyzeViaAPI(image: Blob | File | string): Promise<AnalyzeOutput> {
    if (!this.config.apiUrl) {
      throw new Error('API URL not configured');
    }

    let response: Response;

    if (image instanceof Blob || image instanceof File) {
      // Send as FormData (multipart/form-data)
      const formData = new FormData();
      formData.append('image', image, 'food.jpg');
      
      response = await fetch(this.config.apiUrl, {
        method: 'POST',
        body: formData,
      });
    } else {
      // String - could be URL or base64, send as JSON
      const input = await this.convertImageToInput(image);
      response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API analysis failed: ${response.status} - ${text}`);
    }

    const data = await response.json();
    
    // API returns legacy format, convert to AnalyzeOutput
    return this.convertLegacyToOutput(data);
  }

  /**
   * Analyzes via direct analyzers with fallback chain
   */
  private async analyzeViaDirectAnalyzers(input: AnalyzeInput): Promise<AnalyzeOutput> {
    const fallbackChain = getFallbackChain();
    let lastError: Error | null = null;
    let analysis: AnalyzeOutput | null = null;
    const usedAnalyzers: AnalyzerSource[] = [];

    // Try each analyzer in the chain until one succeeds
    for (const analyzerType of fallbackChain) {
      try {
        const analyzer = this.resolveAnalyzer(analyzerType);
        analysis = await analyzer.analyze(input);
        usedAnalyzers.push(analyzerType);
        break; // Success! Exit loop
      } catch (error) {
        usedAnalyzers.push(analyzerType);
        lastError = error instanceof Error ? error : new Error(String(error));
        // Continue to next analyzer in chain
      }
    }

    if (!analysis) {
      throw new Error(
        `All analyzers failed. Last error: ${lastError?.message || 'Unknown error'}`
      );
    }

    // Add metadata about which analyzers were tried
    if (!analysis.meta) {
      analysis.meta = { used: usedAnalyzers };
    } else {
      analysis.meta.used = usedAnalyzers;
    }
    analysis.meta.isFallback = usedAnalyzers.length > 1;

    return analysis;
  }

  /**
   * Resolves analyzer instance based on type
   */
  private resolveAnalyzer(type: AnalyzerSource) {
    switch (type) {
      case 'supabase':
        if (!this.config.supabaseUrl || !this.config.supabaseKey) {
          throw new Error('Supabase credentials not configured');
        }
        return new SupabaseAnalyzer(this.config.supabaseUrl, this.config.supabaseKey);
      case 'openai':
        if (!this.config.openaiKey) {
          throw new Error('OpenAI API key not configured');
        }
        return new OpenAIAnalyzer(this.config.openaiKey, this.config.openaiModel);
      case 'stub':
        return new StubAnalyzer();
      default:
        return new StubAnalyzer();
    }
  }

  /**
   * Converts image (Blob/File/string) to AnalyzeInput format
   */
  private async convertImageToInput(image: Blob | File | string): Promise<AnalyzeInput> {
    if (typeof image === 'string') {
      // String could be URL or base64
      if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
        return { imageUrl: image };
      } else {
        return { imageBase64: image };
      }
    }

    // Blob or File - convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix if present
        const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
        resolve({ imageBase64: base64Data });
      };
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });
  }

  /**
   * Maps AnalyzeOutput to FoodAnalysisResult (user-friendly format)
   */
  private mapToResult(result: AnalyzeOutput): FoodAnalysisResult {
    const topItem = result.items[0];
    const foodName = topItem?.label ?? 'Food Item';
    const confidence = this.clamp(topItem?.confidence ?? 0.6, 0, 1);

    // Extract macros
    const macros = topItem?.macros
      ? {
          proteinG: Math.round(topItem.macros.proteinG * 10) / 10,
          carbsG: Math.round(topItem.macros.carbsG * 10) / 10,
          fatG: Math.round(topItem.macros.fatG * 10) / 10,
          fiberG: topItem.macros.fiberG ? Math.round(topItem.macros.fiberG * 10) / 10 : undefined,
        }
      : undefined;

    // Calculate calories: prioritize macros-based calculation (most accurate)
    // Atwater factors: Protein 4 kcal/g, Carbs 4 kcal/g, Fat 9 kcal/g
    let calories: number;
    if (macros) {
      const calculatedFromMacros = Math.round(macros.proteinG * 4 + macros.carbsG * 4 + macros.fatG * 9);
      const caloriesFromItem = typeof topItem?.calories === 'number' ? Math.round(topItem.calories) : null;
      
      // Use macro-based calculation if it's more reasonable (at least 20 calories)
      // or if item calories seem too low (< 20) compared to macros
      if (calculatedFromMacros >= 20 && (!caloriesFromItem || caloriesFromItem < 20 || calculatedFromMacros > caloriesFromItem * 0.5)) {
        calories = calculatedFromMacros;
      } else {
        calories = caloriesFromItem ?? this.estimateCalories(foodName);
      }
    } else {
      calories = typeof topItem?.calories === 'number'
        ? Math.round(topItem.calories)
        : this.estimateCalories(foodName);
    }

    const weight =
      typeof topItem?.weightGrams === 'number'
        ? Math.round(topItem.weightGrams)
        : this.estimateWeight(foodName);

    const used = result.meta?.used && result.meta.used.length > 0 
      ? result.meta.used 
      : (['stub'] as AnalyzerSource[]);

    return {
      foodType: foodName,
      confidence,
      calories,
      weight,
      emoji: this.getFoodEmoji(foodName),
      macros,
      analyzerSource: used[0],
      usedFallback: result.meta?.isFallback || false,
    };
  }

  /**
   * Converts legacy API response format to AnalyzeOutput
   */
  private convertLegacyToOutput(data: any): AnalyzeOutput {
    return {
      items: [
        {
          label: data.foodType || 'Food Item',
          confidence: data.confidence || 0.6,
          calories: data.calories,
          weightGrams: data.weight,
          macros: data.macros,
          evidence: data.evidence || [],
        },
      ],
      meta: {
        used: data.meta?.used || ['stub'],
        latencyMs: data.meta?.latencyMs,
        isFallback: data.meta?.isFallback,
      },
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private estimateCalories(foodName: string): number {
    const foodCalories: Record<string, number> = {
      apple: 95,
      banana: 105,
      orange: 62,
      grape: 62,
      strawberry: 4,
      blueberry: 4,
      avocado: 234,
      broccoli: 55,
      carrot: 25,
      lettuce: 5,
      tomato: 18,
      cucumber: 16,
      spinach: 7,
      potato: 77,
      'sweet potato': 86,
      chicken: 165,
      beef: 250,
      fish: 206,
      salmon: 206,
      egg: 70,
      tofu: 94,
      cheese: 113,
      rice: 130,
      bread: 80,
      pasta: 131,
      quinoa: 120,
      oats: 154,
      milk: 42,
      yogurt: 59,
      butter: 102,
      almond: 7,
      walnut: 49,
      peanut: 6,
      default: 100,
    };

    const normalizedName = foodName.toLowerCase().trim();
    if (foodCalories[normalizedName]) {
      return foodCalories[normalizedName];
    }

    for (const [key, calories] of Object.entries(foodCalories)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return calories;
      }
    }
    return foodCalories.default;
  }

  private estimateWeight(foodName: string): number {
    const foodWeights: Record<string, number> = {
      apple: 150,
      banana: 120,
      orange: 130,
      grape: 100,
      strawberry: 150,
      blueberry: 100,
      avocado: 200,
      broccoli: 100,
      carrot: 80,
      lettuce: 50,
      tomato: 120,
      cucumber: 100,
      spinach: 30,
      potato: 150,
      'sweet potato': 130,
      chicken: 100,
      beef: 100,
      fish: 100,
      salmon: 100,
      egg: 50,
      tofu: 100,
      cheese: 30,
      rice: 100,
      bread: 30,
      pasta: 100,
      quinoa: 100,
      oats: 40,
      milk: 250,
      yogurt: 150,
      butter: 15,
      almond: 10,
      walnut: 10,
      peanut: 10,
      default: 100,
    };

    const normalizedName = foodName.toLowerCase().trim();
    if (foodWeights[normalizedName]) {
      return foodWeights[normalizedName];
    }

    for (const [key, weight] of Object.entries(foodWeights)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return weight;
      }
    }
    return foodWeights.default;
  }

  private getFoodEmoji(foodName: string): string {
    const emojiMap: Record<string, string> = {
      apple: '🍎',
      banana: '🍌',
      orange: '🍊',
      grape: '🍇',
      strawberry: '🍓',
      blueberry: '🫐',
      avocado: '🥑',
      broccoli: '🥦',
      carrot: '🥕',
      lettuce: '🥬',
      tomato: '🍅',
      cucumber: '🥒',
      spinach: '🥬',
      potato: '🥔',
      'sweet potato': '🍠',
      chicken: '🍗',
      beef: '🥩',
      fish: '🐟',
      salmon: '🐟',
      egg: '🥚',
      tofu: '🧈',
      cheese: '🧀',
      rice: '🍚',
      bread: '🍞',
      pasta: '🍝',
      quinoa: '🌾',
      oats: '🌾',
      milk: '🥛',
      yogurt: '🥛',
      butter: '🧈',
      almond: '🥜',
      walnut: '🥜',
      peanut: '🥜',
    };

    const normalizedName = foodName.toLowerCase().trim();
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return emoji;
      }
    }
    return '🍽️';
  }
}

