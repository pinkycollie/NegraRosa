import axios from 'axios';
import { JSDOM } from 'jsdom';
import { storage } from '../storage';
import { EntrepreneurProfile } from '@shared/schema';

interface VerificationResult {
  success: boolean;
  score: number;
  details: {
    hasMultiplePages: boolean;
    hasRealContent: boolean;
    hasInteractiveElements: boolean;
    hasContactInfo: boolean;
    pageLoadTime: number;
    pageSize: number;
    metaTagsScore: number;
  };
  message: string;
}

interface WebsiteMetrics {
  totalPages: number;
  contentQualityScore: number;
  functionalityScore: number;
  designScore: number;
  overallScore: number;
}

/**
 * Service for verifying if a website represents a real working project
 */
export class WebsiteVerificationService {
  private cachedResults: Map<string, { result: VerificationResult, timestamp: number }> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  /**
   * Verify if a website exists and represents a real working project
   */
  async verifyWebsite(url: string): Promise<VerificationResult> {
    // Normalize URL
    url = this.normalizeUrl(url);
    
    // Check cache first
    const cached = this.cachedResults.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }
    
    try {
      // Basic verification
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      
      // Check if the site exists and returns HTML content
      if (response.status !== 200 || !response.headers['content-type']?.includes('text/html')) {
        const result = {
          success: false,
          score: 0,
          details: {
            hasMultiplePages: false,
            hasRealContent: false,
            hasInteractiveElements: false,
            hasContactInfo: false,
            pageLoadTime: 0,
            pageSize: 0,
            metaTagsScore: 0
          },
          message: 'Website does not exist or is not returning HTML content',
        };
        this.cachedResults.set(url, { result, timestamp: Date.now() });
        return result;
      }
      
      // Parse the HTML
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      // Verify if there are multiple pages by checking navigation links
      const navLinks = document.querySelectorAll('a');
      const internalLinks = Array.from(navLinks).filter(link => {
        const href = link.getAttribute('href');
        return href && (href.startsWith('/') || href.includes(new URL(url).hostname));
      });
      const hasMultiplePages = internalLinks.length > 3;
      
      // Check for real content (non-placeholder)
      const contentElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, article, section');
      const contentText = Array.from(contentElements).map(el => el.textContent).join(' ');
      const hasRealContent = contentText.length > 500 && 
                           !contentText.toLowerCase().includes('lorem ipsum') &&
                           !contentText.toLowerCase().includes('placeholder');
      
      // Check for interactive elements (forms, buttons, etc.)
      const interactiveElements = document.querySelectorAll('form, button, input, select, textarea');
      const hasInteractiveElements = interactiveElements.length > 0;
      
      // Check for contact information
      const contactRegex = /contact|email|phone|tel|support|help/i;
      const hasContactLinks = Array.from(navLinks).some(link => {
        const text = link.textContent;
        const href = link.getAttribute('href');
        return (text && contactRegex.test(text)) || 
               (href && (contactRegex.test(href) || href.includes('mailto:') || href.includes('tel:')));
      });
      const hasContactInfo = hasContactLinks;
      
      // Check meta tags quality
      const metaTags = document.querySelectorAll('meta');
      const hasTitleTag = document.querySelector('title')?.textContent?.length > 0;
      const hasDescriptionTag = Array.from(metaTags).some(tag => 
        tag.getAttribute('name')?.toLowerCase() === 'description' && 
        tag.getAttribute('content')?.length > 50
      );
      const hasKeywordsTag = Array.from(metaTags).some(tag => 
        tag.getAttribute('name')?.toLowerCase() === 'keywords' && 
        tag.getAttribute('content')?.length > 0
      );
      
      const metaTagsScore = (hasTitleTag ? 1 : 0) + 
                           (hasDescriptionTag ? 1 : 0) + 
                           (hasKeywordsTag ? 1 : 0);
      
      // Calculate overall score
      const score = this.calculateScore({
        hasMultiplePages, 
        hasRealContent, 
        hasInteractiveElements, 
        hasContactInfo,
        metaTagsScore
      });
      
      const result = {
        success: score >= 0.6, // 60% score threshold for success
        score,
        details: {
          hasMultiplePages,
          hasRealContent,
          hasInteractiveElements,
          hasContactInfo,
          pageLoadTime: response.headers['x-response-time'] ? 
            parseInt(response.headers['x-response-time']) : 0,
          pageSize: response.headers['content-length'] ? 
            parseInt(response.headers['content-length']) : 0,
          metaTagsScore
        },
        message: score >= 0.6 ? 
          'Website verification successful' : 
          'Website does not appear to be a complete working project',
      };
      
      // Cache the result
      this.cachedResults.set(url, { result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error verifying website ${url}:`, error);
      const result = {
        success: false,
        score: 0,
        details: {
          hasMultiplePages: false,
          hasRealContent: false,
          hasInteractiveElements: false,
          hasContactInfo: false,
          pageLoadTime: 0,
          pageSize: 0,
          metaTagsScore: 0
        },
        message: `Failed to verify website: ${error.message || 'Unknown error'}`,
      };
      this.cachedResults.set(url, { result, timestamp: Date.now() });
      return result;
    }
  }
  
  /**
   * Get detailed analysis of a website's metrics
   */
  async getWebsiteMetrics(url: string): Promise<WebsiteMetrics> {
    url = this.normalizeUrl(url);
    
    try {
      // Perform verification first
      const verification = await this.verifyWebsite(url);
      
      // Start with the main page metrics
      let totalPages = 1;
      let contentQualityScore = verification.details.hasRealContent ? 0.7 : 0.3;
      let functionalityScore = verification.details.hasInteractiveElements ? 0.7 : 0.3;
      let designScore = 0.5; // Default moderate score
      
      // If main page verification was successful, try to crawl a few more pages
      if (verification.success) {
        const response = await axios.get(url);
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        
        // Extract internal links to analyze more pages
        const navLinks = document.querySelectorAll('a');
        const internalLinks = Array.from(navLinks)
          .map(link => link.getAttribute('href'))
          .filter(href => href && (href.startsWith('/') || href.includes(new URL(url).hostname)))
          .map(href => {
            if (href.startsWith('/')) {
              return new URL(url).origin + href;
            }
            return href;
          })
          .slice(0, 3); // Limit to 3 additional pages for analysis
          
        // Analyze up to 3 more pages
        for (const link of internalLinks) {
          try {
            const pageResponse = await axios.get(link, { timeout: 5000 });
            if (pageResponse.status === 200) {
              totalPages++;
              
              const pageDom = new JSDOM(pageResponse.data);
              const pageDocument = pageDom.window.document;
              
              // Check content quality on this page
              const contentElements = pageDocument.querySelectorAll('p, h1, h2, h3, h4, h5, h6, article, section');
              const contentText = Array.from(contentElements).map(el => el.textContent).join(' ');
              if (contentText.length > 500 && 
                  !contentText.toLowerCase().includes('lorem ipsum') &&
                  !contentText.toLowerCase().includes('placeholder')) {
                contentQualityScore += 0.1; // Increment score for each page with real content
              }
              
              // Check functionality on this page
              const interactiveElements = pageDocument.querySelectorAll('form, button, input, select, textarea');
              if (interactiveElements.length > 0) {
                functionalityScore += 0.1; // Increment score for each page with interactive elements
              }
              
              // Check design consistency (simple heuristic for CSS class usage)
              const cssClasses = pageDocument.querySelectorAll('[class]');
              if (cssClasses.length > 10) { // Arbitrary threshold for designed pages
                designScore += 0.1;
              }
            }
          } catch (error) {
            console.error(`Error analyzing page ${link}:`, error);
            // Don't increment page count for failed pages
          }
        }
      }
      
      // Normalize scores to be between 0 and 1
      contentQualityScore = Math.min(contentQualityScore, 1);
      functionalityScore = Math.min(functionalityScore, 1);
      designScore = Math.min(designScore, 1);
      
      // Calculate overall score (weighted average)
      const overallScore = (
        contentQualityScore * 0.4 + // Content is most important (40%)
        functionalityScore * 0.35 + // Functionality is next (35%)
        designScore * 0.25 // Design is least important but still relevant (25%)
      );
      
      return {
        totalPages,
        contentQualityScore,
        functionalityScore,
        designScore,
        overallScore
      };
    } catch (error) {
      console.error(`Error getting website metrics for ${url}:`, error);
      return {
        totalPages: 0,
        contentQualityScore: 0,
        functionalityScore: 0,
        designScore: 0,
        overallScore: 0
      };
    }
  }
  
  /**
   * Verify a website for an entrepreneur profile and store the results
   */
  async verifyEntrepreneurWebsite(profileId: number): Promise<VerificationResult> {
    try {
      // Get the entrepreneur profile
      const profile = await storage.getEntrepreneurProfile(profileId);
      if (!profile || !profile.websiteUrl) {
        return {
          success: false,
          score: 0,
          details: {
            hasMultiplePages: false,
            hasRealContent: false,
            hasInteractiveElements: false,
            hasContactInfo: false,
            pageLoadTime: 0,
            pageSize: 0,
            metaTagsScore: 0
          },
          message: 'No website URL found in entrepreneur profile',
        };
      }
      
      // Verify the website
      const result = await this.verifyWebsite(profile.websiteUrl);
      
      // If verification was successful, get detailed metrics
      if (result.success) {
        const metrics = await this.getWebsiteMetrics(profile.websiteUrl);
        
        // Update the entrepreneur profile with metrics data
        await storage.updateEntrepreneurProfile(profileId, {
          websiteVerified: true,
          metricsData: JSON.stringify({
            verificationScore: result.score,
            websiteMetrics: metrics,
            verifiedAt: new Date().toISOString()
          })
        });
      } else {
        // Update the profile with failed verification
        await storage.updateEntrepreneurProfile(profileId, {
          websiteVerified: false,
          metricsData: JSON.stringify({
            verificationScore: result.score,
            verificationMessage: result.message,
            verifiedAt: new Date().toISOString()
          })
        });
      }
      
      return result;
    } catch (error) {
      console.error(`Error verifying entrepreneur website:`, error);
      return {
        success: false,
        score: 0,
        details: {
          hasMultiplePages: false,
          hasRealContent: false,
          hasInteractiveElements: false,
          hasContactInfo: false,
          pageLoadTime: 0,
          pageSize: 0,
          metaTagsScore: 0
        },
        message: `Verification error: ${error.message || 'Unknown error'}`,
      };
    }
  }
  
  /**
   * Normalize URL by adding protocol if missing and removing trailing slash
   */
  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  
  /**
   * Calculate overall verification score based on detailed metrics
   */
  private calculateScore(details: {
    hasMultiplePages: boolean;
    hasRealContent: boolean;
    hasInteractiveElements: boolean;
    hasContactInfo: boolean;
    metaTagsScore: number;
  }): number {
    let score = 0;
    
    // Weight factors
    const weights = {
      multiplePages: 0.25,
      realContent: 0.35,
      interactiveElements: 0.2,
      contactInfo: 0.1,
      metaTags: 0.1
    };
    
    // Calculate score components
    if (details.hasMultiplePages) score += weights.multiplePages;
    if (details.hasRealContent) score += weights.realContent;
    if (details.hasInteractiveElements) score += weights.interactiveElements;
    if (details.hasContactInfo) score += weights.contactInfo;
    
    // Meta tags score (0-3 scale normalized to 0-1)
    score += (details.metaTagsScore / 3) * weights.metaTags;
    
    return Math.min(Math.max(score, 0), 1); // Ensure score is between 0 and 1
  }
}