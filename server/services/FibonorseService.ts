import { pasetoService, PasetoTokenResult, PasetoPayload } from './PasetoService';
import { storage } from '../storage';
import * as crypto from 'crypto';

/**
 * Fibonorse Integration Service
 * 
 * Fibonorse is a Norse mythology-inspired authentication and verification
 * framework that uses Fibonacci-based security patterns.
 * 
 * Key features:
 * - Fibonacci sequence-based authentication challenges
 * - Multi-layer verification (9 layers inspired by Norse cosmology)
 * - PASETO-based secure tokens
 * - Rune-based visual authentication
 * - Progressive trust building
 */

// Norse realms representing different trust levels
export enum NorseRealm {
  HELHEIM = 1,      // Lowest trust - new/unverified
  NIFLHEIM = 2,     // Minimal verification
  MUSPELHEIM = 3,   // Basic verification
  JOTUNHEIM = 4,    // Standard verification
  VANAHEIM = 5,     // Enhanced verification
  ALFHEIM = 6,      // High verification
  SVARTALFHEIM = 7, // Advanced verification
  MIDGARD = 8,      // Full verification
  ASGARD = 9,       // Maximum trust - fully verified
}

// Fibonacci sequence positions for challenge generation
const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

// Fibonorse user trust profile
export interface FibonorseTrustProfile {
  userId: number;
  realm: NorseRealm;
  trustScore: number;
  fibonacciLevel: number;
  verificationPath: string[];  // History of verification steps
  runeBindings: string[];      // Associated rune patterns
  oathsTaken: number;          // Verification commitments completed
  lastAscension: Date | null;  // Last trust level increase
  createdAt: Date;
  updatedAt: Date;
}

// Rune challenge for visual authentication
export interface RuneChallenge {
  id: string;
  runes: string[];
  pattern: number[];
  fibonacciPosition: number;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

// Verification oath (commitment to authenticity)
export interface VerificationOath {
  id: string;
  userId: number;
  oathType: 'identity' | 'intent' | 'truthfulness' | 'commitment';
  statement: string;
  signedAt: Date;
  witnessId?: number;
  fibonacciSeal: string;
}

// Fibonorse authentication result
export interface FibonorseResult {
  success: boolean;
  message?: string;
  token?: string;
  userId?: number;
  realm?: NorseRealm;
  realmName?: string;
  trustScore?: number;
  nextAscensionRequirements?: string[];
  error?: string;
}

// Elder Futhark runes
const ELDER_FUTHARK: Record<string, { name: string; meaning: string }> = {
  'ᚠ': { name: 'Fehu', meaning: 'Wealth' },
  'ᚢ': { name: 'Uruz', meaning: 'Strength' },
  'ᚦ': { name: 'Thurisaz', meaning: 'Protection' },
  'ᚨ': { name: 'Ansuz', meaning: 'Wisdom' },
  'ᚱ': { name: 'Raidho', meaning: 'Journey' },
  'ᚲ': { name: 'Kenaz', meaning: 'Knowledge' },
  'ᚷ': { name: 'Gebo', meaning: 'Gift' },
  'ᚹ': { name: 'Wunjo', meaning: 'Joy' },
  'ᚺ': { name: 'Hagalaz', meaning: 'Disruption' },
  'ᚾ': { name: 'Nauthiz', meaning: 'Need' },
  'ᛁ': { name: 'Isa', meaning: 'Ice' },
  'ᛃ': { name: 'Jera', meaning: 'Harvest' },
  'ᛇ': { name: 'Eihwaz', meaning: 'Defense' },
  'ᛈ': { name: 'Perthro', meaning: 'Fate' },
  'ᛉ': { name: 'Algiz', meaning: 'Protection' },
  'ᛊ': { name: 'Sowilo', meaning: 'Sun' },
  'ᛏ': { name: 'Tiwaz', meaning: 'Victory' },
  'ᛒ': { name: 'Berkano', meaning: 'Growth' },
  'ᛖ': { name: 'Ehwaz', meaning: 'Movement' },
  'ᛗ': { name: 'Mannaz', meaning: 'Humanity' },
  'ᛚ': { name: 'Laguz', meaning: 'Water' },
  'ᛜ': { name: 'Ingwaz', meaning: 'Fertility' },
  'ᛞ': { name: 'Dagaz', meaning: 'Day' },
  'ᛟ': { name: 'Othala', meaning: 'Heritage' },
};

/**
 * FibonorseService - Norse mythology-inspired authentication
 */
export class FibonorseService {
  private profiles: Map<number, FibonorseTrustProfile> = new Map();
  private challenges: Map<string, RuneChallenge> = new Map();
  private oaths: Map<string, VerificationOath> = new Map();
  private challengeExpiry: number = 300000; // 5 minutes
  
  constructor() {
    // Clean up expired challenges periodically
    setInterval(() => this.cleanupExpiredChallenges(), 60000);
    console.log('Fibonorse service initialized');
  }
  
  /**
   * Get the realm name for a given realm level
   */
  private getRealmName(realm: NorseRealm): string {
    const names: Record<NorseRealm, string> = {
      [NorseRealm.HELHEIM]: 'Helheim',
      [NorseRealm.NIFLHEIM]: 'Niflheim',
      [NorseRealm.MUSPELHEIM]: 'Muspelheim',
      [NorseRealm.JOTUNHEIM]: 'Jotunheim',
      [NorseRealm.VANAHEIM]: 'Vanaheim',
      [NorseRealm.ALFHEIM]: 'Alfheim',
      [NorseRealm.SVARTALFHEIM]: 'Svartalfheim',
      [NorseRealm.MIDGARD]: 'Midgard',
      [NorseRealm.ASGARD]: 'Asgard',
    };
    return names[realm] || 'Unknown';
  }
  
  /**
   * Initialize or get a user's trust profile
   */
  async getProfile(userId: number): Promise<FibonorseTrustProfile> {
    if (this.profiles.has(userId)) {
      return this.profiles.get(userId)!;
    }
    
    const profile: FibonorseTrustProfile = {
      userId,
      realm: NorseRealm.HELHEIM,
      trustScore: 0,
      fibonacciLevel: 0,
      verificationPath: [],
      runeBindings: [],
      oathsTaken: 0,
      lastAscension: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.profiles.set(userId, profile);
    return profile;
  }
  
  /**
   * Authenticate with Fibonorse
   */
  async authenticate(
    userId: number,
    method: 'rune' | 'fibonacci' | 'oath',
    authData: any
  ): Promise<FibonorseResult> {
    try {
      const profile = await this.getProfile(userId);
      let authSuccess = false;
      
      switch (method) {
        case 'rune':
          authSuccess = await this.verifyRuneChallenge(authData.challengeId, authData.response);
          break;
        case 'fibonacci':
          authSuccess = await this.verifyFibonacciChallenge(userId, authData.sequence);
          break;
        case 'oath':
          authSuccess = await this.verifyOath(authData.oathId);
          break;
      }
      
      if (!authSuccess) {
        return {
          success: false,
          error: 'Authentication verification failed',
          message: 'The path to Asgard remains closed. Try again, warrior.',
        };
      }
      
      // Create PASETO token
      const tokenResult = await pasetoService.createIntegrationToken(
        'fibonorse',
        userId,
        this.getPermissionsForRealm(profile.realm),
        this.getTokenExpiryForRealm(profile.realm)
      );
      
      if (!tokenResult.success) {
        return {
          success: false,
          error: 'Failed to forge the token of passage',
        };
      }
      
      return {
        success: true,
        token: tokenResult.token,
        userId,
        realm: profile.realm,
        realmName: this.getRealmName(profile.realm),
        trustScore: profile.trustScore,
        nextAscensionRequirements: this.getAscensionRequirements(profile),
        message: `Welcome, traveler of ${this.getRealmName(profile.realm)}!`,
      };
    } catch (error) {
      console.error('Fibonorse authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'The runes have failed',
      };
    }
  }
  
  /**
   * Create a rune-based visual challenge
   */
  async createRuneChallenge(userId: number): Promise<{
    success: boolean;
    challenge?: RuneChallenge;
    error?: string;
  }> {
    try {
      const profile = await this.getProfile(userId);
      const id = crypto.randomBytes(16).toString('hex');
      
      // Number of runes based on Fibonacci position
      const fibPosition = Math.min(profile.fibonacciLevel + 2, FIBONACCI_SEQUENCE.length - 1);
      const runeCount = Math.min(FIBONACCI_SEQUENCE[fibPosition], 8);
      
      // Select random runes
      const runeKeys = Object.keys(ELDER_FUTHARK);
      const selectedRunes: string[] = [];
      for (let i = 0; i < runeCount; i++) {
        const randomIndex = Math.floor(Math.random() * runeKeys.length);
        selectedRunes.push(runeKeys[randomIndex]);
      }
      
      // Generate pattern based on Fibonacci sequence
      const pattern: number[] = [];
      for (let i = 0; i < runeCount; i++) {
        pattern.push(FIBONACCI_SEQUENCE[i % FIBONACCI_SEQUENCE.length] % runeCount);
      }
      
      const challenge: RuneChallenge = {
        id,
        runes: selectedRunes,
        pattern,
        fibonacciPosition: fibPosition,
        expiresAt: new Date(Date.now() + this.challengeExpiry),
        attempts: 0,
        maxAttempts: FIBONACCI_SEQUENCE[Math.min(profile.realm, 5)], // More attempts at higher realms
      };
      
      this.challenges.set(id, challenge);
      
      return {
        success: true,
        challenge: {
          ...challenge,
          pattern: undefined as any, // Don't send the pattern to the client
        },
      };
    } catch (error) {
      console.error('Error creating rune challenge:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to summon the runes',
      };
    }
  }
  
  /**
   * Verify a rune challenge response
   */
  private async verifyRuneChallenge(
    challengeId: string,
    response: number[]
  ): Promise<boolean> {
    const challenge = this.challenges.get(challengeId);
    
    if (!challenge) {
      return false;
    }
    
    if (challenge.expiresAt < new Date()) {
      this.challenges.delete(challengeId);
      return false;
    }
    
    challenge.attempts++;
    
    if (challenge.attempts > challenge.maxAttempts) {
      this.challenges.delete(challengeId);
      return false;
    }
    
    // Verify the pattern
    if (response.length !== challenge.pattern.length) {
      return false;
    }
    
    for (let i = 0; i < response.length; i++) {
      if (response[i] !== challenge.pattern[i]) {
        return false;
      }
    }
    
    this.challenges.delete(challengeId);
    return true;
  }
  
  /**
   * Create a Fibonacci sequence challenge
   */
  async createFibonacciChallenge(userId: number): Promise<{
    success: boolean;
    challenge?: { sequence: number[]; nextCount: number };
    error?: string;
  }> {
    try {
      const profile = await this.getProfile(userId);
      
      // Generate partial sequence based on realm
      const sequenceLength = Math.min(profile.realm + 2, 8);
      const sequence = FIBONACCI_SEQUENCE.slice(0, sequenceLength);
      
      // Number of next terms to provide
      const nextCount = Math.min(profile.realm, 3);
      
      return {
        success: true,
        challenge: {
          sequence,
          nextCount, // User needs to provide this many next numbers
        },
      };
    } catch (error) {
      console.error('Error creating Fibonacci challenge:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create challenge',
      };
    }
  }
  
  /**
   * Verify a Fibonacci sequence response
   */
  private async verifyFibonacciChallenge(
    userId: number,
    sequence: number[]
  ): Promise<boolean> {
    // Verify the sequence follows Fibonacci pattern
    for (let i = 2; i < sequence.length; i++) {
      if (sequence[i] !== sequence[i - 1] + sequence[i - 2]) {
        return false;
      }
    }
    
    // Must have at least 3 numbers
    if (sequence.length < 3) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Create a verification oath
   */
  async createOath(
    userId: number,
    oathType: VerificationOath['oathType'],
    statement: string
  ): Promise<{ success: boolean; oath?: VerificationOath; error?: string }> {
    try {
      const profile = await this.getProfile(userId);
      const id = crypto.randomBytes(16).toString('hex');
      
      // Create Fibonacci seal (hash with Fibonacci-based salt)
      const fibSalt = FIBONACCI_SEQUENCE.slice(0, profile.realm + 1).join('');
      const sealData = `${id}:${userId}:${oathType}:${statement}:${fibSalt}`;
      const fibonacciSeal = crypto.createHash('sha256').update(sealData).digest('hex');
      
      const oath: VerificationOath = {
        id,
        userId,
        oathType,
        statement,
        signedAt: new Date(),
        fibonacciSeal,
      };
      
      this.oaths.set(id, oath);
      
      // Update profile
      profile.oathsTaken++;
      profile.updatedAt = new Date();
      
      // Check for ascension
      await this.checkAndProcessAscension(userId);
      
      return {
        success: true,
        oath,
      };
    } catch (error) {
      console.error('Error creating oath:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to forge the oath',
      };
    }
  }
  
  /**
   * Verify an oath
   */
  private async verifyOath(oathId: string): Promise<boolean> {
    const oath = this.oaths.get(oathId);
    return oath !== undefined;
  }
  
  /**
   * Ascend to a higher realm
   */
  async ascend(userId: number): Promise<FibonorseResult> {
    try {
      const profile = await this.getProfile(userId);
      
      if (profile.realm >= NorseRealm.ASGARD) {
        return {
          success: false,
          message: 'You have already reached Asgard, the highest realm.',
          realm: profile.realm,
          realmName: this.getRealmName(profile.realm),
        };
      }
      
      // Check ascension requirements
      const requirements = this.getAscensionRequirements(profile);
      const met = this.checkAscensionRequirements(profile);
      
      if (!met) {
        return {
          success: false,
          message: 'You have not met the requirements to ascend.',
          nextAscensionRequirements: requirements,
          realm: profile.realm,
          realmName: this.getRealmName(profile.realm),
        };
      }
      
      // Process ascension
      const previousRealm = profile.realm;
      profile.realm = (profile.realm + 1) as NorseRealm;
      profile.trustScore += FIBONACCI_SEQUENCE[profile.realm];
      profile.fibonacciLevel = Math.min(profile.fibonacciLevel + 1, FIBONACCI_SEQUENCE.length - 1);
      profile.lastAscension = new Date();
      profile.verificationPath.push(`Ascended from ${this.getRealmName(previousRealm)} to ${this.getRealmName(profile.realm)}`);
      profile.updatedAt = new Date();
      
      // Create new token with elevated permissions
      const tokenResult = await pasetoService.createIntegrationToken(
        'fibonorse',
        userId,
        this.getPermissionsForRealm(profile.realm),
        this.getTokenExpiryForRealm(profile.realm)
      );
      
      return {
        success: true,
        token: tokenResult.token,
        userId,
        realm: profile.realm,
        realmName: this.getRealmName(profile.realm),
        trustScore: profile.trustScore,
        message: `Congratulations! You have ascended to ${this.getRealmName(profile.realm)}!`,
        nextAscensionRequirements: profile.realm < NorseRealm.ASGARD 
          ? this.getAscensionRequirements(profile)
          : undefined,
      };
    } catch (error) {
      console.error('Ascension error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'The Bifrost is closed',
      };
    }
  }
  
  /**
   * Check and process automatic ascension
   */
  private async checkAndProcessAscension(userId: number): Promise<boolean> {
    const profile = await this.getProfile(userId);
    
    if (profile.realm >= NorseRealm.ASGARD) {
      return false;
    }
    
    if (this.checkAscensionRequirements(profile)) {
      // Auto-ascend
      profile.realm = (profile.realm + 1) as NorseRealm;
      profile.trustScore += FIBONACCI_SEQUENCE[profile.realm];
      profile.lastAscension = new Date();
      profile.updatedAt = new Date();
      return true;
    }
    
    return false;
  }
  
  /**
   * Get ascension requirements for current realm
   */
  private getAscensionRequirements(profile: FibonorseTrustProfile): string[] {
    const requirements: string[] = [];
    const nextRealm = profile.realm + 1;
    const fibTarget = FIBONACCI_SEQUENCE[Math.min(nextRealm, FIBONACCI_SEQUENCE.length - 1)];
    
    if (profile.oathsTaken < fibTarget) {
      requirements.push(`Complete ${fibTarget - profile.oathsTaken} more verification oaths`);
    }
    
    if (profile.runeBindings.length < nextRealm) {
      requirements.push(`Bind ${nextRealm - profile.runeBindings.length} more runes to your identity`);
    }
    
    if (profile.trustScore < FIBONACCI_SEQUENCE[nextRealm - 1] * 10) {
      requirements.push(`Achieve a trust score of ${FIBONACCI_SEQUENCE[nextRealm - 1] * 10}`);
    }
    
    return requirements;
  }
  
  /**
   * Check if ascension requirements are met
   */
  private checkAscensionRequirements(profile: FibonorseTrustProfile): boolean {
    const nextRealm = profile.realm + 1;
    const fibTarget = FIBONACCI_SEQUENCE[Math.min(nextRealm, FIBONACCI_SEQUENCE.length - 1)];
    
    return (
      profile.oathsTaken >= fibTarget &&
      profile.runeBindings.length >= nextRealm &&
      profile.trustScore >= FIBONACCI_SEQUENCE[nextRealm - 1] * 10
    );
  }
  
  /**
   * Get permissions for a realm
   */
  private getPermissionsForRealm(realm: NorseRealm): string[] {
    const basePermissions = ['authenticate', 'profile:read'];
    
    if (realm >= NorseRealm.MUSPELHEIM) {
      basePermissions.push('profile:write');
    }
    
    if (realm >= NorseRealm.JOTUNHEIM) {
      basePermissions.push('verify:basic');
    }
    
    if (realm >= NorseRealm.VANAHEIM) {
      basePermissions.push('verify:standard');
    }
    
    if (realm >= NorseRealm.ALFHEIM) {
      basePermissions.push('verify:enhanced');
    }
    
    if (realm >= NorseRealm.SVARTALFHEIM) {
      basePermissions.push('manage:tokens');
    }
    
    if (realm >= NorseRealm.MIDGARD) {
      basePermissions.push('admin:basic');
    }
    
    if (realm >= NorseRealm.ASGARD) {
      basePermissions.push('admin:full', 'ascend:others');
    }
    
    return basePermissions;
  }
  
  /**
   * Get token expiry based on realm (higher realms get longer tokens)
   */
  private getTokenExpiryForRealm(realm: NorseRealm): number {
    // Base: 1 hour, multiplied by Fibonacci number for the realm
    return 3600 * FIBONACCI_SEQUENCE[Math.min(realm, FIBONACCI_SEQUENCE.length - 1)];
  }
  
  /**
   * Bind a rune to user identity
   */
  async bindRune(userId: number, rune: string): Promise<{
    success: boolean;
    runeInfo?: { name: string; meaning: string };
    error?: string;
  }> {
    try {
      if (!ELDER_FUTHARK[rune]) {
        return {
          success: false,
          error: 'Unknown rune',
        };
      }
      
      const profile = await this.getProfile(userId);
      
      if (profile.runeBindings.includes(rune)) {
        return {
          success: false,
          error: 'Rune already bound',
        };
      }
      
      profile.runeBindings.push(rune);
      profile.trustScore += FIBONACCI_SEQUENCE[profile.runeBindings.length - 1] || 1;
      profile.updatedAt = new Date();
      
      // Check for ascension
      await this.checkAndProcessAscension(userId);
      
      return {
        success: true,
        runeInfo: ELDER_FUTHARK[rune],
      };
    } catch (error) {
      console.error('Error binding rune:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bind rune',
      };
    }
  }
  
  /**
   * Get all available runes
   */
  getAvailableRunes(): Record<string, { name: string; meaning: string }> {
    return { ...ELDER_FUTHARK };
  }
  
  /**
   * Verify a Fibonorse token
   */
  async verifyToken(token: string): Promise<FibonorseResult> {
    const result = await pasetoService.verifyToken(token);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }
    
    const payload = result.payload;
    if (!payload || payload.service !== 'fibonorse') {
      return {
        success: false,
        error: 'Invalid Fibonorse token',
      };
    }
    
    const userId = parseInt(payload.sub || '0', 10);
    const profile = await this.getProfile(userId);
    
    return {
      success: true,
      userId,
      realm: profile.realm,
      realmName: this.getRealmName(profile.realm),
      trustScore: profile.trustScore,
    };
  }
  
  /**
   * Clean up expired challenges
   */
  private cleanupExpiredChallenges(): void {
    const now = new Date();
    const entries = Array.from(this.challenges.entries());
    for (const [id, challenge] of entries) {
      if (challenge.expiresAt < now) {
        this.challenges.delete(id);
      }
    }
  }
}

// Export singleton instance
export const fibonorseService = new FibonorseService();
