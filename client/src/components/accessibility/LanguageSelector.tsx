import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Globe, Check, Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SupportedLanguage } from "@/lib/i18n/translations";

interface LanguageSelectorProps {
  variant?: "dropdown" | "dialog" | "minimal";
  className?: string;
}

export function LanguageSelector({ 
  variant = "dropdown",
  className = "" 
}: LanguageSelectorProps) {
  const { currentLanguage, setLanguage, availableLanguages, languageNames } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Only show languages that have complete translations
  const prominentLanguages: SupportedLanguage[] = ['en', 'es', 'fr', 'zh', 'ar'];

  // Common rendering for language items
  const renderLanguageItem = (language: SupportedLanguage, onClick: () => void) => {
    const isSelected = language === currentLanguage;
    return (
      <div 
        key={language}
        className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-sm ${isSelected ? 'bg-primary/10' : 'hover:bg-muted'}`}
        onClick={onClick}
      >
        <div className="flex items-center">
          <span className="mr-2">{getLanguageEmoji(language)}</span>
          <span>{languageNames[language]}</span>
        </div>
        {isSelected && <Check className="h-4 w-4 text-primary" />}
      </div>
    );
  };

  // Simple dropdown menu variant
  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={className}>
            <Globe className="h-5 w-5" />
            <span className="sr-only">Select language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {prominentLanguages.map((language) => (
            <DropdownMenuItem 
              key={language}
              onClick={() => setLanguage(language)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <span className="mr-2">{getLanguageEmoji(language)}</span>
                  <span>{languageNames[language]}</span>
                </div>
                {language === currentLanguage && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Dialog with grid layout variant
  if (variant === "dialog") {
    return (
      <>
        <Button 
          variant="outline" 
          onClick={() => setIsDialogOpen(true)}
          className={`flex items-center gap-2 ${className}`}
        >
          <Languages className="h-4 w-4" />
          <span>{languageNames[currentLanguage]}</span>
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Language</DialogTitle>
              <DialogDescription>
                Choose your preferred language for verification instructions
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 pt-4">
              {availableLanguages.map((language) => 
                renderLanguageItem(language, () => {
                  setLanguage(language);
                  setIsDialogOpen(false);
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Minimal text-only variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`text-xs flex items-center gap-1 h-auto py-1 px-2 ${className}`}
        >
          <Globe className="h-3 w-3" />
          <span>{languageNames[currentLanguage]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        {prominentLanguages.map((language) => (
          <DropdownMenuItem 
            key={language}
            onClick={() => setLanguage(language)}
            className="cursor-pointer text-xs"
          >
            <div className="flex items-center justify-between w-full">
              <span>{languageNames[language]}</span>
              {language === currentLanguage && <Check className="h-3 w-3" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper function to get emoji flag for a language
function getLanguageEmoji(language: SupportedLanguage): string {
  const languageEmojis: Record<SupportedLanguage, string> = {
    en: '🇺🇸',
    es: '🇪🇸',
    fr: '🇫🇷',
    zh: '🇨🇳',
    ar: '🇸🇦',
    hi: '🇮🇳',
    ru: '🇷🇺',
    pt: '🇧🇷',
    ja: '🇯🇵',
    bn: '🇧🇩',
    sw: '🇰🇪',
    ko: '🇰🇷',
  };

  return languageEmojis[language] || '🌐';
}