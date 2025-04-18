import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Award, Lock, Eye, Fingerprint, Users, Code, Zap, Badge, Star, Check, Clock, Upload, FileCheck, ThumbsUp, Search, Scan, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Badge types and their status
export interface SecurityBadge {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  level: 1 | 2 | 3 | 4 | 5;
  isUnlocked: boolean;
  progress: number; // 0-100 for partially completed badges
  category: "verification" | "authentication" | "community" | "education" | "contribution" | "discovery" | "scanning" | "implementation" | "advanced" | "entrepreneur";
  colorClass: string;
  rewards: string[];
  dateEarned?: string;
}

interface SecurityAchievementBadgesProps {
  userId: number;
}

export default function SecurityAchievementBadges({ userId }: SecurityAchievementBadgesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  
  // Simulated badges data
  const badges: SecurityBadge[] = [
    {
      id: "identity-verified",
      name: "Identity Guardian",
      description: "Successfully verified your identity through multiple verification methods",
      icon: <Shield className="h-6 w-6" />,
      level: 1, 
      isUnlocked: true,
      progress: 100,
      category: "verification",
      colorClass: "text-green-500 border-green-500 bg-green-500/10",
      rewards: ["Access to enhanced security features", "Verification badge on community posts"],
      dateEarned: "2023-08-15"
    },
    {
      id: "sign-auth-master",
      name: "Sign Authentication Master",
      description: "Completed sign language authentication setup and successfully used it for login",
      icon: <Fingerprint className="h-6 w-6" />,
      level: 2,
      isUnlocked: true,
      progress: 100,
      category: "authentication",
      colorClass: "text-blue-500 border-blue-500 bg-blue-500/10",
      rewards: ["Unlock gesture-based quick auth", "Security clearance level 2"],
      dateEarned: "2023-09-02"
    },
    {
      id: "community-contributor",
      name: "Community Contributor",
      description: "Actively participated in the deaf security community and contributed to discussions",
      icon: <Users className="h-6 w-6" />,
      level: 3,
      isUnlocked: false,
      progress: 75,
      category: "community",
      colorClass: "text-purple-500 border-purple-500 bg-purple-500/10",
      rewards: ["Access to exclusive community forums", "Ability to create community security guides"]
    },
    {
      id: "quick-responder",
      name: "Alert Responder",
      description: "Responded to security alerts within a 12-hour window multiple times",
      icon: <Zap className="h-6 w-6" />,
      level: 1,
      isUnlocked: true,
      progress: 100,
      category: "verification",
      colorClass: "text-amber-500 border-amber-500 bg-amber-500/10",
      rewards: ["Priority support access", "Early warning system access"],
      dateEarned: "2023-07-20"
    },
    {
      id: "security-educator",
      name: "Security Educator",
      description: "Completed the full security education course for deaf-first approaches",
      icon: <Award className="h-6 w-6" />,
      level: 4,
      isUnlocked: false,
      progress: 60,
      category: "education",
      colorClass: "text-indigo-500 border-indigo-500 bg-indigo-500/10",
      rewards: ["Ability to create security training materials", "Featured contributor status"]
    },
    {
      id: "code-contributor",
      name: "Code Contributor",
      description: "Contributed to the open source deaf-first security framework",
      icon: <Code className="h-6 w-6" />,
      level: 5,
      isUnlocked: false,
      progress: 30,
      category: "contribution",
      colorClass: "text-rose-500 border-rose-500 bg-rose-500/10",
      rewards: ["Named recognition in the project", "Developer badge in community"]
    },
    {
      id: "multi-factor-master",
      name: "Multi-Factor Master",
      description: "Set up all available security authentication methods for your account",
      icon: <Lock className="h-6 w-6" />,
      level: 3,
      isUnlocked: false,
      progress: 40,
      category: "authentication",
      colorClass: "text-cyan-500 border-cyan-500 bg-cyan-500/10",
      rewards: ["Ultra-secure account status", "Simplified authentication process"]
    },
    {
      id: "early-adopter",
      name: "Early Adopter",
      description: "One of the first 100 community members to use the NegraRosa security framework",
      icon: <Star className="h-6 w-6" />,
      level: 2,
      isUnlocked: true,
      progress: 100,
      category: "community",
      colorClass: "text-yellow-500 border-yellow-500 bg-yellow-500/10",
      rewards: ["Exclusive early adopter badge", "Beta access to new features"],
      dateEarned: "2023-05-10"
    },
    {
      id: "verification-streak",
      name: "Verification Streak",
      description: "Completed identity verification checks for 5 consecutive months",
      icon: <Clock className="h-6 w-6" />,
      level: 3,
      isUnlocked: false,
      progress: 80,
      category: "verification",
      colorClass: "text-orange-500 border-orange-500 bg-orange-500/10",
      rewards: ["Extended verification periods", "Trusted member status"]
    },
    {
      id: "content-contributor",
      name: "Content Contributor",
      description: "Uploaded helpful security resource materials for the deaf community",
      icon: <Upload className="h-6 w-6" />,
      level: 2,
      isUnlocked: false,
      progress: 20,
      category: "contribution",
      colorClass: "text-emerald-500 border-emerald-500 bg-emerald-500/10",
      rewards: ["Featured content creator tag", "Content distribution priority"]
    },
    {
      id: "asset-discovery-pioneer",
      name: "Asset Discovery Pioneer",
      description: "Successfully identified and cataloged security risks in the network",
      icon: <Search className="h-6 w-6" />,
      level: 3,
      isUnlocked: false,
      progress: 45,
      category: "discovery",
      colorClass: "text-amber-500 border-amber-500 bg-amber-500/10",
      rewards: ["Access to advanced discovery tools", "Security asset mapping privileges"]
    },
    {
      id: "vulnerability-hunter",
      name: "Vulnerability Hunter",
      description: "Located critical vulnerabilities during routine scanning sessions",
      icon: <Scan className="h-6 w-6" />,
      level: 4,
      isUnlocked: false,
      progress: 35,
      category: "scanning",
      colorClass: "text-teal-500 border-teal-500 bg-teal-500/10",
      rewards: ["Priority vulnerability reporting", "Scanner optimization access"]
    },
    {
      id: "oauth-implementer",
      name: "OAuth Implementer",
      description: "Successfully integrated secure OAuth flows into applications",
      icon: <Key className="h-6 w-6" />,
      level: 5,
      isUnlocked: false,
      progress: 15,
      category: "implementation",
      colorClass: "text-cyan-500 border-cyan-500 bg-cyan-500/10",
      rewards: ["Identity Provider certification", "API security champion badge"]
    },
    {
      id: "jwt-specialist",
      name: "JWT Specialist",
      description: "Demonstrated expertise in secure JWT implementation best practices",
      icon: <Key className="h-6 w-6" />,
      level: 4,
      isUnlocked: false,
      progress: 10,
      category: "implementation",
      colorClass: "text-cyan-500 border-cyan-500 bg-cyan-500/10",
      rewards: ["Token security review privileges", "Access to advanced token rotations methods"]
    },
    {
      id: "security-protector",
      name: "Security Protector",
      description: "Achieved excellence in implementing multiple security measures for deaf users",
      icon: <Star className="h-6 w-6" />,
      level: 5,
      isUnlocked: false,
      progress: 5,
      category: "advanced",
      colorClass: "text-pink-500 border-pink-500 bg-pink-500/10",
      rewards: ["NegraRosa security advisory board consideration", "Advanced security clearance level"]
    },
    {
      id: "business-defender",
      name: "Business Defender",
      description: "Successfully implemented comprehensive security measures for a deaf-owned business",
      icon: <ThumbsUp className="h-6 w-6" />,
      level: 3,
      isUnlocked: false,
      progress: 40,
      category: "entrepreneur",
      colorClass: "text-orange-500 border-orange-500 bg-orange-500/10",
      rewards: ["Business security assessment", "Risk mitigation consultation"]
    },
    {
      id: "payment-guardian",
      name: "Payment Guardian",
      description: "Secured payment systems for deaf entrepreneurs with enhanced verification protocols",
      icon: <ThumbsUp className="h-6 w-6" />,
      level: 4,
      isUnlocked: false,
      progress: 25,
      category: "entrepreneur",
      colorClass: "text-orange-500 border-orange-500 bg-orange-500/10",
      rewards: ["Payment verification toolkit", "Financial security monitoring access"]
    },
    {
      id: "data-protector",
      name: "Data Protector",
      description: "Implemented data protection measures for deaf-owned businesses' sensitive information",
      icon: <FileCheck className="h-6 w-6" />,
      level: 4,
      isUnlocked: false,
      progress: 30,
      category: "entrepreneur",
      colorClass: "text-orange-500 border-orange-500 bg-orange-500/10",
      rewards: ["Data encryption toolkit", "Privacy compliance certification"]
    },
    {
      id: "blockchain-guardian",
      name: "Blockchain Guardian",
      description: "Implemented secure smart contracts and Web3 protocols for deaf entrepreneurs",
      icon: <Code className="h-6 w-6" />,
      level: 5,
      isUnlocked: false,
      progress: 15,
      category: "entrepreneur",
      colorClass: "text-orange-500 border-orange-500 bg-orange-500/10",
      rewards: ["Smart contract security audit", "Decentralized identity toolkit"]
    },
    {
      id: "web3-innovator",
      name: "Web3 Innovator",
      description: "Created secure decentralized applications that enhance accessibility for deaf users",
      icon: <ThumbsUp className="h-6 w-6" />,
      level: 4,
      isUnlocked: false, 
      progress: 20,
      category: "entrepreneur",
      colorClass: "text-orange-500 border-orange-500 bg-orange-500/10",
      rewards: ["Token-gated community access", "Blockchain security workshop"]
    },
    {
      id: "wallet-defender",
      name: "Wallet Defender",
      description: "Protected cryptocurrency wallets with enhanced security measures for deaf business owners",
      icon: <Lock className="h-6 w-6" />,
      level: 3,
      isUnlocked: false,
      progress: 25,
      category: "entrepreneur",
      colorClass: "text-orange-500 border-orange-500 bg-orange-500/10",
      rewards: ["Cold storage wallet setup guide", "Crypto transaction safety toolkit"]
    }
  ];
  
  // Filter badges by category
  const filteredBadges = selectedCategory === "all" 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);
  
  // Sort badges: unlocked first, then by progress percentage
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;
    return b.progress - a.progress;
  });
  
  // Calculate overall security score based on badges
  const totalPossibleScore = badges.length * 100;
  const currentScore = badges.reduce((sum, badge) => sum + badge.progress, 0);
  const securityScore = Math.round((currentScore / totalPossibleScore) * 100);
  
  // Calculate category percentages
  const categories = ["verification", "authentication", "community", "education", "contribution", "discovery", "scanning", "implementation", "advanced", "entrepreneur"];
  const categoryStats = categories.map(cat => {
    const catBadges = badges.filter(b => b.category === cat);
    const catTotal = catBadges.length * 100;
    const catScore = catBadges.reduce((sum, badge) => sum + badge.progress, 0);
    const percentage = catTotal > 0 ? Math.round((catScore / catTotal) * 100) : 0;
    
    return {
      name: cat,
      percentage,
      count: catBadges.length,
      completed: catBadges.filter(b => b.isUnlocked).length
    };
  });
  
  const getCategoryColor = (category: string) => {
    switch(category) {
      case "verification": return "text-green-500";
      case "authentication": return "text-blue-500";
      case "community": return "text-purple-500";
      case "education": return "text-indigo-500";
      case "contribution": return "text-rose-500";
      case "discovery": return "text-amber-500";
      case "scanning": return "text-teal-500";
      case "implementation": return "text-cyan-500";
      case "advanced": return "text-pink-500";
      case "entrepreneur": return "text-orange-500";
      default: return "text-gray-500";
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "verification": return <Shield className="h-4 w-4" />;
      case "authentication": return <Fingerprint className="h-4 w-4" />;
      case "community": return <Users className="h-4 w-4" />;
      case "education": return <Award className="h-4 w-4" />;
      case "contribution": return <Code className="h-4 w-4" />;
      case "discovery": return <Search className="h-4 w-4" />;
      case "scanning": return <Scan className="h-4 w-4" />;
      case "implementation": return <Key className="h-4 w-4" />;
      case "advanced": return <Star className="h-4 w-4" />;
      case "entrepreneur": return <ThumbsUp className="h-4 w-4" />;
      default: return <Badge className="h-4 w-4" />;
    }
  };
  
  const formatCategoryName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-purple-800 bg-black/60 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Shield className="h-6 w-6 text-purple-400 mr-2" />
              Security Achievement Badges
            </h2>
            <p className="text-sm text-gray-400">Earn badges by completing security-related activities</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant={viewType === "grid" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewType("grid")}
              className="h-8 gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Grid
            </Button>
            <Button 
              variant={viewType === "list" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewType("list")}
              className="h-8 gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              List
            </Button>
          </div>
        </div>
        
        {/* Overall stats */}
        <div className="mb-6 p-4 rounded-lg border border-purple-800/40 bg-gray-900/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-1">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#333"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - securityScore / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-purple-400">{securityScore}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mt-2">Overall Security Score</p>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {categoryStats.map((cat) => (
                  <div 
                    key={cat.name}
                    className="flex flex-col p-2 rounded-lg border border-gray-800 cursor-pointer hover:bg-gray-800/30 transition-colors"
                    onClick={() => setSelectedCategory(cat.name === selectedCategory ? "all" : cat.name)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <span className={`mr-1.5 ${getCategoryColor(cat.name)}`}>
                          {getCategoryIcon(cat.name)}
                        </span>
                        <span className="text-xs font-medium text-gray-300">
                          {formatCategoryName(cat.name)}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-400">
                        {cat.percentage}%
                      </span>
                    </div>
                    <Progress value={cat.percentage} className="h-1 bg-gray-700" />
                    <div className="text-xs text-gray-500 mt-1">
                      {cat.completed} of {cat.count} badges
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Category filter tabs */}
        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2 whitespace-nowrap scrollbar-hide">
          <Button 
            variant={selectedCategory === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className="h-7 text-xs"
          >
            <Badge className="h-3 w-3 mr-1" />
            All Badges
          </Button>
          
          {categories.map(category => (
            <Button 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`h-7 text-xs ${selectedCategory === category ? '' : 'border-gray-700'}`}
            >
              <span className={`mr-1 ${getCategoryColor(category)}`}>
                {getCategoryIcon(category)}
              </span>
              {formatCategoryName(category)}
            </Button>
          ))}
        </div>
        
        {/* Badges display - Grid view */}
        {viewType === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedBadges.map((badge) => (
              <TooltipProvider key={badge.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      className={`relative rounded-lg border ${badge.isUnlocked ? badge.colorClass : 'border-gray-700 bg-gray-900/30'} p-4 cursor-pointer`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {/* Badge level indicator */}
                      <div className="absolute top-2 right-2 flex">
                        {[...Array(badge.level)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-2 w-2 rounded-full mr-0.5 ${badge.isUnlocked ? badge.colorClass.split(' ')[0] : 'bg-gray-600'}`}
                          ></div>
                        ))}
                      </div>
                      
                      <div className="flex flex-col items-center text-center">
                        <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-3 ${badge.isUnlocked ? badge.colorClass : 'bg-gray-800/50 text-gray-500'}`}>
                          {badge.icon}
                        </div>
                        
                        <h3 className={`font-medium text-sm mb-1 ${badge.isUnlocked ? badge.colorClass.split(' ')[0] : 'text-gray-400'}`}>
                          {badge.name}
                        </h3>
                        
                        <div className="w-full mt-2">
                          <Progress value={badge.progress} className="h-1 bg-gray-700" />
                        </div>
                        
                        <div className="flex items-center mt-1.5">
                          <span className="text-xs text-gray-500">{badge.progress}%</span>
                          {badge.isUnlocked && (
                            <div className="flex items-center ml-2 text-green-500">
                              <Check className="h-3 w-3 mr-0.5" />
                              <span className="text-xs">Earned</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="w-72 p-0 bg-black border border-gray-800">
                    <div className="p-3">
                      <div className="flex items-start">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${badge.colorClass}`}>
                          {badge.icon}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm ${badge.colorClass.split(' ')[0]}`}>{badge.name}</h3>
                          <p className="text-xs text-gray-300 mt-0.5">{badge.description}</p>
                        </div>
                      </div>
                      
                      {badge.isUnlocked && badge.dateEarned && (
                        <div className="mt-2 pt-2 border-t border-gray-800 text-xs text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Earned on {new Date(badge.dateEarned).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <div className="mt-2 pt-2 border-t border-gray-800">
                        <h4 className="text-xs font-medium text-gray-300 mb-1">Rewards:</h4>
                        <ul className="text-xs text-gray-400">
                          {badge.rewards.map((reward, idx) => (
                            <li key={idx} className="flex items-start mb-0.5">
                              <span className="text-xs mr-1">•</span>
                              <span>{reward}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
        
        {/* Badges display - List view */}
        {viewType === "list" && (
          <div className="space-y-2">
            {sortedBadges.map((badge) => (
              <motion.div 
                key={badge.id} 
                className={`rounded-lg border ${badge.isUnlocked ? badge.colorClass : 'border-gray-700 bg-gray-900/30'} p-3`}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${badge.isUnlocked ? badge.colorClass : 'bg-gray-800/50 text-gray-500'}`}>
                    {badge.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-sm ${badge.isUnlocked ? badge.colorClass.split(' ')[0] : 'text-gray-400'}`}>
                        {badge.name}
                      </h3>
                      
                      {/* Badge level indicator */}
                      <div className="flex items-center">
                        {[...Array(badge.level)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-2 w-2 rounded-full mr-0.5 ${badge.isUnlocked ? badge.colorClass.split(' ')[0] : 'bg-gray-600'}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-1.5">{badge.description}</p>
                    
                    <div className="w-full">
                      <Progress value={badge.progress} className="h-1 bg-gray-700" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end ml-4">
                    <span className="text-xs font-medium text-gray-400">{badge.progress}%</span>
                    {badge.isUnlocked && (
                      <div className="flex items-center text-green-500 mt-0.5">
                        <Check className="h-3 w-3 mr-0.5" />
                        <span className="text-xs">Earned</span>
                      </div>
                    )}
                    
                    {badge.isUnlocked && badge.dateEarned && (
                      <div className="mt-0.5 text-xs text-gray-500">
                        {new Date(badge.dateEarned).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}