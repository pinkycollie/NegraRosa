import { 
  User, InsertUser, 
  Verification, InsertVerification, 
  Reputation, InsertReputation,
  Transaction, InsertTransaction,
  RiskAssessment, InsertRiskAssessment,
  Claim, InsertClaim,
  EntrepreneurProfile, InsertEntrepreneurProfile,
  JsonDataUpload, InsertJsonDataUpload,
  JobProfile, InsertJobProfile,
  BackgroundVerification, InsertBackgroundVerification,
  JobApplication, InsertJobApplication,
  WhySubmission, InsertWhySubmission,
  WhyNotification, InsertWhyNotification,
  Webhook, InsertWebhook,
  WebhookPayload, InsertWebhookPayload,
  VerificationType,
  ComplianceCredential, InsertComplianceCredential,
  VanuatuEntity, InsertVanuatuEntity,
  VanuatuLicense, InsertVanuatuLicense,
  ComplianceReport, InsertComplianceReport,
  // OAuth and External Identity types
  OAuthState, InsertOAuthState,
  UserToken, InsertUserToken,
  ExternalIdentity, InsertExternalIdentity,
  VerificationRequest, InsertVerificationRequest,
  // Finance/Tax/Insurance Module types
  FinancialTransaction, InsertFinancialTransaction,
  ApiFirewallLog, InsertApiFirewallLog,
  InsurancePolicy, InsertInsurancePolicy,
  // Real Estate Module types
  PropertyDocument, InsertPropertyDocument,
  PropertyTag, InsertPropertyTag,
  PropertyVerification, InsertPropertyVerification,
  // Business Credit Module types 
  BusinessCreditProfile, InsertBusinessCreditProfile,
  CreditEnrichmentLog, InsertCreditEnrichmentLog,
  ZkpCreditProof, InsertZkpCreditProof
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByExternalId(externalId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createUserFromAuth0(userData: {
    externalId: string;
    username: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    auth0Metadata: any;
  }): Promise<User>;
  updateUserFromAuth0(userId: number, updates: {
    email: string;
    fullName: string | null;
    auth0Metadata: any;
    lastLogin: Date;
  }): Promise<User | undefined>;
  getUserTenantMembership(userId: number, tenantId: string): Promise<any>;
  getUserTenants(userId: number): Promise<any[]>;
  
  // OAuth and External Identity Management
  storeOAuthState(userId: number, state: InsertOAuthState): Promise<OAuthState>;
  getOAuthStateByState(state: string): Promise<OAuthState | undefined>;
  storeUserTokens(userId: number, tokens: InsertUserToken): Promise<UserToken>;
  getUserTokensByProvider(userId: number, provider: string): Promise<UserToken | undefined>;
  refreshUserTokens(id: number, accessToken: string, refreshToken?: string, expiresAt?: Date): Promise<UserToken | undefined>;
  linkExternalIdentity(userId: number, identity: InsertExternalIdentity): Promise<ExternalIdentity>;
  getExternalIdentities(userId: number): Promise<ExternalIdentity[]>;
  getExternalIdentityByExternalId(provider: string, externalId: string): Promise<ExternalIdentity | undefined>;
  storeVerificationRequest(userId: number, request: InsertVerificationRequest): Promise<VerificationRequest>;
  getVerificationRequest(id: string): Promise<VerificationRequest | undefined>;
  updateVerificationRequestStatus(id: string, status: string, result?: any): Promise<VerificationRequest | undefined>;
  
  // Verification methods
  createVerification(verification: InsertVerification): Promise<Verification>;
  getVerificationsByUserId(userId: number): Promise<Verification[]>;
  updateVerification(id: number, status: string, verifiedAt?: Date): Promise<Verification | undefined>;
  
  // Reputation system
  getReputation(userId: number): Promise<Reputation | undefined>;
  createReputation(reputation: InsertReputation): Promise<Reputation>;
  updateReputation(userId: number, updates: Partial<Reputation>): Promise<Reputation | undefined>;
  
  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  updateTransaction(id: number, status: string, riskScore?: number): Promise<Transaction | undefined>;
  
  // Risk assessments
  createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  getRiskAssessmentByTransactionId(transactionId: number): Promise<RiskAssessment | undefined>;
  
  // E&O claims
  createClaim(claim: InsertClaim): Promise<Claim>;
  getClaimsByUserId(userId: number): Promise<Claim[]>;
  getClaim(id: number): Promise<Claim | undefined>;
  updateClaim(id: number, status: string, settlementAmount?: number, resolvedAt?: Date): Promise<Claim | undefined>;
  
  // Entrepreneur profiles
  getEntrepreneurProfile(id: number): Promise<EntrepreneurProfile | undefined>;
  getEntrepreneurProfileByUserId(userId: number): Promise<EntrepreneurProfile | undefined>;
  createEntrepreneurProfile(profile: InsertEntrepreneurProfile): Promise<EntrepreneurProfile>;
  updateEntrepreneurProfile(id: number, updates: Partial<InsertEntrepreneurProfile>): Promise<EntrepreneurProfile | undefined>;
  
  // JSON data uploads
  createJsonDataUpload(upload: InsertJsonDataUpload): Promise<JsonDataUpload>;
  getJsonDataUploadsByUserId(userId: number): Promise<JsonDataUpload[]>;
  getJsonDataUploadsByProfileId(profileId: number): Promise<JsonDataUpload[]>;
  getJsonDataUpload(id: number): Promise<JsonDataUpload | undefined>;
  updateJsonDataUpload(id: number, status: string, aiInsights?: string): Promise<JsonDataUpload | undefined>;
  
  // Job profiles
  getJobProfile(id: number): Promise<JobProfile | undefined>;
  getJobProfileByUserId(userId: number): Promise<JobProfile | undefined>;
  createJobProfile(profile: InsertJobProfile): Promise<JobProfile>;
  updateJobProfile(id: number, updates: Partial<InsertJobProfile>): Promise<JobProfile | undefined>;
  updateJobProfileActivityScore(id: number, score: number): Promise<JobProfile | undefined>;
  
  // Background verifications
  createBackgroundVerification(verification: InsertBackgroundVerification): Promise<BackgroundVerification>;
  getBackgroundVerificationsByUserId(userId: number): Promise<BackgroundVerification[]>;
  getBackgroundVerificationsByProfileId(profileId: number): Promise<BackgroundVerification[]>;
  getBackgroundVerification(id: number): Promise<BackgroundVerification | undefined>;
  updateBackgroundVerification(
    id: number, 
    updates: {
      verificationStatus?: string;
      aiAnalysis?: string;
      recommendedAction?: string;
      probationaryPeriod?: number;
      alternativePositions?: any;
      verifiedAt?: Date;
    }
  ): Promise<BackgroundVerification | undefined>;
  
  // Job applications
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getJobApplicationsByUserId(userId: number): Promise<JobApplication[]>;
  getJobApplicationsByProfileId(profileId: number): Promise<JobApplication[]>;
  getJobApplication(id: number): Promise<JobApplication | undefined>;
  updateJobApplication(
    id: number,
    updates: {
      status?: string;
      rejectionReason?: string;
      userResponse?: string;
      transparencyReport?: any;
      aiRecommendedImprovements?: string;
      activitiesCompleted?: any;
    }
  ): Promise<JobApplication | undefined>;
  
  // WHY Submissions
  createWhySubmission(submission: InsertWhySubmission): Promise<WhySubmission>;
  getWhySubmissionsByUserId(userId: number): Promise<WhySubmission[]>;
  getWhySubmission(id: number): Promise<WhySubmission | undefined>;
  updateWhySubmission(
    id: number,
    updates: {
      status?: string;
      reviewerId?: number;
      resolution?: string;
      facilitated?: boolean;
      facilitatorInfo?: any;
      resolvedAt?: Date;
    }
  ): Promise<WhySubmission | undefined>;
  
  // WHY Notifications
  createWhyNotification(notification: InsertWhyNotification): Promise<WhyNotification>;
  getWhyNotificationsByUserId(userId: number): Promise<WhyNotification[]>;
  updateWhyNotificationStatus(
    id: number,
    status: string,
    sentAt?: Date,
    readAt?: Date
  ): Promise<WhyNotification | undefined>;
  
  // Webhook system
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  getWebhook(id: string): Promise<Webhook | undefined>;
  getWebhooksByUserId(userId: number): Promise<Webhook[]>;
  updateWebhook(id: string, updates: Partial<Webhook>): Promise<Webhook | undefined>;
  deleteWebhook(id: string): Promise<boolean>;
  
  // Webhook payloads
  createWebhookPayload(payload: InsertWebhookPayload): Promise<WebhookPayload>;
  getWebhookPayloadsByWebhookId(webhookId: string): Promise<WebhookPayload[]>;
  getWebhookPayloadsByStatus(status: string): Promise<WebhookPayload[]>;
  getWebhookPayloadsByIds(ids: string[]): Promise<WebhookPayload[]>;
  updateWebhookPayloadStatus(id: string, status: string, responseCode?: number | null, responseBody?: string): Promise<WebhookPayload | undefined>;
  updateWebhookPayloadNotionId(id: string, notionEntryId: string): Promise<WebhookPayload | undefined>;
  updateWebhookPayloadRetryCount(id: string, retryCount: number): Promise<WebhookPayload | undefined>;
  
  // Vanuatu Compliance - Credentials
  createComplianceCredential(credential: InsertComplianceCredential): Promise<ComplianceCredential>;
  getComplianceCredential(id: number): Promise<ComplianceCredential | undefined>;
  getComplianceCredentialsByUserId(userId: number): Promise<ComplianceCredential[]>;
  getComplianceCredentialsByJurisdiction(jurisdictionCode: string): Promise<ComplianceCredential[]>;
  updateComplianceCredential(id: number, updates: Partial<ComplianceCredential>): Promise<ComplianceCredential | undefined>;
  
  // Vanuatu Entities
  createVanuatuEntity(entity: InsertVanuatuEntity): Promise<VanuatuEntity>;
  getVanuatuEntity(id: number): Promise<VanuatuEntity | undefined>;
  getVanuatuEntitiesByCredentialId(credentialId: number): Promise<VanuatuEntity[]>;
  getVanuatuEntitiesWithUpcomingFilings(daysThreshold: number): Promise<VanuatuEntity[]>;
  updateVanuatuEntity(id: number, updates: Partial<VanuatuEntity>): Promise<VanuatuEntity | undefined>;
  
  // Vanuatu Licenses
  createVanuatuLicense(license: InsertVanuatuLicense): Promise<VanuatuLicense>;
  getVanuatuLicense(id: number): Promise<VanuatuLicense | undefined>;
  getVanuatuLicensesByEntityId(entityId: number): Promise<VanuatuLicense[]>;
  getVanuatuLicensesByCredentialId(credentialId: number): Promise<VanuatuLicense[]>;
  getVanuatuLicensesNearingExpiration(daysThreshold: number): Promise<VanuatuLicense[]>;
  updateVanuatuLicense(id: number, updates: Partial<VanuatuLicense>): Promise<VanuatuLicense | undefined>;
  
  // Compliance Reports
  createComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport>;
  getComplianceReport(id: number): Promise<ComplianceReport | undefined>;
  getComplianceReportsByEntityId(entityId: number): Promise<ComplianceReport[]>;
  getComplianceReportsByLicenseId(licenseId: number): Promise<ComplianceReport[]>;
  updateComplianceReport(id: number, updates: Partial<ComplianceReport>): Promise<ComplianceReport | undefined>;
  updateComplianceReportWebhookStatus(id: number, sent: boolean): Promise<ComplianceReport | undefined>;
  
  // Finance/Tax/Insurance Module
  createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction>;
  getFinancialTransactionsByUserId(userId: number): Promise<FinancialTransaction[]>;
  getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined>;
  updateFinancialTransaction(id: number, updates: Partial<FinancialTransaction>): Promise<FinancialTransaction | undefined>;
  getFinancialTransactionsByMerkleRoot(merkleRoot: string): Promise<FinancialTransaction[]>;
  
  logApiFirewallEvent(log: InsertApiFirewallLog): Promise<ApiFirewallLog>;
  getApiFirewallLogsByUserId(userId: number): Promise<ApiFirewallLog[]>;
  getApiFirewallLogsByPath(path: string): Promise<ApiFirewallLog[]>;
  
  createInsurancePolicy(policy: InsertInsurancePolicy): Promise<InsurancePolicy>;
  getInsurancePoliciesByUserId(userId: number): Promise<InsurancePolicy[]>;
  getInsurancePolicy(id: number): Promise<InsurancePolicy | undefined>;
  updateInsurancePolicy(id: number, updates: Partial<InsurancePolicy>): Promise<InsurancePolicy | undefined>;
  
  // Real Estate Module
  createPropertyDocument(document: InsertPropertyDocument): Promise<PropertyDocument>;
  getPropertyDocumentsByUserId(userId: number): Promise<PropertyDocument[]>;
  getPropertyDocumentsByPropertyId(propertyId: string): Promise<PropertyDocument[]>;
  getPropertyDocument(id: number): Promise<PropertyDocument | undefined>;
  updatePropertyDocument(id: number, updates: Partial<PropertyDocument>): Promise<PropertyDocument | undefined>;
  logDocumentAccess(id: number, userId: number, actionType: string): Promise<PropertyDocument | undefined>;
  
  createPropertyTag(tag: InsertPropertyTag): Promise<PropertyTag>;
  getPropertyTagsByPropertyId(propertyId: string): Promise<PropertyTag[]>;
  getPropertyTag(id: number): Promise<PropertyTag | undefined>;
  getPropertyTagByUid(tagUid: string): Promise<PropertyTag | undefined>;
  updatePropertyTag(id: number, updates: Partial<PropertyTag>): Promise<PropertyTag | undefined>;
  logTagScan(id: number): Promise<PropertyTag | undefined>;
  
  createPropertyVerification(verification: InsertPropertyVerification): Promise<PropertyVerification>;
  getPropertyVerificationsByPropertyId(propertyId: string): Promise<PropertyVerification[]>;
  getPropertyVerification(id: number): Promise<PropertyVerification | undefined>;
  updatePropertyVerification(id: number, updates: Partial<PropertyVerification>): Promise<PropertyVerification | undefined>;
  
  // Business Credit Module
  createBusinessCreditProfile(profile: InsertBusinessCreditProfile): Promise<BusinessCreditProfile>;
  getBusinessCreditProfileByUserId(userId: number): Promise<BusinessCreditProfile | undefined>;
  getBusinessCreditProfile(id: number): Promise<BusinessCreditProfile | undefined>;
  updateBusinessCreditProfile(id: number, updates: Partial<BusinessCreditProfile>): Promise<BusinessCreditProfile | undefined>;
  getBusinessCreditProfileByBusinessName(businessName: string): Promise<BusinessCreditProfile | undefined>;
  
  createCreditEnrichmentLog(log: InsertCreditEnrichmentLog): Promise<CreditEnrichmentLog>;
  getCreditEnrichmentLogsByProfileId(profileId: number): Promise<CreditEnrichmentLog[]>;
  getCreditEnrichmentLog(id: number): Promise<CreditEnrichmentLog | undefined>;
  
  createZkpCreditProof(proof: InsertZkpCreditProof): Promise<ZkpCreditProof>;
  getZkpCreditProofsByProfileId(profileId: number): Promise<ZkpCreditProof[]>;
  getZkpCreditProof(id: number): Promise<ZkpCreditProof | undefined>;
  getZkpCreditProofByPublicIdentifier(publicIdentifier: string): Promise<ZkpCreditProof | undefined>;
  verifyZkpCreditProof(id: number): Promise<ZkpCreditProof | undefined>;
  
  // User utilities
  getAllUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private verifications: Map<number, Verification>;
  private reputations: Map<number, Reputation>;
  private transactions: Map<number, Transaction>;
  private riskAssessments: Map<number, RiskAssessment>;
  private claims: Map<number, Claim>;
  private entrepreneurProfiles: Map<number, EntrepreneurProfile>;
  private jsonDataUploads: Map<number, JsonDataUpload>;
  private jobProfiles: Map<number, JobProfile>;
  private backgroundVerifications: Map<number, BackgroundVerification>;
  private jobApplications: Map<number, JobApplication>;
  private whySubmissions: Map<number, WhySubmission>;
  private whyNotifications: Map<number, WhyNotification>;
  private webhooks: Map<string, Webhook>;
  private webhookPayloads: Map<string, WebhookPayload>;
  
  // OAuth and External Identity maps
  private oauthStates: Map<number, OAuthState>;
  private oauthStatesByStateParam: Map<string, OAuthState>;
  private userTokens: Map<number, UserToken>;
  private externalIdentities: Map<number, ExternalIdentity>;
  private externalIdentitiesByProviderId: Map<string, ExternalIdentity>;
  private verificationRequests: Map<string, VerificationRequest>;
  
  // Vanuatu compliance maps
  private complianceCredentials: Map<number, ComplianceCredential>;
  private vanuatuEntities: Map<number, VanuatuEntity>;
  private vanuatuLicenses: Map<number, VanuatuLicense>;
  private complianceReports: Map<number, ComplianceReport>;
  
  // Finance/Tax/Insurance Module maps
  private financialTransactions: Map<number, FinancialTransaction>;
  private apiFirewallLogs: Map<number, ApiFirewallLog>;
  private insurancePolicies: Map<number, InsurancePolicy>;
  
  // Real Estate Module maps
  private propertyDocuments: Map<number, PropertyDocument>;
  private propertyTags: Map<number, PropertyTag>;
  private propertyVerifications: Map<number, PropertyVerification>;
  
  // Business Credit Module maps
  private businessCreditProfiles: Map<number, BusinessCreditProfile>;
  private creditEnrichmentLogs: Map<number, CreditEnrichmentLog>;
  private zkpCreditProofs: Map<number, ZkpCreditProof>;
  
  private nextUserId: number;
  private nextVerificationId: number;
  private nextReputationId: number;
  private nextTransactionId: number;
  private nextRiskAssessmentId: number;
  private nextClaimId: number;
  private nextEntrepreneurProfileId: number;
  private nextJsonDataUploadId: number;
  private nextJobProfileId: number;
  private nextBackgroundVerificationId: number;
  private nextJobApplicationId: number;
  private nextWhySubmissionId: number;
  private nextWhyNotificationId: number;
  
  // Vanuatu compliance counters
  private nextComplianceCredentialId: number;
  private nextVanuatuEntityId: number;
  private nextVanuatuLicenseId: number;
  private nextComplianceReportId: number;
  
  // Finance/Tax/Insurance Module counters
  private nextFinancialTransactionId: number;
  private nextApiFirewallLogId: number;
  private nextInsurancePolicyId: number;
  
  // Real Estate Module counters
  private nextPropertyDocumentId: number;
  private nextPropertyTagId: number;
  private nextPropertyVerificationId: number;
  
  // Business Credit Module counters
  private nextBusinessCreditProfileId: number;
  private nextCreditEnrichmentLogId: number;
  private nextZkpCreditProofId: number;

  constructor() {
    this.users = new Map();
    this.verifications = new Map();
    this.reputations = new Map();
    this.transactions = new Map();
    this.riskAssessments = new Map();
    this.claims = new Map();
    this.entrepreneurProfiles = new Map();
    this.jsonDataUploads = new Map();
    this.jobProfiles = new Map();
    this.backgroundVerifications = new Map();
    this.jobApplications = new Map();
    this.whySubmissions = new Map();
    this.whyNotifications = new Map();
    this.webhooks = new Map();
    this.webhookPayloads = new Map();
    
    // Initialize OAuth and External Identity maps
    this.oauthStates = new Map();
    this.oauthStatesByStateParam = new Map();
    this.userTokens = new Map();
    this.externalIdentities = new Map();
    this.externalIdentitiesByProviderId = new Map();
    this.verificationRequests = new Map();
    
    // Initialize Vanuatu compliance maps
    this.complianceCredentials = new Map();
    this.vanuatuEntities = new Map();
    this.vanuatuLicenses = new Map();
    this.complianceReports = new Map();
    
    // Initialize Finance/Tax/Insurance Module maps
    this.financialTransactions = new Map();
    this.apiFirewallLogs = new Map();
    this.insurancePolicies = new Map();
    
    // Initialize Real Estate Module maps
    this.propertyDocuments = new Map();
    this.propertyTags = new Map();
    this.propertyVerifications = new Map();
    
    // Initialize Business Credit Module maps
    this.businessCreditProfiles = new Map();
    this.creditEnrichmentLogs = new Map();
    this.zkpCreditProofs = new Map();
    
    this.nextUserId = 1;
    this.nextVerificationId = 1;
    this.nextReputationId = 1;
    this.nextTransactionId = 1;
    this.nextRiskAssessmentId = 1;
    this.nextClaimId = 1;
    this.nextEntrepreneurProfileId = 1;
    this.nextJsonDataUploadId = 1;
    this.nextJobProfileId = 1;
    this.nextBackgroundVerificationId = 1;
    this.nextJobApplicationId = 1;
    this.nextWhySubmissionId = 1;
    this.nextWhyNotificationId = 1;
    
    // Initialize Vanuatu compliance counters
    this.nextComplianceCredentialId = 1;
    this.nextVanuatuEntityId = 1;
    this.nextVanuatuLicenseId = 1;
    this.nextComplianceReportId = 1;
    
    // Initialize Finance/Tax/Insurance Module counters
    this.nextFinancialTransactionId = 1;
    this.nextApiFirewallLogId = 1;
    this.nextInsurancePolicyId = 1;
    
    // Initialize Real Estate Module counters
    this.nextPropertyDocumentId = 1;
    this.nextPropertyTagId = 1;
    this.nextPropertyVerificationId = 1;
    
    // Initialize Business Credit Module counters
    this.nextBusinessCreditProfileId = 1;
    this.nextCreditEnrichmentLogId = 1;
    this.nextZkpCreditProofId = 1;
    
    // Add a test user for development
    this.createUser({
      username: "testuser",
      password: "password123", // In a real app, this would be hashed
      email: "test@example.com",
      fullName: "Test User",
      phone: "+1234567890"
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByExternalId(externalId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.externalId === externalId,
    );
  }
  
  async createUserFromAuth0(userData: {
    externalId: string;
    username: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    auth0Metadata: any;
  }): Promise<User> {
    const id = this.nextUserId++;
    const now = new Date();
    const user: User = {
      id,
      externalId: userData.externalId,
      username: userData.username,
      password: "", // We don't need passwords for Auth0 users
      email: userData.email,
      fullName: userData.fullName,
      phone: userData.phone,
      createdAt: now,
      auth0Metadata: userData.auth0Metadata,
      lastLogin: now
    };
    this.users.set(id, user);
    
    // Initialize reputation for new user
    await this.createReputation({
      userId: id,
      score: 0,
      positiveTransactions: 0,
      totalTransactions: 0,
      verificationCount: 0,
      accountAge: 0
    });
    
    return user;
  }
  
  async updateUserFromAuth0(userId: number, updates: {
    email: string;
    fullName: string | null;
    auth0Metadata: any;
    lastLogin: Date;
  }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      email: updates.email,
      fullName: updates.fullName,
      auth0Metadata: updates.auth0Metadata,
      lastLogin: updates.lastLogin
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getUserTenantMembership(userId: number, tenantId: string): Promise<any> {
    // This would connect to a tenant_membership table in a real implementation
    // For simplicity, we'll return a mock tenant membership if the user exists
    const user = await this.getUser(userId);
    if (!user) return null;
    
    // In a real system, we would check if the user has access to the specific tenant
    // For now, we assume all users have access to any tenant they request
    return {
      userId,
      tenantId,
      role: "member",
      active: true
    };
  }
  
  async getUserTenants(userId: number): Promise<any[]> {
    // This would fetch the user's tenants from a tenant_membership table
    // For simplicity, we'll return a mock list of tenants
    const user = await this.getUser(userId);
    if (!user) return [];
    
    // Mock tenants for demo purposes
    return [
      {
        id: "tenant-1",
        name: "NegraRosa Security",
        role: "admin",
        active: true
      },
      {
        id: "tenant-2",
        name: "FibonRoseTRUST",
        role: "member",
        active: true
      },
      {
        id: "tenant-3",
        name: "CIVIC Bridge",
        role: "viewer",
        active: true
      }
    ];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    
    // Initialize reputation for new user
    await this.createReputation({
      userId: id,
      score: 0,
      positiveTransactions: 0,
      totalTransactions: 0,
      verificationCount: 0,
      accountAge: 0
    });
    
    return user;
  }

  // Verification methods
  async createVerification(verification: InsertVerification): Promise<Verification> {
    const id = this.nextVerificationId++;
    const now = new Date();
    const newVerification: Verification = {
      ...verification,
      id,
      createdAt: now,
      verifiedAt: null
    };
    this.verifications.set(id, newVerification);
    return newVerification;
  }

  async getVerificationsByUserId(userId: number): Promise<Verification[]> {
    return Array.from(this.verifications.values()).filter(
      (verification) => verification.userId === userId
    );
  }

  async updateVerification(id: number, status: string, verifiedAt?: Date): Promise<Verification | undefined> {
    const verification = this.verifications.get(id);
    if (!verification) return undefined;
    
    const updatedVerification: Verification = {
      ...verification,
      status,
      verifiedAt: verifiedAt || verification.verifiedAt
    };
    this.verifications.set(id, updatedVerification);
    
    // If verification is successful, update the user's reputation
    if (status === 'VERIFIED') {
      const reputation = await this.getReputation(verification.userId);
      if (reputation) {
        await this.updateReputation(verification.userId, {
          verificationCount: reputation.verificationCount + 1,
          score: this.calculateReputationScore(reputation.positiveTransactions, 
                                               reputation.totalTransactions, 
                                               reputation.verificationCount + 1, 
                                               reputation.accountAge)
        });
      }
    }
    
    return updatedVerification;
  }

  // Reputation system
  async getReputation(userId: number): Promise<Reputation | undefined> {
    return Array.from(this.reputations.values()).find(
      (reputation) => reputation.userId === userId
    );
  }

  async createReputation(reputation: InsertReputation): Promise<Reputation> {
    const id = this.nextReputationId++;
    const now = new Date();
    const newReputation: Reputation = {
      ...reputation,
      id,
      updatedAt: now
    };
    this.reputations.set(id, newReputation);
    return newReputation;
  }

  async updateReputation(userId: number, updates: Partial<Reputation>): Promise<Reputation | undefined> {
    const reputation = await this.getReputation(userId);
    if (!reputation) return undefined;
    
    const updatedReputation: Reputation = {
      ...reputation,
      ...updates,
      updatedAt: new Date()
    };
    this.reputations.set(reputation.id, updatedReputation);
    return updatedReputation;
  }

  private calculateReputationScore(
    positiveTransactions: number, 
    totalTransactions: number, 
    verificationCount: number, 
    accountAge: number
  ): number {
    // Simple scoring algorithm - in a real system this would be more sophisticated
    const transactionScore = totalTransactions > 0 
      ? (positiveTransactions / totalTransactions) * 50 
      : 0;
    const verificationScore = Math.min(verificationCount * 12.5, 25); // Max 25% for verifications
    const ageScore = Math.min(accountAge / 30 * 25, 25); // Max 25% for 30+ days
    
    return transactionScore + verificationScore + ageScore;
  }

  // Transactions
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.nextTransactionId++;
    const now = new Date();
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.transactions.set(id, newTransaction);
    
    // Update reputation if transaction is successful
    if (transaction.status === 'COMPLETED') {
      const reputation = await this.getReputation(transaction.userId);
      if (reputation) {
        await this.updateReputation(transaction.userId, {
          positiveTransactions: reputation.positiveTransactions + 1,
          totalTransactions: reputation.totalTransactions + 1,
          score: this.calculateReputationScore(
            reputation.positiveTransactions + 1,
            reputation.totalTransactions + 1,
            reputation.verificationCount,
            reputation.accountAge
          )
        });
      }
    } else if (transaction.status === 'FAILED' || transaction.status === 'FLAGGED') {
      const reputation = await this.getReputation(transaction.userId);
      if (reputation) {
        await this.updateReputation(transaction.userId, {
          totalTransactions: reputation.totalTransactions + 1,
          score: this.calculateReputationScore(
            reputation.positiveTransactions,
            reputation.totalTransactions + 1,
            reputation.verificationCount,
            reputation.accountAge
          )
        });
      }
    }
    
    return newTransaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async updateTransaction(id: number, status: string, riskScore?: number): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const wasCompleted = transaction.status === 'COMPLETED';
    const nowCompleted = status === 'COMPLETED';
    
    const updatedTransaction: Transaction = {
      ...transaction,
      status,
      riskScore: riskScore !== undefined ? riskScore : transaction.riskScore,
      updatedAt: new Date()
    };
    this.transactions.set(id, updatedTransaction);
    
    // Update reputation if transaction status changes to or from COMPLETED
    if (!wasCompleted && nowCompleted) {
      // Transaction now successful
      const reputation = await this.getReputation(transaction.userId);
      if (reputation) {
        await this.updateReputation(transaction.userId, {
          positiveTransactions: reputation.positiveTransactions + 1,
          score: this.calculateReputationScore(
            reputation.positiveTransactions + 1,
            reputation.totalTransactions,
            reputation.verificationCount,
            reputation.accountAge
          )
        });
      }
    } else if (wasCompleted && !nowCompleted) {
      // Transaction no longer successful
      const reputation = await this.getReputation(transaction.userId);
      if (reputation && reputation.positiveTransactions > 0) {
        await this.updateReputation(transaction.userId, {
          positiveTransactions: reputation.positiveTransactions - 1,
          score: this.calculateReputationScore(
            reputation.positiveTransactions - 1,
            reputation.totalTransactions,
            reputation.verificationCount,
            reputation.accountAge
          )
        });
      }
    }
    
    return updatedTransaction;
  }

  // Risk assessments
  async createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const id = this.nextRiskAssessmentId++;
    const now = new Date();
    const newAssessment: RiskAssessment = {
      ...assessment,
      id,
      createdAt: now
    };
    this.riskAssessments.set(id, newAssessment);
    return newAssessment;
  }

  async getRiskAssessmentByTransactionId(transactionId: number): Promise<RiskAssessment | undefined> {
    return Array.from(this.riskAssessments.values()).find(
      (assessment) => assessment.transactionId === transactionId
    );
  }

  // E&O claims
  async createClaim(claim: InsertClaim): Promise<Claim> {
    const id = this.nextClaimId++;
    const now = new Date();
    const newClaim: Claim = {
      ...claim,
      id,
      createdAt: now,
      settlementAmount: null,
      resolvedAt: null
    };
    this.claims.set(id, newClaim);
    return newClaim;
  }

  async getClaimsByUserId(userId: number): Promise<Claim[]> {
    return Array.from(this.claims.values())
      .filter(claim => claim.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getClaim(id: number): Promise<Claim | undefined> {
    return this.claims.get(id);
  }

  async updateClaim(id: number, status: string, settlementAmount?: number, resolvedAt?: Date): Promise<Claim | undefined> {
    const claim = this.claims.get(id);
    if (!claim) return undefined;
    
    const updatedClaim: Claim = {
      ...claim,
      status,
      settlementAmount: settlementAmount !== undefined ? settlementAmount : claim.settlementAmount,
      resolvedAt: resolvedAt || claim.resolvedAt
    };
    this.claims.set(id, updatedClaim);
    return updatedClaim;
  }

  // Entrepreneur profiles
  async getEntrepreneurProfile(id: number): Promise<EntrepreneurProfile | undefined> {
    return this.entrepreneurProfiles.get(id);
  }

  async getEntrepreneurProfileByUserId(userId: number): Promise<EntrepreneurProfile | undefined> {
    return Array.from(this.entrepreneurProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createEntrepreneurProfile(profile: InsertEntrepreneurProfile): Promise<EntrepreneurProfile> {
    const id = this.nextEntrepreneurProfileId++;
    const now = new Date();
    const newProfile: EntrepreneurProfile = {
      ...profile,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.entrepreneurProfiles.set(id, newProfile);
    
    // When a profile is created, we should boost the user's reputation
    const reputation = await this.getReputation(profile.userId);
    if (reputation) {
      await this.updateReputation(profile.userId, {
        score: this.calculateReputationScore(
          reputation.positiveTransactions || 0,
          reputation.totalTransactions || 0,
          (reputation.verificationCount || 0) + 1, // Creating a profile counts as a verification
          reputation.accountAge || 0
        )
      });
    }
    
    return newProfile;
  }

  async updateEntrepreneurProfile(id: number, updates: Partial<InsertEntrepreneurProfile>): Promise<EntrepreneurProfile | undefined> {
    const profile = this.entrepreneurProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile: EntrepreneurProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date()
    };
    this.entrepreneurProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // JSON data uploads
  async createJsonDataUpload(upload: InsertJsonDataUpload): Promise<JsonDataUpload> {
    const id = this.nextJsonDataUploadId++;
    const now = new Date();
    const newUpload: JsonDataUpload = {
      ...upload,
      id,
      createdAt: now,
      aiInsights: null // AI insights are added later after processing
    };
    this.jsonDataUploads.set(id, newUpload);
    
    // When a JSON data upload happens, we boost reputation slightly
    const reputation = await this.getReputation(upload.userId);
    if (reputation) {
      await this.updateReputation(upload.userId, {
        score: Math.min(100, (reputation.score || 0) + 2) // +2 points for each upload, max 100
      });
    }
    
    return newUpload;
  }

  async getJsonDataUploadsByUserId(userId: number): Promise<JsonDataUpload[]> {
    return Array.from(this.jsonDataUploads.values())
      .filter(upload => upload.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getJsonDataUploadsByProfileId(profileId: number): Promise<JsonDataUpload[]> {
    return Array.from(this.jsonDataUploads.values())
      .filter(upload => upload.profileId === profileId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getJsonDataUpload(id: number): Promise<JsonDataUpload | undefined> {
    return this.jsonDataUploads.get(id);
  }

  async updateJsonDataUpload(id: number, status: string, aiInsights?: string): Promise<JsonDataUpload | undefined> {
    const upload = this.jsonDataUploads.get(id);
    if (!upload) return undefined;
    
    const updatedUpload: JsonDataUpload = {
      ...upload,
      status,
      aiInsights: aiInsights !== undefined ? aiInsights : upload.aiInsights
    };
    this.jsonDataUploads.set(id, updatedUpload);
    
    // If the upload is approved, we give the user a reputation boost
    if (status === 'APPROVED') {
      const reputation = await this.getReputation(upload.userId);
      if (reputation) {
        await this.updateReputation(upload.userId, {
          score: Math.min(100, (reputation.score || 0) + 5) // +5 points for approved uploads, max 100
        });
      }
    }
    
    return updatedUpload;
  }
  
  // Job profiles
  async getJobProfile(id: number): Promise<JobProfile | undefined> {
    return this.jobProfiles.get(id);
  }

  async getJobProfileByUserId(userId: number): Promise<JobProfile | undefined> {
    return Array.from(this.jobProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createJobProfile(profile: InsertJobProfile): Promise<JobProfile> {
    const id = this.nextJobProfileId++;
    const now = new Date();
    const newProfile: JobProfile = {
      ...profile,
      id,
      activityScore: 0, // Initialize with zero activity
      lastUpdated: now,
      createdAt: now
    };
    this.jobProfiles.set(id, newProfile);
    
    // Creating a job profile boosts reputation
    const reputation = await this.getReputation(profile.userId);
    if (reputation) {
      await this.updateReputation(profile.userId, {
        score: this.calculateReputationScore(
          reputation.positiveTransactions || 0,
          reputation.totalTransactions || 0,
          (reputation.verificationCount || 0) + 1, // Creating a profile counts as a verification
          reputation.accountAge || 0
        )
      });
    }
    
    return newProfile;
  }

  async updateJobProfile(id: number, updates: Partial<InsertJobProfile>): Promise<JobProfile | undefined> {
    const profile = this.jobProfiles.get(id);
    if (!profile) return undefined;
    
    const now = new Date();
    const updatedProfile: JobProfile = {
      ...profile,
      ...updates,
      lastUpdated: now
    };
    this.jobProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async updateJobProfileActivityScore(id: number, score: number): Promise<JobProfile | undefined> {
    const profile = this.jobProfiles.get(id);
    if (!profile) return undefined;
    
    const now = new Date();
    const updatedProfile: JobProfile = {
      ...profile,
      activityScore: score,
      lastUpdated: now
    };
    this.jobProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Background verifications
  async createBackgroundVerification(verification: InsertBackgroundVerification): Promise<BackgroundVerification> {
    const id = this.nextBackgroundVerificationId++;
    const now = new Date();
    const newVerification: BackgroundVerification = {
      ...verification,
      id,
      aiAnalysis: null,
      recommendedAction: null,
      probationaryPeriod: null,
      alternativePositions: null,
      verifiedAt: null,
      createdAt: now
    };
    this.backgroundVerifications.set(id, newVerification);
    return newVerification;
  }

  async getBackgroundVerificationsByUserId(userId: number): Promise<BackgroundVerification[]> {
    return Array.from(this.backgroundVerifications.values())
      .filter(verification => verification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getBackgroundVerificationsByProfileId(profileId: number): Promise<BackgroundVerification[]> {
    return Array.from(this.backgroundVerifications.values())
      .filter(verification => verification.profileId === profileId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getBackgroundVerification(id: number): Promise<BackgroundVerification | undefined> {
    return this.backgroundVerifications.get(id);
  }

  async updateBackgroundVerification(
    id: number, 
    updates: {
      verificationStatus?: string;
      aiAnalysis?: string;
      recommendedAction?: string;
      probationaryPeriod?: number;
      alternativePositions?: any;
      verifiedAt?: Date;
    }
  ): Promise<BackgroundVerification | undefined> {
    const verification = this.backgroundVerifications.get(id);
    if (!verification) return undefined;
    
    const updatedVerification: BackgroundVerification = {
      ...verification,
      ...updates
    };
    this.backgroundVerifications.set(id, updatedVerification);
    return updatedVerification;
  }

  // Job applications
  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const id = this.nextJobApplicationId++;
    const now = new Date();
    const newApplication: JobApplication = {
      ...application,
      id,
      applicationDate: application.applicationDate || now,
      transparencyReport: null,
      aiRecommendedImprovements: null,
      updatedAt: now
    };
    this.jobApplications.set(id, newApplication);
    
    // Increase activity score for job seeker
    if (application.profileId) {
      const profile = await this.getJobProfile(application.profileId);
      if (profile) {
        await this.updateJobProfileActivityScore(
          profile.id, 
          Math.min(100, (profile.activityScore || 0) + 10) // +10 for each application, max 100
        );
      }
    }
    
    return newApplication;
  }

  async getJobApplicationsByUserId(userId: number): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values())
      .filter(application => application.userId === userId)
      .sort((a, b) => b.applicationDate.getTime() - a.applicationDate.getTime()); // Most recent first
  }

  async getJobApplicationsByProfileId(profileId: number): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values())
      .filter(application => application.profileId === profileId)
      .sort((a, b) => b.applicationDate.getTime() - a.applicationDate.getTime()); // Most recent first
  }

  async getJobApplication(id: number): Promise<JobApplication | undefined> {
    return this.jobApplications.get(id);
  }

  async updateJobApplication(
    id: number,
    updates: {
      status?: string;
      rejectionReason?: string;
      userResponse?: string;
      transparencyReport?: any;
      aiRecommendedImprovements?: string;
      activitiesCompleted?: any;
    }
  ): Promise<JobApplication | undefined> {
    const application = this.jobApplications.get(id);
    if (!application) return undefined;
    
    const updatedApplication: JobApplication = {
      ...application,
      ...updates,
      updatedAt: new Date()
    };
    this.jobApplications.set(id, updatedApplication);
    
    // If rejection with transparent explanation, add to activity score
    if (updates.status === 'REJECTED' && updates.userResponse) {
      if (application.profileId) {
        const profile = await this.getJobProfile(application.profileId);
        if (profile) {
          await this.updateJobProfileActivityScore(
            profile.id, 
            Math.min(100, (profile.activityScore || 0) + 5) // +5 for responding to rejection, max 100
          );
        }
      }
    }
    
    return updatedApplication;
  }
  
  // WHY Submissions
  async createWhySubmission(submission: InsertWhySubmission): Promise<WhySubmission> {
    const id = this.nextWhySubmissionId++;
    const now = new Date();
    const newSubmission: WhySubmission = {
      ...submission,
      id,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null
    };
    this.whySubmissions.set(id, newSubmission);
    
    // When a WHY submission is created, we note this in reputation
    const reputation = await this.getReputation(submission.userId);
    if (reputation) {
      // Note: We don't necessarily increase the score yet - that happens after resolution
      await this.updateReputation(submission.userId, {
        score: Math.min(100, (reputation.score || 0) + 1) // +1 point for explaining, max 100
      });
    }
    
    return newSubmission;
  }

  async getWhySubmissionsByUserId(userId: number): Promise<WhySubmission[]> {
    return Array.from(this.whySubmissions.values())
      .filter(submission => submission.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getWhySubmission(id: number): Promise<WhySubmission | undefined> {
    return this.whySubmissions.get(id);
  }

  async updateWhySubmission(
    id: number,
    updates: {
      status?: string;
      reviewerId?: number;
      resolution?: string;
      facilitated?: boolean;
      facilitatorInfo?: any;
      resolvedAt?: Date;
    }
  ): Promise<WhySubmission | undefined> {
    const submission = this.whySubmissions.get(id);
    if (!submission) return undefined;
    
    const wasResolved = submission.status === 'RESOLVED';
    const nowResolved = updates.status === 'RESOLVED';
    
    const updatedSubmission: WhySubmission = {
      ...submission,
      ...updates,
      updatedAt: new Date()
    };
    this.whySubmissions.set(id, updatedSubmission);
    
    // If submission is resolved, update the user's reputation
    if (!wasResolved && nowResolved) {
      const reputation = await this.getReputation(submission.userId);
      if (reputation) {
        await this.updateReputation(submission.userId, {
          score: Math.min(100, (reputation.score || 0) + 5) // +5 points for resolved WHY, max 100
        });
      }
    }
    
    return updatedSubmission;
  }

  // WHY Notifications
  async createWhyNotification(notification: InsertWhyNotification): Promise<WhyNotification> {
    const id = this.nextWhyNotificationId++;
    const now = new Date();
    const newNotification: WhyNotification = {
      ...notification,
      id,
      createdAt: now,
      sentAt: null,
      readAt: null
    };
    this.whyNotifications.set(id, newNotification);
    return newNotification;
  }

  async getWhyNotificationsByUserId(userId: number): Promise<WhyNotification[]> {
    return Array.from(this.whyNotifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async updateWhyNotificationStatus(
    id: number,
    status: string,
    sentAt?: Date,
    readAt?: Date
  ): Promise<WhyNotification | undefined> {
    const notification = this.whyNotifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification: WhyNotification = {
      ...notification,
      status,
      sentAt: sentAt || notification.sentAt,
      readAt: readAt || notification.readAt
    };
    this.whyNotifications.set(id, updatedNotification);
    return updatedNotification;
  }

  // Webhook system
  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const now = new Date();
    const newWebhook: Webhook = {
      ...webhook,
      active: webhook.active !== undefined ? webhook.active : true,
      createdAt: now,
      updatedAt: now,
      lastTriggeredAt: null,
      payload: null
    };
    this.webhooks.set(webhook.id, newWebhook);
    return newWebhook;
  }

  async getWebhook(id: string): Promise<Webhook | undefined> {
    return this.webhooks.get(id);
  }

  async getWebhooksByUserId(userId: number): Promise<Webhook[]> {
    return Array.from(this.webhooks.values())
      .filter(webhook => webhook.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async updateWebhook(id: string, updates: Partial<Webhook>): Promise<Webhook | undefined> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return undefined;
    
    const updatedWebhook: Webhook = {
      ...webhook,
      ...updates,
      updatedAt: new Date()
    };
    this.webhooks.set(id, updatedWebhook);
    return updatedWebhook;
  }

  async deleteWebhook(id: string): Promise<boolean> {
    return this.webhooks.delete(id);
  }
  
  // Webhook payloads
  async createWebhookPayload(payload: InsertWebhookPayload): Promise<WebhookPayload> {
    const now = new Date();
    const newPayload: WebhookPayload = {
      ...payload,
      timestamp: now,
      deliveryStatus: payload.deliveryStatus || 'PENDING'
    };
    this.webhookPayloads.set(payload.id, newPayload);
    return newPayload;
  }

  async getWebhookPayloadsByWebhookId(webhookId: string): Promise<WebhookPayload[]> {
    return Array.from(this.webhookPayloads.values())
      .filter(payload => payload.webhookId === webhookId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Most recent first
  }

  async updateWebhookPayloadStatus(
    id: string, 
    status: string, 
    responseCode?: number, 
    responseBody?: string
  ): Promise<WebhookPayload | undefined> {
    const payload = this.webhookPayloads.get(id);
    if (!payload) return undefined;
    
    const updatedPayload: WebhookPayload = {
      ...payload,
      deliveryStatus: status,
      responseCode: responseCode !== undefined ? responseCode : payload.responseCode,
      responseBody: responseBody !== undefined ? responseBody : payload.responseBody
    };
    this.webhookPayloads.set(id, updatedPayload);
    return updatedPayload;
  }

  async updateWebhookPayloadNotionId(id: string, notionEntryId: string): Promise<WebhookPayload | undefined> {
    const payload = this.webhookPayloads.get(id);
    if (!payload) return undefined;
    
    const updatedPayload: WebhookPayload = {
      ...payload,
      notionEntryId
    };
    this.webhookPayloads.set(id, updatedPayload);
    return updatedPayload;
  }
  
  async getWebhookPayloadsByStatus(status: string): Promise<WebhookPayload[]> {
    return Array.from(this.webhookPayloads.values())
      .filter(payload => payload.deliveryStatus === status)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Most recent first
  }
  
  async getWebhookPayloadsByIds(ids: string[]): Promise<WebhookPayload[]> {
    return Array.from(this.webhookPayloads.values())
      .filter(payload => ids.includes(payload.id))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Most recent first
  }
  
  async updateWebhookPayloadRetryCount(id: string, retryCount: number): Promise<WebhookPayload | undefined> {
    const payload = this.webhookPayloads.get(id);
    if (!payload) return undefined;
    
    const updatedPayload: WebhookPayload = {
      ...payload,
      retryCount
    };
    this.webhookPayloads.set(id, updatedPayload);
    return updatedPayload;
  }
  
  // User utilities
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // OAuth and External Identity Methods
  async storeOAuthState(userId: number, state: InsertOAuthState): Promise<OAuthState> {
    const id = 1; // Since we're using Maps, we don't need auto-incrementing IDs
    const oauthState: OAuthState = {
      ...state,
      id,
      userId,
      createdAt: new Date()
    };
    this.oauthStates.set(id, oauthState);
    this.oauthStatesByStateParam.set(state.state, oauthState);
    return oauthState;
  }

  async getOAuthStateByState(state: string): Promise<OAuthState | undefined> {
    return this.oauthStatesByStateParam.get(state);
  }

  async storeUserTokens(userId: number, tokens: InsertUserToken): Promise<UserToken> {
    const id = 1; // Since we're using Maps, we don't need auto-incrementing IDs
    const now = new Date();
    const userToken: UserToken = {
      ...tokens,
      id,
      userId,
      createdAt: now,
      updatedAt: now
    };
    this.userTokens.set(userId, userToken);
    return userToken;
  }

  async getUserTokensByProvider(userId: number, provider: string): Promise<UserToken | undefined> {
    const token = this.userTokens.get(userId);
    if (token && token.provider === provider) {
      return token;
    }
    return undefined;
  }

  async refreshUserTokens(id: number, accessToken: string, refreshToken?: string, expiresAt?: Date): Promise<UserToken | undefined> {
    const token = this.userTokens.get(id);
    if (!token) return undefined;

    const updatedToken: UserToken = {
      ...token,
      accessToken,
      refreshToken: refreshToken || token.refreshToken,
      expiresAt: expiresAt || token.expiresAt,
      updatedAt: new Date()
    };
    this.userTokens.set(id, updatedToken);
    return updatedToken;
  }

  async linkExternalIdentity(userId: number, identity: InsertExternalIdentity): Promise<ExternalIdentity> {
    const id = 1; // Since we're using Maps, we don't need auto-incrementing IDs
    const now = new Date();
    const externalIdentity: ExternalIdentity = {
      ...identity,
      id,
      userId,
      createdAt: now,
      updatedAt: now,
      verifiedAt: now
    };
    this.externalIdentities.set(id, externalIdentity);
    this.externalIdentitiesByProviderId.set(`${identity.provider}:${identity.externalId}`, externalIdentity);
    return externalIdentity;
  }

  async getExternalIdentities(userId: number): Promise<ExternalIdentity[]> {
    return Array.from(this.externalIdentities.values())
      .filter(identity => identity.userId === userId);
  }

  async getExternalIdentityByExternalId(provider: string, externalId: string): Promise<ExternalIdentity | undefined> {
    return this.externalIdentitiesByProviderId.get(`${provider}:${externalId}`);
  }

  async storeVerificationRequest(userId: number, request: InsertVerificationRequest): Promise<VerificationRequest> {
    const now = new Date();
    const verificationRequest: VerificationRequest = {
      ...request,
      userId,
      createdAt: now,
      completedAt: null
    };
    this.verificationRequests.set(request.id, verificationRequest);
    return verificationRequest;
  }

  async getVerificationRequest(id: string): Promise<VerificationRequest | undefined> {
    return this.verificationRequests.get(id);
  }

  async updateVerificationRequestStatus(id: string, status: string, result?: any): Promise<VerificationRequest | undefined> {
    const request = this.verificationRequests.get(id);
    if (!request) return undefined;

    const now = new Date();
    const updatedRequest: VerificationRequest = {
      ...request,
      status,
      result: result || request.result,
      completedAt: status === 'COMPLETED' ? now : request.completedAt
    };
    this.verificationRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Vanuatu Compliance - Credentials
  async createComplianceCredential(credential: InsertComplianceCredential): Promise<ComplianceCredential> {
    const id = this.nextComplianceCredentialId++;
    const now = new Date();
    const newCredential: ComplianceCredential = {
      ...credential,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.complianceCredentials.set(id, newCredential);
    return newCredential;
  }

  async getComplianceCredential(id: number): Promise<ComplianceCredential | undefined> {
    return this.complianceCredentials.get(id);
  }

  async getComplianceCredentialsByUserId(userId: number): Promise<ComplianceCredential[]> {
    return Array.from(this.complianceCredentials.values())
      .filter(credential => credential.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getComplianceCredentialsByJurisdiction(jurisdictionCode: string): Promise<ComplianceCredential[]> {
    return Array.from(this.complianceCredentials.values())
      .filter(credential => credential.jurisdictionCode === jurisdictionCode)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async updateComplianceCredential(id: number, updates: Partial<ComplianceCredential>): Promise<ComplianceCredential | undefined> {
    const credential = this.complianceCredentials.get(id);
    if (!credential) return undefined;
    
    const updatedCredential: ComplianceCredential = {
      ...credential,
      ...updates,
      updatedAt: new Date()
    };
    this.complianceCredentials.set(id, updatedCredential);
    return updatedCredential;
  }
  
  // Vanuatu Entities
  async createVanuatuEntity(entity: InsertVanuatuEntity): Promise<VanuatuEntity> {
    const id = this.nextVanuatuEntityId++;
    const now = new Date();
    const newEntity: VanuatuEntity = {
      ...entity,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.vanuatuEntities.set(id, newEntity);
    return newEntity;
  }

  async getVanuatuEntity(id: number): Promise<VanuatuEntity | undefined> {
    return this.vanuatuEntities.get(id);
  }

  async getVanuatuEntitiesByCredentialId(credentialId: number): Promise<VanuatuEntity[]> {
    return Array.from(this.vanuatuEntities.values())
      .filter(entity => entity.credentialId === credentialId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getVanuatuEntitiesWithUpcomingFilings(daysThreshold: number): Promise<VanuatuEntity[]> {
    const now = new Date();
    const thresholdDate = new Date(now);
    thresholdDate.setDate(now.getDate() + daysThreshold);
    
    return Array.from(this.vanuatuEntities.values())
      .filter(entity => {
        if (!entity.annualFilingDueDate) return false;
        const dueDate = new Date(entity.annualFilingDueDate);
        return dueDate <= thresholdDate && dueDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(a.annualFilingDueDate!);
        const dateB = new Date(b.annualFilingDueDate!);
        return dateA.getTime() - dateB.getTime(); // Sort by closest due date first
      });
  }

  async updateVanuatuEntity(id: number, updates: Partial<VanuatuEntity>): Promise<VanuatuEntity | undefined> {
    const entity = this.vanuatuEntities.get(id);
    if (!entity) return undefined;
    
    const updatedEntity: VanuatuEntity = {
      ...entity,
      ...updates,
      updatedAt: new Date()
    };
    this.vanuatuEntities.set(id, updatedEntity);
    return updatedEntity;
  }
  
  // Vanuatu Licenses
  async createVanuatuLicense(license: InsertVanuatuLicense): Promise<VanuatuLicense> {
    const id = this.nextVanuatuLicenseId++;
    const now = new Date();
    const newLicense: VanuatuLicense = {
      ...license,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.vanuatuLicenses.set(id, newLicense);
    return newLicense;
  }

  async getVanuatuLicense(id: number): Promise<VanuatuLicense | undefined> {
    return this.vanuatuLicenses.get(id);
  }

  async getVanuatuLicensesByEntityId(entityId: number): Promise<VanuatuLicense[]> {
    return Array.from(this.vanuatuLicenses.values())
      .filter(license => license.entityId === entityId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getVanuatuLicensesByCredentialId(credentialId: number): Promise<VanuatuLicense[]> {
    return Array.from(this.vanuatuLicenses.values())
      .filter(license => license.credentialId === credentialId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getVanuatuLicensesNearingExpiration(daysThreshold: number): Promise<VanuatuLicense[]> {
    const now = new Date();
    const thresholdDate = new Date(now);
    thresholdDate.setDate(now.getDate() + daysThreshold);
    
    return Array.from(this.vanuatuLicenses.values())
      .filter(license => {
        if (!license.expiryDate) return false;
        const expiryDate = new Date(license.expiryDate);
        return expiryDate <= thresholdDate && expiryDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(a.expiryDate!);
        const dateB = new Date(b.expiryDate!);
        return dateA.getTime() - dateB.getTime(); // Sort by closest expiry date first
      });
  }

  async updateVanuatuLicense(id: number, updates: Partial<VanuatuLicense>): Promise<VanuatuLicense | undefined> {
    const license = this.vanuatuLicenses.get(id);
    if (!license) return undefined;
    
    const updatedLicense: VanuatuLicense = {
      ...license,
      ...updates,
      updatedAt: new Date()
    };
    this.vanuatuLicenses.set(id, updatedLicense);
    return updatedLicense;
  }
  
  // Compliance Reports
  async createComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport> {
    const id = this.nextComplianceReportId++;
    const now = new Date();
    const newReport: ComplianceReport = {
      ...report,
      id,
      createdAt: now,
      updatedAt: now,
      webhookSent: false
    };
    this.complianceReports.set(id, newReport);
    return newReport;
  }

  async getComplianceReport(id: number): Promise<ComplianceReport | undefined> {
    return this.complianceReports.get(id);
  }

  async getComplianceReportsByEntityId(entityId: number): Promise<ComplianceReport[]> {
    return Array.from(this.complianceReports.values())
      .filter(report => report.entityId === entityId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getComplianceReportsByLicenseId(licenseId: number): Promise<ComplianceReport[]> {
    return Array.from(this.complianceReports.values())
      .filter(report => report.licenseId === licenseId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async updateComplianceReport(id: number, updates: Partial<ComplianceReport>): Promise<ComplianceReport | undefined> {
    const report = this.complianceReports.get(id);
    if (!report) return undefined;
    
    const updatedReport: ComplianceReport = {
      ...report,
      ...updates,
      updatedAt: new Date()
    };
    this.complianceReports.set(id, updatedReport);
    return updatedReport;
  }

  async updateComplianceReportWebhookStatus(id: number, sent: boolean): Promise<ComplianceReport | undefined> {
    const report = this.complianceReports.get(id);
    if (!report) return undefined;
    
    const updatedReport: ComplianceReport = {
      ...report,
      webhookSent: sent,
      updatedAt: new Date()
    };
    this.complianceReports.set(id, updatedReport);
    return updatedReport;
  }

  // Finance/Tax/Insurance Module Methods
  async createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction> {
    const id = this.nextFinancialTransactionId++;
    const now = new Date();
    const newTransaction: FinancialTransaction = {
      ...transaction,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.financialTransactions.set(id, newTransaction);
    return newTransaction;
  }

  async getFinancialTransactionsByUserId(userId: number): Promise<FinancialTransaction[]> {
    return Array.from(this.financialTransactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined> {
    return this.financialTransactions.get(id);
  }

  async updateFinancialTransaction(id: number, updates: Partial<FinancialTransaction>): Promise<FinancialTransaction | undefined> {
    const transaction = this.financialTransactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction: FinancialTransaction = {
      ...transaction,
      ...updates,
      updatedAt: new Date()
    };
    this.financialTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getFinancialTransactionsByMerkleRoot(merkleRoot: string): Promise<FinancialTransaction[]> {
    return Array.from(this.financialTransactions.values())
      .filter(transaction => transaction.merkleRoot === merkleRoot)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async logApiFirewallEvent(log: InsertApiFirewallLog): Promise<ApiFirewallLog> {
    const id = this.nextApiFirewallLogId++;
    const now = new Date();
    const newLog: ApiFirewallLog = {
      ...log,
      id,
      timestamp: now
    };
    this.apiFirewallLogs.set(id, newLog);
    return newLog;
  }

  async getApiFirewallLogsByUserId(userId: number): Promise<ApiFirewallLog[]> {
    return Array.from(this.apiFirewallLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getApiFirewallLogsByPath(path: string): Promise<ApiFirewallLog[]> {
    return Array.from(this.apiFirewallLogs.values())
      .filter(log => log.path === path)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createInsurancePolicy(policy: InsertInsurancePolicy): Promise<InsurancePolicy> {
    const id = this.nextInsurancePolicyId++;
    const now = new Date();
    const newPolicy: InsurancePolicy = {
      ...policy,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.insurancePolicies.set(id, newPolicy);
    return newPolicy;
  }

  async getInsurancePoliciesByUserId(userId: number): Promise<InsurancePolicy[]> {
    return Array.from(this.insurancePolicies.values())
      .filter(policy => policy.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getInsurancePolicy(id: number): Promise<InsurancePolicy | undefined> {
    return this.insurancePolicies.get(id);
  }

  async updateInsurancePolicy(id: number, updates: Partial<InsurancePolicy>): Promise<InsurancePolicy | undefined> {
    const policy = this.insurancePolicies.get(id);
    if (!policy) return undefined;
    
    const updatedPolicy: InsurancePolicy = {
      ...policy,
      ...updates,
      updatedAt: new Date()
    };
    this.insurancePolicies.set(id, updatedPolicy);
    return updatedPolicy;
  }

  // Real Estate Module Methods
  async createPropertyDocument(document: InsertPropertyDocument): Promise<PropertyDocument> {
    const id = this.nextPropertyDocumentId++;
    const now = new Date();
    const newDocument: PropertyDocument = {
      ...document,
      id,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
      accessCount: 0
    };
    this.propertyDocuments.set(id, newDocument);
    return newDocument;
  }

  async getPropertyDocumentsByUserId(userId: number): Promise<PropertyDocument[]> {
    return Array.from(this.propertyDocuments.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPropertyDocumentsByPropertyId(propertyId: string): Promise<PropertyDocument[]> {
    return Array.from(this.propertyDocuments.values())
      .filter(doc => doc.propertyId === propertyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPropertyDocument(id: number): Promise<PropertyDocument | undefined> {
    return this.propertyDocuments.get(id);
  }

  async updatePropertyDocument(id: number, updates: Partial<PropertyDocument>): Promise<PropertyDocument | undefined> {
    const document = this.propertyDocuments.get(id);
    if (!document) return undefined;
    
    const updatedDocument: PropertyDocument = {
      ...document,
      ...updates,
      updatedAt: new Date()
    };
    this.propertyDocuments.set(id, updatedDocument);
    return updatedDocument;
  }

  async logDocumentAccess(id: number, userId: number, actionType: string): Promise<PropertyDocument | undefined> {
    const document = this.propertyDocuments.get(id);
    if (!document) return undefined;
    
    const updatedDocument: PropertyDocument = {
      ...document,
      accessCount: document.accessCount + 1,
      lastAccessedAt: new Date(),
      accessLog: [...(document.accessLog || []), { userId, timestamp: new Date(), actionType }]
    };
    this.propertyDocuments.set(id, updatedDocument);
    return updatedDocument;
  }

  async createPropertyTag(tag: InsertPropertyTag): Promise<PropertyTag> {
    const id = this.nextPropertyTagId++;
    const now = new Date();
    const newTag: PropertyTag = {
      ...tag,
      id,
      createdAt: now,
      lastScannedAt: null,
      scanCount: 0
    };
    this.propertyTags.set(id, newTag);
    return newTag;
  }

  async getPropertyTagsByPropertyId(propertyId: string): Promise<PropertyTag[]> {
    return Array.from(this.propertyTags.values())
      .filter(tag => tag.propertyId === propertyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPropertyTag(id: number): Promise<PropertyTag | undefined> {
    return this.propertyTags.get(id);
  }

  async getPropertyTagByUid(tagUid: string): Promise<PropertyTag | undefined> {
    return Array.from(this.propertyTags.values())
      .find(tag => tag.tagUid === tagUid);
  }

  async updatePropertyTag(id: number, updates: Partial<PropertyTag>): Promise<PropertyTag | undefined> {
    const tag = this.propertyTags.get(id);
    if (!tag) return undefined;
    
    const updatedTag: PropertyTag = {
      ...tag,
      ...updates
    };
    this.propertyTags.set(id, updatedTag);
    return updatedTag;
  }

  async logTagScan(id: number): Promise<PropertyTag | undefined> {
    const tag = this.propertyTags.get(id);
    if (!tag) return undefined;
    
    const updatedTag: PropertyTag = {
      ...tag,
      scanCount: tag.scanCount + 1,
      lastScannedAt: new Date()
    };
    this.propertyTags.set(id, updatedTag);
    return updatedTag;
  }

  async createPropertyVerification(verification: InsertPropertyVerification): Promise<PropertyVerification> {
    const id = this.nextPropertyVerificationId++;
    const now = new Date();
    const newVerification: PropertyVerification = {
      ...verification,
      id,
      createdAt: now,
      completedAt: null
    };
    this.propertyVerifications.set(id, newVerification);
    return newVerification;
  }

  async getPropertyVerificationsByPropertyId(propertyId: string): Promise<PropertyVerification[]> {
    return Array.from(this.propertyVerifications.values())
      .filter(verification => verification.propertyId === propertyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPropertyVerification(id: number): Promise<PropertyVerification | undefined> {
    return this.propertyVerifications.get(id);
  }

  async updatePropertyVerification(id: number, updates: Partial<PropertyVerification>): Promise<PropertyVerification | undefined> {
    const verification = this.propertyVerifications.get(id);
    if (!verification) return undefined;
    
    const updatedVerification: PropertyVerification = {
      ...verification,
      ...updates
    };
    this.propertyVerifications.set(id, updatedVerification);
    return updatedVerification;
  }

  // Business Credit Module Methods
  async createBusinessCreditProfile(profile: InsertBusinessCreditProfile): Promise<BusinessCreditProfile> {
    const id = this.nextBusinessCreditProfileId++;
    const now = new Date();
    const newProfile: BusinessCreditProfile = {
      ...profile,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.businessCreditProfiles.set(id, newProfile);
    return newProfile;
  }

  async getBusinessCreditProfileByUserId(userId: number): Promise<BusinessCreditProfile | undefined> {
    return Array.from(this.businessCreditProfiles.values())
      .find(profile => profile.userId === userId);
  }

  async getBusinessCreditProfile(id: number): Promise<BusinessCreditProfile | undefined> {
    return this.businessCreditProfiles.get(id);
  }

  async updateBusinessCreditProfile(id: number, updates: Partial<BusinessCreditProfile>): Promise<BusinessCreditProfile | undefined> {
    const profile = this.businessCreditProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile: BusinessCreditProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date()
    };
    this.businessCreditProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async getBusinessCreditProfileByBusinessName(businessName: string): Promise<BusinessCreditProfile | undefined> {
    return Array.from(this.businessCreditProfiles.values())
      .find(profile => profile.businessName === businessName);
  }

  async createCreditEnrichmentLog(log: InsertCreditEnrichmentLog): Promise<CreditEnrichmentLog> {
    const id = this.nextCreditEnrichmentLogId++;
    const now = new Date();
    const newLog: CreditEnrichmentLog = {
      ...log,
      id,
      timestamp: now
    };
    this.creditEnrichmentLogs.set(id, newLog);
    return newLog;
  }

  async getCreditEnrichmentLogsByProfileId(profileId: number): Promise<CreditEnrichmentLog[]> {
    return Array.from(this.creditEnrichmentLogs.values())
      .filter(log => log.profileId === profileId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getCreditEnrichmentLog(id: number): Promise<CreditEnrichmentLog | undefined> {
    return this.creditEnrichmentLogs.get(id);
  }

  async createZkpCreditProof(proof: InsertZkpCreditProof): Promise<ZkpCreditProof> {
    const id = this.nextZkpCreditProofId++;
    const now = new Date();
    const newProof: ZkpCreditProof = {
      ...proof,
      id,
      createdAt: now,
      verifiedAt: null,
      verified: false
    };
    this.zkpCreditProofs.set(id, newProof);
    return newProof;
  }

  async getZkpCreditProofsByProfileId(profileId: number): Promise<ZkpCreditProof[]> {
    return Array.from(this.zkpCreditProofs.values())
      .filter(proof => proof.profileId === profileId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getZkpCreditProof(id: number): Promise<ZkpCreditProof | undefined> {
    return this.zkpCreditProofs.get(id);
  }

  async getZkpCreditProofByPublicIdentifier(publicIdentifier: string): Promise<ZkpCreditProof | undefined> {
    return Array.from(this.zkpCreditProofs.values())
      .find(proof => proof.publicIdentifier === publicIdentifier);
  }

  async verifyZkpCreditProof(id: number): Promise<ZkpCreditProof | undefined> {
    const proof = this.zkpCreditProofs.get(id);
    if (!proof) return undefined;
    
    const updatedProof: ZkpCreditProof = {
      ...proof,
      verified: true,
      verifiedAt: new Date()
    };
    this.zkpCreditProofs.set(id, updatedProof);
    return updatedProof;
  }
}

export const storage = new MemStorage();
