import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  FileCheck,
  Building,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DataSharingPolicyProps {
  userId: number;
}

interface SharingPermission {
  id: string;
  company: string;
  description: string;
  isEnabled: boolean;
  type: 'verification' | 'financial' | 'identity' | 'documentation';
  dateGranted?: string;
  expiration?: string;
  logoUrl?: string;
}

interface DataUsageCategory {
  id: string;
  name: string;
  description: string;
  percentCollected: number;
  itemsCollected: number;
  itemsTotal: number;
}

export function DataSharingPolicy({ userId }: DataSharingPolicyProps) {
  const [activeTab, setActiveTab] = useState("permissions");
  const { toast } = useToast();
  
  // FibonRoseTRUST Score Query
  const { data: trustScore, isLoading: isLoadingTrust } = useQuery({
    queryKey: [`/api/v1/fibonrose/trust-score/${userId}`],
    enabled: !!userId,
  });
  
  // Example data for demo - in a real app, these would come from API calls
  const companies: SharingPermission[] = [
    {
      id: "comp1",
      company: "VerifyPlus Credit Bureau",
      description: "Access to verify your identity for financial applications",
      isEnabled: true,
      type: 'verification',
      dateGranted: "2023-01-15",
      expiration: "2024-01-15",
      logoUrl: "/companies/verifyplus.svg"
    },
    {
      id: "comp2",
      company: "TrustBank Financial",
      description: "Access to verify account eligibility and risk assessment",
      isEnabled: true,
      type: 'financial',
      dateGranted: "2023-03-22",
      expiration: "2024-03-22",
      logoUrl: "/companies/trustbank.svg"
    },
    {
      id: "comp3",
      company: "RentSecure Properties",
      description: "Access to verify housing application eligibility",
      isEnabled: false,
      type: 'verification',
      logoUrl: "/companies/rentsecure.svg"
    },
    {
      id: "comp4",
      company: "FamilyLegal Services",
      description: "Access to court and family documentation for legal representation",
      isEnabled: true,
      type: 'documentation',
      dateGranted: "2023-05-10",
      expiration: "2024-05-10",
      logoUrl: "/companies/familylegal.svg"
    }
  ];
  
  const dataCategories: DataUsageCategory[] = [
    {
      id: "cat1",
      name: "Identity Verification",
      description: "Basic identification information used to verify your identity",
      percentCollected: 85,
      itemsCollected: 6,
      itemsTotal: 7
    },
    {
      id: "cat2",
      name: "Financial History",
      description: "Information about loans, payments, and financial transactions",
      percentCollected: 60,
      itemsCollected: 9,
      itemsTotal: 15
    },
    {
      id: "cat3",
      name: "Legal Documentation",
      description: "Court records, certificates, and official documents",
      percentCollected: 40,
      itemsCollected: 4,
      itemsTotal: 10
    },
    {
      id: "cat4",
      name: "Behavioral Data",
      description: "Information about your usage patterns and preferences",
      percentCollected: 15,
      itemsCollected: 3,
      itemsTotal: 20
    }
  ];
  
  // Toggle permission mutation
  const togglePermissionMutation = useMutation({
    mutationFn: async ({ companyId, enabled }: { companyId: string; enabled: boolean }) => {
      return apiRequest('POST', `/api/users/${userId}/data-sharing/toggle`, {
        companyId,
        enabled
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/data-sharing`] });
      toast({
        title: "Permission Updated",
        description: "Your data sharing permission has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Error toggling permission:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your permission. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleTogglePermission = (companyId: string, currentValue: boolean) => {
    // For demo, we'll just show the toast without making the API call
    toast({
      title: "Permission Updated",
      description: `Data sharing with ${companies.find(c => c.id === companyId)?.company} is now ${!currentValue ? 'enabled' : 'disabled'}.`,
      variant: "default",
    });
    
    // In a real app, you would call the mutation:
    // togglePermissionMutation.mutate({ companyId, enabled: !currentValue });
  };
  
  const getCompanyTypeIcon = (type: string) => {
    switch(type) {
      case 'verification':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'financial':
        return <FileCheck className="h-4 w-4 text-green-600" />;
      case 'identity':
        return <Eye className="h-4 w-4 text-purple-600" />;
      case 'documentation':
        return <FileCheck className="h-4 w-4 text-amber-600" />;
      default:
        return <Building className="h-4 w-4 text-gray-600" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-600" />
              Data Sharing Policy
            </CardTitle>
            <CardDescription>
              Control which companies can access your data through FibonRoseTRUST
            </CardDescription>
          </div>
          {!isLoadingTrust && trustScore && (
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 flex items-center gap-1">
              <Shield className="h-3 w-3" /> FibonRoseTRUST Level: {trustScore.fibonacciLevel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex gap-3">
            <Lock className="h-10 w-10 text-indigo-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-indigo-800 mb-1">Our Promise: Your Data, Your Control</h3>
              <p className="text-sm text-indigo-700">
                We never sell or share your data except with companies you explicitly authorize. All data sharing is 
                powered by FibonRoseTRUST, our secure and verifiable control system that puts you in charge of who sees what.
              </p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="permissions" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="permissions">Company Permissions</TabsTrigger>
            <TabsTrigger value="usage">Data Usage</TabsTrigger>
            <TabsTrigger value="policy">Privacy Policy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="permissions">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Approved Companies</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These are the only organizations authorized to access portions of your data. Toggle permissions to grant or revoke access.
                </p>
                
                <div className="space-y-4">
                  {companies.map(company => (
                    <div key={company.id} className="border rounded-lg p-4 transition-colors duration-150 hover:bg-muted/30">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2 rounded-full mr-3">
                            {getCompanyTypeIcon(company.type)}
                          </div>
                          <div>
                            <h4 className="font-medium">{company.company}</h4>
                            <p className="text-sm text-muted-foreground">{company.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-3 text-right">
                            <span className="text-xs font-medium text-muted-foreground">
                              {company.isEnabled ? 'Access Permitted' : 'Access Denied'}
                            </span>
                            {company.dateGranted && (
                              <p className="text-xs text-muted-foreground">
                                Expires: {company.expiration?.split('-').slice(0, 2).join('/')}
                              </p>
                            )}
                          </div>
                          <Switch
                            checked={company.isEnabled}
                            onCheckedChange={() => handleTogglePermission(company.id, company.isEnabled)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Global Controls</h3>
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <Label htmlFor="pause-all" className="font-medium">Pause All Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily pause all data sharing with external companies
                      </p>
                    </div>
                    <Switch id="pause-all" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <Label htmlFor="notify-access" className="font-medium">Notify On Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a notification whenever your data is accessed
                      </p>
                    </div>
                    <Switch id="notify-access" defaultChecked />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <Label htmlFor="new-request" className="font-medium">Auto-Deny New Requests</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically deny new companies requesting data access
                      </p>
                    </div>
                    <Switch id="new-request" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="usage">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Data Collection Overview</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This shows what categories of data we have collected and their completion status. 
                  More complete data typically results in better verification outcomes.
                </p>
                
                <div className="space-y-5">
                  {dataCategories.map(category => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                        <Badge variant="outline" className="bg-gray-50">
                          {category.itemsCollected}/{category.itemsTotal} Items
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Completion</span>
                          <span>{category.percentCollected}%</span>
                        </div>
                        <Progress value={category.percentCollected} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">FibonRoseTRUST Integration</h3>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center mb-3">
                    <div className="bg-teal-100 p-2 rounded-full mr-3">
                      <Shield className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Fibonacci-Based Trust Scoring</h4>
                      <p className="text-sm text-muted-foreground">
                        Your data is protected by our proprietary trust algorithm
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Trust Level</span>
                      <span className="font-bold text-teal-600">
                        {isLoadingTrust ? "Loading..." : (trustScore?.fibonacciLevel || "0")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Access Tier</span>
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        {isLoadingTrust ? "Loading..." : (trustScore?.accessTier || "BASIC")}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Verified Methods</span>
                      <span className="text-sm">
                        {isLoadingTrust ? "Loading..." : (trustScore?.verifiedMethods?.length || "0")} method(s)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="policy">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Our Data Privacy Commitments</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">No Unauthorized Sharing</p>
                      <p className="text-sm text-muted-foreground">
                        We never sell or share your data with third parties without your explicit permission.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Granular Control</p>
                      <p className="text-sm text-muted-foreground">
                        You control exactly which companies can access which pieces of your data.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Data Minimization</p>
                      <p className="text-sm text-muted-foreground">
                        We only collect the data necessary for providing our verification services.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Company Vetting</p>
                      <p className="text-sm text-muted-foreground">
                        All companies with access to your data are vetted and must adhere to strict data protection rules.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Revoke Anytime</p>
                      <p className="text-sm text-muted-foreground">
                        You can revoke access permissions at any time with immediate effect.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800 mb-1">FibonRoseTRUST Protection</h3>
                    <p className="text-sm text-amber-700">
                      The FibonRoseTRUST system mathematically guarantees the security and integrity of your data 
                      through our proprietary Fibonacci-based trust algorithm. Your data security grows exponentially 
                      with your trust level, ensuring strong protection for all users.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Button className="w-full" variant="outline">
                  <FileCheck className="h-4 w-4 mr-2" /> Download Complete Privacy Policy
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex justify-between">
        <p className="text-xs text-muted-foreground flex items-center">
          <Lock className="h-3 w-3 mr-1 text-indigo-600" />
          Secured by FibonRoseTRUST
        </p>
        <p className="text-xs font-medium">
          Last updated: April 14, 2025
        </p>
      </CardFooter>
    </Card>
  );
}