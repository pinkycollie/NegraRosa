import React, { useState } from "react";
import { Video, Camera, Fingerprint, Check, AlertCircle, RotateCcw, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/**
 * SignLanguageAuth component provides sign language and facial recognition 
 * based authentication for deaf users who may struggle with text passwords
 */
export default function SignLanguageAuth() {
  const [step, setStep] = useState<'intro' | 'camera' | 'recording' | 'processing' | 'success' | 'error'>('intro');
  const [progress, setProgress] = useState(0);
  const [videoActive, setVideoActive] = useState(false);
  
  // Simulate video processing
  const startRecording = () => {
    setStep('recording');
    setVideoActive(true);
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setStep('processing');
        setTimeout(() => {
          // Simulate successful recognition (in a real app, this would be actual verification)
          setStep('success');
        }, 2000);
      }
    }, 1000);
  };
  
  const resetAuth = () => {
    setStep('intro');
    setProgress(0);
    setVideoActive(false);
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
          <Video className="h-6 w-6 text-purple-500" />
          <h2 className="text-lg font-bold text-white">Sign Gesture Authentication</h2>
        </div>
        <span className="text-xs text-purple-400 bg-purple-950/50 py-1 px-2 rounded-full">
          No Text Needed
        </span>
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        {step === 'intro' && (
          <div className="space-y-6">
            <div className="relative h-48 bg-gray-900/50 rounded-lg border border-purple-800/40 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-purple-500/70 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Gesture authentication ready</p>
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
                    <span className="text-lg">🤟</span>
                  </div>
                  <p className="text-xs text-gray-400">Make your security gesture</p>
                </div>
                
                <div className="bg-black/30 p-2 rounded border border-purple-900/30">
                  <div className="h-12 w-12 rounded-full bg-purple-900/30 mx-auto flex items-center justify-center mb-2">
                    <span className="text-lg">👁️</span>
                  </div>
                  <p className="text-xs text-gray-400">Facial recognition confirms</p>
                </div>
                
                <div className="bg-black/30 p-2 rounded border border-purple-900/30">
                  <div className="h-12 w-12 rounded-full bg-purple-900/30 mx-auto flex items-center justify-center mb-2">
                    <span className="text-lg">✅</span>
                  </div>
                  <p className="text-xs text-gray-400">Access granted instantly</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setStep('camera')} 
              className="w-full bg-purple-700 hover:bg-purple-600"
            >
              <Video className="h-4 w-4 mr-2" />
              Start Gesture Authentication
            </Button>
          </div>
        )}
        
        {step === 'camera' && (
          <div className="space-y-6">
            <div className="relative h-64 bg-gray-900/50 rounded-lg border border-purple-800/40 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full border-4 border-dashed border-purple-500/50 animate-spin-slow mx-auto mb-3 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-purple-400" />
                  </div>
                  <p className="text-gray-300">Camera initializing...</p>
                  <p className="text-xs text-gray-500 mt-2">Please allow camera access</p>
                </div>
              </div>
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="h-3 w-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-purple-300">Camera preparing</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 text-center">
              Position yourself in frame and prepare to make your security gesture
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={startRecording} 
                className="flex-1 bg-green-700 hover:bg-green-600"
              >
                <Play className="h-4 w-4 mr-2" />
                Start
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
        
        {step === 'recording' && (
          <div className="space-y-6">
            <div className="relative h-64 bg-gray-900/50 rounded-lg border border-purple-800/40 overflow-hidden">
              {/* Simulated video feed */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center relative">
                  <div className="h-full w-full absolute inset-0 -z-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20"></div>
                  </div>
                  
                  <div className="rounded-full h-24 w-24 border-2 border-red-500 flex items-center justify-center mx-auto mb-3 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-50 animate-ping"></div>
                    <span className="text-4xl">🤟</span>
                  </div>
                  
                  <p className="text-white text-sm mt-2">Make your security gesture now</p>
                </div>
              </div>
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-300">Recording...</span>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                  <span>Gesture recognition progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1 bg-gray-700" />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setVideoActive(false);
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
                  <p className="text-gray-300">Processing gesture...</p>
                  <p className="text-xs text-gray-500 mt-2">Matching with your security gesture</p>
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
                  <p className="text-gray-400 text-sm mt-2">Security gesture recognized</p>
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
                  <p className="text-gray-400 text-sm mt-2">Security gesture not recognized</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-900/20 rounded-lg p-4 border border-red-700/40">
              <p className="text-sm text-red-300 text-center mb-3">
                Your gesture could not be verified
              </p>
              
              <div className="flex justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                  <span>Try a clearer gesture</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                  <span>Better lighting</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setStep('camera')} 
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
      
      {/* Help section */}
      <div className="mt-6 pt-3 border-t border-purple-800/30 relative z-10">
        <div className="flex justify-between items-center">
          <span className="text-xs text-purple-400">Need help?</span>
          <span className="text-xs text-purple-400 flex items-center cursor-pointer">
            <span className="text-lg mr-1">🤟</span>
            <span>Video Support</span>
          </span>
        </div>
      </div>
    </div>
  );
}