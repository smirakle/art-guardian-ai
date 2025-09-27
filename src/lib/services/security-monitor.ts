import { toast } from 'sonner'

export interface SecurityEvent {
  id: string
  type: 'suspicious_transaction' | 'phishing_detected' | 'malicious_contract' | 'unusual_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details: Record<string, any>
  timestamp: string
  resolved: boolean
}

export interface SecurityMetrics {
  riskScore: number
  lastScan: string
  threatsDetected: number
  vulnerabilities: string[]
  recommendations: string[]
}

class SecurityMonitorService {
  private eventLog: SecurityEvent[] = []
  
  async analyzeTransactionSecurity(
    txHash: string, 
    to: string, 
    value: string, 
    chainId: number
  ): Promise<{ safe: boolean; warnings: string[]; riskScore: number }> {
    const warnings: string[] = []
    let riskScore = 0
    
    try {
      // Simulate security checks
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check against known malicious addresses
      const knownMaliciousAddresses = [
        '0x0000000000000000000000000000000000000000',
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
      ]
      
      if (knownMaliciousAddresses.includes(to.toLowerCase())) {
        warnings.push('⚠️ Destination address is flagged as potentially malicious')
        riskScore += 70
      }
      
      // Check transaction value
      const valueNum = parseFloat(value)
      if (valueNum > 1) {
        warnings.push('⚠️ Large transaction amount - please verify recipient')
        riskScore += 20
      }
      
      // Check for common phishing patterns
      if (to.length !== 42 || !to.startsWith('0x')) {
        warnings.push('⚠️ Invalid address format detected')
        riskScore += 50
      }
      
      // Simulate API call to external security service
      const externalCheck = await this.checkExternalSecurityAPI(to)
      if (!externalCheck.safe) {
        warnings.push(`⚠️ ${externalCheck.warning}`)
        riskScore += externalCheck.riskIncrease
      }
      
      return {
        safe: riskScore < 50,
        warnings,
        riskScore: Math.min(riskScore, 100)
      }
      
    } catch (error) {
      console.error('Security analysis failed:', error)
      return {
        safe: false,
        warnings: ['⚠️ Unable to verify transaction security'],
        riskScore: 30
      }
    }
  }
  
  async scanWalletSecurity(address: string, chainId: number): Promise<SecurityMetrics> {
    try {
      // Simulate comprehensive security scan
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const vulnerabilities: string[] = []
      const recommendations: string[] = []
      let riskScore = 0
      
      // Check for common vulnerabilities
      const hasHighValueTx = Math.random() > 0.8
      if (hasHighValueTx) {
        vulnerabilities.push('High-value transactions detected')
        recommendations.push('Consider using hardware wallet for large transactions')
        riskScore += 15
      }
      
      const hasApprovals = Math.random() > 0.6
      if (hasApprovals) {
        vulnerabilities.push('Active token approvals found')
        recommendations.push('Review and revoke unnecessary token approvals')
        riskScore += 10
      }
      
      const hasOldTx = Math.random() > 0.5
      if (hasOldTx) {
        recommendations.push('Enable transaction notifications for better monitoring')
        riskScore += 5
      }
      
      // Add general security recommendations
      recommendations.push(
        'Use strong, unique passwords for wallet access',
        'Enable 2FA where available',
        'Keep wallet software updated',
        'Verify contract addresses before interacting'
      )
      
      return {
        riskScore: Math.min(riskScore, 100),
        lastScan: new Date().toISOString(),
        threatsDetected: vulnerabilities.length,
        vulnerabilities,
        recommendations
      }
      
    } catch (error) {
      console.error('Security scan failed:', error)
      throw new Error('Failed to complete security scan')
    }
  }
  
  async checkContractSecurity(contractAddress: string, chainId: number): Promise<{
    verified: boolean
    riskLevel: 'low' | 'medium' | 'high'
    warnings: string[]
    auditResults?: any
  }> {
    try {
      // Simulate contract verification check
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const warnings: string[] = []
      const isVerified = Math.random() > 0.3
      
      if (!isVerified) {
        warnings.push('Contract source code is not verified')
      }
      
      const hasKnownVulnerabilities = Math.random() > 0.9
      if (hasKnownVulnerabilities) {
        warnings.push('Contract has known security vulnerabilities')
      }
      
      const isNewContract = Math.random() > 0.7
      if (isNewContract) {
        warnings.push('Contract was recently deployed - exercise caution')
      }
      
      const riskLevel = warnings.length > 2 ? 'high' : warnings.length > 0 ? 'medium' : 'low'
      
      return {
        verified: isVerified,
        riskLevel,
        warnings,
        auditResults: isVerified ? {
          auditor: 'CertiK',
          score: 85,
          lastAudit: '2024-01-15',
          issues: warnings.length
        } : undefined
      }
      
    } catch (error) {
      console.error('Contract security check failed:', error)
      return {
        verified: false,
        riskLevel: 'high',
        warnings: ['Failed to verify contract security']
      }
    }
  }
  
  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false
    }
    
    this.eventLog.push(securityEvent)
    
    // Show toast notification for high severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      toast.error(`Security Alert: ${event.message}`)
    }
    
    // Limit log size
    if (this.eventLog.length > 100) {
      this.eventLog = this.eventLog.slice(-100)
    }
  }
  
  getSecurityEvents(limit: number = 10): SecurityEvent[] {
    return this.eventLog.slice(-limit).reverse()
  }
  
  private async checkExternalSecurityAPI(address: string): Promise<{
    safe: boolean
    warning?: string
    riskIncrease: number
  }> {
    // Simulate external API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock external security service response
    const isSafe = Math.random() > 0.1
    
    if (!isSafe) {
      const warnings = [
        'Address associated with phishing campaigns',
        'Address flagged by security researchers',
        'Address linked to suspicious activities',
        'Address appears in threat intelligence feeds'
      ]
      
      return {
        safe: false,
        warning: warnings[Math.floor(Math.random() * warnings.length)],
        riskIncrease: 40
      }
    }
    
    return {
      safe: true,
      riskIncrease: 0
    }
  }
}

export const securityMonitorService = new SecurityMonitorService()