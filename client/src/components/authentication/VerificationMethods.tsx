import { useQuery } from "@tanstack/react-query";
import { CreditCard, FileCheck, Receipt, Phone, ArrowRight } from "lucide-react";
import { VerificationMethod } from "@/lib/types";
import { VerificationType } from "@shared/schema";

interface VerificationMethodsProps {
  userId: number;
}

interface VerificationStatus {
  verifiedMethods: VerificationType[];
  pendingMethods: VerificationType[];
  rejectedMethods: VerificationType[];
}

interface VerificationResponse {
  verifications: any[];
  status: VerificationStatus;
}

export default function VerificationMethods({ userId }: VerificationMethodsProps) {
  const { data: verificationData, isLoading } = useQuery<VerificationResponse>({
    queryKey: [`/api/users/${userId}/verifications`],
  });

  const verificationMethods: VerificationMethod[] = [
    {
      type: "PREPAID_CARD",
      title: "Prepaid Card",
      description: "Verify using any prepaid card with minimal authorization hold. No large deposits required.",
      icon: "credit-card"
    },
    {
      type: "GOVERNMENT_ID",
      title: "Government ID",
      description: "Upload a government-issued ID for verification. Multiple ID types accepted.",
      icon: "file-check"
    },
    {
      type: "UTILITY_BILL",
      title: "Utility Bill",
      description: "Upload a recent utility bill with your name and address for verification.",
      icon: "receipt"
    },
    {
      type: "PHONE_NUMBER",
      title: "Phone Number",
      description: "Verify with your phone number. Works with both prepaid and contract phones.",
      icon: "phone"
    }
  ];

  const getVerificationStatus = (type: VerificationType): "verified" | "pending" | "rejected" | "none" => {
    if (!verificationData) return "none";
    
    if (verificationData.status.verifiedMethods.includes(type)) {
      return "verified";
    }
    if (verificationData.status.pendingMethods.includes(type)) {
      return "pending";
    }
    if (verificationData.status.rejectedMethods.includes(type)) {
      return "rejected";
    }
    return "none";
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "credit-card":
        return <CreditCard className="h-5 w-5 text-primary" />;
      case "file-check":
        return <FileCheck className="h-5 w-5 text-primary" />;
      case "receipt":
        return <Receipt className="h-5 w-5 text-primary" />;
      case "phone":
        return <Phone className="h-5 w-5 text-primary" />;
      default:
        return <CreditCard className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {verificationMethods.map((method) => {
        const status = getVerificationStatus(method.type);
        
        return (
          <div 
            key={method.type}
            className={`
              bg-card p-6 rounded-lg shadow-sm hover:shadow-md cursor-pointer 
              border-2 transition-all duration-300 hover:-translate-y-1
              ${status === "verified" ? "border-primary/50" : "border-transparent hover:border-primary/30"}
            `}
          >
            <div className="flex items-center mb-4">
              {getIcon(method.icon)}
              <h4 className="font-medium ml-2">{method.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {method.description}
            </p>
            
            {status === "verified" ? (
              <div className="flex items-center text-sm text-primary">
                <span>Verified</span>
                <FileCheck className="h-4 w-4 ml-1" />
              </div>
            ) : status === "pending" ? (
              <div className="flex items-center text-sm text-amber-500">
                <span>Pending verification</span>
              </div>
            ) : status === "rejected" ? (
              <div className="flex items-center text-sm text-destructive">
                <span>Verification failed</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-primary">
                <span>Select method</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
