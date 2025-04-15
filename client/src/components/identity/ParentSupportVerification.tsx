import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  X,
  Heart,
  Receipt,
  FileImage,
  RefreshCcw,
  CalendarDays,
  Baby
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ParentSupportVerificationProps {
  userId: number;
}

interface PaymentRecord {
  id: string;
  type: 'child_support' | 'gift' | 'education' | 'healthcare' | 'other';
  amount: number;
  date: string;
  recipient: string;
  description: string;
  status: 'verified' | 'pending' | 'rejected';
  hasReceipt: boolean;
  receiptUrls?: string[];
  taxReported: boolean;
  notes?: string;
}

export function ParentSupportVerification({ userId }: ParentSupportVerificationProps) {
  const [activeTab, setActiveTab] = useState("records");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear().toString());
  const { toast } = useToast();
  
  // Form state
  const [paymentType, setPaymentType] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isTaxReported, setIsTaxReported] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Sample data - in a real app, this would come from an API using Xano
  const paymentRecords: PaymentRecord[] = [
    {
      id: "pay1",
      type: "child_support",
      amount: 750,
      date: "2023-04-15",
      recipient: "Sarah Johnson",
      description: "Monthly child support payment for April",
      status: "verified",
      hasReceipt: true,
      receiptUrls: ["receipt-123.jpg"],
      taxReported: true,
      notes: "Paid via bank transfer, confirmation #12345"
    },
    {
      id: "pay2",
      type: "education",
      amount: 2000,
      date: "2023-03-01",
      recipient: "ABC University",
      description: "Spring semester tuition assistance",
      status: "verified",
      hasReceipt: true,
      receiptUrls: ["tuition-receipt.pdf"],
      taxReported: true
    },
    {
      id: "pay3",
      type: "healthcare",
      amount: 350,
      date: "2023-05-10",
      recipient: "Family Health Clinic",
      description: "Medical expenses for child's treatment",
      status: "pending",
      hasReceipt: true,
      receiptUrls: ["medical-bill.jpg", "insurance-claim.pdf"],
      taxReported: false,
      notes: "Insurance reimbursement pending"
    }
  ];
  
  // Group records by year
  const recordsByYear: Record<string, PaymentRecord[]> = {};
  paymentRecords.forEach(record => {
    const year = record.date.split('-')[0];
    if (!recordsByYear[year]) {
      recordsByYear[year] = [];
    }
    recordsByYear[year].push(record);
  });
  
  // Calculate annual totals
  const annualTotals: Record<string, number> = {};
  Object.keys(recordsByYear).forEach(year => {
    annualTotals[year] = recordsByYear[year].reduce((sum, record) => sum + record.amount, 0);
  });
  
  // Calculate verification status percentages
  const verificationStats = {
    verified: paymentRecords.filter(r => r.status === 'verified').length,
    pending: paymentRecords.filter(r => r.status === 'pending').length,
    rejected: paymentRecords.filter(r => r.status === 'rejected').length,
    total: paymentRecords.length
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "verified":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Verified
        </Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending
        </Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <X className="h-3 w-3" /> Rejected
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'child_support':
        return <Baby className="h-4 w-4" />;
      case 'gift':
        return <Heart className="h-4 w-4" />;
      case 'education':
        return <FileText className="h-4 w-4" />;
      case 'healthcare':
        return <Heart className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };
  
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', `/api/users/${userId}/parent-support/upload`, formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "Your payment record has been submitted for verification.",
        variant: "default",
      });
      resetForm();
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your payment record. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentType || !paymentAmount || !paymentDate || !recipientName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would upload the data to the server
    const formData = new FormData();
    formData.append('type', paymentType);
    formData.append('amount', paymentAmount);
    formData.append('date', paymentDate);
    formData.append('recipient', recipientName);
    formData.append('description', paymentDescription);
    formData.append('taxReported', isTaxReported.toString());
    formData.append('notes', additionalNotes);
    
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('receipts', selectedFiles[i]);
      }
    }
    
    // uploadMutation.mutate(formData);
    
    // For demo purposes, just show success and reset
    toast({
      title: "Upload Successful",
      description: "Your payment record has been submitted for verification.",
      variant: "default",
    });
    resetForm();
  };
  
  const resetForm = () => {
    setPaymentType('');
    setPaymentAmount('');
    setPaymentDate('');
    setRecipientName('');
    setPaymentDescription('');
    setSelectedFiles(null);
    setIsTaxReported(false);
    setAdditionalNotes('');
    setShowUploadForm(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-600" />
              Parent Support Verification
            </CardTitle>
            <CardDescription>
              Document and verify your child support and financial assistance history.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Xano Verified
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-700">Why This Matters</p>
            <p className="text-xs text-blue-700">
              Documenting your child support and financial assistance helps prove your parental responsibility 
              and protects you from false claims. Tax-related issues, child support disputes, and proof of financial 
              responsibility are all critical for maintaining your reputation and legal standing.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="records" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="records">Payment Records</TabsTrigger>
            <TabsTrigger value="summary">Annual Summary</TabsTrigger>
            <TabsTrigger value="tax">Tax Information</TabsTrigger>
          </TabsList>
          
          <TabsContent value="records">
            <div className="space-y-4">
              {!showUploadForm ? (
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Payment Records</h3>
                    <p className="text-sm text-muted-foreground">
                      Your verified payment history and documentation
                    </p>
                  </div>
                  <Button onClick={() => setShowUploadForm(true)}>
                    <Upload className="h-4 w-4 mr-2" /> Add New Record
                  </Button>
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">New Payment Record</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowUploadForm(false)}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="payment-type">Payment Type <span className="text-red-500">*</span></Label>
                        <Select value={paymentType} onValueChange={setPaymentType}>
                          <SelectTrigger id="payment-type">
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="child_support">Child Support</SelectItem>
                            <SelectItem value="gift">Gift to Child</SelectItem>
                            <SelectItem value="education">Education Expenses</SelectItem>
                            <SelectItem value="healthcare">Healthcare Expenses</SelectItem>
                            <SelectItem value="other">Other Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="payment-amount">Amount ($) <span className="text-red-500">*</span></Label>
                        <Input 
                          id="payment-amount" 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="0.00" 
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="payment-date">Date of Payment <span className="text-red-500">*</span></Label>
                        <Input 
                          id="payment-date" 
                          type="date" 
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="recipient-name">Recipient <span className="text-red-500">*</span></Label>
                        <Input 
                          id="recipient-name" 
                          placeholder="Recipient name or organization" 
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment-description">Description</Label>
                      <Textarea 
                        id="payment-description" 
                        placeholder="Brief description of the payment" 
                        value={paymentDescription}
                        onChange={(e) => setPaymentDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receipt-upload">Receipt or Proof of Payment</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          id="receipt-upload"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <label htmlFor="receipt-upload" className="cursor-pointer">
                          <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            Drag and drop files or 
                            <span className="text-primary font-medium ml-1">browse files</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Upload receipts, bank statements, or other proof of payment
                          </p>
                        </label>
                        {selectedFiles && selectedFiles.length > 0 && (
                          <div className="mt-3 text-left">
                            <p className="text-xs font-medium text-gray-700 mb-1">Selected Files:</p>
                            <ul className="space-y-1">
                              {Array.from(selectedFiles).map((file, i) => (
                                <li key={i} className="text-xs text-gray-600 flex items-center">
                                  <FileImage className="h-3 w-3 mr-1 text-gray-500" />
                                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="tax-reported"
                        checked={isTaxReported}
                        onChange={(e) => setIsTaxReported(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="tax-reported" className="text-sm">
                        I have reported this payment on my tax return (if applicable)
                      </Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="additional-notes">Additional Notes</Label>
                      <Textarea 
                        id="additional-notes" 
                        placeholder="Any additional information about this payment" 
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                      />
                    </div>
                    
                    <div className="pt-2 flex gap-2">
                      <Button type="submit" className="flex-1">
                        <Upload className="h-4 w-4 mr-2" /> Submit Record
                      </Button>
                      <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                        <X className="h-4 w-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              
              {!showUploadForm && Object.keys(recordsByYear).length > 0 ? (
                <div className="space-y-6">
                  {/* Filter by year */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="year-filter" className="whitespace-nowrap">Filter by Year:</Label>
                    <Select value={currentYear} onValueChange={setCurrentYear}>
                      <SelectTrigger id="year-filter" className="w-40">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(recordsByYear).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Records for selected year */}
                  {recordsByYear[currentYear] ? (
                    <div className="space-y-4">
                      {recordsByYear[currentYear].map(record => (
                        <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                {getTypeIcon(record.type)}
                              </div>
                              <div>
                                <h4 className="font-medium">{record.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
                                <p className="text-sm text-muted-foreground">{record.recipient}</p>
                              </div>
                            </div>
                            {getStatusBadge(record.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="ml-2 font-medium">${record.amount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <span className="ml-2">{new Date(record.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm mb-3">{record.description}</p>
                          
                          {record.hasReceipt && (
                            <div className="flex items-center mt-1 mb-3">
                              <Receipt className="h-3.5 w-3.5 text-green-600 mr-1.5" />
                              <span className="text-xs text-green-600">Receipt verified</span>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <FileText className="h-3 w-3 mr-1" /> View Details
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Upload className="h-3 w-3 mr-1" /> Add Documentation
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No payment records found for {currentYear}.
                    </div>
                  )}
                </div>
              ) : (
                !showUploadForm && (
                  <div className="text-center py-8 text-muted-foreground">
                    You have not added any payment records yet.
                  </div>
                )
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="summary">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Annual Payment Summary</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium">Verification Status</span>
                      <span className="text-sm">{verificationStats.verified} of {verificationStats.total} verified</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${(verificationStats.verified / verificationStats.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Verified: {verificationStats.verified}</span>
                      <span>Pending: {verificationStats.pending}</span>
                      <span>Rejected: {verificationStats.rejected}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    {Object.keys(annualTotals).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
                      <div key={year} className="border rounded-lg p-3 bg-white">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <CalendarDays className="h-4 w-4 text-indigo-600 mr-2" />
                            <span className="font-medium">{year}</span>
                          </div>
                          <span className="font-semibold text-lg">${annualTotals[year].toLocaleString()}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-1 mt-2">
                          {Object.entries(
                            recordsByYear[year].reduce<Record<string, number>>((acc, record) => {
                              if (!acc[record.type]) acc[record.type] = 0;
                              acc[record.type] += record.amount;
                              return acc;
                            }, {})
                          ).map(([type, amount]) => (
                            <div key={type} className="flex justify-between items-center text-sm">
                              <div className="flex items-center">
                                {getTypeIcon(type)}
                                <span className="ml-1.5">{type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                              </div>
                              <span>${amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Payment Trends</h3>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Payment history visualization chart would be shown here
                  </p>
                  <Button variant="outline" size="sm">
                    <RefreshCcw className="h-3 w-3 mr-1" /> Generate Report
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tax">
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-amber-800 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Tax Information Disclaimer
                </h3>
                <p className="text-sm text-amber-700">
                  This information is provided for reference only and does not constitute tax advice. 
                  Please consult with a tax professional regarding your specific situation.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Child Support Tax Status</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Child support payments are typically <strong>not tax-deductible</strong> for the payer.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Child support payments are typically <strong>not taxable income</strong> for the recipient.</span>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>However, it's important to keep detailed records of all payments for legal purposes.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Documentation Needed</h4>
                  <p className="text-sm mb-2">For proper verification and tax records, maintain copies of:</p>
                  <ul className="space-y-1 text-sm pl-5 list-disc">
                    <li>Cancelled checks or bank statements showing payments</li>
                    <li>Receipts for tuition, medical expenses, or other child-related costs</li>
                    <li>Court orders or legal agreements specifying payment amounts</li>
                    <li>Records of communication regarding payments</li>
                    <li>Tax returns where payments were reported (if applicable)</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Tax Deductible Support Categories</h4>
                  <p className="text-sm mb-2">While child support itself is not tax-deductible, some related expenses might be:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-medium mb-1">Medical Expenses</h5>
                      <p className="text-xs text-muted-foreground">
                        May be deductible if they exceed 7.5% of your adjusted gross income
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-medium mb-1">Dependent Care Credit</h5>
                      <p className="text-xs text-muted-foreground">
                        For qualifying childcare expenses while you work
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-medium mb-1">Education Credits</h5>
                      <p className="text-xs text-muted-foreground">
                        American Opportunity or Lifetime Learning credits for qualified education expenses
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-medium mb-1">Child Tax Credit</h5>
                      <p className="text-xs text-muted-foreground">
                        May be available if you claim the child as a dependent
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4">
                <FileText className="h-4 w-4 mr-2" /> Generate Tax Documentation Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex justify-between">
        <p className="text-xs text-muted-foreground">
          Records verified using Xano secure document processing
        </p>
        <div className="flex items-center gap-1">
          <Receipt className="h-3 w-3 text-indigo-600" />
          <span className="text-xs font-medium">
            Total Records: {paymentRecords.length}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}