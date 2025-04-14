# Deploying to Vercel

This document outlines the steps needed to deploy the NegraRosa Inclusive Security Framework to Vercel.

## Prerequisites

1. A Vercel account
2. Access to the GitHub repository or the project files
3. Environment variables (API keys, database credentials, etc.)

## Deployment Steps

### 1. Connect to Vercel

- Go to https://vercel.com and log in to your account
- Click "New Project" and select the repository or upload the project files
- Select the NegraRosa Security Framework repository 

### 2. Configure Environment Variables

In the Vercel project settings, add the following environment variables:

- `DATABASE_URL`: Your PostgreSQL database connection string
- `XANO_API_BASE_URL`: Your Xano API base URL
- `XANO_API_KEY`: Your Xano API key
- `NOTION_API_KEY`: Your Notion API key (if using Notion integration)
- `NOTION_DATABASE_ID`: Your Notion database ID (if using Notion integration)
- `AUTH0_DOMAIN`: Your Auth0 domain (if using Auth0)
- `AUTH0_CLIENT_ID`: Your Auth0 client ID (if using Auth0)
- `AUTH0_CLIENT_SECRET`: Your Auth0 client secret (if using Auth0)
- `NODE_ENV`: Set to `production`

### 3. Deploy

- Click "Deploy" to start the deployment process
- Vercel will automatically build and deploy the application

### 4. Verify Deployment

- Once deployment is complete, Vercel will provide a URL to access your application
- Visit the URL to verify that the application is working correctly
- Check the logs for any errors or issues

## Troubleshooting

If you encounter any issues during deployment:

1. Check the build logs for errors
2. Verify that all environment variables are set correctly
3. Ensure that the PostgreSQL database is accessible from Vercel
4. Check the Vercel function logs for runtime errors

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli) for advanced deployment options