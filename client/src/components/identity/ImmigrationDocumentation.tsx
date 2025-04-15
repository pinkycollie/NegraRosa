import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  X,
  Shield,
  RefreshCcw,
  Globe,
  User
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ImmigrationDocumentationProps {
  userId: number;
}

export function ImmigrationDocumentation({ userId }: ImmigrationDocumentationProps) {
  const [activeTab, setActiveTab] = useState("documents");
  
  // Example immigration documents (in a real app these would come from an API/database)
  const immigrationDocuments = [
    {
      id: "imm1",
      documentType: "Residency Permit",
      documentNumber: "RP-2021-87654",
      issuingAuthority: "Department of Immigration",
      status: "active",
      expirationDate: "2025-08-15",
      hasNftBackup: true,
      issueDate: "2021-08-15",
      nftId: "0xf7e2c21a8bc6ef9c8b33a34e223c4a4bfcde8c1f"
    },
    {
      id: "imm2",
      documentType: "Work Authorization",
      documentNumber: "WA-2022-12345",
      issuingAuthority: "Department of Labor",
      status: "renewal-pending",
      expirationDate: "2023-10-20",
      hasNftBackup: true,
      issueDate: "2022-10-20",
      nftId: "0xe9c45a2b7d8f1e6c92a4f8d31e7b9c5a0d3e6f7a"
    }
  ];
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Active
        </Badge>;
      case "renewal-pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Renewal Pending
        </Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <X className="h-3 w-3" /> Expired
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              Immigration Documentation Protection
            </CardTitle>
            <CardDescription>
              Secure your immigration status with NFT-backed document guarantees.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            NFT Guaranteed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Shield className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-700">NFT Identity Protection</p>
            <p className="text-xs text-blue-700">
              Your "I AM WHO I AM" NFT acts as an immutable record of your identity. Even in cases where physical 
              documentation has errors or is lost, your NFT provides a guaranteed reference to your status and worth.
              This protection is especially valuable if authorities make mistakes in processing your documentation.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="documents" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="issues">Report Issues</TabsTrigger>
            <TabsTrigger value="backup">NFT Backup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents">
            {immigrationDocuments.length > 0 ? (
              <div className="space-y-4">
                {immigrationDocuments.map(doc => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">{doc.documentType}</h4>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Doc #: {doc.documentNumber}</p>
                    <p className="text-sm text-gray-600 mb-3">Issued by: {doc.issuingAuthority}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Issue Date: {doc.issueDate}</span>
                      <span>Expires: {doc.expirationDate}</span>
                    </div>
                    
                    {doc.hasNftBackup && (
                      <div className="bg-emerald-50 p-2 rounded-md text-xs text-emerald-700 mb-3 flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        <span>NFT Backed: {doc.nftId.substring(0, 8)}...{doc.nftId.substring(doc.nftId.length-8)}</span>
                      </div>
                    )}
                    
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="h-3 w-3 mr-1" /> View Document
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCcw className="h-3 w-3 mr-1" /> Renew/Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                You have not added any immigration documents yet.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="issues">
            <div className="space-y-4">
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Input id="documentType" placeholder="e.g. Green Card, Work Permit, Visa" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="documentNumber">Document Number</Label>
                <Input id="documentNumber" placeholder="Your document identification number" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="issueDescription">Describe the Issue</Label>
                <Textarea 
                  id="issueDescription" 
                  placeholder="Describe the errors or issues with your immigration documentation" 
                  className="mt-1 min-h-24" 
                />
              </div>
              
              <div>
                <Label>Supporting Evidence</Label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Drag and drop files or 
                    <span className="text-primary font-medium ml-1">browse files</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: PDF, JPG, PNG (Max 10MB)
                  </p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button className="w-full">Submit Issue Report</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="backup">
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <h3 className="font-medium text-amber-800 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Why NFT Backup Matters
                </h3>
                <p className="text-sm text-amber-700">
                  In cases of deportation errors, lost documents, or administrative mistakes, your NFT serves as an 
                  immutable record of your identity and status that cannot be erased or altered by authorities.
                </p>
              </div>
            
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-sm">How NFT Document Backup Works</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600 mb-2">
                      Your documents are securely hashed and stored on the blockchain as an NFT. The NFT contains:
                    </p>
                    <ul className="list-disc text-sm text-gray-600 pl-5 space-y-1 mb-2">
                      <li>Document verification hash</li>
                      <li>Issuance and expiration information</li>
                      <li>Biometric verification link</li>
                      <li>Authority attestations</li>
                    </ul>
                    <p className="text-sm text-gray-600">
                      This creates a permanent, tamper-proof record that exists independently of physical documents.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-sm">Protection Against Mistakes</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600">
                      If authorities make a mistake in processing your documentation or attempt deportation based on 
                      incorrect information, your NFT serves as immutable proof of your status. Legal advocates can 
                      use this blockchain verification to rapidly contest errors and prevent wrongful actions.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-sm">Emergency Recovery Access</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600">
                      In emergency situations, you can grant temporary access to your NFT identity to legal advocates 
                      or family members. This enables them to verify your identity and documentation status even if you 
                      are detained or unable to access your own records.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="pt-4 flex gap-3">
                <Button className="flex-1" variant="default">
                  <Shield className="h-4 w-4 mr-2" /> Create New Document NFT
                </Button>
                <Button className="flex-1" variant="outline">
                  <User className="h-4 w-4 mr-2" /> Assign Emergency Access
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}