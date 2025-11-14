import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import { z } from 'zod';

import { stubAnalyzer } from '@/lib/analyzers/stub';
import { supabaseAnalyzer } from '@/lib/analyzers/supabase';
import { openAIAnalyzer } from '@/lib/analyzers/openai';
import { getFallbackChain } from '@/lib/config/analyzer-config';
import type { Analyzer, AnalyzerSource, AnalyzeInput, AnalyzeOutput } from '@/lib/types/analyzer';

export const runtime = 'nodejs';

const RequestSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z
    .string()
    .regex(/^[A-Za-z0-9+/]+=*$/, 'imageBase64 must be base64 encoded')
    .optional(),
  region: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, imageUrl, region, errorResponse } = await extractInput(request);

    if (errorResponse) {
      return errorResponse;
    }

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const baseInput: AnalyzeInput = {
      imageBase64,
      imageUrl,
      region,
    };

    // USE FALLBACK CHAIN - Try analyzers in sequence
    const fallbackChain = getFallbackChain();
    let lastError: Error | null = null;
    let analysis: AnalyzeOutput | null = null;
    const usedAnalyzers: AnalyzerSource[] = [];

    // Try each analyzer in the chain until one succeeds
    for (const analyzerType of fallbackChain) {
      try {
        const analyzer = resolveAnalyzer(analyzerType);
        console.log(`[analyze-food] Trying ${analyzerType} analyzer...`);
        analysis = await analyzer.analyze(baseInput);
        usedAnalyzers.push(analyzerType);
        console.log(`[analyze-food] ✓ ${analyzerType} analyzer succeeded`);
        break; // Success! Exit loop
      } catch (error) {
        console.warn(`[analyze-food] ✗ ${analyzerType} analyzer failed:`, error);
        usedAnalyzers.push(analyzerType);
        lastError = error instanceof Error ? error : new Error(String(error));
        // Continue to next analyzer in chain
      }
    }

    if (!analysis) {
      console.error('[analyze-food] All analyzers failed. Last error:', lastError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'All analyzers failed to analyze the image',
          details: lastError?.message 
        },
        { status: 500 }
      );
    }

    // Add metadata about which analyzers were tried
    analysis.meta = {
      ...analysis.meta,
      used: usedAnalyzers,
      isFallback: usedAnalyzers.length > 1, // True if we had to fallback
    };

    const payload = mapToLegacyResponse(analysis);

    const response = NextResponse.json(payload, {
      status: 200,
    });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    console.error('[analyze-food] fatal error', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze food image' },
      { status: 500 },
    );
  }
}

async function extractInput(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!(file instanceof File)) {
      return {
        imageBase64: undefined,
        imageUrl: undefined,
        region: undefined,
        errorResponse: NextResponse.json({ error: 'No image provided' }, { status: 400 }),
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const imageBase64 = Buffer.from(arrayBuffer).toString('base64');
    const region = formData.get('region')?.toString();
    return { imageBase64, imageUrl: undefined, region, errorResponse: null };
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return {
      imageBase64: undefined,
      imageUrl: undefined,
      region: undefined,
      errorResponse: NextResponse.json({ error: 'Invalid request body' }, { status: 400 }),
    };
  }

  const parsed = RequestSchema.safeParse(json);

  if (!parsed.success) {
    return {
      imageBase64: undefined,
      imageUrl: undefined,
      region: undefined,
      errorResponse: NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      ),
    };
  }

  const { imageBase64, imageUrl, region } = parsed.data;
  return { imageBase64, imageUrl, region, errorResponse: null };
}

function resolveAnalyzer(choice: string): Analyzer {
  switch (choice) {
    case 'supabase':
      return supabaseAnalyzer;
    case 'openai':
    case 'openai-vision':
      return openAIAnalyzer;
    case 'stub':
      return stubAnalyzer;
    default:
      console.warn(`[analyze-food] Unknown analyzer type: ${choice}, falling back to stub`);
      return stubAnalyzer;
  }
}

function mapToLegacyResponse(result: AnalyzeOutput) {
  const used =
    result.meta?.used && result.meta.used.length > 0 ? result.meta.used : (['stub'] satisfies AnalyzerSource[]);
  const topItem = result.items[0];
  const foodName = topItem?.label ?? 'Food Item';
  const confidence = clamp(topItem?.confidence ?? 0.6, 0, 1);

  const calories =
    typeof topItem?.calories === 'number'
      ? Math.round(topItem.calories)
      : estimateCalories(foodName);

  const weight =
    typeof topItem?.weightGrams === 'number'
      ? Math.round(topItem.weightGrams)
      : estimateWeight(foodName);

  return {
    foodType: foodName,
    confidence,
    calories,
    weight,
    emoji: getFoodEmoji(foodName),
    portionSizes: getPortionSizes(foodName),
    evidence: Array.from(new Set([...(topItem?.evidence ?? []), ...used])),
    meta: {
      used,
      latencyMs: result.meta?.latencyMs ?? null,
    },
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function estimateCalories(foodName: string): number {
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

function estimateWeight(foodName: string): number {
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

function getPortionSizes(foodName: string): string[] {
  const portionMap: Record<string, string[]> = {
    apple: ['Small (80 cal)', 'Medium (95 cal)', 'Large (116 cal)'],
    banana: ['Small (90 cal)', 'Medium (105 cal)', 'Large (121 cal)'],
    chicken: ['3oz (140 cal)', '4oz (185 cal)', '6oz (280 cal)'],
    rice: ['1/2 cup (100 cal)', '1 cup (200 cal)', '1.5 cups (300 cal)'],
    bread: ['1 slice (80 cal)', '2 slices (160 cal)'],
    default: ['Small portion', 'Medium portion', 'Large portion'],
  };

  const normalizedName = foodName.toLowerCase().trim();
  for (const [key, portions] of Object.entries(portionMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return portions;
    }
  }
  return portionMap.default;
}

function getFoodEmoji(foodName: string): string {
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
