import { serve } from "https://deno.land/std/http/server.ts";
import { getPriorsForLabel } from "./priors.ts";

interface AnalyzerRequest {
  imageUrl?: string;
  imageBase64?: string;
  region?: string;
}

interface ClassifierComponent {
  label: string;
  confidence?: number;
  weightGrams?: number;
  volumeML?: number;
}

interface ClassifierResponse {
  label: string;
  confidence?: number;
  parentLabel?: string;
  densityGML: number;
  kcalPerG: number;
  source?: string;
  components?: ClassifierComponent[];
  macros?: {
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  totalCalories?: number;
  estimatedWeightG?: number;
}

interface AnalyzerItem {
  label: string;
  confidence: number;
  calories: number;
  sigmaCalories: number;
  weightGrams: number;
  volumeML: number;
  priors?: {
    kcalPerG: { mu: number; sigma: number };
    density: { mu: number; sigma: number };
  };
  evidence: string[];
  path?: "label" | "menu" | "geometry";
  nutritionLabel?: {
    servingSize: string;
    caloriesPerServing: number;
    totalServings?: number;
  };
  menuItem?: {
    restaurant: string;
    itemName: string;
    calories: number;
  };
  macros?: {
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG?: number;
  };
}

interface AnalyzerResponse {
  items: AnalyzerItem[];
  meta?: { used: Array<"supabase" | "openai" | "classifier">; latencyMs?: number };
}

interface ImageTypeResponse {
  imageType: "packaged" | "restaurant" | "prepared";
  confidence: number;
  reasoning?: string;
  restaurantName?: string;
  brandName?: string;
}

const CLASSIFIER_ENDPOINT = Deno.env.get("CLASSIFIER_ENDPOINT") ??
  "https://api.openai.com/v1/responses";
const CLASSIFIER_API_KEY = Deno.env.get("CLASSIFIER_API_KEY");
const CLASSIFIER_MODEL = Deno.env.get("CLASSIFIER_MODEL") ?? "gpt-4o-mini";

const DEFAULT_PORTION_GRAMS = Number(Deno.env.get("DEFAULT_PORTION_GRAMS") ?? "180");
const DEFAULT_WEIGHT_RELATIVE_SIGMA = Number(
  Deno.env.get("DEFAULT_WEIGHT_RELATIVE_SIGMA") ?? "0.35",
);

serve(async (req) => {
  const start = performance.now();

  try {
    const { imageUrl, imageBase64 }: AnalyzerRequest = await req.json();

    if (!imageUrl && !imageBase64) {
      return jsonResponse(
        { error: "Provide imageUrl or imageBase64" },
        400,
      );
    }

    // Step 1: Detect image type
    const imageTypeDetection = await detectImageType({ imageUrl, imageBase64 });
    const evidence = new Set<string>(["Analyzer"]);
    evidence.add("OpenAI");

    let response: AnalyzerResponse;

    // Step 2: Route to appropriate path based on image type
    if (imageTypeDetection.imageType === "packaged") {
      // Label Path: OCR nutrition label
      evidence.add("Label");
      const nutritionData = await extractNutritionLabel({ imageUrl, imageBase64 });
      const label = nutritionData.label || "packaged food";
      const calories = nutritionData.calories;
      
      // Calculate macros for packaged food (estimate weight from calories)
      const estimatedWeight = calories > 0 ? calories / 2.5 : 0; // Rough estimate: ~2.5 kcal/g average
      const macros = await calculateMacros(label, estimatedWeight, calories);

      response = {
        items: [
          {
            label,
            confidence: nutritionData.confidence,
            calories,
            sigmaCalories: calories * 0.05, // 5% uncertainty for label reading
            weightGrams: estimatedWeight,
            volumeML: 0,
            evidence: Array.from(evidence),
            path: "label",
            nutritionLabel: {
              servingSize: nutritionData.servingSize,
              caloriesPerServing: nutritionData.caloriesPerServing,
              totalServings: nutritionData.totalServings,
            },
            macros,
          },
        ],
        meta: {
          used: ["supabase", "openai"],
          latencyMs: performance.now() - start,
        },
      };
    } else if (imageTypeDetection.imageType === "restaurant" && imageTypeDetection.restaurantName) {
      // Menu Path: Restaurant database lookup
      evidence.add("Menu");
      const menuData = await lookupRestaurantMenu({
        restaurant: imageTypeDetection.restaurantName,
        imageUrl,
        imageBase64,
      });
      const label = menuData.itemName;
      const calories = menuData.calories;
      
      // Calculate macros for restaurant food (estimate weight from calories)
      const estimatedWeight = calories > 0 ? calories / 2.5 : 0; // Rough estimate: ~2.5 kcal/g average
      const macros = await calculateMacros(label, estimatedWeight, calories);

      response = {
        items: [
          {
            label,
            confidence: menuData.confidence,
            calories,
            sigmaCalories: calories * 0.10, // 10% uncertainty for menu items
            weightGrams: estimatedWeight,
            volumeML: 0,
            evidence: Array.from(evidence),
            path: "menu",
            menuItem: {
              restaurant: menuData.restaurant,
              itemName: menuData.itemName,
              calories: menuData.calories,
            },
            macros,
          },
        ],
        meta: {
          used: ["supabase", "openai"],
          latencyMs: performance.now() - start,
        },
      };
    } else {
      // Geometry Path: Camera volume × VLM priors
      evidence.add("Geometry");
      const classifier = await callClassifier({ imageUrl, imageBase64 });
      const label = classifier.label.trim().toLowerCase();

      if (classifier.source === "openai") {
        evidence.add("OpenAI");
      }

      // Return VLM-provided priors for Swift to use in C = V × ρ × e calculation
      const densityGML = classifier.densityGML;
      const kcalPerG = classifier.kcalPerG;

      // Estimate uncertainty in VLM priors
      const densitySigma = densityGML * 0.15;
      const kcalPerGSigma = kcalPerG * 0.20;

      const finalPriors = {
        density: { mu: densityGML, sigma: densitySigma },
        kcalPerG: { mu: kcalPerG, sigma: kcalPerGSigma },
      };

      // For web app, calculate calories and macros
      const estimatedWeight = classifier.estimatedWeightG ?? 180; // DEFAULT_PORTION_GRAMS
      
      // Calculate macros if available from classifier or calculate from estimated values
      let macros = classifier.macros;
      if (!macros) {
        const estimatedCalories = classifier.totalCalories 
          ? Math.round(classifier.totalCalories)
          : Math.round(estimatedWeight * kcalPerG);
        macros = await calculateMacros(label, estimatedWeight, estimatedCalories);
      }
      
      // Calculate calories from macros if available (more accurate than classifier's total_calories)
      // Atwater factors: Protein 4 kcal/g, Carbs 4 kcal/g, Fat 9 kcal/g
      const totalCalories = macros
        ? Math.round(macros.proteinG * 4 + macros.carbsG * 4 + macros.fatG * 9)
        : (classifier.totalCalories 
            ? Math.round(classifier.totalCalories)
            : Math.round(estimatedWeight * kcalPerG));

      response = {
        items: [
          {
            label,
            confidence: classifier.confidence ?? 0,
            calories: totalCalories, // Calculated from macros (if available) or classifier's total_calories or weight × kcal_per_g
            sigmaCalories: totalCalories * 0.15, // 15% uncertainty for VLM estimates
            weightGrams: estimatedWeight,
            volumeML: 0,
            priors: finalPriors,
            evidence: Array.from(evidence),
            path: "geometry",
            macros,
          },
        ],
        meta: {
          used: gatherMetaSources(classifier),
          latencyMs: performance.now() - start,
        },
      };
    }

    return jsonResponse(response, 200);
  } catch (error) {
    console.error("Analyzer error", error);
    return jsonResponse({ error: "Analyzer error", details: `${error}` }, 500);
  }
});

function gatherMetaSources(classifier: ClassifierResponse): Array<"supabase" | "openai" | "classifier"> {
  const sources: Array<"supabase" | "openai" | "classifier"> = ["supabase"];
  sources.push(classifier.source === "openai" ? "openai" : "classifier");
  return sources;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function callClassifier(
  payload: { imageUrl?: string; imageBase64?: string },
): Promise<ClassifierResponse> {
  if (!CLASSIFIER_API_KEY) {
    throw new Error("CLASSIFIER_API_KEY env var is not configured");
  }

  const prompt =
    "You are a food identification assistant. Identify ONLY what you can see in this image. Be literal and accurate - do NOT add context that isn't visible.\n\n" +
    "CRITICAL RULES:\n" +
    "1. Identify ONLY the food item(s) visible - don't assume preparation method or dish type unless clearly visible\n" +
    "2. If you see chicken in a box/container, identify it as 'chicken' NOT 'chicken sandwich' or 'chicken meal'\n" +
    "3. If you see rice in a bowl, identify it as 'rice' NOT 'rice bowl' unless you can see other ingredients mixed in\n" +
    "4. Be specific about cooking method ONLY if clearly visible (grilled, fried, steamed, etc.)\n" +
    "5. For packaged foods, identify the base food item, not the brand name\n" +
    "6. Don't assume it's a 'sandwich' unless you can clearly see bread/bun around the food\n" +
    "7. Don't assume it's a 'salad' unless you can clearly see mixed vegetables/greens\n\n" +
    "Respond with a single JSON object using snake_case keys: label (string, accurate food name based ONLY on what's visible, e.g., 'chicken', 'rice', 'grilled chicken breast'), confidence (0-1, identification confidence), parent_label (string, general category like 'protein', 'grain', 'vegetable'), density_g_ml (number, typical density in g/mL for this food, range 0.3-1.2), kcal_per_g (number, kilocalories per gram for this specific food), estimated_volume_ml (number, your best estimate of the food volume in milliliters based on visual cues, portion size, and common serving sizes), estimated_weight_g (number, estimated weight in grams), total_calories (number, estimated total calories for this portion), protein_g (number, grams of protein for this portion), carbs_g (number, grams of carbohydrates for this portion), fat_g (number, grams of fat for this portion). Use your knowledge of food composition, typical portion sizes, and visual analysis. For macros, use standard nutritional values: Protein 4 kcal/g, Carbs 4 kcal/g, Fat 9 kcal/g. Ensure calories ≈ (protein_g × 4) + (carbs_g × 4) + (fat_g × 9) ± 10%. Do not output any additional text.";

  const content: Array<Record<string, unknown>> = [
    {
      type: "input_text",
      text: prompt,
    },
  ];

  if (payload.imageUrl) {
    content.push({
      type: "input_image",
      image_url: payload.imageUrl,
    });
  } else if (payload.imageBase64) {
    const clean = stripBase64Prefix(payload.imageBase64);
    content.push({
      type: "input_image",
      image_url: `data:image/jpeg;base64,${clean}`,
    });
  } else {
    throw new Error("Classifier payload missing image data");
  }

  const body = {
    model: CLASSIFIER_MODEL,
    input: [
      {
        role: "user",
        content,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "calorie_camera_classifier",
        schema: {
          type: "object",
          properties: {
            label: { type: "string" },
            confidence: { type: "number" },
            parent_label: { type: "string" },
            density_g_ml: { type: "number" },
            kcal_per_g: { type: "number" },
            estimated_weight_g: { type: "number" },
            total_calories: { type: "number" },
            protein_g: { type: "number" },
            carbs_g: { type: "number" },
            fat_g: { type: "number" },
          },
          required: ["label", "confidence", "parent_label", "density_g_ml", "kcal_per_g", "protein_g", "carbs_g", "fat_g"],
          additionalProperties: false,
        },
      },
    },
  };

  const response = await fetch(CLASSIFIER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CLASSIFIER_API_KEY}`,
      "OpenAI-Beta": "response-format=v1",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Classifier request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const outputText: string | undefined =
    typeof data?.output_text === "string"
      ? data.output_text
      : data?.output?.[0]?.content?.[0]?.text;

  if (!outputText) {
    throw new Error("Classifier response missing output text");
  }

  const parsed = parseClassifierJson(outputText);

  return {
    label: sanitizeLabel(parsed.label),
    confidence: clampConfidence(parsed.confidence),
    parentLabel: parsed.parent_label ? sanitizeLabel(parsed.parent_label) : deriveParentLabel(parsed.label),
    densityGML: parsed.density_g_ml,
    kcalPerG: parsed.kcal_per_g,
    source: "openai",
    totalCalories: parsed.total_calories ? Math.round(parsed.total_calories) : undefined,
    estimatedWeightG: parsed.estimated_weight_g ? Math.round(parsed.estimated_weight_g) : undefined,
    macros: parsed.protein_g !== undefined && parsed.carbs_g !== undefined && parsed.fat_g !== undefined
      ? {
          proteinG: Math.round(parsed.protein_g * 10) / 10,
          carbsG: Math.round(parsed.carbs_g * 10) / 10,
          fatG: Math.round(parsed.fat_g * 10) / 10,
        }
      : undefined,
  };
}

function sanitizeLabel(raw: string): string {
  const cleaned = raw.replace(/\.[a-zA-Z0-9]+$/, "").replace(/[_-]+/g, " ").trim();
  return cleaned.length > 0 ? cleaned.toLowerCase() : "unknown_food";
}

function deriveParentLabel(label: string): string | undefined {
  if (label.includes("apple")) return "fruit";
  if (label.includes("salad")) return "salad";
  if (label.includes("chicken")) return "chicken";
  if (label.includes("rice")) return "rice";
  return undefined;
}

function stripBase64Prefix(data: string): string {
  const idx = data.indexOf(",");
  return idx >= 0 ? data.slice(idx + 1) : data;
}

function parseClassifierJson(output: string): {
  label: string;
  confidence?: number;
  parent_label?: string;
  density_g_ml: number;
  kcal_per_g: number;
  estimated_weight_g?: number;
  total_calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
} {
  output = output.trim();
  const first = output.indexOf("{");
  const last = output.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error(`Classifier output was not JSON: ${output}`);
  }
  return JSON.parse(output.slice(first, last + 1));
}

function clampConfidence(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0.5;
  }
  return Math.min(1, Math.max(0, value));
}

// Calculate macros using 4-tier fallback: Food Priors → Standard Ratios → Undefined
async function calculateMacros(
  label: string,
  weightGrams: number,
  calories: number
): Promise<{ proteinG: number; carbsG: number; fatG: number; fiberG?: number } | undefined> {
  // Tier 1: Try food_priors database
  const priors = await getPriorsForLabel(label);
  if (priors?.macros && weightGrams > 0) {
    const weightRatio = weightGrams / 100; // Convert per-100g to actual weight
    return {
      proteinG: Math.round(priors.macros.proteinPer100g * weightRatio * 10) / 10,
      carbsG: Math.round(priors.macros.carbsPer100g * weightRatio * 10) / 10,
      fatG: Math.round(priors.macros.fatPer100g * weightRatio * 10) / 10,
      fiberG: priors.macros.fiberPer100g ? Math.round(priors.macros.fiberPer100g * weightRatio * 10) / 10 : undefined,
    };
  }

  // Tier 2: Calculate from calories using standard ratios (if weight is known)
  if (weightGrams > 0 && calories > 0) {
    // Use typical macro ratios based on food category
    const normalizedLabel = label.toLowerCase();
    let proteinRatio = 0.15; // Default 15% protein
    let carbsRatio = 0.55; // Default 55% carbs
    let fatRatio = 0.30; // Default 30% fat

    // Adjust ratios based on food type
    if (normalizedLabel.includes("chicken") || normalizedLabel.includes("beef") || normalizedLabel.includes("fish") || normalizedLabel.includes("meat")) {
      proteinRatio = 0.30;
      carbsRatio = 0.0;
      fatRatio = 0.20;
    } else if (normalizedLabel.includes("rice") || normalizedLabel.includes("pasta") || normalizedLabel.includes("bread")) {
      proteinRatio = 0.10;
      carbsRatio = 0.75;
      fatRatio = 0.15;
    } else if (normalizedLabel.includes("salad") || normalizedLabel.includes("vegetable") || normalizedLabel.includes("broccoli")) {
      proteinRatio = 0.20;
      carbsRatio = 0.60;
      fatRatio = 0.20;
    }

    // Calculate macros: calories × ratio / kcal per gram
    const proteinG = Math.round((calories * proteinRatio / 4) * 10) / 10;
    const carbsG = Math.round((calories * carbsRatio / 4) * 10) / 10;
    const fatG = Math.round((calories * fatRatio / 9) * 10) / 10;

    return { proteinG, carbsG, fatG };
  }

  // Tier 3: Return undefined if no data available
  return undefined;
}

// Detect image type (packaged/restaurant/prepared)
async function detectImageType(
  payload: { imageUrl?: string; imageBase64?: string }
): Promise<ImageTypeResponse> {
  if (!CLASSIFIER_API_KEY) {
    throw new Error("CLASSIFIER_API_KEY not configured");
  }

  const prompt =
    "You are a food classification assistant. Analyze this image and determine what type of food scenario it shows. Respond with a JSON object: imageType ('packaged' for food in a package with nutrition labels visible, 'restaurant' for restaurant/chain food items like Chipotle bowls, 'prepared' for home-cooked or plated food without packaging), confidence (0-1), reasoning (brief explanation), restaurantName (if restaurant type, name like 'Chipotle', 'Cava', etc.), brandName (if packaged type, brand name if visible). Use snake_case keys.";

  const content: Array<Record<string, unknown>> = [
    { type: "input_text", text: prompt },
  ];

  if (payload.imageUrl) {
    content.push({ type: "input_image", image_url: payload.imageUrl });
  } else if (payload.imageBase64) {
    const clean = stripBase64Prefix(payload.imageBase64);
    content.push({
      type: "input_image",
      image_url: `data:image/jpeg;base64,${clean}`,
    });
  }

  const body = {
    model: CLASSIFIER_MODEL,
    input: [{ role: "user", content }],
    text: {
      format: {
        type: "json_schema",
        name: "image_type_detector",
        schema: {
          type: "object",
          properties: {
            image_type: {
              type: "string",
              enum: ["packaged", "restaurant", "prepared"],
            },
            confidence: { type: "number" },
            reasoning: { type: "string" },
            restaurant_name: { type: "string" },
            brand_name: { type: "string" },
          },
          required: ["image_type", "confidence", "reasoning", "restaurant_name", "brand_name"],
          additionalProperties: false,
        },
      },
    },
  };

  const response = await fetch(CLASSIFIER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CLASSIFIER_API_KEY}`,
      "OpenAI-Beta": "response-format=v1",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Image type detection failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const outputText: string | undefined =
    typeof data?.output_text === "string"
      ? data.output_text
      : data?.output?.[0]?.content?.[0]?.text;

  if (!outputText) {
    throw new Error("Image type detection response missing output");
  }

  const parsed = JSON.parse(outputText);
  return {
    imageType: parsed.image_type,
    confidence: parsed.confidence,
    reasoning: parsed.reasoning,
    restaurantName: parsed.restaurant_name,
    brandName: parsed.brand_name,
  };
}

// Extract nutrition label from packaged food
async function extractNutritionLabel(
  payload: { imageUrl?: string; imageBase64?: string }
): Promise<{
  label: string;
  confidence: number;
  calories: number;
  servingSize: string;
  caloriesPerServing: number;
  totalServings?: number;
}> {
  if (!CLASSIFIER_API_KEY) {
    throw new Error("CLASSIFIER_API_KEY not configured");
  }

  const prompt =
    "You are a nutrition label OCR assistant. Read the nutrition facts label in this image and extract key information. Respond with JSON: label (product name if visible), confidence (0-1), calories (total calories if visible, otherwise calories per serving), serving_size (e.g., '28g', '1 cup'), calories_per_serving (number), total_servings (number of servings if visible). If you can see the package size and serving size, calculate total calories. Use snake_case keys.";

  const content: Array<Record<string, unknown>> = [
    { type: "input_text", text: prompt },
  ];

  if (payload.imageUrl) {
    content.push({ type: "input_image", image_url: payload.imageUrl });
  } else if (payload.imageBase64) {
    const clean = stripBase64Prefix(payload.imageBase64);
    content.push({
      type: "input_image",
      image_url: `data:image/jpeg;base64,${clean}`,
    });
  }

  const body = {
    model: CLASSIFIER_MODEL,
    input: [{ role: "user", content }],
    text: {
      format: {
        type: "json_schema",
        name: "nutrition_label_extractor",
        schema: {
          type: "object",
          properties: {
            label: { type: "string" },
            confidence: { type: "number" },
            calories: { type: "number" },
            serving_size: { type: "string" },
            calories_per_serving: { type: "number" },
            total_servings: { type: "number" },
          },
          required: [
            "label",
            "confidence",
            "calories",
            "serving_size",
            "calories_per_serving",
            "total_servings",
          ],
          additionalProperties: false,
        },
      },
    },
  };

  const response = await fetch(CLASSIFIER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CLASSIFIER_API_KEY}`,
      "OpenAI-Beta": "response-format=v1",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Nutrition label extraction failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const outputText: string | undefined =
    typeof data?.output_text === "string"
      ? data.output_text
      : data?.output?.[0]?.content?.[0]?.text;

  if (!outputText) {
    throw new Error("Nutrition label response missing output");
  }

  const parsed = JSON.parse(outputText);
  return {
    label: parsed.label,
    confidence: parsed.confidence,
    calories: parsed.calories,
    servingSize: parsed.serving_size,
    caloriesPerServing: parsed.calories_per_serving,
    totalServings: parsed.total_servings,
  };
}

// Lookup restaurant menu item
async function lookupRestaurantMenu(
  payload: { restaurant: string; imageUrl?: string; imageBase64?: string }
): Promise<{
  restaurant: string;
  itemName: string;
  calories: number;
  confidence: number;
}> {
  if (!CLASSIFIER_API_KEY) {
    throw new Error("CLASSIFIER_API_KEY not configured");
  }

  const prompt =
    `You are a restaurant menu expert with knowledge of ${payload.restaurant}'s menu items and their nutritional information. Identify the specific menu item in this image and provide its calorie count based on standard ${payload.restaurant} nutrition data. Respond with JSON: restaurant (name), item_name (specific menu item like 'Chicken Burrito Bowl with Brown Rice'), calories (total calories for standard portion), confidence (0-1, how certain you are about the item and calories). Use your knowledge of ${payload.restaurant}'s published nutrition information. Use snake_case keys.`;

  const content: Array<Record<string, unknown>> = [
    { type: "input_text", text: prompt },
  ];

  if (payload.imageUrl) {
    content.push({ type: "input_image", image_url: payload.imageUrl });
  } else if (payload.imageBase64) {
    const clean = stripBase64Prefix(payload.imageBase64);
    content.push({
      type: "input_image",
      image_url: `data:image/jpeg;base64,${clean}`,
    });
  }

  const body = {
    model: CLASSIFIER_MODEL,
    input: [{ role: "user", content }],
    text: {
      format: {
        type: "json_schema",
        name: "restaurant_menu_lookup",
        schema: {
          type: "object",
          properties: {
            restaurant: { type: "string" },
            item_name: { type: "string" },
            calories: { type: "number" },
            confidence: { type: "number" },
          },
          required: ["restaurant", "item_name", "calories", "confidence"],
          additionalProperties: false,
        },
      },
    },
  };

  const response = await fetch(CLASSIFIER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CLASSIFIER_API_KEY}`,
      "OpenAI-Beta": "response-format=v1",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Restaurant menu lookup failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const outputText: string | undefined =
    typeof data?.output_text === "string"
      ? data.output_text
      : data?.output?.[0]?.content?.[0]?.text;

  if (!outputText) {
    throw new Error("Restaurant menu response missing output");
  }

  const parsed = JSON.parse(outputText);
  return {
    restaurant: parsed.restaurant,
    itemName: parsed.item_name,
    calories: parsed.calories,
    confidence: parsed.confidence,
  };
}
