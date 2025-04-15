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
  DollarSign,
  HandHeart,
  CreditCard,
  Building,
  RefreshCcw,
  ListFilter
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FinancialHistoryVerificationProps {
  userId: number;
}

export function FinancialHistoryVerification({ userId }: FinancialHistoryVerificationProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Example financial history data (in a real app, this would come from an API/database)
  const financialHistory = {
    trustScore: 78,
    loans: [
      {
        id: "loan1",
        type: "Small Business Loan",
        provider: "Community First Bank",
        amount: 5000,
        status: "repaid",
        dateIssued: "2022-03-15",
        dateCompleted: "2023-03-15",
        purpose: "Purchase of equipment for mobile food service",
        outcome: "Business successfully launched, all payments made on time",
        verified: true
      },
      {
        id: "loan2",
        type: "Personal Loan",
        provider: "Credit Union X",
        amount: 2000,
        status: "active",
        dateIssued: "2023-08-10",
        dateCompleted: null,
        purpose: "Education expenses",
        outcome: "In progress - enrolled in certification program",
        verified: true
      }
    ],
    grants: [
      {
        id: "grant1",
        program: "Minority Business Development",
        provider: "State Economic Development",
        amount: 7500,
        status: "completed",
        dateIssued: "2021-06-22",
        dateCompleted: "2022-06-22",
        purpose: "Business development training and mentorship",
        outcome: "Completed program, increased revenue by 45%",
        verified: true
      }
    ],
    donations: [
      {
        id: "donation1",
        campaign: "Community Kitchen Renovation",
        platform: "GoFundMe",
        amount: 3000,
        status: "completed",
        dateIssued: "2023-01-05",
        dateCompleted: "2023-02-28",
        purpose: "Purchase new equipment for community kitchen serving low-income residents",
        outcome: "Kitchen renovation completed, now serving 200 meals/week",
        verified: true,
        proofSubmitted: true
      }
    ]
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "repaid":
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Completed
        </Badge>;
      case "active":
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Active
        </Badge>;
      case "defaulted":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <X className="h-3 w-3" /> Defaulted
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getVerifiedBadge = (verified: boolean) => {
    return verified ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" /> Verified
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
        <Clock className="h-3 w-3" /> Pending Verification
      </Badge>
    );
  };
  
  const getFinancialTypeIcon = (type: string) => {
    switch(type) {
      case "loan":
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case "grant":
        return <Building className="h-5 w-5 text-emerald-600" />;
      case "donation":
        return <HandHeart className="h-5 w-5 text-purple-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial History Verification
            </CardTitle>
            <CardDescription>
              Show how you've responsibly used loans, grants, and managed donation campaigns.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Trust Score: {financialHistory.trustScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-start p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-700">Why This Matters</p>
            <p className="text-xs text-amber-700">
              Your financial history demonstrates responsibility and accountability. Proving you've properly used loans, 
              grants, or donation funds builds a positive reputation and increases your trustworthiness score.
              All data is verified against financial records with your permission.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="grants">Grants</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Financial Trust Profile</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Overall Trust Score</span>
                      <span className="text-sm">{financialHistory.trustScore}%</span>
                    </div>
                    <Progress value={financialHistory.trustScore} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium">Loans</h4>
                      </div>
                      <div className="text-2xl font-semibold mb-1">{financialHistory.loans.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {financialHistory.loans.filter(l => l.status === "repaid").length} repaid successfully
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Building className="h-5 w-5 text-emerald-600 mr-2" />
                        <h4 className="font-medium">Grants</h4>
                      </div>
                      <div className="text-2xl font-semibold mb-1">{financialHistory.grants.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {financialHistory.grants.filter(g => g.status === "completed").length} completed successfully
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <HandHeart className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-medium">Donations</h4>
                      </div>
                      <div className="text-2xl font-semibold mb-1">{financialHistory.donations.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {financialHistory.donations.filter(d => d.proofSubmitted).length} with proof of use
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {[...financialHistory.loans, ...financialHistory.grants, ...financialHistory.donations]
                    .sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime())
                    .slice(0, 3)
                    .map((item, index) => {
                      const isLoan = 'type' in item && typeof item.type === 'string';
                      const isGrant = 'program' in item;
                      const isDonation = 'campaign' in item;
                      
                      const title = isLoan ? item.type : 
                                    isGrant ? item.program :
                                    isDonation ? item.campaign : 'Unknown';
                                    
                      const provider = isLoan ? item.provider :
                                      isGrant ? item.provider :
                                      isDonation ? item.platform : 'Unknown';
                                      
                      const type = isLoan ? 'loan' : isGrant ? 'grant' : 'donation';
                      
                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              {getFinancialTypeIcon(type)}
                              <div className="ml-2">
                                <h4 className="font-medium">{title}</h4>
                                <p className="text-sm text-muted-foreground">{provider}</p>
                              </div>
                            </div>
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="flex items-center justify-between mt-2 text-sm">
                            <span>${item.amount.toLocaleString()}</span>
                            <span className="text-muted-foreground">{item.dateIssued}</span>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <Button className="flex-1" variant="default">
                  <RefreshCcw className="h-4 w-4 mr-2" /> Refresh Financial Data
                </Button>
                <Button className="flex-1" variant="outline">
                  <ListFilter className="h-4 w-4 mr-2" /> Manage Visibility
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="loans">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Loan History</h3>
                <Button variant="outline" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" /> Add Loan
                </Button>
              </div>
              
              {financialHistory.loans.length > 0 ? (
                <div className="space-y-4">
                  {financialHistory.loans.map((loan, i) => (
                    <Accordion key={loan.id} type="single" collapsible className="w-full border rounded-lg">
                      <AccordionItem value={`loan-${i}`} className="border-none">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center justify-between w-full mr-4">
                            <div className="flex items-center">
                              <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                              <div>
                                <h4 className="font-medium text-left">{loan.type}</h4>
                                <p className="text-sm text-muted-foreground text-left">{loan.provider}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">${loan.amount.toLocaleString()}</span>
                              {getStatusBadge(loan.status)}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Date Issued:</span>
                                <p>{loan.dateIssued}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date Completed:</span>
                                <p>{loan.dateCompleted || 'In progress'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">Purpose:</span>
                              <p className="text-sm">{loan.purpose}</p>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">Outcome:</span>
                              <p className="text-sm">{loan.outcome}</p>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2">
                              {getVerifiedBadge(loan.verified)}
                              <Button variant="outline" size="sm">
                                <FileText className="h-3 w-3 mr-1" /> View Full Details
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  You have not added any loan records yet.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="grants">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Grant History</h3>
                <Button variant="outline" size="sm">
                  <Building className="h-4 w-4 mr-2" /> Add Grant
                </Button>
              </div>
              
              {financialHistory.grants.length > 0 ? (
                <div className="space-y-4">
                  {financialHistory.grants.map((grant, i) => (
                    <Accordion key={grant.id} type="single" collapsible className="w-full border rounded-lg">
                      <AccordionItem value={`grant-${i}`} className="border-none">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center justify-between w-full mr-4">
                            <div className="flex items-center">
                              <Building className="h-5 w-5 text-emerald-600 mr-3" />
                              <div>
                                <h4 className="font-medium text-left">{grant.program}</h4>
                                <p className="text-sm text-muted-foreground text-left">{grant.provider}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">${grant.amount.toLocaleString()}</span>
                              {getStatusBadge(grant.status)}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Date Issued:</span>
                                <p>{grant.dateIssued}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date Completed:</span>
                                <p>{grant.dateCompleted || 'In progress'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">Purpose:</span>
                              <p className="text-sm">{grant.purpose}</p>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">Outcome:</span>
                              <p className="text-sm">{grant.outcome}</p>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2">
                              {getVerifiedBadge(grant.verified)}
                              <Button variant="outline" size="sm">
                                <FileText className="h-3 w-3 mr-1" /> View Documentation
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  You have not added any grant records yet.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="donations">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Donation Campaigns</h3>
                <Button variant="outline" size="sm">
                  <HandHeart className="h-4 w-4 mr-2" /> Add Campaign
                </Button>
              </div>
              
              {financialHistory.donations.length > 0 ? (
                <div className="space-y-4">
                  {financialHistory.donations.map((donation, i) => (
                    <Accordion key={donation.id} type="single" collapsible className="w-full border rounded-lg">
                      <AccordionItem value={`donation-${i}`} className="border-none">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center justify-between w-full mr-4">
                            <div className="flex items-center">
                              <HandHeart className="h-5 w-5 text-purple-600 mr-3" />
                              <div>
                                <h4 className="font-medium text-left">{donation.campaign}</h4>
                                <p className="text-sm text-muted-foreground text-left">{donation.platform}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">${donation.amount.toLocaleString()}</span>
                              {getStatusBadge(donation.status)}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Date Started:</span>
                                <p>{donation.dateIssued}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date Completed:</span>
                                <p>{donation.dateCompleted || 'In progress'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">Purpose:</span>
                              <p className="text-sm">{donation.purpose}</p>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">Outcome:</span>
                              <p className="text-sm">{donation.outcome}</p>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2">
                              {donation.proofSubmitted ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> Proof Submitted
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" /> Proof Required
                                </Badge>
                              )}
                              <Button variant="outline" size="sm">
                                <Upload className="h-3 w-3 mr-1" /> Add Proof of Use
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  You have not added any donation campaigns yet.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}