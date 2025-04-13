import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NftAuthProps {
  onAuthSuccess: (data: { token: string; userId: number }) => void;
}

export function NftAuth({ onAuthSuccess }: NftAuthProps) {
  const { toast } = useToast();
  const [nftToken, setNftToken] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nftToken.trim()) {
      setError('Please enter your NFT token ID');
      return;
    }
    
    setError(null);
    setIsAuthenticating(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/nft', {
        nftToken
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'NFT Authentication Successful',
          description: 'Your "I AM WHO I AM" NFT identity has been verified.',
          variant: 'default',
        });
        
        onAuthSuccess({
          token: result.token,
          userId: result.userId
        });
      } else {
        setError(result.message || 'NFT verification failed. Please check your token and try again.');
      }
    } catch (err) {
      console.error('NFT authentication error:', err);
      setError('An error occurred during NFT authentication. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M9 8.5L11.5 6L14 8.5L16.5 6V18L14 15.5L11.5 18L9 15.5L6.5 18V6L9 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          NFT Authentication
        </CardTitle>
        <CardDescription>
          Authenticate with your "I AM WHO I AM" NFT identity token
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
        
        <form onSubmit={handleAuthenticate}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nft-token">NFT Token ID</Label>
              <Input 
                id="nft-token"
                type="text"
                placeholder="Enter your NFT token ID"
                value={nftToken}
                onChange={(e) => setNftToken(e.target.value)}
                disabled={isAuthenticating}
              />
              <p className="text-sm text-muted-foreground">
                Enter the token ID of your "I AM WHO I AM" NFT identity card
              </p>
            </div>
            
            <div className="bg-muted p-4 rounded-md mb-4">
              <h3 className="font-medium text-sm mb-2">What is an "I AM WHO I AM" NFT?</h3>
              <p className="text-xs text-muted-foreground">
                The "I AM WHO I AM" NFT is a portable digital identity token that securely stores your verified identity information. It allows you to maintain ownership of your identity data while authenticating across services.
              </p>
              <div className="mt-2 p-2 bg-background rounded border">
                <p className="text-xs text-center text-muted-foreground">For demo purposes, use: <span className="font-mono font-medium">test-nft-token</span></p>
              </div>
            </div>
            
            <Button type="submit" disabled={isAuthenticating} className="gap-2">
              {isAuthenticating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M9 8.5L11.5 6L14 8.5L16.5 6V18L14 15.5L11.5 18L9 15.5L6.5 18V6L9 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Authenticate with NFT
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t px-6 py-4">
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground mb-2">
            NFT-based authentication provides:
          </span>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center">
              <svg className="h-3 w-3 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Portable identity across platforms
            </li>
            <li className="flex items-center">
              <svg className="h-3 w-3 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Self-sovereign identity control
            </li>
            <li className="flex items-center">
              <svg className="h-3 w-3 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Enhanced security & privacy
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
}

export default NftAuth;