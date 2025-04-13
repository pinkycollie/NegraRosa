import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, RefreshCw, Play, Square } from "lucide-react";

const testWebhookSchema = z.object({
  webhookId: z.string().min(1, { message: "Webhook ID is required" }),
  event: z.string().min(1, { message: "Event is required" }),
  data: z.string().min(1, { message: "Data is required" }),
});

type TestWebhookFormValues = z.infer<typeof testWebhookSchema>;

export default function WebhookManagement() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [webhookLoading, setWebhookLoading] = useState(false);
  
  const form = useForm<TestWebhookFormValues>({
    resolver: zodResolver(testWebhookSchema),
    defaultValues: {
      webhookId: "",
      event: "",
      data: JSON.stringify({ 
        userId: 1,
        action: "verification_completed",
        success: true,
        details: {
          verificationType: "BANK_ACCOUNT",
          timestamp: new Date().toISOString()
        }
      }, null, 2)
    }
  });
  
  const fetchTaskStatus = async () => {
    setTaskLoading(true);
    try {
      const response = await fetch('/api/background-tasks/status');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching task status:', error);
      toast({
        title: "Failed to fetch task status",
        description: "Check the console for more details",
        variant: "destructive"
      });
    } finally {
      setTaskLoading(false);
    }
  };
  
  const fetchWebhooks = async () => {
    setWebhookLoading(true);
    try {
      const response = await fetch('/api/webhooks');
      const data = await response.json();
      setWebhooks(data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      toast({
        title: "Failed to fetch webhooks",
        description: "Check the console for more details",
        variant: "destructive"
      });
    } finally {
      setWebhookLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTaskStatus();
    fetchWebhooks();
  }, []);
  
  const startTasks = async () => {
    try {
      const response = await fetch('/api/background-tasks/start', {
        method: 'POST',
      });
      const data = await response.json();
      setTasks(data.status);
      toast({
        title: "Background tasks started",
        description: "Tasks are now running"
      });
    } catch (error) {
      console.error('Error starting tasks:', error);
      toast({
        title: "Failed to start tasks",
        description: "Check the console for more details",
        variant: "destructive"
      });
    }
  };
  
  const stopTasks = async () => {
    try {
      const response = await fetch('/api/background-tasks/stop', {
        method: 'POST',
      });
      const data = await response.json();
      setTasks(data.status);
      toast({
        title: "Background tasks stopped",
        description: "Tasks have been stopped"
      });
    } catch (error) {
      console.error('Error stopping tasks:', error);
      toast({
        title: "Failed to stop tasks",
        description: "Check the console for more details",
        variant: "destructive"
      });
    }
  };

  async function onSubmit(values: TestWebhookFormValues) {
    setLoading(true);
    
    try {
      // Parse the JSON data string into an object
      const jsonData = JSON.parse(values.data);
      
      const payload = {
        webhookId: values.webhookId,
        event: values.event,
        data: jsonData
      };
      
      const response = await apiRequest('POST', '/api/webhooks/test-process', payload);
      const result = await response.json();
      
      toast({
        title: "Webhook processed successfully",
        description: "Check the console for details"
      });
      
      console.log("Webhook processing result:", result);
      
      // Refresh task status
      fetchTaskStatus();
    } catch (error) {
      console.error("Error processing webhook:", error);
      toast({
        title: "Failed to process webhook",
        description: "Check the console for more details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }
  
  const createSampleWebhook = async () => {
    setWebhookLoading(true);
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "Sample Webhook " + new Date().toISOString().substring(0, 10),
          url: "https://webhook.site/your-webhook-id",
          event: "verification_completed",
          userId: 1,
          active: true
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Sample webhook created",
          description: `Webhook ID: ${result.id}`
        });
        
        // Update form with the new webhook ID
        form.setValue('webhookId', result.id);
        
        // Refresh webhooks list
        fetchWebhooks();
      } else {
        toast({
          title: "Failed to create webhook",
          description: result.message || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast({
        title: "Failed to create webhook",
        description: "Check the console for more details",
        variant: "destructive"
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Webhook Management System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Webhook Processing</CardTitle>
            <CardDescription>
              Process a sample webhook to test the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex gap-4 items-center mb-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={createSampleWebhook}
                    disabled={webhookLoading}
                  >
                    {webhookLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Sample Webhook
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={fetchWebhooks}
                    disabled={webhookLoading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${webhookLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name="webhookId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook ID</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a webhook" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {webhooks.map(webhook => (
                            <SelectItem key={webhook.id} value={webhook.id}>
                              {webhook.name} ({webhook.event})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select an existing webhook or create a new one
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="event"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event</FormLabel>
                      <FormControl>
                        <Input placeholder="verification_completed" {...field} />
                      </FormControl>
                      <FormDescription>
                        The type of event this webhook represents
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="{}"
                          className="font-mono h-48"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The JSON payload to send with the webhook
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Process Webhook
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Background Tasks</CardTitle>
            <CardDescription>
              Manage webhook background tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button onClick={startTasks} disabled={tasks?.running}>
                <Play className="mr-2 h-4 w-4" />
                Start Tasks
              </Button>
              <Button onClick={stopTasks} variant="outline" disabled={!tasks?.running}>
                <Square className="mr-2 h-4 w-4" />
                Stop Tasks
              </Button>
              <Button onClick={fetchTaskStatus} variant="ghost" disabled={taskLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${taskLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {tasks ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-base">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${tasks.running ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>{tasks.running ? 'Running' : 'Stopped'}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-base">Active Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-xl font-bold">{tasks.activeTasks}</span>
                    </CardContent>
                  </Card>
                </div>
                
                <Table>
                  <TableCaption>Task configuration</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Setting</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Processing Interval</TableCell>
                      <TableCell>{tasks.processingInterval / 1000}s</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Export Interval</TableCell>
                      <TableCell>{tasks.exportInterval / 1000 / 60}m</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Retry Limit</TableCell>
                      <TableCell>{tasks.retryLimit}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Last Processed</TableCell>
                      <TableCell>{tasks.lastProcessed ? new Date(tasks.lastProcessed).toLocaleString() : 'Never'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin opacity-50" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}