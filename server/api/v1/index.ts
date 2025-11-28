import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import webhooksRouter from './webhooks';
import verificationRouter from './verification';
import fibonRoseTrustRouter from './fibonRoseTrust';
import vanuatuRouter from './vanuatu';
import tenantsRouter from './tenants';
import securityRouter from './security';
import partnersRouter from './partners';
import opensourceRouter from './opensource';
import deafauthRouter from './deafauth';
import pinksyncRouter from './pinksync';
import fibonacciRouter from './fibonacci';

const router = Router();

// Mount all API routes
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/verification', verificationRouter);
router.use('/webhooks', webhooksRouter);
router.use('/fibonrose-trust', fibonRoseTrustRouter);
router.use('/vanuatu', vanuatuRouter);
router.use('/tenants', tenantsRouter);

// Mount new security, partners, and opensource routes
router.use('/security', securityRouter);
router.use('/partners', partnersRouter);
router.use('/opensource', opensourceRouter);

// Mount DeafAUTH - Deaf-first authentication
router.use('/deafauth', deafauthRouter);

// Mount PinkSync - Offline/Online synchronization
router.use('/pinksync', pinksyncRouter);

// Mount Fibonacci Security Service routes
router.use('/fibonacci', fibonacciRouter);

export default router;