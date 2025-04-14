import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, PlusCircle, RefreshCw, Trash2, Play, Edit, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Webhook {
  id: string;
  name: string;
  url: string;
  event: string;
  userId: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt: string | null;
}

interface WebhookPayload {
  id: string;
  webhookId: string;
  event: string;
  data: any;
  deliveryStatus: string;
  timestamp: string;
  responseCode: number | null;
  responseBody: string | null;
  notionEntryId: string | null;
  retryCount: number | null;
}

interface CreateWebhookData {
  name: string;
  url: string;
  event: string;
  userId: number;
  active: boolean;
}

export default function WebhookManagement() {
  const { toast } = useToast();
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isShowingPayloads, setIsShowingPayloads] = useState(false);
  const [createFormData, setCreateFormData] = useState<Partial<CreateWebhookData>>({
    name: "",
    url: "",
    event: "",
    userId: 1, // Default user ID
    active: true,
  });
  const [testPayloadData, setTestPayloadData] = useState("");
  const [notionStatus, setNotionStatus] = useState<"unchecked" | "connected" | "error">("unchecked");
  const [backroundTasksStatus, setBackgroundTasksStatus] = useState<{running: boolean, taskCount: number}>({
    running: false,
    taskCount: 0
  });
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvImportData, setCsvImportData] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);

  // Query to fetch webhooks
  const { 
    data: webhooks, 
    isLoading: isLoadingWebhooks,
    refetch: refetchWebhooks
  } = useQuery({
    queryKey: ["/api/webhooks", selectedUserId],
    queryFn: async () => {
      const url = selectedUserId 
        ? `/api/webhooks?userId=${selectedUserId}` 
        : "/api/webhooks";
      const response = await apiRequest("GET", url);
      return response.json();
    },
  });

  // Query to fetch payloads for selected webhook
  const { 
    data: payloads, 
    isLoading: isLoadingPayloads,
    refetch: refetchPayloads
  } = useQuery({
    queryKey: ["/api/webhooks/payloads", selectedWebhook?.id],
    queryFn: async () => {
      if (!selectedWebhook) return [];
      const response = await apiRequest("GET", `/api/webhooks/${selectedWebhook.id}/payloads`);
      return response.json();
    },
    enabled: !!selectedWebhook && isShowingPayloads,
  });

  // Query to fetch background tasks status
  const { 
    data: tasksStatus,
    refetch: refetchTasksStatus
  } = useQuery({
    queryKey: ["/api/background-tasks/status"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/background-tasks/status");
      return response.json();
    },
    refetchInterval: 10000, // Check status every 10 seconds
  });

  // Effect to update background tasks status
  useEffect(() => {
    if (tasksStatus) {
      setBackgroundTasksStatus({
        running: tasksStatus.running,
        taskCount: tasksStatus.tasks?.length || 0
      });
    }
  }, [tasksStatus]);

  // Mutation to create a webhook
  const createWebhookMutation = useMutation({
    mutationFn: async (data: CreateWebhookData) => {
      const response = await apiRequest("POST", `/api/users/${data.userId}/webhooks`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Webhook created",
        description: "The webhook has been created successfully.",
      });
      setCreateFormData({
        name: "",
        url: "",
        event: "",
        userId: 1,
        active: true,
      });
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
    },
    onError: (error) => {
      toast({
        title: "Error creating webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to update a webhook
  const updateWebhookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateWebhookData> }) => {
      const response = await apiRequest("PATCH", `/api/webhooks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Webhook updated",
        description: "The webhook has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a webhook
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/webhooks/${id}`);
      return response.status === 204; // Success if status is 204 No Content
    },
    onSuccess: () => {
      toast({
        title: "Webhook deleted",
        description: "The webhook has been deleted successfully.",
      });
      setSelectedWebhook(null);
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to trigger a webhook
  const triggerWebhookMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const response = await apiRequest("POST", `/api/webhooks/${id}/trigger`, { payload });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Webhook triggered",
        description: "The webhook has been triggered successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks/payloads", selectedWebhook?.id] });
      setTestPayloadData("");
      setIsTesting(false);
    },
    onError: (error) => {
      toast({
        title: "Error triggering webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to test Notion connection
  const testNotionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/notion/test-connection");
      return response.json();
    },
    onSuccess: (data) => {
      setNotionStatus(data.success ? "connected" : "error");
      toast({
        title: data.success ? "Notion Connected" : "Notion Connection Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: () => {
      setNotionStatus("error");
      toast({
        title: "Notion Connection Failed",
        description: "Could not connect to Notion API.",
        variant: "destructive",
      });
    },
  });

  // Mutation to import CSV data
  const importCSVMutation = useMutation({
    mutationFn: async ({ csvData, userId }: { csvData: string; userId?: number }) => {
      const response = await apiRequest("POST", "/api/webhooks/import-csv", { csvData, userId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "CSV imported",
        description: `Imported ${data.imported} webhooks successfully.${data.errors.length > 0 ? ` Errors: ${data.errors.join(', ')}` : ''}`,
        variant: data.errors.length > 0 ? "destructive" : "default",
      });
      setIsImportDialogOpen(false);
      setCsvImportData("");
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
    },
    onError: (error) => {
      toast({
        title: "Error importing CSV",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutations for background tasks
  const startTasksMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/background-tasks/start");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Background tasks started",
        description: "Background processing has been initiated.",
      });
      refetchTasksStatus();
    },
    onError: (error) => {
      toast({
        title: "Error starting background tasks",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stopTasksMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/background-tasks/stop");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Background tasks stopped",
        description: "Background processing has been stopped.",
      });
      refetchTasksStatus();
    },
    onError: (error) => {
      toast({
        title: "Error stopping background tasks",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission for creating a webhook
  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.name || !createFormData.url || !createFormData.event || !createFormData.userId) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    createWebhookMutation.mutate(createFormData as CreateWebhookData);
  };

  // Handle triggering a webhook
  const handleTriggerWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWebhook) return;
    
    let payload = null;
    try {
      // Try to parse as JSON if provided
      payload = testPayloadData ? JSON.parse(testPayloadData) : null;
    } catch (err) {
      toast({
        title: "Invalid JSON payload",
        description: "Please provide a valid JSON payload or leave empty for default test data.",
        variant: "destructive",
      });
      return;
    }
    
    triggerWebhookMutation.mutate({ id: selectedWebhook.id, payload });
  };

  // Handle toggling webhook active status
  const handleToggleActive = (webhook: Webhook) => {
    updateWebhookMutation.mutate({ 
      id: webhook.id, 
      data: { active: !webhook.active } 
    });
  };

  // Handle importing CSV data
  const handleImportCSV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvImportData) {
      toast({
        title: "Missing CSV data",
        description: "Please provide CSV data to import.",
        variant: "destructive",
      });
      return;
    }
    
    importCSVMutation.mutate({ 
      csvData: csvImportData,
      userId: selectedUserId
    });
  };

  // Handle downloading CSV template
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/webhooks/sample-csv");
      if (!response.ok) {
        throw new Error("Failed to download CSV template");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "webhook-template.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error downloading template",
        description: "Failed to download CSV template.",
        variant: "destructive",
      });
    }
  };

  // Handle downloading all webhooks as CSV
  const handleExportCSV = async () => {
    try {
      const url = selectedUserId 
        ? `/api/webhooks/export-csv?userId=${selectedUserId}` 
        : "/api/webhooks/export-csv";
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to export webhooks");
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "webhooks-export.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error exporting webhooks",
        description: "Failed to export webhooks to CSV.",
        variant: "destructive",
      });
    }
  };

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Webhook Management</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetchWebhooks()}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Create Webhook
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Xano Integration</CardTitle>
            <CardDescription>
              Connect webhooks to Xano databases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Status: {
                notionStatus === "unchecked" 
                  ? "Not checked"
                  : notionStatus === "connected"
                    ? "Connected"
                    : "Error connecting"
              }</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Test Xano connection
                  const testXanoMutation = useMutation({
                    mutationFn: async () => {
                      const response = await apiRequest("POST", "/api/xano/test-connection");
                      return response.json();
                    },
                    onSuccess: (data) => {
                      setNotionStatus(data.success ? "connected" : "error");
                      toast({
                        title: data.success ? "Xano Connected" : "Xano Connection Failed",
                        description: data.message,
                        variant: data.success ? "default" : "destructive",
                      });
                    },
                    onError: () => {
                      setNotionStatus("error");
                      toast({
                        title: "Xano Connection Failed",
                        description: "Could not connect to Xano API.",
                        variant: "destructive",
                      });
                    },
                  });
                  
                  testXanoMutation.mutate();
                }}
                disabled={testNotionMutation.isPending}
              >
                {testNotionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Test Xano Connection
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Requires XANO_API_KEY and XANO_API_BASE_URL
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notion Integration</CardTitle>
            <CardDescription>
              Connect webhooks to Notion databases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Status: {
                notionStatus === "unchecked" 
                  ? "Not checked"
                  : notionStatus === "connected"
                    ? "Connected"
                    : "Error connecting"
              }</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testNotionMutation.mutate()}
                disabled={testNotionMutation.isPending}
              >
                {testNotionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Test Connection
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Requires NOTION_API_KEY and NOTION_DATABASE_ID
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Background Processing</CardTitle>
            <CardDescription>
              Manage webhook delivery background tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Status: {backroundTasksStatus.running ? "Running" : "Stopped"}</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startTasksMutation.mutate()}
                  disabled={startTasksMutation.isPending || backroundTasksStatus.running}
                >
                  {startTasksMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Start
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => stopTasksMutation.mutate()}
                  disabled={stopTasksMutation.isPending || !backroundTasksStatus.running}
                >
                  {stopTasksMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Stop
                </Button>
              </div>
            </div>
            <div className="mt-2 text-sm">
              Active tasks: {backroundTasksStatus.taskCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import/Export</CardTitle>
            <CardDescription>
              Manage webhooks via CSV
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span>CSV Operations</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Template
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsImportDialogOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCSV}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Label htmlFor="filterByUser">Filter by User ID:</Label>
        <Input
          id="filterByUser"
          value={selectedUserId || ""}
          onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="All Users"
          className="w-24"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>
            Manage and monitor your webhook endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingWebhooks ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : webhooks && webhooks.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Triggered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook: Webhook) => (
                    <TableRow key={webhook.id} className="hover:bg-muted/50 cursor-pointer">
                      <TableCell className="font-medium" onClick={() => {
                        setSelectedWebhook(webhook);
                        setIsShowingPayloads(true);
                      }}>
                        {webhook.name}
                      </TableCell>
                      <TableCell onClick={() => {
                        setSelectedWebhook(webhook);
                        setIsShowingPayloads(true);
                      }}>
                        {webhook.event}
                      </TableCell>
                      <TableCell onClick={() => {
                        setSelectedWebhook(webhook);
                        setIsShowingPayloads(true);
                      }}>
                        <div className="truncate max-w-xs">{webhook.url}</div>
                      </TableCell>
                      <TableCell onClick={() => {
                        setSelectedWebhook(webhook);
                        setIsShowingPayloads(true);
                      }}>
                        <Badge variant={webhook.active ? "default" : "outline"}>
                          {webhook.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => {
                        setSelectedWebhook(webhook);
                        setIsShowingPayloads(true);
                      }}>
                        {formatDate(webhook.lastTriggeredAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedWebhook(webhook);
                              setIsTesting(true);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleActive(webhook)}
                          >
                            <Switch checked={webhook.active} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this webhook?")) {
                                deleteWebhookMutation.mutate(webhook.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No webhooks found</p>
              <Button
                variant="outline"
                onClick={() => setIsCreating(true)}
                className="mt-4"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create your first webhook
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create webhook dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
            <DialogDescription>
              Configure a new webhook endpoint to integrate with your services.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateWebhook}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={createFormData.name || ""}
                  onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                  className="col-span-3"
                  placeholder="Payment Processing"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event" className="text-right">
                  Event
                </Label>
                <Input
                  id="event"
                  value={createFormData.event || ""}
                  onChange={(e) => setCreateFormData({...createFormData, event: e.target.value})}
                  className="col-span-3"
                  placeholder="payment.processed"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input
                  id="url"
                  value={createFormData.url || ""}
                  onChange={(e) => setCreateFormData({...createFormData, url: e.target.value})}
                  className="col-span-3"
                  placeholder="https://example.com/webhook"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-right">
                  User ID
                </Label>
                <Input
                  id="userId"
                  type="number"
                  value={createFormData.userId || ""}
                  onChange={(e) => setCreateFormData({...createFormData, userId: parseInt(e.target.value)})}
                  className="col-span-3"
                  min="1"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Active
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="active"
                    checked={createFormData.active ?? true}
                    onCheckedChange={(checked) => setCreateFormData({...createFormData, active: checked})}
                  />
                  <Label htmlFor="active">
                    {createFormData.active ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createWebhookMutation.isPending}
              >
                {createWebhookMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Test webhook dialog */}
      <Dialog open={isTesting && !!selectedWebhook} onOpenChange={(open) => {
        if (!open) setIsTesting(false);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Webhook: {selectedWebhook?.name}</DialogTitle>
            <DialogDescription>
              Send a test payload to this webhook endpoint.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleTriggerWebhook}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="payload">
                  Custom JSON Payload (optional)
                </Label>
                <Textarea
                  id="payload"
                  value={testPayloadData}
                  onChange={(e) => setTestPayloadData(e.target.value)}
                  placeholder={'{\n  "example": "data",\n  "timestamp": "2023-04-01T12:00:00Z"\n}'}
                  className="font-mono h-40"
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to use a default test payload
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsTesting(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={triggerWebhookMutation.isPending}
              >
                {triggerWebhookMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Trigger Webhook
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payloads dialog */}
      <Dialog 
        open={isShowingPayloads && !!selectedWebhook} 
        onOpenChange={(open) => {
          if (!open) setIsShowingPayloads(false);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Webhook Details: {selectedWebhook?.name}</DialogTitle>
            <DialogDescription>
              View details and payload history for this webhook
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="payloads">Payload History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="py-4">
              {selectedWebhook && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Webhook ID</h3>
                    <p className="text-sm text-muted-foreground">{selectedWebhook.id}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">URL</h3>
                    <p className="text-sm font-mono break-all">{selectedWebhook.url}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Event</h3>
                    <p className="text-sm">{selectedWebhook.event}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium">Status</h3>
                      <p className="text-sm">
                        <Badge variant={selectedWebhook.active ? "default" : "outline"}>
                          {selectedWebhook.active ? "Active" : "Inactive"}
                        </Badge>
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium">User ID</h3>
                      <p className="text-sm">{selectedWebhook.userId}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium">Created</h3>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedWebhook.createdAt)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium">Last Updated</h3>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedWebhook.updatedAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Last Triggered</h3>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedWebhook.lastTriggeredAt)}</p>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsTesting(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Play className="h-4 w-4" />
                      Test
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(selectedWebhook)}
                      className="flex items-center gap-1"
                    >
                      <Switch checked={selectedWebhook.active} className="mr-2" />
                      {selectedWebhook.active ? "Deactivate" : "Activate"}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this webhook?")) {
                          deleteWebhookMutation.mutate(selectedWebhook.id);
                          setIsShowingPayloads(false);
                        }
                      }}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="payloads" className="py-4">
              {isLoadingPayloads ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : payloads && payloads.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead>Retries</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payloads.map((payload: WebhookPayload) => (
                        <TableRow key={payload.id}>
                          <TableCell className="font-mono text-xs">{payload.id.substring(0, 8)}...</TableCell>
                          <TableCell>{formatDate(payload.timestamp)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              payload.deliveryStatus === "SUCCESS" ? "default" :
                              payload.deliveryStatus === "PENDING" ? "outline" :
                              "destructive"
                            }>
                              {payload.deliveryStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payload.responseCode ? `${payload.responseCode}` : "N/A"}
                          </TableCell>
                          <TableCell>
                            {payload.retryCount || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No payload history found</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsTesting(true);
                    }}
                    className="mt-4"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Trigger this webhook
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* CSV Import dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Webhooks from CSV</DialogTitle>
            <DialogDescription>
              Paste CSV data to bulk import webhook configurations.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleImportCSV}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="csvData">
                  CSV Data
                </Label>
                <Textarea
                  id="csvData"
                  value={csvImportData}
                  onChange={(e) => setCsvImportData(e.target.value)}
                  placeholder="id,name,url,event,userId,active,createdAt,updatedAt,lastTriggeredAt"
                  className="font-mono h-40"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="importUserId" className="text-right">
                  Default User ID
                </Label>
                <Input
                  id="importUserId"
                  type="number"
                  value={selectedUserId || ""}
                  onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="col-span-3"
                  placeholder="1"
                />
                <div className="col-span-4 text-xs text-muted-foreground">
                  If not specified in CSV, this user ID will be used
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline" 
                onClick={handleDownloadTemplate}
              >
                Download Template
              </Button>
              <Button 
                type="submit"
                disabled={importCSVMutation.isPending}
              >
                {importCSVMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Import
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}