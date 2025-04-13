import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSelector } from "@/components/accessibility/LanguageSelector";
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
  Languages,
  Mail,
  Users,
  Scan
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
  const { t } = useLanguage();
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
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            {t.phoneVerification.title}
          </CardTitle>
          <LanguageSelector variant="minimal" className="ml-auto" />
        </div>
        <CardDescription>
          {t.phoneVerification.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!isVerified ? (
          <Tabs defaultValue="standard" className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="standard">{t.common.continue}</TabsTrigger>
              <TabsTrigger value="alternative">{t.phoneVerification.alternative.title}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard" className="space-y-4">
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-number">{t.phoneVerification.phoneNumberLabel}</Label>
                  <Input 
                    id="phone-number"
                    placeholder={t.phoneVerification.phoneNumberPlaceholder}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t.phoneVerification.title}</Label>
                  <RadioGroup defaultValue="standard" className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem 
                        value="standard" 
                        id="standard"
                        checked={phoneType === "standard"}
                        onClick={() => setPhoneType("standard")}
                      />
                      <Label htmlFor="standard" className="cursor-pointer font-normal">
                        {t.phoneVerification.phoneTypes.standard}
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
                        {t.phoneVerification.phoneTypes.prepaid}
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
                        {t.phoneVerification.phoneTypes.international}
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
                        {t.phoneVerification.phoneTypes.deaf}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {phoneType === "deaf" && (
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-700">{t.phoneVerification.phoneTypes.deaf}</h4>
                        <p className="text-sm text-blue-600">
                          {t.phoneVerification.alternative.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-1">
                      <Label htmlFor="fcc-marker" className="text-sm text-blue-700">
                        {t.phoneVerification.fccMarker.toggle}
                      </Label>
                      <Switch 
                        id="fcc-marker" 
                        checked={hasFccMarker}
                        onCheckedChange={setHasFccMarker}
                      />
                    </div>
                    
                    <p className="text-xs text-blue-600">
                      {t.phoneVerification.fccMarker.explainer}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>{t.verificationTypes.phone}</Label>
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
                          {t.phoneVerification.methods.voice}
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
                        {t.phoneVerification.methods.text}
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
                          {t.phoneVerification.methods.video}
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
                        {t.phoneVerification.methods.email}
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
                        {t.phoneVerification.explanation.title} {t.common.optional}
                      </Label>
                      <ArrowRight className={`h-4 w-4 transition-transform ${showExplanationField ? 'rotate-90' : ''}`} />
                    </div>
                    
                    {showExplanationField && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {t.phoneVerification.explanation.description}
                        </p>
                        <textarea 
                          placeholder={t.phoneVerification.explanation.placeholder}
                          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2"
                          value={explanation}
                          onChange={(e) => setExplanation(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading || !phoneNumber}>
                  {isLoading ? t.common.loading : t.phoneVerification.sendCode}
                </Button>
              </form>
              
              {!isDeafUser && verificationMethod !== "video" && (
                <form onSubmit={handleVerifyCode} className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">{t.phoneVerification.codeLabel}</Label>
                    <Input 
                      id="verification-code"
                      placeholder={t.phoneVerification.codePlaceholder}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" variant="outline" className="w-full" disabled={isLoading || !verificationCode}>
                    {isLoading ? t.common.loading : t.phoneVerification.verifyCode}
                  </Button>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="alternative" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t.verificationTypes.inPerson}</CardTitle>
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
                    <CardTitle className="text-base">{t.verificationTypes.document}</CardTitle>
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
                    <CardTitle className="text-base">{t.verificationTypes.community}</CardTitle>
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
                    <CardTitle className="text-base">{t.verificationTypes.biometric}</CardTitle>
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
                    <h4 className="font-medium text-yellow-700">{t.phoneVerification.alternative.title}</h4>
                    <p className="text-sm text-yellow-600 mt-1">
                      {t.phoneVerification.alternative.description}
                    </p>
                    <Button variant="link" className="h-auto p-0 mt-1 text-yellow-700">
                      {t.accessibility.contactSupport}
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
                  <h4 className="font-medium text-green-700">{t.phoneVerification.success.title}</h4>
                  <p className="text-sm text-green-600">
                    {t.phoneVerification.success.description}
                  </p>
                </div>
              </div>
            </div>
            
            {phoneType === "deaf" && hasFccMarker && (
              <div className="border rounded-md p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">{t.phoneVerification.fccMarker.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.phoneVerification.fccMarker.description}
                    </p>
                    
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 rounded p-2">
                        <Badge variant="outline" className="text-primary whitespace-nowrap">FCC-D</Badge>
                        <span className="text-xs">{t.phoneVerification.phoneTypes.deaf}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 border rounded p-2">
                        <Badge variant="secondary" className="whitespace-nowrap">{t.common.success}</Badge>
                        <span className="text-xs">Enhanced Trust Score: +20</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">{t.accessibility.title}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 border rounded p-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <div>{phoneNumber}</div>
                    <div className="text-xs text-muted-foreground">{t.verificationTypes.phone}</div>
                  </div>
                </div>
                
                {phoneType === "deaf" && (
                  <div className="flex items-center gap-2 border rounded p-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <div>{t.videoVerification.title}</div>
                      <div className="text-xs text-muted-foreground">{t.videoVerification.signLanguageSelect}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 border rounded p-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <div>{t.common.success}</div>
                    <div className="text-xs text-muted-foreground">{t.verificationTypes.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t px-6 py-4 flex justify-between">
        <div className="text-xs text-muted-foreground">
          {isDeafUser ? t.accessibility.title : t.accessibility.alternativeMethods}
        </div>
        <Button variant="link" size="sm" className="h-5 p-0">
          {t.accessibility.needHelp}
        </Button>
      </CardFooter>
      
      {/* Video Verification Dialog */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.videoVerification.title}</DialogTitle>
            <DialogDescription>
              {t.videoVerification.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="aspect-video bg-black rounded-md flex items-center justify-center">
            <div className="text-white text-center">
              <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t.videoVerification.preparingVideo}</p>
              <p className="text-sm opacity-70 mt-1">
                {isDeafUser ? "Connect with a sign language interpreter" : t.common.loading}
              </p>
            </div>
          </div>
          
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.videoVerification.signLanguageSelect}</span>
              <select className="text-sm border rounded p-1">
                <option>American Sign Language (ASL)</option>
                <option>British Sign Language (BSL)</option>
                <option>Auslan</option>
                <option>French Sign Language (LSF)</option>
              </select>
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              {t.videoVerification.privacyNote}
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsVideoOpen(false)}>
              {t.videoVerification.cancelVideo}
            </Button>
            <Button onClick={simulateVideoVerification} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  {t.common.loading}
                </>
              ) : (
                t.videoVerification.startVideo
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}