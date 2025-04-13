import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Key, 
  Shield, 
  User, 
  Award, 
  Wallet, 
  Building, 
  Users, 
  TrendingUp, 
  Zap,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NFTIdentityCardProps {
  userId: number;
}

interface NFTIdentity {
  tokenId: string;
  mintDate: string;
  lastUpdated: string;
  verificationLevel: number;
  communityScore: number;
  operationalFramework: {
    skillsValuation: number;
    leadershipCapacity: number;
    innovationMetric: number;
    resiliencyScore: number;
    adaptabilityIndex: number;
  };
  businessMetrics: {
    enterpriseValue: number;
    growthPotential: number;
    riskMitigation: number;
    communityImpact: number;
  };
  skills: string[];
  attributes: {
    name: string;
    value: string;
    rarity: number;
  }[];
  usageRights: string[];
  tokenAddress: string;
}

export function NFTIdentityCard({ userId }: NFTIdentityCardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("value");
  
  // This would fetch real data in a production environment
  const { data: nftIdentity, isLoading } = useQuery<NFTIdentity>({
    queryKey: [`/api/users/${userId}/nft-identity`],
    // In a real implementation, this would be removed and the API would be called
    enabled: false,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Token ID copied successfully",
    });
  };

  // Mock data for demonstration
  const demoNFT: NFTIdentity = {
    tokenId: "IAM#25798",
    mintDate: "2024-03-15",
    lastUpdated: "2024-04-10",
    verificationLevel: 3,
    communityScore: 78,
    operationalFramework: {
      skillsValuation: 85,
      leadershipCapacity: 68,
      innovationMetric: 72,
      resiliencyScore: 89,
      adaptabilityIndex: 76
    },
    businessMetrics: {
      enterpriseValue: 76000,
      growthPotential: 82,
      riskMitigation: 74,
      communityImpact: 85
    },
    skills: ["Project Management", "Digital Marketing", "Community Building", "Financial Planning", "Adaptability"],
    attributes: [
      { name: "Employment Stability", value: "High", rarity: 28 },
      { name: "Growth Mindset", value: "Exceptional", rarity: 15 },
      { name: "Learning Speed", value: "Above Average", rarity: 32 },
      { name: "Integrity Score", value: "95/100", rarity: 22 }
    ],
    usageRights: [
      "Authentication across verified platforms",
      "Skill verification for employment",
      "Reputation portability between communities",
      "Access to community resources and benefits"
    ],
    tokenAddress: "0x7Ed1A5A5680c11578325E6565e2ad136BD32d37d"
  };

  const nft = demoNFT;

  // Calculate total operational value
  const calculateTotalValue = () => {
    const operationalValue = Object.values(nft.operationalFramework).reduce((sum, val) => sum + val, 0) / 5;
    const businessValue = nft.businessMetrics.enterpriseValue / 1000;
    return Math.round((operationalValue + businessValue + nft.communityScore) / 3);
  };

  return (
    <Card className="border-2 border-primary/20 overflow-hidden h-full flex flex-col">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              I AM WHO I AM NFT
            </CardTitle>
            <CardDescription>
              Your universal identity & value token
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 gap-1">
            <Shield className="h-3 w-3" />
            Level {nft.verificationLevel}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-2 bg-background/80 px-2 py-1 rounded text-xs">
            {nft.tokenId}
            <button onClick={() => copyToClipboard(nft.tokenId)} className="text-muted-foreground hover:text-primary">
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground">Minted: {nft.mintDate}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsList className="grid grid-cols-3 w-full rounded-none">
            <TabsTrigger value="value">Valuation</TabsTrigger>
            <TabsTrigger value="framework">Framework</TabsTrigger>
            <TabsTrigger value="utility">Utility</TabsTrigger>
          </TabsList>
          
          <TabsContent value="value" className="p-4 space-y-4">
            <div className="text-center pb-4">
              <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
                {calculateTotalValue()}%
              </div>
              <p className="text-xs text-muted-foreground">
                Total Value Score
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <h3 className="text-xs font-medium flex items-center gap-1 mb-1">
                  <User className="h-3 w-3" /> Personal Value
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span>Skills</span>
                      <span>{nft.operationalFramework.skillsValuation}%</span>
                    </div>
                    <Progress value={nft.operationalFramework.skillsValuation} className="h-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span>Leadership</span>
                      <span>{nft.operationalFramework.leadershipCapacity}%</span>
                    </div>
                    <Progress value={nft.operationalFramework.leadershipCapacity} className="h-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span>Innovation</span>
                      <span>{nft.operationalFramework.innovationMetric}%</span>
                    </div>
                    <Progress value={nft.operationalFramework.innovationMetric} className="h-1" />
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <h3 className="text-xs font-medium flex items-center gap-1 mb-1">
                  <Building className="h-3 w-3" /> Business Value
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span>Enterprise</span>
                      <span>${nft.businessMetrics.enterpriseValue}</span>
                    </div>
                    <Progress value={nft.businessMetrics.growthPotential} className="h-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span>Growth</span>
                      <span>{nft.businessMetrics.growthPotential}%</span>
                    </div>
                    <Progress value={nft.businessMetrics.growthPotential} className="h-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span>Risk Mitigation</span>
                      <span>{nft.businessMetrics.riskMitigation}%</span>
                    </div>
                    <Progress value={nft.businessMetrics.riskMitigation} className="h-1" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-3">
              <h3 className="text-xs font-medium flex items-center gap-1 mb-1">
                <Users className="h-3 w-3" /> Community Value
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>Community Score</span>
                    <span>{nft.communityScore}%</span>
                  </div>
                  <Progress value={nft.communityScore} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>Impact Factor</span>
                    <span>{nft.businessMetrics.communityImpact}%</span>
                  </div>
                  <Progress value={nft.businessMetrics.communityImpact} className="h-1" />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="framework" className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-primary/70" /> 
                Operational Framework
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Your NFT encodes your personal operating system - how you work, lead, and create value.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(nft.operationalFramework).map(([key, value], i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-help">
                          <h4 className="text-xs font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <div className="flex items-end gap-1 mt-1">
                            <span className="text-xl font-bold">{value}</span>
                            <span className="text-xs text-muted-foreground">/100</span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {key === 'skillsValuation' && 'The market value of your skills portfolio based on current demand'}
                          {key === 'leadershipCapacity' && 'Your ability to guide and influence teams toward objectives'}
                          {key === 'innovationMetric' && 'How effectively you develop and implement new ideas'}
                          {key === 'resiliencyScore' && 'Your capacity to bounce back from setbacks and challenges'}
                          {key === 'adaptabilityIndex' && 'How quickly you adapt to changing conditions and requirements'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Unique Attributes</h3>
              <div className="space-y-2">
                {nft.attributes.map((attr, i) => (
                  <div key={i} className="flex justify-between items-center bg-muted/30 px-3 py-2 rounded-md">
                    <div>
                      <span className="text-xs font-medium">{attr.name}</span>
                      <p className="text-xs text-muted-foreground">{attr.value}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Top {attr.rarity}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Core Skills</h3>
              <div className="flex flex-wrap gap-2">
                {nft.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="utility" className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium flex items-center gap-1 mb-2">
                <Zap className="h-4 w-4 text-primary/70" /> 
                NFT Powers & Utility
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Your "I AM WHO I AM" NFT is more than digital art - it's a functional identity tool with real utility:
              </p>
              
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-green-800 flex items-center gap-1">
                    <Key className="h-4 w-4" /> Authentication
                  </h4>
                  <p className="text-xs text-green-700 mt-1">
                    Use as a universal login across platforms and services, including:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="bg-white/50">Email Recovery</Badge>
                    <Badge variant="outline" className="bg-white/50">SaaS Access</Badge>
                    <Badge variant="outline" className="bg-white/50">Financial Services</Badge>
                    <Badge variant="outline" className="bg-white/50">Government Services</Badge>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-800 flex items-center gap-1">
                    <Award className="h-4 w-4" /> Reputation Transfer
                  </h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Carry your verified reputation across:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="bg-white/50">Job Applications</Badge>
                    <Badge variant="outline" className="bg-white/50">Community Membership</Badge>
                    <Badge variant="outline" className="bg-white/50">Lending Platforms</Badge>
                    <Badge variant="outline" className="bg-white/50">Service Marketplaces</Badge>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-purple-800 flex items-center gap-1">
                    <Users className="h-4 w-4" /> Community Empowerment
                  </h4>
                  <p className="text-xs text-purple-700 mt-1">
                    Ownership rights and access to:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="bg-white/50">Group Resources</Badge>
                    <Badge variant="outline" className="bg-white/50">Economic Opportunities</Badge>
                    <Badge variant="outline" className="bg-white/50">Collective Bargaining</Badge>
                    <Badge variant="outline" className="bg-white/50">Community Governance</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Usage Rights</h3>
              <ul className="space-y-2">
                {nft.usageRights.map((right, i) => (
                  <li key={i} className="text-xs flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{right}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-muted/20 p-4 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Last updated: {nft.lastUpdated}
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Wallet className="h-3 w-3" />
          <span className="text-xs">Connect Wallet</span>
        </Button>
      </CardFooter>
    </Card>
  );
}