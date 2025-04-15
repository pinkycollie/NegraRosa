import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  FileText, 
  Shield,
  Lock,
  UserCheck,
  FileCheck,
  Fingerprint,
  FileDigit,
  History,
  Link,
  PenTool,
  BrainCircuit,
  HardDrive,
  CircleCheck,
  ClipboardCheck,
  Eye,
  EyeOff,
  Users
} from "lucide-react";

interface DataArchitectureExplainerProps {
  userId: number;
}

export function DataArchitectureExplainer({ userId }: DataArchitectureExplainerProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              Your Data Security & Storage
            </CardTitle>
            <CardDescription>
              How we protect your information while making it work for you
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Enterprise-Grade Protection
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">How It Works</TabsTrigger>
            <TabsTrigger value="details">Your Data Types</TabsTrigger>
            <TabsTrigger value="control">Your Control</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <div className="flex gap-4">
                <Shield className="h-12 w-12 text-blue-500 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Your Data, Your Identity</h3>
                  <p className="text-blue-700">
                    We use a combination of advanced storage technology and blockchain verification to keep your 
                    identity data secure, private, and under your control. Unlike traditional systems that keep 
                    your data in one vulnerable location, we use a hybrid approach that gives you the benefits of 
                    both worlds.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-5 bg-white">
                <div className="flex items-center mb-4">
                  <Database className="h-6 w-6 text-indigo-500 mr-3" />
                  <h3 className="text-lg font-medium">Secure Database Storage</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Your documentation and verification data is stored in secure, encrypted databases that only
                  you and authorized parties can access. We use MongoDB, an enterprise-grade database system.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-700 mb-2">Benefits for you:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CircleCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Fast access to your documents when you need them</span>
                    </li>
                    <li className="flex items-start">
                      <CircleCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Ability to update information when corrections are needed</span>
                    </li>
                    <li className="flex items-start">
                      <CircleCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Support for complex documentation needs</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-5 bg-white">
                <div className="flex items-center mb-4">
                  <Link className="h-6 w-6 text-purple-500 mr-3" />
                  <h3 className="text-lg font-medium">Blockchain Verification</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  We use blockchain technology to create tamper-proof records of your identity verification. 
                  This includes your NFT identity and immutable audit trails of all access and changes.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-700 mb-2">Benefits for you:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CircleCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Permanent proof that can't be altered or deleted</span>
                    </li>
                    <li className="flex items-start">
                      <CircleCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Ability to prove document authenticity without revealing contents</span>
                    </li>
                    <li className="flex items-start">
                      <CircleCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Complete history of all changes and access to your data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="relative bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-6 mt-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-indigo-200 md:w-1/3">
                  <div className="flex items-center mb-3">
                    <Fingerprint className="h-6 w-6 text-indigo-500 mr-2" />
                    <h4 className="font-medium">Identity Documents</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    We securely store your identity documents and connect them to your NFT identity.
                  </p>
                  <Badge className="bg-indigo-100 text-indigo-800">KYC Verification</Badge>
                </div>
                
                <div className="bg-white p-5 rounded-lg shadow-sm border border-indigo-200 md:w-1/3">
                  <div className="flex items-center mb-3">
                    <FileCheck className="h-6 w-6 text-green-500 mr-2" />
                    <h4 className="font-medium">Claims & Records</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Your verification claims, court records, and submissions are stored with tracking.
                  </p>
                  <Badge className="bg-green-100 text-green-800">Status Tracking</Badge>
                </div>
                
                <div className="bg-white p-5 rounded-lg shadow-sm border border-indigo-200 md:w-1/3">
                  <div className="flex items-center mb-3">
                    <History className="h-6 w-6 text-blue-500 mr-2" />
                    <h4 className="font-medium">Audit Trails</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    We maintain permanent records of all access to your data for your security.
                  </p>
                  <Badge className="bg-blue-100 text-blue-800">Immutable Records</Badge>
                </div>
              </div>
              
              <div className="absolute bottom-2 right-2">
                <Badge variant="outline" className="text-xs">Hybrid Storage Architecture</Badge>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                Different types of data require different security approaches. We optimize our storage for each data type to ensure security, performance, and accessibility.
              </p>
            </div>
            
            <div className="space-y-5">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                  <div className="flex items-center">
                    <UserCheck className="h-5 w-5 text-indigo-600 mr-2" />
                    <h3 className="font-medium text-indigo-900">Identity Documents</h3>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-gray-600">
                    Your identification documents, verification photos, and KYC (Know Your Customer) information.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">How we store this data:</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start">
                        <HardDrive className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Encrypted database storage</span>
                          <p className="text-gray-500 mt-0.5">Your documents are encrypted and stored in our secure database.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Link className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Blockchain references</span>
                          <p className="text-gray-500 mt-0.5">Document hashes are stored on blockchain to verify authenticity without exposing content.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Shield className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">NFT metadata connections</span>
                          <p className="text-gray-500 mt-0.5">Your "I AM WHO I AM" NFT links to these documents for verification.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <div className="flex items-center">
                    <ClipboardCheck className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-blue-900">Claims & Submissions</h3>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-gray-600">
                    Your correction claims, verification submissions, and the status of each workflow.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">How we store this data:</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start">
                        <Database className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Workflow status tracking</span>
                          <p className="text-gray-500 mt-0.5">Each claim's progress is tracked from submission to verification.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Users className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">DAO voting references</span>
                          <p className="text-gray-500 mt-0.5">For disputed claims, we link to community verification voting results.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-green-50 p-4 border-b border-green-100">
                  <div className="flex items-center">
                    <FileDigit className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium text-green-900">Contracts & Agreements</h3>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-gray-600">
                    Legal agreements, consent records, and data sharing permissions.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">How we store this data:</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start">
                        <FileText className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">JSON contract storage</span>
                          <p className="text-gray-500 mt-0.5">Contracts are stored in structured format for easy processing.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Link className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">External references</span>
                          <p className="text-gray-500 mt-0.5">Links to immutable copies of agreements stored on blockchain.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-purple-50 p-4 border-b border-purple-100">
                  <div className="flex items-center">
                    <BrainCircuit className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="font-medium text-purple-900">AI-Generated Documentation</h3>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-gray-600">
                    Documents, explanations, and support materials generated by AI systems.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">How we store this data:</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start">
                        <PenTool className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Generation metadata</span>
                          <p className="text-gray-500 mt-0.5">We track which AI system created each document (DeepSeek, GPT, etc.).</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <History className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Provenance tracking</span>
                          <p className="text-gray-500 mt-0.5">Complete history of AI-generated content and human reviews.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-red-50 p-4 border-b border-red-100">
                  <div className="flex items-center">
                    <History className="h-5 w-5 text-red-600 mr-2" />
                    <h3 className="font-medium text-red-900">Audit Logs & Trails</h3>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-gray-600">
                    Records of all access to your data and changes made over time.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">How we store this data:</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start">
                        <Database className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Immutable database logs</span>
                          <p className="text-gray-500 mt-0.5">Every access to your data is recorded in tamper-proof logs.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Link className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Blockchain backup</span>
                          <p className="text-gray-500 mt-0.5">Critical audit events are also stored on Arweave for permanent record.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="control" className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Lock className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-800 mb-1">You Control Your Data</h3>
                  <p className="text-sm text-green-700">
                    Unlike other systems, NegraRosa gives you complete transparency and control over your data. 
                    You decide who sees what, when, and for how long.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-5">
                <h3 className="font-medium mb-4 flex items-center">
                  <Eye className="h-5 w-5 text-indigo-500 mr-2" />
                  <span>What You Can See</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Complete Data Inventory</h4>
                    <p className="text-sm text-gray-600">
                      View a complete list of all data we store about you, including documents, claims, and agreements.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Access Logs</h4>
                    <p className="text-sm text-gray-600">
                      See a detailed history of who has accessed your data, when, and for what purpose.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Data Sharing Status</h4>
                    <p className="text-sm text-gray-600">
                      View which companies currently have access to your data and what specific information they can see.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-5">
                <h3 className="font-medium mb-4 flex items-center">
                  <Lock className="h-5 w-5 text-blue-500 mr-2" />
                  <span>What You Can Control</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Permission Settings</h4>
                    <p className="text-sm text-gray-600">
                      Grant or revoke access to specific companies or services, with granular control over what they can see.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Data Corrections</h4>
                    <p className="text-sm text-gray-600">
                      Submit corrections or updates to your stored information when needed.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Export & Deletion</h4>
                    <p className="text-sm text-gray-600">
                      Request exports of your data or deletion of specific information you no longer wish to store.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-6 mt-4">
              <h3 className="font-medium mb-4">Your Security Dashboard</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <FileCheck className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Access History</h4>
                      <p className="text-sm text-gray-500">View a log of all access to your data</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View History</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Eye className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Company Access</h4>
                      <p className="text-sm text-gray-500">Manage which companies can view your data</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage Access</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <EyeOff className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Privacy Settings</h4>
                      <p className="text-sm text-gray-500">Control what data is visible to whom</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Adjust Settings</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Database className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Data Export</h4>
                      <p className="text-sm text-gray-500">Download a copy of all your stored information</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Request Export</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 bg-gray-50 flex justify-between">
        <p className="text-xs text-gray-500 flex items-center">
          <Shield className="h-3 w-3 mr-1 text-indigo-500" />
          Enterprise-grade security with user-friendly control
        </p>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
          <FileText className="h-4 w-4 mr-2" /> Privacy Policy
        </Button>
      </CardFooter>
    </Card>
  );
}