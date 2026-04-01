import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, User, MapPin, Leaf, Droplets, Loader2, CheckCircle, Sprout } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TranslatableText } from "@/components/TranslatableText";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAllStates, getStateDistricts, getDistrictDefaults } from "@/data/districtDefaults";

interface FarmerDetails {
  full_name: string;
  phone: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  land_area_acres: number;
  soil_type: string;
  irrigation_type: string;
  n_value: number;
  p_value: number;
  k_value: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

const SOIL_TYPES = ["Alluvial", "Black (Regur)", "Red", "Laterite", "Desert (Arid)", "Mountain", "Peaty & Marshy", "Saline & Alkaline", "Clay", "Sandy", "Loamy", "Silt"];
const IRRIGATION_TYPES = ["Rainfed", "Canal", "Tube Well", "Well", "Drip", "Sprinkler", "Tank", "River Lift", "Check Dam", "Other"];

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [formData, setFormData] = useState<FarmerDetails>({
    full_name: "",
    phone: "",
    village: "",
    taluka: "",
    district: "",
    state: "",
    land_area_acres: 0,
    soil_type: "",
    irrigation_type: "",
    n_value: 0,
    p_value: 0,
    k_value: 0,
    temperature: 0,
    humidity: 0,
    ph: 0,
    rainfall: 0,
  });

  const states = getAllStates();
  const districts = formData.state ? getStateDistricts(formData.state) : [];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadFarmerDetails();
    }
  }, [user]);

  const loadFarmerDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("farmer_details")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHasExistingData(true);
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          village: data.village || "",
          taluka: data.taluka || "",
          district: data.district,
          state: data.state,
          land_area_acres: Number(data.land_area_acres) || 0,
          soil_type: data.soil_type || "",
          irrigation_type: data.irrigation_type || "",
          n_value: Number(data.n_value) || 0,
          p_value: Number(data.p_value) || 0,
          k_value: Number(data.k_value) || 0,
          temperature: Number(data.temperature) || 0,
          humidity: Number(data.humidity) || 0,
          ph: Number(data.ph) || 0,
          rainfall: Number(data.rainfall) || 0,
        });
      }
    } catch (err) {
      console.error("Error loading farmer details:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleStateChange = (state: string) => {
    setFormData(prev => ({ ...prev, state, district: "" }));
  };

  const handleDistrictChange = (district: string) => {
    const defaults = getDistrictDefaults(formData.state, district);
    setFormData(prev => ({
      ...prev,
      district,
      n_value: defaults.N,
      p_value: defaults.P,
      k_value: defaults.K,
      temperature: defaults.temperature,
      humidity: defaults.humidity,
      ph: defaults.ph,
      rainfall: defaults.rainfall,
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.state || !formData.district) {
      toast.error("Please select a state and district.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        user_id: user.id,
        ...formData,
      };

      if (hasExistingData) {
        const { error } = await supabase
          .from("farmer_details")
          .update(payload)
          .eq("user_id", user.id);
        if (error) throw error;
        toast.success("Details updated successfully!");
      } else {
        const { error } = await supabase
          .from("farmer_details")
          .insert(payload);
        if (error) throw error;
        setHasExistingData(true);
        toast.success("Details saved successfully!");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Failed to save details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <LanguageSelector />
        <ThemeToggle />
        <UserMenu />
      </div>

      <div className="container mx-auto px-4 pt-6 relative z-10">
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="mb-4 group hover:scale-105 transition-all duration-300 backdrop-blur-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <TranslatableText>Back to Home</TranslatableText>
        </Button>
      </div>

      <main className="container mx-auto max-w-4xl px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sprout className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              <TranslatableText>Farmer Dashboard</TranslatableText>
            </h1>
          </div>
          <p className="text-muted-foreground">
            <TranslatableText>Save your personal and land details for pre-filled predictions</TranslatableText>
          </p>
          {hasExistingData && (
            <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              <TranslatableText>Profile Saved</TranslatableText>
            </Badge>
          )}
        </div>

        <Tabs defaultValue="personal" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="personal" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline"><TranslatableText>Personal</TranslatableText></span>
            </TabsTrigger>
            <TabsTrigger value="land" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline"><TranslatableText>Land & Location</TranslatableText></span>
            </TabsTrigger>
            <TabsTrigger value="soil" className="gap-2">
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline"><TranslatableText>Soil & Climate</TranslatableText></span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Details */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle><TranslatableText>Personal Information</TranslatableText></CardTitle>
                <CardDescription><TranslatableText>Your basic contact details</TranslatableText></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label><TranslatableText>Full Name</TranslatableText></Label>
                    <Input
                      value={formData.full_name}
                      onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label><TranslatableText>Phone Number</TranslatableText></Label>
                    <Input
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label><TranslatableText>Village / Town</TranslatableText></Label>
                    <Input
                      value={formData.village}
                      onChange={e => setFormData(prev => ({ ...prev, village: e.target.value }))}
                      placeholder="Enter village or town"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label><TranslatableText>Taluka / Tehsil</TranslatableText></Label>
                    <Input
                      value={formData.taluka}
                      onChange={e => setFormData(prev => ({ ...prev, taluka: e.target.value }))}
                      placeholder="Enter taluka"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Land & Location */}
          <TabsContent value="land">
            <Card>
              <CardHeader>
                <CardTitle><TranslatableText>Land & Location Details</TranslatableText></CardTitle>
                <CardDescription><TranslatableText>Your farm location and land characteristics</TranslatableText></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label><TranslatableText>State</TranslatableText></Label>
                    <Select value={formData.state} onValueChange={handleStateChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {states.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label><TranslatableText>District</TranslatableText></Label>
                    <Select value={formData.district} onValueChange={handleDistrictChange} disabled={!formData.state}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {districts.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label><TranslatableText>Land Area (Acres)</TranslatableText></Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.land_area_acres}
                      onChange={e => setFormData(prev => ({ ...prev, land_area_acres: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label><TranslatableText>Soil Type</TranslatableText></Label>
                    <Select value={formData.soil_type} onValueChange={v => setFormData(prev => ({ ...prev, soil_type: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOIL_TYPES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label><TranslatableText>Irrigation Type</TranslatableText></Label>
                    <Select value={formData.irrigation_type} onValueChange={v => setFormData(prev => ({ ...prev, irrigation_type: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select irrigation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {IRRIGATION_TYPES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Soil & Climate */}
          <TabsContent value="soil">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  <TranslatableText>Soil & Climate Data</TranslatableText>
                </CardTitle>
                <CardDescription>
                  <TranslatableText>Auto-filled based on your district. Adjust if you have specific soil test results.</TranslatableText>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: "n_value", label: "Nitrogen (N) kg/ha" },
                    { key: "p_value", label: "Phosphorus (P) kg/ha" },
                    { key: "k_value", label: "Potassium (K) kg/ha" },
                    { key: "temperature", label: "Temperature °C" },
                    { key: "humidity", label: "Humidity %" },
                    { key: "ph", label: "pH Level" },
                    { key: "rainfall", label: "Rainfall mm" },
                  ].map(field => (
                    <div key={field.key} className="space-y-2">
                      <Label><TranslatableText>{field.label}</TranslatableText></Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData[field.key as keyof FarmerDetails] as number}
                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save & Navigate buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 py-6 text-lg"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /><TranslatableText>Saving...</TranslatableText></>
            ) : (
              <><Save className="mr-2 h-5 w-5" /><TranslatableText>Save Details</TranslatableText></>
            )}
          </Button>
          {hasExistingData && (
            <Button
              onClick={() => navigate("/predict")}
              variant="outline"
              className="flex-1 py-6 text-lg border-2 hover:bg-primary/10"
            >
              <Sprout className="mr-2 h-5 w-5" />
              <TranslatableText>Get Crop Predictions</TranslatableText>
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default FarmerDashboard;
