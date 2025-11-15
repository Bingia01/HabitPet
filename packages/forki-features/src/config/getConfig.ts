/**
 * Configuration loader for Forki Features
 * Reads from shared environment variables (same for you and Janice)
 */

export interface ForkiConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
}

/**
 * Gets configuration from environment variables
 * Uses shared infrastructure (same Supabase, Vercel, OpenAI)
 */
export function getConfig(overrides?: Partial<ForkiConfig>): ForkiConfig {
  // Get API URL (Vercel endpoint)
  // In browser: use relative URL (same origin)
  // In Node.js: use env var or fallback
  let apiUrl = overrides?.apiUrl;
  
  if (!apiUrl) {
    if (typeof window !== 'undefined') {
      // Browser: use relative URL (works with same-origin Next.js API routes)
      apiUrl = '/api/analyze-food';
    } else {
      // Node.js: try env vars
      const vercelUrl = 
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_VERCEL_URL) ||
        (typeof process !== 'undefined' && process.env?.VERCEL_URL) ||
        'https://your-shared-vercel.vercel.app';
      apiUrl = `${vercelUrl}/api/analyze-food`;
    }
  }
  
  // Get Supabase config (shared)
  // In browser: NEXT_PUBLIC_* vars are available via process.env (Next.js makes them available)
  // In Node.js: Both NEXT_PUBLIC_* and regular vars work
  let supabaseUrl = overrides?.supabaseUrl;
  let supabaseKey = overrides?.supabaseKey;
  
  if (!supabaseUrl || !supabaseKey) {
    // Try to get from environment (works in both browser and Node.js in Next.js)
    if (typeof process !== 'undefined' && process.env) {
      supabaseUrl = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
      supabaseKey = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    }
    
    // Fallback: try window.__ENV__ or other Next.js runtime injection (if available)
    if ((!supabaseUrl || !supabaseKey) && typeof window !== 'undefined') {
      // Next.js injects NEXT_PUBLIC_ vars into the browser at build time
      // They should be available via process.env, but as a fallback check window
      const win = window as any;
      if (win.__NEXT_DATA__?.env) {
        supabaseUrl = supabaseUrl || win.__NEXT_DATA__.env.NEXT_PUBLIC_SUPABASE_URL || '';
        supabaseKey = supabaseKey || win.__NEXT_DATA__.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      }
    }
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[ForkiFeatures] ⚠️ Supabase credentials not found in environment variables');
    console.warn('  Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  return {
    apiUrl,
    supabaseUrl,
    supabaseKey,
  };
}

/**
 * Gets analyzer availability (for fallback chain)
 */
export function getAnalyzerAvailability() {
  const supabaseUrl = 
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    '';
  const supabaseKey = 
    (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    '';
  const openaiKey = 
    (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) ||
    '';
  
  return {
    stub: true, // Always available
    supabase: !!(supabaseUrl && supabaseKey),
    openai: !!openaiKey,
  };
}

/**
 * Gets fallback chain based on availability
 */
export function getFallbackChain(): Array<'supabase' | 'openai' | 'stub'> {
  const availability = getAnalyzerAvailability();
  const chain: Array<'supabase' | 'openai' | 'stub'> = [];
  
  // Try Supabase first if available
  if (availability.supabase) {
    chain.push('supabase');
  }
  
  // Then try OpenAI
  if (availability.openai) {
    chain.push('openai');
  }
  
  // Always fall back to stub
  chain.push('stub');
  
  return chain;
}

