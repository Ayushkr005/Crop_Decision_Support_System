import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Sprout, BarChart3, Calendar, Droplets, Pill, Bug, Volume2, Download } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, ScatterChart, Scatter, CartesianGrid, Tooltip, Area, AreaChart } from "recharts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useTranslation } from "@/hooks/useTranslation";
import { useTranslationContext } from "@/contexts/TranslationContext";
import { useState, useEffect } from "react";
import { generateRecommendationReport } from "@/utils/generateReport";

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

interface ResultsDisplayProps {
  recommendations: CropRecommendation[];
  district?: string;
  state?: string;
}

export const ResultsDisplay = ({ recommendations, district, state }: ResultsDisplayProps) => {
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const { translateText, isTranslating } = useTranslation();
  const { language } = useTranslationContext();
  const [translatedRecs, setTranslatedRecs] = useState<CropRecommendation[]>(recommendations);

  useEffect(() => {
    const translateRecommendations = async () => {
      if (language === "en") {
        setTranslatedRecs(recommendations);
        return;
      }

      const translated = await Promise.all(
        recommendations.map(async (rec) => {
          try {
            return {
              ...rec,
              crop: await translateText(rec.crop, language),
              plantingTime: rec.plantingTime ? await translateText(rec.plantingTime, language) : undefined,
              harvestTime: rec.harvestTime ? await translateText(rec.harvestTime, language) : undefined,
              fertilizers: rec.fertilizers ? await translateText(rec.fertilizers, language) : undefined,
              irrigationSchedule: rec.irrigationSchedule ? await translateText(rec.irrigationSchedule, language) : undefined,
              pestControl: rec.pestControl ? await translateText(rec.pestControl, language) : undefined,
            };
          } catch (error) {
            return rec;
          }
        })
      );
      setTranslatedRecs(translated);
    };

    translateRecommendations();
  }, [language, recommendations]);

  const handleSpeak = (rec: CropRecommendation) => {
    const text = `
      ${rec.crop}. 
      Confidence: ${rec.confidence}%. 
      Expected yield: ${rec.predictedYield?.toFixed(2)} tons per hectare. 
      Market price: ${rec.predictedPrice} rupees per quintal.
      ${rec.plantingTime ? `Planting time: ${rec.plantingTime}.` : ''}
      ${rec.harvestTime ? `Harvest time: ${rec.harvestTime}.` : ''}
      ${rec.fertilizers ? `Fertilizers: ${rec.fertilizers}.` : ''}
      ${rec.irrigationSchedule ? `Irrigation: ${rec.irrigationSchedule}.` : ''}
      ${rec.pestControl ? `Pest control: ${rec.pestControl}.` : ''}
    `;
    speak(text, language);
  };

  if (!translatedRecs || translatedRecs.length === 0) {
    return null;
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-primary text-primary-foreground";
    if (confidence >= 60) return "bg-secondary text-secondary-foreground";
    return "bg-muted text-muted-foreground";
  };

  const getRankBadge = (index: number) => {
    const badges = ["🥇 Best Choice", "🥈 Alternative", "🥉 Option"];
    return badges[index] || "";
  };

  // Chart data with null safety
  const yieldChartData = translatedRecs.map(rec => ({
    crop: rec.crop,
    yield: rec.predictedYield || 0,
    districtAvg: rec.districtAvgYield || (rec.predictedYield ? rec.predictedYield * 0.9 : 0)
  }));

  const revenueChartData = translatedRecs.map(rec => ({
    crop: rec.crop,
    revenue: ((rec.predictedYield || 0) * 10 * (rec.predictedPrice || 0)) / 100000 // in lakhs
  }));

  const priceComparisonData = translatedRecs.map(rec => ({
    crop: rec.crop,
    price: rec.predictedPrice || 0,
    marketAvg: (rec.predictedPrice || 0) * 0.95
  }));

  const confidenceData = translatedRecs.map(rec => ({
    crop: rec.crop,
    confidence: rec.confidence || 0
  }));

  const scatterData = translatedRecs.map(rec => ({
    crop: rec.crop,
    yield: rec.predictedYield || 0,
    revenue: ((rec.predictedYield || 0) * 10 * (rec.predictedPrice || 0)) / 100000,
    confidence: rec.confidence || 0
  }));

  const trendData = translatedRecs.map((rec, index) => ({
    crop: rec.crop,
    month1: (rec.predictedPrice || 0) * 0.9,
    month2: (rec.predictedPrice || 0) * 0.95,
    month3: rec.predictedPrice || 0,
    month4: (rec.predictedPrice || 0) * 1.05
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Your Top Crop Recommendations
        </h2>
        <p className="text-muted-foreground">
          Based on your soil, climate conditions, and district data
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => isSpeaking ? stop() : handleSpeak(translatedRecs[0])}
            disabled={isTranslating}
          >
            <Volume2 className="w-4 h-4 mr-2" />
            {isSpeaking ? "Stop Reading" : "Listen to Summary"}
          </Button>
          <Button
            size="sm"
            onClick={() => generateRecommendationReport({ recommendations, district, state })}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF Report
          </Button>
        </div>
      </div>

      {/* Crop Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {translatedRecs.map((rec, index) => (
          <Card 
            key={index}
            className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-sm">
                  {getRankBadge(index)}
                </Badge>
                <div className="flex items-center gap-2">
                  <Badge className={getConfidenceColor(rec.confidence)}>
                    {rec.confidence}% Match
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSpeak(rec)}
                    disabled={isTranslating}
                    className="h-8 w-8"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                <Sprout className="w-6 h-6 text-primary" />
                {rec.crop}
              </CardTitle>
              <CardDescription>
                Optimal for your conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Expected Yield</p>
                  <p className="text-lg font-bold text-foreground">
                    {(rec.predictedYield || 0).toFixed(2)} tons/ha
                  </p>
                  {rec.yieldTrend !== undefined && rec.yieldTrend !== 0 && (
                    <p className={`text-xs flex items-center gap-1 ${rec.yieldTrend > 0 ? 'text-primary' : 'text-destructive'}`}>
                      {rec.yieldTrend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {rec.yieldTrend > 0 ? '+' : ''}{rec.yieldTrend}% vs district avg
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-accent/10 rounded-full">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Market Price</p>
                  <p className="text-lg font-bold text-foreground">
                    ₹{(rec.predictedPrice || 0).toFixed(0)}/quintal
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Est. Production Cost</span>
                  <span className="text-lg font-semibold text-secondary">
                    ₹{((((rec.predictedYield || 0) * 10) * (rec.predictedPrice || 0)) * 0.4).toLocaleString('en-IN', {maximumFractionDigits: 0})}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Est. Selling Price</span>
                  <span className="text-lg font-semibold text-accent">
                    ₹{(((rec.predictedYield || 0) * 10) * (rec.predictedPrice || 0)).toLocaleString('en-IN', {maximumFractionDigits: 0})}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Net Profit</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{((((rec.predictedYield || 0) * 10) * (rec.predictedPrice || 0)) * 0.6).toLocaleString('en-IN', {maximumFractionDigits: 0})}
                  </span>
                </div>
              </div>

              {/* Cultivation Guidance Accordion */}
              {(rec.plantingTime || rec.harvestTime || rec.fertilizers || rec.irrigationSchedule || rec.pestControl) && (
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="guidance" className="border-0">
                    <AccordionTrigger className="text-sm font-medium text-primary hover:text-primary/80 py-2">
                      View Cultivation Guide
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
                      {rec.plantingTime && (
                        <div className="flex gap-3 p-3 bg-primary/5 rounded-lg animate-fade-in">
                          <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm text-foreground">Planting Time</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.plantingTime}</p>
                          </div>
                        </div>
                      )}
                      {rec.harvestTime && (
                        <div className="flex gap-3 p-3 bg-accent/5 rounded-lg animate-fade-in">
                          <Calendar className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm text-foreground">Harvest Time</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.harvestTime}</p>
                          </div>
                        </div>
                      )}
                      {rec.fertilizers && (
                        <div className="flex gap-3 p-3 bg-secondary/5 rounded-lg animate-fade-in">
                          <Pill className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm text-foreground">Fertilizers</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.fertilizers}</p>
                          </div>
                        </div>
                      )}
                      {rec.irrigationSchedule && (
                        <div className="flex gap-3 p-3 bg-primary/5 rounded-lg animate-fade-in">
                          <Droplets className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm text-foreground">Irrigation Schedule</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.irrigationSchedule}</p>
                          </div>
                        </div>
                      )}
                      {rec.pestControl && (
                        <div className="flex gap-3 p-3 bg-destructive/5 rounded-lg animate-fade-in">
                          <Bug className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm text-foreground">Pest & Disease Control</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.pestControl}</p>
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="space-y-6 mt-8">
        <h3 className="text-2xl font-bold text-center text-foreground animate-fade-in">
          Detailed Analytics & Insights
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Bar Chart - Yield Comparison */}
          <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 animate-fade-in hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Yield Comparison
              </CardTitle>
              <CardDescription>Predicted vs District Average (tons/ha)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  yield: {
                    label: "Predicted Yield",
                    color: "hsl(var(--primary))",
                  },
                  districtAvg: {
                    label: "District Avg",
                    color: "hsl(var(--secondary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="crop" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="yield" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Predicted Yield" />
                    <Bar dataKey="districtAvg" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} name="District Avg" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* 2. Pie Chart - Revenue Distribution */}
          <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 animate-fade-in hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-accent" />
                Revenue Distribution
              </CardTitle>
              <CardDescription>Estimated revenue per crop (₹ Lakhs)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue (Lakhs)",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.crop}: ₹${entry.revenue.toFixed(1)}L`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="revenue"
                    >
                      {revenueChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* 3. Line Chart - Price Trends */}
          <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 animate-fade-in hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Price Trend Forecast
              </CardTitle>
              <CardDescription>4-month price projection (₹/quintal)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  month1: { label: "Month 1", color: "hsl(var(--primary))" },
                  month2: { label: "Month 2", color: "hsl(var(--secondary))" },
                  month3: { label: "Month 3", color: "hsl(var(--accent))" },
                  month4: { label: "Month 4", color: "hsl(var(--primary))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="crop" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="month1" stroke="hsl(var(--primary))" strokeWidth={2} name="Month 1" />
                    <Line type="monotone" dataKey="month2" stroke="hsl(var(--secondary))" strokeWidth={2} name="Month 2" />
                    <Line type="monotone" dataKey="month3" stroke="hsl(var(--accent))" strokeWidth={2} name="Month 3" />
                    <Line type="monotone" dataKey="month4" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="5 5" name="Month 4 (Est)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* 4. Area Chart - Confidence Distribution */}
          <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 animate-fade-in hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-primary" />
                Confidence Levels
              </CardTitle>
              <CardDescription>Model confidence per crop (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  confidence: {
                    label: "Confidence",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="crop" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                      name="Confidence %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* 5. Scatter Chart - Yield vs Revenue */}
          <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 animate-fade-in hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Yield vs Revenue Analysis
              </CardTitle>
              <CardDescription>Correlation between yield and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  yield: {
                    label: "Yield (tons/ha)",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="yield" name="Yield" unit=" t/ha" stroke="hsl(var(--foreground))" />
                    <YAxis dataKey="revenue" name="Revenue" unit=" L" stroke="hsl(var(--foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Scatter name="Crops" data={scatterData} fill="hsl(var(--primary))">
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* 6. Bar Chart - Price Comparison */}
          <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 animate-fade-in hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-accent" />
                Market Price Analysis
              </CardTitle>
              <CardDescription>Predicted vs Market Average (₹/quintal)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  price: {
                    label: "Predicted Price",
                    color: "hsl(var(--primary))",
                  },
                  marketAvg: {
                    label: "Market Average",
                    color: "hsl(var(--secondary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceComparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" stroke="hsl(var(--foreground))" />
                    <YAxis dataKey="crop" type="category" width={80} stroke="hsl(var(--foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="price" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} name="Predicted Price" />
                    <Bar dataKey="marketAvg" fill="hsl(var(--secondary))" radius={[0, 8, 8, 0]} name="Market Average" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};