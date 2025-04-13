import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  CheckCircle, 
  Phone, 
  MessageSquare, 
  Video, 
  Calendar, 
  FileText, 
  HelpCircle, 
  ArrowRight,
  Info,
  Shield,
  User,
  Smartphone,
  AlertTriangle,
  Languages
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface InclusivePhoneVerificationProps {
  onVerified?: (method: string, value: string) => void;
  userId?: number;
}

export function InclusivePhoneVerification({ onVerified, userId }: InclusivePhoneVerificationProps) {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneType, setPhoneType] = useState<string>("standard");
  const [verificationMethod, setVerificationMethod] = useState<string>("text");
  const [isDeafUser, setIsDeafUser] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [showExplanationField, setShowExplanationField] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [hasFccMarker, setHasFccMarker] = useState(false);
  
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call your n8n workflow or API
      // to handle the phone verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful sending of verification code
      toast({
        title: isDeafUser 
          ? "Verification Request Sent" 
          : "Verification Code Sent",
        description: isDeafUser 
          ? "A verification request has been sent through your preferred method." 
          : "A verification code has been sent to your phone.",
      });
      
      // If this is a deaf user with video verification, open the video dialog
      if (isDeafUser && verificationMethod === "video") {
        setIsVideoOpen(true);
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "We couldn't send a verification code. Please try an alternative method.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real implementation, this would validate the verification code
      // against your n8n workflow or API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demonstration, we'll accept any non-empty code
      if (verificationCode.trim()) {
        setIsVerified(true);
        
        toast({
          title: "Phone Verified Successfully",
          description: "Your phone number has been verified.",
        });
        
        if (onVerified) {
          onVerified("phone", phoneNumber);
        }
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code you entered is invalid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "We couldn't verify your code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const simulateVideoVerification = () => {
    setIsLoading(true);
    
    // Simulate API call for video verification
    setTimeout(() => {
      setIsLoading(false);
      setIsVerified(true);
      setIsVideoOpen(false);
      
      toast({
        title: "Video Verification Successful",
        description: "Your identity has been verified through video.",
      });
      
      if (onVerified) {
        onVerified("video", phoneNumber);
      }
    }, 2000);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Inclusive Phone Verification
        </CardTitle>
        <CardDescription>
          Verify your phone through multiple methods, designed for all accessibility needs
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!isVerified ? (
          <Tabs defaultValue="standard" className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="alternative">Alternative</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard" className="space-y-4">
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input 
                    id="phone-number"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Phone Type</Label>
                  <RadioGroup defaultValue="standard" className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem 
                        value="standard" 
                        id="standard"
                        checked={phoneType === "standard"}
                        onClick={() => setPhoneType("standard")}
                      />
                      <Label htmlFor="standard" className="cursor-pointer font-normal">
                        Standard Plan
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem 
                        value="prepaid" 
                        id="prepaid"
                        checked={phoneType === "prepaid"}
                        onClick={() => setPhoneType("prepaid")}
                      />
                      <Label htmlFor="prepaid" className="cursor-pointer font-normal">
                        Prepaid
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem 
                        value="international" 
                        id="international"
                        checked={phoneType === "international"}
                        onClick={() => setPhoneType("international")}
                      />
                      <Label htmlFor="international" className="cursor-pointer font-normal">
                        International
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem 
                        value="deaf" 
                        id="deaf-plan"
                        checked={phoneType === "deaf"}
                        onClick={() => {
                          setPhoneType("deaf");
                          setIsDeafUser(true);
                          setHasFccMarker(true);
                        }}
                      />
                      <Label htmlFor="deaf-plan" className="cursor-pointer font-normal">
                        Deaf Plan
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {phoneType === "deaf" && (
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-700">Deaf Plan Selected</h4>
                        <p className="text-sm text-blue-600">
                          We'll adapt our verification process to accommodate your needs
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-1">
                      <Label htmlFor="fcc-marker" className="text-sm text-blue-700">
                        Add FCC marker to your phone number
                      </Label>
                      <Switch 
                        id="fcc-marker" 
                        checked={hasFccMarker}
                        onCheckedChange={setHasFccMarker}
                      />
                    </div>
                    
                    <p className="text-xs text-blue-600">
                      This helps companies identify you as a deaf caller, not a robocall,
                      and routes you through accessible verification methods
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Verification Method</Label>
                  <RadioGroup defaultValue="text" className="grid grid-cols-2 gap-2">
                    {!isDeafUser && (
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem 
                          value="voice" 
                          id="voice"
                          checked={verificationMethod === "voice"}
                          onClick={() => setVerificationMethod("voice")}
                        />
                        <Label htmlFor="voice" className="cursor-pointer font-normal flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Voice Call
                        </Label>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem 
                        value="text" 
                        id="text"
                        checked={verificationMethod === "text"}
                        onClick={() => setVerificationMethod("text")}
                      />
                      <Label htmlFor="text" className="cursor-pointer font-normal flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Text Message
                      </Label>
                    </div>
                    
                    {isDeafUser && (
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem 
                          value="video" 
                          id="video"
                          checked={verificationMethod === "video"}
                          onClick={() => setVerificationMethod("video")}
                        />
                        <Label htmlFor="video" className="cursor-pointer font-normal flex items-center">
                          <Video className="h-4 w-4 mr-2" />
                          Video Verification
                        </Label>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem 
                        value="email" 
                        id="email"
                        checked={verificationMethod === "email"}
                        onClick={() => setVerificationMethod("email")}
                      />
                      <Label htmlFor="email" className="cursor-pointer font-normal flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Link
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {(phoneType === "prepaid" || phoneType === "international" || phoneType === "deaf") && (
                  <div className="pt-2">
                    <div 
                      className="flex items-center justify-between cursor-pointer" 
                      onClick={() => setShowExplanationField(!showExplanationField)}
                    >
                      <Label className="flex items-center cursor-pointer">
                        <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        Explain your situation (optional)
                      </Label>
                      <ArrowRight className={`h-4 w-4 transition-transform ${showExplanationField ? 'rotate-90' : ''}`} />
                    </div>
                    
                    {showExplanationField && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Providing context helps us verify your identity more effectively. 
                          Your explanation is reviewed by our AI and can improve your verification experience.
                        </p>
                        <textarea 
                          placeholder="Explain why you're using this type of phone plan, or any challenges you face with traditional verification..."
                          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2"
                          value={explanation}
                          onChange={(e) => setExplanation(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading || !phoneNumber}>
                  {isLoading ? "Processing..." : "Send Verification"}
                </Button>
              </form>
              
              {!isDeafUser && verificationMethod !== "video" && (
                <form onSubmit={handleVerifyCode} className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Verification Code</Label>
                    <Input 
                      id="verification-code"
                      placeholder="Enter the code we sent you"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" variant="outline" className="w-full" disabled={isLoading || !verificationCode}>
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </Button>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="alternative" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">In-Person Verification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Visit a local verification center with your ID to complete verification in person.
                    </p>
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Document Verification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Upload official documents as an alternative verification method.
                    </p>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Community Verification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Get verified through local community advocates or organizations.
                    </p>
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Connect with Community
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Biometric Verification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Use facial recognition or fingerprint scans for verification.
                    </p>
                    <Button variant="outline" className="w-full">
                      <Scan className="h-4 w-4 mr-2" />
                      Start Biometric Scan
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-700">Verification Access Statement</h4>
                    <p className="text-sm text-yellow-600 mt-1">
                      We believe verification should never exclude people due to disabilities, economic circumstances, 
                      or international status. If none of these methods work for you, please contact our inclusive 
                      verification team for personalized assistance.
                    </p>
                    <Button variant="link" className="h-auto p-0 mt-1 text-yellow-700">
                      Contact Inclusive Verification Team
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-100 rounded-md p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-700">Verification Complete</h4>
                  <p className="text-sm text-green-600">
                    Your phone number has been successfully verified.
                  </p>
                </div>
              </div>
            </div>
            
            {phoneType === "deaf" && hasFccMarker && (
              <div className="border rounded-md p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">FCC Marker Applied</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your phone number now has an FCC marker indicating you're a deaf caller.
                      This helps companies identify legitimate deaf-service calls and prevents
                      them from being flagged as spam or being hung up on.
                    </p>
                    
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 rounded p-2">
                        <Badge variant="outline" className="text-primary whitespace-nowrap">FCC-D</Badge>
                        <span className="text-xs">Deaf Caller Marker</span>
                      </div>
                      
                      <div className="flex items-center gap-2 border rounded p-2">
                        <Badge variant="secondary" className="whitespace-nowrap">Verification</Badge>
                        <span className="text-xs">Enhanced Trust Score: +20</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Connected Verification Factors</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 border rounded p-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <div>{phoneNumber}</div>
                    <div className="text-xs text-muted-foreground">Phone</div>
                  </div>
                </div>
                
                {phoneType === "deaf" && (
                  <div className="flex items-center gap-2 border rounded p-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <div>Video Verified</div>
                      <div className="text-xs text-muted-foreground">Sign Language</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 border rounded p-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <div>Identity</div>
                    <div className="text-xs text-muted-foreground">Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t px-6 py-4 flex justify-between">
        <div className="text-xs text-muted-foreground">
          {isDeafUser ? "Accessibility-enhanced verification process" : "Inclusive verification system"}
        </div>
        <Button variant="link" size="sm" className="h-5 p-0">
          Need Help?
        </Button>
      </CardFooter>
      
      {/* Video Verification Dialog */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Language Video Verification</DialogTitle>
            <DialogDescription>
              Verify your identity using sign language with one of our interpreters.
            </DialogDescription>
          </DialogHeader>
          
          <div className="aspect-video bg-black rounded-md flex items-center justify-center">
            <div className="text-white text-center">
              <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Video feed would appear here</p>
              <p className="text-sm opacity-70 mt-1">
                Connect with a sign language interpreter
              </p>
            </div>
          </div>
          
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Select preferred sign language:</span>
              <select className="text-sm border rounded p-1">
                <option>American Sign Language (ASL)</option>
                <option>British Sign Language (BSL)</option>
                <option>Auslan</option>
                <option>French Sign Language (LSF)</option>
              </select>
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              For privacy and security, this video call is not recorded. Our interpreters are bound by confidentiality agreements.
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsVideoOpen(false)}>
              Cancel
            </Button>
            <Button onClick={simulateVideoVerification} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Processing...
                </>
              ) : (
                "Start Verification"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}