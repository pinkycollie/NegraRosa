import { AuthTab, TabItem } from "@/lib/types";

interface DashboardTabsProps {
  activeTab: AuthTab;
  onChange: (tab: AuthTab) => void;
}

export default function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
  const tabs: TabItem[] = [
    { id: AuthTab.AUTHENTICATION, label: "Authentication" },
    { id: AuthTab.REPUTATION, label: "Reputation System" },
    { id: AuthTab.RISK, label: "Risk Management" },
    { id: AuthTab.FRAUD, label: "Fraud Detection" },
    { id: AuthTab.ENO, label: "E&O Protection" },
  ];

  return (
    <div className="border-b border-border mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              py-4 px-1 text-sm font-medium border-b-2 transition-colors
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
  );
}
