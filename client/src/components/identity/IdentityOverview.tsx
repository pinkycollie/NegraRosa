import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { IdentitySummary } from "@/lib/types";
import { Shield, Eye, FileText, Key, AlertCircle, Edit, RefreshCw } from "lucide-react";
import { DataVisibilityControl } from "./DataVisibilityControl";
import { ExplanationEditor } from "./ExplanationEditor";
import { NFTIdentityCard } from "./NFTIdentityCard";

interface IdentityOverviewProps {
  userId: number;
}

export function IdentityOverview({ userId }: IdentityOverviewProps) {
  const [activeSection, setActiveSection] = useState<string>("visibility");
  
  const { data: identitySummary, isLoading } = useQuery<IdentitySummary>({
    queryKey: [`/api/users/${userId}/identity-summary`],
  });

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading identity data...</p>
      </div>
    );
  }

  if (!identitySummary) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
        <p className="font-semibold">Unable to load identity data</p>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top card: Identity Score and NFT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Identity Overview</CardTitle>
            <CardDescription>
              See what companies and services know about you, control your data visibility, and add explanations to your data points.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="text-lg font-medium">Identity Score</h3>
                    <p className="text-sm text-muted-foreground">Based on verified attributes and completeness</p>
                  </div>
                  <div className="text-2xl font-bold">{identitySummary.identityScore}%</div>
                </div>
                <Progress value={identitySummary.identityScore} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="flex items-center gap-2 font-medium mb-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    Verified Attributes
                  </h4>
                  <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
                    {identitySummary.verifiedAttributes.map((attr, i) => (
                      <li key={i}>{attr}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="flex items-center gap-2 font-medium mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Missing Attributes
                  </h4>
                  <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
                    {identitySummary.missingAttributes.map((attr, i) => (
                      <li key={i}>{attr}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* NFT Authentication Card */}
        <NFTIdentityCard userId={userId} />
      </div>
      
      {/* Tabs for different identity management features */}
      <Card>
        <CardHeader>
          <Tabs defaultValue="visibility" onValueChange={setActiveSection}>
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="visibility" className="flex items-center gap-2">
                <Eye className="h-4 w-4" /> Data Visibility
              </TabsTrigger>
              <TabsTrigger value="explanations" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Add Explanations
              </TabsTrigger>
              <TabsTrigger value="assessments" className="flex items-center gap-2">
                <Key className="h-4 w-4" /> Risk Assessments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="visibility">
              <DataVisibilityControl userId={userId} />
            </TabsContent>
            
            <TabsContent value="explanations">
              <ExplanationEditor userId={userId} />
            </TabsContent>
            
            <TabsContent value="assessments">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground pb-2">
                  Recent risk assessments and decisions that companies have made based on your data. 
                  Knowledge is power - see exactly what factors influenced decisions about you.
                </p>
                
                {identitySummary.riskAssessments.length > 0 ? (
                  <div className="space-y-4">
                    {identitySummary.riskAssessments.map((assessment, i) => (
                      <div key={i} className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">{assessment.date}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            assessment.decision === 'Approved' ? 'bg-green-100 text-green-800' : 
                            assessment.decision === 'Restricted' ? 'bg-amber-100 text-amber-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {assessment.decision}
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          <span className="text-sm mr-2">Risk Score:</span>
                          <Progress value={assessment.score} className="h-2 flex-1" />
                          <span className="text-sm ml-2">{assessment.score}%</span>
                        </div>
                        <h5 className="text-sm font-medium mt-3 mb-1">Factors Considered:</h5>
                        <ul className="space-y-1 text-xs text-muted-foreground ml-4 list-disc">
                          {assessment.factors.map((factor, j) => (
                            <li key={j}>{factor}</li>
                          ))}
                        </ul>
                        <Button variant="outline" size="sm" className="mt-3">
                          <Edit className="h-3 w-3 mr-1" /> Add Context
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No risk assessments have been performed yet.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
      
      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Your Data Sources</CardTitle>
          <CardDescription>
            Companies and services that have contributed to your identity profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {identitySummary.dataSources.map((source, i) => (
              <div key={i} className="border rounded-lg p-4">
                <h4 className="font-medium">{source.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {source.count} data points
                </p>
                {source.lastAccessed && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last accessed: {source.lastAccessed}
                  </p>
                )}
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  <Eye className="h-3 w-3 mr-1" /> View Data
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Contextual Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Contextual Understanding</CardTitle>
          <CardDescription>
            Additional factors that help explain your unique situation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {identitySummary.contextualFactors.length > 0 ? (
              identitySummary.contextualFactors.map((factor, i) => (
                <div key={i} className={`p-4 rounded-lg border ${
                  factor.impact === 'positive' ? 'border-green-200 bg-green-50' :
                  factor.impact === 'negative' ? 'border-red-200 bg-red-50' :
                  'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className="font-medium">{factor.type}</h4>
                  <p className="text-sm mt-1">{factor.explanation}</p>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-muted-foreground">Source: {factor.dataSource}</span>
                    <span className={
                      factor.impact === 'positive' ? 'text-green-600' :
                      factor.impact === 'negative' ? 'text-red-600' :
                      'text-gray-600'
                    }>
                      {factor.impact.charAt(0).toUpperCase() + factor.impact.slice(1)} Impact
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No contextual factors have been added yet.
              </div>
            )}
            
            <Button className="w-full">
              <Edit className="h-4 w-4 mr-2" /> Add a New Explanation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}