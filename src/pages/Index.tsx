import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { PredictionForm, FormData } from "@/components/PredictionForm";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { IndiaMap } from "@/components/IndiaMap";
import { WeatherForecast } from "@/components/WeatherForecast";
import { CropCalendar } from "@/components/CropCalendar";
import { TranslatableText } from "@/components/TranslatableText";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CropRecommendation {
  crop: string;
  confidence: number;
  predictedYield: number;
  predictedPrice: number;
  yieldTrend?: number;
  districtAvgYield?: number;
}

const Index = () => {
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const handlePrediction = async (formData: FormData) => {
    setIsLoading(true);
    setRecommendations([]);
    setSelectedDistrict(formData.district);

    try {
      const { data, error } = await supabase.functions.invoke('crop-prediction', {
        body: formData
      });

      if (error) {
        throw error;
      }

      if (data?.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        toast.success("Recommendations generated successfully!");
      } else {
        toast.error("No recommendations received. Please try again.");
      }
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error("Failed to get recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
        <HeroSection />
      
      <main className="container mx-auto max-w-6xl px-4 py-12 space-y-12">
        <PredictionForm onSubmit={handlePrediction} isLoading={isLoading} />
        
        {recommendations.length > 0 && (
          <>
            <ResultsDisplay recommendations={recommendations} />
            <IndiaMap selectedDistrict={selectedDistrict} />
          </>
        )}

        <div className="grid grid-cols-1 gap-8">
          <WeatherForecast />
          <CropCalendar />
        </div>
      </main>

        <footer className="border-t border-border mt-20 py-8 animate-fade-in">
          <div className="container mx-auto max-w-6xl px-4 text-center text-muted-foreground">
            <p>
              <TranslatableText>© 2025 Crop Decision Support System - Powered by AI & Agricultural Data Science</TranslatableText>
            </p>
          </div>
        </footer>
      </div>
  );
};

export default Index;
