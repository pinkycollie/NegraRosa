import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { Camera, Fingerprint, Shield, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BiometricRecoveryProps {
  userId: number;
}

export function BiometricRecovery({ userId }: BiometricRecoveryProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [step, setStep] = useState<number>(1);
  const [enrollmentProgress, setEnrollmentProgress] = useState<number>(0);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [recoveryAttemptActive, setRecoveryAttemptActive] = useState<boolean>(false);
  
  // Simulated enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would capture facial/biometric data and send to the server
      return await apiRequest("POST", `/api/users/${userId}/biometric-enrollment`, {});
    },
    onSuccess: () => {
      setIsEnrolled(true);
      toast({
        title: "Biometric Enrollment Complete",
        description: "Your face is now set as your recovery code.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Enrollment Failed",
        description: "We couldn't complete your biometric enrollment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Simulated recovery attempt
  const recoveryMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would validate the user's face against stored data
      return await apiRequest("POST", `/api/users/${userId}/biometric-recovery`, {});
    },
    onSuccess: () => {
      toast({
        title: "Identity Verified",
        description: "Your identity has been confirmed. Access restored.",
        variant: "default",
      });
      setRecoveryAttemptActive(false);
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "We couldn't verify your identity. Please try again or use an alternative method.",
        variant: "destructive",
      });
      setRecoveryAttemptActive(false);
    }
  });

  // Simulated enrollment process
  const startEnrollment = () => {
    setIsCameraActive(true);
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 5;
      setEnrollmentProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsCameraActive(false);
        enrollMutation.mutate();
      }
    }, 200);
  };

  // Simulated recovery process
  const startRecovery = () => {
    setRecoveryAttemptActive(true);
    
    // Simulate a scanning process
    setTimeout(() => {
      recoveryMutation.mutate();
    }, 3000);
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-primary" />
          Face ID Recovery System
        </CardTitle>
        <CardDescription>
          Use your face as your universal recovery code for all verification methods
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full rounded-none">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="enroll">Enroll</TabsTrigger>
            <TabsTrigger value="recover">Recover Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-6 space-y-4">
            <div className="space-y-4">
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Never lose access to your accounts again</AlertTitle>
                <AlertDescription>
                  Your face is your most secure recovery code. It can't be lost like a phone, 
                  forgotten like a password, or stolen like a device.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="border rounded-lg p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary/70" />
                  <h3 className="font-medium">More Secure</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Biometric recovery is significantly more secure than email or SMS codes
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 text-center">
                  <Fingerprint className="h-8 w-8 mx-auto mb-2 text-primary/70" />
                  <h3 className="font-medium">Always With You</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You'll never lose or forget your face - it's the ultimate backup
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 text-center">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 text-primary/70" />
                  <h3 className="font-medium">Cross-Platform</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Works across all your services tied to your "I AM WHO I AM" identity
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg mt-6">
                <h3 className="font-medium mb-2">How It Works</h3>
                <ol className="space-y-2 ml-5 list-decimal text-sm text-muted-foreground">
                  <li>We capture your facial biometrics and create a secure template</li>
                  <li>The template is stored as part of your "I AM WHO I AM" NFT identity</li>
                  <li>When you need to recover access, we verify your face against your NFT template</li>
                  <li>Once verified, you can regain access to all linked accounts and services</li>
                </ol>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="enroll" className="p-6">
            {isEnrolled ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Enrollment Complete</h3>
                <p className="text-muted-foreground mb-6">
                  Your face is now your universal recovery code. It's connected to your "I AM WHO I AM" NFT.
                </p>
                <Button variant="outline" className="mx-auto">
                  Update Biometrics
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium mb-2">Biometric Enrollment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set up your face as your recovery code in 3 simple steps
                  </p>
                  
                  <div className="flex justify-between max-w-md mx-auto mb-8">
                    <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                        step >= 1 ? 'bg-primary text-white' : 'bg-muted'
                      }`}>1</div>
                      <span className="text-xs">Prepare</span>
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className={`h-0.5 w-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                    </div>
                    <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                        step >= 2 ? 'bg-primary text-white' : 'bg-muted'
                      }`}>2</div>
                      <span className="text-xs">Scan</span>
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className={`h-0.5 w-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
                    </div>
                    <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                        step >= 3 ? 'bg-primary text-white' : 'bg-muted'
                      }`}>3</div>
                      <span className="text-xs">Confirm</span>
                    </div>
                  </div>
                </div>
                
                {step === 1 && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Preparation Tips</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc ml-5 space-y-1 text-sm mt-2">
                          <li>Ensure good lighting on your face</li>
                          <li>Remove glasses, masks, or other face coverings</li>
                          <li>Position your face directly in front of the camera</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                    <Button className="w-full" onClick={() => setStep(2)}>
                      I'm Ready
                    </Button>
                  </div>
                )}
                
                {step === 2 && (
                  <div className="space-y-4">
                    {isCameraActive ? (
                      <div className="space-y-6">
                        <div className="bg-black aspect-video rounded-lg flex items-center justify-center">
                          <Camera className="h-12 w-12 text-white animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Scanning your face</span>
                            <span>{enrollmentProgress}%</span>
                          </div>
                          <Progress value={enrollmentProgress} className="h-2" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg aspect-video flex flex-col items-center justify-center p-6">
                          <Camera className="h-12 w-12 text-muted-foreground/50 mb-4" />
                          <p className="text-center text-muted-foreground">
                            We'll need to access your camera to capture your facial biometrics securely.
                          </p>
                        </div>
                        <Button className="w-full" onClick={startEnrollment}>
                          Start Face Scan
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
                          Go Back
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recover" className="p-6">
            <div className="space-y-6">
              <Alert variant={isEnrolled ? "default" : "destructive"} className={isEnrolled ? "bg-green-50 border-green-200" : ""}>
                {isEnrolled ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>Recovery Ready</AlertTitle>
                    <AlertDescription>
                      Your biometric recovery is set up and ready to use when needed.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Not Enrolled</AlertTitle>
                    <AlertDescription>
                      You need to complete the enrollment process before you can use biometric recovery.
                    </AlertDescription>
                  </>
                )}
              </Alert>
              
              {isEnrolled && (
                <div className="space-y-4">
                  <h3 className="font-medium">Lost Access?</h3>
                  
                  {recoveryAttemptActive ? (
                    <div className="space-y-6">
                      <div className="bg-black aspect-video rounded-lg flex items-center justify-center">
                        <Fingerprint className="h-12 w-12 text-white animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="mb-2">Verifying your identity...</p>
                        <RefreshCw className="h-6 w-6 mx-auto animate-spin text-primary" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border border-muted space-y-4">
                      <p className="text-sm text-muted-foreground">
                        If you've lost access to your account through other verification methods,
                        you can use your face to verify your identity and regain access.
                      </p>
                      <Button className="w-full" onClick={startRecovery}>
                        Start Recovery Process
                      </Button>
                    </div>
                  )}
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">What Happens During Recovery</h4>
                    <ol className="text-xs text-muted-foreground space-y-1 ml-5 list-decimal">
                      <li>We'll scan your face and compare it to your stored biometric template</li>
                      <li>Your NFT identity will be verified on the blockchain</li>
                      <li>Once verified, you'll receive access credentials for all linked services</li>
                      <li>You'll be prompted to set up new verification methods if needed</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-muted/20 px-6 py-4">
        <div className="text-xs text-muted-foreground w-full text-center">
          Your biometric data is stored securely as part of your "I AM WHO I AM" NFT identity token.
          <span className="block mt-1">It's never shared with third parties without your explicit permission.</span>
        </div>
      </CardFooter>
    </Card>
  );
}