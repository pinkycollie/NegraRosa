import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MicOff, Volume2, Languages, RefreshCw, CheckCircle, Clipboard, Send, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RealTimeTranslationProps {
  userId?: number;
  defaultSourceLanguage?: string;
  defaultTargetLanguage?: string;
  integrationEndpoint?: string;
  onTranslationComplete?: (text: string, language: string) => void;
}

interface LanguageOption {
  code: string;
  name: string;
  native: string;
}

export function RealTimeTranslation({
  userId,
  defaultSourceLanguage = "en",
  defaultTargetLanguage = "es",
  integrationEndpoint,
  onTranslationComplete
}: RealTimeTranslationProps) {
  const { toast } = useToast();
  const [sourceLanguage, setSourceLanguage] = useState<string>(defaultSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState<string>(defaultTargetLanguage);
  const [sourceText, setSourceText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [lastTranslations, setLastTranslations] = useState<{source: string, translated: string, language: string}[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const synth = useRef<SpeechSynthesis | null>(null);
  
  // Language options
  const languageOptions: LanguageOption[] = [
    { code: "en", name: "English", native: "English" },
    { code: "es", name: "Spanish", native: "Español" },
    { code: "fr", name: "French", native: "Français" },
    { code: "zh", name: "Chinese (Simplified)", native: "简体中文" },
    { code: "ar", name: "Arabic", native: "العربية" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
    { code: "bn", name: "Bengali", native: "বাংলা" },
    { code: "ru", name: "Russian", native: "Русский" },
    { code: "pt", name: "Portuguese", native: "Português" },
    { code: "ja", name: "Japanese", native: "日本語" },
    { code: "sw", name: "Swahili", native: "Kiswahili" },
    { code: "ko", name: "Korean", native: "한국어" },
  ];

  // Initialize speech recognition and synthesis on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Web Speech API if available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        speechRecognitionRef.current = new SpeechRecognition();
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;
        speechRecognitionRef.current.lang = sourceLanguage;
        
        speechRecognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          
          setSourceText(transcript);
        };
        
        speechRecognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };
      }
      
      // Initialize speech synthesis
      synth.current = window.speechSynthesis;
    }
    
    return () => {
      // Cleanup
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      if (synth.current) {
        synth.current.cancel();
      }
    };
  }, []);
  
  // Update speech recognition language when source language changes
  useEffect(() => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.lang = sourceLanguage;
    }
  }, [sourceLanguage]);
  
  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (!speechRecognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }
    
    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      speechRecognitionRef.current.start();
      setIsListening(true);
    }
  };
  
  // Simulate translation with n8n integration
  const translateText = async () => {
    if (!sourceText.trim()) return;
    
    setIsLoading(true);
    
    try {
      // In a real app, this would call your n8n workflow endpoint
      if (integrationEndpoint) {
        const response = await fetch(integrationEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: sourceText,
            sourceLanguage,
            targetLanguage,
            userId
          }),
        });
        
        const data = await response.json();
        setTranslatedText(data.translatedText);
      } else {
        // Simulate translation for demonstration purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
        const simulatedTranslation = `[${getLanguageName(targetLanguage)} Translation] ${sourceText}`;
        setTranslatedText(simulatedTranslation);
      }
      
      // Add to history
      setLastTranslations(prev => [
        { 
          source: sourceText, 
          translated: translatedText, 
          language: getLanguageName(targetLanguage) 
        },
        ...prev.slice(0, 4) // Keep only last 5
      ]);
      
      // Callback if provided
      if (onTranslationComplete) {
        onTranslationComplete(translatedText, targetLanguage);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: "There was an error translating your text.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Speak translated text
  const speakTranslatedText = () => {
    if (!synth.current || !translatedText) return;
    
    // Stop any ongoing speech
    synth.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLanguage;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synth.current.speak(utterance);
  };
  
  // Copy translated text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    toast({
      title: "Copied to Clipboard",
      description: "The translated text has been copied to your clipboard.",
    });
  };
  
  // Helper function to get language name from code
  const getLanguageName = (code: string): string => {
    const language = languageOptions.find(lang => lang.code === code);
    return language ? language.name : code;
  };
  
  // Swap languages
  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Real-Time Translation
        </CardTitle>
        <CardDescription>
          Translate text and speech across multiple languages for inclusive communication
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="translate">
        <TabsList className="mx-6 mb-2">
          <TabsTrigger value="translate">Translate</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <CardContent>
          <TabsContent value="translate" className="space-y-4 mt-0">
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-2">
                <Label htmlFor="source-language">Source Language</Label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger id="source-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name} ({lang.native})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end justify-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={swapLanguages}
                  className="mb-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="target-language">Target Language</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger id="target-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name} ({lang.native})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="source-text">Text to Translate</Label>
                <Button 
                  variant={isListening ? "destructive" : "outline"} 
                  size="sm"
                  onClick={toggleSpeechRecognition}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 mr-1" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-1" />
                      Voice Input
                    </>
                  )}
                </Button>
              </div>
              <textarea
                id="source-text"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={translateText}
                disabled={isLoading || !sourceText.trim()}
                className="px-8"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Languages className="h-4 w-4 mr-2" />
                    Translate
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="translated-text">
                  Translation ({getLanguageName(targetLanguage)})
                </Label>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={speakTranslatedText}
                    disabled={!translatedText || isSpeaking}
                  >
                    <Volume2 className="h-4 w-4 mr-1" />
                    {isSpeaking ? 'Speaking...' : 'Speak'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!translatedText}
                  >
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              <div 
                id="translated-text"
                className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-md"
              >
                {translatedText || (
                  <span className="text-muted-foreground text-sm">
                    Translation will appear here
                  </span>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            {lastTranslations.length > 0 ? (
              <div className="space-y-4">
                {lastTranslations.map((item, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/30 p-3 flex justify-between items-center">
                      <Badge variant="outline">
                        {item.language}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Send className="h-3 w-3 mr-1" /> Share
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Clipboard className="h-3 w-3 mr-1" /> Copy
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="text-xs text-muted-foreground">Original:</div>
                      <div className="text-sm">{item.source}</div>
                      <div className="text-xs text-muted-foreground mt-2">Translated:</div>
                      <div className="text-sm font-medium">{item.translated}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No translation history yet. Translate some text to see it here.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0 space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="translation-service">Translation Service</Label>
                <Select defaultValue="n8n">
                  <SelectTrigger id="translation-service">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="n8n">n8n Workflow (Default)</SelectItem>
                    <SelectItem value="google">Google Translate API</SelectItem>
                    <SelectItem value="microsoft">Microsoft Translator API</SelectItem>
                    <SelectItem value="deepl">DeepL API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="translation-quality">Translation Quality</Label>
                <Select defaultValue="standard">
                  <SelectTrigger id="translation-quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Faster)</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="professional">Professional (Higher Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="api-endpoint">n8n Workflow Endpoint</Label>
                <Input 
                  id="api-endpoint"
                  value={integrationEndpoint || ""}
                  placeholder="https://n8n.yourwebsite.com/webhook/translation"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the webhook URL for your n8n translation workflow
                </p>
              </div>
              
              <div>
                <Label className="flex items-center justify-between">
                  <span>Speech Recognition Settings</span>
                  <Button variant="link" size="sm" className="h-auto p-0">Configure</Button>
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="border p-2 rounded-md flex items-center justify-between">
                    <span className="text-sm">Continuous Recognition</span>
                    <input type="checkbox" className="rounded" defaultChecked={true} />
                  </div>
                  <div className="border p-2 rounded-md flex items-center justify-between">
                    <span className="text-sm">Auto-Translate</span>
                    <input type="checkbox" className="rounded" defaultChecked={false} />
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mt-6">
                <h3 className="flex items-center text-sm font-medium">
                  <CheckCircle className="h-4 w-4 text-primary mr-2" />
                  Translation Data Privacy
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  Your translations are processed securely using your chosen n8n workflow.
                  No data is stored unless you explicitly save it to your translation history.
                </p>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="border-t px-6 py-4 flex justify-between">
        <div className="text-xs text-muted-foreground">
          Powered by n8n Workflow Automation
        </div>
        <Button variant="link" size="sm" className="h-5 p-0">
          Integration Help
        </Button>
      </CardFooter>
    </Card>
  );
}