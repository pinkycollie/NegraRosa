import React from "react";
import { MainframeBlock, ProcessUnit } from "../MainframeLayout";
import { 
  FileUp, 
  Video, 
  HandMetal,
  Phone, 
  Building, 
  Users,
  Shield, 
  FileText,
  Upload,
  CheckSquare,
  Wifi,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface VerificationDashboardProps {
  userId: number;
}

export default function VerificationDashboard({ userId }: VerificationDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sign Language Video Verification Block */}
        <MainframeBlock 
          title="Sign Language Video Verification" 
          variant="primary"
          icon={<Video className="h-5 w-5 text-purple-500" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Module Status: <span className="text-amber-500">Pending</span></span>
              <Badge variant="outline" className="text-xs">0/2 Complete</Badge>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md border border-border mb-3">
              <p className="text-sm mb-2">
                At NegraRosa, we prioritize sign language as a primary verification method for our deaf community members.
              </p>
              <div className="flex items-center text-xs text-muted-foreground mb-1">
                <Shield className="h-3 w-3 text-green-500 mr-1" />
                <span>Secure, culturally-accessible verification process</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Shield className="h-3 w-3 text-green-500 mr-1" />
                <span>Verified by native ASL/international sign language staff</span>
              </div>
            </div>
            
            <ProcessUnit title="Sign Language Video Identity" variant="verification" steps={2} currentStep={1}>
              <div className="bg-muted/50 rounded-md p-3 border border-dashed border-border mainframe-corner">
                <div className="flex items-center justify-center flex-col p-6 text-center">
                  <Video className="h-8 w-8 text-purple-500 mb-3" />
                  <p className="text-sm mb-3">
                    Record a short video signing the verification phrase
                  </p>
                  <Button size="sm" className="w-full">Start Video Verification</Button>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">
                  ASL, BSL, and international sign language supported
                </p>
              </div>
            </ProcessUnit>
            
            <ProcessUnit title="Sign Name Registration" variant="verification" steps={2} currentStep={0}>
              <div className="opacity-70">
                <div className="flex items-center mb-2">
                  <HandMetal className="h-5 w-5 mr-2 text-muted-foreground" />
                  <p className="text-sm">Register your sign name for our system</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Your sign name helps personalize your identity in our community
                </p>
                <Button size="sm" disabled>Register Sign Name</Button>
              </div>
              <div className="mt-2 flex items-center">
                <div className="w-3 h-3 rounded-full bg-muted mr-2"></div>
                <p className="text-xs text-muted-foreground">Complete video verification first</p>
              </div>
            </ProcessUnit>
          </div>
        </MainframeBlock>
        
        {/* Deaf-Accessible Methods Block */}
        <MainframeBlock 
          title="Deaf-Accessible Verification Options" 
          variant="secondary"
          icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-3">
              NegraRosa Security offers multiple deaf-friendly verification methods designed by and for the deaf community.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-border rounded-md p-3 hover:border-blue-300 hover:bg-blue-50/20 transition-colors cursor-pointer">
                <div className="flex items-center mb-2">
                  <Wifi className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium">Deaf Organization Network</span>
                </div>
                <p className="text-xs text-muted-foreground">Verify through affiliated deaf organizations and schools</p>
              </div>
              
              <div className="border border-border rounded-md p-3 hover:border-blue-300 hover:bg-blue-50/20 transition-colors cursor-pointer">
                <div className="flex items-center mb-2">
                  <Phone className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium">VP Number Verification</span>
                </div>
                <p className="text-xs text-muted-foreground">Use your videophone number as a verification method</p>
              </div>
              
              <div className="border border-border rounded-md p-3 hover:border-blue-300 hover:bg-blue-50/20 transition-colors cursor-pointer">
                <div className="flex items-center mb-2">
                  <Building className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium">Deaf Business Affiliation</span>
                </div>
                <p className="text-xs text-muted-foreground">Verify through employment at a deaf-owned business</p>
              </div>
              
              <div className="border border-border rounded-md p-3 hover:border-blue-300 hover:bg-blue-50/20 transition-colors cursor-pointer">
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium">Deaf Community Vouching</span>
                </div>
                <p className="text-xs text-muted-foreground">Have verified deaf community members vouch for your identity</p>
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md border border-border">
              <div className="flex items-center mb-2">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Alternative Documentation Options</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Need to use deaf-specific documentation? We accommodate various forms of ID.
              </p>
              <Button variant="outline" size="sm">Upload Alternative Documents</Button>
            </div>
          </div>
        </MainframeBlock>
      </div>
      
      {/* Deaf-Centric Access Levels Block */}
      <MainframeBlock 
        title="Deaf Community Access Tiers" 
        variant="system"
        icon={<CheckSquare className="h-5 w-5 text-green-500" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="p-4 bg-muted/30 rounded-md border border-border mb-3">
              <h4 className="text-sm font-medium mb-3">Current Access Level</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Community Member</span>
                <Badge>Tier 1</Badge>
              </div>
              <Progress value={25} className="h-1.5 mb-2" />
              <p className="text-xs text-muted-foreground">
                Complete more verification steps to access deaf community benefits
              </p>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-md border border-border">
              <h4 className="text-sm font-medium mb-3">Community Metrics</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Deaf Identity Verification</span>
                    <span>Pending</span>
                  </div>
                  <Progress value={15} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Community Participation</span>
                    <span>1 day</span>
                  </div>
                  <Progress value={5} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Deaf Network Connections</span>
                    <span>0 of 5</span>
                  </div>
                  <Progress value={0} className="h-1.5" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <h4 className="text-sm font-medium mb-3">Deaf Community Access Progression</h4>
            <div className="relative mb-8">
              {/* Tier path line */}
              <div className="absolute top-5 left-0 w-full h-1 bg-muted"></div>
              
              {/* Tier markers */}
              <div className="flex justify-between relative z-10">
                <div className="text-center">
                  <div className="h-10 w-10 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-medium text-green-700">T1</span>
                  </div>
                  <span className="text-xs block max-w-[80px] mx-auto">Community Member</span>
                  <span className="text-xs text-green-600 block">Active</span>
                </div>
                
                <div className="text-center opacity-50">
                  <div className="h-10 w-10 rounded-full bg-muted border-2 border-muted-foreground flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-medium">T2</span>
                  </div>
                  <span className="text-xs block max-w-[80px] mx-auto">Verified Member</span>
                  <span className="text-xs text-muted-foreground block">Locked</span>
                </div>
                
                <div className="text-center opacity-50">
                  <div className="h-10 w-10 rounded-full bg-muted border-2 border-muted-foreground flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-medium">T3</span>
                  </div>
                  <span className="text-xs block max-w-[80px] mx-auto">Community Leader</span>
                  <span className="text-xs text-muted-foreground block">Locked</span>
                </div>
                
                <div className="text-center opacity-50">
                  <div className="h-10 w-10 rounded-full bg-muted border-2 border-muted-foreground flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-medium">T4</span>
                  </div>
                  <span className="text-xs block max-w-[80px] mx-auto">Trusted Partner</span>
                  <span className="text-xs text-muted-foreground block">Locked</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-border rounded-md">
                <h5 className="text-sm font-medium flex items-center mb-2">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  Current Community Access
                </h5>
                <ul className="space-y-1">
                  <li className="text-xs flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Basic community event access
                  </li>
                  <li className="text-xs flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Deaf-accessible services information
                  </li>
                  <li className="text-xs flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Sign language video library (limited)
                  </li>
                </ul>
              </div>
              
              <div className="p-3 border border-border rounded-md bg-muted/20">
                <h5 className="text-sm font-medium flex items-center mb-2">
                  <Shield className="h-4 w-4 text-blue-500 mr-2" />
                  Next Tier Unlocks
                </h5>
                <ul className="space-y-1 opacity-70">
                  <li className="text-xs flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    Deaf business partnership network
                  </li>
                  <li className="text-xs flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    Community voting rights
                  </li>
                  <li className="text-xs flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    Expanded sign language resources
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </MainframeBlock>
      
      {/* Document Upload Block */}
      <MainframeBlock 
        title="Visual Documentation Upload" 
        variant="upload"
        icon={<FileUp className="h-5 w-5 text-red-500" />}
      >
        <div className="space-y-4">
          <p className="text-sm mb-3">
            For deaf-centric organizations requiring additional documentation, upload visual materials here to complete verification for higher access tiers.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-dashed border-border rounded-md p-4 hover:border-red-300 transition-colors">
              <div className="flex flex-col items-center justify-center text-center h-full">
                <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">Sign Language Video ID</p>
                <p className="text-xs text-muted-foreground mb-3">Record or upload signed identification</p>
                <Button size="sm" variant="secondary">Upload File</Button>
              </div>
            </div>
            
            <div className="border border-dashed border-border rounded-md p-4 hover:border-red-300 transition-colors">
              <div className="flex flex-col items-center justify-center text-center h-full">
                <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">Deaf Organization Proof</p>
                <p className="text-xs text-muted-foreground mb-3">Membership card, letter, email</p>
                <Button size="sm" variant="secondary">Upload File</Button>
              </div>
            </div>
            
            <div className="border border-dashed border-border rounded-md p-4 hover:border-red-300 transition-colors">
              <div className="flex flex-col items-center justify-center text-center h-full">
                <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">Deaf-Owned Business Credentials</p>
                <p className="text-xs text-muted-foreground mb-3">Business certification or credentials</p>
                <Button size="sm" variant="secondary">Upload File</Button>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md border border-border">
            <h5 className="text-sm font-medium mb-2">Visual Security & Privacy</h5>
            <p className="text-xs text-muted-foreground">
              All uploaded videos and visual documentation are encrypted and viewable only by deaf or signing staff members. Your sign language and visual identity information remains secure.
            </p>
          </div>
        </div>
      </MainframeBlock>
    </div>
  );
}