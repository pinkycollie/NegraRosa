import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FingerprintIcon, Key, Shield } from "lucide-react";
import BiometricAuth from './BiometricAuth';
import NftAuth from './NftAuth';

interface BiometricRecoveryProps {
  onAuthSuccess: (data: { token: string; userId: number }) => void;
  onCancel: () => void;
}

export function BiometricRecovery({ onAuthSuccess, onCancel }: BiometricRecoveryProps) {
  const [activeMethod, setActiveMethod] = useState<'face' | 'nft'>('face');

  const handleAuthSuccess = (data: { token: string; userId: number }) => {
    onAuthSuccess(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-6 w-6" />
          Account Recovery
        </CardTitle>
        <CardDescription>
          Recover your account using biometric authentication or your NFT identity token
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="face" onValueChange={(value) => setActiveMethod(value as 'face' | 'nft')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="face" className="flex items-center gap-1">
              <FingerprintIcon className="h-4 w-4" />
              Face ID
            </TabsTrigger>
            <TabsTrigger value="nft" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              NFT Identity
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="face" className="mt-4">
            <BiometricAuth 
              mode="recover" 
              onAuthSuccess={handleAuthSuccess} 
            />
          </TabsContent>
          
          <TabsContent value="nft" className="mt-4">
            <NftAuth 
              onAuthSuccess={handleAuthSuccess} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        <div className="text-xs text-muted-foreground">
          I AM WHO I AM | Identity Recovery
        </div>
      </CardFooter>
    </Card>
  );
}

export default BiometricRecovery;