import { useQuery } from "@tanstack/react-query";
import { ArrowUpCircle } from "lucide-react";

interface ReputationProps {
  userId: number;
}

interface ReputationResponse {
  reputation: {
    value: number;
    positiveTransactions: number;
    totalTransactions: number;
    verificationCount: number;
    accountAge: number;
  };
  recommendations: string[];
}

export default function ReputationBuildingCard({ userId }: ReputationProps) {
  const { data, isLoading } = useQuery<ReputationResponse>({
    queryKey: [`/api/users/${userId}/reputation`],
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">Your Reputation Score</h3>
        <p>Loading reputation data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">Your Reputation Score</h3>
        <p>Unable to load reputation data.</p>
      </div>
    );
  }

  const { reputation, recommendations } = data;
  const scorePercentage = Math.round(reputation.value);
  const dashArray = 175.9; // 2πr where r=28
  const dashOffset = dashArray * (1 - scorePercentage / 100);

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium">Your Reputation Score</h3>
        <div className="relative h-16 w-16">
          <svg className="transform -rotate-90" width="64" height="64">
            <circle 
              className="text-muted stroke-current" 
              strokeWidth="4" 
              fill="transparent" 
              r="28" 
              cx="32" 
              cy="32" 
            />
            <circle 
              className="text-primary stroke-current" 
              strokeWidth="4" 
              fill="transparent" 
              r="28" 
              cx="32" 
              cy="32" 
              strokeDasharray={dashArray} 
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
            {scorePercentage}%
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-muted-foreground">Account Age</span>
            <span className="text-sm font-medium">{reputation.accountAge} days</span>
          </div>
          <div className="bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, (reputation.accountAge / 30) * 100)}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-muted-foreground">Positive Transactions</span>
            <span className="text-sm font-medium">
              {reputation.positiveTransactions} of {reputation.totalTransactions}
            </span>
          </div>
          <div className="bg-muted rounded-full h-1.5">
            <div 
              className="bg-green-500 h-1.5 rounded-full" 
              style={{ 
                width: reputation.totalTransactions > 0 
                  ? `${(reputation.positiveTransactions / reputation.totalTransactions) * 100}%` 
                  : '0%' 
              }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-muted-foreground">Verification Level</span>
            <span className="text-sm font-medium">{reputation.verificationCount} of 4 methods</span>
          </div>
          <div className="bg-muted rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full" 
              style={{ width: `${(reputation.verificationCount / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-medium mb-2">Improvement Recommendations</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <ArrowUpCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
