import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Key, Lock, Fingerprint, Scan, ThumbsUp, Eye, EyeOff } from "lucide-react";
import VoiceGuidance from "./VoiceGuidance";

// Security features for demonstration
const securityFeatures = [
  {
    id: "multi-factor-authentication",
    name: "Multi-Factor Authentication",
    description: "Add an extra layer of security to your account",
    icon: <Key className="h-5 w-5" />,
  },
  {
    id: "biometric-verification",
    name: "Biometric Verification",
    description: "Use your unique biological traits to verify your identity",
    icon: <Fingerprint className="h-5 w-5" />,
  },
  {
    id: "encryption",
    name: "End-to-End Encryption",
    description: "Secure your data with advanced encryption",
    icon: <Lock className="h-5 w-5" />,
  },
  {
    id: "vulnerability-scanning",
    name: "Vulnerability Scanning",
    description: "Detect security vulnerabilities in your system",
    icon: <Scan className="h-5 w-5" />,
  },
  {
    id: "security-badges",
    name: "Security Badges",
    description: "Earn badges by completing security-related activities",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: "secure-payments",
    name: "Secure Payments",
    description: "Protect your financial transactions",
    icon: <ThumbsUp className="h-5 w-5" />,
  }
];

export default function AccessibilityDemo() {
  const [selectedFeature, setSelectedFeature] = useState(securityFeatures[0]);
  const [isDeafMode, setIsDeafMode] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-purple-800 bg-black/60">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Eye className="h-6 w-6 text-purple-400 mr-2" />
                Accessibility Voice Guidance
              </CardTitle>
              <CardDescription>
                Explore security features with audio and visual guidance
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="deaf-mode-toggle" className="text-sm text-gray-400">
                Deaf User Mode
              </Label>
              <Switch
                id="deaf-mode-toggle"
                checked={isDeafMode}
                onCheckedChange={setIsDeafMode}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Select a Security Feature</h3>
              
              <div className="space-y-2">
                {securityFeatures.map((feature) => (
                  <Button
                    key={feature.id}
                    variant={selectedFeature.id === feature.id ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => setSelectedFeature(feature)}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full ${selectedFeature.id === feature.id ? 'bg-primary/20' : 'bg-gray-800'} mr-3`}>
                        {feature.icon}
                      </div>
                      <div>
                        <div className="font-medium">{feature.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{feature.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="rounded-lg border border-gray-800 p-4 bg-gray-900/30 mb-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-primary/20 rounded-full mr-3">
                    {selectedFeature.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white">{selectedFeature.name}</h2>
                    <p className="text-sm text-gray-400">{selectedFeature.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400 border-t border-gray-800 pt-4">
                  <div className="flex items-center">
                    {isDeafMode ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1 text-yellow-500" />
                        <span>Audio guidance disabled for deaf users</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1 text-green-500" />
                        <span>Audio and visual guidance available</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <VoiceGuidance 
                feature={selectedFeature.id}
                isDeaf={isDeafMode}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}