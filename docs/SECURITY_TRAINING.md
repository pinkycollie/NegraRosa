# Security Training Guide

## Overview

This guide provides essential security knowledge for all NegraRosa developers. Security is everyone's responsibility, and understanding these principles helps us build more secure software.

## 🎯 Learning Objectives

After completing this training, you will be able to:
- Recognize common security vulnerabilities
- Apply secure coding practices
- Use security tools effectively
- Respond appropriately to security incidents

---

## 📚 Core Security Concepts

### 1. The CIA Triad

Security is built on three pillars:

**Confidentiality:** Ensuring information is only accessible to authorized parties
- Encryption of sensitive data
- Access controls
- Authentication and authorization

**Integrity:** Ensuring information is accurate and unmodified
- Input validation
- Cryptographic signatures
- Audit trails

**Availability:** Ensuring systems are accessible when needed
- Load balancing
- DDoS protection
- Backup and recovery

### 2. Defense in Depth

Never rely on a single security control. Layer multiple defenses:
- Authentication + Authorization
- Input validation + Output encoding
- Firewall + Application security
- Encryption in transit + Encryption at rest

---

## 🔒 OWASP Top 10 (2021)

Understanding the most critical web application security risks:

### A01:2021 - Broken Access Control
**What it is:** Users can access resources they shouldn't

**Prevention:**
```typescript
// BAD: Trusting user input for access control
app.get('/user/:id/profile', (req, res) => {
  const userId = req.params.id;
  const profile = getProfile(userId); // No auth check!
  res.json(profile);
});

// GOOD: Verify user has permission
app.get('/user/:id/profile', authenticateUser, (req, res) => {
  const requestedId = req.params.id;
  const currentUserId = req.user.id;
  
  if (requestedId !== currentUserId && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const profile = getProfile(requestedId);
  res.json(profile);
});
```

### A02:2021 - Cryptographic Failures
**What it is:** Improper protection of sensitive data

**Prevention:**
```typescript
// BAD: Storing passwords in plain text
const user = {
  username: 'john',
  password: 'mypassword123' // Never do this!
};

// GOOD: Hash passwords with bcrypt
import bcrypt from 'bcrypt';

const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

const user = {
  username: 'john',
  passwordHash: hashedPassword
};

// Verify password
const isValid = await bcrypt.compare(inputPassword, user.passwordHash);
```

### A03:2021 - Injection
**What it is:** Untrusted data sent to an interpreter

**Prevention:**
```typescript
// BAD: SQL Injection vulnerability
const query = `SELECT * FROM users WHERE username = '${username}'`;
db.query(query); // Attacker can inject: ' OR '1'='1

// GOOD: Use parameterized queries
const query = 'SELECT * FROM users WHERE username = ?';
db.query(query, [username]);

// BAD: Command injection
exec(`ping ${userInput}`); // Attacker can inject: ; rm -rf /

// GOOD: Validate and sanitize input
const ip = /^[\d.]+$/.test(userInput) ? userInput : '127.0.0.1';
exec(`ping ${ip}`);
```

### A04:2021 - Insecure Design
**What it is:** Missing or ineffective security controls

**Prevention:**
- Threat modeling for new features
- Secure design patterns
- Security requirements in user stories
- Regular security reviews

### A05:2021 - Security Misconfiguration
**What it is:** Insecure default configurations

**Prevention:**
```typescript
// BAD: Detailed error messages in production
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack // Leaks internal details!
  });
});

// GOOD: Generic errors in production
app.use((err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    error: isProduction ? 'Internal server error' : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  });
});
```

### A06:2021 - Vulnerable and Outdated Components
**What it is:** Using libraries with known vulnerabilities

**Prevention:**
- Run `npm audit` regularly
- Keep dependencies updated
- Monitor security advisories
- Use Dependabot for automated updates

```bash
# Check for vulnerabilities
npm audit

# Fix automatically when possible
npm audit fix

# Update outdated packages
npm outdated
npm update
```

### A07:2021 - Identification and Authentication Failures
**What it is:** Weak authentication mechanisms

**Prevention:**
```typescript
// BAD: Weak password requirements
const isValidPassword = password.length >= 6;

// GOOD: Strong password policy
const isStrongPassword = (password) => {
  return password.length >= 12 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password) &&
         /[^A-Za-z0-9]/.test(password);
};

// Implement rate limiting
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, try again later'
});

app.post('/login', loginLimiter, handleLogin);
```

### A08:2021 - Software and Data Integrity Failures
**What it is:** Untrusted updates, CI/CD pipelines, and auto-updates

**Prevention:**
- Verify integrity of dependencies (use lock files)
- Sign and verify software updates
- Secure CI/CD pipelines
- Use SBOMs to track components

### A09:2021 - Security Logging and Monitoring Failures
**What it is:** Insufficient logging and monitoring

**Prevention:**
```typescript
// Log security-relevant events
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Log authentication events
app.post('/login', async (req, res) => {
  try {
    const user = await authenticateUser(req.body);
    logger.info('Successful login', {
      userId: user.id,
      ip: req.ip,
      timestamp: new Date()
    });
    res.json({ token: generateToken(user) });
  } catch (err) {
    logger.warn('Failed login attempt', {
      username: req.body.username,
      ip: req.ip,
      timestamp: new Date()
    });
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

### A10:2021 - Server-Side Request Forgery (SSRF)
**What it is:** Application fetches remote resources without validation

**Prevention:**
```typescript
// BAD: Unvalidated URL fetch
app.get('/fetch', async (req, res) => {
  const url = req.query.url;
  const data = await fetch(url); // Can access internal services!
  res.json(data);
});

// GOOD: Validate and whitelist URLs
const allowedHosts = ['api.example.com', 'cdn.example.com'];

app.get('/fetch', async (req, res) => {
  const url = new URL(req.query.url);
  
  if (!allowedHosts.includes(url.hostname)) {
    return res.status(400).json({ error: 'Invalid host' });
  }
  
  if (url.protocol !== 'https:') {
    return res.status(400).json({ error: 'HTTPS required' });
  }
  
  const data = await fetch(url.toString());
  res.json(data);
});
```

---

## 🛡️ Secure Coding Practices

### Input Validation

Always validate and sanitize user input:

```typescript
import { z } from 'zod';

// Define schema
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(13).max(120),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/)
});

// Validate input
app.post('/register', (req, res) => {
  try {
    const validData = userSchema.parse(req.body);
    createUser(validData);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Invalid input' });
  }
});
```

### Output Encoding

Prevent XSS by encoding output:

```typescript
// React automatically encodes (use with JSX)
<div>{userInput}</div> // Safe

// For raw HTML, use DOMPurify
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty);
```

### Secrets Management

Never commit secrets:

```bash
# Use environment variables
export DATABASE_URL="postgresql://..."
export API_KEY="secret-key"

# Or use secret management tools
# - AWS Secrets Manager
# - HashiCorp Vault
# - GitHub Secrets
```

```typescript
// Load from environment
const config = {
  dbUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY
};

// Never do this:
// const apiKey = "sk-1234567890"; ❌
```

---

## 🔧 Security Tools

### Pre-commit Hooks

Prevent committing secrets:

```bash
# Install pre-commit
npm install --save-dev husky

# Add pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run security-check"
```

### VS Code Extensions

Recommended security extensions:
- **Snyk Security**: Real-time vulnerability scanning
- **SonarLint**: Detect code quality and security issues
- **GitLens**: Review code history for suspicious changes

---

## 🚨 Incident Response

### If You Discover a Security Issue:

1. **DO NOT** commit the fix immediately
2. **DO NOT** discuss publicly (no public issues/PRs)
3. **DO** report to the security team immediately
4. **DO** document what you found

### Reporting Process:

1. Email: [security contact]
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

---

## 📝 Self-Assessment Quiz

Test your knowledge:

1. Which is safer?
   - A) `SELECT * FROM users WHERE id = '${userId}'`
   - B) `SELECT * FROM users WHERE id = ?` with parameters

2. How should passwords be stored?
   - A) Plain text
   - B) MD5 hashed
   - C) bcrypt hashed with salt

3. What's wrong with: `res.json({ error: err.stack })`?
   - A) Nothing
   - B) Leaks internal implementation details
   - C) Should use err.message only

**Answers:** 1-B, 2-C, 3-B

---

## 📖 Additional Resources

### Internal Documentation
- [Security Rituals Framework](SECURITY_RITUALS.md)
- [Threat Modeling Template](THREAT_MODELING_TEMPLATE.md)
- [Incident Response Plan](INCIDENT_RESPONSE.md)

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Snyk Learn](https://learn.snyk.io/)

### Books
- "The Web Application Hacker's Handbook"
- "Security Engineering" by Ross Anderson
- "Threat Modeling" by Adam Shostack

---

## ✅ Completion Certificate

Once you've completed this training:

1. Take the self-assessment quiz
2. Review at least 3 PRs with security in mind
3. Complete one threat model exercise
4. Share your certificate with the team

**Completed by:** [Your Name]  
**Date:** [Date]  
**Verified by:** [Security Lead]

---

## 🔄 Continuous Learning

Security is an ongoing practice:
- Attend security webinars and conferences
- Follow security researchers on Twitter
- Read security blogs and newsletters
- Participate in CTF competitions
- Practice on platforms like HackTheBox or PortSwigger Web Security Academy

**Remember:** The best defense is a well-informed team! 🛡️
