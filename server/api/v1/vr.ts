/**
 * VR Compliance API Routes - vr4deaf.org
 * 
 * Vocational Rehabilitation vendor compliance endpoints
 */

import { Router, Request, Response } from 'express';
import { vrComplianceService, VRState, ServiceCategory, DeafAccommodation } from '../../services/VRComplianceService';

const router = Router();

// ==================== Types ====================

interface RegisterClientBody {
  firstName: string;
  lastName: string;
  caseNumber: string;
  state: VRState;
  counselorId: string;
  accommodations: DeafAccommodation[];
}

interface CreateAuthorizationBody {
  clientId: string;
  serviceCategory: ServiceCategory;
  amount: number;
  startDate: string;
  endDate: string;
}

interface RecordServiceBody {
  authorizationId: string;
  serviceDate: string;
  units: number;
  description: string;
  accommodationsUsed: DeafAccommodation[];
}

interface ProgressReportBody {
  clientId: string;
  startDate: string;
  endDate: string;
  progressTowardGoal: string;
  nextSteps: string;
  barriers?: string;
  recommendations?: string;
}

// ==================== Routes ====================

/**
 * GET /api/v1/vr/status
 * Check VR compliance service status
 */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'vr-compliance',
    version: '1.0.0',
    configuredStates: vrComplianceService.listConfiguredStates(),
    compliance: {
      hipaaAdjacent: true,
      section508: true,
      auditLogging: true,
    },
    deafFirst: true,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/vr/states
 * List configured state VR agencies
 */
router.get('/states', (_req: Request, res: Response) => {
  const states = vrComplianceService.listConfiguredStates();
  
  res.json({
    success: true,
    states: states.map(state => ({
      code: state,
      agency: vrComplianceService.getAgencyConfig(state),
    })),
  });
});

/**
 * GET /api/v1/vr/states/:state
 * Get specific state VR agency configuration
 */
router.get('/states/:state', (req: Request, res: Response) => {
  const state = req.params.state?.toUpperCase() as VRState;
  const agency = vrComplianceService.getAgencyConfig(state);

  if (!agency) {
    return res.status(404).json({
      success: false,
      error: 'State VR agency not configured',
      configuredStates: vrComplianceService.listConfiguredStates(),
    });
  }

  res.json({
    success: true,
    agency,
  });
});

/**
 * POST /api/v1/vr/clients
 * Register a new VR client
 */
router.post('/clients', (req: Request, res: Response) => {
  try {
    const body = req.body as RegisterClientBody;

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.caseNumber || !body.state || !body.counselorId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: firstName, lastName, caseNumber, state, counselorId',
      });
    }

    // Ensure accommodations array
    const accommodations = body.accommodations || [];

    const client = vrComplianceService.registerClient(
      body.firstName,
      body.lastName,
      body.caseNumber,
      body.state,
      body.counselorId,
      accommodations
    );

    res.status(201).json({
      success: true,
      client,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * GET /api/v1/vr/clients/:clientId
 * Get client details
 */
router.get('/clients/:clientId', (req: Request, res: Response) => {
  const client = vrComplianceService.getClient(req.params.clientId);

  if (!client) {
    return res.status(404).json({
      success: false,
      error: 'Client not found',
    });
  }

  res.json({
    success: true,
    client,
  });
});

/**
 * POST /api/v1/vr/authorizations
 * Create service authorization
 */
router.post('/authorizations', (req: Request, res: Response) => {
  try {
    const body = req.body as CreateAuthorizationBody;

    if (!body.clientId || !body.serviceCategory || !body.amount || !body.startDate || !body.endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: clientId, serviceCategory, amount, startDate, endDate',
      });
    }

    const authorization = vrComplianceService.createAuthorization(
      body.clientId,
      body.serviceCategory,
      body.amount,
      new Date(body.startDate),
      new Date(body.endDate)
    );

    res.status(201).json({
      success: true,
      authorization,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * POST /api/v1/vr/authorizations/:authId/approve
 * Approve authorization
 */
router.post('/authorizations/:authId/approve', (req: Request, res: Response) => {
  try {
    const counselorId = req.body.counselorId || (req as any).userId || 'unknown';
    
    const authorization = vrComplianceService.approveAuthorization(
      req.params.authId,
      counselorId
    );

    res.json({
      success: true,
      authorization,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * GET /api/v1/vr/authorizations/:authId/check
 * Check authorization availability
 */
router.get('/authorizations/:authId/check', (req: Request, res: Response) => {
  const units = parseInt(req.query.units as string) || 1;
  const check = vrComplianceService.checkAuthorization(req.params.authId, units);

  res.json({
    success: check.passed,
    check,
  });
});

/**
 * POST /api/v1/vr/services
 * Record service delivery
 */
router.post('/services', (req: Request, res: Response) => {
  try {
    const body = req.body as RecordServiceBody;

    if (!body.authorizationId || !body.serviceDate || !body.units || !body.description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: authorizationId, serviceDate, units, description',
      });
    }

    const service = vrComplianceService.recordService(
      body.authorizationId,
      new Date(body.serviceDate),
      body.units,
      body.description,
      body.accommodationsUsed || []
    );

    res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * POST /api/v1/vr/services/:serviceId/sign
 * Client signature for service
 */
router.post('/services/:serviceId/sign', (req: Request, res: Response) => {
  try {
    const clientId = req.body.clientId || (req as any).userId;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID required',
      });
    }

    const service = vrComplianceService.signService(req.params.serviceId, clientId);

    res.json({
      success: true,
      service,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * POST /api/v1/vr/reports
 * Generate progress report
 */
router.post('/reports', (req: Request, res: Response) => {
  try {
    const body = req.body as ProgressReportBody;

    if (!body.clientId || !body.startDate || !body.endDate || !body.progressTowardGoal || !body.nextSteps) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: clientId, startDate, endDate, progressTowardGoal, nextSteps',
      });
    }

    const report = vrComplianceService.generateProgressReport(
      body.clientId,
      new Date(body.startDate),
      new Date(body.endDate),
      body.progressTowardGoal,
      body.nextSteps,
      body.barriers,
      body.recommendations
    );

    res.status(201).json({
      success: true,
      report,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * GET /api/v1/vr/clients/:clientId/compliance
 * Run compliance check for client
 */
router.get('/clients/:clientId/compliance', (req: Request, res: Response) => {
  const checks = vrComplianceService.runComplianceCheck(req.params.clientId);
  const allPassed = checks.every(c => c.passed);

  res.json({
    success: allPassed,
    clientId: req.params.clientId,
    checks,
    summary: {
      total: checks.length,
      passed: checks.filter(c => c.passed).length,
      failed: checks.filter(c => !c.passed).length,
      critical: checks.filter(c => c.severity === 'CRITICAL').length,
    },
  });
});

/**
 * GET /api/v1/vr/audit/:entityType/:entityId
 * Get audit logs for an entity
 */
router.get('/audit/:entityType/:entityId', (req: Request, res: Response) => {
  const entityType = req.params.entityType.toUpperCase();
  const validTypes = ['CLIENT', 'AUTHORIZATION', 'SERVICE', 'REPORT'];

  if (!validTypes.includes(entityType)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid entity type',
      validTypes,
    });
  }

  const logs = vrComplianceService.getAuditLogs(entityType, req.params.entityId);

  res.json({
    success: true,
    entityType,
    entityId: req.params.entityId,
    logs,
  });
});

export default router;
