import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, Sun, Wind, CloudSun, CloudFog, Zap, Loader2, MapPin } from 'lucide-react';
import { TranslatableText } from './TranslatableText';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';

interface ForecastDay {
  day: string;
  date: string;
  temp_max: number;
  temp_min: number;
  condition: string;
  rainfall_mm: number;
  humidity: number;
  wind_speed: number;
  farming_advisory: string;
}

interface WeatherData {
  location: string;
  forecast: ForecastDay[];
  weekly_summary: string;
}

interface WeatherForecastProps {
  district?: string;
  state?: string;
}

export const WeatherForecast = ({ district = "Mumbai", state = "Maharashtra" }: WeatherForecastProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('weather-forecast', {
        body: { district, state }
      });

      if (fetchError) throw fetchError;
      
      if (data.error) {
        setError(data.error);
      } else {
        setWeatherData(data);
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to fetch weather. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (district && state) {
      fetchWeather();
    }
  }, [district, state]);

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'partly_cloudy':
        return <CloudSun className="w-8 h-8 text-orange-400" />;
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'thunderstorm':
        return <Zap className="w-8 h-8 text-purple-500" />;
      case 'foggy':
        return <CloudFog className="w-8 h-8 text-gray-500" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  const formatCondition = (condition: string) => {
    return condition?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Sunny';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="w-5 h-5" />
          <TranslatableText>7-Day Weather Forecast</TranslatableText>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {weatherData?.location || `${district}, ${state}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              <TranslatableText>Fetching weather data...</TranslatableText>
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchWeather} variant="outline">
              <TranslatableText>Try Again</TranslatableText>
            </Button>
          </div>
        ) : weatherData?.forecast ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
              {weatherData.forecast.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="text-sm font-medium mb-1">
                    <TranslatableText>{day.day}</TranslatableText>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {day.date?.split('-').slice(1).join('/')}
                  </div>
                  <div className="mb-2">{getWeatherIcon(day.condition)}</div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {formatCondition(day.condition)}
                  </div>
                  <div className="text-lg font-bold">
                    {day.temp_max}°<span className="text-sm text-muted-foreground">/{day.temp_min}°</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 text-center mt-2">
                    <div className="flex items-center gap-1">
                      <CloudRain className="w-3 h-3" />
                      {day.rainfall_mm}mm
                    </div>
                    <div className="flex items-center gap-1">
                      <Cloud className="w-3 h-3" />
                      {day.humidity}%
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="w-3 h-3" />
                      {day.wind_speed} km/h
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {weatherData.weekly_summary && (
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-primary" />
                  <TranslatableText>Weekly Advisory</TranslatableText>
                </h4>
                <p className="text-sm text-muted-foreground">{weatherData.weekly_summary}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              <TranslatableText>Select a location to view weather forecast</TranslatableText>
            </p>
            <Button onClick={fetchWeather}>
              <TranslatableText>Load Forecast</TranslatableText>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
