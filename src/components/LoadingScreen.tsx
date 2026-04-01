import { useEffect, useState } from "react";
import { Sprout, Sparkles } from "lucide-react";

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background animate-fade-in">
      <div className="text-center space-y-8 px-4">
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-20">
            <Sprout className="w-24 h-24 text-primary mx-auto" />
          </div>
          <Sprout className="w-24 h-24 text-primary mx-auto animate-scale-in relative z-10" />
          <Sparkles className="w-8 h-8 text-accent absolute -top-2 -right-2 animate-pulse" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground animate-fade-in">
            Welcome to
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-fade-in">
            Crop Decision Support System
          </h2>
          <p className="text-muted-foreground text-lg animate-fade-in">
            Powered by AI & Agricultural Data Science
          </p>
        </div>

        <div className="w-64 mx-auto space-y-2 animate-fade-in">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">Loading {progress}%</p>
        </div>
      </div>
    </div>
  );
};
