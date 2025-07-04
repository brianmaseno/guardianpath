declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string
      AZURE_MAPS_KEY: string
      AZURE_MAPS_CLIENT_ID: string
      AZURE_VISION_ENDPOINT: string
      AZURE_VISION_KEY: string
      NEXTAUTH_SECRET: string
      NEXTAUTH_URL: string
      TWILIO_ACCOUNT_SID: string
      TWILIO_AUTH_TOKEN: string
      TWILIO_PHONE_NUMBER: string
      SENDGRID_API_KEY: string
      SENDGRID_FROM_EMAIL: string
    }
  }
}

export {}
