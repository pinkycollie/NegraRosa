/**
 * Configuration utility for service integrations
 * Provides methods to get and validate service configurations from environment variables
 */

type ServiceConfigResult = {
  isValid: boolean;
  missingVars: string[];
  config?: Record<string, string>;
};

interface ServiceConfig {
  clientId?: string;
  clientSecret: string;
  additionalConfig?: Record<string, string>;
}

/**
 * Get configuration for a specific integration service
 * @param serviceName The name of the service (e.g., 'plaid', 'stripe')
 * @returns The service configuration
 */
export function getConfig(serviceName: string): ServiceConfig {
  // All service configs require at least a client secret
  const clientSecretVar = `${serviceName.toUpperCase()}_SECRET_KEY`;
  const clientSecret = process.env[clientSecretVar] || '';
  
  // Create basic config
  const config: ServiceConfig = {
    clientSecret
  };
  
  // Add service-specific configurations
  switch (serviceName.toLowerCase()) {
    case 'plaid':
      config.clientId = process.env.PLAID_CLIENT_ID || '';
      config.additionalConfig = {
        environment: process.env.PLAID_ENVIRONMENT || 'sandbox'
      };
      break;
    case 'stripe':
      config.additionalConfig = {
        publishableKey: process.env.VITE_STRIPE_PUBLIC_KEY || ''
      };
      break;
  }
  
  return config;
}

/**
 * Validate if a service configuration is valid and complete
 * @param serviceName The name of the service (e.g., 'plaid', 'stripe')
 * @returns Object indicating if config is valid and listing any missing variables
 */
export function validateServiceConfig(serviceName: string): ServiceConfigResult {
  const missingVars: string[] = [];
  
  // Common required variables
  const clientSecretVar = `${serviceName.toUpperCase()}_SECRET_KEY`;
  if (!process.env[clientSecretVar]) {
    missingVars.push(clientSecretVar);
  }
  
  // Service-specific required variables
  switch (serviceName.toLowerCase()) {
    case 'plaid':
      if (!process.env.PLAID_CLIENT_ID) {
        missingVars.push('PLAID_CLIENT_ID');
      }
      break;
    case 'stripe':
      if (!process.env.VITE_STRIPE_PUBLIC_KEY) {
        missingVars.push('VITE_STRIPE_PUBLIC_KEY');
      }
      break;
  }
  
  // Get configuration
  const config = getConfig(serviceName);
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
    config: missingVars.length === 0 ? config : undefined
  };
}

/**
 * Check if a configuration is valid or throw an error
 * @param serviceName The name of the service (e.g., 'plaid', 'stripe')
 * @returns The service configuration, if valid
 * @throws Error if configuration is invalid
 */
export function requireValidConfig(serviceName: string): ServiceConfig {
  const validation = validateServiceConfig(serviceName);
  if (!validation.isValid) {
    throw new Error(`${serviceName} integration is not properly configured. Missing: ${validation.missingVars.join(', ')}`);
  }
  return getConfig(serviceName);
}