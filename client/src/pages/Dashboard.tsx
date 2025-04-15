import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types";
import { AuthTab } from "@/lib/types";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import DashboardTabs from "@/components/DashboardTabs";
import VerificationProgress from "@/components/authentication/VerificationProgress";
import VerificationMethods from "@/components/authentication/VerificationMethods";
import AccessTiers from "@/components/authentication/AccessTiers";
import ReputationBuildingCard from "@/components/reputation/ReputationBuildingCard";
import RiskManagementWidget from "@/components/risk/RiskManagementWidget";
import { IdentityOverview } from "@/components/identity/IdentityOverview";
import { BiometricRecovery } from "@/components/identity/BiometricRecovery";
import { CompanyPerspectiveWidget } from "@/components/identity/CompanyPerspectiveWidget";
import { CourtRecordsCorrection } from "@/components/identity/CourtRecordsCorrection";
import { ImmigrationDocumentation } from "@/components/identity/ImmigrationDocumentation";
import { FinancialHistoryVerification } from "@/components/identity/FinancialHistoryVerification";
import { ParentSupportVerification } from "@/components/identity/ParentSupportVerification";
import { DataSharingPolicy } from "@/components/identity/DataSharingPolicy";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, Award, Users } from "lucide-react";

interface DashboardProps {
  userId: number;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.AUTHENTICATION);

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <AppHeader user={user} />

      <div className="container mx-auto px-4 py-6 flex-1">
        <DashboardTabs activeTab={activeTab} onChange={handleTabChange} />

        {/* Authentication Module (default tab) */}
        {activeTab === AuthTab.AUTHENTICATION && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Inclusive Authentication</h2>
              <p className="text-muted-foreground max-w-3xl">
                Built with trust as default. Choose from multiple verification paths to suit your needs, with progressive access that grows over time.
              </p>
            </div>

            <VerificationProgress userId={userId} />
            <VerificationMethods userId={userId} />
            <AccessTiers userId={userId} />
            <ReputationBuildingCard userId={userId} />
            <RiskManagementWidget userId={userId} />
          </div>
        )}

        {/* Reputation System Tab */}
        {activeTab === AuthTab.REPUTATION && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Reputation Building System</h2>
              <p className="text-muted-foreground max-w-3xl">
                Build trust over time and recover from past mistakes. Your reputation score evolves as you use the system.
              </p>
            </div>
            <ReputationBuildingCard userId={userId} />
          </div>
        )}

        {/* Risk Management Tab */}
        {activeTab === AuthTab.RISK && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Intelligent Risk Management</h2>
              <p className="text-muted-foreground max-w-3xl">
                Our system manages risk instead of eliminating it, applying appropriate restrictions rather than denying access.
              </p>
            </div>
            <RiskManagementWidget userId={userId} />
          </div>
        )}

        {/* Fraud Detection Tab */}
        {activeTab === AuthTab.FRAUD && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Fraud Detection</h2>
              <p className="text-muted-foreground max-w-3xl">
                Advanced fraud detection that reduces false positives, especially for new users and those showing improvement over time.
              </p>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6 text-card-foreground mb-8">
              <h3 className="text-lg font-medium mb-4">Fraud Protection System</h3>
              <p className="text-muted-foreground mb-4">
                Our fraud detection system is designed to be inclusive by default. We reduce false positives for:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside mb-6">
                <li>New users with small transactions</li>
                <li>Users showing improvement over time</li>
                <li>Users with limited financial history</li>
                <li>Legitimate edge cases that might be flagged by traditional systems</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                When suspicious activity is detected, we apply graduated restrictions rather than outright blocking access.
              </p>
            </div>
          </div>
        )}

        {/* E&O Protection Tab */}
        {activeTab === AuthTab.ENO && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Errors & Omissions Protection</h2>
              <p className="text-muted-foreground max-w-3xl">
                A safety net for when things go wrong, our E&O protection system helps offset potential losses.
              </p>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6 text-card-foreground mb-8">
              <h3 className="text-lg font-medium mb-4">Coverage Protection</h3>
              <p className="text-muted-foreground mb-4">
                Our E&O system provides coverage for qualifying transactions, helping to protect you from errors, omissions, and unexpected issues.
              </p>
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="font-medium">How It Works</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    When you make a transaction, our system automatically evaluates if it qualifies for E&O coverage.
                    If something goes wrong, you can file a claim for review and potential settlement.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <h4 className="font-medium">Coverage Eligibility</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Eligibility depends on your account age, verification status, and reputation score.
                    The higher your reputation, the more coverage you qualify for.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Identity Overview Tab - NEW */}
        {activeTab === AuthTab.IDENTITY && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Identity Overview</h2>
                  <p className="text-muted-foreground max-w-3xl">
                    Your digital identity hub. See what companies know about you, control your data, and own your online presence.
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-end gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Valuation: 72%</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      <span>Level 3</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    The more you share and explain, the higher your trust score
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Main Identity Overview Component */}
              <IdentityOverview userId={userId} />
              
              {/* Data Sharing Policy */}
              <DataSharingPolicy userId={userId} />
              
              {/* Court Records Correction */}
              <CourtRecordsCorrection userId={userId} />
              
              {/* Immigration Documentation */}
              <ImmigrationDocumentation userId={userId} />
              
              {/* Financial History Verification */}
              <FinancialHistoryVerification userId={userId} />
              
              {/* Parent Support Verification */}
              <ParentSupportVerification userId={userId} />
              
              {/* Biometric Recovery System */}
              <BiometricRecovery userId={userId} />
              
              {/* Company Perspective Widget */}
              <CompanyPerspectiveWidget userId={userId} />
              
              {/* Community Impact Section */}
              <div className="bg-white border border-purple-200 shadow-sm rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Users className="h-8 w-8 text-purple-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Community Impact & Empowerment</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Your "I AM WHO I AM" NFT also serves as a key to community resources, collective bargaining, and economic opportunities.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <h4 className="font-medium text-sm text-gray-800 mb-1">Shared Resources</h4>
                        <p className="text-xs text-gray-600">Access to pooled community resources and support networks</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <h4 className="font-medium text-sm text-gray-800 mb-1">Economic Opportunities</h4>
                        <p className="text-xs text-gray-600">Priority access to jobs, loans, and investment opportunities</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <h4 className="font-medium text-sm text-gray-800 mb-1">Collective Voice</h4>
                        <p className="text-xs text-gray-600">Participate in community governance and decision-making</p>
                      </div>
                    </div>
                    <a 
                      href="#" 
                      className="text-sm font-medium text-purple-700 flex items-center hover:text-purple-800"
                    >
                      Explore Community Opportunities
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AppFooter />
    </div>
  );
}
