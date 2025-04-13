import { storage } from '../storage';
import { InsertWebhook, Webhook } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

export class CSVImportService {
  /**
   * Import webhooks from CSV data
   * Expected CSV format: name,url,event,userId
   */
  public async importWebhooksFromCSV(csvData: string, defaultUserId: number = 1): Promise<{ 
    imported: Webhook[],
    errors: string[]
  }> {
    const rows = csvData.split('\n');
    const imported: Webhook[] = [];
    const errors: string[] = [];

    // Skip header row if present
    const startIndex = this.hasHeader(rows[0]) ? 1 : 0;
    
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue; // Skip empty lines
      
      try {
        const [name, url, event, userIdStr] = row.split(',').map(field => field.trim());
        
        if (!name || !url || !event) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }
        
        // Use provided userId or default
        const userId = userIdStr ? parseInt(userIdStr) : defaultUserId;
        if (isNaN(userId)) {
          errors.push(`Row ${i + 1}: Invalid user ID`);
          continue;
        }
        
        // Create webhook
        const webhookData: InsertWebhook = {
          id: uuidv4(),
          userId,
          name,
          url,
          event,
          active: true
        };
        
        const webhook = await storage.createWebhook(webhookData);
        imported.push(webhook);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }
    
    return { imported, errors };
  }
  
  /**
   * Check if the first row is a header row
   */
  private hasHeader(firstRow: string): boolean {
    const lowerCase = firstRow.toLowerCase();
    return lowerCase.includes('name') && 
           lowerCase.includes('url') && 
           lowerCase.includes('event');
  }
  
  /**
   * Generate a sample CSV for webhooks
   */
  public generateSampleCSV(): string {
    const header = 'name,url,event,userId';
    const sampleRows = [
      'User Verification,https://example.com/webhooks/verification,user.verification.complete,1',
      'Transaction Risk,https://example.com/webhooks/risk,transaction.risk.assessment,1',
      'Claim Notification,https://example.com/webhooks/claims,claim.submitted,1',
      'WHY Submission,https://example.com/webhooks/why,why.submission.received,1'
    ];
    
    return [header, ...sampleRows].join('\n');
  }
}

export const csvImportService = new CSVImportService();