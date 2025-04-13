import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Camera, Check, FingerprintIcon, RefreshCw, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BiometricAuthProps {
  onAuthSuccess?: (data: { token: string; userId: number }) => void;
  mode: 'register' | 'login' | 'recover';
}

export function BiometricAuth({ onAuthSuccess, mode }: BiometricAuthProps) {
  const { toast } = useToast();
  const [capturing, setCapturing] = useState(false);
  const [faceData, setFaceData] = useState<string | null>(null);
  const [processingAuth, setProcessingAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 } 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setCapturing(true);
    } catch (err) {
      setError("Unable to access camera. Please ensure you've granted camera permissions.");
      console.error("Camera access error:", err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCapturing(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture face data
  const captureFace = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get base64 representation of the image
    const imageData = canvas.toDataURL('image/jpeg');
    setFaceData(imageData);
    
    // Stop camera after capture
    stopCamera();
  };

  // Process authentication
  const processAuth = async () => {
    if (!faceData) {
      setError("Face data is required for authentication.");
      return;
    }
    
    setProcessingAuth(true);
    setError(null);
    
    try {
      let endpoint = '/api/auth/biometric';
      let payload = { faceData };
      
      if (mode === 'register') {
        endpoint = '/api/auth/register/biometric';
        // For registration we'd need additional user data
        // This is simplified - in a real app you'd collect more info
        payload = { 
          ...payload, 
          username: 'user_' + Date.now(), // Generate a unique username 
          email: `user_${Date.now()}@example.com`, // This should be collected from the user
          password: Math.random().toString(36).slice(2) // Generate a random password
        };
      } else if (mode === 'recover') {
        endpoint = '/api/auth/recover/biometric';
      }
      
      const response = await apiRequest('POST', endpoint, payload);
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Authentication Successful",
          description: "Your face has been verified.",
          variant: "default",
        });
        
        if (onAuthSuccess) {
          onAuthSuccess({
            token: result.token,
            userId: result.userId
          });
        }
      } else {
        setError(result.message || "Authentication failed.");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError("An error occurred during authentication. Please try again.");
    } finally {
      setProcessingAuth(false);
    }
  };

  // Reset the process
  const resetProcess = () => {
    setFaceData(null);
    setError(null);
    setCapturing(false);
  };
  
  let title = "Facial Recognition Login";
  let description = "Look directly at the camera for authentication";
  
  if (mode === 'register') {
    title = "Register Your Face";
    description = "We'll use your face for secure authentication";
  } else if (mode === 'recover') {
    title = "Account Recovery";
    description = "Verify your identity with facial recognition";
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FingerprintIcon className="h-6 w-6" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="relative aspect-video bg-muted rounded-md overflow-hidden mb-4">
          {capturing ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : faceData ? (
            <div className="relative w-full h-full">
              <img 
                src={faceData} 
                alt="Captured face" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Check className="h-16 w-16 text-green-500" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Camera className="h-12 w-12 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Camera will appear here</p>
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="flex flex-col gap-2">
          {!capturing && !faceData && (
            <Button onClick={startCamera} className="gap-2">
              <Camera className="h-4 w-4" />
              Start Camera
            </Button>
          )}
          
          {capturing && (
            <Button onClick={captureFace} className="gap-2">
              <Camera className="h-4 w-4" />
              Capture
            </Button>
          )}
          
          {faceData && (
            <Button 
              onClick={processAuth} 
              disabled={processingAuth}
              variant="default"
              className="gap-2"
            >
              {processingAuth ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  {mode === 'register' ? 'Complete Registration' : 'Authenticate'}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetProcess}>
          Reset
        </Button>
        
        <div className="text-xs text-muted-foreground">
          I AM WHO I AM | Biometric Authentication
        </div>
      </CardFooter>
    </Card>
  );
}

export default BiometricAuth;