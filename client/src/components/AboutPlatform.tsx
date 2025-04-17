import { 
  Shield, 
  Users, 
  Building, 
  TrendingUp, 
  FileText, 
  LockKeyhole,
  Handshake,
  Globe,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AboutPlatformProps {
  onClose: () => void;
}

export default function AboutPlatform({ onClose }: AboutPlatformProps) {
  return (
    <div className="bg-background rounded-lg shadow-lg border border-border p-6 mb-8">
      <h2 className="text-2xl font-bold mb-2 flex items-center">
        <Shield className="h-6 w-6 text-primary mr-2" />
        About NegraRosa Security Platform
      </h2>
      
      <p className="text-muted-foreground mb-6">
        A revolutionary user-centric security verification platform that empowers individuals to take control of their identity verification process, challenging traditional rigid screening methodologies.
      </p>
      
      <Tabs defaultValue="mission">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="mission">Mission</TabsTrigger>
          <TabsTrigger value="how">How It Works</TabsTrigger>
          <TabsTrigger value="transparency">Transparency</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mission" className="space-y-4">
          <div className="bg-muted/50 p-5 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Users className="h-5 w-5 text-primary mr-2" />
              Our Mission
            </h3>
            <p className="text-sm text-foreground/80 mb-4">
              NegraRosa Security is built on the premise that traditional verification systems often exclude vulnerable populations. Our mission is to create inclusive security that gives everyone a fair chance while maintaining high security standards.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-background p-4 rounded-lg border border-border">
                <h4 className="font-medium mb-2">User Empowerment</h4>
                <p className="text-sm text-muted-foreground">Users control their identity verification journey, choosing methods that work for their unique circumstances.</p>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <h4 className="font-medium mb-2">Progressive Trust</h4>
                <p className="text-sm text-muted-foreground">Our system builds trust over time, recognizing positive user behavior and allowing for recovery from past mistakes.</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="how" className="space-y-4">
          <div className="bg-muted/50 p-5 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <LockKeyhole className="h-5 w-5 text-primary mr-2" />
              How It Works
            </h3>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">1</div>
                <div>
                  <h4 className="text-base font-medium">Multiple Verification Paths</h4>
                  <p className="text-sm text-muted-foreground">Choose from various verification methods that suit your specific situation.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">2</div>
                <div>
                  <h4 className="text-base font-medium">Reputation Building</h4>
                  <p className="text-sm text-muted-foreground">Develop trust over time through consistent positive activity.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">3</div>
                <div>
                  <h4 className="text-base font-medium">Risk Management</h4>
                  <p className="text-sm text-muted-foreground">Instead of rejection, our system applies appropriate restrictions based on verification status.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">4</div>
                <div>
                  <h4 className="text-base font-medium">Identity Control</h4>
                  <p className="text-sm text-muted-foreground">Take ownership of your digital identity with tools to correct errors in your records.</p>
                </div>
              </li>
            </ol>
          </div>
        </TabsContent>
        
        <TabsContent value="transparency" className="space-y-4">
          <div className="bg-muted/50 p-5 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FileText className="h-5 w-5 text-primary mr-2" />
              Transparency Report
            </h3>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Funding & Development</h4>
              <p className="text-sm text-muted-foreground">NegraRosa Security is developed by a coalition of:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>Non-profit organizations focused on digital inclusion</li>
                <li>Academic research institutions studying bias in security systems</li>
                <li>Industry partners committed to inclusive financial services</li>
                <li>Grant funding from social impact investors and foundations</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-background p-4 rounded-lg border border-border">
                <h4 className="font-medium mb-2 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Governance Model
                </h4>
                <p className="text-sm text-muted-foreground">Open governance with community input and advisory board oversight. Regular public audits and transparency reports.</p>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <h4 className="font-medium mb-2 flex items-center">
                  <Handshake className="h-4 w-4 mr-2" />
                  Partnerships
                </h4>
                <p className="text-sm text-muted-foreground">Collaborations with CIVIC.com for identity verification, financial institutions, and community advocacy groups.</p>
              </div>
            </div>
            
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <h4 className="font-medium mb-2">Financial Model</h4>
              <p className="text-sm text-muted-foreground">NegraRosa operates on a sustainable mixed-funding model:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                <li>Business users pay subscription fees for API access</li>
                <li>Free core services for individual users</li>
                <li>Premium features available through a fair pricing model</li>
                <li>Ongoing grant funding for research and development</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="roadmap" className="space-y-4">
          <div className="bg-muted/50 p-5 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-primary mr-2" />
              Development Roadmap
            </h3>
            
            <div className="space-y-4">
              <div className="relative pl-8 pb-4 border-l border-primary/30">
                <div className="absolute left-[-8px] top-0 bg-primary h-4 w-4 rounded-full"></div>
                <h4 className="font-medium">Q1 2024 - Platform Launch</h4>
                <p className="text-sm text-muted-foreground">Initial verification methods, basic reputation systems, and fundamental risk management tools.</p>
              </div>
              
              <div className="relative pl-8 pb-4 border-l border-muted">
                <div className="absolute left-[-8px] top-0 bg-muted h-4 w-4 rounded-full border border-border"></div>
                <h4 className="font-medium">Q2 2024 - Partner Integrations</h4>
                <p className="text-sm text-muted-foreground">Expanded verification options through partnerships with CIVIC.com and financial institutions.</p>
              </div>
              
              <div className="relative pl-8 pb-4 border-l border-muted">
                <div className="absolute left-[-8px] top-0 bg-muted h-4 w-4 rounded-full border border-border"></div>
                <h4 className="font-medium">Q3 2024 - Advanced Identity Control</h4>
                <p className="text-sm text-muted-foreground">Enhanced tools for users to manage and correct their identity information across multiple systems.</p>
              </div>
              
              <div className="relative pl-8">
                <div className="absolute left-[-8px] top-0 bg-muted h-4 w-4 rounded-full border border-border"></div>
                <h4 className="font-medium">Q4 2024 - Global Expansion</h4>
                <p className="text-sm text-muted-foreground">Adapting verification methods to work in diverse global contexts with region-specific options.</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-2 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Long-term Vision
              </h4>
              <p className="text-sm text-muted-foreground">
                To create a global standard for inclusive security verification that balances robust protection with accessibility for all populations.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-6">
        <Button variant="outline" className="mr-2" onClick={onClose}>
          Close
        </Button>
        <Button className="flex items-center">
          <span>Explore Platform</span>
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}