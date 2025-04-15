import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Globe, 
  Code,
  GitMerge,
  Share2,
  FileCode,
  Users,
  TrendingUp,
  BarChart,
  Zap,
  DollarSign,
  Network,
  RefreshCcw,
  Box,
  Workflow,
  PlugZap,
  Puzzle
} from "lucide-react";

interface PartnershipIntegrationProps {
  userId: number;
}

export function PartnershipIntegration({ userId }: PartnershipIntegrationProps) {
  const [activeTab, setActiveTab] = useState("integration");

  return (
    <Card className="border-indigo-200">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <GitMerge className="h-5 w-5 text-indigo-600" />
              Security Ecosystem Integration
            </CardTitle>
            <CardDescription className="text-indigo-700">
              How NegraRosa complements and enhances existing security frameworks
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">
            Open API Access
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="integration" onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="integration">API Integration</TabsTrigger>
            <TabsTrigger value="partners">Partner Benefits</TabsTrigger>
            <TabsTrigger value="opensource">Open Source Funding</TabsTrigger>
          </TabsList>
          
          <TabsContent value="integration" className="space-y-6">
            <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 flex gap-4">
              <div className="bg-white p-3 rounded-full h-fit">
                <Puzzle className="h-10 w-10 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-indigo-900 mb-2">Better Together: Complementary Security</h3>
                <p className="text-indigo-800">
                  Rather than replacing existing security frameworks, NegraRosa is designed to integrate with and enhance them.
                  Our API-first approach allows traditional security systems to tap into our inclusive verification capabilities,
                  extending their reach to previously excluded users.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-green-200">
                <CardHeader className="bg-green-50 border-b border-green-100 pb-3">
                  <PlugZap className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle className="text-green-800 text-base">Seamless API Connection</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm">
                    Our RESTful API allows existing security platforms to connect with our verification methods
                    without replacing their entire infrastructure.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-100 pb-3">
                  <Network className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle className="text-blue-800 text-base">Extended Verification Network</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm">
                    Partners gain access to our alternative verification methods, expanding their user base
                    without compromising on security standards.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50 border-b border-purple-100 pb-3">
                  <RefreshCcw className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle className="text-purple-800 text-base">Two-Way Data Enrichment</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm">
                    Our integration allows for mutual data enrichment, with partners contributing to and benefiting
                    from our growing verification dataset.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="border rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-medium">Key Integration Capabilities</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                    <FileCode className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-900">Verification API</h4>
                    <p className="text-sm text-amber-800 mb-3">
                      Add our alternative verification methods to your existing security flow
                      to reduce false rejections and expand your user base.
                    </p>
                    <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                      <Code className="h-4 w-4 mr-2" /> View API Docs
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full mt-0.5">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">FibonRoseTRUST Score</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Integrate our nuanced trust scoring system to add progressive verification
                      capabilities to your existing risk assessment.
                    </p>
                    <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      <BarChart className="h-4 w-4 mr-2" /> Trust Score Documentation
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 p-2 rounded-full mt-0.5">
                    <Box className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-indigo-900">NFT Identity Bridge</h4>
                    <p className="text-sm text-indigo-800 mb-3">
                      Connect your system to our "I AM WHO I AM" NFT identity system for 
                      decentralized verification capabilities.
                    </p>
                    <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                      <Globe className="h-4 w-4 mr-2" /> Bridge SDK
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full mt-0.5">
                    <Workflow className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Workflow Integration</h4>
                    <p className="text-sm text-green-800 mb-3">
                      Add our verification flows to your existing onboarding process
                      to capture users who would otherwise be rejected.
                    </p>
                    <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                      <Share2 className="h-4 w-4 mr-2" /> Integration Examples
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="partners" className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Partnership Philosophy:</strong> We believe in creating mutually beneficial relationships where partners 
                strengthen their security frameworks while expanding their reach, and we gain broader adoption and data insights.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-100 pb-4">
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>For Security Providers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Reduce False Rejections</p>
                      <p className="text-sm text-blue-800">
                        Expand your verification capabilities to include users with complex documentation scenarios
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Expand Your Market</p>
                      <p className="text-sm text-blue-800">
                        Access previously excluded user segments, growing your addressable market
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <Network className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Enhanced Data Insights</p>
                      <p className="text-sm text-blue-800">
                        Gain access to our nuanced verification data to improve your risk models
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Maintain Security Standards</p>
                      <p className="text-sm text-blue-800">
                        Add inclusivity without compromising on your security requirements
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-indigo-200">
                <CardHeader className="bg-indigo-50 border-b border-indigo-100 pb-4">
                  <CardTitle className="text-indigo-800 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-indigo-600" />
                    <span>For Platform Businesses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <Users className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-indigo-900">Inclusive User Experience</p>
                      <p className="text-sm text-indigo-800">
                        Create onboarding flows that work for users from all backgrounds and circumstances
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <DollarSign className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-indigo-900">Revenue Growth</p>
                      <p className="text-sm text-indigo-800">
                        Increase conversion rates by reducing verification-related drop-offs
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <GitMerge className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-indigo-900">Easy Integration</p>
                      <p className="text-sm text-indigo-800">
                        Add our verification options alongside your existing identity verification
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <Shield className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-indigo-900">Risk-Aligned Access</p>
                      <p className="text-sm text-indigo-800">
                        Onboard more users with access levels aligned to their verification status
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-green-200">
              <CardHeader className="bg-green-50 border-b border-green-100 pb-4">
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Puzzle className="h-5 w-5 text-green-600" />
                  <span>Integration Success Stories</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-5">
                  <div className="p-4 border border-green-100 rounded-lg bg-white">
                    <h4 className="font-medium text-green-900 mb-2">Financial Services Partner</h4>
                    <p className="text-sm text-green-800 mb-3">
                      A lending platform integrated our alternative documentation verification, expanding 
                      their approved applicant pool by 15% while maintaining the same default rate.
                    </p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      15% User Growth
                    </Badge>
                  </div>
                  
                  <div className="p-4 border border-green-100 rounded-lg bg-white">
                    <h4 className="font-medium text-green-900 mb-2">Housing Verification Service</h4>
                    <p className="text-sm text-green-800 mb-3">
                      A tenant screening service added our court records correction flow, reducing 
                      rejection rates by 22% for applicants with past documentation errors.
                    </p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      22% Reduction in Rejections
                    </Badge>
                  </div>
                  
                  <div className="p-4 border border-green-100 rounded-lg bg-white">
                    <h4 className="font-medium text-green-900 mb-2">Immigration Support Platform</h4>
                    <p className="text-sm text-green-800 mb-3">
                      An immigration services company integrated our documentation verification system, 
                      improving application success rates by 28%.
                    </p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      28% Improved Success Rate
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="opensource" className="space-y-6">
            <div className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 flex gap-4">
              <div className="bg-white p-3 rounded-full h-fit">
                <Code className="h-10 w-10 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-purple-900 mb-2">Open Source Ecosystem</h3>
                <p className="text-purple-800">
                  We believe that security and inclusion are community efforts. Our open source approach ensures 
                  transparency, encourages innovation, and creates sustainable funding for continued development.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Our Open Source Model</h3>
                
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full mt-0.5 flex-shrink-0">
                      <GitMerge className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-indigo-900">Core Components as Open Source</h4>
                      <p className="text-sm text-indigo-800">
                        Our core verification logic and identity framework are available as open source libraries,
                        enabling transparency and community contributions.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full mt-0.5 flex-shrink-0">
                      <PlugZap className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-indigo-900">Premium API Services</h4>
                      <p className="text-sm text-indigo-800">
                        We offer premium API access and enhanced features that fund the continued 
                        development of our open source components.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full mt-0.5 flex-shrink-0">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-indigo-900">Community Contributions</h4>
                      <p className="text-sm text-indigo-800">
                        We welcome code contributions, documentation improvements, and integration examples 
                        from our community of developers and partners.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sustainable Funding Model</h3>
                
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full mt-0.5 flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">API Revenue Sharing</h4>
                      <p className="text-sm text-green-800">
                        A portion of our API revenue is allocated to maintaining and enhancing 
                        our open source components and supporting contributors.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full mt-0.5 flex-shrink-0">
                      <Puzzle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">Partner Integration Funding</h4>
                      <p className="text-sm text-green-800">
                        Partners who integrate our API contribute to the development fund, 
                        ensuring the security ecosystem continues to evolve and improve.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full mt-0.5 flex-shrink-0">
                      <Box className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">NFT-Based Funding</h4>
                      <p className="text-sm text-green-800">
                        Our "I AM WHO I AM" NFT system generates funding for continued development
                        through minting and transaction fees.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">How Partners Benefit from Open Source</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Transparency</h4>
                  <p className="text-sm text-blue-800">
                    Full visibility into how our verification systems work, enhancing trust and auditability
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Customization</h4>
                  <p className="text-sm text-blue-800">
                    Ability to adapt and extend our components to meet specific business needs
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Community Support</h4>
                  <p className="text-sm text-blue-800">
                    Access to a growing ecosystem of developers building complementary tools
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <GitMerge className="h-4 w-4 mr-2" /> Join Our Open Source Community
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t border-indigo-100 bg-indigo-50 px-6 py-4 flex justify-between">
        <p className="text-xs text-indigo-700 flex items-center">
          <Network className="h-3 w-3 mr-1 text-indigo-600" />
          Building a more inclusive security ecosystem together
        </p>
        <Button variant="outline" size="sm" className="text-indigo-700 bg-white border-indigo-200 hover:bg-indigo-100">
          <FileCode className="h-3 w-3 mr-1" /> API Documentation
        </Button>
      </CardFooter>
    </Card>
  );
}