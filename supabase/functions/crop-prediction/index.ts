import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CropRecommendation {
  crop: string;
  confidence: number;
  predictedYield: number;
  predictedPrice: number;
  plantingTime: string;
  harvestTime: string;
  fertilizers: string;
  irrigationSchedule: string;
  pestControl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { N, P, K, temperature, humidity, ph, rainfall, district } = await req.json();
    
  console.log('Received prediction request:', { N, P, K, temperature, humidity, ph, rainfall, district });
  
  // Load and parse district-specific data
  let districtData = '';
  try {
    const csvResponse = await fetch('https://zpqmikipynjwyfnjmtpe.supabase.co/storage/v1/object/public/data/India_District_Crop_Production.csv');
    if (!csvResponse.ok) {
      // Fallback: try relative path
      const localResponse = await fetch(new URL('../../public/data/India_District_Crop_Production.csv', import.meta.url));
      const csvText = await localResponse.text();
      const lines = csvText.split('\n');
      const relevantLines = lines.filter(line => line.includes(`"${district}"`));
      districtData = relevantLines.slice(0, 10).join('\n');
    } else {
      const csvText = await csvResponse.text();
      const lines = csvText.split('\n');
      const relevantLines = lines.filter(line => line.includes(`"${district}"`));
      districtData = relevantLines.slice(0, 10).join('\n');
    }
  } catch (err) {
    console.error('Failed to load district data:', err);
    districtData = 'No district-specific data available';
  }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Create a detailed prompt for the AI to analyze crop recommendations
    const userPrompt = `You are an expert agricultural data scientist with access to real-time agricultural data and deep learning models. Based on comprehensive soil analysis, environmental parameters, historical district data, and current market conditions, recommend the top 3 crops to grow with highly accurate yield predictions, sale prices, and complete cultivation guidance.

CURRENT CONDITIONS (Real-time Analysis):
- Nitrogen (N): ${N} kg/ha
- Phosphorus (P): ${P} kg/ha
- Potassium (K): ${K} kg/ha
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- pH: ${ph}
- Rainfall: ${rainfall}mm
- District: ${district}

Historical District Production Data (Last 5 Years):
${districtData}

ADVANCED CROP SUITABILITY MATRIX:
- Rice: Optimal N (80-120), P (40-60), K (40-60), Temp (20-27°C), Humidity (80-90%), pH (6-7.5), Rainfall (200-300mm). Current market price: ₹1800-2200/quintal
- Wheat: Optimal N (70-100), P (50-70), K (40-60), Temp (15-25°C), Humidity (60-75%), pH (6-7.5), Rainfall (50-150mm). Current market price: ₹2000-2400/quintal
- Maize: Optimal N (60-90), P (40-60), K (40-60), Temp (18-27°C), Humidity (60-75%), pH (6-8), Rainfall (150-250mm). Current market price: ₹1800-2200/quintal
- Cotton: Optimal N (50-80), P (60-80), K (60-80), Temp (21-30°C), Humidity (60-80%), pH (6.5-8), Rainfall (100-200mm). Current market price: ₹5500-6500/quintal
- Sugarcane: Optimal N (80-140), P (70-90), K (70-90), Temp (21-27°C), Humidity (75-85%), pH (6-7.5), Rainfall (200-400mm). Current market price: ₹3000-3500/quintal
- Pulses (Chickpea): Optimal N (20-40), P (40-60), K (30-50), Temp (20-28°C), Humidity (50-70%), pH (6-7.5), Rainfall (60-100mm). Current market price: ₹4500-5500/quintal
- Soybean: Optimal N (30-50), P (60-80), K (40-60), Temp (20-30°C), Humidity (60-80%), pH (6-7), Rainfall (150-250mm). Current market price: ₹3800-4500/quintal
- Groundnut: Optimal N (20-40), P (50-70), K (50-70), Temp (25-30°C), Humidity (60-75%), pH (6-7), Rainfall (100-150mm). Current market price: ₹5000-6000/quintal

ANALYSIS REQUIREMENTS (MANDATORY - ALL FIELDS REQUIRED):
1. Calculate precise confidence scores (75-95%) based on how closely the given conditions match optimal ranges
2. Use district historical yield data to predict realistic yields in tons/ha (account for ±10-15% variance) - MUST BE A NUMBER, NOT NULL
3. Factor in current market prices and seasonal demand for price predictions in ₹/quintal - MUST BE A NUMBER, NOT NULL
4. Calculate yield trends by comparing predicted yields with district historical averages - MUST BE A NUMBER
5. Consider crop rotation benefits and soil health impacts
6. District average yield MUST BE A NUMBER based on historical data

CRITICAL: predictedYield and predictedPrice MUST ALWAYS be valid numbers, never null or missing. Use the crop suitability matrix ranges as reference.

CULTIVATION GUIDANCE REQUIREMENTS (CRITICAL):
For each crop, provide detailed, actionable cultivation guidance:

1. **Planting Time**: Specific months and optimal conditions (e.g., "June-July, after first monsoon rains when soil moisture is 60-70%")

2. **Harvest Time**: Specific timeline and maturity indicators (e.g., "October-November, 120-130 days after sowing when grains are hard")

3. **Fertilizers**: Based on current soil NPK levels (${N}-${P}-${K}), provide:
   - Basal dose at planting
   - Top dressing schedule
   - Organic amendments if needed
   - Specific NPK ratios
   Example: "Basal: 60 kg DAP + 40 kg MOP. Top dress: 30 kg Urea at 20 days, 30 kg at 40 days. Add 5 tons FYM/ha for soil health"

4. **Irrigation Schedule**: Based on rainfall (${rainfall}mm) and soil conditions:
   - Frequency and timing
   - Critical growth stages requiring water
   - Water-saving techniques
   Example: "Irrigate every 7-10 days (50mm depth). Critical stages: tillering, flowering, grain filling. Use drip irrigation to save 40% water"

5. **Pest & Disease Control**: Based on district climate (${temperature}°C, ${humidity}% humidity) and common issues:
   - Preventive measures
   - Common pests/diseases in this region
   - Organic and chemical solutions
   - Monitoring schedule
   Example: "Monitor for stem borer weekly. Spray Neem oil (5ml/L) preventively. If infestation >5%, use Chlorpyrifos. Remove infected plants immediately"

Provide exactly 3 crop recommendations ranked by overall suitability (confidence × predicted profit). 

RESPONSE FORMAT - ALL FIELDS MANDATORY:
For each of the 3 crops, you MUST provide ALL of the following fields (no null values allowed):
{
  "crop": "string - name from matrix above",
  "confidence": number (75-95),
  "predictedYield": number (tons/ha, based on district data + conditions),
  "predictedPrice": number (₹/quintal, from market price ranges above),
  "yieldTrend": number (-15 to +15, percentage vs district average),
  "districtAvgYield": number (tons/ha from historical data),
  "plantingTime": "string - detailed timing and conditions",
  "harvestTime": "string - detailed timeline and maturity indicators",
  "fertilizers": "string - specific NPK doses based on ${N}-${P}-${K}",
  "irrigationSchedule": "string - frequency based on ${rainfall}mm rainfall",
  "pestControl": "string - specific to ${district} climate"
}

EXAMPLE (follow this structure exactly):
{
  "recommendations": [
    {
      "crop": "Rice",
      "confidence": 88,
      "predictedYield": 4.5,
      "predictedPrice": 2000,
      "yieldTrend": 8,
      "districtAvgYield": 4.2,
      "plantingTime": "June-July, after monsoon onset...",
      "harvestTime": "October-November, 120-150 days...",
      "fertilizers": "Basal: 45kg DAP + 40kg MOP...",
      "irrigationSchedule": "Maintain 2-5cm standing water...",
      "pestControl": "Monitor for stem borer, use pheromone traps..."
    }
  ]
}

CRITICAL VALIDATION:
- predictedYield MUST be a realistic number between 2-15 tons/ha
- predictedPrice MUST be within the market ranges specified above
- NO null values allowed for any numeric fields
- Base ALL numbers on the agricultural data and conditions provided

Format response as JSON with "recommendations" array. Remember: ALL NUMERIC FIELDS MUST HAVE VALUES, NOT NULL.`;


    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', aiData);
    
    const content = aiData.choices[0].message.content;
    let recommendations: CropRecommendation[];
    
    try {
      const parsed = JSON.parse(content);
      const rawRecs = parsed.recommendations || parsed;
      
      console.log('Raw AI recommendations:', JSON.stringify(rawRecs, null, 2));
      
      // Convert and validate - ensure no null values for critical fields
      recommendations = rawRecs.map((rec: any) => {
        const predictedYield = Number(rec.predictedYield);
        const predictedPrice = Number(rec.predictedPrice);
        
        // Validate critical fields
        if (!predictedYield || isNaN(predictedYield) || predictedYield <= 0) {
          console.error(`Invalid predictedYield for ${rec.crop}:`, rec.predictedYield);
          throw new Error(`Missing or invalid predictedYield for ${rec.crop}`);
        }
        
        if (!predictedPrice || isNaN(predictedPrice) || predictedPrice <= 0) {
          console.error(`Invalid predictedPrice for ${rec.crop}:`, rec.predictedPrice);
          throw new Error(`Missing or invalid predictedPrice for ${rec.crop}`);
        }
        
        return {
          crop: rec.crop,
          confidence: Number(rec.confidence) || 75,
          predictedYield: predictedYield,
          predictedPrice: predictedPrice,
          yieldTrend: Number(rec.yieldTrend) || 0,
          districtAvgYield: Number(rec.districtAvgYield) || predictedYield * 0.9,
          plantingTime: rec.plantingTime || "Consult local agricultural officer",
          harvestTime: rec.harvestTime || "Based on crop maturity",
          fertilizers: rec.fertilizers || "Based on soil test",
          irrigationSchedule: rec.irrigationSchedule || "Based on soil moisture",
          pestControl: rec.pestControl || "Monitor regularly and treat as needed"
        };
      });
      
      console.log('Validated recommendations:', recommendations);
    } catch (e) {
      console.error('Failed to parse AI response:', content, 'Error:', e);
      throw new Error(`Failed to parse AI recommendations: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in crop-prediction function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
