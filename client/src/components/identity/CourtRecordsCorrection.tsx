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
  RefreshCcw
} from "lucide-react";

interface CourtRecordsCorrectionProps {
  userId: number;
}

export function CourtRecordsCorrection({ userId }: CourtRecordsCorrectionProps) {
  const [activeTab, setActiveTab] = useState("corrections");
  
  // In a real app, these would be fetched from an API
  const courtRecords = [
    {
      id: "cr1",
      caseNumber: "CR-2019-12345",
      court: "County Court, State X",
      description: "Record contains outdated information about a misdemeanor charge that was dismissed.",
      status: "correction-in-progress",
      dateSubmitted: "2023-05-12",
      lastUpdated: "2023-06-15"
    },
    {
      id: "cr2",
      caseNumber: "CR-2017-54321",
      court: "Municipal Court, City Y",
      description: "Case was expunged but still appears in background checks.",
      status: "approved",
      dateSubmitted: "2022-11-03",
      lastUpdated: "2023-02-22"
    }
  ];
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "correction-in-progress":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
          <Clock className="h-3 w-3" /> In Progress
        </Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Corrected
        </Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <X className="h-3 w-3" /> Rejected
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
              <Shield className="h-5 w-5 text-blue-600" />
              Court Records Correction
            </CardTitle>
            <CardDescription>
              Fix errors in court records that are impacting your opportunities.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Powered by MongoDB
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-start p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700">Why This Matters</p>
            <p className="text-xs text-amber-700">
              Court records are often filled with errors, can be outdated, or fail to reflect the full context. 
              These errors can severely impact your housing, employment, and financial opportunities.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="corrections" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="corrections">My Correction Requests</TabsTrigger>
            <TabsTrigger value="new">Submit New Correction</TabsTrigger>
          </TabsList>
          
          <TabsContent value="corrections">
            {courtRecords.length > 0 ? (
              <div className="space-y-4">
                {courtRecords.map(record => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">{record.caseNumber}</h4>
                      {getStatusBadge(record.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{record.court}</p>
                    <p className="text-sm mb-3">{record.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Submitted: {record.dateSubmitted}</span>
                      <span>Last Updated: {record.lastUpdated}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="h-3 w-3 mr-1" /> View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCcw className="h-3 w-3 mr-1" /> Check Status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                You have not submitted any court record corrections yet.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="new">
            <div className="space-y-4">
              <div>
                <Label htmlFor="caseNumber">Case Number</Label>
                <Input id="caseNumber" placeholder="e.g. CR-2021-12345" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="court">Court Name</Label>
                <Input id="court" placeholder="e.g. County Court, State X" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="description">Description of Error</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe what's wrong with the record and how it should be corrected" 
                  className="mt-1 min-h-24" 
                />
              </div>
              
              <div>
                <Label>Supporting Documents</Label>
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
                <Button className="w-full">Submit Correction Request</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}