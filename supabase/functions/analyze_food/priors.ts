import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface Priors {
  kcalPerG: { mu: number; sigma: number };
  density: { mu: number; sigma: number };
  macros?: {
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    fiberPer100g?: number;
  };
}

export async function getPriorsForLabel(label: string): Promise<Priors | null> {
  const { data } = await supabase
    .from("food_priors")
    .select("kcal_per_g_mu, kcal_per_g_sigma, density_mu, density_sigma, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g")
    .ilike("label", label)
    .maybeSingle();

  if (!data) return null;

  const result: Priors = {
    kcalPerG: { mu: data.kcal_per_g_mu, sigma: data.kcal_per_g_sigma },
    density: { mu: data.density_mu, sigma: data.density_sigma },
  };

  // Include macros if available
  if (data.protein_per_100g !== null && data.carbs_per_100g !== null && data.fat_per_100g !== null) {
    result.macros = {
      proteinPer100g: data.protein_per_100g,
      carbsPer100g: data.carbs_per_100g,
      fatPer100g: data.fat_per_100g,
      fiberPer100g: data.fiber_per_100g ?? undefined,
    };
  }

  return result;
}
