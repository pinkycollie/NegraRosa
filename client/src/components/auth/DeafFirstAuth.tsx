import { useState } from "react";
import { 
  Video, 
  Mic, 
  Fingerprint, 
  Smartphone, 
  Check, 
  AlertCircle, 
  RotateCcw, 
  Play, 
  Pause,
  HandMetal,
  Eye,
  Vibrate,
  Shuffle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * DeafFirstAuth component provides multiple authentication methods
 * specifically designed for deaf users, including gesture, voice pattern,
 * and visual/tactile options
 */
export default function DeafFirstAuth() {
  const [authMethod, setAuthMethod] = useState<'gesture' | 'voice' | 'visual' | 'tactile'>('gesture');
  const [step, setStep] = useState<'intro' | 'setup' | 'recording' | 'processing' | 'success' | 'error'>('intro');
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  
  // Simulate authentication process
  const startAuthentication = () => {
    setStep('recording');
    setActive(true);
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setStep('processing');
        setTimeout(() => {
          // Simulate successful authentication (in a real app, this would be actual verification)
          setStep('success');
        }, 2000);
      }
    }, 1000);
  };
  
  const resetAuth = () => {
    setStep('intro');
    setProgress(0);
    setActive(false);
  };

  // Get the proper auth icon based on selected method
  const getAuthIcon = () => {
    switch(authMethod) {
      case 'gesture': return <HandMetal className="h-6 w-6 text-purple-500" />;
      case 'voice': return <Mic className="h-6 w-6 text-blue-500" />;
      case 'visual': return <Eye className="h-6 w-6 text-green-500" />;
      case 'tactile': return <Vibrate className="h-6 w-6 text-amber-500" />;
      default: return <Fingerprint className="h-6 w-6 text-purple-500" />;
    }
  };
  
  // Get the proper header text based on selected method
  const getAuthTitle = () => {
    switch(authMethod) {
      case 'gesture': return "Gesture Authentication";
      case 'voice': return "Voice Pattern Authentication";
      case 'visual': return "Visual Pattern Authentication";
      case 'tactile': return "Tactile Pattern Authentication";
      default: return "Deaf-First Authentication";
    }
  };
  
  // Get the proper icon for the auth module
  const getAuthEmoji = () => {
    switch(authMethod) {
      case 'gesture': return "🤟";
      case 'voice': return "🔊";
      case 'visual': return "👁️";
      case 'tactile': return "👆";
      default: return "🔐";
    }
  };
  
  // Get method-specific instruction text
  const getAuthInstructions = () => {
    switch(authMethod) {
      case 'gesture': return "Make your security gesture to authenticate";
      case 'voice': return "Speak your passphrase - pattern recognition works even if deaf accent";
      case 'visual': return "Follow the visual pattern with your eyes";
      case 'tactile': return "Tap your unique pattern on the screen";
      default: return "Authenticate using your preferred method";
    }
  };

  return (
    <div className="border-2 border-purple-700 rounded-lg bg-black p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-800/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-800/20 rounded-full blur-2xl"></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 mb-4 pb-3 border-b border-purple-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getAuthIcon()}
          <h2 className="text-lg font-bold text-white">{getAuthTitle()}</h2>
        </div>
        <span className="text-xs text-purple-400 bg-purple-950/50 py-1 px-2 rounded-full">
          Deaf-First Security
        </span>
      </div>
      
      {/* Method selection */}
      <div className="relative z-10 mb-6">
        <Tabs defaultValue="gesture" className="w-full" onValueChange={(value) => setAuthMethod(value as any)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="gesture" className="text-xs">
              <HandMetal className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Gesture</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs">
              <Mic className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Voice Pattern</span>
            </TabsTrigger>
            <TabsTrigger value="visual" className="text-xs">
              <Eye className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Visual Pattern</span>
            </TabsTrigger>
            <TabsTrigger value="tactile" className="text-xs">
              <Vibrate className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Tactile Pattern</span>
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="gesture" className="p-0">
            <div className="text-xs text-gray-400">
              <p>Authenticate with your personal security gesture</p>
            </div>
          </TabsContent>
          
          <TabsContent value="voice" className="p-0">
            <div className="text-xs text-gray-400">
              <p>Uses voice pattern recognition - works with deaf speech patterns</p>
            </div>
          </TabsContent>
          
          <TabsContent value="visual" className="p-0">
            <div className="text-xs text-gray-400">
              <p>Track specific patterns with eye movements</p>
            </div>
          </TabsContent>
          
          <TabsContent value="tactile" className="p-0">
            <div className="text-xs text-gray-400">
              <p>Create tactile pattern authentication through touch/vibration</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        {step === 'intro' && (
          <div className="space-y-6">
            <div className="relative h-48 bg-gray-900/50 rounded-lg border border-purple-800/40 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {getAuthIcon()}
                  <p className="text-gray-400 text-sm mt-3">{getAuthTitle()} ready</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/40">
              <h3 className="text-purple-300 text-sm font-medium mb-2 flex items-center">
                <Fingerprint className="h-4 w-4 mr-2" />
                How It Works
              </h3>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-black/30 p-2 rounded border border-purple-900/30">
                  <div className="h-12 w-12 rounded-full bg-purple-900/30 mx-auto flex items-center justify-center mb-2">
                    <span className="text-lg">{getAuthEmoji()}</span>
                  </div>
                  <p className="text-xs text-gray-400">Set up your auth pattern</p>
                </div>
                
                <div className="bg-black/30 p-2 rounded border border-purple-900/30">
                  <div className="h-12 w-12 rounded-full bg-purple-900/30 mx-auto flex items-center justify-center mb-2">
                    <span className="text-lg">👤</span>
                  </div>
                  <p className="text-xs text-gray-400">System recognizes you</p>
                </div>
                
                <div className="bg-black/30 p-2 rounded border border-purple-900/30">
                  <div className="h-12 w-12 rounded-full bg-purple-900/30 mx-auto flex items-center justify-center mb-2">
                    <span className="text-lg">✅</span>
                  </div>
                  <p className="text-xs text-gray-400">Secure access granted</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setStep('setup')} 
              className="w-full bg-purple-700 hover:bg-purple-600"
            >
              <Fingerprint className="h-4 w-4 mr-2" />
              Start Authentication
            </Button>
          </div>
        )}
        
        {step === 'setup' && (
          <div className="space-y-6">
            <div className="relative h-64 bg-gray-900/50 rounded-lg border border-purple-800/40 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full border-4 border-dashed border-purple-500/50 animate-spin-slow mx-auto mb-3 flex items-center justify-center">
                    {authMethod === 'gesture' && <HandMetal className="h-8 w-8 text-purple-400" />}
                    {authMethod === 'voice' && <Mic className="h-8 w-8 text-blue-400" />}
                    {authMethod === 'visual' && <Eye className="h-8 w-8 text-green-400" />}
                    {authMethod === 'tactile' && <Vibrate className="h-8 w-8 text-amber-400" />}
                  </div>
                  <p className="text-gray-300">Initializing {authMethod} authentication...</p>
                  <p className="text-xs text-gray-500 mt-2">Please wait while we prepare</p>
                </div>
              </div>
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="h-3 w-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-purple-300">System preparing</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 text-center">
              {getAuthInstructions()}
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={startAuthentication} 
                className="flex-1 bg-green-700 hover:bg-green-600"
              >
                <Play className="h-4 w-4 mr-2" />
                Begin
              </Button>
              
              <Button 
                onClick={resetAuth} 
                variant="outline" 
                className="flex-1 border-gray-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {step === 'recording' && (
          <div className="space-y-6">
            <div className="relative h-64 bg-gray-900/50 rounded-lg border border-purple-800/40 overflow-hidden">
              {/* Auth type specific visuals */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center relative">
                  <div className="h-full w-full absolute inset-0 -z-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20"></div>
                  </div>
                  
                  {/* Gesture specific */}
                  {authMethod === 'gesture' && (
                    <div className="rounded-full h-24 w-24 border-2 border-red-500 flex items-center justify-center mx-auto mb-3 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-50 animate-ping"></div>
                      <span className="text-4xl">🤟</span>
                    </div>
                  )}
                  
                  {/* Voice pattern specific */}
                  {authMethod === 'voice' && (
                    <div className="rounded-full h-24 w-24 border-2 border-blue-500 flex items-center justify-center mx-auto mb-3 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-50 animate-ping"></div>
                      <Mic className="h-12 w-12 text-blue-400" />
                      
                      {/* Voice waveform visualization */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-40 h-8 flex items-center justify-center gap-1">
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i}
                            className="w-1 bg-blue-500 rounded-full"
                            style={{ 
                              height: `${Math.sin(Date.now()/200 + i) * 10 + 15}px`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Visual pattern specific */}
                  {authMethod === 'visual' && (
                    <div className="rounded-full h-24 w-24 border-2 border-green-500 flex items-center justify-center mx-auto mb-3 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-green-500 opacity-50 animate-ping"></div>
                      <Eye className="h-12 w-12 text-green-400" />
                      
                      {/* Moving dot to track */}
                      <div 
                        className="absolute h-4 w-4 bg-green-500 rounded-full"
                        style={{
                          left: `${Math.sin(Date.now()/1000) * 45 + 50}%`,
                          top: `${Math.cos(Date.now()/1000) * 45 + 50}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      ></div>
                    </div>
                  )}
                  
                  {/* Tactile pattern specific */}
                  {authMethod === 'tactile' && (
                    <div className="rounded-full h-24 w-24 border-2 border-amber-500 flex items-center justify-center mx-auto mb-3 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-amber-500 opacity-50 animate-ping"></div>
                      <Vibrate className="h-12 w-12 text-amber-400" />
                      
                      {/* Tactile pattern grid */}
                      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 grid grid-cols-3 gap-2">
                        {[...Array(9)].map((_, i) => (
                          <div 
                            key={i}
                            className={`h-5 w-5 rounded-md border border-amber-500 ${i === Math.floor((Date.now() / 500) % 9) ? 'bg-amber-500/50' : 'bg-transparent'}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-white text-sm mt-8">
                    {authMethod === 'gesture' && "Perform your security gesture now"}
                    {authMethod === 'voice' && "Speak your passphrase now"}
                    {authMethod === 'visual' && "Follow the moving dot with your eyes"}
                    {authMethod === 'tactile' && "Tap the highlighted sequence"}
                  </p>
                </div>
              </div>
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-300">Recording...</span>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                  <span>{authMethod.charAt(0).toUpperCase() + authMethod.slice(1)} recognition progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1 bg-gray-700" />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setActive(false);
                  setStep('intro');
                  setProgress(0);
                }} 
                className="flex-1 bg-red-700 hover:bg-red-600"
              >
                <Pause className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {step === 'processing' && (
          <div className="space-y-6">
            <div className="relative h-64 bg-gray-900/50 rounded-lg border border-purple-800/40 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-20 w-20 border-4 border-t-transparent border-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-300">Processing {authMethod} input...</p>
                  <p className="text-xs text-gray-500 mt-2">Matching with your security pattern</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 'success' && (
          <div className="space-y-6">
            <div className="relative h-64 bg-green-900/20 rounded-lg border border-green-700/40 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-green-900/30 border-2 border-green-500 flex items-center justify-center mx-auto mb-3">
                    <Check className="h-10 w-10 text-green-400" />
                  </div>
                  <p className="text-green-300 font-medium text-lg">Authentication Successful</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {authMethod === 'gesture' && "Security gesture recognized"}
                    {authMethod === 'voice' && "Voice pattern verified"}
                    {authMethod === 'visual' && "Visual pattern matched"}
                    {authMethod === 'tactile' && "Tactile pattern confirmed"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/40 text-center">
              <p className="text-sm text-green-300">
                You are being securely signed in...
              </p>
            </div>
            
            <Button 
              onClick={resetAuth} 
              variant="outline" 
              className="w-full border-gray-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Demo
            </Button>
          </div>
        )}
        
        {step === 'error' && (
          <div className="space-y-6">
            <div className="relative h-64 bg-red-900/20 rounded-lg border border-red-700/40 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-red-900/30 border-2 border-red-500 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="h-10 w-10 text-red-400" />
                  </div>
                  <p className="text-red-300 font-medium text-lg">Authentication Failed</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {authMethod === 'gesture' && "Security gesture not recognized"}
                    {authMethod === 'voice' && "Voice pattern not verified"}
                    {authMethod === 'visual' && "Visual pattern not matched"}
                    {authMethod === 'tactile' && "Tactile pattern not confirmed"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-900/20 rounded-lg p-4 border border-red-700/40">
              <p className="text-sm text-red-300 text-center mb-3">
                Authentication failed. Please try again.
              </p>
              
              <div className="flex justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                  <span>Try again more clearly</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                  <span>Better lighting/environment</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setStep('setup')} 
                className="flex-1 bg-purple-700 hover:bg-purple-600"
              >
                <Play className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={resetAuth} 
                variant="outline" 
                className="flex-1 border-gray-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Security Information */}
      <div className="mt-6 mb-3 pt-3 border-t border-purple-800/30 relative z-10">
        <div className="bg-black/50 rounded-lg border border-purple-800/30 p-3">
          <h4 className="text-sm font-medium text-purple-400 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Secure Backend Storage
          </h4>
          
          <div className="text-xs text-gray-300">
            <p className="mb-2">All uploaded videos and visual documentation are encrypted with AES-256 and stored in isolated secure containers. Your visual identity data is protected by:</p>
            
            <ul className="space-y-1 pl-4 list-disc mb-2">
              <li>End-to-end encryption for all transmission</li>
              <li>Biometric-based access controls on the server side</li>
              <li>Zero-knowledge storage architecture with sharded keys</li>
              <li>Automatic purging of verification attempts after processing</li>
            </ul>
            
            <p>Data is stored in compliance with SOC 2 Type II standards and handled in dedicated secure enclaves with hardware-level isolation from other systems.</p>
            
            <div className="mt-3 flex justify-end">
              <Button 
                variant="link" 
                size="sm" 
                className="h-6 p-0 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                onClick={() => window.open('/security-transparency', '_blank')}
              >
                Learn More
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 7h10v10"></path>
                  <path d="M7 17 17 7"></path>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help section */}
      <div className="pt-3 border-t border-purple-800/30 relative z-10">
        <div className="flex justify-between items-center">
          <span className="text-xs text-purple-400">Need help?</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div 
                className="h-7 w-7 rounded-full bg-purple-900/50 border border-purple-600 flex items-center justify-center cursor-pointer hover:bg-purple-800/50 transition-colors"
                title="ASL Connect"
                onClick={() => window.open('/asl-connect', '_blank')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                  <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/>
                  <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
                </svg>
              </div>
              
              <div 
                className="h-7 w-7 rounded-full bg-purple-900/50 border border-purple-600 flex items-center justify-center cursor-pointer hover:bg-purple-800/50 transition-colors"
                title="Q&A Support"
                onClick={() => window.open('/support', '_blank')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <path d="M12 17h.01"/>
                </svg>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1 border-purple-800/50">
              <Shuffle className="h-3 w-3" />
              <span>Switch Method</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}