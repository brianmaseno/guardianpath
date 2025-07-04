# Vercel Environment Variables Setup Guide

This file contains the environment variables you need to configure in your Vercel deployment dashboard.

## Required Environment Variables for Vercel

### MongoDB (Required)
MONGODB_URI=mongodb+srv://brianmayoga:WHWZOYTpmUoILA4z@safewalk.dco2o3q.mongodb.net/?retryWrites=true&w=majority&appName=safewalk

### NextAuth (Required)
NEXTAUTH_SECRET=gp_secret_2025_safety_app_secure_key_for_sessions_and_tokens
NEXTAUTH_URL=https://your-vercel-app-url.vercel.app

### Email Service (Required for emergency notifications)
EMAIL_USER=briancreatives@gmail.com
EMAIL_PASSWORD=vadt zjjn rfgc zerf
EMAIL_SERVICE=gmail

### Azure Services (Optional but recommended for enhanced features)
AZURE_MAPS_KEY=E5QszaQL36rXtljpFX1PUnAKG1IrcZONlIXv9k4sRjd0BKyMUVMaJQQJ99BGACYeBjFY9AFbAAAgAZMP4Ccm
NEXT_PUBLIC_AZURE_MAPS_KEY=E5QszaQL36rXtljpFX1PUnAKG1IrcZONlIXv9k4sRjd0BKyMUVMaJQQJ99BGACYeBjFY9AFbAAAgAZMP4Ccm
AZURE_MAPS_CLIENT_ID=838197b4-4cec-4285-af7b-775f8acc6bdd
AZURE_VISION_ENDPOINT=https://guardianpath.cognitiveservices.azure.com/
AZURE_VISION_KEY=4LISXRflBgNLzLDeEnGmBXQ7GNeiszbqi2Al3rUNJdKn4PFjIJ9TJQQJ99BGACYeBjFXJ3w3AAAFACOGIPrV

## How to Add These to Vercel:

1. Go to your Vercel dashboard
2. Select your project (guardianpath)
3. Go to Settings → Environment Variables
4. Add each variable above as a new environment variable
5. Make sure to set the environment to "Production, Preview, and Development"
6. Save and redeploy your application

## Important Notes:

- NEXTAUTH_URL should be updated to your actual Vercel deployment URL
- All variables marked as "Required" must be added for the app to work
- Azure services are optional but provide enhanced location features
- Email service is required for emergency notifications to work
