import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Circle } from "lucide-react";
import { AccessTier } from "@shared/schema";
import { AccessTierInfo } from "@/lib/types";

interface AccessTiersProps {
  userId: number;
}

interface AccessTierResponse {
  tier: AccessTier;
}

export default function AccessTiers({ userId }: AccessTiersProps) {
  const { data: accessTierData, isLoading } = useQuery<AccessTierResponse>({
    queryKey: [`/api/users/${userId}/access-tier`],
  });

  const tiers: AccessTierInfo[] = [
    {
      tier: AccessTier.BASIC,
      title: "Tier 1: Basic Access",
      description: "Includes basic browsing, simple transactions, and limited account features.",
      requirementText: "Requires: Phone verification or any single verification method.",
      isCurrent: accessTierData?.tier === AccessTier.BASIC
    },
    {
      tier: AccessTier.STANDARD,
      title: "Tier 2: Standard Access",
      description: "Includes higher transaction limits, full account features, and premium content.",
      requirementText: "Requires: Two verification methods, positive account history for 15+ days.",
      isCurrent: accessTierData?.tier === AccessTier.STANDARD
    },
    {
      tier: AccessTier.FULL,
      title: "Tier 3: Full Access",
      description: "Includes highest transaction limits, instant settlements, and all premium features.",
      requirementText: "Requires: Complete verification, 30+ days of positive account history.",
      isCurrent: accessTierData?.tier === AccessTier.FULL
    }
  ];

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-lg font-medium mb-4">Access Tiers</h3>
      <div className="space-y-4">
        {tiers.map((tier) => (
          <div 
            key={tier.tier}
            className={`
              flex items-start p-4 rounded-lg border
              ${tier.isCurrent 
                ? "bg-primary/10 border-primary/20" 
                : "border-border"
              }
            `}
          >
            <div className="flex-shrink-0 mt-1">
              {tier.isCurrent ? (
                <CheckCircle className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="ml-3">
              <h4 className="font-medium">
                {tier.title}
                {tier.isCurrent && <span className="text-sm font-normal text-primary ml-2">(Current)</span>}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {tier.description}
                <br />
                {tier.requirementText}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
