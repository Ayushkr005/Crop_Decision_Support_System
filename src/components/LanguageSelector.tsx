import { Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/TranslationContext";

interface LanguageSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const LanguageSelector = ({ value: propValue, onChange: propOnChange }: LanguageSelectorProps) => {
  const { language: contextLanguage, setLanguage: setContextLanguage } = useTranslationContext();
  
  const currentLanguage = propValue !== undefined ? propValue : contextLanguage;
  const handleChange = propOnChange || setContextLanguage;

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी (Hindi)" },
    { code: "bn", name: "বাংলা (Bengali)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "mr", name: "मराठी (Marathi)" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "gu", name: "ગુજરાતી (Gujarati)" },
    { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
    { code: "ml", name: "മലയാളം (Malayalam)" },
    { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
  ];

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-5 w-5 text-muted-foreground" />
      <Select value={currentLanguage} onValueChange={handleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
