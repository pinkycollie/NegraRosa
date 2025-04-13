import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { AccessTier } from "@shared/schema";

interface VerificationProgressProps {
  userId: number;
}

interface AccessTierResponse {
  tier: AccessTier;
}

export default function VerificationProgress({ userId }: VerificationProgressProps) {
  const { data: accessTierData, isLoading } = useQuery<AccessTierResponse>({
    queryKey: [`/api/users/${userId}/access-tier`],
  });

  const getProgressPercentage = (): number => {
    if (!accessTierData) return 0;
    
    switch (accessTierData.tier) {
      case AccessTier.FULL:
        return 100;
      case AccessTier.STANDARD:
        return 66;
      case AccessTier.BASIC:
      default:
        return 33;
    }
  };

  const getTierLabel = (): string => {
    if (!accessTierData) return "Loading...";
    
    switch (accessTierData.tier) {
      case AccessTier.FULL:
        return "Full Access Granted";
      case AccessTier.STANDARD:
        return "Standard Access Granted";
      case AccessTier.BASIC:
      default:
        return "Basic Access Granted";
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Your Verification Progress</h3>
        <span className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : getTierLabel()}
        </span>
      </div>
      <Progress value={getProgressPercentage()} className="h-2.5 mb-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Basic Access</span>
        <span>Standard Access</span>
        <span>Full Access</span>
      </div>
    </div>
  );
}
