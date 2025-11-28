import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import webhooksRouter from './webhooks';
import verificationRouter from './verification';
import fibonRoseTrustRouter from './fibonRoseTrust';
import tenantsRouter from './tenants';
import securityRouter from './security';
import partnersRouter from './partners';
import opensourceRouter from './opensource';
import deafauthRouter from './deafauth';
import pinksyncRouter from './pinksync';
import fibonacciRouter from './fibonacci';
import aiRouter from './ai';
import vrRouter from './vr';
import cacheRouter from './cache';
import automlRouter from './automl';
import visualRouter from './visual';
import videoRouter from './video';
import proxyRouter from './proxy';

const router = Router();

// Mount all API routes
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/verification', verificationRouter);
router.use('/webhooks', webhooksRouter);
router.use('/fibonrose-trust', fibonRoseTrustRouter);
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

// Mount AI Proxy - Pathway-based AI magicians
router.use('/ai', aiRouter);

// Mount VR Compliance - vr4deaf.org
router.use('/vr', vrRouter);

// Mount Cache service
router.use('/cache', cacheRouter);

// Mount AutoML - AI-powered code generation and full-stack maintenance
router.use('/automl', automlRouter);

// Mount Visual Protocol - IDEA→BUILD→GROW→MANAGED / BUILD→SERVE→EVENT
router.use('/visual', visualRouter);

// Mount Video Processing - FFmpeg, captions, sign language overlay
router.use('/video', videoRouter);

// Mount HTTPS Proxy - Tunneled connections through proxy servers
router.use('/proxy', proxyRouter);

export default router;