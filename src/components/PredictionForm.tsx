import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { TranslatableText } from "./TranslatableText";
import { getDistrictDefaults } from "@/data/districtDefaults";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PredictionFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

export interface FormData {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  district: string;
  state: string;
}

export const PredictionForm = ({ onSubmit, isLoading }: PredictionFormProps) => {
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [districts, setDistricts] = useState<string[]>([]);
  const [stateDistrictMap, setStateDistrictMap] = useState<Map<string, Set<string>>>(new Map());
  
  const [formData, setFormData] = useState<FormData>({
    N: 90,
    P: 42,
    K: 43,
    temperature: 21,
    humidity: 82,
    ph: 6.5,
    rainfall: 203,
    district: "",
    state: "",
  });

  const { user } = useAuth();

  // Load saved farmer details on mount
  useEffect(() => {
    if (user) {
      supabase
        .from("farmer_details")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data && data.state && data.district) {
            setSelectedState(data.state);
            setFormData(prev => ({
              ...prev,
              state: data.state,
              district: data.district,
              N: Number(data.n_value) || prev.N,
              P: Number(data.p_value) || prev.P,
              K: Number(data.k_value) || prev.K,
              temperature: Number(data.temperature) || prev.temperature,
              humidity: Number(data.humidity) || prev.humidity,
              ph: Number(data.ph) || prev.ph,
              rainfall: Number(data.rainfall) || prev.rainfall,
            }));
          }
        });
    }
  }, [user]);

  useEffect(() => {
    // Load states and districts from CSV
    fetch('/data/India_District_Crop_Production.csv')
      .then(res => res.text())
      .then(csv => {
        const lines = csv.split('\n');
        const stateMap = new Map<string, Set<string>>();
        
        for (let i = 1; i < lines.length; i++) {
          const match = lines[i].match(/"([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)"/);
          if (match && match[4] && match[5]) {
            const state = match[4];
            const district = match[5];
            
            if (!stateMap.has(state)) {
              stateMap.set(state, new Set());
            }
            stateMap.get(state)?.add(district);
          }
        }
        
        const sortedStates = Array.from(stateMap.keys()).sort();
        setStates(sortedStates);
        setStateDistrictMap(stateMap);

        // Only set defaults from CSV if no farmer data was loaded
        if (!selectedState && sortedStates.length > 0) {
          const firstState = sortedStates[0];
          setSelectedState(firstState);
          const firstDistricts = Array.from(stateMap.get(firstState) || []).sort();
          setDistricts(firstDistricts);
          if (firstDistricts.length > 0) {
            setFormData(prev => ({ ...prev, district: prev.district || firstDistricts[0], state: prev.state || firstState }));
          } else {
            setFormData(prev => ({ ...prev, state: prev.state || firstState }));
          }
        } else if (selectedState) {
          // Update districts list for the farmer's saved state
          const stateDistricts = Array.from(stateMap.get(selectedState) || []).sort();
          setDistricts(stateDistricts);
        }
      })
      .catch(err => console.error('Failed to load data:', err));
  }, [selectedState]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const stateDistricts = Array.from(stateDistrictMap.get(state) || []).sort();
    setDistricts(stateDistricts);
    if (stateDistricts.length > 0) {
      const firstDistrict = stateDistricts[0];
      const defaults = getDistrictDefaults(state, firstDistrict);
      setFormData(prev => ({ ...prev, district: firstDistrict, state, ...defaults }));
    } else {
      setFormData(prev => ({ ...prev, state }));
    }
  };

  const handleDistrictChange = (district: string) => {
    const defaults = getDistrictDefaults(selectedState, district);
    setFormData(prev => ({ ...prev, district, ...defaults }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(e.target.value) || 0
    }));
  };

  return (
    <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 animate-slide-up">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground animate-fade-in">
          <TranslatableText>Enter Soil & Climate Data</TranslatableText>
        </CardTitle>
        <CardDescription className="animate-fade-in">
          <TranslatableText>Provide your field's conditions for personalized crop recommendations</TranslatableText>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="N" className="text-sm font-medium">
                <TranslatableText>Nitrogen (N) - kg/ha</TranslatableText>
              </Label>
              <Input
                id="N"
                type="number"
                step="0.01"
                value={formData.N}
                onChange={handleChange('N')}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="P" className="text-sm font-medium">
                <TranslatableText>Phosphorus (P) - kg/ha</TranslatableText>
              </Label>
              <Input
                id="P"
                type="number"
                step="0.01"
                value={formData.P}
                onChange={handleChange('P')}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="K" className="text-sm font-medium">
                <TranslatableText>Potassium (K) - kg/ha</TranslatableText>
              </Label>
              <Input
                id="K"
                type="number"
                step="0.01"
                value={formData.K}
                onChange={handleChange('K')}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature" className="text-sm font-medium">
                <TranslatableText>Temperature - °C</TranslatableText>
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.01"
                value={formData.temperature}
                onChange={handleChange('temperature')}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="humidity" className="text-sm font-medium">
                <TranslatableText>Humidity - %</TranslatableText>
              </Label>
              <Input
                id="humidity"
                type="number"
                step="0.01"
                value={formData.humidity}
                onChange={handleChange('humidity')}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ph" className="text-sm font-medium">
                <TranslatableText>pH Level</TranslatableText>
              </Label>
              <Input
                id="ph"
                type="number"
                step="0.01"
                value={formData.ph}
                onChange={handleChange('ph')}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rainfall" className="text-sm font-medium">
                <TranslatableText>Rainfall - mm</TranslatableText>
              </Label>
              <Input
                id="rainfall"
                type="number"
                step="0.01"
                value={formData.rainfall}
                onChange={handleChange('rainfall')}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">
                <TranslatableText>State</TranslatableText>
              </Label>
              <Select 
                value={selectedState} 
                onValueChange={handleStateChange}
              >
                <SelectTrigger className="bg-background border-border z-50 hover-scale transition-all">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-popover border-border z-[100]">
                  {states.map(state => (
                    <SelectItem key={state} value={state} className="cursor-pointer hover:bg-muted">
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district" className="text-sm font-medium">
                <TranslatableText>District</TranslatableText>
              </Label>
              <Select 
                value={formData.district} 
                onValueChange={handleDistrictChange}
              >
                <SelectTrigger className="bg-background border-border z-50 hover-scale transition-all">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-popover border-border z-[100]">
                  {districts.map(district => (
                    <SelectItem key={district} value={district} className="cursor-pointer hover:bg-muted">
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-6 text-lg transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <TranslatableText>Analyzing...</TranslatableText>
              </>
            ) : (
              <TranslatableText>Get Crop Recommendations</TranslatableText>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
