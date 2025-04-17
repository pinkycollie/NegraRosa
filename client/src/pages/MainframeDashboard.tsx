import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types";
import { AuthTab } from "@/lib/types";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import { Shield, Users, Wifi, HandMetal, Building, Code, GitFork, Github, Award } from "lucide-react";
import MainframeLayout, { MainframeBlock } from "@/components/MainframeLayout";
import VerificationDashboard from "@/components/verification/VerificationDashboard";
import SecurityFramework from "@/components/framework/SecurityFramework";
import SignLanguageAuth from "@/components/auth/SignLanguageAuth";
import DeafFirstAuth from "@/components/auth/DeafFirstAuth";
import SecurityAchievementBadges from "@/components/badges/SecurityAchievementBadges";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MainframeDashboardProps {
  userId: number;
}

export default function MainframeDashboard({ userId }: MainframeDashboardProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.AUTHENTICATION);
  const [showOpenSourceBlock, setShowOpenSourceBlock] = useState(false);

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
  };
  
  const toggleOpenSourceBlock = () => {
    setShowOpenSourceBlock(!showOpenSourceBlock);
  };

  // Sidebar content for mainframe layout
  const sidebarContent = (
    <div className="space-y-4">
      <MainframeBlock 
        title="NegraRosa Security" 
        variant="primary"
        icon={<Shield className="h-5 w-5 text-purple-500" />}
      >
        <div className="space-y-3">
          <p className="text-sm mb-4">
            Security verification designed specifically for the deaf community and deaf-run organizations.
          </p>
          
          <div className="flex items-center">
            <HandMetal className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-sm font-medium">Welcome, {user?.username || 'User'}</span>
          </div>
          
          <div className="bg-muted/30 p-2 rounded-md flex items-center justify-between">
            <span className="text-xs">Community Access Level</span>
            <span className="text-xs font-medium">Tier 1</span>
          </div>
          
          <hr className="border-border my-3" />
          
          <div className="space-y-1">
            <Button 
              variant={activeTab === AuthTab.AUTHENTICATION ? "default" : "ghost"} 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleTabChange(AuthTab.AUTHENTICATION)}
            >
              <HandMetal className="h-4 w-4 mr-2" />
              Sign Verification
            </Button>
            
            <Button 
              variant={activeTab === AuthTab.REPUTATION ? "default" : "ghost"} 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleTabChange(AuthTab.REPUTATION)}
            >
              <Users className="h-4 w-4 mr-2" />
              Deaf Community
            </Button>
            
            <Button 
              variant={activeTab === AuthTab.RISK ? "default" : "ghost"} 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleTabChange(AuthTab.RISK)}
            >
              <Building className="h-4 w-4 mr-2" />
              Organization Tools
            </Button>
            
            <Button 
              variant={activeTab === AuthTab.FRAUD ? "default" : "ghost"} 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleTabChange(AuthTab.FRAUD)}
            >
              <Wifi className="h-4 w-4 mr-2" />
              Network Status
            </Button>
          </div>
        </div>
      </MainframeBlock>
      
      <MainframeBlock 
        title="Mission" 
        variant="secondary"
        icon={<Users className="h-5 w-5 text-blue-500" />}
      >
        <div className="space-y-3">
          <p className="text-sm">
            NegraRosa creates inclusive security systems designed specifically for deaf-first organizations and businesses.
          </p>
          
          <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4">
            <li>Visual verification methods prioritizing sign language</li>
            <li>Deaf-centric identity validation processes</li>
            <li>Security tools designed by and for the deaf community</li>
            <li>Connecting deaf-run organizations with verified members</li>
          </ul>
        </div>
      </MainframeBlock>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader user={user} />

      <MainframeLayout sidebarContent={sidebarContent}>
        {/* Open Source Blocks Banner - Expandable */}
        <div className="mb-6">
          <div 
            className="border border-blue-700 rounded-lg bg-gradient-to-r from-blue-950/50 to-purple-950/50 p-4 cursor-pointer"
            onClick={toggleOpenSourceBlock}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Code className="h-6 w-6 text-blue-400 mr-3" />
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center">
                    Deaf-First Authentication Framework 
                    <Badge className="ml-3 bg-blue-700 text-white hover:bg-blue-600">New</Badge>
                  </h2>
                  <p className="text-sm text-blue-300">Multi-method technology for deaf users with gesture, voice pattern, visual, and tactile authentication</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GitFork className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-blue-300">{showOpenSourceBlock ? 'Hide' : 'Explore'}</span>
              </div>
            </div>
          </div>
          
          {/* Expanded Open Source Block */}
          {showOpenSourceBlock && (
            <div className="mt-4 border border-blue-700 rounded-lg bg-gradient-to-b from-blue-950/30 to-black p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-blue-400 flex items-center">
                    <Github className="h-5 w-5 mr-2" />
                    Open Source Authentication Block
                  </h3>
                  <Badge variant="outline" className="border-blue-600 text-blue-400">MIT License</Badge>
                </div>
                
                <p className="text-gray-300 mb-4">
                  This authentication component can be freely integrated into any security solution. It provides multiple authentication methods for deaf users including gesture recognition, voice pattern analysis, visual tracking, and tactile interaction. Our transparent approach shows exactly how your biometric data is stored and protected.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <DeafFirstAuth />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-black/70 border border-blue-900 rounded-lg p-4">
                      <h4 className="text-base font-medium text-blue-400 mb-3">Integration Details</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-blue-900/50 border border-blue-700 flex items-center justify-center mr-2 mt-0.5">
                            <span className="text-xs">1</span>
                          </div>
                          <span>Self-contained React component with no external dependencies</span>
                        </li>
                        <li className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-blue-900/50 border border-blue-700 flex items-center justify-center mr-2 mt-0.5">
                            <span className="text-xs">2</span>
                          </div>
                          <span>Connects to any authentication backend with minimal code</span>
                        </li>
                        <li className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-blue-900/50 border border-blue-700 flex items-center justify-center mr-2 mt-0.5">
                            <span className="text-xs">3</span>
                          </div>
                          <span>Visual first design with no text requirements</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-black/70 border border-blue-900 rounded-lg p-4">
                      <h4 className="text-base font-medium text-blue-400 mb-3">Benefits for Deaf Users</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                          <span>No text passwords to forget</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                          <span>Natural sign language gestures</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                          <span>Visual feedback during process</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                          <span>Accessible error resolution</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button className="w-full bg-blue-700 hover:bg-blue-600">
                      <Github className="h-4 w-4 mr-2" />
                      Get the Code
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Main content based on active tab */}
        {activeTab === AuthTab.AUTHENTICATION && (
          <VerificationDashboard userId={userId} />
        )}
        
        {activeTab === AuthTab.REPUTATION && (
          <SecurityFramework />
        )}
        
        {activeTab === AuthTab.RISK && (
          <div className="space-y-6">
            <MainframeBlock 
              title="User Type Transparency" 
              variant="system"
              icon={<Building className="h-5 w-5 text-green-500" />}
            >
              <div className="space-y-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Developer Transparency */}
                  <div className="border border-green-800 bg-black rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
                        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                      </svg>
                      Developer Access
                    </h3>
                    <div className="text-sm text-gray-300 space-y-2">
                      <p>Complete transparency for API integration and security implementation.</p>
                      
                      <div className="bg-gray-900/50 p-3 rounded border border-green-900/40 mt-4">
                        <h4 className="text-sm font-medium text-green-300 mb-2">Accessible Information:</h4>
                        <ul className="text-xs space-y-1 text-gray-400">
                          <li>• Full API documentation with sign language video guides</li>
                          <li>• Security implementation examples for deaf-friendly interfaces</li>
                          <li>• Integration demonstrations with visual workflows</li>
                          <li>• Code samples with accessibility annotations</li>
                        </ul>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-green-900/30">
                        <h4 className="text-sm font-medium text-green-300 mb-1">Security Requirements:</h4>
                        <div className="flex items-center justify-between text-xs">
                          <span>Identity Verification</span>
                          <span className="text-green-400">Required</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Community Member Vouching</span>
                          <span className="text-green-400">2+ Required</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>API Key Restrictions</span>
                          <span className="text-green-400">IP-Limited</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Individual Transparency */}
                  <div className="border border-blue-800 bg-black rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
                        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                      </svg>
                      Individual Access
                    </h3>
                    <div className="text-sm text-gray-300 space-y-2">
                      <p>Transparency for authentication and personal data access.</p>
                      
                      <div className="bg-gray-900/50 p-3 rounded border border-blue-900/40 mt-4">
                        <h4 className="text-sm font-medium text-blue-300 mb-2">Accessible Information:</h4>
                        <ul className="text-xs space-y-1 text-gray-400">
                          <li>• Personal data storage practices and policies</li>
                          <li>• Authentication methods with visual sign language options</li>
                          <li>• Control panel for managing access permissions</li>
                          <li>• Visual verification history log</li>
                        </ul>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-blue-900/30">
                        <h4 className="text-sm font-medium text-blue-300 mb-1">Security Requirements:</h4>
                        <div className="flex items-center justify-between text-xs">
                          <span>Identity Verification</span>
                          <span className="text-blue-400">Required</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Sign Language Verification</span>
                          <span className="text-blue-400">Optional</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Deaf Community Connection</span>
                          <span className="text-blue-400">Recommended</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Organization Transparency */}
                  <div className="border border-purple-800 bg-black rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
                        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                      </svg>
                      Organization Access
                    </h3>
                    <div className="text-sm text-gray-300 space-y-2">
                      <p>Full transparency for enterprise security implementation.</p>
                      
                      <div className="bg-gray-900/50 p-3 rounded border border-purple-900/40 mt-4">
                        <h4 className="text-sm font-medium text-purple-300 mb-2">Accessible Information:</h4>
                        <ul className="text-xs space-y-1 text-gray-400">
                          <li>• Complete digital platform security architecture</li>
                          <li>• Team management with deaf-friendly access controls</li>
                          <li>• Enterprise-grade security implementation guides</li>
                          <li>• Organizational compliance and auditing tools</li>
                        </ul>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-purple-900/30">
                        <h4 className="text-sm font-medium text-purple-300 mb-1">Security Requirements:</h4>
                        <div className="flex items-center justify-between text-xs">
                          <span>Business Verification</span>
                          <span className="text-purple-400">Required</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Administrator Verification</span>
                          <span className="text-purple-400">Required</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Security Compliance Check</span>
                          <span className="text-purple-400">Required</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* fibonroseTRUST Integration */}
                <div className="mt-6 p-4 border border-amber-800 bg-gradient-to-br from-black to-amber-950/20 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                      <path d="M0,0 L0,50 A50,50 0 0,0 50,100 L100,100 L100,0 Z" fill="url(#grad1)" />
                      <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: "#f59e0b", stopOpacity: 0.3 }} />
                          <stop offset="100%" style={{ stopColor: "#78350f", stopOpacity: 0.1 }} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <h3 className="text-xl font-bold text-amber-400 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mr-2">
                          <path d="M13.6 2.4a1.5 1.5 0 0 0-3.2 0 1.5 1.5 0 0 1-1 1.5 1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 1 1 1.5 1.5 1.5 0 0 0 3.2 0 1.5 1.5 0 0 1 1-1.5 1.5 1.5 0 0 0 0-3 1.5 1.5 0 0 1-1-1.5"/>
                          <path d="M13.6 13.4a1.5 1.5 0 0 0-3.2 0 1.5 1.5 0 0 1-1 1.5 1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 1 1 1.5 1.5 1.5 0 0 0 3.2 0 1.5 1.5 0 0 1 1-1.5 1.5 1.5 0 0 0 0-3 1.5 1.5 0 0 1-1-1.5z"/>
                        </svg>
                        fibonroseTRUST Integration
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-sm text-gray-300">
                        <p className="mb-3">
                          fibonroseTRUST provides complementary services to NegraRosa Security Framework, creating a complete security solution for deaf-run organizations and deaf-centric teams.
                        </p>
                        <p>
                          The combination delivers both visual security verification and specialized trust services for maximum protection.
                        </p>
                      </div>
                      
                      <div className="bg-gray-900/30 p-3 rounded border border-amber-900/40">
                        <h4 className="text-sm font-medium text-amber-300 mb-2">Combo Pack Benefits:</h4>
                        <ul className="text-xs space-y-1 text-gray-400">
                          <li>• Enhanced trust verification for deaf community members</li>
                          <li>• Combined security and trust assessment reporting</li>
                          <li>• Unified visual dashboard for both services</li>
                          <li>• Integrated trust scoring with security verification</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MainframeBlock>
          </div>
        )}
        
        {activeTab === AuthTab.FRAUD && (
          <div className="space-y-6">
            <MainframeBlock 
              title="Network Status" 
              variant="security"
              icon={<Wifi className="h-5 w-5 text-amber-500" />}
            >
              <div className="p-6">
                <div className="p-4 bg-gradient-to-br from-black to-amber-950/10 border border-amber-800 rounded-lg mb-6">
                  <h3 className="text-lg font-bold text-amber-400 mb-4">fibonroseTRUST Network Status</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-black/60 p-3 rounded border border-amber-900/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Trust Network</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-900/50 text-green-400 border border-green-800/50">Online</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 flex justify-between">
                        <span>98% Uptime</span>
                        <span>19ms Latency</span>
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-amber-900/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Verification API</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-900/50 text-green-400 border border-green-800/50">Online</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 flex justify-between">
                        <span>100% Uptime</span>
                        <span>24ms Latency</span>
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-amber-900/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Trust Database</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-900/50 text-green-400 border border-green-800/50">Online</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '99%' }}></div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 flex justify-between">
                        <span>99% Uptime</span>
                        <span>31ms Latency</span>
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-amber-900/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Webhook Service</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-900/50 text-amber-400 border border-amber-800/50">Maintenance</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 flex justify-between">
                        <span>87% Uptime</span>
                        <span>48ms Latency</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black p-4 rounded-lg border border-amber-800">
                    <h4 className="text-lg font-medium text-amber-400 mb-3">Active Connections</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border-b border-gray-800">
                        <span className="text-sm text-gray-300">Deaf Organizations</span>
                        <span className="text-sm font-medium text-amber-300">143</span>
                      </div>
                      <div className="flex items-center justify-between p-2 border-b border-gray-800">
                        <span className="text-sm text-gray-300">Educational Institutions</span>
                        <span className="text-sm font-medium text-amber-300">37</span>
                      </div>
                      <div className="flex items-center justify-between p-2 border-b border-gray-800">
                        <span className="text-sm text-gray-300">Community Hubs</span>
                        <span className="text-sm font-medium text-amber-300">92</span>
                      </div>
                      <div className="flex items-center justify-between p-2">
                        <span className="text-sm text-gray-300">Developer Integrations</span>
                        <span className="text-sm font-medium text-amber-300">214</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black p-4 rounded-lg border border-amber-800">
                    <h4 className="text-lg font-medium text-amber-400 mb-3">System Announcements</h4>
                    <div className="space-y-3">
                      <div className="p-2 border-l-2 border-green-500 bg-green-900/10">
                        <span className="text-xs text-green-400 block mb-1">Today, 7:30 AM</span>
                        <p className="text-sm text-gray-300">All systems operating normally with enhanced security monitoring active.</p>
                      </div>
                      <div className="p-2 border-l-2 border-amber-500 bg-amber-900/10">
                        <span className="text-xs text-amber-400 block mb-1">Tomorrow, 2:00 AM</span>
                        <p className="text-sm text-gray-300">Scheduled maintenance for webhook service. Estimated 30 minutes downtime.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MainframeBlock>
          </div>
        )}
      </MainframeLayout>

      <AppFooter />
    </div>
  );
}