import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Sprout, Loader2, ChevronDown, ChevronUp, Droplets, Bug, AlertTriangle, TrendingUp } from 'lucide-react';
import { TranslatableText } from './TranslatableText';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getAllStates, getStateDistricts } from '@/data/districtDefaults';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface WeekActivity {
  week: number;
  tasks: string[];
  irrigation: string;
  fertilizer: string;
  pest_control: string;
  weather_tips: string;
}

interface MonthData {
  month: string;
  month_number: number;
  phase: string;
  is_active: boolean;
  activities: WeekActivity[];
  key_milestones: string[];
  warnings: string[];
  labor_requirement: string;
}

interface AnnualSummary {
  best_sowing_time: string;
  harvest_time: string;
  total_water_requirement: string;
  major_pests: string[];
  expected_yield: string;
  estimated_cost: string;
  market_timing: string;
}

interface CalendarData {
  crop: string;
  location: string;
  growing_season: string;
  total_duration_days: number;
  months: MonthData[];
  annual_summary: AnnualSummary;
}

export const CropCalendar = () => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [cropName, setCropName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set());

  const states = getAllStates();
  const districts = selectedState ? getStateDistricts(selectedState) : [];

  const fetchCalendar = async () => {
    if (!cropName || !selectedState || !selectedDistrict) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('crop-calendar', {
        body: { crop: cropName, state: selectedState, district: selectedDistrict }
      });

      if (fetchError) throw fetchError;
      
      if (data.error) {
        setError(data.error);
      } else {
        setCalendarData(data);
        // Expand active months by default
        const activeMonths = new Set<number>();
        data.months?.forEach((m: MonthData, i: number) => {
          if (m.is_active) activeMonths.add(i);
        });
        setExpandedMonths(activeMonths);
      }
    } catch (err) {
      console.error('Calendar fetch error:', err);
      setError('Failed to generate calendar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMonth = (index: number) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedMonths(newExpanded);
  };

  const getPhaseColor = (phase: string) => {
    const p = phase?.toLowerCase() || '';
    if (p.includes('sowing') || p.includes('planting')) return 'bg-green-500';
    if (p.includes('growing') || p.includes('vegetative')) return 'bg-emerald-500';
    if (p.includes('harvest')) return 'bg-amber-500';
    if (p.includes('preparation')) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getLaborColor = (level: string) => {
    const l = level?.toLowerCase() || '';
    if (l.includes('high')) return 'destructive';
    if (l.includes('medium')) return 'default';
    return 'secondary';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <TranslatableText>365-Day Crop Calendar</TranslatableText>
        </CardTitle>
        <CardDescription>
          <TranslatableText>Complete annual farming guide with detailed activities for your crop</TranslatableText>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label><TranslatableText>Crop Name</TranslatableText></Label>
            <Input
              placeholder="e.g., Rice, Wheat, Cotton"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label><TranslatableText>State</TranslatableText></Label>
            <Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setSelectedDistrict(""); }}>
              <SelectTrigger>
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
            <Label><TranslatableText>District</TranslatableText></Label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
              <SelectTrigger>
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
            <Label>&nbsp;</Label>
            <Button onClick={fetchCalendar} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <TranslatableText>Generating...</TranslatableText>
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  <TranslatableText>Generate Calendar</TranslatableText>
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Calendar Data Display */}
        {calendarData && (
          <div className="space-y-6">
            {/* Summary Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-primary/5">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">
                    <TranslatableText>Crop</TranslatableText>
                  </div>
                  <div className="text-lg font-bold">{calendarData.crop}</div>
                </CardContent>
              </Card>
              <Card className="bg-primary/5">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">
                    <TranslatableText>Season</TranslatableText>
                  </div>
                  <div className="text-lg font-bold">{calendarData.growing_season}</div>
                </CardContent>
              </Card>
              <Card className="bg-primary/5">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">
                    <TranslatableText>Duration</TranslatableText>
                  </div>
                  <div className="text-lg font-bold">{calendarData.total_duration_days} <TranslatableText>days</TranslatableText></div>
                </CardContent>
              </Card>
              <Card className="bg-primary/5">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">
                    <TranslatableText>Location</TranslatableText>
                  </div>
                  <div className="text-lg font-bold truncate">{calendarData.location}</div>
                </CardContent>
              </Card>
            </div>

            {/* Annual Summary */}
            {calendarData.annual_summary && (
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <TranslatableText>Annual Summary</TranslatableText>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground"><TranslatableText>Best Sowing</TranslatableText>: </span>
                      <span className="font-medium">{calendarData.annual_summary.best_sowing_time}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground"><TranslatableText>Harvest Time</TranslatableText>: </span>
                      <span className="font-medium">{calendarData.annual_summary.harvest_time}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground"><TranslatableText>Expected Yield</TranslatableText>: </span>
                      <span className="font-medium">{calendarData.annual_summary.expected_yield}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground"><TranslatableText>Est. Cost</TranslatableText>: </span>
                      <span className="font-medium">{calendarData.annual_summary.estimated_cost}</span>
                    </div>
                  </div>
                  {calendarData.annual_summary.major_pests?.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Bug className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-muted-foreground"><TranslatableText>Major Pests</TranslatableText>: </span>
                      {calendarData.annual_summary.major_pests.map((pest, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{pest}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Monthly Calendar */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <TranslatableText>Monthly Schedule</TranslatableText>
              </h3>
              
              {calendarData.months?.map((month, index) => (
                <Collapsible
                  key={index}
                  open={expandedMonths.has(index)}
                  onOpenChange={() => toggleMonth(index)}
                >
                  <Card className={`border ${month.is_active ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getPhaseColor(month.phase)}`} />
                            <CardTitle className="text-base">
                              <TranslatableText>{month.month}</TranslatableText>
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">{month.phase}</Badge>
                            <Badge variant={getLaborColor(month.labor_requirement)} className="text-xs">
                              {month.labor_requirement} <TranslatableText>Labor</TranslatableText>
                            </Badge>
                          </div>
                          {expandedMonths.has(index) ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        {/* Weekly Activities */}
                        {month.activities?.map((week, wIndex) => (
                          <div key={wIndex} className="p-3 rounded-lg bg-muted/30 space-y-2">
                            <div className="font-medium text-sm">
                              <TranslatableText>Week</TranslatableText> {week.week}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground"><TranslatableText>Tasks</TranslatableText>: </span>
                                <span>{week.tasks?.join(', ')}</span>
                              </div>
                              {week.irrigation && (
                                <div className="flex items-center gap-1">
                                  <Droplets className="w-3 h-3 text-blue-500" />
                                  <span>{week.irrigation}</span>
                                </div>
                              )}
                              {week.fertilizer && (
                                <div>
                                  <span className="text-muted-foreground"><TranslatableText>Fertilizer</TranslatableText>: </span>
                                  <span>{week.fertilizer}</span>
                                </div>
                              )}
                              {week.pest_control && (
                                <div className="flex items-center gap-1">
                                  <Bug className="w-3 h-3 text-orange-500" />
                                  <span>{week.pest_control}</span>
                                </div>
                              )}
                            </div>
                            {week.weather_tips && (
                              <div className="text-xs text-muted-foreground italic">
                                💡 {week.weather_tips}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Milestones and Warnings */}
                        <div className="flex flex-wrap gap-4">
                          {month.key_milestones?.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Sprout className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{month.key_milestones.join(', ')}</span>
                            </div>
                          )}
                          {month.warnings?.length > 0 && (
                            <div className="flex items-center gap-2 text-orange-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm">{month.warnings.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </div>
        )}

        {/* Default state when no data */}
        {!calendarData && !isLoading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p><TranslatableText>Enter crop details above to generate a comprehensive 365-day farming calendar</TranslatableText></p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
