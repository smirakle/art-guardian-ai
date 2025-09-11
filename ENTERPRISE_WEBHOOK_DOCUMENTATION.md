# TSMO Enterprise Webhook System Documentation

## Overview

TSMO's Enterprise Webhook System provides reliable, secure, and scalable HTTP callbacks for real-time event notifications. Built for mission-critical enterprise operations with guaranteed delivery, retry logic, and comprehensive monitoring.

## Getting Started

### 1. Webhook Configuration

Configure webhooks through the Enterprise Dashboard or API:

```bash
curl -X POST https://api.tsmowatch.com/v1/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/tsmo",
    "events": ["threat_detected", "ai_violation_found", "dmca_sent"],
    "secret": "your_webhook_secret_key",
    "active": true,
    "retry_config": {
      "max_attempts": 5,
      "initial_delay_ms": 1000,
      "backoff_multiplier": 2
    }
  }'
```

### 2. Webhook Endpoint Implementation

Your webhook endpoint must:
- Accept POST requests
- Return HTTP 200-299 for successful processing
- Respond within 30 seconds
- Verify webhook signatures

```javascript
// Express.js example
app.post('/webhooks/tsmo', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-tsmo-signature'];
  
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(req.body);
  
  try {
    processWebhookEvent(event);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Processing failed');
  }
});
```

## Event Types

### Threat Detection Events

#### threat_detected
Fired when a new threat is identified against protected content.

```json
{
  "event_id": "evt_threat_123456",
  "event_type": "threat_detected",
  "timestamp": "2024-01-15T10:30:00Z",
  "api_version": "2024-01",
  "data": {
    "threat_id": "threat_789abc",
    "user_id": "user_123",
    "portfolio_id": "portfolio_456",
    "artwork_id": "artwork_789",
    "severity": "high",
    "confidence_score": 0.95,
    "platform": "youtube",
    "platform_url": "https://youtube.com/watch?v=example",
    "content_type": "video",
    "detected_violations": ["copyright", "trademark"],
    "similarity_metrics": {
      "visual_similarity": 0.98,
      "audio_similarity": 0.92,
      "metadata_match": true
    },
    "automated_actions": {
      "dmca_notice": "scheduled",
      "takedown_request": "sent",
      "legal_notification": "pending"
    },
    "geographic_data": {
      "detected_country": "US",
      "platform_jurisdiction": "US",
      "applicable_laws": ["DMCA", "USC_17"]
    }
  }
}
```

#### threat_resolved
Fired when a threat has been successfully resolved.

```json
{
  "event_id": "evt_resolved_123456",
  "event_type": "threat_resolved",
  "timestamp": "2024-01-15T14:30:00Z",
  "api_version": "2024-01",
  "data": {
    "threat_id": "threat_789abc",
    "resolution_method": "dmca_takedown",
    "resolution_time_hours": 4.5,
    "platform_response": "content_removed",
    "legal_actions_taken": ["dmca_notice", "platform_complaint"],
    "final_status": "content_removed",
    "evidence_preserved": true,
    "case_number": "case_2024_001234"
  }
}
```

### AI Training Violation Events

#### ai_violation_detected
Fired when unauthorized AI training usage is detected.

```json
{
  "event_id": "evt_ai_violation_123",
  "event_type": "ai_violation_detected",
  "timestamp": "2024-01-15T11:00:00Z",
  "api_version": "2024-01",
  "data": {
    "violation_id": "ai_viol_456def",
    "user_id": "user_123",
    "artwork_id": "artwork_789",
    "ai_model_detected": "stable-diffusion-xl",
    "training_dataset": "laion-5b",
    "confidence_score": 0.89,
    "evidence": {
      "fingerprint_match": true,
      "metadata_signature": "present",
      "temporal_analysis": "consistent",
      "reverse_engineering_score": 0.94
    },
    "potential_infringers": [
      {
        "organization": "AI Startup Inc",
        "model_name": "custom-art-generator",
        "evidence_strength": "high"
      }
    ],
    "recommended_actions": [
      "cease_and_desist",
      "license_negotiation",
      "legal_consultation"
    ]
  }
}
```

### Legal Action Events

#### dmca_notice_sent
Fired when a DMCA takedown notice is sent.

```json
{
  "event_id": "evt_dmca_123",
  "event_type": "dmca_notice_sent",
  "timestamp": "2024-01-15T12:00:00Z",
  "api_version": "2024-01",
  "data": {
    "dmca_id": "dmca_2024_001234",
    "threat_id": "threat_789abc",
    "platform": "youtube",
    "platform_case_id": "yt_case_456789",
    "notice_type": "standard_dmca",
    "delivery_method": "platform_api",
    "expected_response_time": "24_hours",
    "legal_representative": {
      "name": "TSMO Legal Team",
      "contact": "legal@tsmowatch.com",
      "bar_number": "CA123456"
    },
    "evidence_attachments": [
      "original_work_registration.pdf",
      "similarity_analysis.pdf",
      "timestamp_evidence.pdf"
    ]
  }
}
```

#### dmca_response_received
Fired when a platform responds to a DMCA notice.

```json
{
  "event_id": "evt_dmca_response_123",
  "event_type": "dmca_response_received",
  "timestamp": "2024-01-15T16:00:00Z",
  "api_version": "2024-01",
  "data": {
    "dmca_id": "dmca_2024_001234",
    "platform_response": "content_removed",
    "response_time_hours": 4,
    "platform_case_id": "yt_case_456789",
    "additional_actions": {
      "user_warned": true,
      "repeat_offender_flagged": false,
      "channel_strike_applied": true
    },
    "appeals_process": {
      "appeal_window_days": 14,
      "counter_notice_possible": true,
      "restoration_risk": "low"
    }
  }
}
```

### Portfolio Monitoring Events

#### portfolio_scan_completed
Fired when a portfolio scan is completed.

```json
{
  "event_id": "evt_scan_123",
  "event_type": "portfolio_scan_completed",
  "timestamp": "2024-01-15T13:00:00Z",
  "api_version": "2024-01",
  "data": {
    "scan_id": "scan_789xyz",
    "portfolio_id": "portfolio_456",
    "scan_type": "comprehensive",
    "scan_duration_ms": 45000,
    "items_scanned": 1250,
    "platforms_covered": ["youtube", "instagram", "tiktok", "pinterest"],
    "results_summary": {
      "new_threats": 3,
      "total_threats": 12,
      "false_positives": 1,
      "high_severity": 2,
      "medium_severity": 8,
      "low_severity": 2
    },
    "next_scan_scheduled": "2024-01-15T19:00:00Z",
    "recommendations": [
      "increase_monitoring_frequency",
      "add_watermarking",
      "legal_action_recommended"
    ]
  }
}
```

### System Events

#### system_maintenance_scheduled
Fired when system maintenance is scheduled.

```json
{
  "event_id": "evt_maintenance_123",
  "event_type": "system_maintenance_scheduled",
  "timestamp": "2024-01-15T09:00:00Z",
  "api_version": "2024-01",
  "data": {
    "maintenance_id": "maint_2024_001",
    "scheduled_start": "2024-01-20T02:00:00Z",
    "scheduled_end": "2024-01-20T04:00:00Z",
    "affected_services": ["real_time_monitoring", "webhook_delivery"],
    "impact_level": "minimal",
    "alternative_endpoints": {
      "webhook_delivery": "https://backup.api.tsmowatch.com/webhooks"
    },
    "communication_channels": [
      "status_page",
      "email_notifications",
      "dashboard_banner"
    ]
  }
}
```

## Webhook Security

### Signature Verification

Every webhook request includes an `X-TSMO-Signature` header containing an HMAC-SHA256 signature:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  const receivedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}
```

### Security Best Practices

#### 1. Signature Validation
Always verify webhook signatures to ensure authenticity:

```python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    received = signature.replace('sha256=', '')
    return hmac.compare_digest(expected, received)
```

#### 2. IP Whitelisting
Restrict webhook endpoints to TSMO's IP ranges:

```nginx
# Nginx configuration
location /webhooks/tsmo {
    allow 203.0.113.0/24;  # TSMO webhook IPs
    allow 198.51.100.0/24; # TSMO backup IPs
    deny all;
    proxy_pass http://backend;
}
```

#### 3. HTTPS Enforcement
All webhook URLs must use HTTPS with valid certificates:

```javascript
// Webhook URL validation
const validWebhookUrl = (url) => {
  return url.startsWith('https://') && 
         !url.includes('localhost') && 
         !url.includes('127.0.0.1');
};
```

#### 4. Rate Limiting
Implement rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many webhook requests from this IP'
});

app.use('/webhooks/', webhookLimiter);
```

## Retry Logic & Delivery Guarantees

### Automatic Retry Strategy

TSMO implements exponential backoff with jitter for failed deliveries:

```
Attempt 1: Immediate
Attempt 2: 1 second + jitter
Attempt 3: 2 seconds + jitter  
Attempt 4: 4 seconds + jitter
Attempt 5: 8 seconds + jitter
```

### Delivery Status Codes

- **200-299**: Success - no retry needed
- **300-399**: Redirect - follow redirect (max 3 redirects)
- **400-499**: Client error - no retry (permanent failure)
- **500-599**: Server error - retry with backoff
- **Timeout**: Retry with backoff

### Configuring Retry Behavior

```javascript
// Custom retry configuration
const webhookConfig = {
  url: "https://your-app.com/webhooks/tsmo",
  retry_config: {
    max_attempts: 10,           // Maximum retry attempts
    initial_delay_ms: 500,      // Initial delay before first retry
    backoff_multiplier: 1.5,    // Exponential backoff multiplier
    max_delay_ms: 60000,        // Maximum delay between retries
    jitter: true                // Add randomization to prevent thundering herd
  },
  timeout_ms: 30000,            // Request timeout
  failure_threshold: 5          // Disable webhook after N consecutive failures
};
```

### Dead Letter Queue

Failed webhooks are stored in a dead letter queue for manual review:

```bash
# Retrieve failed webhooks
curl -X GET https://api.tsmowatch.com/v1/webhooks/failed \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -G -d "since=2024-01-15T00:00:00Z" \
  -d "limit=100"
```

## Webhook Management API

### Create Webhook
```bash
curl -X POST https://api.tsmowatch.com/v1/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/tsmo",
    "events": ["threat_detected", "dmca_sent"],
    "secret": "your_secret_key",
    "active": true
  }'
```

### List Webhooks
```bash
curl -X GET https://api.tsmowatch.com/v1/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Update Webhook
```bash
curl -X PUT https://api.tsmowatch.com/v1/webhooks/webhook_123 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "events": ["threat_detected", "threat_resolved", "ai_violation_detected"],
    "active": true
  }'
```

### Delete Webhook
```bash
curl -X DELETE https://api.tsmowatch.com/v1/webhooks/webhook_123 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Test Webhook
```bash
curl -X POST https://api.tsmowatch.com/v1/webhooks/webhook_123/test \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "threat_detected"
  }'
```

## Monitoring & Analytics

### Webhook Dashboard

Access comprehensive webhook analytics through the Enterprise Dashboard:

- **Delivery Success Rate**: Percentage of successful deliveries over time
- **Response Time Distribution**: Latency metrics for your endpoints
- **Error Rate Analysis**: Failed delivery reasons and trends
- **Volume Metrics**: Webhook event volume and patterns
- **Endpoint Health**: Individual endpoint performance and availability

### Webhook Logs

Detailed logs for every webhook delivery attempt:

```json
{
  "webhook_id": "webhook_123",
  "delivery_id": "delivery_456789",
  "event_id": "evt_threat_123456",
  "event_type": "threat_detected",
  "url": "https://your-app.com/webhooks/tsmo",
  "method": "POST",
  "status_code": 200,
  "response_time_ms": 150,
  "request_headers": {
    "X-TSMO-Signature": "sha256=abc123...",
    "Content-Type": "application/json",
    "User-Agent": "TSMO-Webhook/1.0"
  },
  "response_headers": {
    "Content-Type": "text/plain",
    "Content-Length": "2"
  },
  "response_body": "OK",
  "attempt_number": 1,
  "delivered_at": "2024-01-15T10:30:05Z",
  "next_retry_at": null
}
```

### Metrics API

Retrieve webhook metrics programmatically:

```bash
# Get delivery statistics
curl -X GET https://api.tsmowatch.com/v1/webhooks/webhook_123/metrics \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -G -d "start_date=2024-01-01" \
  -d "end_date=2024-01-31" \
  -d "granularity=daily"
```

Response:
```json
{
  "webhook_id": "webhook_123",
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "metrics": {
    "total_attempts": 1250,
    "successful_deliveries": 1205,
    "failed_deliveries": 45,
    "success_rate": 96.4,
    "average_response_time_ms": 245,
    "p95_response_time_ms": 890,
    "total_retries": 78,
    "unique_events": 1180
  },
  "daily_breakdown": [
    {
      "date": "2024-01-01",
      "attempts": 42,
      "successes": 40,
      "failures": 2,
      "avg_response_time_ms": 230
    }
  ]
}
```

## Webhook Testing

### Local Development

Test webhooks locally using tools like ngrok:

```bash
# Start ngrok tunnel
ngrok http 3000

# Use the ngrok URL in webhook configuration
curl -X POST https://api.tsmowatch.com/v1/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://abc123.ngrok.io/webhooks/tsmo",
    "events": ["threat_detected"]
  }'
```

### Testing Framework

Example test suite for webhook handling:

```javascript
const request = require('supertest');
const app = require('../app');

describe('TSMO Webhooks', () => {
  test('should handle threat_detected webhook', async () => {
    const webhookPayload = {
      event_id: "evt_test_123",
      event_type: "threat_detected",
      timestamp: new Date().toISOString(),
      data: {
        threat_id: "threat_test_456",
        severity: "high",
        platform: "youtube"
      }
    };
    
    const signature = generateTestSignature(webhookPayload);
    
    const response = await request(app)
      .post('/webhooks/tsmo')
      .set('X-TSMO-Signature', signature)
      .send(webhookPayload);
    
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });
  
  test('should reject invalid signatures', async () => {
    const webhookPayload = {
      event_type: "threat_detected",
      data: {}
    };
    
    const response = await request(app)
      .post('/webhooks/tsmo')
      .set('X-TSMO-Signature', 'invalid_signature')
      .send(webhookPayload);
    
    expect(response.status).toBe(401);
  });
});
```

## Enterprise Features

### Multi-tenant Webhooks

Configure different webhooks for different tenants:

```javascript
// Tenant-specific webhook configuration
const tenantWebhooks = {
  tenant_enterprise_123: {
    urls: [
      "https://enterprise.client.com/webhooks/tsmo",
      "https://backup.client.com/webhooks/tsmo"  // Failover URL
    ],
    events: ["threat_detected", "dmca_sent"],
    custom_headers: {
      "X-Tenant-ID": "enterprise_123",
      "X-Environment": "production"
    }
  }
};
```

### Webhook Transformations

Transform webhook payloads for specific integrations:

```javascript
// Custom payload transformation
const webhookTransforms = {
  slack: {
    transform: (event) => ({
      text: `🚨 New threat detected: ${event.data.platform}`,
      attachments: [{
        color: event.data.severity === 'high' ? 'danger' : 'warning',
        fields: [
          { title: "Platform", value: event.data.platform, short: true },
          { title: "Confidence", value: `${event.data.confidence_score * 100}%`, short: true }
        ]
      }]
    })
  },
  
  microsoft_teams: {
    transform: (event) => ({
      "@type": "MessageCard",
      "summary": "TSMO Threat Alert",
      "themeColor": event.data.severity === 'high' ? "FF0000" : "FFA500",
      "sections": [{
        "activityTitle": "New Threat Detected",
        "facts": [
          { "name": "Platform", "value": event.data.platform },
          { "name": "Severity", "value": event.data.severity },
          { "name": "Confidence", "value": `${event.data.confidence_score * 100}%` }
        ]
      }]
    })
  }
};
```

### Webhook Orchestration

Chain multiple webhooks for complex workflows:

```javascript
// Webhook orchestration rules
const webhookOrchestration = {
  threat_detected: [
    {
      condition: "data.severity === 'critical'",
      webhooks: ["legal_team", "c_suite_alerts", "incident_management"]
    },
    {
      condition: "data.severity === 'high'",
      webhooks: ["legal_team", "operations_team"]
    },
    {
      condition: "data.platform === 'youtube' && data.confidence_score > 0.9",
      webhooks: ["youtube_specialist", "dmca_automation"]
    }
  ]
};
```

## Compliance & Auditing

### Audit Trail

All webhook activities are logged for compliance:

```json
{
  "audit_id": "audit_2024_001234",
  "timestamp": "2024-01-15T10:30:00Z",
  "event_type": "webhook_delivery",
  "actor": {
    "type": "system",
    "component": "webhook_service"
  },
  "resource": {
    "type": "webhook",
    "id": "webhook_123",
    "url": "https://client.com/webhooks/tsmo"
  },
  "action": "deliver_webhook",
  "outcome": "success",
  "metadata": {
    "event_id": "evt_threat_123456",
    "delivery_id": "delivery_456789",
    "response_code": 200,
    "response_time_ms": 150
  },
  "ip_address": "203.0.113.10",
  "user_agent": "TSMO-Webhook/1.0"
}
```

### Data Retention

Webhook logs and events are retained according to compliance requirements:

- **Delivery Logs**: 7 years retention
- **Event Data**: 10 years retention
- **Audit Trails**: Permanent retention
- **PII Data**: Configurable retention (default: 3 years)

### Export Capabilities

Export webhook data for compliance and auditing:

```bash
# Export webhook delivery logs
curl -X POST https://api.tsmowatch.com/v1/exports/webhook-logs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "format": "csv",
    "include_pii": false,
    "delivery_email": "compliance@your-company.com"
  }'
```

## Support & Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Events
```bash
# Check webhook configuration
curl -X GET https://api.tsmowatch.com/v1/webhooks/webhook_123 \
  -H "Authorization: Bearer YOUR_API_KEY"

# Test webhook connectivity
curl -X POST https://api.tsmowatch.com/v1/webhooks/webhook_123/test \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### 2. High Failure Rate
- Check endpoint availability and response times
- Verify SSL certificate validity
- Review rate limiting configurations
- Check for firewall or security group restrictions

#### 3. Signature Verification Failures
- Ensure secret key matches webhook configuration
- Verify signature calculation algorithm
- Check for character encoding issues
- Confirm header name case sensitivity

### Debug Mode

Enable debug mode for detailed webhook information:

```javascript
// Add debug headers to webhook requests
const debugConfig = {
  url: "https://your-app.com/webhooks/tsmo",
  debug_mode: true,  // Adds extra debugging headers
  include_metadata: true  // Includes additional event metadata
};
```

### Support Channels

- **Enterprise Support**: enterprise-support@tsmowatch.com
- **Technical Documentation**: [docs.tsmowatch.com/webhooks](https://docs.tsmowatch.com/webhooks)
- **Status Page**: [status.tsmowatch.com](https://status.tsmowatch.com)
- **Emergency Support**: +1-800-TSMO-HELP

### SLA & Support Tiers

#### Enterprise Support SLA
- **Critical Issues**: 15-minute response time
- **Webhook Delivery Issues**: 1-hour resolution time
- **Configuration Support**: 4-hour response time
- **General Questions**: 24-hour response time

#### Monitoring & Alerts
- Real-time webhook delivery monitoring
- Automatic failure detection and alerting
- Proactive support for delivery issues
- Performance optimization recommendations