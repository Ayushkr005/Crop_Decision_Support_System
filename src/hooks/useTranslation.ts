import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (targetLanguage === "en") {
      return text;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: { text, targetLanguage }
      });

      if (error) throw error;
      
      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: "Could not translate content. Showing original text.",
        variant: "destructive"
      });
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  return { translateText, isTranslating };
};
