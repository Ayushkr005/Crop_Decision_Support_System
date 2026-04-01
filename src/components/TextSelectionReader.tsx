import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, X } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useTranslationContext } from "@/contexts/TranslationContext";

export const TextSelectionReader = () => {
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const { language } = useTranslationContext();

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        setSelectedText(text);
        
        // Get selection position
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        
        if (rect) {
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 60
          });
          setIsVisible(true);
        }
      } else {
        setIsVisible(false);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
    };
  }, []);

  const handleRead = () => {
    if (selectedText) {
      speak(selectedText, language);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    stop();
    window.getSelection()?.removeAllRanges();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 animate-scale-in"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translateX(-50%)"
      }}
    >
      <div className="bg-card border-2 border-primary rounded-lg shadow-lg p-2 flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleRead}
          className="bg-primary hover:bg-primary/90"
          disabled={isSpeaking}
        >
          <Volume2 className="w-4 h-4 mr-1" />
          {isSpeaking ? "Reading..." : "Read Me"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
