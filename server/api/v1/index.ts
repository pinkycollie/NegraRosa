import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import webhooksRouter from './webhooks';
import verificationRouter from './verification';
import fibonRoseTrustRouter from './fibonRoseTrust';
import vanuatuRouter from './vanuatu';
import tenantRouter from './tenants';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'MBTQ Core Services' });
});

// Mount all routers
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/webhooks', webhooksRouter);
router.use('/verification', verificationRouter);
router.use('/fibonrose', fibonRoseTrustRouter);
router.use('/vanuatu', vanuatuRouter); 
router.use('/tenants', tenantRouter);

export default router;