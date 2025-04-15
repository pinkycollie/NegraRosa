import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Camera, Key, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NftAuth } from './NftAuth';

export interface BiometricRecoveryProps {
  onRecoverySuccess?: (data: { token: string; userId: number }) => void;
  userId?: number;
}

export function BiometricRecovery({ onRecoverySuccess, userId }: BiometricRecoveryProps) {
  const { toast } = useToast();
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [biometricData, setBiometricData] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
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
        title: 'Biometric Data Captured',
        description: 'New face scan has been successfully captured.',
        variant: 'default',
      });
    }, 2000);
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryCode.trim()) {
      setError('Please enter your recovery code');
      return;
    }
    
    if (!biometricData) {
      setError('Please capture your face scan first');
      return;
    }
    
    setError(null);
    setIsProcessing(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/recover', {
        recoveryCode,
        newBiometricData: biometricData
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Recovery Successful',
          description: 'Your account has been successfully recovered.',
          variant: 'default',
        });
        
        onRecoverySuccess({
          token: result.token,
          userId: result.userId
        });
      } else {
        setError(result.message || 'Recovery failed. Please check your recovery code and try again.');
      }
    } catch (err) {
      console.error('Recovery error:', err);
      setError('An error occurred during account recovery. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const switchToNftAuth = () => {
    setShowNftAuth(true);
  };
  
  if (showNftAuth) {
    return <NftAuth onAuthSuccess={onRecoverySuccess} />;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-6 w-6" />
          Account Recovery
        </CardTitle>
        <CardDescription>
          Recover your account using your recovery code and a new face scan
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
        
        <form onSubmit={handleRecovery}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="recovery-code">Recovery Code</Label>
              <Input 
                id="recovery-code"
                type="text"
                placeholder="Enter your recovery code"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                disabled={isProcessing}
              />
              <p className="text-sm text-muted-foreground">
                Enter the recovery code you received during account setup
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="biometric-data">Face Scan</Label>
              {showCamera ? (
                <div className="bg-muted p-4 rounded-md relative">
                  <div className="aspect-video bg-black/10 rounded-md flex items-center justify-center mb-2">
                    <Camera className="h-12 w-12 text-muted-foreground" />
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
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCamera(true)}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {biometricData ? 'Recapture Face' : 'Capture Face'}
                </Button>
              )}
              {biometricData && (
                <p className="text-sm text-green-600">
                  ✓ Face scan captured
                </p>
              )}
            </div>
            
            <Button type="submit" disabled={isProcessing || !biometricData} className="gap-2">
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Recovering...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  Recover Account
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t px-6 py-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Alternative recovery method:
          </span>
          <Button 
            variant="outline" 
            onClick={switchToNftAuth}
            className="gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5Z" stroke="currentColor" strokeWidth="2" />
              <path d="M9 8.5L11.5 6L14 8.5L16.5 6V18L14 15.5L11.5 18L9 15.5L6.5 18V6L9 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Recover with NFT
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default BiometricRecovery;