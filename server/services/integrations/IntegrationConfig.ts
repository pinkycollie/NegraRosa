/**
 * Configuration utility for service integrations
 * Provides methods to get and validate service configurations from environment variables
 */

/**
 * Result of validating a service configuration
 */
type ServiceConfigResult = {
  isValid: boolean;
  missingVars: string[];
  config?: Record<string, string>;
};

/**
 * Service configuration interface
 */
interface ServiceConfig {
  clientId?: string;
  clientSecret: string;
  additionalConfig?: Record<string, string>;
}

/**
 * Get required environment variables for a specific service
 * @param serviceName The name of the service (e.g., 'plaid', 'stripe')
 * @returns Array of required environment variable names
 */
function getRequiredEnvVars(serviceName: string): string[] {
  switch (serviceName.toLowerCase()) {
    case 'plaid':
      return ['PLAID_CLIENT_ID', 'PLAID_SECRET_KEY'];
    case 'stripe':
      return ['STRIPE_SECRET_KEY'];
    default:
      return [];
  }
}

/**
 * Get optional environment variables for a specific service
 * @param serviceName The name of the service (e.g., 'plaid', 'stripe')
 * @returns Array of optional environment variable names
 */
function getOptionalEnvVars(serviceName: string): string[] {
  switch (serviceName.toLowerCase()) {
    case 'plaid':
      return ['PLAID_ENV'];
    case 'stripe':
      return ['STRIPE_WEBHOOK_SECRET'];
    default:
      return [];
  }
}

/**
 * Get configuration for a specific integration service
 * @param serviceName The name of the service (e.g., 'plaid', 'stripe')
 * @returns The service configuration
 */
export function getConfig(serviceName: string): ServiceConfig {
  const config: ServiceConfig = {
    clientSecret: '',
    additionalConfig: {}
  };
  
  switch (serviceName.toLowerCase()) {
    case 'plaid':
      config.clientId = process.env.PLAID_CLIENT_ID;
      config.clientSecret = process.env.PLAID_SECRET_KEY || '';
      config.additionalConfig = {
        env: process.env.PLAID_ENV || 'sandbox'
      };
      break;
    case 'stripe':
      config.clientSecret = process.env.STRIPE_SECRET_KEY || '';
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        config.additionalConfig.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      }
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
  const requiredVars = getRequiredEnvVars(serviceName);
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  const isValid = missingVars.length === 0;
  
  if (isValid) {
    return {
      isValid,
      missingVars,
      config: getConfig(serviceName)
    };
  } else {
    return {
      isValid,
      missingVars
    };
  }
}

/**
 * Check if a configuration is valid or throw an error
 * @param serviceName The name of the service (e.g., 'plaid', 'stripe')
 * @returns The service configuration, if valid
 * @throws Error if configuration is invalid
 */
export function requireValidConfig(serviceName: string): ServiceConfig {
  const result = validateServiceConfig(serviceName);
  
  if (!result.isValid) {
    throw new Error(`${serviceName} service not properly configured. Missing environment variables: ${result.missingVars.join(', ')}`);
  }
  
  return getConfig(serviceName);
}