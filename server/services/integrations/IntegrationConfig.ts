/**
 * Configuration for financial service integrations
 * Handles environment variables and API keys for various financial services
 */

// Configuration interface
export interface FinancialServiceConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'development' | 'production';
  apiVersion?: string;
  additionalConfig?: Record<string, any>;
}

// Central configuration object
export interface IntegrationConfigMap {
  plaid: FinancialServiceConfig;
  stripe: FinancialServiceConfig;
  experian?: FinancialServiceConfig;
  equifax?: FinancialServiceConfig;
  transunion?: FinancialServiceConfig;
  finicity?: FinancialServiceConfig;
  mx?: FinancialServiceConfig;
}

/**
 * Get configuration for a specific integration
 * @param serviceName The name of the financial service
 * @returns Configuration object for the specified service
 */
export function getConfig(serviceName: keyof IntegrationConfigMap): FinancialServiceConfig {
  // Default environment is sandbox for safety
  const environment = (process.env.NODE_ENV === 'production') ? 'production' : 'sandbox';
  
  // Define base configurations
  const configs: Partial<IntegrationConfigMap> = {
    plaid: {
      clientId: process.env.PLAID_CLIENT_ID || '',
      clientSecret: process.env.PLAID_SECRET || '',
      environment,
      apiVersion: '2020-09-14',
    },
    stripe: {
      clientId: process.env.STRIPE_CLIENT_ID || '',
      clientSecret: process.env.STRIPE_SECRET_KEY || '',
      environment,
      additionalConfig: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
      }
    }
  };
  
  const config = configs[serviceName];
  
  if (!config) {
    throw new Error(`No configuration found for service: ${serviceName}`);
  }
  
  // Validate required configuration values
  if (!config.clientId || !config.clientSecret) {
    throw new Error(`Missing required credentials for ${serviceName}. Please check environment variables.`);
  }
  
  return config as FinancialServiceConfig;
}

/**
 * Get Plaid environment string based on NODE_ENV
 */
export function getPlaidEnvironment(): string {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'production';
    case 'development':
      return 'development';
    default:
      return 'sandbox';
  }
}

/**
 * Validates that all required environment variables are set for a given service
 * @param serviceName The name of the financial service
 * @returns Object containing validation status and any missing variables
 */
export function validateServiceConfig(serviceName: keyof IntegrationConfigMap): { 
  isValid: boolean; 
  missingVars: string[];
} {
  const missingVars: string[] = [];
  
  switch (serviceName) {
    case 'plaid':
      if (!process.env.PLAID_CLIENT_ID) missingVars.push('PLAID_CLIENT_ID');
      if (!process.env.PLAID_SECRET) missingVars.push('PLAID_SECRET');
      break;
    case 'stripe':
      if (!process.env.STRIPE_SECRET_KEY) missingVars.push('STRIPE_SECRET_KEY');
      if (!process.env.STRIPE_PUBLISHABLE_KEY) missingVars.push('STRIPE_PUBLISHABLE_KEY');
      if (!process.env.STRIPE_CLIENT_ID) missingVars.push('STRIPE_CLIENT_ID');
      break;
    // Add other services as needed
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}