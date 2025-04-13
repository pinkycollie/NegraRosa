import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, EyeOff, RefreshCw, Save } from "lucide-react";
import { IdentityDataPoint } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface DataVisibilityControlProps {
  userId: number;
}

export function DataVisibilityControl({ userId }: DataVisibilityControlProps) {
  const { toast } = useToast();
  const [dataPoints, setDataPoints] = useState<IdentityDataPoint[]>([]);
  const [saveInProgress, setSaveInProgress] = useState(false);
  
  // This would fetch real data in a production environment
  const { data, isLoading } = useQuery<IdentityDataPoint[]>({
    queryKey: [`/api/users/${userId}/identity-data-points`],
    onSuccess: (data) => {
      if (data) setDataPoints(data);
    },
    // In a real implementation, this would be removed and the API would be called
    enabled: false,
  });

  // Mock data for demonstration
  const mockDataPoints: IdentityDataPoint[] = [
    {
      category: "Personal",
      label: "Full Name",
      value: "Thomas Anderson",
      source: "Self-Reported",
      visibleTo: ["Financial Institutions", "Government", "Healthcare"],
      explainable: false,
      lastUpdated: "2024-02-15"
    },
    {
      category: "Personal",
      label: "Address History",
      value: "3 addresses in last 5 years",
      source: "Credit Bureau",
      visibleTo: ["Financial Institutions", "Government"],
      explainable: true,
      userExplanation: "Relocated for work opportunities",
      lastUpdated: "2024-01-20"
    },
    {
      category: "Financial",
      label: "Credit Score",
      value: "680",
      source: "Equifax",
      visibleTo: ["Financial Institutions"],
      explainable: true,
      lastUpdated: "2024-03-01"
    },
    {
      category: "Employment",
      label: "Employment Gaps",
      value: "8 months in 2022",
      source: "Employment Verification Service",
      visibleTo: ["Employers", "Financial Institutions"],
      explainable: true,
      userExplanation: "Was pursuing education during this period",
      lastUpdated: "2024-03-15"
    },
    {
      category: "Identity",
      label: "ID Verification Level",
      value: "Level 3 (Government Verified)",
      source: "NegraRosa Verification",
      visibleTo: ["All Services"],
      explainable: false,
      lastUpdated: "2024-02-10"
    },
    {
      category: "Employment",
      label: "Job Applications",
      value: "12 in last 6 months",
      source: "Job Platform Data",
      visibleTo: ["Employers"],
      explainable: true,
      lastUpdated: "2024-03-20"
    }
  ];

  // Toggle visibility for a specific company type
  const toggleVisibility = (dataPointIndex: number, companyType: string) => {
    const updatedDataPoints = [...dataPoints];
    const dataPoint = updatedDataPoints[dataPointIndex];
    
    if (dataPoint.visibleTo.includes(companyType)) {
      dataPoint.visibleTo = dataPoint.visibleTo.filter(type => type !== companyType);
    } else {
      dataPoint.visibleTo.push(companyType);
    }
    
    setDataPoints(updatedDataPoints);
  };

  // Save visibility settings
  const saveVisibilitySettings = () => {
    setSaveInProgress(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaveInProgress(false);
      toast({
        title: "Visibility Settings Saved",
        description: "Your data visibility preferences have been updated.",
        variant: "default",
      });
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading data points...</p>
      </div>
    );
  }

  // Use mock data for demonstration
  const displayDataPoints = dataPoints.length ? dataPoints : mockDataPoints;

  // Get unique company types across all data points
  const allCompanyTypes = Array.from(
    new Set(displayDataPoints.flatMap(dp => dp.visibleTo))
  ).sort();

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Control exactly which companies and services can see your data. Toggle visibility for different organization types.
      </p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Data Point</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Value</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Source</th>
              {allCompanyTypes.map(type => (
                <th key={type} className="py-2 px-3 text-center text-xs font-medium text-muted-foreground">
                  {type}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayDataPoints.map((dataPoint, i) => (
              <tr key={i} className="border-b">
                <td className="py-3 px-3 text-sm">
                  <div className="font-medium">{dataPoint.label}</div>
                  <div className="text-xs text-muted-foreground">{dataPoint.category}</div>
                </td>
                <td className="py-3 px-3 text-sm">{dataPoint.value}</td>
                <td className="py-3 px-3 text-xs text-muted-foreground">{dataPoint.source}</td>
                {allCompanyTypes.map(type => (
                  <td key={type} className="py-3 px-3 text-center">
                    <Switch
                      checked={dataPoint.visibleTo.includes(type)}
                      onCheckedChange={() => toggleVisibility(i, type)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
        <div className="text-sm">
          <div className="font-medium flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Visibility Summary
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {displayDataPoints.reduce((sum, dp) => sum + dp.visibleTo.length, 0)} visibility settings enabled across {displayDataPoints.length} data points
          </p>
        </div>
        <Button onClick={saveVisibilitySettings} disabled={saveInProgress}>
          {saveInProgress ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <div className="flex gap-2 text-amber-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-sm">Privacy Notice</h4>
            <p className="text-xs mt-1">
              Some critical data points may be required for specific services to function correctly. 
              You have the right to restrict access, but this may limit functionality of certain services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}