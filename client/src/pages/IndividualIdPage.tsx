import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Lock, 
  BadgeCheck, 
  Clock, 
  Phone, 
  Shield, 
  Fingerprint, 
  Eye,
  PlusCircle,
  AlertTriangle
} from "lucide-react";

export default function IndividualIdPage() {
  const [idStatus, setIdStatus] = useState<'notCreated' | 'pending' | 'active'>('notCreated');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock user data
  const userData = {
    verificationProgress: 25,
    emergencyContacts: 1,
    documentsVerified: 2,
    totalDocuments: 5,
    eventsDocumented: 3,
    lastUpdated: '2025-04-15',
    verificationMethods: [
      { name: 'Voice Pattern', status: 'completed', icon: <Phone className="h-5 w-5" /> },
      { name: 'Visual ID', status: 'pending', icon: <Eye className="h-5 w-5" /> },
      { name: 'Gesture Recognition', status: 'not-started', icon: <Fingerprint className="h-5 w-5" /> },
      { name: 'NFT Certificate', status: 'not-started', icon: <Shield className="h-5 w-5" /> }
    ]
  };

  // Function to handle ID creation
  const handleCreateID = () => {
    setIdStatus('pending');
    // In a real app, this would make an API call to start the ID creation process
    setTimeout(() => {
      setIdStatus('active');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Individual &amp; Family ID System</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Secure, accessible identity verification for deaf individuals and families
            </p>
            <div className="inline-flex items-center rounded-full px-4 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 text-sm font-medium mb-8">
              <ShieldCheck className="h-4 w-4 mr-2" />
              NFT-powered identity verification
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Status Card */}
            <Card className="border-2 border-purple-200 dark:border-purple-900">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <BadgeCheck className="h-6 w-6 mr-2 text-purple-600" />
                  Your Identity Status
                </CardTitle>
                <CardDescription>
                  Your secure, decentralized identity for emergency situations and life events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {idStatus === 'notCreated' && (
                  <div className="text-center py-6">
                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Active ID Found</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your secure ID to help emergency services better assist you in critical situations
                    </p>
                    <Button 
                      size="lg" 
                      onClick={handleCreateID}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      Create Your Secure ID
                    </Button>
                  </div>
                )}

                {idStatus === 'pending' && (
                  <div className="text-center py-6">
                    <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-medium mb-2">Creating Your Secure ID</h3>
                    <p className="text-muted-foreground mb-6">
                      Please wait while we generate your secure identity credentials
                    </p>
                    <Progress value={60} className="max-w-md mx-auto" />
                  </div>
                )}

                {idStatus === 'active' && (
                  <div className="py-2">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                        <span className="font-medium">ID Active and Verified</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100">
                        ACTIVE
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Verification Progress</p>
                          <div className="flex items-center">
                            <Progress value={userData.verificationProgress} className="flex-1 mr-4" />
                            <span className="text-sm font-medium">{userData.verificationProgress}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Emergency Contacts</p>
                          <div className="flex items-center">
                            <span className="font-medium">{userData.emergencyContacts} registered</span>
                            <Button variant="ghost" size="sm" className="ml-2 text-xs">
                              <PlusCircle className="h-3 w-3 mr-1" /> Add
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Documents Verified</p>
                          <span className="font-medium">{userData.documentsVerified} of {userData.totalDocuments}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Life Events Documented</p>
                          <span className="font-medium">{userData.eventsDocumented} events</span>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                          <span className="font-medium">{userData.lastUpdated}</span>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Emergency Services Access</p>
                          <div className="flex items-center">
                            <Switch id="emergency-access" defaultChecked />
                            <label 
                              htmlFor="emergency-access" 
                              className="ml-2 text-sm font-medium cursor-pointer"
                            >
                              Enabled
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              {idStatus === 'active' && (
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Lock className="h-3 w-3 mr-1" />
                    Your identity data is secured using NFT-based cryptography and decentralized storage
                  </div>
                </CardFooter>
              )}
            </Card>

            {/* Only show tabs when ID is active */}
            {idStatus === 'active' && (
              <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="events">Life Events</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="pt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Secure NFT-Based ID</CardTitle>
                      <CardDescription>
                        How your identity is protected and verified
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center">
                        <div className="relative mx-auto w-32 h-32 mb-4 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <Shield className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                          <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <h3 className="text-lg font-medium mb-1">NFT Certificate ID</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          #NFT-ID-25789-DEAF-ROSE
                        </p>
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100">
                          Active & Verified
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">How Your ID Works</h3>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 mr-3 mt-0.5">
                              1
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">Secure NFT-Based Identity</h4>
                              <p className="text-sm text-muted-foreground">
                                Your identity is encoded as a unique NFT on a secure blockchain
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 mr-3 mt-0.5">
                              2
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">Multi-Factor Authentication</h4>
                              <p className="text-sm text-muted-foreground">
                                Verify your identity through multiple methods designed for deaf accessibility
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 mr-3 mt-0.5">
                              3
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">Emergency Services Integration</h4>
                              <p className="text-sm text-muted-foreground">
                                In emergencies, authorized services can access your critical information
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 mr-3 mt-0.5">
                              4
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">Life Event Documentation</h4>
                              <p className="text-sm text-muted-foreground">
                                Securely document important life events like employment changes or benefits status
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="verification" className="pt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>ID Verification Methods</CardTitle>
                      <CardDescription>
                        Complete multiple verification methods to strengthen your ID security
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {userData.verificationMethods.map((method, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 mr-3">
                                  {method.icon}
                                </div>
                                <div>
                                  <h3 className="font-medium">{method.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {method.status === 'completed' ? 'Verification complete' : 
                                      method.status === 'pending' ? 'Verification in progress' : 
                                      'Not started'}
                                  </p>
                                </div>
                              </div>
                              
                              {method.status === 'completed' && (
                                <Badge className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100">
                                  Verified
                                </Badge>
                              )}
                              
                              {method.status === 'pending' && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-100">
                                  In Progress
                                </Badge>
                              )}
                              
                              {method.status === 'not-started' && (
                                <Button variant="outline" size="sm">
                                  Start Verification
                                </Button>
                              )}
                            </div>
                            
                            {method.status === 'completed' && (
                              <div className="bg-muted rounded-md p-3 flex items-center text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                Verification completed successfully
                              </div>
                            )}
                            
                            {method.status === 'pending' && (
                              <div className="bg-muted rounded-md p-3 flex items-center text-sm">
                                <Clock className="h-4 w-4 text-amber-500 mr-2" />
                                Please complete the remaining verification steps
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 flex justify-between border-t">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{userData.verificationProgress}%</span> verification complete
                      </div>
                      <Button variant="outline" size="sm">
                        Learn More About Verification
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="documents" className="pt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Identity Documents</CardTitle>
                      <CardDescription>
                        Manage and verify your critical identification documents
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-blue-500 mr-2" />
                              <h3 className="font-medium">ID Card / Driver's License</h3>
                            </div>
                            <Badge className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100">
                              Verified
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Government-issued identification
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Added: April 12, 2025</span>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-blue-500 mr-2" />
                              <h3 className="font-medium">Medical Information</h3>
                            </div>
                            <Badge className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100">
                              Verified
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Essential medical information for emergency situations
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Added: April 14, 2025</span>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-blue-500 mr-2" />
                              <h3 className="font-medium">SSI Documentation</h3>
                            </div>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-100">
                              Pending
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Supplemental Security Income documentation
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Added: April 15, 2025</span>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 border-dashed">
                          <div className="text-center py-6">
                            <PlusCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <h3 className="font-medium mb-1">Add New Document</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Upload additional identity documents for verification
                            </p>
                            <Button variant="outline">Upload Document</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="events" className="pt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>FibonroseTRUST Life Events</CardTitle>
                      <CardDescription>
                        Document and verify important life events securely
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4 mb-8">
                          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                            <BadgeCheck className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">FibonroseTRUST System</h3>
                            <p className="text-sm text-muted-foreground">
                              Our immutable life event documentation system helps you record and verify
                              important changes in your life, providing proof for government agencies,
                              employers, and emergency services.
                            </p>
                          </div>
                        </div>
                      
                        <div className="space-y-6">
                          <div className="relative border rounded-lg p-4">
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100">
                                Verified
                              </Badge>
                            </div>
                            <div className="flex items-center mb-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 mr-3">
                                <Fingerprint className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium">Employment Change</h3>
                                <p className="text-sm text-muted-foreground">
                                  Employment status update
                                </p>
                              </div>
                            </div>
                            <div className="pl-13 ml-7">
                              <div className="space-y-2 mb-3">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Date:</span>
                                  <span className="text-sm">March 20, 2025</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Type:</span>
                                  <span className="text-sm">New Employment</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Verified By:</span>
                                  <span className="text-sm">Employer Digital Signature</span>
                                </div>
                              </div>
                              <Separator className="my-3" />
                              <div className="flex justify-between items-center">
                                <Button variant="ghost" size="sm">View Details</Button>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Lock className="h-3 w-3 mr-1" />
                                  NFT Secured
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative border rounded-lg p-4">
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100">
                                Verified
                              </Badge>
                            </div>
                            <div className="flex items-center mb-3">
                              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 mr-3">
                                <BadgeCheck className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium">SSI Benefits Status</h3>
                                <p className="text-sm text-muted-foreground">
                                  Supplemental Security Income
                                </p>
                              </div>
                            </div>
                            <div className="pl-13 ml-7">
                              <div className="space-y-2 mb-3">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Date:</span>
                                  <span className="text-sm">April 5, 2025</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Type:</span>
                                  <span className="text-sm">Benefits Approval</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Verified By:</span>
                                  <span className="text-sm">Government Agency</span>
                                </div>
                              </div>
                              <Separator className="my-3" />
                              <div className="flex justify-between items-center">
                                <Button variant="ghost" size="sm">View Details</Button>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Lock className="h-3 w-3 mr-1" />
                                  NFT Secured
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative border rounded-lg p-4">
                            <div className="absolute top-4 right-4">
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-100">
                                Pending
                              </Badge>
                            </div>
                            <div className="flex items-center mb-3">
                              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 mr-3">
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium">Medical Accommodation</h3>
                                <p className="text-sm text-muted-foreground">
                                  Workplace accommodation request
                                </p>
                              </div>
                            </div>
                            <div className="pl-13 ml-7">
                              <div className="space-y-2 mb-3">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Date:</span>
                                  <span className="text-sm">April 16, 2025</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Type:</span>
                                  <span className="text-sm">Accommodation Request</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Status:</span>
                                  <span className="text-sm">Awaiting Verification</span>
                                </div>
                              </div>
                              <Separator className="my-3" />
                              <div className="flex justify-between items-center">
                                <Button variant="ghost" size="sm">View Details</Button>
                                <Button variant="outline" size="sm">Complete Verification</Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border rounded-lg p-4 border-dashed">
                            <div className="text-center py-6">
                              <PlusCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <h3 className="font-medium mb-1">Document New Life Event</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Add a new life event for verification and secure documentation
                              </p>
                              <Button variant="outline">Add Life Event</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
            
            {/* Emergency Access Card - Always visible regardless of ID status */}
            <Card className="border-2 border-red-200 dark:border-red-900">
              <CardHeader className="bg-red-50 dark:bg-red-900/30">
                <CardTitle className="flex items-center text-red-700 dark:text-red-300">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Emergency Services Access
                </CardTitle>
                <CardDescription className="text-red-600/70 dark:text-red-300/70">
                  Provides critical information to first responders and law enforcement
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <p className="mb-4">
                    In emergency situations, your NFT-based ID can be accessed by authorized first responders,
                    healthcare providers, and law enforcement to ensure you receive appropriate assistance
                    with respect to your deaf identity and specific needs.
                  </p>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-md p-4 mb-4">
                    <h3 className="font-medium flex items-center mb-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      Critical Information Access
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Emergency services can access your critical information through a secure QR code
                      or by searching your registered ID in the secure emergency database.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Information Shared in Emergencies</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Deaf/HoH status</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Preferred communication method</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Emergency contact information</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Critical medical information</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Emergency Service Integration</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Law enforcement agencies</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Emergency medical services</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Hospital emergency departments</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Disaster response teams</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30 mr-3">
                    Emergency Card Settings
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Set Up Emergency Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}