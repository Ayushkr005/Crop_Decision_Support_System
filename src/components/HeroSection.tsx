import { Sprout } from "lucide-react";
import { TranslatableText } from "./TranslatableText";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-accent py-20 px-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-full mb-6 animate-bounce-in">
            <Sprout className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-slide-up">
            <TranslatableText>Crop Decision Support System</TranslatableText>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in">
            <TranslatableText>AI-powered crop recommendations based on soil conditions, climate data, and district production history. Get personalized insights on what to grow, expected yields, and market analysis.</TranslatableText>
          </p>
        </div>
      </div>
    </section>
  );
};
