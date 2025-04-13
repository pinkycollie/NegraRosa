import { 
  User, InsertUser, 
  Verification, InsertVerification, 
  Reputation, InsertReputation,
  Transaction, InsertTransaction,
  RiskAssessment, InsertRiskAssessment,
  Claim, InsertClaim,
  EntrepreneurProfile, InsertEntrepreneurProfile,
  JsonDataUpload, InsertJsonDataUpload,
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
  
  private nextUserId: number;
  private nextVerificationId: number;
  private nextReputationId: number;
  private nextTransactionId: number;
  private nextRiskAssessmentId: number;
  private nextClaimId: number;
  private nextEntrepreneurProfileId: number;
  private nextJsonDataUploadId: number;

  constructor() {
    this.users = new Map();
    this.verifications = new Map();
    this.reputations = new Map();
    this.transactions = new Map();
    this.riskAssessments = new Map();
    this.claims = new Map();
    this.entrepreneurProfiles = new Map();
    this.jsonDataUploads = new Map();
    
    this.nextUserId = 1;
    this.nextVerificationId = 1;
    this.nextReputationId = 1;
    this.nextTransactionId = 1;
    this.nextRiskAssessmentId = 1;
    this.nextClaimId = 1;
    this.nextEntrepreneurProfileId = 1;
    this.nextJsonDataUploadId = 1;
    
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
}

export const storage = new MemStorage();
