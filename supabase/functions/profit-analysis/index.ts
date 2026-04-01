import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function callAIWithRetry(apiKey: string, prompt: string, maxRetries = 3): Promise<any> {
  let lastError: Error | null = null;
  let delay = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`AI API attempt ${attempt}/${maxRetries}`);
      
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (aiResponse.status === 429) {
        const errorText = await aiResponse.text();
        console.log(`Rate limited on attempt ${attempt}, waiting ${delay}ms...`, errorText);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw new Error("Rate limit exceeded after retries. Please try again in a few moments.");
      }

      if (aiResponse.status === 402) {
        throw new Error("API credits exhausted. Please add credits to continue.");
      }

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
      }

      return await aiResponse.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries && !lastError.message.includes('credits')) {
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  throw lastError || new Error("Failed after all retries");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { state, district, crop, productionQuintal } = await req.json();
    
    console.log('Received profit analysis request:', { state, district, crop, productionQuintal });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const userPrompt = `You are an expert agricultural economist with deep knowledge of Indian agricultural markets.

FARMER'S DATA:
- State: ${state}
- District: ${district}
- Crop: ${crop}
- Production: ${productionQuintal} quintals

Provide profit analysis in JSON format with these exact fields:
{
  "localMarketProfit": <number in rupees - estimated profit if sold locally>,
  "transportationCost": <number in rupees - cost to transport to nearby better market>,
  "nearbyMarketProfit": <number in rupees - net profit after selling in nearby market minus transport>,
  "recommendation": "<2-3 sentence actionable recommendation>",
  "breakdown": "<4-5 lines explaining the calculations with market prices, costs, and key factors>"
}

Use realistic Indian market prices for ${crop} in ${state}. Consider:
- Current mandi rates (2-3% commission)
- Transport costs (₹50-80/quintal/100km)
- Post-harvest losses (5-10%)
- Typical production cost (30-40% of sale value)`;

    const aiData = await callAIWithRetry(LOVABLE_API_KEY, userPrompt);
    console.log('AI Response received successfully');
    
    const content = aiData.choices[0].message.content;
    let analysis;
    
    try {
      // Clean the content - remove markdown code blocks if present
      let cleanContent = content;
      if (content.includes('```json')) {
        cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (content.includes('```')) {
        cleanContent = content.replace(/```\n?/g, '');
      }
      
      const parsed = JSON.parse(cleanContent.trim());
      analysis = {
        localMarketProfit: Number(parsed.localMarketProfit) || 0,
        transportationCost: Number(parsed.transportationCost) || 0,
        nearbyMarketProfit: Number(parsed.nearbyMarketProfit) || 0,
        recommendation: parsed.recommendation || "Analysis completed successfully.",
        breakdown: parsed.breakdown || "Detailed breakdown not available."
      };
      
      console.log('Parsed analysis:', analysis);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      // Provide fallback analysis
      const estimatedPrice = 2500; // Average price per quintal
      const localProfit = productionQuintal * estimatedPrice * 0.6;
      analysis = {
        localMarketProfit: Math.round(localProfit),
        transportationCost: Math.round(productionQuintal * 60),
        nearbyMarketProfit: Math.round(localProfit * 1.15 - productionQuintal * 60),
        recommendation: `Based on average market data for ${crop} in ${state}, consider checking local mandi prices before deciding.`,
        breakdown: `Estimated analysis based on average prices. Local price ~₹${estimatedPrice}/quintal. Please verify with your local agricultural market for accurate rates.`
      };
    }

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in profit-analysis function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isRateLimit = errorMessage.includes('Rate limit') || errorMessage.includes('429');
    
    return new Response(
      JSON.stringify({ 
        error: isRateLimit 
          ? "Service is busy. Please wait a moment and try again." 
          : errorMessage,
        analysis: null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: isRateLimit ? 429 : 500 
      }
    );
  }
});
