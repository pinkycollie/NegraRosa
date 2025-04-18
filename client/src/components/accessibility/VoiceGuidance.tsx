import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Volume2, VolumeX, Play, Pause, Info, HelpCircle, Mic, MicOff, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VoiceGuidanceProps {
  feature: string;
  className?: string;
  isDeaf?: boolean;
}

interface GuidanceStep {
  step: string;
  visualDescription: string;
}

export default function VoiceGuidance({ feature, className = "", isDeaf = false }: VoiceGuidanceProps) {
  const [guidanceText, setGuidanceText] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(isDeaf);
  const [visualSteps, setVisualSteps] = useState<GuidanceStep[]>([]);
  const [isVisualsLoading, setIsVisualsLoading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Fetch guidance when the component mounts or when feature/isMuted changes
  useEffect(() => {
    fetchGuidance();
  }, [feature, isMuted]);

  // Generate audio element when audio URL changes
  useEffect(() => {
    if (audioUrl && !isMuted) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    } else {
      audioRef.current = null;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl, isMuted]);

  const fetchGuidance = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "GET", 
        `/api/accessibility/guidance/${encodeURIComponent(feature)}?isDeaf=${isMuted}`
      );
      
      const data = await response.json();
      setGuidanceText(data.text);
      
      // Set audio URL only if not muted and audio is available
      if (!isMuted && data.audioUrl) {
        setAudioUrl(data.audioUrl);
      } else {
        setAudioUrl(null);
      }
    } catch (error) {
      console.error("Error fetching guidance:", error);
      toast({
        title: "Error",
        description: "Failed to fetch voice guidance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVisualGuidance = async () => {
    if (visualSteps.length > 0) return; // Don't fetch if we already have steps
    
    setIsVisualsLoading(true);
    try {
      const response = await apiRequest(
        "GET", 
        `/api/accessibility/visual-guidance/${encodeURIComponent(feature)}`
      );
      
      const data = await response.json();
      if (Array.isArray(data.steps)) {
        setVisualSteps(data.steps);
      }
    } catch (error) {
      console.error("Error fetching visual guidance:", error);
      toast({
        title: "Error",
        description: "Failed to fetch visual guidance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVisualsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Stopping audio if it's playing
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <Card className={`border-purple-800 bg-black/60 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg text-white">
              {isDeaf ? "Visual Guidance" : "Voice & Visual Guidance"}
            </CardTitle>
            <CardDescription>
              {isDeaf 
                ? "Visual explanation of security features" 
                : "Audio and visual explanations of security features"
              }
            </CardDescription>
          </div>
          
          {!isDeaf && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="mute-toggle" className="text-xs text-gray-400">
                {isMuted ? "Voice Off" : "Voice On"}
              </Label>
              <Switch
                id="mute-toggle"
                checked={!isMuted}
                onCheckedChange={() => toggleMute()}
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <Tabs defaultValue="explanation" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="explanation" className="w-1/2">
            <Info className="h-4 w-4 mr-2" />
            Explanation
          </TabsTrigger>
          <TabsTrigger value="visual-guide" className="w-1/2" onClick={fetchVisualGuidance}>
            <Eye className="h-4 w-4 mr-2" />
            Visual Guide
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="explanation">
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="h-24 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-purple-500 rounded-full border-t-transparent"></div>
              </div>
            ) : (
              <div className="text-gray-200 mb-4 min-h-[100px]">
                {guidanceText}
              </div>
            )}
          </CardContent>
          
          {!isDeaf && audioUrl && !isLoading && (
            <CardFooter className="border-t border-gray-800 pt-4">
              <div className="flex justify-between items-center w-full">
                <Badge variant="outline" className="text-purple-400 border-purple-800">
                  {isMuted ? <MicOff className="h-3 w-3 mr-1" /> : <Mic className="h-3 w-3 mr-1" />}
                  {isMuted ? "Audio Disabled" : "Audio Available"}
                </Badge>
                
                {!isMuted && (
                  <Button 
                    onClick={togglePlayPause} 
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={isLoading || isMuted}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Pause" : "Play"} Audio
                  </Button>
                )}
              </div>
            </CardFooter>
          )}
        </TabsContent>
        
        <TabsContent value="visual-guide">
          <CardContent className="pt-4">
            {isVisualsLoading ? (
              <div className="h-24 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-purple-500 rounded-full border-t-transparent"></div>
              </div>
            ) : visualSteps.length > 0 ? (
              <div className="space-y-4">
                {visualSteps.map((step, index) => (
                  <div key={index} className="border border-gray-800 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-white mb-1">Step {index + 1}: {step.step}</h4>
                    <p className="text-xs text-gray-300">{step.visualDescription}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <HelpCircle className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                <p>No visual guide available for this feature.</p>
                <p className="text-sm">Try another security feature.</p>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}