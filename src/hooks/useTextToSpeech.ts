import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  const speak = (text: string, lang: string = "en-US") => {
    if (!window.speechSynthesis) {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    // Stop any ongoing speech
    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language codes to speech synthesis language codes with fallbacks
    const langMap: { [key: string]: string[] } = {
      en: ["en-US", "en-GB", "en"],
      hi: ["hi-IN", "hi"],
      bn: ["bn-IN", "bn-BD", "bn"],
      te: ["te-IN", "te"],
      mr: ["mr-IN", "mr"],
      ta: ["ta-IN", "ta"],
      gu: ["gu-IN", "gu"],
      kn: ["kn-IN", "kn"],
      ml: ["ml-IN", "ml"],
      pa: ["pa-IN", "pa-PK", "pa"]
    };

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    const langCodes = langMap[lang] || [lang];
    
    // Try to find a matching voice
    let selectedVoice = null;
    for (const langCode of langCodes) {
      selectedVoice = voices.find(voice => 
        voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
      );
      if (selectedVoice) break;
    }

    // Set the voice and language
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = langCodes[0];
    }

    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (error) => {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      
      // If voice not available, provide helpful feedback
      if (error.error === 'language-unavailable' || error.error === 'voice-unavailable') {
        toast({
          title: "Voice Not Available",
          description: `Voice for this language may not be available. Using default voice.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Speech Error",
          description: "Could not read the text aloud.",
          variant: "destructive"
        });
      }
    };

    // Load voices if not already loaded
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speechSynthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };
    } else {
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const pause = () => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  };

  return { speak, stop, pause, resume, isSpeaking };
};
