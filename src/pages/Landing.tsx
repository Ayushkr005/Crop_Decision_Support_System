import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sprout, TrendingUp, Cloud, Droplets, Leaf, BarChart3, ArrowLeft, Info, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDistrictDefaults, getAllStates, getStateDistricts } from "@/data/districtDefaults";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TranslatableText } from "@/components/TranslatableText";
import UserMenu from "@/components/UserMenu";

const Landing = () => {
  const navigate = useNavigate();
  const [showDistrictInfo, setShowDistrictInfo] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districtData, setDistrictData] = useState<any>(null);

  const states = getAllStates();
  const districts = selectedState ? getStateDistricts(selectedState) : [];

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    const data = getDistrictDefaults(selectedState, district);
    setDistrictData(data);
  };

  const features = [
    {
      icon: Sprout,
      title: "Smart Crop Selection",
      description: "AI-powered recommendations based on your soil and climate conditions",
      delay: "0.1s"
    },
    {
      icon: TrendingUp,
      title: "Yield Predictions",
      description: "Accurate forecasts to help you maximize your harvest",
      delay: "0.2s"
    },
    {
      icon: Cloud,
      title: "Weather Integration",
      description: "Real-time climate data for better decision making",
      delay: "0.3s"
    },
    {
      icon: Droplets,
      title: "Soil Analysis",
      description: "Comprehensive NPK and pH level analysis",
      delay: "0.4s"
    },
    {
      icon: Leaf,
      title: "District-Specific Data",
      description: "Localized insights from across India",
      delay: "0.5s"
    },
    {
      icon: BarChart3,
      title: "Visual Analytics",
      description: "Interactive charts and graphs for data insights",
      delay: "0.6s"
    }
  ];

  if (showDistrictInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="container mx-auto px-4 py-12">
          <Button 
            onClick={() => {
              setShowDistrictInfo(false);
              setSelectedState("");
              setSelectedDistrict("");
              setDistrictData(null);
            }}
            variant="outline"
            className="mb-8 group hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Home
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-slide-down">
              <Info className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce-in" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Know About Your District
              </h1>
              <p className="text-lg text-muted-foreground">
                Select your state and district to view soil and climate information
              </p>
            </div>

            <Card className="p-8 backdrop-blur-sm bg-card/50 border-2 animate-scale-in">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 animate-slide-in-left" style={{ animationDelay: "0.1s" }}>
                    <label className="text-sm font-medium">State</label>
                    <Select value={selectedState} onValueChange={(value) => {
                      setSelectedState(value);
                      setSelectedDistrict("");
                      setDistrictData(null);
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 animate-slide-in-left" style={{ animationDelay: "0.2s" }}>
                    <label className="text-sm font-medium">District</label>
                    <Select 
                      value={selectedDistrict} 
                      onValueChange={handleDistrictSelect}
                      disabled={!selectedState}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {districtData && (
                  <div className="mt-8 space-y-6 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-center mb-6 text-primary">
                      {selectedDistrict}, {selectedState} - Agricultural Data
                    </h2>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 hover:scale-105 transition-all duration-300">
                        <div className="text-sm text-muted-foreground mb-2">Nitrogen (N)</div>
                        <div className="text-3xl font-bold text-primary">{districtData.N} kg/ha</div>
                      </Card>
                      
                      <Card className="p-6 bg-gradient-to-br from-accent/10 to-secondary/10 hover:scale-105 transition-all duration-300">
                        <div className="text-sm text-muted-foreground mb-2">Phosphorous (P)</div>
                        <div className="text-3xl font-bold text-accent">{districtData.P} kg/ha</div>
                      </Card>
                      
                      <Card className="p-6 bg-gradient-to-br from-secondary/10 to-primary/10 hover:scale-105 transition-all duration-300">
                        <div className="text-sm text-muted-foreground mb-2">Potassium (K)</div>
                        <div className="text-3xl font-bold text-secondary">{districtData.K} kg/ha</div>
                      </Card>
                      
                      <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 hover:scale-105 transition-all duration-300">
                        <div className="text-sm text-muted-foreground mb-2">Temperature</div>
                        <div className="text-3xl font-bold text-orange-600">{districtData.temperature}°C</div>
                      </Card>
                      
                      <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:scale-105 transition-all duration-300">
                        <div className="text-sm text-muted-foreground mb-2">Humidity</div>
                        <div className="text-3xl font-bold text-blue-600">{districtData.humidity}%</div>
                      </Card>
                      
                      <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:scale-105 transition-all duration-300">
                        <div className="text-sm text-muted-foreground mb-2">pH Level</div>
                        <div className="text-3xl font-bold text-green-600">{districtData.ph}</div>
                      </Card>
                      
                      <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 hover:scale-105 transition-all duration-300 md:col-span-2 lg:col-span-3">
                        <div className="text-sm text-muted-foreground mb-2">Annual Rainfall</div>
                        <div className="text-3xl font-bold text-indigo-600">{districtData.rainfall} mm</div>
                      </Card>
                    </div>

                    <div className="mt-8 text-center">
                      <Button 
                        size="lg"
                        onClick={() => navigate("/predict")}
                        className="bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-500 hover:scale-105"
                      >
                        Get Crop Predictions
                        <Sprout className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/3 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-20 pointer-events-none"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${5 + Math.random() * 3}s`,
          }}
        >
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
      ))}

      {/* Theme, Language Controls and User Menu */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <LanguageSelector />
        <ThemeToggle />
        <UserMenu />
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-slide-down">
          <div className="inline-block mb-6">
            <Sprout className="w-20 h-20 text-primary animate-bounce-in" strokeWidth={1.5} />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-fade-in">
            <TranslatableText>Crop Decision Support System</TranslatableText>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <TranslatableText>Harness the power of AI and data science to make informed agricultural decisions. Get personalized crop recommendations based on your soil, climate, and location.</TranslatableText>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg" 
              onClick={() => navigate("/predict")}
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-500 hover:scale-105 group"
            >
              <TranslatableText>Get Started</TranslatableText>
              <Sprout className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setShowDistrictInfo(true)}
              className="text-lg px-8 py-6 border-2 hover:bg-muted hover:scale-105 transition-all duration-500 group"
            >
              <Info className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <TranslatableText>Know About Your District</TranslatableText>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-glow hover:scale-105 animate-slide-up"
              style={{ animationDelay: feature.delay }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-500">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                  <TranslatableText>{feature.title}</TranslatableText>
                </h3>
                <p className="text-muted-foreground">
                  <TranslatableText>{feature.description}</TranslatableText>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm hover:scale-105 transition-all duration-500">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">
              <TranslatableText>Districts Covered</TranslatableText>
            </div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-secondary/10 backdrop-blur-sm hover:scale-105 transition-all duration-500">
            <div className="text-4xl font-bold text-accent mb-2">50+</div>
            <div className="text-muted-foreground">
              <TranslatableText>Crop Varieties</TranslatableText>
            </div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-primary/10 backdrop-blur-sm hover:scale-105 transition-all duration-500">
            <div className="text-4xl font-bold text-secondary mb-2">75%-90%</div>
            <div className="text-muted-foreground">
              <TranslatableText>Accuracy & Improving</TranslatableText>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
