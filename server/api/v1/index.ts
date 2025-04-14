import { Router } from 'express';
import authRoutes from './auth';
import usersRoutes from './users';
import webhooksRoutes from './webhooks';
import verificationRoutes from './verification';
import fibonRoseTrustRoutes from './fibonRoseTrust';
import vanuatuRoutes from './vanuatu';
import tenantsRoutes from './tenants';

const router = Router();

// Register all API routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/verification', verificationRoutes);
router.use('/fibonrose-trust', fibonRoseTrustRoutes);
router.use('/vanuatu', vanuatuRoutes);
router.use('/tenants', tenantsRoutes);

export default router;