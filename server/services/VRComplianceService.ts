/**
 * VR Compliance Service - vr4deaf.org
 * 
 * Vocational Rehabilitation Vendor Compliance Service
 * 
 * Handles:
 * - State VR agency regulations compliance
 * - Authorization and billing protocols
 * - Case management integration
 * - Audit logging for compliance
 * - Progress reporting requirements
 */

import crypto from 'crypto';

// ==================== Types ====================

export type VRState = 
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'FL' | 'GA'
  | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME' | 'MD'
  | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH' | 'NJ'
  | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI' | 'SC'
  | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' | 'WY'
  | 'DC' | 'PR' | 'VI' | 'GU';

export type ServiceCategory = 
  | 'ASSESSMENT'
  | 'TRAINING'
  | 'JOB_PLACEMENT'
  | 'SUPPORTED_EMPLOYMENT'
  | 'COUNSELING'
  | 'ASSISTIVE_TECHNOLOGY'
  | 'INTERPRETER_SERVICES'
  | 'TRANSITION_SERVICES';

export type AuthorizationStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'DENIED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface VRAgency {
  state: VRState;
  name: string;
  agencyCode: string;
  contactEmail: string;
  portalUrl?: string;
  requiresEDI: boolean;
  billingFormat: 'CMS-1500' | 'UB-04' | 'CUSTOM';
}

export interface VRClient {
  id: string;
  firstName: string;
  lastName: string;
  caseNumber: string;
  state: VRState;
  counselorId: string;
  ipr: IndividualPlanForRehab;
  accommodations: DeafAccommodation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IndividualPlanForRehab {
  id: string;
  clientId: string;
  employmentGoal: string;
  services: PlannedService[];
  startDate: Date;
  reviewDate: Date;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
}

export interface PlannedService {
  id: string;
  category: ServiceCategory;
  description: string;
  provider: string;
  authorizedUnits: number;
  usedUnits: number;
  unitRate: number;
  startDate: Date;
  endDate: Date;
}

export interface DeafAccommodation {
  type: 'ASL_INTERPRETER' | 'CART' | 'VRI' | 'ASSISTIVE_LISTENING' | 'VISUAL_ALERTS' | 'CAPTIONING';
  required: boolean;
  notes?: string;
}

export interface Authorization {
  id: string;
  clientId: string;
  serviceCategory: ServiceCategory;
  authorizedAmount: number;
  usedAmount: number;
  status: AuthorizationStatus;
  startDate: Date;
  endDate: Date;
  counselorApproval: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceDelivery {
  id: string;
  authorizationId: string;
  clientId: string;
  serviceDate: Date;
  serviceCategory: ServiceCategory;
  units: number;
  description: string;
  accommodationsUsed: DeafAccommodation[];
  outcome?: string;
  signedByClient: boolean;
  createdAt: Date;
}

export interface ProgressReport {
  id: string;
  clientId: string;
  reportingPeriod: {
    start: Date;
    end: Date;
  };
  servicesProvided: ServiceDelivery[];
  progressTowardGoal: string;
  barriers?: string;
  recommendations?: string;
  nextSteps: string;
  createdAt: Date;
  submittedAt?: Date;
}

export interface ComplianceCheck {
  id: string;
  checkType: 'AUTHORIZATION' | 'BILLING' | 'DOCUMENTATION' | 'DEADLINE';
  passed: boolean;
  message: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  timestamp: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'CLIENT' | 'AUTHORIZATION' | 'SERVICE' | 'REPORT';
  entityId: string;
  userId: string;
  ipAddress?: string;
  details: Record<string, any>;
  timestamp: Date;
}

// ==================== State VR Agency Configurations ====================

const STATE_VR_AGENCIES: Partial<Record<VRState, VRAgency>> = {
  CA: {
    state: 'CA',
    name: 'California Department of Rehabilitation',
    agencyCode: 'CA-DOR',
    contactEmail: 'vendor@dor.ca.gov',
    portalUrl: 'https://www.dor.ca.gov/vendors',
    requiresEDI: true,
    billingFormat: 'CMS-1500',
  },
  TX: {
    state: 'TX',
    name: 'Texas Workforce Commission - Vocational Rehabilitation',
    agencyCode: 'TX-TWC-VR',
    contactEmail: 'vr.vendors@twc.texas.gov',
    portalUrl: 'https://www.twc.texas.gov/partners/vocational-rehabilitation-providers',
    requiresEDI: true,
    billingFormat: 'CMS-1500',
  },
  NY: {
    state: 'NY',
    name: 'ACCES-VR (Adult Career and Continuing Education Services)',
    agencyCode: 'NY-ACCES-VR',
    contactEmail: 'accesvr@nysed.gov',
    portalUrl: 'https://www.acces.nysed.gov/vr',
    requiresEDI: false,
    billingFormat: 'CUSTOM',
  },
  FL: {
    state: 'FL',
    name: 'Florida Division of Vocational Rehabilitation',
    agencyCode: 'FL-DVR',
    contactEmail: 'dvr.vendors@dbs.fldoe.org',
    portalUrl: 'https://www.rehabworks.org/',
    requiresEDI: true,
    billingFormat: 'CMS-1500',
  },
};

// ==================== VR Compliance Service ====================

export class VRComplianceService {
  private clients: Map<string, VRClient> = new Map();
  private authorizations: Map<string, Authorization> = new Map();
  private services: Map<string, ServiceDelivery> = new Map();
  private auditLogs: AuditLog[] = [];

  constructor() {}

  // ==================== Agency Methods ====================

  /**
   * Get VR agency configuration for a state
   */
  getAgencyConfig(state: VRState): VRAgency | null {
    return STATE_VR_AGENCIES[state] || null;
  }

  /**
   * List all configured state agencies
   */
  listConfiguredStates(): VRState[] {
    return Object.keys(STATE_VR_AGENCIES) as VRState[];
  }

  // ==================== Client Methods ====================

  /**
   * Register a new VR client
   */
  registerClient(
    firstName: string,
    lastName: string,
    caseNumber: string,
    state: VRState,
    counselorId: string,
    accommodations: DeafAccommodation[]
  ): VRClient {
    const id = this.generateId('client');
    
    const client: VRClient = {
      id,
      firstName,
      lastName,
      caseNumber,
      state,
      counselorId,
      ipr: {
        id: this.generateId('ipr'),
        clientId: id,
        employmentGoal: '',
        services: [],
        startDate: new Date(),
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        status: 'DRAFT',
      },
      accommodations,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.clients.set(id, client);
    this.logAudit('CREATE', 'CLIENT', id, 'system', { state, caseNumber });

    return client;
  }

  /**
   * Get client by ID
   */
  getClient(clientId: string): VRClient | null {
    return this.clients.get(clientId) || null;
  }

  // ==================== Authorization Methods ====================

  /**
   * Create service authorization
   */
  createAuthorization(
    clientId: string,
    serviceCategory: ServiceCategory,
    amount: number,
    startDate: Date,
    endDate: Date
  ): Authorization {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const id = this.generateId('auth');
    
    const authorization: Authorization = {
      id,
      clientId,
      serviceCategory,
      authorizedAmount: amount,
      usedAmount: 0,
      status: 'PENDING',
      startDate,
      endDate,
      counselorApproval: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.authorizations.set(id, authorization);
    this.logAudit('CREATE', 'AUTHORIZATION', id, 'system', { 
      clientId, 
      serviceCategory, 
      amount 
    });

    return authorization;
  }

  /**
   * Approve authorization
   */
  approveAuthorization(authId: string, counselorId: string): Authorization {
    const auth = this.authorizations.get(authId);
    if (!auth) {
      throw new Error('Authorization not found');
    }

    auth.status = 'APPROVED';
    auth.counselorApproval = true;
    auth.updatedAt = new Date();

    this.logAudit('APPROVE', 'AUTHORIZATION', authId, counselorId, { 
      previousStatus: 'PENDING' 
    });

    return auth;
  }

  /**
   * Check authorization availability
   */
  checkAuthorization(authId: string, requestedUnits: number): ComplianceCheck {
    const auth = this.authorizations.get(authId);
    
    if (!auth) {
      return {
        id: this.generateId('check'),
        checkType: 'AUTHORIZATION',
        passed: false,
        message: 'Authorization not found',
        severity: 'ERROR',
        timestamp: new Date(),
      };
    }

    if (auth.status !== 'APPROVED') {
      return {
        id: this.generateId('check'),
        checkType: 'AUTHORIZATION',
        passed: false,
        message: `Authorization is ${auth.status}`,
        severity: 'ERROR',
        timestamp: new Date(),
      };
    }

    const now = new Date();
    if (now < auth.startDate || now > auth.endDate) {
      return {
        id: this.generateId('check'),
        checkType: 'AUTHORIZATION',
        passed: false,
        message: 'Authorization is outside valid date range',
        severity: 'ERROR',
        timestamp: new Date(),
      };
    }

    const availableUnits = auth.authorizedAmount - auth.usedAmount;
    if (requestedUnits > availableUnits) {
      return {
        id: this.generateId('check'),
        checkType: 'AUTHORIZATION',
        passed: false,
        message: `Insufficient units. Available: ${availableUnits}, Requested: ${requestedUnits}`,
        severity: 'ERROR',
        timestamp: new Date(),
      };
    }

    return {
      id: this.generateId('check'),
      checkType: 'AUTHORIZATION',
      passed: true,
      message: `Authorization valid. ${availableUnits} units available`,
      severity: 'INFO',
      timestamp: new Date(),
    };
  }

  // ==================== Service Delivery Methods ====================

  /**
   * Record service delivery
   */
  recordService(
    authorizationId: string,
    serviceDate: Date,
    units: number,
    description: string,
    accommodationsUsed: DeafAccommodation[]
  ): ServiceDelivery {
    const auth = this.authorizations.get(authorizationId);
    if (!auth) {
      throw new Error('Authorization not found');
    }

    // Check authorization
    const check = this.checkAuthorization(authorizationId, units);
    if (!check.passed) {
      throw new Error(check.message);
    }

    const id = this.generateId('service');
    
    const service: ServiceDelivery = {
      id,
      authorizationId,
      clientId: auth.clientId,
      serviceDate,
      serviceCategory: auth.serviceCategory,
      units,
      description,
      accommodationsUsed,
      signedByClient: false,
      createdAt: new Date(),
    };

    this.services.set(id, service);
    
    // Update authorization used amount
    auth.usedAmount += units;
    auth.updatedAt = new Date();

    this.logAudit('CREATE', 'SERVICE', id, 'system', {
      authorizationId,
      units,
      serviceCategory: auth.serviceCategory,
    });

    return service;
  }

  /**
   * Client signature for service
   */
  signService(serviceId: string, clientId: string): ServiceDelivery {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    if (service.clientId !== clientId) {
      throw new Error('Client ID mismatch');
    }

    service.signedByClient = true;
    this.logAudit('SIGN', 'SERVICE', serviceId, clientId, {});

    return service;
  }

  // ==================== Reporting Methods ====================

  /**
   * Generate progress report
   */
  generateProgressReport(
    clientId: string,
    startDate: Date,
    endDate: Date,
    progressTowardGoal: string,
    nextSteps: string,
    barriers?: string,
    recommendations?: string
  ): ProgressReport {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Get services for this period
    const servicesProvided = Array.from(this.services.values())
      .filter(s => 
        s.clientId === clientId &&
        s.serviceDate >= startDate &&
        s.serviceDate <= endDate
      );

    const id = this.generateId('report');

    const report: ProgressReport = {
      id,
      clientId,
      reportingPeriod: { start: startDate, end: endDate },
      servicesProvided,
      progressTowardGoal,
      barriers,
      recommendations,
      nextSteps,
      createdAt: new Date(),
    };

    this.logAudit('CREATE', 'REPORT', id, 'system', {
      clientId,
      servicesCount: servicesProvided.length,
    });

    return report;
  }

  // ==================== Compliance Checks ====================

  /**
   * Run comprehensive compliance check
   */
  runComplianceCheck(clientId: string): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const client = this.clients.get(clientId);

    if (!client) {
      checks.push({
        id: this.generateId('check'),
        checkType: 'DOCUMENTATION',
        passed: false,
        message: 'Client not found',
        severity: 'CRITICAL',
        timestamp: new Date(),
      });
      return checks;
    }

    // Check IPR status
    if (client.ipr.status === 'DRAFT') {
      checks.push({
        id: this.generateId('check'),
        checkType: 'DOCUMENTATION',
        passed: false,
        message: 'IPR is still in draft status',
        severity: 'WARNING',
        timestamp: new Date(),
      });
    }

    // Check IPR review date
    if (new Date() > client.ipr.reviewDate) {
      checks.push({
        id: this.generateId('check'),
        checkType: 'DEADLINE',
        passed: false,
        message: 'IPR review is overdue',
        severity: 'ERROR',
        timestamp: new Date(),
      });
    }

    // Check accommodations
    if (client.accommodations.length === 0) {
      checks.push({
        id: this.generateId('check'),
        checkType: 'DOCUMENTATION',
        passed: false,
        message: 'No accommodations documented for Deaf client',
        severity: 'WARNING',
        timestamp: new Date(),
      });
    }

    // Check authorizations
    const clientAuths = Array.from(this.authorizations.values())
      .filter(a => a.clientId === clientId);

    const expiredAuths = clientAuths.filter(a => 
      a.status === 'APPROVED' && new Date() > a.endDate
    );

    if (expiredAuths.length > 0) {
      checks.push({
        id: this.generateId('check'),
        checkType: 'AUTHORIZATION',
        passed: false,
        message: `${expiredAuths.length} authorization(s) have expired`,
        severity: 'WARNING',
        timestamp: new Date(),
      });
    }

    // Check unsigned services
    const unsignedServices = Array.from(this.services.values())
      .filter(s => s.clientId === clientId && !s.signedByClient);

    if (unsignedServices.length > 0) {
      checks.push({
        id: this.generateId('check'),
        checkType: 'DOCUMENTATION',
        passed: false,
        message: `${unsignedServices.length} service(s) pending client signature`,
        severity: 'WARNING',
        timestamp: new Date(),
      });
    }

    // All checks passed if no issues found
    if (checks.length === 0) {
      checks.push({
        id: this.generateId('check'),
        checkType: 'DOCUMENTATION',
        passed: true,
        message: 'All compliance checks passed',
        severity: 'INFO',
        timestamp: new Date(),
      });
    }

    return checks;
  }

  // ==================== Audit Methods ====================

  /**
   * Get audit logs for an entity
   */
  getAuditLogs(entityType: string, entityId: string): AuditLog[] {
    return this.auditLogs.filter(
      log => log.entityType === entityType && log.entityId === entityId
    );
  }

  /**
   * Log audit entry
   */
  private logAudit(
    action: string,
    entityType: 'CLIENT' | 'AUTHORIZATION' | 'SERVICE' | 'REPORT',
    entityId: string,
    userId: string,
    details: Record<string, any>
  ): void {
    this.auditLogs.push({
      id: this.generateId('audit'),
      action,
      entityType,
      entityId,
      userId,
      details,
      timestamp: new Date(),
    });
  }

  // ==================== Helper Methods ====================

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }
}

// ==================== Export Singleton ====================

export const vrComplianceService = new VRComplianceService();
