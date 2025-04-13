import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Camera, Key, RefreshCw, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NftAuth } from './NftAuth';

export interface BiometricAuthProps {
  onAuthSuccess: (data: { token: string; userId: number }) => void;
  onSwitchToRecovery: () => void;
}

export function BiometricAuth({ onAuthSuccess, onSwitchToRecovery }: BiometricAuthProps) {
  const { toast } = useToast();
  const [biometricData, setBiometricData] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showNftAuth, setShowNftAuth] = useState<boolean>(false);
  
  const handleCapture = () => {
    // In a real implementation, this would access the device camera
    // and capture biometric data (face scan)
    setIsCapturing(true);
    
    // Simulate capture delay
    setTimeout(() => {
      // This would be actual biometric data in production
      setBiometricData(`biometric_data_${Date.now()}`);
      setIsCapturing(false);
      setShowCamera(false);
      
      toast({
        title: 'Face Captured',
        description: 'Your face has been captured for authentication.',
        variant: 'default',
      });
    }, 2000);
  };

  const handleAuthenticate = async () => {
    if (!biometricData) {
      setError('Please capture your face first');
      return;
    }
    
    setError(null);
    setIsAuthenticating(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/biometric', {
        faceData: biometricData
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Authentication Successful',
          description: 'Your identity has been verified.',
          variant: 'default',
        });
        
        onAuthSuccess({
          token: result.token,
          userId: result.userId
        });
      } else {
        setError(result.message || 'Authentication failed. Please try again or use a different method.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const switchToNftAuth = () => {
    setShowNftAuth(true);
  };
  
  if (showNftAuth) {
    return <NftAuth onAuthSuccess={onAuthSuccess} />;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Face Authentication
        </CardTitle>
        <CardDescription>
          Authenticate with your face using secure biometric verification
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6">
          {showCamera ? (
            <div className="bg-muted p-4 rounded-md relative">
              <div className="aspect-video bg-black/10 rounded-md flex items-center justify-center mb-2 border-2 border-dashed border-muted-foreground/50">
                <Camera className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="text-center text-sm text-muted-foreground mb-4">
                <p>Position your face in the center of the frame</p>
                <p>Make sure your face is well-lit and clearly visible</p>
              </div>
              <Button 
                type="button" 
                onClick={handleCapture}
                disabled={isCapturing}
                className="w-full"
              >
                {isCapturing ? 'Capturing...' : 'Capture Face'}
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-muted inline-flex items-center justify-center rounded-full p-3 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-1">Face Captured</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your face has been successfully captured and is ready for authentication
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCamera(true)}
                  disabled={isAuthenticating}
                  className="flex-1"
                >
                  Recapture
                </Button>
                <Button 
                  onClick={handleAuthenticate}
                  disabled={isAuthenticating}
                  className="flex-1"
                >
                  {isAuthenticating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Authenticating...
                    </>
                  ) : 'Authenticate'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4 border-t px-6 py-4">
        <Button 
          variant="outline" 
          onClick={switchToNftAuth}
          disabled={isAuthenticating}
          className="w-full gap-2"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5Z" stroke="currentColor" strokeWidth="2" />
            <path d="M9 8.5L11.5 6L14 8.5L16.5 6V18L14 15.5L11.5 18L9 15.5L6.5 18V6L9 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Use NFT Authentication
        </Button>
        
        <div className="w-full flex justify-center">
          <button 
            onClick={onSwitchToRecovery}
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <Key className="h-3 w-3" />
            Can't access your account? Recover here
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default BiometricAuth;