import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { TransactionLimit } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface RiskManagementWidgetProps {
  userId: number;
}

interface TransactionLimitsResponse {
  singleTransactionLimit: number;
  dailyLimit: number;
  monthlyLimit: number;
}

interface TransactionResponse {
  id: number;
  userId: number;
  amount: number;
  status: string;
  riskScore: number;
  createdAt: string;
}

interface RiskAssessmentResponse {
  riskFactors: {
    name: string;
    score: number;
    level: string;
  }[];
  overallRisk: number;
  decision: {
    allowed: boolean;
    riskScore: number;
    restrictions?: any;
    reason?: string;
  };
}

export default function RiskManagementWidget({ userId }: RiskManagementWidgetProps) {
  const { data: transactionLimits, isLoading: isLoadingLimits } = useQuery<TransactionLimitsResponse>({
    queryKey: [`/api/users/${userId}/transaction-limits`],
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<TransactionResponse[]>({
    queryKey: [`/api/users/${userId}/transactions`],
  });

  // Get the most recent transaction
  const lastTransaction = transactions && transactions.length > 0 ? transactions[0] : null;

  // Get risk assessment for last transaction if available
  const { data: riskAssessment, isLoading: isLoadingRiskAssessment } = useQuery<RiskAssessmentResponse>({
    queryKey: [`/api/transactions/${lastTransaction?.id}/risk-assessment`],
    enabled: !!lastTransaction
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRiskLevelColor = (level: string): string => {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return 'text-red-500';
      case 'MEDIUM':
        return 'text-amber-500';
      case 'LOW':
      default:
        return 'text-green-500';
    }
  };

  const formatTransactionDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatLimits = (): TransactionLimit[] => {
    if (!transactionLimits) return [];
    
    return [
      {
        name: "Single Transaction",
        current: 500, // This would be dynamic in a real app, based on last transaction
        max: transactionLimits.singleTransactionLimit,
        percentUsed: Math.round((500 / transactionLimits.singleTransactionLimit) * 100)
      },
      {
        name: "Daily Total",
        current: 750, // This would be dynamic in a real app
        max: transactionLimits.dailyLimit,
        percentUsed: Math.round((750 / transactionLimits.dailyLimit) * 100)
      },
      {
        name: "Monthly Total",
        current: 2500, // This would be dynamic in a real app
        max: transactionLimits.monthlyLimit,
        percentUsed: Math.round((2500 / transactionLimits.monthlyLimit) * 100)
      }
    ];
  };

  const limits = formatLimits();

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-lg font-medium mb-4">Transaction Risk Management</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <div className="border border-border rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-3">Last Transaction Risk Assessment</h4>
            
            {isLoadingTransactions || !lastTransaction ? (
              <p className="text-muted-foreground">No recent transactions available.</p>
            ) : (
              <>
                <div className="flex items-center mb-4">
                  <div className={`rounded-full h-3 w-3 ${
                    lastTransaction.status === 'COMPLETED' ? 'bg-green-500' : 'bg-amber-500'
                  } mr-2`}></div>
                  <span className="text-sm font-medium">
                    {lastTransaction.status === 'COMPLETED' ? 'Low Risk (Approved)' : 'Review Required'}
                  </span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {formatCurrency(lastTransaction.amount)} on {formatTransactionDate(lastTransaction.createdAt)}
                  </span>
                </div>
                
                {isLoadingRiskAssessment ? (
                  <p>Loading risk assessment...</p>
                ) : riskAssessment ? (
                  <div className="space-y-3">
                    {riskAssessment.riskFactors.map((factor, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground">{factor.name}</span>
                          <span className={`text-sm font-medium ${getRiskLevelColor(factor.level)}`}>
                            {factor.level} Risk
                          </span>
                        </div>
                        <div className="bg-muted rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              factor.level === 'HIGH' ? 'bg-red-500' : 
                              factor.level === 'MEDIUM' ? 'bg-amber-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${factor.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No risk assessment available for this transaction.</p>
                )}
              </>
            )}
            
            {riskAssessment && (
              <div className="text-sm text-muted-foreground mt-4">
                <p className="mb-2"><strong>Transaction Decision:</strong> {riskAssessment.decision.allowed ? 'Approved' : 'Denied'}</p>
                <p>{riskAssessment.decision.reason || 'Risk assessment completed successfully.'}</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-medium mb-4">Your Transaction Limits</h4>
            
            {isLoadingLimits ? (
              <p>Loading limits...</p>
            ) : (
              <div className="scroll-container scrollbar-hide pb-2">
                <div className="space-y-4 min-w-max">
                  {limits.map((limit, index) => (
                    <div key={index} className="pr-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{limit.name}</span>
                        <span className="text-sm">{formatCurrency(limit.current)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${limit.percentUsed}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatCurrency(0)}</span>
                        <span>{formatCurrency(limit.max)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 text-sm">
              <p className="text-muted-foreground">Complete additional verification to increase your limits.</p>
              <Button className="mt-4 w-full">
                <Shield className="h-4 w-4 mr-2" />
                Increase Limits
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
