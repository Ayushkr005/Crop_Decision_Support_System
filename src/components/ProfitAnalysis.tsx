import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Truck, IndianRupee, Loader2 } from "lucide-react";
import { getAllStates, getStateDistricts } from "@/data/districtDefaults";

interface ProfitAnalysisResult {
  localMarketProfit: number;
  transportationCost: number;
  nearbyMarketProfit: number;
  recommendation: string;
  breakdown: string;
}

export const ProfitAnalysis = () => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [cropName, setCropName] = useState<string>("");
  const [production, setProduction] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ProfitAnalysisResult | null>(null);

  const states = getAllStates();
  const districts = selectedState ? getStateDistricts(selectedState) : [];

  const handleAnalyze = async () => {
    if (!selectedState || !selectedDistrict || !cropName || !production) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('profit-analysis', {
        body: {
          state: selectedState,
          district: selectedDistrict,
          crop: cropName,
          productionQuintal: parseFloat(production)
        }
      });

      if (error) {
        // Check if it's a rate limit error
        if (error.message?.includes('429') || error.message?.includes('rate')) {
          toast.error("Service is busy. Please wait a moment and try again.");
        } else {
          throw error;
        }
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.analysis) {
        toast.success("Analysis complete!");
        setResult(data.analysis);
      } else {
        toast.error("Failed to get analysis. Please try again.");
      }
    } catch (error) {
      console.error('Profit analysis error:', error);
      toast.error("Failed to analyze profit. Please try again in a moment.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <TrendingUp className="w-6 h-6 text-primary" />
          Profit Analysis Tool
        </CardTitle>
        <p className="text-muted-foreground">
          Analyze your crop's market profitability and transportation costs
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select value={selectedState} onValueChange={(value) => {
              setSelectedState(value);
              setSelectedDistrict("");
            }}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
              <SelectTrigger id="district">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crop">Crop Name</Label>
            <Input
              id="crop"
              placeholder="e.g., Rice, Wheat, Cotton"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="production">Production (Quintal)</Label>
            <Input
              id="production"
              type="number"
              placeholder="e.g., 100"
              value={production}
              onChange={(e) => setProduction(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-5 w-5" />
              Analyze Profitability
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 mt-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-600">Local Market</h4>
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    ₹{result.localMarketProfit.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Estimated Profit</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-600">Transport Cost</h4>
                  </div>
                  <p className="text-3xl font-bold text-orange-700">
                    ₹{result.transportationCost.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">To Nearby Markets</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-600">Nearby Market</h4>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">
                    ₹{result.nearbyMarketProfit.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Net Profit</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  AI Recommendation
                </h4>
                <p className="text-foreground mb-4 font-medium">{result.recommendation}</p>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {result.breakdown}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
