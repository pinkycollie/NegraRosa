import { storage } from "../storage";
import { WebhookService } from "./WebhookService";
import { 
  InsertComplianceCredential, 
  InsertVanuatuEntity, 
  InsertVanuatuLicense, 
  InsertComplianceReport,
  ComplianceCredential,
  VanuatuEntity,
  VanuatuLicense,
  ComplianceReport
} from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import { NotionService } from "./NotionService";

/**
 * Service for handling Vanuatu compliance-related operations
 */
export class VanuatuComplianceService {
  private webhookService: WebhookService;
  private notionService: NotionService | null;

  constructor() {
    this.webhookService = new WebhookService();
    
    // Conditional initialization for Notion integration
    try {
      this.notionService = new NotionService();
    } catch (error) {
      console.log("Notion service not available. Continuing without Notion integration.");
      this.notionService = null;
    }
  }

  /**
   * Create a new compliance credential
   */
  async createComplianceCredential(credential: InsertComplianceCredential): Promise<ComplianceCredential> {
    // Create the credential
    const newCredential = await storage.createComplianceCredential(credential);
    
    // Trigger webhook notification
    await this.webhookService.triggerWebhook(
      "compliance.credential.created", 
      {
        userId: credential.userId,
        jurisdictionCode: credential.jurisdictionCode,
        credentialType: credential.credentialType,
        status: credential.status,
        timestamp: new Date().toISOString()
      },
      credential.userId
    );
    
    return newCredential;
  }

  /**
   * Register a new Vanuatu entity
   */
  async registerVanuatuEntity(entity: InsertVanuatuEntity): Promise<VanuatuEntity> {
    // Create the entity record
    const newEntity = await storage.createVanuatuEntity(entity);
    
    // Get the credential information
    const credential = await storage.getComplianceCredential(entity.credentialId);
    if (!credential) {
      throw new Error("Credential not found");
    }
    
    // Trigger webhook notification
    await this.webhookService.triggerWebhook(
      "vanuatu.entity.registered",
      {
        entityId: newEntity.id,
        entityType: entity.entityType,
        registrationNumber: entity.registrationNumber,
        registeredName: entity.registeredName,
        userId: credential.userId,
        timestamp: new Date().toISOString()
      },
      credential.userId
    );
    
    // Create Notion record if available
    if (this.notionService) {
      try {
        await this.notionService.createVanuatuEntityRecord({
          entityId: newEntity.id.toString(),
          entityType: entity.entityType,
          registrationNumber: entity.registrationNumber,
          registeredName: entity.registeredName,
          status: "Active",
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Failed to create Notion record:", error);
        // Non-blocking - continue even if Notion fails
      }
    }
    
    return newEntity;
  }

  /**
   * Register a new Vanuatu license
   */
  async registerVanuatuLicense(license: InsertVanuatuLicense): Promise<VanuatuLicense> {
    // Create the license record
    const newLicense = await storage.createVanuatuLicense(license);
    
    // Get the credential information
    const credential = await storage.getComplianceCredential(license.credentialId);
    if (!credential) {
      throw new Error("Credential not found");
    }
    
    // Trigger webhook notification
    await this.webhookService.triggerWebhook(
      "vanuatu.license.registered",
      {
        licenseId: newLicense.id,
        licenseType: license.licenseType,
        licenseNumber: license.licenseNumber,
        issuanceDate: license.issuanceDate,
        expiryDate: license.expiryDate,
        userId: credential.userId,
        timestamp: new Date().toISOString()
      },
      credential.userId
    );
    
    return newLicense;
  }

  /**
   * Submit a compliance report
   */
  async submitComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport> {
    // Create the report record
    const newReport = await storage.createComplianceReport(report);
    
    // Identify the related entity and license
    const entity = report.entityId ? await storage.getVanuatuEntity(report.entityId) : null;
    const license = report.licenseId ? await storage.getVanuatuLicense(report.licenseId) : null;
    
    // Determine the user ID for the webhook
    let userId = 0;
    if (entity) {
      const credential = await storage.getComplianceCredential(entity.credentialId);
      if (credential) {
        userId = credential.userId;
      }
    } else if (license) {
      const credential = await storage.getComplianceCredential(license.credentialId);
      if (credential) {
        userId = credential.userId;
      }
    }
    
    if (userId) {
      // Trigger webhook notification
      await this.webhookService.triggerWebhook(
        "vanuatu.compliance.report.submitted",
        {
          reportId: newReport.id,
          reportType: report.reportType,
          entityId: report.entityId,
          licenseId: report.licenseId,
          status: report.status,
          timestamp: new Date().toISOString()
        },
        userId
      );
      
      // Mark the webhook notification as sent
      await storage.updateComplianceReportWebhookStatus(newReport.id, true);
    }
    
    return newReport;
  }

  /**
   * Check for entities with upcoming annual filing due dates
   * This would typically be run as a scheduled task
   */
  async checkAnnualFilingDueDates(): Promise<void> {
    const dueEntities = await storage.getVanuatuEntitiesWithUpcomingFilings(30); // 30 days before due date
    
    for (const entity of dueEntities) {
      // Get the credential for this entity
      const credential = await storage.getComplianceCredential(entity.credentialId);
      if (!credential) continue;
      
      // Trigger webhook notification
      await this.webhookService.triggerWebhook(
        "vanuatu.annual.filing.due",
        {
          entityId: entity.id,
          entityName: entity.registeredName,
          registrationNumber: entity.registrationNumber,
          dueDateISO: entity.annualFilingDueDate,
          daysRemaining: this.calculateDaysRemaining(entity.annualFilingDueDate),
          timestamp: new Date().toISOString()
        },
        credential.userId
      );
    }
  }

  /**
   * Check for licenses that are about to expire
   * This would typically be run as a scheduled task
   */
  async checkLicenseExpirations(): Promise<void> {
    const expiringLicenses = await storage.getVanuatuLicensesNearingExpiration(60); // 60 days before expiry
    
    for (const license of expiringLicenses) {
      // Get the credential for this license
      const credential = await storage.getComplianceCredential(license.credentialId);
      if (!credential) continue;
      
      // Trigger webhook notification
      await this.webhookService.triggerWebhook(
        "vanuatu.license.expiring",
        {
          licenseId: license.id,
          licenseType: license.licenseType,
          licenseNumber: license.licenseNumber,
          expirationDateISO: license.expiryDate,
          daysRemaining: this.calculateDaysRemaining(license.expiryDate),
          timestamp: new Date().toISOString()
        },
        credential.userId
      );
    }
  }

  /**
   * Generate compliance verification report for an entity
   */
  async generateComplianceVerificationReport(entityId: number): Promise<{reportId: number, status: string}> {
    // Get entity details
    const entity = await storage.getVanuatuEntity(entityId);
    if (!entity) {
      throw new Error("Entity not found");
    }
    
    // Get related licenses
    const licenses = await storage.getVanuatuLicensesByEntityId(entityId);
    
    // Get credential information
    const credential = await storage.getComplianceCredential(entity.credentialId);
    if (!credential) {
      throw new Error("Credential not found");
    }
    
    // Create a new compliance report
    const report: InsertComplianceReport = {
      entityId,
      licenseId: licenses.length > 0 ? licenses[0].id : undefined,
      reportType: "COMPLIANCE_VERIFICATION",
      reportPeriodStart: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      reportPeriodEnd: new Date(),
      status: "GENERATED",
      reportContent: {
        entityInfo: {
          registeredName: entity.registeredName,
          registrationNumber: entity.registrationNumber,
          entityType: entity.entityType,
          goodStanding: entity.goodStandingStatus
        },
        licenseInfo: licenses.map(license => ({
          licenseType: license.licenseType,
          licenseNumber: license.licenseNumber,
          issuanceDate: license.issuanceDate,
          expiryDate: license.expiryDate,
          status: license.expiryDate && new Date(license.expiryDate) < new Date() ? "EXPIRED" : "ACTIVE"
        })),
        verificationResult: {
          timestamp: new Date().toISOString(),
          verificationId: uuidv4(),
          complianceStatus: entity.goodStandingStatus ? "COMPLIANT" : "NON_COMPLIANT"
        }
      },
      submittedBy: credential.userId
    };
    
    const newReport = await storage.createComplianceReport(report);
    
    // Trigger webhook notification
    await this.webhookService.triggerWebhook(
      "vanuatu.compliance.verification.completed",
      {
        reportId: newReport.id,
        entityId: entity.id,
        entityName: entity.registeredName,
        registrationNumber: entity.registrationNumber,
        status: entity.goodStandingStatus ? "COMPLIANT" : "NON_COMPLIANT",
        licenseCount: licenses.length,
        timestamp: new Date().toISOString()
      },
      credential.userId
    );
    
    return {
      reportId: newReport.id,
      status: entity.goodStandingStatus ? "COMPLIANT" : "NON_COMPLIANT"
    };
  }

  /**
   * Calculate days remaining until a date
   */
  private calculateDaysRemaining(targetDate: Date | string | null | undefined): number {
    if (!targetDate) return 0;
    
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
    const today = new Date();
    const differenceMs = target.getTime() - today.getTime();
    return Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
  }
}