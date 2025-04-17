import { AuthTab, TabItem } from "@/lib/types";
import { KeyRound } from "lucide-react";

interface DashboardTabsProps {
  activeTab: AuthTab;
  onChange: (tab: AuthTab) => void;
}

export default function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
  const tabs: TabItem[] = [
    { id: AuthTab.AUTHENTICATION, label: "CIVIC.com Verification" },
    { id: AuthTab.REPUTATION, label: "Reputation System" },
    { id: AuthTab.RISK, label: "Risk Management" },
    { id: AuthTab.FRAUD, label: "Fraud Detection" },
    { id: AuthTab.ENO, label: "E&O Protection" },
    { id: AuthTab.IDENTITY, label: "Identity Overview" },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <KeyRound className="h-5 w-5 text-blue-500" />
        <span className="text-sm text-blue-700">
          <strong>Powered by CIVIC.com</strong> - Industry-leading identity verification and authentication services
        </span>
      </div>
      
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="overflow-x-auto pb-1 scrollbar-hide">
          <nav className="-mb-px flex space-x-8 min-w-max px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  py-4 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
