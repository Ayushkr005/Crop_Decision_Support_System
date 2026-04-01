import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { crop, state, district } = await req.json();
    
    console.log('Crop calendar request:', { crop, state, district });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `You are an expert agricultural scientist specializing in Indian farming. Create a detailed 12-month crop calendar for growing ${crop} in ${district}, ${state}, India.

Provide a comprehensive month-by-month guide with all farming activities. Return a JSON object with this structure:

{
  "crop": "${crop}",
  "location": "${district}, ${state}",
  "growing_season": "Kharif/Rabi/Zaid",
  "total_duration_days": 120,
  "months": [
    {
      "month": "January",
      "month_number": 1,
      "phase": "Land Preparation/Sowing/Growing/Harvesting/Off-season",
      "is_active": true,
      "activities": [
        {
          "week": 1,
          "tasks": ["Task 1", "Task 2"],
          "irrigation": "Frequency and amount",
          "fertilizer": "Type and quantity if applicable",
          "pest_control": "Preventive measures if any",
          "weather_tips": "What to watch for"
        }
      ],
      "key_milestones": ["Important events this month"],
      "warnings": ["Potential issues to watch"],
      "labor_requirement": "Low/Medium/High"
    }
  ],
  "annual_summary": {
    "best_sowing_time": "Month range",
    "harvest_time": "Month range",
    "total_water_requirement": "mm",
    "major_pests": ["Pest list"],
    "expected_yield": "quintals/hectare",
    "estimated_cost": "rupees/hectare",
    "market_timing": "Best months to sell"
  }
}

Be specific to the crop and region. Include realistic timelines, local practices, and practical advice Indian farmers would find useful.`;

    let retries = 3;
    let delay = 2000;
    let aiData = null;

    while (retries > 0) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
          }),
        });

        if (response.status === 429) {
          retries--;
          if (retries > 0) {
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
            continue;
          }
          throw new Error("Service busy. Please try again in a moment.");
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        aiData = await response.json();
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }

    const content = aiData.choices[0].message.content;
    let calendarData;

    try {
      let cleanContent = content;
      if (content.includes('```json')) {
        cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      calendarData = JSON.parse(cleanContent.trim());
    } catch (e) {
      console.error('Parse error:', e);
      throw new Error('Failed to generate calendar. Please try again.');
    }

    return new Response(
      JSON.stringify(calendarData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Crop calendar error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate calendar' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
