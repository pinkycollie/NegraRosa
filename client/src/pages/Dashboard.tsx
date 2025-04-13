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
      </div>

      <AppFooter />
    </div>
  );
}
