import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { IdentityDataPoint } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Edit, Save, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface ExplanationEditorProps {
  userId: number;
}

export function ExplanationEditor({ userId }: ExplanationEditorProps) {
  const { toast } = useToast();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [explanationText, setExplanationText] = useState<string>("");
  
  // This would fetch real data in a production environment
  const { data: dataPoints, isLoading } = useQuery<IdentityDataPoint[]>({
    queryKey: [`/api/users/${userId}/identity-data-points`],
    // In a real implementation, this would be removed and the API would be called
    enabled: false,
  });

  // Mock data for demonstration
  const mockDataPoints: IdentityDataPoint[] = [
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
      category: "Financial",
      label: "Loan Default",
      value: "1 default in 2021",
      source: "Credit Bureau",
      visibleTo: ["Financial Institutions"],
      explainable: true,
      lastUpdated: "2024-02-20"
    },
    {
      category: "Residence",
      label: "Address Changes",
      value: "3 changes in last 5 years",
      source: "Background Check Service",
      visibleTo: ["Employers", "Financial Institutions", "Housing Services"],
      explainable: true,
      lastUpdated: "2024-01-15"
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

  // Mutation for saving explanations
  const saveExplanationMutation = useMutation({
    mutationFn: async (dataPoint: IdentityDataPoint) => {
      // In a real app, this would send the updated explanation to the server
      return await apiRequest("POST", `/api/users/${userId}/identity-explanations`, {
        dataPointId: dataPoint.label, // Using label as ID for demo
        explanation: dataPoint.userExplanation
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/identity-data-points`] });
      toast({
        title: "Explanation Saved",
        description: "Your context has been added to this data point.",
        variant: "default",
      });
      setEditingIndex(null);
    },
    onError: () => {
      toast({
        title: "Failed to Save",
        description: "We couldn't save your explanation. Please try again.",
        variant: "destructive",
      });
    }
  });

  const startEditing = (index: number, currentExplanation?: string) => {
    setEditingIndex(index);
    setExplanationText(currentExplanation || "");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setExplanationText("");
  };

  const saveExplanation = (dataPoint: IdentityDataPoint) => {
    const updatedDataPoint = {
      ...dataPoint,
      userExplanation: explanationText
    };
    
    // In a real implementation, this would be done by the API mutation
    mockDataPoints[editingIndex!].userExplanation = explanationText;
    
    saveExplanationMutation.mutate(updatedDataPoint);
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
  const explainableDataPoints = mockDataPoints.filter(dp => dp.explainable);

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="font-medium flex items-center gap-2 mb-2">
          <Edit className="h-4 w-4 text-primary" />
          Add Your Context & Explanations
        </h3>
        <p className="text-sm text-muted-foreground">
          Some data points may not tell your complete story. Add explanations to provide important context
          that companies should understand about your situation.
        </p>
      </div>
      
      {explainableDataPoints.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No explainable data points found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {explainableDataPoints.map((dataPoint, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="bg-muted/20 px-4 py-3 flex justify-between items-start">
                <div>
                  <div className="font-medium">{dataPoint.label}</div>
                  <div className="text-xs text-muted-foreground flex gap-2 mt-0.5">
                    <span>{dataPoint.category}</span>
                    <span>•</span>
                    <span>Source: {dataPoint.source}</span>
                  </div>
                </div>
                <div className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                  {dataPoint.value}
                </div>
              </div>
              
              <Separator />
              
              <div className="p-4">
                {editingIndex === i ? (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Your Explanation</label>
                    <Textarea
                      value={explanationText}
                      onChange={(e) => setExplanationText(e.target.value)}
                      placeholder="Explain the context behind this data point..."
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={cancelEditing}>
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => saveExplanation(dataPoint)}
                        disabled={saveExplanationMutation.isPending}
                      >
                        {saveExplanationMutation.isPending ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            Save Explanation
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  dataPoint.userExplanation ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Explanation Provided</span>
                      </div>
                      <p className="text-sm bg-green-50 p-3 rounded-md border border-green-100">
                        "{dataPoint.userExplanation}"
                      </p>
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startEditing(i, dataPoint.userExplanation)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit Explanation
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        No explanation provided yet. Adding context can help decision-makers better understand your situation.
                      </p>
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startEditing(i)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Add Explanation
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
        <div className="flex gap-2 text-blue-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-sm">The Power of Context</h4>
            <p className="text-xs mt-1">
              Your explanations help reduce your risk score by providing important context.
              Companies that see both your data and your explanations make more informed decisions about your applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}