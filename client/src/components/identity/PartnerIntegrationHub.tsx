import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, ArrowUpRight, Check, Copy, ExternalLink, Key, Link2, Lock, RefreshCw, Shield, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PartnerIntegrationHubProps {
  userId: number;
}

interface PartnerService {
  id: string;
  name: string;
  category: 'identity' | 'financial' | 'background' | 'health' | 'community';
  description: string;
  icon: string;
  status: 'connected' | 'available' | 'pending';
  permissions: {
    id: string;
    name: string;
    enabled: boolean;
    description: string;
  }[];
  apiEndpoint?: string;
  partnerUrl: string;
}

export function PartnerIntegrationHub({ userId }: PartnerIntegrationHubProps) {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerService | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  
  // This would fetch real data in a production environment
  const { data: partnerServices, isLoading } = useQuery<PartnerService[]>({
    queryKey: [`/api/users/${userId}/partner-services`],
    // In a real implementation, this would be removed and the API would be called
    enabled: false,
  });

  // Mock data for demonstration
  const mockPartnerServices: PartnerService[] = [
    {
      id: "clearview",
      name: "Clear by Clearview AI",
      category: "identity",
      description: "Biometric verification and facial recognition services for secure identity verification and recovery.",
      icon: "👤",
      status: "connected",
      permissions: [
        { id: "face-verify", name: "Facial Verification", enabled: true, description: "Use facial recognition to verify identity" },
        { id: "face-recover", name: "Recovery Access", enabled: true, description: "Use face as account recovery method" },
        { id: "biometric-store", name: "Store Biometric Template", enabled: true, description: "Maintain secure biometric template" }
      ],
      apiEndpoint: "https://api.clearview.ai/v1/identities",
      partnerUrl: "https://clearview.ai/identity"
    },
    {
      id: "polygon",
      name: "Polygon Identity",
      category: "identity",
      description: "Blockchain infrastructure for your 'I AM WHO I AM' NFT identity tokens and verification.",
      icon: "🔷",
      status: "connected",
      permissions: [
        { id: "mint-nft", name: "Mint Identity NFT", enabled: true, description: "Create your identity token on Polygon" },
        { id: "transfer-mgmt", name: "Transfer Management", enabled: true, description: "Control NFT transfers and usage" },
        { id: "verification", name: "Verification Access", enabled: true, description: "Allow verification of NFT authenticity" }
      ],
      apiEndpoint: "https://api.polygon.io/v2/identity",
      partnerUrl: "https://polygon.technology"
    },
    {
      id: "checkr",
      name: "Checkr Fair Background",
      category: "background",
      description: "Fair chance background check provider with inclusive verification options.",
      icon: "📋",
      status: "available",
      permissions: [
        { id: "background-check", name: "Basic Background Check", enabled: false, description: "Perform standard background checks" },
        { id: "employment-verify", name: "Employment Verification", enabled: false, description: "Verify employment history" },
        { id: "education-verify", name: "Education Verification", enabled: false, description: "Verify education credentials" }
      ],
      partnerUrl: "https://checkr.com"
    },
    {
      id: "plaid",
      name: "Plaid Financial Connect",
      category: "financial",
      description: "Financial data connectivity for verification of income and banking status.",
      icon: "💵",
      status: "available",
      permissions: [
        { id: "account-verify", name: "Account Verification", enabled: false, description: "Verify bank account existence" },
        { id: "income-verify", name: "Income Verification", enabled: false, description: "Verify income sources and amounts" },
        { id: "transaction-access", name: "Transaction History", enabled: false, description: "Access transaction history for verification" }
      ],
      partnerUrl: "https://plaid.com"
    },
    {
      id: "novacredit",
      name: "Nova Credit",
      category: "financial",
      description: "Alternative credit scoring for immigrants and those with limited credit history.",
      icon: "🌟",
      status: "connected",
      permissions: [
        { id: "global-credit", name: "Global Credit Access", enabled: true, description: "Access credit history from other countries" },
        { id: "alt-scoring", name: "Alternative Scoring", enabled: true, description: "Use alternative data for credit evaluation" }
      ],
      apiEndpoint: "https://api.novacredit.com/v1/credit-passport",
      partnerUrl: "https://novacredit.com"
    },
    {
      id: "healthstreet",
      name: "Health Street",
      category: "health",
      description: "Drug testing and health screening services with API integration.",
      icon: "🏥",
      status: "available",
      permissions: [
        { id: "drug-test", name: "Drug Test Results", enabled: false, description: "Access drug test results" },
        { id: "health-screen", name: "Health Screening", enabled: false, description: "Access basic health screenings" }
      ],
      partnerUrl: "https://health-street.net"
    },
    {
      id: "uniteus",
      name: "UniteUs",
      category: "community",
      description: "Social determinants of health and community resource referrals.",
      icon: "🤝",
      status: "pending",
      permissions: [
        { id: "resource-connect", name: "Resource Connection", enabled: false, description: "Connect to community resources" },
        { id: "needs-assessment", name: "Needs Assessment", enabled: false, description: "Perform needs assessment" }
      ],
      partnerUrl: "https://uniteus.com"
    }
  ];

  // Toggle permission for a service
  const togglePermission = (serviceId: string, permissionId: string) => {
    // In a real app, this would update the database via an API call
    toast({
      title: "Permission Updated",
      description: "Your permission settings have been updated.",
    });
  };

  // Connect to a new partner service
  const connectToService = (service: PartnerService) => {
    setSelectedPartner(service);
    setShowConnectModal(true);
  };

  // Simulate API key generation
  const generateApiKey = () => {
    const key = `ngrs_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(key);
  };

  // Complete connection to partner
  const completeConnection = () => {
    // In a real app, this would register the connection via an API call
    setShowConnectModal(false);
    toast({
      title: "Service Connected",
      description: `You've successfully connected to ${selectedPartner?.name}.`,
    });
  };

  // Copy API key
  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copied to Clipboard",
      description: "API key copied to clipboard.",
    });
  };

  // Filter services by category
  const filteredServices = activeCategory === "all" 
    ? mockPartnerServices 
    : mockPartnerServices.filter(s => s.category === activeCategory);

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading partner services...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          Partner Integration Hub
        </CardTitle>
        <CardDescription>
          Connect and manage third-party services that enhance your identity verification and opportunities
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <div className="px-6">
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>
        </div>
      
        <CardContent>
          <div className="space-y-6">
            {filteredServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No services found in this category.</p>
              </div>
            ) : (
              filteredServices.map((service) => (
                <div key={service.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/20 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{service.icon}</div>
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <div>
                      {service.status === 'connected' && (
                        <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Check className="h-3 w-3 mr-1" /> Connected
                        </Badge>
                      )}
                      {service.status === 'pending' && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Pending
                        </Badge>
                      )}
                      {service.status === 'available' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => connectToService(service)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {service.status === 'connected' && (
                    <div className="p-4">
                      <h4 className="text-sm font-medium mb-3">Permissions</h4>
                      <div className="space-y-3">
                        {service.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{permission.name}</p>
                              <p className="text-xs text-muted-foreground">{permission.description}</p>
                            </div>
                            <Switch
                              checked={permission.enabled}
                              onCheckedChange={() => togglePermission(service.id, permission.id)}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {service.apiEndpoint && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Key className="h-3 w-3" /> API Endpoint
                              </p>
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                {service.apiEndpoint}
                              </code>
                            </div>
                            <a 
                              href={service.partnerUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-primary flex items-center hover:underline"
                            >
                              Partner Portal <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Data Sharing Controls</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You control exactly what data is shared with each partner. Your "I AM WHO I AM" NFT serves as the 
                    authorization mechanism - partners only receive the minimum data necessary for their services.
                  </p>
                  <div className="mt-3">
                    <Button variant="outline" size="sm" className="text-xs">
                      View Data Exchange Logs
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Tabs>
      
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to {selectedPartner?.name}</DialogTitle>
            <DialogDescription>
              Connect your identity to {selectedPartner?.name} to enhance your verification capabilities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium flex items-center gap-1 mb-1">
                <Lock className="h-4 w-4 text-primary" /> How This Works
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedPartner?.name} will receive only the specific data you authorize. 
                Your "I AM WHO I AM" NFT will be used to authenticate the connection, 
                ensuring you maintain full control of your data.
              </p>
            </div>
            
            <div>
              <Label htmlFor="apiKey">Your NFT Authorization Key</Label>
              <div className="flex mt-1.5">
                <Input 
                  id="apiKey" 
                  value={apiKey} 
                  readOnly 
                  placeholder="Generate API key to connect"
                />
                {apiKey ? (
                  <Button variant="ghost" size="sm" className="ml-2" onClick={copyApiKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="outline" className="ml-2" onClick={generateApiKey}>
                    Generate
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                This key is unique to your identity and this specific service connection.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Label>Select Permissions</Label>
              {selectedPartner?.permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Switch id={permission.id} />
                  <Label htmlFor={permission.id} className="flex-1">
                    <span className="font-medium">{permission.name}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{permission.description}</p>
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectModal(false)}>
              Cancel
            </Button>
            <Button onClick={completeConnection} disabled={!apiKey}>
              Connect Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}