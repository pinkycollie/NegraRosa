import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Key, RefreshCw, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NftAuthProps {
  onAuthSuccess: (data: { token: string; userId: number }) => void;
}

export function NftAuth({ onAuthSuccess }: NftAuthProps) {
  const { toast } = useToast();
  const [nftToken, setNftToken] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nftToken.trim()) {
      setError('Please enter your NFT token ID');
      return;
    }
    
    setError(null);
    setIsVerifying(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/nft', { nftToken });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Authentication Successful',
          description: 'Your "I AM WHO I AM" NFT has been verified.',
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
      console.error('Authentication error:', err);
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          NFT Identity Authentication
        </CardTitle>
        <CardDescription>
          Authenticate using your "I AM WHO I AM" NFT identity token
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
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nft-token">NFT Token ID</Label>
              <Input 
                id="nft-token"
                type="text"
                placeholder="Enter your NFT token ID"
                value={nftToken}
                onChange={(e) => setNftToken(e.target.value)}
                disabled={isVerifying}
              />
              <p className="text-sm text-muted-foreground">
                Enter the token ID of your "I AM WHO I AM" NFT
              </p>
            </div>
            
            <Button type="submit" disabled={isVerifying} className="gap-2">
              {isVerifying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  Authenticate with NFT
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <div className="text-xs text-muted-foreground">
          I AM WHO I AM | NFT Authentication
        </div>
      </CardFooter>
    </Card>
  );
}

export default NftAuth;