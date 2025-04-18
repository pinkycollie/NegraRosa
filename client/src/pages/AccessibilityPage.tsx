import MainframeLayout from "@/components/MainframeLayout";
import AccessibilityDemo from "@/components/accessibility/AccessibilityDemo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Eye, HelpCircle, Mic, MicOff, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AccessibilityPage() {
  return (
    <MainframeLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center">
              <Volume2 className="h-7 w-7 text-purple-400 mr-2" />
              Accessibility Voice Guidance
            </h1>
            <p className="text-gray-400">
              Making security features accessible for all users
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-purple-800 bg-black/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Mic className="h-5 w-5 text-purple-400 mr-2" />
                Voice Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Audio explanations of security features to assist users who prefer hearing instructions.
              </p>
              <Badge variant="outline" className="mt-4 text-green-400 border-green-800">
                Available
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-purple-800 bg-black/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Eye className="h-5 w-5 text-purple-400 mr-2" />
                Visual Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Step-by-step visual guides for security features, designed for deaf users and those who prefer visual learning.
              </p>
              <Badge variant="outline" className="mt-4 text-green-400 border-green-800">
                Available
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-purple-800 bg-black/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MicOff className="h-5 w-5 text-purple-400 mr-2" />
                Deaf-First Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Special mode that prioritizes visual explanations over audio, with enhanced visual details for deaf users.
              </p>
              <Badge variant="outline" className="mt-4 text-green-400 border-green-800">
                Available
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="border-purple-800 bg-black/60 mb-6">
          <CardHeader>
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <CardTitle className="text-lg">Why Accessibility Matters in Security</CardTitle>
                <CardDescription className="mt-2">
                  Security features must be accessible to all users, including those with disabilities. 
                  The NegraRosa Security Framework prioritizes deaf users by offering both visual and auditory guidance.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-300">
              <p>
                <strong className="text-white">Voice Guidance</strong> - Provides clear audio explanations for users who prefer listening to instructions.
                This helps users with visual impairments or those who struggle with reading complex security concepts.
              </p>
              <p>
                <strong className="text-white">Visual Guidance</strong> - Offers step-by-step visual instructions for deaf users or those who prefer visual learning.
                The system uses simplified visual explanations that avoid complicated jargon.
              </p>
              <p>
                <strong className="text-white">Deaf-First Mode</strong> - Adapts the interface to prioritize visual information, 
                with enhanced visual descriptions generated specifically for deaf users.
              </p>
            </div>
          </CardContent>
        </Card>

        <AccessibilityDemo />
      </div>
    </MainframeLayout>
  );
}