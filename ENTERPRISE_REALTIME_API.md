# TSMO Enterprise Real-time API Documentation

## Overview

TSMO's Enterprise Real-time API provides low-latency, high-throughput WebSocket connections for real-time intellectual property protection monitoring and threat detection. Built for enterprise-scale operations with guaranteed SLAs and enterprise-grade security.

## Authentication & Authorization

### API Key Authentication
```javascript
const ws = new WebSocket('wss://api.tsmowatch.com/v1/realtime', {
  headers: {
    'Authorization': 'Bearer YOUR_ENTERPRISE_API_KEY',
    'X-Client-Version': '1.0.0'
  }
});
```

### JWT Token Authentication
```javascript
const ws = new WebSocket(`wss://api.tsmowatch.com/v1/realtime?token=${jwtToken}`);
```

## Connection Management

### Connection Lifecycle
1. **Initial Handshake**: Client connects with authentication
2. **Session Initialization**: Server confirms connection and capabilities
3. **Channel Subscription**: Client subscribes to relevant data streams
4. **Real-time Updates**: Bidirectional data flow
5. **Graceful Disconnection**: Clean session termination

### Connection Example
```javascript
const tsmoRealtime = new WebSocket('wss://api.tsmowatch.com/v1/realtime');

tsmoRealtime.onopen = function(event) {
  // Subscribe to threat detection stream
  tsmoRealtime.send(JSON.stringify({
    type: 'subscribe',
    channel: 'threat-detection',
    filters: {
      severity: ['high', 'critical'],
      platforms: ['youtube', 'instagram', 'tiktok']
    }
  }));
};

tsmoRealtime.onmessage = function(event) {
  const data = JSON.parse(event.data);
  handleRealtimeUpdate(data);
};
```

## Event Types

### Threat Detection Events
```json
{
  "type": "threat_detected",
  "timestamp": "2024-01-15T10:30:00Z",
  "event_id": "evt_789abc123",
  "data": {
    "threat_id": "threat_456def789",
    "severity": "high",
    "platform": "youtube",
    "content_type": "video",
    "confidence_score": 0.95,
    "detected_violations": ["copyright", "trademark"],
    "source_url": "https://youtube.com/watch?v=example",
    "similarity_score": 0.98,
    "automated_action": "dmca_notice_sent",
    "user_id": "user_123",
    "portfolio_id": "portfolio_456"
  }
}
```

### AI Training Violation Events
```json
{
  "type": "ai_training_violation",
  "timestamp": "2024-01-15T10:35:00Z",
  "event_id": "evt_ai_001",
  "data": {
    "violation_id": "ai_viol_789",
    "ai_model_detected": "stable-diffusion-v2",
    "training_dataset": "laion-5b",
    "confidence_score": 0.87,
    "artwork_fingerprint": "fp_artwork_123",
    "violation_evidence": {
      "image_similarity": 0.94,
      "metadata_match": true,
      "temporal_analysis": "consistent"
    },
    "legal_action_recommended": true
  }
}
```

### Portfolio Monitoring Events
```json
{
  "type": "portfolio_scan_complete",
  "timestamp": "2024-01-15T10:40:00Z",
  "event_id": "evt_scan_001",
  "data": {
    "scan_id": "scan_789",
    "portfolio_id": "portfolio_456",
    "scan_type": "comprehensive",
    "duration_ms": 45000,
    "total_items_scanned": 1250,
    "violations_found": 3,
    "new_threats": 1,
    "platforms_scanned": ["youtube", "instagram", "tiktok", "pinterest"],
    "next_scan_scheduled": "2024-01-15T18:40:00Z"
  }
}
```

### System Status Events
```json
{
  "type": "system_status",
  "timestamp": "2024-01-15T10:45:00Z",
  "event_id": "evt_status_001",
  "data": {
    "service": "threat_detection",
    "status": "operational",
    "latency_ms": 15,
    "throughput_ops_per_sec": 10000,
    "uptime_percentage": 99.99,
    "active_connections": 5420,
    "regional_status": {
      "us-east": "operational",
      "us-west": "operational", 
      "eu-west": "operational",
      "asia-pacific": "operational"
    }
  }
}
```

## Channel Subscriptions

### Subscribe to Specific Channels
```javascript
// Subscribe to threat detection for specific portfolios
tsmoRealtime.send(JSON.stringify({
  type: 'subscribe',
  channel: 'threat-detection',
  portfolio_ids: ['portfolio_123', 'portfolio_456'],
  filters: {
    severity: ['medium', 'high', 'critical'],
    platforms: ['all'],
    content_types: ['image', 'video', 'text']
  }
}));

// Subscribe to AI training violations
tsmoRealtime.send(JSON.stringify({
  type: 'subscribe',
  channel: 'ai-training-violations',
  filters: {
    confidence_threshold: 0.8,
    models: ['gpt', 'stable-diffusion', 'midjourney']
  }
}));

// Subscribe to system status updates
tsmoRealtime.send(JSON.stringify({
  type: 'subscribe',
  channel: 'system-status',
  services: ['threat_detection', 'ai_analysis', 'portfolio_monitoring']
}));
```

### Unsubscribe from Channels
```javascript
tsmoRealtime.send(JSON.stringify({
  type: 'unsubscribe',
  channel: 'threat-detection'
}));
```

## Rate Limits & Throttling

### Enterprise Rate Limits
- **Professional Tier**: 1,000 events/minute, 50 concurrent connections
- **Enterprise Tier**: 10,000 events/minute, 500 concurrent connections
- **Custom Enterprise**: Unlimited (contract-based)

### Rate Limit Headers
```javascript
tsmoRealtime.onmessage = function(event) {
  const data = JSON.parse(event.data);
  
  if (data.type === 'rate_limit_warning') {
    console.warn('Approaching rate limit:', data.current_usage);
  }
  
  if (data.type === 'rate_limit_exceeded') {
    console.error('Rate limit exceeded. Throttling connection.');
    // Implement exponential backoff
    setTimeout(() => reconnect(), 5000);
  }
};
```

## Error Handling & Reconnection

### Error Types
```javascript
tsmoRealtime.onerror = function(error) {
  console.error('WebSocket error:', error);
};

tsmoRealtime.onclose = function(event) {
  if (event.code === 1000) {
    console.log('Connection closed normally');
  } else if (event.code === 1006) {
    console.log('Connection lost unexpectedly. Attempting reconnection...');
    reconnectWithBackoff();
  } else if (event.code === 4001) {
    console.error('Authentication failed');
  } else if (event.code === 4002) {
    console.error('Rate limit exceeded');
  }
};
```

### Automatic Reconnection
```javascript
function reconnectWithBackoff() {
  let retryCount = 0;
  const maxRetries = 10;
  
  function attempt() {
    if (retryCount >= maxRetries) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    
    setTimeout(() => {
      console.log(`Reconnection attempt ${retryCount + 1}`);
      const newConnection = new WebSocket('wss://api.tsmowatch.com/v1/realtime');
      
      newConnection.onopen = function() {
        console.log('Reconnected successfully');
        retryCount = 0;
        // Resubscribe to channels
        resubscribeToChannels();
      };
      
      newConnection.onerror = function() {
        retryCount++;
        attempt();
      };
    }, delay);
  }
  
  attempt();
}
```

## Performance Optimization

### Connection Pooling
```javascript
class TSMORealtimePool {
  constructor(maxConnections = 5) {
    this.maxConnections = maxConnections;
    this.connections = [];
    this.currentIndex = 0;
  }
  
  getConnection() {
    if (this.connections.length < this.maxConnections) {
      const ws = new WebSocket('wss://api.tsmowatch.com/v1/realtime');
      this.connections.push(ws);
      return ws;
    }
    
    // Round-robin load balancing
    const connection = this.connections[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.connections.length;
    return connection;
  }
}
```

### Message Batching
```javascript
class MessageBatcher {
  constructor(batchSize = 100, flushInterval = 1000) {
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.messages = [];
    this.timer = null;
  }
  
  addMessage(message) {
    this.messages.push(message);
    
    if (this.messages.length >= this.batchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }
  
  flush() {
    if (this.messages.length > 0) {
      this.processBatch(this.messages);
      this.messages = [];
    }
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
```

## Security Features

### Message Encryption
All real-time messages are encrypted using AES-256-GCM with rotating keys.

### IP Whitelisting
```javascript
// Configure allowed IP ranges in dashboard
const allowedIPs = [
  '203.0.113.0/24',  // Office network
  '198.51.100.0/24'  // Data center
];
```

### Certificate Pinning
```javascript
const secureConnection = new WebSocket('wss://api.tsmowatch.com/v1/realtime', {
  cert: fs.readFileSync('tsmo-cert.pem'),
  key: fs.readFileSync('tsmo-key.pem')
});
```

## Monitoring & Analytics

### Real-time Metrics
Monitor your real-time API usage through our enterprise dashboard:

- **Connection Health**: Active connections, connection duration, error rates
- **Message Throughput**: Messages per second, peak usage, latency distribution
- **Channel Analytics**: Subscription patterns, popular channels, engagement metrics
- **Error Tracking**: Error frequency, error types, resolution times

### Custom Metrics
```javascript
// Track custom business metrics
tsmoRealtime.send(JSON.stringify({
  type: 'track_metric',
  metric: 'threats_resolved',
  value: 1,
  tags: {
    severity: 'high',
    platform: 'youtube',
    resolution_method: 'automated_dmca'
  }
}));
```

## Enterprise Features

### Multi-tenancy Support
```javascript
// Connect with tenant isolation
const ws = new WebSocket('wss://api.tsmowatch.com/v1/realtime', {
  headers: {
    'X-Tenant-ID': 'tenant_enterprise_123',
    'Authorization': 'Bearer YOUR_TENANT_API_KEY'
  }
});
```

### White-label Integration
```javascript
// Custom domain support
const ws = new WebSocket('wss://your-brand.monitoring-api.com/v1/realtime');
```

### Geographic Data Residency
```javascript
// Connect to specific regional endpoints
const regions = {
  'us-east': 'wss://us-east.api.tsmowatch.com/v1/realtime',
  'eu-west': 'wss://eu-west.api.tsmowatch.com/v1/realtime',
  'asia-pacific': 'wss://ap.api.tsmowatch.com/v1/realtime'
};

const ws = new WebSocket(regions['eu-west']);
```

## SLA Guarantees

### Uptime SLA
- **Professional**: 99.9% uptime (43.2 minutes downtime/month)
- **Enterprise**: 99.95% uptime (21.6 minutes downtime/month)
- **Custom Enterprise**: 99.99% uptime (4.32 minutes downtime/month)

### Latency SLA
- **Message Delivery**: < 100ms (95th percentile)
- **Threat Detection**: < 500ms from source to notification
- **Global Replication**: < 50ms between regions

### Support SLA
- **Critical Issues**: 15-minute response time
- **High Priority**: 1-hour response time
- **Standard Issues**: 4-hour response time

## Compliance & Certifications

### Security Standards
- **SOC 2 Type II** certified
- **ISO 27001** compliant
- **GDPR** compliant with data residency options
- **HIPAA** ready for healthcare clients
- **PCI DSS** Level 1 for payment data

### Audit Logging
All real-time API access is logged with:
- Timestamp and duration
- Authentication details
- Data accessed
- Geographic location
- Success/failure status

## Integration Examples

### React Application
```jsx
import { useEffect, useState } from 'react';

const useRealtimeThreats = (portfolioId) => {
  const [threats, setThreats] = useState([]);
  const [connection, setConnection] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket('wss://api.tsmowatch.com/v1/realtime');
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'threat-detection',
        portfolio_ids: [portfolioId]
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'threat_detected') {
        setThreats(prev => [data.data, ...prev]);
      }
    };
    
    setConnection(ws);
    
    return () => ws.close();
  }, [portfolioId]);
  
  return threats;
};
```

### Node.js Backend
```javascript
const WebSocket = require('ws');

class TSMORealtimeClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.ws = null;
    this.handlers = new Map();
  }
  
  connect() {
    this.ws = new WebSocket('wss://api.tsmowatch.com/v1/realtime', {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    
    this.ws.on('message', (data) => {
      const message = JSON.parse(data);
      const handler = this.handlers.get(message.type);
      if (handler) handler(message.data);
    });
  }
  
  subscribe(channel, filters = {}) {
    this.ws.send(JSON.stringify({
      type: 'subscribe',
      channel,
      filters
    }));
  }
  
  onThreatDetected(callback) {
    this.handlers.set('threat_detected', callback);
  }
}

// Usage
const client = new TSMORealtimeClient('your-api-key');
client.connect();
client.subscribe('threat-detection');
client.onThreatDetected((threat) => {
  console.log('New threat detected:', threat);
  // Trigger business logic
});
```

## Best Practices

### 1. Connection Management
- Always implement reconnection logic with exponential backoff
- Monitor connection health and implement heartbeat/ping messages
- Use connection pooling for high-throughput applications

### 2. Message Handling
- Implement idempotency for message processing
- Use message batching for high-volume scenarios
- Store critical messages locally for offline resilience

### 3. Error Recovery
- Log all errors with correlation IDs for debugging
- Implement circuit breaker patterns for downstream services
- Have fallback mechanisms for critical business flows

### 4. Security
- Rotate API keys regularly (every 90 days recommended)
- Implement client-side certificate pinning
- Use IP whitelisting for additional security

### 5. Performance
- Use compression for large message payloads
- Implement client-side caching for frequently accessed data
- Monitor and optimize subscription patterns

## Support & Resources

### Documentation
- [API Reference](https://docs.tsmowatch.com/api)
- [SDKs & Libraries](https://docs.tsmowatch.com/sdks)
- [Integration Guides](https://docs.tsmowatch.com/integration)

### Support Channels
- **Enterprise Support**: enterprise-support@tsmowatch.com
- **Technical Support**: tech-support@tsmowatch.com
- **24/7 Emergency**: +1-800-TSMO-911

### Status & Monitoring
- [Status Page](https://status.tsmowatch.com)
- [Performance Dashboard](https://metrics.tsmowatch.com)
- [Incident Reports](https://incidents.tsmowatch.com)