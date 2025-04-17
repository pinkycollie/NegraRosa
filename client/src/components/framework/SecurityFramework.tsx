import React, { useState } from "react";
import { 
  Shield, 
  Eye, 
  Lock, 
  Key, 
  UserCheck, 
  Fingerprint, 
  Server, 
  FileCheck, 
  Layers,
  BarChart4,
  Network,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Animation constants
const ANIMATION_DURATION = 8000; // 8 seconds
const STEP_DURATION = 2000; // 2 seconds per step
const TOTAL_STEPS = 4;

export default function SecurityFramework() {
  const [activeProcess, setActiveProcess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<number>(0);
  
  // Mysterious Black Rose aesthetic with deep purple and black
  return (
    <div className="space-y-8">
      {/* Hero section with mysterious aesthetic */}
      <div className="relative rounded-lg overflow-hidden bg-black border border-purple-800 shadow-lg">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/50 to-black"></div>
        
        {/* Animated rose silhouette that's barely visible */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg viewBox="0 0 100 100" width="300" height="300">
            <path
              d="M50,10 C60,25 80,15 50,40 C20,15 40,25 50,10 Z"
              fill="none"
              stroke="#a855f7"
              strokeWidth="0.5"
              className="animate-pulse-slow"
            />
            <path
              d="M30,40 C40,30 60,30 70,40 C80,50 80,70 50,90 C20,70 20,50 30,40 Z"
              fill="none"
              stroke="#a855f7"
              strokeWidth="0.5"
              className="animate-pulse-slow"
            />
          </svg>
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-purple-900/30 border border-purple-700 flex items-center justify-center mr-4">
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">NegraRosa Security Framework</h1>
              <p className="text-purple-300 mt-1">Protecting deaf communities with visual security</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                The NegraRosa Security Framework provides comprehensive protection designed specifically for deaf-run organizations and deaf-centric teams. Our visual-first security approach ensures communication never becomes a barrier to safety.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="bg-purple-950/50 text-purple-300 border-purple-700">Deaf-First Design</Badge>
                <Badge variant="outline" className="bg-purple-950/50 text-purple-300 border-purple-700">Visual Verification</Badge>
                <Badge variant="outline" className="bg-purple-950/50 text-purple-300 border-purple-700">Data Protection</Badge>
                <Badge variant="outline" className="bg-purple-950/50 text-purple-300 border-purple-700">Threat Analysis</Badge>
              </div>
              
              <Button className="bg-purple-800 hover:bg-purple-700 text-white">
                Explore Framework
              </Button>
            </div>
            
            <div className="relative h-64 rounded-lg bg-black/50 border border-purple-800 overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
              
              {/* Framework visualization - shows a visual representation of how the security works */}
              <div className="absolute inset-0 p-6">
                <div className="relative h-full">
                  {/* Data nodes */}
                  <div className="absolute top-0 left-0 w-10 h-10 rounded-full bg-purple-900/30 border border-purple-700 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-purple-400" />
                  </div>
                  
                  <div className="absolute top-1/4 right-0 w-10 h-10 rounded-full bg-purple-900/30 border border-purple-700 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-purple-400" />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-10 h-10 rounded-full bg-purple-900/30 border border-purple-700 flex items-center justify-center">
                    <Server className="h-5 w-5 text-purple-400" />
                  </div>
                  
                  <div className="absolute bottom-1/4 right-0 w-10 h-10 rounded-full bg-purple-900/30 border border-purple-700 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-purple-400" />
                  </div>
                  
                  {/* Central security hub */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-purple-900/50 border border-purple-500 flex items-center justify-center z-10">
                    <Shield className="h-8 w-8 text-purple-200" />
                  </div>
                  
                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
                    <line x1="10%" y1="10%" x2="50%" y2="50%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1" />
                    <line x1="90%" y1="25%" x2="50%" y2="50%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1" />
                    <line x1="10%" y1="90%" x2="50%" y2="50%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1" />
                    <line x1="90%" y1="75%" x2="50%" y2="50%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1" />
                    
                    {/* Animated pulses along the lines */}
                    <circle className="animate-ping-slow" r="2" fill="rgba(168, 85, 247, 0.8)">
                      <animateMotion 
                        path="M10%,10% L50%,50%" 
                        dur="3s" 
                        repeatCount="indefinite" 
                      />
                    </circle>
                    
                    <circle className="animate-ping-slow" r="2" fill="rgba(168, 85, 247, 0.8)">
                      <animateMotion 
                        path="M90%,25% L50%,50%" 
                        dur="2.5s" 
                        repeatCount="indefinite" 
                      />
                    </circle>
                    
                    <circle className="animate-ping-slow" r="2" fill="rgba(168, 85, 247, 0.8)">
                      <animateMotion 
                        path="M10%,90% L50%,50%" 
                        dur="3.2s" 
                        repeatCount="indefinite" 
                      />
                    </circle>
                    
                    <circle className="animate-ping-slow" r="2" fill="rgba(168, 85, 247, 0.8)">
                      <animateMotion 
                        path="M90%,75% L50%,50%" 
                        dur="2.8s" 
                        repeatCount="indefinite" 
                      />
                    </circle>
                  </svg>
                </div>
              </div>
              
              {/* Protection glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-purple-500/10 animate-pulse-slow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How it works - Visual Process Flow */}
      <div className="mainframe-element p-8 bg-black border border-purple-800">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Eye className="h-6 w-6 text-purple-400 mr-2" />
          How NegraRosa Works
        </h2>
        
        <div className="relative mb-8">
          {/* Visual timeline showing security process */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 transform -translate-y-1/2"></div>
          
          <div className="relative flex justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`relative flex flex-col items-center ${activeSection === step-1 ? 'opacity-100' : 'opacity-50'}`}
                onClick={() => setActiveSection(step-1)}
              >
                <div className={`w-10 h-10 rounded-full ${activeSection === step-1 ? 'bg-purple-700' : 'bg-gray-700'} flex items-center justify-center z-10 cursor-pointer`}>
                  <span className="text-white font-bold">{step}</span>
                </div>
                <span className="mt-2 text-sm text-gray-400">
                  {step === 1 && "Verify"}
                  {step === 2 && "Analyze"}
                  {step === 3 && "Protect"}
                  {step === 4 && "Monitor"}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Step content */}
        <div className="min-h-[200px] bg-gray-900/30 rounded-lg border border-gray-800 p-6">
          {activeSection === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-purple-300 flex items-center">
                  <Fingerprint className="h-5 w-5 mr-2 text-purple-400" />
                  Visual Identity Verification
                </h3>
                <p className="text-gray-400 text-sm">
                  Sign language verification allows deaf users to confirm their identity using their native communication method.
                </p>
                <div className="h-20 bg-black/50 rounded border border-purple-800/50 flex items-center justify-center">
                  <span className="text-purple-300 text-xs">Sign verification demo</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-purple-300 flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-purple-400" />
                  Community Connection
                </h3>
                <p className="text-gray-400 text-sm">
                  Verification through trusted deaf community organizations and schools provides additional security layers.
                </p>
                <div className="h-20 bg-black/50 rounded border border-purple-800/50 flex items-center justify-center">
                  <span className="text-purple-300 text-xs">Community network</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-purple-300 flex items-center">
                  <Key className="h-5 w-5 mr-2 text-purple-400" />
                  Access Control System
                </h3>
                <p className="text-gray-400 text-sm">
                  Deaf-specific access tiers provide appropriate permissions based on verification level.
                </p>
                <div className="h-20 bg-black/50 rounded border border-purple-800/50 flex items-center justify-center">
                  <span className="text-purple-300 text-xs">Access tier visualization</span>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-300 flex items-center">
                  <BarChart4 className="h-5 w-5 mr-2 text-blue-400" />
                  Risk Assessment
                </h3>
                <p className="text-gray-400 text-sm">
                  Analyzes potential threats to deaf organizations using specialized risk models.
                </p>
                <div className="h-20 bg-black/50 rounded border border-blue-800/50 flex items-center justify-center">
                  <span className="text-blue-300 text-xs">Risk visualization</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-300 flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-blue-400" />
                  Threat Filtering
                </h3>
                <p className="text-gray-400 text-sm">
                  Identifies and categorizes security threats specific to deaf-run organizations.
                </p>
                <div className="h-20 bg-black/50 rounded border border-blue-800/50 flex items-center justify-center">
                  <span className="text-blue-300 text-xs">Threat filter demo</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-300 flex items-center">
                  <Network className="h-5 w-5 mr-2 text-blue-400" />
                  Community Pattern Recognition
                </h3>
                <p className="text-gray-400 text-sm">
                  Recognizes trusted communication patterns within deaf community networks.
                </p>
                <div className="h-20 bg-black/50 rounded border border-blue-800/50 flex items-center justify-center">
                  <span className="text-blue-300 text-xs">Pattern analysis</span>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-green-300 flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-green-400" />
                  Data Encryption
                </h3>
                <p className="text-gray-400 text-sm">
                  Specialized encryption for sensitive deaf community data and sign language videos.
                </p>
                <div className="h-20 bg-black/50 rounded border border-green-800/50 flex items-center justify-center">
                  <span className="text-green-300 text-xs">Encryption visualization</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-green-300 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-400" />
                  Visual Access Controls
                </h3>
                <p className="text-gray-400 text-sm">
                  Visual access management designed specifically for deaf users and organizations.
                </p>
                <div className="h-20 bg-black/50 rounded border border-green-800/50 flex items-center justify-center">
                  <span className="text-green-300 text-xs">Access control demo</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-green-300 flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-green-400" />
                  Multi-layered Security
                </h3>
                <p className="text-gray-400 text-sm">
                  Multiple security layers working together to protect deaf community data.
                </p>
                <div className="h-20 bg-black/50 rounded border border-green-800/50 flex items-center justify-center">
                  <span className="text-green-300 text-xs">Security layers</span>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-amber-300 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-amber-400" />
                  Visual Monitoring
                </h3>
                <p className="text-gray-400 text-sm">
                  Continuous visual monitoring that doesn't rely on auditory alerts or warnings.
                </p>
                <div className="h-20 bg-black/50 rounded border border-amber-800/50 flex items-center justify-center">
                  <span className="text-amber-300 text-xs">Visual monitoring demo</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-amber-300 flex items-center">
                  <BarChart4 className="h-5 w-5 mr-2 text-amber-400" />
                  Threat Analytics
                </h3>
                <p className="text-gray-400 text-sm">
                  Ongoing analysis of potential threats with visual reporting for deaf team members.
                </p>
                <div className="h-20 bg-black/50 rounded border border-amber-800/50 flex items-center justify-center">
                  <span className="text-amber-300 text-xs">Threat analytics</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-amber-300 flex items-center">
                  <Network className="h-5 w-5 mr-2 text-amber-400" />
                  Community Feedback
                </h3>
                <p className="text-gray-400 text-sm">
                  Real-time feedback from deaf community members to strengthen security measures.
                </p>
                <div className="h-20 bg-black/50 rounded border border-amber-800/50 flex items-center justify-center">
                  <span className="text-amber-300 text-xs">Community feedback</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Visual Security Processes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="mainframe-element mainframe-corner bg-black border border-purple-800 p-6 cursor-pointer hover:border-purple-600 transition-colors"
          onClick={() => setActiveProcess(activeProcess === "verify" ? null : "verify")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Fingerprint className="h-6 w-6 text-purple-400 mr-2" />
              When & Where We Protect
            </h3>
            <Badge variant="outline" className="bg-purple-950/50 text-purple-300 border-purple-700">
              {activeProcess === "verify" ? "Close" : "View"}
            </Badge>
          </div>
          
          {activeProcess === "verify" ? (
            <div className="space-y-4 mt-4">
              <p className="text-gray-300">
                NegraRosa protects deaf users across multiple contexts:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/30 p-4 rounded border border-gray-800">
                  <h4 className="text-md font-medium text-purple-300 mb-2">Organizational Security</h4>
                  <p className="text-gray-400 text-sm">
                    Protects deaf-run businesses and organizations from targeted attacks and data breaches.
                  </p>
                </div>
                
                <div className="bg-gray-900/30 p-4 rounded border border-gray-800">
                  <h4 className="text-md font-medium text-purple-300 mb-2">Community Networks</h4>
                  <p className="text-gray-400 text-sm">
                    Secures communication channels between deaf community members and organizations.
                  </p>
                </div>
                
                <div className="bg-gray-900/30 p-4 rounded border border-gray-800">
                  <h4 className="text-md font-medium text-purple-300 mb-2">Educational Institutions</h4>
                  <p className="text-gray-400 text-sm">
                    Provides specialized security for deaf schools and educational programs.
                  </p>
                </div>
                
                <div className="bg-gray-900/30 p-4 rounded border border-gray-800">
                  <h4 className="text-md font-medium text-purple-300 mb-2">Digital Platforms</h4>
                  <p className="text-gray-400 text-sm">
                    Secures online platforms and services used by the deaf community.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 bg-gray-900/30 rounded border border-gray-800 flex items-center justify-center">
              <div className="text-center">
                <Shield className="h-12 w-12 text-purple-400/70 mx-auto mb-2" />
                <span className="text-gray-400 text-sm">Click to explore when and where NegraRosa provides protection</span>
              </div>
            </div>
          )}
        </div>
        
        <div 
          className="mainframe-element mainframe-corner bg-black border border-purple-800 p-6 cursor-pointer hover:border-purple-600 transition-colors"
          onClick={() => setActiveProcess(activeProcess === "why" ? null : "why")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Shield className="h-6 w-6 text-purple-400 mr-2" />
              Why We're Different
            </h3>
            <Badge variant="outline" className="bg-purple-950/50 text-purple-300 border-purple-700">
              {activeProcess === "why" ? "Close" : "View"}
            </Badge>
          </div>
          
          {activeProcess === "why" ? (
            <div className="space-y-4 mt-4">
              <p className="text-gray-300">
                NegraRosa is built specifically for the deaf community:
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-900/30 p-4 rounded border border-gray-800">
                  <h4 className="text-md font-medium text-purple-300 mb-2">Visual-First Security</h4>
                  <p className="text-gray-400 text-sm">
                    Unlike traditional security systems that rely on auditory alerts and phone-based verification, NegraRosa is built from the ground up with visual communication channels.
                  </p>
                </div>
                
                <div className="bg-gray-900/30 p-4 rounded border border-gray-800">
                  <h4 className="text-md font-medium text-purple-300 mb-2">Deaf-Developed Protection</h4>
                  <p className="text-gray-400 text-sm">
                    Created by deaf security experts who understand the unique challenges faced by deaf organizations and users in digital security landscapes.
                  </p>
                </div>
                
                <div className="bg-gray-900/30 p-4 rounded border border-gray-800">
                  <h4 className="text-md font-medium text-purple-300 mb-2">Community-Driven Security</h4>
                  <p className="text-gray-400 text-sm">
                    Leverages the strength of deaf community networks to build more resilient security systems through trusted relationships.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 bg-gray-900/30 rounded border border-gray-800 flex items-center justify-center">
              <div className="text-center">
                <Key className="h-12 w-12 text-purple-400/70 mx-auto mb-2" />
                <span className="text-gray-400 text-sm">Click to discover why NegraRosa is uniquely designed for deaf communities</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tiny PinkSync floating button */}
      <div className="fixed bottom-4 right-4 z-50">
        <a 
          href="https://pinksync.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-full text-white text-xs border border-pink-800 shadow-lg hover:border-pink-600 transition-all group"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-pink-500 group-hover:text-pink-400 transition-colors"
          >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          PinkSync Integration Tools
        </a>
      </div>
    </div>
  );
}