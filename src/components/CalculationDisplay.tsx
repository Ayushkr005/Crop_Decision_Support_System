import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Database, TrendingUp, MapPin, Cloud, LineChart, CheckCircle2, Loader2 } from "lucide-react";

interface CalculationStep {
  id: number;
  icon: any;
  title: string;
  description: string;
  duration: number;
  progress: number;
}

const calculationSteps: CalculationStep[] = [
  {
    id: 1,
    icon: Database,
    title: "Loading District Data",
    description: "Fetching historical crop production records...",
    duration: 4000,
    progress: 0
  },
  {
    id: 2,
    icon: Cloud,
    title: "Analyzing Climate Patterns",
    description: "Processing temperature, humidity, and rainfall data...",
    duration: 5000,
    progress: 0
  },
  {
    id: 3,
    icon: MapPin,
    title: "Evaluating Soil Composition",
    description: "Analyzing NPK levels and pH balance...",
    duration: 5000,
    progress: 0
  },
  {
    id: 4,
    icon: LineChart,
    title: "Processing Market Data",
    description: "Fetching current market prices and trends...",
    duration: 5000,
    progress: 0
  },
  {
    id: 5,
    icon: Brain,
    title: "AI Model Analysis",
    description: "Training neural network - Epoch 1/50...",
    duration: 8000,
    progress: 0
  },
  {
    id: 6,
    icon: TrendingUp,
    title: "Calculating Yield Predictions",
    description: "Estimating crop yields and revenue projections...",
    duration: 6000,
    progress: 0
  },
  {
    id: 7,
    icon: CheckCircle2,
    title: "Finalizing Recommendations",
    description: "Ranking crops by suitability and profitability...",
    duration: 5000,
    progress: 0
  }
];

export const CalculationDisplay = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(calculationSteps);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(1);

  useEffect(() => {
    let stepTimer: ReturnType<typeof setTimeout>;
    let progressInterval: ReturnType<typeof setInterval>;

    const runStep = (stepIndex: number) => {
      if (stepIndex >= steps.length) return;

      const step = steps[stepIndex];
      const startTime = Date.now();

      // Update progress smoothly
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / step.duration) * 100, 100);
        
        // Update epochs for AI Model Analysis step (step 4, index 4)
        if (stepIndex === 4) {
          const epoch = Math.min(Math.floor((progress / 100) * 50) + 1, 50);
          setCurrentEpoch(epoch);
          setSteps(prev => prev.map((s, i) => 
            i === stepIndex ? { ...s, progress, description: `Training neural network - Epoch ${epoch}/50...` } : s
          ));
        } else {
          setSteps(prev => prev.map((s, i) => 
            i === stepIndex ? { ...s, progress } : s
          ));
        }

        // Update overall progress
        const completedSteps = stepIndex;
        const currentStepProgress = progress / 100;
        const totalProgress = ((completedSteps + currentStepProgress) / steps.length) * 100;
        setOverallProgress(totalProgress);
      }, 50);

      // Move to next step after duration
      stepTimer = setTimeout(() => {
        clearInterval(progressInterval);
        setSteps(prev => prev.map((s, i) => 
          i === stepIndex ? { ...s, progress: 100 } : s
        ));
        setCurrentStep(stepIndex + 1);
        runStep(stepIndex + 1);
      }, step.duration);
    };

    runStep(0);

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
              <Brain className="w-7 h-7 text-primary animate-pulse" />
              AI Analysis in Progress
            </h3>
            <p className="text-muted-foreground">
              Processing your data with advanced agricultural AI models
            </p>
          </div>

          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold text-primary">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          <div className="space-y-4 mt-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isPending = index > currentStep;

              return (
                <div
                  key={step.id}
                  className={`
                    flex items-start gap-4 p-4 rounded-lg transition-all duration-500
                    ${isActive ? 'bg-primary/10 border-2 border-primary scale-105' : ''}
                    ${isCompleted ? 'bg-muted/50 opacity-70' : ''}
                    ${isPending ? 'opacity-40' : ''}
                  `}
                >
                  <div className={`
                    p-3 rounded-full flex-shrink-0
                    ${isActive ? 'bg-primary text-primary-foreground animate-pulse' : ''}
                    ${isCompleted ? 'bg-primary/20 text-primary' : ''}
                    ${isPending ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`
                      font-semibold mb-1
                      ${isActive ? 'text-primary' : ''}
                      ${isCompleted ? 'text-muted-foreground' : ''}
                      ${isPending ? 'text-muted-foreground' : ''}
                    `}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    {(isActive || isCompleted) && (
                      <Progress 
                        value={step.progress} 
                        className={`h-1.5 ${isActive ? 'animate-pulse' : ''}`}
                      />
                    )}
                  </div>

                  {isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
            <p className="text-sm text-center text-muted-foreground">
              <span className="font-semibold text-primary">Powered by Google Gemini AI</span> • 
              Analyzing millions of data points for accurate predictions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};