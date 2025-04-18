import { useState } from 'react';
import { Shield, QrCode, UserCircle, Users, FileCheck, BadgeHelp, AlertCircle } from 'lucide-react';
import SmoothScrollLink from '@/components/SmoothScrollLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const IndividualIdPage = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                New Service • Individual & Family
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                I AM WHO I AM <span className="text-purple-600">NFT Identity System</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Secure, accessible identity verification for deaf individuals and families. Instant authentication in critical situations, from law enforcement encounters to benefits verification.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Apply for Digital ID
                </Button>
                <Button size="lg" variant="outline">
                  <QrCode className="mr-2 h-4 w-4" />
                  See Demo
                </Button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border-4 border-purple-200 shadow-xl bg-white p-8">
              <div className="aspect-video bg-gray-100 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4/5 max-w-[300px] bg-white rounded-xl overflow-hidden shadow-lg border-2 border-purple-300">
                    <div className="bg-gradient-to-r from-purple-700 to-purple-900 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">NegraRosa Identity NFT</span>
                        <div className="flex items-center">
                          <Shield size={16} className="text-white mr-1" />
                          <span className="text-xs text-white">Verified</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start">
                        <div className="w-20 h-20 rounded-full bg-purple-200 flex items-center justify-center border-2 border-purple-300">
                          <UserCircle size={40} className="text-purple-700" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-bold">Sarah Johnson</h3>
                          <p className="text-xs text-gray-600">ID: NG-7814-2025</p>
                          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1 inline-block">
                            Deaf - ASL Preferred
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 border-t pt-4">
                        <div className="flex justify-center">
                          <div className="bg-gray-100 p-2 rounded">
                            <QrCode size={100} className="text-gray-800" />
                          </div>
                        </div>
                        <div className="text-center mt-2 text-xs text-gray-500">
                          Scan to verify identity
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-white border-b border-border" id="key-features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our digital ID system offers specialized features designed specifically for deaf individuals and families
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-purple-100">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <QrCode className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>NFT-Based Authentication</CardTitle>
                <CardDescription>
                  Blockchain-secured identity credentials that can't be forged or altered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Your digital ID is secured by the same technology that powers cryptocurrencies, making it virtually impossible to counterfeit. Each ID contains a unique cryptographic signature that proves authenticity.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Learn More</Button>
              </CardFooter>
            </Card>

            <Card className="border-2 border-purple-100">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Emergency Identification</CardTitle>
                <CardDescription>
                  Quick access to critical information during emergencies or law enforcement encounters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  When pulled over or in emergency situations, your ID immediately displays deaf status, communication preferences, and emergency contacts. The Quick Access feature requires no internet connection.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Learn More</Button>
              </CardFooter>
            </Card>

            <Card className="border-2 border-purple-100">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <FileCheck className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Benefits Verification</CardTitle>
                <CardDescription>
                  FibonroseTRUST event sequences track employment and benefit eligibility history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Seamlessly verify employment status and benefits eligibility with secure timestamped records. Perfect for SSI benefit verification when employment status changes.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Learn More</Button>
              </CardFooter>
            </Card>

            <Card className="border-2 border-purple-100">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Family Management</CardTitle>
                <CardDescription>
                  Connect family members' IDs with appropriate permission levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Link children's IDs to parents/guardians for emergency situations. Customizable permission system ensures privacy while providing necessary access for caregivers.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Learn More</Button>
              </CardFooter>
            </Card>
            
            <Card className="border-2 border-purple-100">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <BadgeHelp className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Municipal Integration</CardTitle>
                <CardDescription>
                  Partnership with local authorities for seamless accommodation and support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  We work with cities and local agencies to ensure your ID is recognized during interactions with public services. Integrated systems provide immediate accessibility information.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Learn More</Button>
              </CardFooter>
            </Card>
            
            <Card className="border-2 border-purple-100">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Privacy Control</CardTitle>
                <CardDescription>
                  You decide what information is shared in different contexts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Set custom privacy levels for different situations. Your ID can reveal specific information to law enforcement while showing different data to healthcare providers.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Learn More</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-16 bg-gray-50" id="demo">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">See How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore interactive demos of our NFT Identity System
            </p>
          </div>

          <Tabs defaultValue="law-enforcement" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="law-enforcement">Law Enforcement</TabsTrigger>
              <TabsTrigger value="benefits">Benefits Verification</TabsTrigger>
              <TabsTrigger value="family">Family Management</TabsTrigger>
            </TabsList>
            <div className="mt-8 border-2 border-purple-100 rounded-xl overflow-hidden">
              <TabsContent value="law-enforcement" className="p-0 m-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="bg-white p-6 md:p-8">
                    <h3 className="text-xl font-bold mb-4">Traffic Stop Scenario</h3>
                    <p className="text-gray-600 mb-6">
                      When pulled over, your digital ID instantly communicates your deaf status and preferred communication method to law enforcement.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                          <span className="font-medium text-purple-700">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Quick Display Mode</h4>
                          <p className="text-sm text-gray-500">Show your ID in emergency mode with one tap - works offline</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                          <span className="font-medium text-purple-700">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Officer Scans QR Code</h4>
                          <p className="text-sm text-gray-500">QR links to verified profile with disability status and communication needs</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                          <span className="font-medium text-purple-700">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Communication Protocol Activated</h4>
                          <p className="text-sm text-gray-500">Officer's system suggests visual communication methods</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <Button>Try Interactive Demo</Button>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8 text-white flex items-center justify-center">
                    <div className="max-w-xs mx-auto">
                      <div className="aspect-[9/16] bg-black rounded-2xl border-8 border-gray-700 p-3 shadow-lg">
                        <div className="h-full w-full bg-gray-900 rounded-lg flex flex-col">
                          <div className="bg-red-600 p-3 text-center font-bold">
                            EMERGENCY ID
                          </div>
                          <div className="p-4 flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
                              <UserCircle size={40} className="text-gray-400" />
                            </div>
                            <h4 className="text-lg font-bold">Sarah Johnson</h4>
                            <p className="text-sm text-gray-300 mb-4">ID: NG-7814-2025</p>
                            <div className="bg-red-100 text-red-800 py-2 px-4 rounded-full font-medium mb-3">
                              DEAF - ASL PREFERRED
                            </div>
                            <div className="text-xs text-gray-400 mb-4">
                              Please use visual communication
                            </div>
                            <div className="border border-gray-700 bg-gray-800 p-3 rounded mb-2 w-full">
                              <div className="text-xs text-gray-400 mb-1">Emergency Contact:</div>
                              <div className="font-medium">Michael Johnson</div>
                              <div className="text-sm">(555) 123-4567</div>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-800 border-t border-gray-700 flex justify-between">
                            <Button size="sm" variant="outline" className="text-xs border-gray-600">
                              Verify ID
                            </Button>
                            <Button size="sm" className="text-xs bg-red-600 hover:bg-red-700">
                              Request Interpreter
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="benefits" className="p-0 m-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="bg-white p-6 md:p-8">
                    <h3 className="text-xl font-bold mb-4">SSI Benefits Verification</h3>
                    <p className="text-gray-600 mb-6">
                      FibonroseTRUST technology creates a verified, immutable record of employment status changes that affect benefits eligibility.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                          <span className="font-medium text-purple-700">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Employment Status Tracking</h4>
                          <p className="text-sm text-gray-500">Securely record employment changes with verified timestamps</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                          <span className="font-medium text-purple-700">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Benefits Status Updates</h4>
                          <p className="text-sm text-gray-500">System automatically flags eligibility changes based on employment</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                          <span className="font-medium text-purple-700">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Verification Portal</h4>
                          <p className="text-sm text-gray-500">Benefits agencies can verify your status changes through secure portal</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <Button>Try Interactive Demo</Button>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-800 to-purple-900 p-6 md:p-8 text-white flex items-center justify-center">
                    <div className="w-full max-w-md">
                      <div className="bg-white rounded-lg shadow-lg text-gray-800 p-4">
                        <div className="border-b pb-2 mb-4">
                          <h3 className="font-bold text-lg text-purple-800">FibonroseTRUST Benefits Verification</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="border border-gray-200 rounded p-4">
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">Employment Status</div>
                              <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Unemployed</div>
                            </div>
                            <div className="text-sm text-gray-500">Status changed: March 15, 2025</div>
                            <div className="text-xs text-gray-400">Verified by: NegraRosa Security Protocol</div>
                          </div>
                          
                          <div className="border border-gray-200 rounded p-4">
                            <div className="font-medium mb-2">Benefits Status Timeline</div>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <div className="text-sm">
                                  <span className="font-medium">SSI Active</span> - Current
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                                <div className="text-sm">
                                  <span className="font-medium">SSI Suspended</span> - Jan 10, 2025
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <div className="text-sm">
                                  <span className="font-medium">SSI Active</span> - Oct 5, 2024
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-center">
                            <div className="bg-gray-100 p-2 rounded">
                              <QrCode size={80} className="text-gray-800" />
                              <div className="text-xs text-center mt-1">Scan to verify full history</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="family" className="p-0 m-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="bg-white p-6 md:p-8">
                    <h3 className="text-xl font-bold mb-4">Family Management System</h3>
                    <p className="text-gray-600 mb-6">
                      Connect family members' digital IDs with customizable permission levels to ensure safety and accessibility.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                          <span className="font-medium text-purple-700">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Link Family Members</h4>
                          <p className="text-sm text-gray-500">Connect children and dependent family members to your account</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                          <span className="font-medium text-purple-700">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Permission Management</h4>
                          <p className="text-sm text-gray-500">Set what information can be accessed and by whom</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                          <span className="font-medium text-purple-700">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Emergency Access</h4>
                          <p className="text-sm text-gray-500">Ensure critical info is available when children are separated from parents</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <Button>Try Interactive Demo</Button>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-6 md:p-8 text-white flex items-center justify-center">
                    <div className="w-full max-w-md">
                      <div className="bg-white rounded-lg shadow-lg text-gray-800 p-4">
                        <div className="border-b pb-2 mb-4">
                          <h3 className="font-bold text-lg text-blue-800">Family ID Management</h3>
                        </div>
                        <div className="mb-4">
                          <div className="font-medium mb-2">Primary Account</div>
                          <div className="flex items-center p-3 border rounded">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <UserCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">Sarah Johnson</div>
                              <div className="text-xs text-gray-500">Account owner</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="font-medium mb-2">Connected Family Members</div>
                          <div className="space-y-2">
                            <div className="flex items-center p-3 border rounded">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <UserCircle className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">Emma Johnson</div>
                                <div className="text-xs text-gray-500">Child - Age 10</div>
                              </div>
                              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                Full Access
                              </div>
                            </div>
                            
                            <div className="flex items-center p-3 border rounded">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <UserCircle className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">Michael Johnson</div>
                                <div className="text-xs text-gray-500">Spouse</div>
                              </div>
                              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                Co-Manager
                              </div>
                            </div>
                            
                            <div className="flex items-center p-3 border rounded">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <UserCircle className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">Robert Wilson</div>
                                <div className="text-xs text-gray-500">Grandfather</div>
                              </div>
                              <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                Limited Access
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* How To Apply */}
      <section className="py-16 bg-white" id="apply">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How To Apply</h2>
              <p className="text-lg text-gray-600">
                Getting your NegraRosa NFT Identity is simple and secure
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-16 h-16 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                  <span className="text-2xl font-bold text-purple-700">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Verify Your Identity</h3>
                  <p className="text-gray-600">
                    Complete our secure identity verification process with government-issued ID and proof of address. For deaf applicants, we offer video verification in ASL.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-16 h-16 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                  <span className="text-2xl font-bold text-purple-700">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Customize Your Digital ID</h3>
                  <p className="text-gray-600">
                    Set your communication preferences, emergency contacts, and specify what information should be displayed in different scenarios.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-16 h-16 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                  <span className="text-2xl font-bold text-purple-700">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Receive Your NFT ID</h3>
                  <p className="text-gray-600">
                    Your digital ID will be minted as an NFT and delivered to your secure NegraRosa wallet. Install our mobile app to have your ID always available.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-16 h-16 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                  <span className="text-2xl font-bold text-purple-700">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Optional: Link Family Members</h3>
                  <p className="text-gray-600">
                    Add family members to your account with appropriate permission levels. Perfect for parents of deaf children or managing elderly family members.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Apply Now
              </Button>
              <p className="mt-4 text-sm text-gray-500">
                Applications typically process within 3-5 business days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50" id="faq">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Common questions about our NFT Identity System
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How is my identity information secured?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your identity information is secured using blockchain technology and advanced encryption. The NFT token serves as a verification method, while the actual sensitive data is stored in encrypted format with access controls you define.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Do I need technical knowledge to use this system?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No technical knowledge is required. Our system is designed to be extremely user-friendly, with visual interfaces and clear instructions. We also offer training sessions in ASL for deaf users.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Which municipalities recognize this ID system?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We currently have partnerships with 27 municipalities across the country. The system is recognized by law enforcement in these jurisdictions, and we're actively expanding our network. See our partners page for a complete list.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How does the benefits verification work with SSI?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our FibonroseTRUST system creates verified records of employment status changes. These records include cryptographic timestamps that can be used to verify benefit eligibility changes with the Social Security Administration, streamlining the process of benefits resumption.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What is the cost for individual and family plans?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Individual plans start at $5.99/month. Family plans covering up to 5 members are $9.99/month. We offer substantial discounts for annual subscriptions, and qualifying low-income individuals may be eligible for subsidized rates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-700 to-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to secure your digital identity?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of deaf individuals and families who trust NegraRosa for secure, accessible identification.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary">
              Apply Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-800">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndividualIdPage;