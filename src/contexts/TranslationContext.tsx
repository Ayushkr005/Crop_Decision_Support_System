import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translate: (text: string) => string;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Static translations cache for common terms to reduce API calls
const staticTranslations: Record<string, Record<string, string>> = {
  hi: {
    "Home": "होम",
    "Predict": "भविष्यवाणी",
    "Get Started": "शुरू करें",
    "Start Prediction": "भविष्यवाणी शुरू करें",
    "Crop Prediction": "फसल भविष्यवाणी",
    "Weather Forecast": "मौसम पूर्वानुमान",
    "Crop Calendar": "फसल कैलेंडर",
    "Profit Analysis": "लाभ विश्लेषण",
    "Submit": "जमा करें",
    "State": "राज्य",
    "District": "जिला",
    "Temperature": "तापमान",
    "Humidity": "आर्द्रता",
    "Rainfall": "वर्षा",
    "Nitrogen": "नाइट्रोजन",
    "Phosphorus": "फास्फोरस",
    "Potassium": "पोटेशियम",
    "pH Level": "पीएच स्तर",
    "Select State": "राज्य चुनें",
    "Select District": "जिला चुनें",
    "Monday": "सोमवार",
    "Tuesday": "मंगलवार",
    "Wednesday": "बुधवार",
    "Thursday": "गुरुवार",
    "Friday": "शुक्रवार",
    "Saturday": "शनिवार",
    "Sunday": "रविवार",
  },
  bn: {
    "Home": "হোম",
    "Predict": "পূর্বাভাস",
    "Get Started": "শুরু করুন",
    "Crop Prediction": "ফসল পূর্বাভাস",
    "Weather Forecast": "আবহাওয়া পূর্বাভাস",
    "State": "রাজ্য",
    "District": "জেলা",
  },
  te: {
    "Home": "హోమ్",
    "Predict": "అంచనా",
    "Get Started": "ప్రారంభించండి",
    "Crop Prediction": "పంట అంచనా",
    "State": "రాష్ట్రం",
    "District": "జిల్లా",
  },
  ta: {
    "Home": "முகப்பு",
    "Predict": "கணிப்பு",
    "Get Started": "தொடங்கு",
    "Crop Prediction": "பயிர் கணிப்பு",
    "State": "மாநிலம்",
    "District": "மாவட்டம்",
  },
  mr: {
    "Home": "होम",
    "Predict": "अंदाज",
    "Get Started": "सुरू करा",
    "Crop Prediction": "पीक अंदाज",
    "State": "राज्य",
    "District": "जिल्हा",
  },
  gu: {
    "Home": "હોમ",
    "Predict": "આગાહી",
    "Get Started": "શરૂ કરો",
    "Crop Prediction": "પાક આગાહી",
    "State": "રાજ્ય",
    "District": "જિલ્લો",
  },
  kn: {
    "Home": "ಮನೆ",
    "Predict": "ಊಹಿಸು",
    "Get Started": "ಪ್ರಾರಂಭಿಸಿ",
    "Crop Prediction": "ಬೆಳೆ ಊಹೆ",
    "State": "ರಾಜ್ಯ",
    "District": "ಜಿಲ್ಲೆ",
  },
  ml: {
    "Home": "ഹോം",
    "Predict": "പ്രവചനം",
    "Get Started": "ആരംഭിക്കുക",
    "Crop Prediction": "വിള പ്രവചനം",
    "State": "സംസ്ഥാനം",
    "District": "ജില്ല",
  },
  pa: {
    "Home": "ਘਰ",
    "Predict": "ਭਵਿੱਖਬਾਣੀ",
    "Get Started": "ਸ਼ੁਰੂ ਕਰੋ",
    "Crop Prediction": "ਫਸਲ ਭਵਿੱਖਬਾਣੀ",
    "State": "ਰਾਜ",
    "District": "ਜ਼ਿਲ੍ਹਾ",
  },
};

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const pendingTextsRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isTranslatingRef = useRef(false);
  const languageRef = useRef(language);
  const { toast } = useToast();

  // Keep refs in sync
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    isTranslatingRef.current = isTranslating;
  }, [isTranslating]);

  const triggerTranslation = useCallback(async () => {
    const currentLang = languageRef.current;
    if (pendingTextsRef.current.size === 0 || currentLang === "en" || isTranslatingRef.current) return;

    setIsTranslating(true);
    isTranslatingRef.current = true;
    const textsToTranslate = Array.from(pendingTextsRef.current);
    pendingTextsRef.current = new Set();

    try {
      const batchSize = 15;
      const newTranslations: Record<string, string> = {};

      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        const batch = textsToTranslate.slice(i, i + batchSize);
        const combinedText = batch.join("\n###SEPARATOR###\n");

        // Retry logic with exponential backoff
        let retries = 3;
        let delay = 1000;
        let success = false;

        while (retries > 0 && !success) {
          try {
            const { data, error } = await supabase.functions.invoke('translate-content', {
              body: { text: combinedText, targetLanguage: currentLang }
            });

            if (error) {
              if (error.message?.includes('429') || error.message?.includes('rate')) {
                retries--;
                if (retries > 0) {
                  await new Promise(resolve => setTimeout(resolve, delay));
                  delay *= 2;
                  continue;
                }
              }
              throw error;
            }

            const translatedParts = data.translatedText.split("###SEPARATOR###");
            batch.forEach((original, idx) => {
              if (translatedParts[idx]) {
                newTranslations[original.trim()] = translatedParts[idx].trim();
              }
            });
            success = true;
          } catch (err) {
            retries--;
            if (retries === 0) throw err;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          }
        }

        // Add delay between batches to avoid rate limits
        if (i + batchSize < textsToTranslate.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setTranslations(prev => ({ ...prev, ...newTranslations }));
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Notice",
        description: "Some translations may be delayed. Using cached translations.",
        variant: "default"
      });
    } finally {
      setIsTranslating(false);
      isTranslatingRef.current = false;
    }
  }, [toast]);

  const translate = useCallback((text: string): string => {
    if (language === "en" || !text) return text;
    
    const trimmedText = text.trim();
    if (!trimmedText) return text;

    // Check static translations first
    const staticTrans = staticTranslations[language]?.[trimmedText];
    if (staticTrans) return staticTrans;
    
    // Check cached translations
    if (translations[trimmedText]) {
      return translations[trimmedText];
    }

    // Add to pending for batch translation
    if (!pendingTextsRef.current.has(trimmedText)) {
      pendingTextsRef.current.add(trimmedText);
      
      // Debounce the translation request
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        triggerTranslation();
      }, 300);
    }
    
    return text;
  }, [language, translations, triggerTranslation]);

  useEffect(() => {
    // Clear translations when language changes
    if (language === "en") {
      setTranslations({});
      pendingTextsRef.current = new Set();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      // Force re-trigger translations for new language
      pendingTextsRef.current = new Set();
      setTranslations({});
    }
  }, [language]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const contextValue = useMemo(
    () => ({ language, setLanguage, translate, isTranslating }),
    [language, translate, isTranslating]
  );

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslationContext must be used within TranslationProvider");
  }
  return context;
};
