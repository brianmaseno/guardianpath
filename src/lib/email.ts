import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string[]
  subject: string
  html: string
  text: string
}

interface EmergencyEmailData {
  panicId: string
  userEmail: string
  userName: string
  timestamp: string
  location?: {
    lat: number
    lng: number
  }
  currentAddress?: string
  nearbyHospitals?: Array<{
    name: string
    distance: number
    address: string
  }>
  nearbyPoliceStations?: Array<{
    name: string
    distance: number
    address: string
  }>
  imageAnalysis?: {
    description: string
    confidence: number
  }
  googleMapsUrl?: string
}

interface EmailResult {
  success: boolean
  details: {
    messageId?: string
    error?: string
    contactsEmailed?: string[]
    timestamp?: string
    recipientCount?: number
  }
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    // Initialize the transporter with fallback options
    try {
      // Check if email credentials are available
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('⚠️ Email credentials not configured. Emergency emails will be simulated.')
        console.log('📧 To enable real emails, add these to your .env.local file:')
        console.log('EMAIL_USER=your-email@gmail.com')
        console.log('EMAIL_PASSWORD=your-app-password')
        
        // Create a mock transporter for development
        this.transporter = {
          sendMail: async (options: EmailOptions) => {
            console.log('📧 [SIMULATED EMAIL]')
            console.log('To:', options.to)
            console.log('Subject:', options.subject)
            console.log('Content:', options.text.substring(0, 200) + '...')
            return { messageId: `mock_${Date.now()}` }
          },
          verify: async () => true
        } as nodemailer.Transporter
        return
      }

      if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
        // Custom SMTP configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        })
      } else {
        // Use service-based configuration (Gmail, Outlook, etc.)
        this.transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        })
      }

      // Verify the connection
      this.verifyConnection()
    } catch (error) {
      console.error('Failed to initialize email transporter:', error)
      throw new Error('Email service initialization failed')
    }
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify()
      console.log('✅ Email service is ready to send emails')
    } catch (error) {
      console.error('❌ Email service verification failed:', error)
      console.log('📧 Email Configuration Help:')
      console.log('1. Make sure EMAIL_USER and EMAIL_PASSWORD are set in .env.local')
      console.log('2. For Gmail: Use an "App Password" instead of your regular password')
      console.log('3. Enable 2-factor authentication and generate an app password')
      console.log('4. Check your email provider\'s SMTP settings')
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: `"GuardianPath Emergency System" <${process.env.EMAIL_USER}>`,
        to: options.to.join(', '),
        subject: options.subject,
        text: options.text,
        html: options.html,
      })

      console.log('Email sent successfully:', info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('Failed to send email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  generateEmergencyEmailHTML(data: EmergencyEmailData): string {
    const { 
      panicId, 
      userEmail, 
      userName, 
      timestamp, 
      location, 
      currentAddress, 
      nearbyHospitals = [], 
      nearbyPoliceStations = [],
      imageAnalysis,
      googleMapsUrl 
    } = data

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚨 EMERGENCY ALERT - GuardianPath</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .location-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .safety-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: bold; }
        .detail-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .map-link { color: #0ea5e9; font-weight: bold; }
        h1, h2, h3 { margin-top: 0; }
        .emoji { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 EMERGENCY ALERT</h1>
            <p style="margin: 0; font-size: 18px;">GuardianPath Emergency System</p>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <h2 style="color: #dc2626; margin-top: 0;">⚠️ IMMEDIATE ATTENTION REQUIRED</h2>
                <p><strong>${userName}</strong> (${userEmail}) has activated their emergency panic button.</p>
                <p><strong>This is NOT a test. Please take immediate action.</strong></p>
            </div>

            <h3>📋 Emergency Details</h3>
            <div class="detail-row">
                <span class="label">🆔 Alert ID:</span> 
                <span class="value">${panicId}</span>
            </div>
            <div class="detail-row">
                <span class="label">⏰ Time:</span> 
                <span class="value">${new Date(timestamp).toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span class="label">👤 Person:</span> 
                <span class="value">${userName} (${userEmail})</span>
            </div>

            ${location ? `
            <div class="location-box">
                <h3>📍 Location Information</h3>
                <div class="detail-row">
                    <span class="label">🏠 Address:</span> 
                    <span class="value">${currentAddress || 'Address lookup in progress...'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">🌐 Coordinates:</span> 
                    <span class="value">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</span>
                </div>
                ${googleMapsUrl ? `
                <div style="text-align: center; margin: 15px 0;">
                    <a href="${googleMapsUrl}" class="button" target="_blank">
                        🗺️ VIEW LIVE LOCATION ON GOOGLE MAPS
                    </a>
                </div>
                ` : ''}
            </div>
            ` : '<p style="color: #dc2626;">❌ Location information not available</p>'}

            ${imageAnalysis ? `
            <div class="alert-box">
                <h3>📷 AI Scene Analysis</h3>
                <p><strong>Description:</strong> ${imageAnalysis.description}</p>
                <p><strong>Confidence:</strong> ${(imageAnalysis.confidence * 100).toFixed(1)}%</p>
            </div>
            ` : ''}

            ${(nearbyHospitals.length > 0 || nearbyPoliceStations.length > 0) ? `
            <div class="safety-box">
                <h3>🏥 Nearby Emergency Services</h3>
                
                ${nearbyHospitals.length > 0 ? `
                <h4>🏥 Hospitals:</h4>
                <ul>
                    ${nearbyHospitals.map(hospital => `
                        <li><strong>${hospital.name}</strong> - ${(hospital.distance / 1000).toFixed(1)}km away<br>
                        <small style="color: #666;">${hospital.address}</small></li>
                    `).join('')}
                </ul>
                ` : ''}

                ${nearbyPoliceStations.length > 0 ? `
                <h4>🚔 Police Stations:</h4>
                <ul>
                    ${nearbyPoliceStations.map(station => `
                        <li><strong>${station.name}</strong> - ${(station.distance / 1000).toFixed(1)}km away<br>
                        <small style="color: #666;">${station.address}</small></li>
                    `).join('')}
                </ul>
                ` : ''}
            </div>
            ` : ''}

            <div class="alert-box">
                <h3>🔴 RECOMMENDED ACTIONS</h3>
                <ol>
                    <li><strong>Call emergency services (911/112)</strong> if needed</li>
                    <li><strong>Contact the person immediately</strong> via phone or text</li>
                    <li><strong>Check their location</strong> using the map link above</li>
                    <li><strong>Consider going to help</strong> if you're nearby and it's safe</li>
                    <li><strong>Stay in contact</strong> until the situation is resolved</li>
                </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 16px; color: #dc2626; font-weight: bold;">
                    This alert was generated automatically by GuardianPath's emergency system.
                </p>
                ${location ? `
                <a href="tel:911" class="button">📞 CALL 911</a>
                <a href="tel:${userEmail.replace('@', '').replace('.', '')}" class="button">📱 CALL ${userName}</a>
                ` : ''}
            </div>
        </div>

        <div class="footer">
            <p>This email was sent by GuardianPath Emergency System at ${new Date().toLocaleString()}</p>
            <p>For support, contact: support@guardianpath.com</p>
            <p style="color: #999; font-size: 10px;">Alert ID: ${panicId}</p>
        </div>
    </div>
</body>
</html>
    `
  }

  generateEmergencyEmailText(data: EmergencyEmailData): string {
    const { 
      panicId, 
      userEmail, 
      userName, 
      timestamp, 
      location, 
      currentAddress, 
      nearbyHospitals = [], 
      nearbyPoliceStations = [],
      imageAnalysis,
      googleMapsUrl 
    } = data

    return `
🚨 EMERGENCY ALERT - GuardianPath

⚠️ IMMEDIATE ATTENTION REQUIRED
${userName} (${userEmail}) has activated their emergency panic button.
This is NOT a test. Please take immediate action.

📋 EMERGENCY DETAILS:
🆔 Alert ID: ${panicId}
⏰ Time: ${new Date(timestamp).toLocaleString()}
👤 Person: ${userName} (${userEmail})

📍 LOCATION INFORMATION:
${location ? `
🏠 Address: ${currentAddress || 'Address lookup in progress...'}
🌐 Coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
🗺️ Google Maps: ${googleMapsUrl || 'https://maps.google.com/maps?q=' + location.lat + ',' + location.lng}
` : '❌ Location information not available'}

${imageAnalysis ? `
📷 AI SCENE ANALYSIS:
Description: ${imageAnalysis.description}
Confidence: ${(imageAnalysis.confidence * 100).toFixed(1)}%
` : ''}

${(nearbyHospitals.length > 0 || nearbyPoliceStations.length > 0) ? `
🏥 NEARBY EMERGENCY SERVICES:

${nearbyHospitals.length > 0 ? `
🏥 Hospitals:
${nearbyHospitals.map(hospital => `• ${hospital.name} - ${(hospital.distance / 1000).toFixed(1)}km away
  ${hospital.address}`).join('\n')}
` : ''}

${nearbyPoliceStations.length > 0 ? `
🚔 Police Stations:
${nearbyPoliceStations.map(station => `• ${station.name} - ${(station.distance / 1000).toFixed(1)}km away
  ${station.address}`).join('\n')}
` : ''}
` : ''}

🔴 RECOMMENDED ACTIONS:
1. Call emergency services (911/112) if needed
2. Contact the person immediately via phone or text
3. Check their location using the map link above
4. Consider going to help if you're nearby and it's safe
5. Stay in contact until the situation is resolved

This alert was generated automatically by GuardianPath's emergency system.
Alert ID: ${panicId}
Generated at: ${new Date().toLocaleString()}
    `
  }

  async sendEmergencyAlert(emergencyData: EmergencyEmailData, contactEmails: string[]): Promise<EmailResult> {
    const subject = `🚨 EMERGENCY ALERT: ${emergencyData.userName} needs help - ${new Date().toLocaleTimeString()}`
    const html = this.generateEmergencyEmailHTML(emergencyData)
    const text = this.generateEmergencyEmailText(emergencyData)

    const result = await this.sendEmail({
      to: contactEmails,
      subject,
      html,
      text
    })

    return {
      success: result.success,
      details: {
        messageId: result.messageId,
        error: result.error,
        recipientCount: contactEmails.length,
        timestamp: new Date().toISOString()
      }
    }
  }
}

export const emailService = new EmailService()
export default emailService
