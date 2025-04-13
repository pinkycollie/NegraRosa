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
  VerificationType
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export const storage = new MemStorage();
