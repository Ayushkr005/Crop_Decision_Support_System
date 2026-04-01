import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { PredictionForm, FormData } from "@/components/PredictionForm";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { CalculationDisplay } from "@/components/CalculationDisplay";
import { ProfitAnalysis } from "@/components/ProfitAnalysis";
import { Chatbot } from "@/components/Chatbot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { IndiaMap } from "@/components/IndiaMap";
import { WeatherForecast } from "@/components/WeatherForecast";
import { CropCalendar } from "@/components/CropCalendar";
import { TranslatableText } from "@/components/TranslatableText";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CropRecommendation {
  crop: string;
  confidence: number;
  predictedYield: number;
  predictedPrice: number;
  yieldTrend?: number;
  districtAvgYield?: number;
  plantingTime?: string;
  harvestTime?: string;
  fertilizers?: string;
  irrigationSchedule?: string;
  pestControl?: string;
}

const Predict = () => {
  const navigate = useNavigate();
  const { user, isCustomer, isAdmin } = useAuth();
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCalculations, setShowCalculations] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");

  const handlePrediction = async (formData: FormData) => {
    setIsLoading(true);
    setRecommendations([]);
    setShowCalculations(true);
    setSelectedDistrict(formData.district);
    setSelectedState(formData.state || "");

    try {
      // Start the API call but don't await it yet
      const predictionPromise = supabase.functions.invoke('crop-prediction', {
        body: formData
      });

      // Show calculation display for minimum 38 seconds (middle of 30-45 range)
      const calculationTimer = new Promise(resolve => setTimeout(resolve, 38000));
      
      // Wait for both the calculation display and the API call
      const [calculationComplete, { data, error }] = await Promise.all([
        calculationTimer,
        predictionPromise
      ]);

      setShowCalculations(false);

      if (error) {
        throw error;
      }

      if (data?.recommendations && data.recommendations.length > 0) {
        toast.success("Recommendations generated successfully!");
        setRecommendations(data.recommendations);
      } else {
        toast.error("No recommendations received. Please try again.");
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setShowCalculations(false);
      toast.error("Failed to get recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-15 pointer-events-none"
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${15 + Math.random() * 70}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        >
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      ))}

      {/* Theme, Language Controls and User Menu */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <LanguageSelector />
        <ThemeToggle />
        <UserMenu />
      </div>

      <div className="container mx-auto px-4 pt-6 relative z-10">
        <Button 
          onClick={() => navigate("/")}
          variant="outline"
          className="mb-4 group hover:scale-105 transition-all duration-300 animate-slide-in-left backdrop-blur-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Home
        </Button>
      </div>
      
      <HeroSection />
    
      <main className="container mx-auto max-w-6xl px-4 py-12 space-y-12 relative z-10">
        <div className="animate-fade-in">
          <PredictionForm onSubmit={handlePrediction} isLoading={isLoading} />
        </div>
        
        {showCalculations && (
          <div className="animate-scale-in">
            <CalculationDisplay />
          </div>
        )}
        
        {!showCalculations && recommendations.length > 0 && (
          <div className="space-y-12 animate-slide-up">
            <ResultsDisplay recommendations={recommendations} district={selectedDistrict} state={selectedState} />
            <IndiaMap selectedDistrict={selectedDistrict} />
          </div>
        )}

        {!showCalculations && recommendations.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <ProfitAnalysis />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          <WeatherForecast district={selectedDistrict || "Delhi"} state={selectedState || "Delhi"} />
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

      <Chatbot />
    </div>
  );
};

export default Predict;
