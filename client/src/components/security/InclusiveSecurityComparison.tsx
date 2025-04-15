import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Check, 
  X,
  UserX,
  UserCheck,
  Clock,
  FileText,
  Users,
  TrendingUp,
  BarChart,
  Eye,
  EyeOff,
  LockIcon,
  Unlock,
  Scale,
  HeartHandshake
} from "lucide-react";

interface InclusiveSecurityComparisonProps {
  userId: number;
}

export function InclusiveSecurityComparison({ userId }: InclusiveSecurityComparisonProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Card className="border-indigo-200">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <Shield className="h-5 w-5 text-indigo-600" />
              NegraRosa TRUST IDENTITY Framework
            </CardTitle>
            <CardDescription className="text-indigo-700">
              A new approach to digital identity that prioritizes inclusion without compromising security
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">
            FibonRoseTRUST Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Our Approach</TabsTrigger>
            <TabsTrigger value="comparison">Framework Comparison</TabsTrigger>
            <TabsTrigger value="benefits">User Benefits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 flex gap-4">
              <div className="bg-white p-3 rounded-full h-fit">
                <Shield className="h-10 w-10 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-indigo-900 mb-2">Rethinking Security & Identity</h3>
                <p className="text-indigo-800">
                  Traditional security frameworks tend to exclude users at the first sign of "risk" or documentation errors. 
                  Our NegraRosa framework takes a fundamentally different approach: we focus on creating multiple paths to verification,
                  allowing users to prove their identity and build trust even when traditional documentation fails them.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-green-200">
                <CardHeader className="bg-green-50 border-b border-green-100 pb-3">
                  <HeartHandshake className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle className="text-green-800 text-base">Inclusivity First</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm">
                    We design for users traditionally excluded by rigid verification systems, 
                    including immigrants, those with court record errors, and parents with complex financial situations.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-100 pb-3">
                  <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle className="text-blue-800 text-base">Progressive Trust</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm">
                    Using our Fibonacci-based trust algorithm, users can build trust over time through 
                    multiple forms of verification rather than facing binary accept/reject decisions.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50 border-b border-purple-100 pb-3">
                  <Users className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle className="text-purple-800 text-base">Community Validation</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm">
                    Our NFT-based identity system allows community validation to supplement traditional verification,
                    providing social proof when institutional documentation fails.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium">Core Framework Principles</h3>
              
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                  <Scale className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-amber-900">Balance, Not Exclusion</h4>
                  <p className="text-sm text-amber-800">
                    Instead of rejecting users who don't fit perfect profiles, we apply proportional risk management
                    with restrictions that match actual risk levels.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-emerald-100 p-2 rounded-full mt-0.5">
                  <Unlock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-medium text-emerald-900">Self-Sovereign Identity</h4>
                  <p className="text-sm text-emerald-800">
                    Users control their own data and choose which verification methods work best for their situation,
                    rather than being forced through a one-size-fits-all process.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full mt-0.5">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Radical Transparency</h4>
                  <p className="text-sm text-blue-800">
                    Our framework makes visible what's typically hidden: how decisions are made, what data is used,
                    and how users can improve their standing in the system.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Why different approaches matter:</strong> Traditional security frameworks were built for 
                institutions, not individuals. They prioritize false-positive prevention over inclusion, leading
                to significant exclusion of legitimate users with complex documentation situations.
              </p>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Feature</th>
                    <th className="text-center p-4 font-medium text-gray-600">Traditional Framework</th>
                    <th className="text-center p-4 font-medium text-indigo-600">NegraRosa Framework</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium">Identity Verification</td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <UserX className="h-5 w-5 text-red-500 mb-1" />
                        <span className="text-sm">Single path, rigid requirements</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <UserCheck className="h-5 w-5 text-green-500 mb-1" />
                        <span className="text-sm">Multiple verification paths</span>
                      </div>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium">Documentation Errors</td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <X className="h-5 w-5 text-red-500 mb-1" />
                        <span className="text-sm">Automatic rejection</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="h-5 w-5 text-green-500 mb-1" />
                        <span className="text-sm">Correction mechanisms</span>
                      </div>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium">Trust Building</td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <LockIcon className="h-5 w-5 text-red-500 mb-1" />
                        <span className="text-sm">Binary decisions</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <TrendingUp className="h-5 w-5 text-green-500 mb-1" />
                        <span className="text-sm">Progressive trust building</span>
                      </div>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium">Data Control</td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <EyeOff className="h-5 w-5 text-red-500 mb-1" />
                        <span className="text-sm">Opaque use of user data</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <Eye className="h-5 w-5 text-green-500 mb-1" />
                        <span className="text-sm">User-controlled data sharing</span>
                      </div>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium">Edge Cases</td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <UserX className="h-5 w-5 text-red-500 mb-1" />
                        <span className="text-sm">Excluded by design</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="h-5 w-5 text-green-500 mb-1" />
                        <span className="text-sm">Alternative paths provided</span>
                      </div>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium">Risk Management</td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <X className="h-5 w-5 text-red-500 mb-1" />
                        <span className="text-sm">All-or-nothing access</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <Scale className="h-5 w-5 text-green-500 mb-1" />
                        <span className="text-sm">Graduated restrictions</span>
                      </div>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium">Reputation Recovery</td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <Clock className="h-5 w-5 text-red-500 mb-1" />
                        <span className="text-sm">Slow or non-existent</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <TrendingUp className="h-5 w-5 text-green-500 mb-1" />
                        <span className="text-sm">Built-in recovery paths</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <BarChart className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>Key Insight:</strong> Traditional frameworks optimize for excluding potential 
                bad actors at the cost of excluding legitimate users. NegraRosa optimizes for including legitimate users
                while managing (rather than eliminating) risk.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="benefits" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-5 bg-gradient-to-br from-white to-indigo-50">
                <h3 className="text-lg font-medium mb-3 text-indigo-900">For Individuals with Complex Histories</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-1.5 rounded-full mt-0.5">
                      <Check className="h-4 w-4 text-indigo-600" />
                    </div>
                    <p className="text-sm text-indigo-800">
                      <span className="font-medium">Multiple verification paths</span> when standard documentation isn't available
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-1.5 rounded-full mt-0.5">
                      <Check className="h-4 w-4 text-indigo-600" />
                    </div>
                    <p className="text-sm text-indigo-800">
                      <span className="font-medium">Court record corrections</span> for those with inaccurate legal documentation
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-1.5 rounded-full mt-0.5">
                      <Check className="h-4 w-4 text-indigo-600" />
                    </div>
                    <p className="text-sm text-indigo-800">
                      <span className="font-medium">Immigration documentation support</span> for those affected by errors or deportation issues
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-1.5 rounded-full mt-0.5">
                      <Check className="h-4 w-4 text-indigo-600" />
                    </div>
                    <p className="text-sm text-indigo-800">
                      <span className="font-medium">Progressive trust building</span> allowing access to grow over time with consistent behavior
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-5 bg-gradient-to-br from-white to-blue-50">
                <h3 className="text-lg font-medium mb-3 text-blue-900">For Companies & Verification Partners</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-full mt-0.5">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Broader customer base</span> by accessing previously excluded but legitimate users
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-full mt-0.5">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Better risk assessment</span> through nuanced reputation building rather than binary decisions
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-full mt-0.5">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Comprehensive user data</span> with explicit user consent and transparent sharing
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-full mt-0.5">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Reduced false positives</span> in risk assessment by focusing on actual behavior patterns
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-5 bg-gradient-to-br from-white to-amber-50 md:col-span-2">
                <h3 className="text-lg font-medium mb-3 text-amber-900">Real-World Impact</h3>
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-amber-800 font-medium">The NegraRosa framework specifically addresses:</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                    <h4 className="font-medium text-amber-900 mb-2">Court Record Errors</h4>
                    <p className="text-sm text-amber-800">
                      For people with incorrect or outdated court records that prevent housing, employment, or financial opportunities
                    </p>
                  </div>
                  
                  <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                    <h4 className="font-medium text-amber-900 mb-2">Immigration Documentation</h4>
                    <p className="text-sm text-amber-800">
                      For those affected by immigration system errors, deportation mistakes, or complex multinational histories
                    </p>
                  </div>
                  
                  <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                    <h4 className="font-medium text-amber-900 mb-2">Family Support Documentation</h4>
                    <p className="text-sm text-amber-800">
                      For parents dealing with child support issues, family financial responsibilities, and unofficial support arrangements
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <Shield className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-green-900 mb-1">The "I AM WHO I AM" NFT Difference</h3>
                <p className="text-sm text-green-800">
                  At the heart of our approach is the NFT-based identity system that serves as both an identity 
                  verification tool and a community-backed endorsement. When traditional systems fail, your 
                  NFT identity can still guarantee your worth through community validation, providing an 
                  unbreakable lifeline to digital identity that can't be erased or forgotten.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t border-indigo-100 bg-indigo-50 px-6 py-4 flex justify-between">
        <p className="text-xs text-indigo-700 flex items-center">
          <Shield className="h-3 w-3 mr-1 text-indigo-600" />
          Rethinking security for real human lives
        </p>
        <Button variant="outline" size="sm" className="text-indigo-700 bg-white border-indigo-200 hover:bg-indigo-100">
          Learn More About Our Approach
        </Button>
      </CardFooter>
    </Card>
  );
}