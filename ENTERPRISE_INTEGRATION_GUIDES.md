# TSMO Enterprise Integration Guides

## Overview

This comprehensive guide provides step-by-step integration instructions for enterprise clients implementing TSMO's intellectual property protection platform. Designed for Fortune 500 companies, government agencies, and large organizations requiring enterprise-grade IP protection.

## Quick Start Guide

### Prerequisites

Before integrating with TSMO's enterprise platform:

1. **Enterprise Account Setup**
   - Contact enterprise-sales@tsmowatch.com
   - Receive dedicated customer success manager
   - Complete security questionnaire and compliance review

2. **Technical Requirements**
   - HTTPS-enabled endpoints for webhooks
   - API key management system
   - SSL/TLS certificate for secure communications
   - Firewall configuration for TSMO IP ranges

3. **Access Credentials**
   - Enterprise API key with appropriate permissions
   - Webhook secrets for payload verification
   - Dashboard access with role-based permissions

### 5-Minute Integration

```javascript
// Initialize TSMO Enterprise Client
const TSMOClient = require('@tsmo/enterprise-sdk');

const client = new TSMOClient({
  apiKey: process.env.TSMO_ENTERPRISE_API_KEY,
  environment: 'production', // or 'sandbox'
  timeout: 30000,
  retries: 3
});

// Upload and protect intellectual property
async function protectIP() {
  try {
    // Create a portfolio for organization
    const portfolio = await client.portfolios.create({
      name: 'Enterprise Digital Assets',
      description: 'Company logos, marketing materials, product images',
      monitoring_frequency: 'real_time'
    });

    // Upload artwork for protection
    const artwork = await client.artwork.upload({
      portfolio_id: portfolio.id,
      file: 'path/to/company-logo.png',
      title: 'Company Logo',
      description: 'Primary brand logo for trademark monitoring',
      protection_level: 'maximum'
    });

    // Enable real-time monitoring
    await client.monitoring.enable({
      portfolio_id: portfolio.id,
      platforms: ['youtube', 'instagram', 'tiktok', 'facebook'],
      alert_webhooks: ['https://your-company.com/webhooks/tsmo']
    });

    console.log('IP protection enabled successfully');
  } catch (error) {
    console.error('Integration error:', error);
  }
}

protectIP();
```

## Integration Patterns

### 1. Brand Protection Integration

For companies protecting logos, trademarks, and brand assets:

```javascript
// Brand Protection Workflow
class BrandProtectionWorkflow {
  constructor(tsmoClient) {
    this.client = tsmoClient;
    this.brandAssets = new Map();
  }

  async setupBrandMonitoring(brandAssets) {
    // Create brand-specific portfolios
    const brandPortfolio = await this.client.portfolios.create({
      name: 'Brand Assets Protection',
      classification: 'trademark_sensitive',
      monitoring_settings: {
        similarity_threshold: 0.8,
        geographic_scope: 'global',
        platform_coverage: 'comprehensive'
      }
    });

    // Upload brand assets with metadata
    for (const asset of brandAssets) {
      const uploadedAsset = await this.client.artwork.upload({
        portfolio_id: brandPortfolio.id,
        file: asset.file_path,
        metadata: {
          asset_type: 'logo',
          trademark_number: asset.trademark_id,
          protection_classes: asset.nice_classifications,
          geographic_protection: asset.territories,
          usage_guidelines: asset.brand_guidelines
        }
      });

      this.brandAssets.set(asset.id, uploadedAsset);
    }

    // Configure advanced monitoring
    await this.client.monitoring.configure({
      portfolio_id: brandPortfolio.id,
      detection_modes: ['visual_similarity', 'text_matching', 'audio_recognition'],
      enforcement_actions: {
        automatic_dmca: true,
        platform_reporting: true,
        legal_notification: 'high_confidence_only'
      }
    });

    return brandPortfolio;
  }

  async handleBrandViolation(violation) {
    const enforcement_strategy = this.determineEnforcementStrategy(violation);
    
    switch (enforcement_strategy) {
      case 'immediate_takedown':
        return await this.client.enforcement.dmca({
          violation_id: violation.id,
          priority: 'urgent',
          legal_representative: 'internal_counsel'
        });
        
      case 'cease_and_desist':
        return await this.client.enforcement.ceaseAndDesist({
          violation_id: violation.id,
          template: 'trademark_infringement',
          sender: 'legal_department'
        });
        
      case 'platform_report':
        return await this.client.enforcement.platformReport({
          violation_id: violation.id,
          platform: violation.platform,
          violation_type: 'trademark'
        });
    }
  }
}
```

### 2. Content Creator Protection

For creators, artists, and content producers:

```javascript
// Creator Protection Integration
class CreatorProtectionPlatform {
  constructor(tsmoClient) {
    this.client = tsmoClient;
    this.creatorProfiles = new Map();
  }

  async onboardCreator(creatorData) {
    // Create creator-specific portfolio
    const creatorPortfolio = await this.client.portfolios.create({
      name: `${creatorData.name} - Protected Works`,
      creator_id: creatorData.id,
      protection_settings: {
        ai_training_protection: true,
        deepfake_detection: true,
        unauthorized_distribution: true
      }
    });

    // Bulk upload creator's works
    const uploadPromises = creatorData.works.map(work => 
      this.client.artwork.upload({
        portfolio_id: creatorPortfolio.id,
        file: work.file_path,
        metadata: {
          creation_date: work.created_at,
          copyright_notice: work.copyright,
          usage_rights: work.license_terms,
          revenue_tracking: work.monetization_enabled
        }
      })
    );

    await Promise.all(uploadPromises);

    // Enable comprehensive monitoring
    await this.client.monitoring.enable({
      portfolio_id: creatorPortfolio.id,
      monitoring_modes: {
        social_media: true,
        ai_training_datasets: true,
        nft_marketplaces: true,
        image_search_engines: true
      },
      alert_preferences: {
        real_time_notifications: true,
        weekly_digest: true,
        threshold_alerts: 'medium_confidence'
      }
    });

    this.creatorProfiles.set(creatorData.id, creatorPortfolio);
    return creatorPortfolio;
  }

  async generateCreatorReport(creatorId, timeframe) {
    const portfolio = this.creatorProfiles.get(creatorId);
    
    const report = await this.client.analytics.generate({
      portfolio_id: portfolio.id,
      report_type: 'creator_protection_summary',
      timeframe: timeframe,
      include_sections: [
        'threat_summary',
        'enforcement_actions',
        'platform_distribution',
        'revenue_impact',
        'protection_recommendations'
      ]
    });

    return report;
  }
}
```

### 3. Enterprise DAM Integration

Integrate with Digital Asset Management systems:

```javascript
// Enterprise DAM Integration
class DAMIntegration {
  constructor(tsmoClient, damConfig) {
    this.client = tsmoClient;
    this.dam = this.initializeDAM(damConfig);
    this.syncQueue = [];
  }

  async syncAssetToTSMO(assetId) {
    try {
      // Fetch asset from DAM
      const damAsset = await this.dam.getAsset(assetId);
      
      // Determine protection requirements based on asset metadata
      const protectionLevel = this.calculateProtectionLevel(damAsset);
      
      // Upload to TSMO with enhanced metadata
      const tsmoAsset = await this.client.artwork.upload({
        portfolio_id: damAsset.portfolio_mapping,
        file: damAsset.file_url,
        metadata: {
          dam_asset_id: assetId,
          asset_classification: damAsset.classification,
          business_unit: damAsset.owner_department,
          usage_rights: damAsset.licensing_info,
          brand_guidelines: damAsset.brand_compliance,
          protection_level: protectionLevel
        }
      });

      // Update DAM with TSMO protection status
      await this.dam.updateAsset(assetId, {
        tsmo_protection_id: tsmoAsset.id,
        protection_status: 'active',
        monitoring_enabled: true,
        last_scan: new Date().toISOString()
      });

      return tsmoAsset;
    } catch (error) {
      console.error('DAM sync error:', error);
      throw error;
    }
  }

  calculateProtectionLevel(asset) {
    const factors = {
      brandCritical: asset.tags.includes('brand_critical') ? 3 : 0,
      publicFacing: asset.usage_context.includes('external') ? 2 : 0,
      revenueGenerating: asset.revenue_impact === 'high' ? 2 : 0,
      trademarked: asset.legal_status.includes('trademark') ? 3 : 0
    };

    const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
    
    if (totalScore >= 8) return 'maximum';
    if (totalScore >= 5) return 'high';
    if (totalScore >= 2) return 'standard';
    return 'basic';
  }

  async batchSync(assetIds, batchSize = 10) {
    const batches = this.chunkArray(assetIds, batchSize);
    
    for (const batch of batches) {
      const syncPromises = batch.map(id => this.syncAssetToTSMO(id));
      await Promise.allSettled(syncPromises);
      
      // Rate limiting
      await this.delay(1000);
    }
  }
}
```

## Platform-Specific Integrations

### CRM Integration (Salesforce)

```javascript
// Salesforce Integration for IP Management
class SalesforceIPIntegration {
  constructor(tsmoClient, salesforceClient) {
    this.tsmo = tsmoClient;
    this.sf = salesforceClient;
  }

  async createIPProtectionCase(accountId, violationData) {
    // Create case in Salesforce
    const sfCase = await this.sf.sobject('Case').create({
      AccountId: accountId,
      Subject: `IP Violation - ${violationData.platform}`,
      Description: violationData.description,
      Type: 'IP Protection',
      Priority: violationData.severity === 'high' ? 'High' : 'Medium',
      TSMO_Violation_ID__c: violationData.id,
      Platform__c: violationData.platform,
      Confidence_Score__c: violationData.confidence_score
    });

    // Update TSMO with Salesforce case reference
    await this.tsmo.violations.update(violationData.id, {
      external_case_id: sfCase.id,
      case_management_system: 'salesforce'
    });

    return sfCase;
  }

  async syncViolationStatus(violationId, status) {
    // Update both systems
    await Promise.all([
      this.tsmo.violations.updateStatus(violationId, status),
      this.sf.sobject('Case').update({
        TSMO_Violation_ID__c: violationId,
        Status: this.mapTSMOStatusToSF(status)
      })
    ]);
  }
}
```

### ERP Integration (SAP)

```javascript
// SAP ERP Integration for Asset Management
class SAPAssetIntegration {
  constructor(tsmoClient, sapClient) {
    this.tsmo = tsmoClient;
    this.sap = sapClient;
  }

  async syncIntellectualPropertyAssets() {
    // Fetch IP assets from SAP
    const sapAssets = await this.sap.getIntellectualPropertyAssets();
    
    for (const asset of sapAssets) {
      await this.protectSAPAsset(asset);
    }
  }

  async protectSAPAsset(sapAsset) {
    const portfolio = await this.getOrCreatePortfolio(sapAsset.company_code);
    
    const tsmoAsset = await this.tsmo.artwork.upload({
      portfolio_id: portfolio.id,
      file: sapAsset.digital_representation,
      metadata: {
        sap_asset_id: sapAsset.asset_number,
        cost_center: sapAsset.cost_center,
        depreciation_class: sapAsset.asset_class,
        book_value: sapAsset.net_book_value,
        acquisition_date: sapAsset.capitalization_date
      }
    });

    // Update SAP with TSMO protection details
    await this.sap.updateAsset(sapAsset.asset_number, {
      tsmo_protection_id: tsmoAsset.id,
      ip_protection_status: 'ACTIVE',
      monitoring_service: 'TSMO_ENTERPRISE'
    });
  }
}
```

### Microsoft 365 Integration

```javascript
// Microsoft 365 SharePoint Integration
class SharePointIntegration {
  constructor(tsmoClient, graphClient) {
    this.tsmo = tsmoClient;
    this.graph = graphClient;
  }

  async monitorSharePointLibrary(siteId, libraryId) {
    // Set up SharePoint webhook for new files
    const webhook = await this.graph
      .sites(siteId)
      .lists(libraryId)
      .subscriptions
      .post({
        changeType: 'created,updated',
        notificationUrl: 'https://your-app.com/webhooks/sharepoint',
        resource: `/sites/${siteId}/lists/${libraryId}/items`,
        expirationDateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

    return webhook;
  }

  async handleSharePointWebhook(notification) {
    for (const value of notification.value) {
      if (value.changeType === 'created') {
        const item = await this.graph
          .sites(value.siteId)
          .lists(value.listId)
          .items(value.itemId)
          .get();

        if (this.shouldProtectFile(item)) {
          await this.protectSharePointFile(item);
        }
      }
    }
  }

  async protectSharePointFile(item) {
    const fileContent = await this.graph
      .sites(item.parentReference.siteId)
      .drives(item.parentReference.driveId)
      .items(item.id)
      .content
      .get();

    const portfolio = await this.getCompanyPortfolio();
    
    await this.tsmo.artwork.upload({
      portfolio_id: portfolio.id,
      file: fileContent,
      metadata: {
        sharepoint_item_id: item.id,
        site_name: item.parentReference.siteName,
        created_by: item.createdBy.user.displayName,
        last_modified: item.lastModifiedDateTime,
        content_type: item.file.mimeType
      }
    });
  }
}
```

## Webhook Integration Examples

### Enterprise Webhook Handler

```javascript
// Comprehensive webhook handling for enterprise environments
const express = require('express');
const crypto = require('crypto');
const app = express();

// Middleware for webhook verification
const verifyTSMOWebhook = (req, res, next) => {
  const signature = req.headers['x-tsmo-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.TSMO_WEBHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  if (signature !== `sha256=${expectedSignature}`) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};

// Enterprise webhook endpoint
app.post('/webhooks/tsmo', express.json(), verifyTSMOWebhook, async (req, res) => {
  const event = req.body;
  
  try {
    switch (event.event_type) {
      case 'threat_detected':
        await handleThreatDetected(event.data);
        break;
        
      case 'ai_violation_detected':
        await handleAIViolation(event.data);
        break;
        
      case 'dmca_response_received':
        await handleDMCAResponse(event.data);
        break;
        
      case 'portfolio_scan_completed':
        await handleScanComplete(event.data);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

async function handleThreatDetected(data) {
  // Multi-channel notification system
  const notifications = [
    sendSlackAlert(data),
    createJiraTicket(data),
    updateDashboard(data),
    triggerAutomatedResponse(data)
  ];

  await Promise.allSettled(notifications);
  
  // Escalate high-severity threats
  if (data.severity === 'critical') {
    await escalateToLegalTeam(data);
  }
}

async function handleAIViolation(data) {
  // AI violation requires specialized handling
  await Promise.all([
    notifyIPCounsel(data),
    preserveEvidence(data),
    assessLegalOptions(data),
    updateAIProtectionRegistry(data)
  ]);
}
```

### Multi-Tenant Webhook Distribution

```javascript
// Enterprise multi-tenant webhook distribution
class EnterpriseWebhookRouter {
  constructor() {
    this.tenantConfigs = new Map();
    this.webhookQueue = [];
  }

  async routeWebhook(event) {
    const tenant = this.getTenantFromEvent(event);
    const config = this.tenantConfigs.get(tenant.id);

    if (!config) {
      console.error(`No webhook config for tenant: ${tenant.id}`);
      return;
    }

    // Transform payload based on tenant preferences
    const transformedPayload = this.transformPayload(event, config.transform_rules);

    // Route to multiple endpoints based on event type
    const endpoints = config.endpoints.filter(endpoint => 
      endpoint.event_types.includes(event.event_type)
    );

    const deliveryPromises = endpoints.map(endpoint => 
      this.deliverWebhook(endpoint, transformedPayload)
    );

    const results = await Promise.allSettled(deliveryPromises);
    
    // Log delivery results for monitoring
    this.logDeliveryResults(event, results);
  }

  async deliverWebhook(endpoint, payload) {
    const maxRetries = endpoint.retry_config?.max_attempts || 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-TSMO-Signature': this.generateSignature(payload, endpoint.secret),
            'X-Tenant-ID': endpoint.tenant_id,
            ...endpoint.custom_headers
          },
          body: JSON.stringify(payload),
          timeout: endpoint.timeout || 30000
        });

        if (response.ok) {
          return { success: true, status: response.status };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        attempt++;
        
        if (attempt >= maxRetries) {
          return { success: false, error: error.message, attempts: attempt };
        }

        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 30000);
        await this.sleep(delay);
      }
    }
  }
}
```

## SDK Examples

### Node.js Enterprise SDK

```javascript
// Advanced Node.js SDK usage
const { TSMOEnterpriseClient, BatchProcessor, EventStream } = require('@tsmo/enterprise-sdk');

class TSMOEnterpriseManager {
  constructor(config) {
    this.client = new TSMOEnterpriseClient({
      apiKey: config.apiKey,
      region: config.region || 'us-east-1',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      rateLimit: {
        requests: 1000,
        window: 60000 // 1000 requests per minute
      }
    });

    this.batchProcessor = new BatchProcessor({
      batchSize: 50,
      flushInterval: 5000,
      maxConcurrency: 5
    });

    this.eventStream = new EventStream({
      channels: ['threat-detection', 'ai-violations'],
      reconnect: true,
      heartbeat: 30000
    });
  }

  async bulkUploadAssets(assets) {
    const uploadQueue = assets.map(asset => ({
      operation: 'upload',
      data: asset
    }));

    return await this.batchProcessor.process(uploadQueue, async (batch) => {
      const results = await this.client.artwork.bulkUpload(batch);
      
      // Update local tracking
      for (const result of results) {
        if (result.success) {
          await this.updateAssetRegistry(result.asset_id, result.tsmo_id);
        }
      }
      
      return results;
    });
  }

  async startRealtimeMonitoring() {
    await this.eventStream.connect();

    this.eventStream.on('threat_detected', async (event) => {
      await this.handleRealtimeThreat(event);
    });

    this.eventStream.on('ai_violation', async (event) => {
      await this.handleAIViolation(event);
    });

    this.eventStream.on('error', (error) => {
      console.error('EventStream error:', error);
      // Implement custom error handling
    });
  }

  async generateComplianceReport(options) {
    const report = await this.client.compliance.generateReport({
      type: 'enterprise_protection_summary',
      timeframe: options.timeframe,
      include_violations: true,
      include_enforcement_actions: true,
      format: 'pdf',
      compliance_frameworks: ['soc2', 'gdpr', 'ccpa']
    });

    return report;
  }
}
```

### Python Enterprise SDK

```python
# Advanced Python SDK usage
from tsmo_enterprise import TSMOClient, AsyncBatchUploader, RealtimeMonitor
import asyncio
import logging

class TSMOEnterpriseManager:
    def __init__(self, config):
        self.client = TSMOClient(
            api_key=config['api_key'],
            region=config.get('region', 'us-east-1'),
            timeout=config.get('timeout', 30),
            max_retries=config.get('retries', 3)
        )
        
        self.batch_uploader = AsyncBatchUploader(
            client=self.client,
            batch_size=50,
            max_concurrent_batches=5
        )
        
        self.monitor = RealtimeMonitor(
            client=self.client,
            channels=['threat-detection', 'ai-violations']
        )

    async def bulk_protect_assets(self, asset_manifest):
        """Bulk upload and protect assets from manifest file"""
        try:
            results = await self.batch_uploader.upload_from_manifest(
                manifest_path=asset_manifest,
                progress_callback=self._upload_progress
            )
            
            # Generate protection summary
            summary = {
                'total_assets': len(results),
                'successful_uploads': len([r for r in results if r.success]),
                'failed_uploads': len([r for r in results if not r.success]),
                'protection_coverage': self._calculate_coverage(results)
            }
            
            return summary
            
        except Exception as e:
            logging.error(f"Bulk upload failed: {e}")
            raise

    async def start_monitoring(self):
        """Start real-time threat monitoring"""
        await self.monitor.connect()
        
        @self.monitor.on('threat_detected')
        async def handle_threat(event):
            await self._process_threat_detection(event)
        
        @self.monitor.on('ai_violation')
        async def handle_ai_violation(event):
            await self._process_ai_violation(event)
        
        # Keep monitoring active
        await self.monitor.listen()

    async def generate_executive_dashboard(self, timeframe='30d'):
        """Generate executive-level dashboard data"""
        dashboard_data = await self.client.analytics.executive_summary(
            timeframe=timeframe,
            metrics=[
                'total_assets_protected',
                'threats_detected',
                'threats_resolved',
                'enforcement_success_rate',
                'protection_roi',
                'compliance_score'
            ]
        )
        
        return dashboard_data

    def _upload_progress(self, completed, total):
        """Progress callback for batch uploads"""
        percentage = (completed / total) * 100
        print(f"Upload progress: {percentage:.1f}% ({completed}/{total})")
```

## Monitoring & Analytics Integration

### Enterprise Dashboard Integration

```javascript
// Custom dashboard data aggregation
class EnterpriseDashboard {
  constructor(tsmoClient) {
    this.client = tsmoClient;
    this.cache = new Map();
    this.refreshInterval = 5 * 60 * 1000; // 5 minutes
  }

  async getDashboardData(organizationId, timeframe = '30d') {
    const cacheKey = `dashboard_${organizationId}_${timeframe}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.refreshInterval) {
        return cached.data;
      }
    }

    const data = await this.fetchDashboardData(organizationId, timeframe);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  async fetchDashboardData(organizationId, timeframe) {
    const [
      protectionStats,
      threatAnalytics,
      enforcementMetrics,
      complianceStatus,
      performanceMetrics
    ] = await Promise.all([
      this.client.analytics.protectionStats({ organizationId, timeframe }),
      this.client.analytics.threatAnalytics({ organizationId, timeframe }),
      this.client.analytics.enforcementMetrics({ organizationId, timeframe }),
      this.client.compliance.status({ organizationId }),
      this.client.analytics.performance({ organizationId, timeframe })
    ]);

    return {
      summary: {
        total_assets: protectionStats.total_assets,
        active_monitoring: protectionStats.active_monitoring_sessions,
        threats_detected: threatAnalytics.total_threats,
        threats_resolved: enforcementMetrics.resolved_cases,
        protection_score: this.calculateProtectionScore(protectionStats, threatAnalytics)
      },
      
      threat_trends: threatAnalytics.trends,
      
      platform_distribution: threatAnalytics.platform_breakdown,
      
      enforcement_effectiveness: {
        dmca_success_rate: enforcementMetrics.dmca_success_rate,
        average_resolution_time: enforcementMetrics.avg_resolution_time,
        platform_response_rates: enforcementMetrics.platform_responses
      },
      
      compliance_dashboard: {
        overall_score: complianceStatus.score,
        framework_compliance: complianceStatus.frameworks,
        recent_audits: complianceStatus.recent_audits
      },
      
      performance_metrics: {
        api_response_times: performanceMetrics.api_latency,
        monitoring_coverage: performanceMetrics.coverage_percentage,
        system_uptime: performanceMetrics.uptime
      }
    };
  }
}
```

### Business Intelligence Integration

```sql
-- Enterprise data warehouse integration
-- Example views for business intelligence tools

CREATE VIEW enterprise_protection_metrics AS
SELECT 
  p.id as portfolio_id,
  p.name as portfolio_name,
  p.user_id as organization_id,
  COUNT(a.id) as total_assets,
  COUNT(CASE WHEN a.status = 'active' THEN 1 END) as protected_assets,
  COUNT(t.id) as total_threats,
  COUNT(CASE WHEN t.severity = 'high' THEN 1 END) as high_severity_threats,
  COUNT(CASE WHEN t.status = 'resolved' THEN 1 END) as resolved_threats,
  AVG(t.confidence_score) as avg_confidence_score,
  DATE_TRUNC('month', p.created_at) as protection_start_month
FROM portfolios p
LEFT JOIN artwork a ON p.id = a.portfolio_id
LEFT JOIN threats t ON a.id = t.artwork_id
WHERE p.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY p.id, p.name, p.user_id, DATE_TRUNC('month', p.created_at);

CREATE VIEW enforcement_effectiveness AS
SELECT 
  t.platform,
  COUNT(*) as total_cases,
  COUNT(CASE WHEN e.status = 'successful' THEN 1 END) as successful_cases,
  AVG(EXTRACT(EPOCH FROM (e.resolved_at - e.initiated_at))/3600) as avg_resolution_hours,
  COUNT(CASE WHEN e.action_type = 'dmca' THEN 1 END) as dmca_actions,
  COUNT(CASE WHEN e.action_type = 'platform_report' THEN 1 END) as platform_reports
FROM threats t
JOIN enforcement_actions e ON t.id = e.threat_id
WHERE e.initiated_at >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY t.platform;
```

## Best Practices

### 1. Error Handling & Resilience

```javascript
// Comprehensive error handling strategy
class ResilientTSMOIntegration {
  constructor(config) {
    this.client = new TSMOClient(config);
    this.circuitBreaker = new CircuitBreaker(this.client, {
      timeout: 30000,
      errorThresholdPercentage: 50,
      resetTimeout: 60000
    });
    this.retryQueue = new RetryQueue();
  }

  async uploadWithResilience(assetData) {
    try {
      return await this.circuitBreaker.fire(async () => {
        return await this.client.artwork.upload(assetData);
      });
    } catch (error) {
      if (this.isRetryableError(error)) {
        await this.retryQueue.add({
          operation: 'upload',
          data: assetData,
          attempts: 0,
          maxAttempts: 3
        });
        
        return { queued: true, message: 'Upload queued for retry' };
      }
      
      throw error;
    }
  }

  isRetryableError(error) {
    const retryableCodes = [408, 429, 500, 502, 503, 504];
    return retryableCodes.includes(error.status) || 
           error.code === 'NETWORK_ERROR' ||
           error.code === 'TIMEOUT';
  }
}
```

### 2. Performance Optimization

```javascript
// Performance optimization strategies
class OptimizedTSMOClient {
  constructor(config) {
    this.client = new TSMOClient(config);
    this.cache = new LRUCache({ max: 1000, ttl: 5 * 60 * 1000 });
    this.requestQueue = new PriorityQueue();
    this.connectionPool = new ConnectionPool({ maxConnections: 10 });
  }

  async batchOperations(operations) {
    // Group operations by type for batching
    const grouped = operations.reduce((groups, op) => {
      const key = `${op.type}_${op.portfolio_id}`;
      groups[key] = groups[key] || [];
      groups[key].push(op);
      return groups;
    }, {});

    // Process batches concurrently with rate limiting
    const results = await this.processBatchesConcurrently(grouped);
    return results;
  }

  async getCachedPortfolioData(portfolioId) {
    const cacheKey = `portfolio_${portfolioId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const data = await this.client.portfolios.get(portfolioId);
    this.cache.set(cacheKey, data);
    return data;
  }

  async optimizedFileUpload(file) {
    // Check if file already exists using hash
    const fileHash = await this.calculateFileHash(file);
    const existing = await this.client.artwork.findByHash(fileHash);
    
    if (existing) {
      return { deduplicated: true, asset: existing };
    }

    // Compress image before upload if applicable
    const optimizedFile = await this.optimizeFile(file);
    
    return await this.client.artwork.upload({
      file: optimizedFile,
      hash: fileHash
    });
  }
}
```

### 3. Security Best Practices

```javascript
// Security implementation guidelines
class SecureTSMOIntegration {
  constructor(config) {
    this.client = new TSMOClient({
      ...config,
      tls: {
        minVersion: 'TLSv1.3',
        ciphers: 'ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM',
        honorCipherOrder: true
      }
    });
    
    this.keyRotation = new KeyRotationManager();
    this.auditLogger = new AuditLogger();
  }

  async secureUpload(assetData, user) {
    // Validate user permissions
    await this.validateUserPermissions(user, 'upload');
    
    // Scan file for malware
    await this.scanFile(assetData.file);
    
    // Encrypt sensitive metadata
    const encryptedMetadata = await this.encryptMetadata(assetData.metadata);
    
    // Log the operation
    await this.auditLogger.log({
      action: 'asset_upload',
      user_id: user.id,
      asset_hash: await this.calculateHash(assetData.file),
      timestamp: new Date().toISOString()
    });

    return await this.client.artwork.upload({
      ...assetData,
      metadata: encryptedMetadata
    });
  }

  async rotateApiKeys() {
    const newKey = await this.keyRotation.generateNewKey();
    
    // Update client configuration
    this.client.updateApiKey(newKey);
    
    // Update all webhook configurations
    await this.updateWebhookSecrets();
    
    // Revoke old key after grace period
    setTimeout(async () => {
      await this.keyRotation.revokeOldKey();
    }, 24 * 60 * 60 * 1000); // 24 hour grace period
  }
}
```

## Support & Resources

### Implementation Support

- **Enterprise Onboarding**: Dedicated customer success manager
- **Technical Integration**: Solutions architect consultation
- **Custom Development**: Professional services for complex integrations
- **Training Programs**: Developer certification and training

### Documentation & Resources

- **API Reference**: [docs.tsmowatch.com/api](https://docs.tsmowatch.com/api)
- **SDK Documentation**: [docs.tsmowatch.com/sdks](https://docs.tsmowatch.com/sdks)
- **Integration Examples**: [github.com/tsmo/integration-examples](https://github.com/tsmo/integration-examples)
- **Video Tutorials**: [learn.tsmowatch.com](https://learn.tsmowatch.com)

### Enterprise Support

- **24/7 Support**: enterprise-support@tsmowatch.com
- **Emergency Hotline**: +1-800-TSMO-HELP
- **Technical Support**: technical-support@tsmowatch.com
- **Account Management**: success@tsmowatch.com

### Community & Forums

- **Developer Forum**: [community.tsmowatch.com](https://community.tsmowatch.com)
- **Stack Overflow**: Tag questions with `tsmo-enterprise`
- **GitHub Discussions**: [github.com/tsmo/enterprise-sdk/discussions](https://github.com/tsmo/enterprise-sdk/discussions)
- **Status Updates**: [status.tsmowatch.com](https://status.tsmowatch.com)

---

*This integration guide is updated quarterly with new features and best practices. For the latest version, visit [docs.tsmowatch.com/enterprise](https://docs.tsmowatch.com/enterprise)*