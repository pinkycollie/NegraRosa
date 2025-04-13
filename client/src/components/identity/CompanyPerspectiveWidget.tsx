import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, DollarSign, Users, Clock, TrendingUp, AlertTriangle, FileText } from "lucide-react";

interface CompanyPerspectiveProps {
  userId: number;
}

interface HiringMetrics {
  recruitmentCost: number;
  onboardingCost: number;
  trainingCost: number;
  potentialLossIfQuit: number;
  averageTenure: number;
  positionValue: number;
  riskAssessment: {
    turnoverRisk: number;
    performanceProjection: number;
    cultureFit: number;
    skillGaps: string[];
  };
  recommendations: string[];
}

// This would come from the API in a real implementation
const mockCompanies = [
  { id: 1, name: "Tech Innovators Inc." },
  { id: 2, name: "Global Finance Group" },
  { id: 3, name: "Healthcare Solutions" },
  { id: 4, name: "Retail Excellence" },
  { id: 5, name: "Manufacturing Pro" },
];

export function CompanyPerspectiveWidget({ userId }: CompanyPerspectiveProps) {
  const [selectedCompany, setSelectedCompany] = useState<number>(1);
  
  // This would fetch real data in a production environment
  const { data: metrics, isLoading } = useQuery<HiringMetrics>({
    queryKey: [`/api/users/${userId}/company-perspective/${selectedCompany}`],
    // In a real implementation, this would be removed and the API would be called
    enabled: false,
  });

  // Mock data for demonstration
  const demoMetrics: HiringMetrics = {
    recruitmentCost: 5800,
    onboardingCost: 3200,
    trainingCost: 4500,
    potentialLossIfQuit: 32000,
    averageTenure: 3.2,
    positionValue: 85000,
    riskAssessment: {
      turnoverRisk: 35,
      performanceProjection: 72,
      cultureFit: 85,
      skillGaps: ["Advanced SQL", "Project Management", "Team Leadership"]
    },
    recommendations: [
      "Consider highlighting your long-term career goals to address turnover concerns",
      "Emphasize your team collaboration success stories during interviews",
      "Showcase any SQL projects or experience you have, even if limited"
    ]
  };

  const chartData = [
    { name: "Recruitment", cost: demoMetrics.recruitmentCost },
    { name: "Onboarding", cost: demoMetrics.onboardingCost },
    { name: "Training", cost: demoMetrics.trainingCost },
  ];

  const costBreakdownData = [
    { name: "Your Position", cost: demoMetrics.positionValue },
    { name: "If You Quit", cost: demoMetrics.potentialLossIfQuit + demoMetrics.positionValue },
  ];

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading company perspective data...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Company Perspective</CardTitle>
            <CardDescription>
              See yourself through a company's eyes: hiring costs, value, and business impact
            </CardDescription>
          </div>
          <div className="flex-shrink-0">
            <select 
              className="text-sm border rounded-md p-1"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(Number(e.target.value))}
            >
              {mockCompanies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hiring-costs">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="hiring-costs">
              <DollarSign className="h-4 w-4 mr-1" /> Hiring Costs
            </TabsTrigger>
            <TabsTrigger value="business-impact">
              <TrendingUp className="h-4 w-4 mr-1" /> Business Impact
            </TabsTrigger>
            <TabsTrigger value="insights">
              <FileText className="h-4 w-4 mr-1" /> Insights
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="hiring-costs" className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium flex items-center mb-2">
                <DollarSign className="h-5 w-5 mr-1 text-primary" /> 
                Investment to Hire You
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Companies invest significant resources in hiring. Understanding this perspective helps you value your position and make informed career decisions.
              </p>
              
              <div className="h-64 my-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="cost" fill="#8884d8" name="Cost ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center mt-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Investment</p>
                  <p className="text-xl font-bold text-primary">
                    ${demoMetrics.recruitmentCost + demoMetrics.onboardingCost + demoMetrics.trainingCost}
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Avg. Tenure</p>
                  <p className="text-xl font-bold text-amber-600">
                    {demoMetrics.averageTenure} years
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Potential Loss</p>
                  <p className="text-xl font-bold text-red-600">
                    ${demoMetrics.potentialLossIfQuit}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="business-impact" className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium flex items-center mb-2">
                <TrendingUp className="h-5 w-5 mr-1 text-primary" /> 
                Business Value & Impact
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your position's value goes beyond salary - see how companies calculate your contribution and potential business impact.
              </p>
              
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-green-50 p-4 rounded-lg text-center">
                  <h4 className="text-sm font-medium text-green-700 mb-1">Position Value</h4>
                  <p className="text-2xl font-bold">${demoMetrics.positionValue}</p>
                  <p className="text-xs text-muted-foreground mt-1">Annual contribution value</p>
                </div>
                
                <div className="flex-1 bg-red-50 p-4 rounded-lg text-center">
                  <h4 className="text-sm font-medium text-red-700 mb-1">Turnover Cost</h4>
                  <p className="text-2xl font-bold">${demoMetrics.potentialLossIfQuit}</p>
                  <p className="text-xs text-muted-foreground mt-1">Lost if you leave early</p>
                </div>
              </div>
              
              <h4 className="text-sm font-medium mb-2">Total Cost Comparison</h4>
              <div className="h-64 my-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="cost" fill="#10b981" name="Cost ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 text-sm">
                <p className="text-muted-foreground">
                  <strong>Key takeaway:</strong> Companies see your employment as both an investment and risk. When you understand this perspective, you can better position yourself as a valuable, long-term asset.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium flex items-center mb-2">
                <FileText className="h-5 w-5 mr-1 text-primary" /> 
                Employer Insights & Assessment
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                How companies might assess your profile and what you can do to improve your positioning.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 border rounded-lg">
                  <h4 className="text-xs font-medium mb-1">Turnover Risk</h4>
                  <div className="flex items-end gap-2">
                    <div className="text-xl font-bold">{demoMetrics.riskAssessment.turnoverRisk}%</div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${
                      demoMetrics.riskAssessment.turnoverRisk < 40 ? 'bg-green-100 text-green-800' :
                      demoMetrics.riskAssessment.turnoverRisk < 70 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {demoMetrics.riskAssessment.turnoverRisk < 40 ? 'Low' :
                       demoMetrics.riskAssessment.turnoverRisk < 70 ? 'Medium' : 'High'}
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <h4 className="text-xs font-medium mb-1">Performance Projection</h4>
                  <div className="flex items-end gap-2">
                    <div className="text-xl font-bold">{demoMetrics.riskAssessment.performanceProjection}%</div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${
                      demoMetrics.riskAssessment.performanceProjection > 70 ? 'bg-green-100 text-green-800' :
                      demoMetrics.riskAssessment.performanceProjection > 40 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {demoMetrics.riskAssessment.performanceProjection > 70 ? 'High' :
                       demoMetrics.riskAssessment.performanceProjection > 40 ? 'Medium' : 'Low'}
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <h4 className="text-xs font-medium mb-1">Culture Fit</h4>
                  <div className="flex items-end gap-2">
                    <div className="text-xl font-bold">{demoMetrics.riskAssessment.cultureFit}%</div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${
                      demoMetrics.riskAssessment.cultureFit > 70 ? 'bg-green-100 text-green-800' :
                      demoMetrics.riskAssessment.cultureFit > 40 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {demoMetrics.riskAssessment.cultureFit > 70 ? 'Strong' :
                       demoMetrics.riskAssessment.cultureFit > 40 ? 'Moderate' : 'Weak'}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                    Potential Skill Gaps
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {demoMetrics.riskAssessment.skillGaps.map((skill, i) => (
                      <Badge key={i} variant="outline" className="bg-amber-50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">Recommendations to Improve Your Standing</h4>
                  <ul className="mt-2 space-y-2">
                    {demoMetrics.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <Button className="w-full mt-6">
                Download Detailed Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}