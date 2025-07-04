# 📧 Email Setup Guide for GuardianPath Emergency Alerts

To enable **real emergency email alerts**, you need to configure email credentials in your `.env.local` file.

## Quick Setup (Gmail - Recommended)

1. **Create a `.env.local` file** in your project root if it doesn't exist
2. **Add these lines** to your `.env.local` file:

```env
# Email Configuration for Emergency Alerts
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Optional: specify email service (default is gmail)
EMAIL_SERVICE=gmail
```

## Getting Gmail App Password

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com)
2. Click **Security** → **2-Step Verification**
3. Follow the setup process

### Step 2: Generate App Password
1. Go to [Google Account Settings](https://myaccount.google.com)
2. Click **Security** → **App passwords**
3. Select app: **Mail**
4. Select device: **Other (custom name)** → Type "GuardianPath"
5. Click **Generate**
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update Your .env.local
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

## Alternative Email Providers

### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-app-password
```

### Custom SMTP
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
```

## Testing the Setup

1. **Restart your development server** after adding credentials
2. **Add emergency contacts** with valid email addresses
3. **Test the panic button** - you should receive real emails!

## What Emergency Emails Include

✅ **Person's exact location** (address + coordinates)  
✅ **Google Maps link** for instant navigation  
✅ **Nearby hospitals and police stations**  
✅ **AI scene analysis** (if photo captured)  
✅ **Timestamp and alert ID**  
✅ **Recommended emergency actions**  

## Troubleshooting

### "Missing credentials for PLAIN" Error
- Make sure `EMAIL_USER` and `EMAIL_PASSWORD` are set in `.env.local`
- For Gmail, use an **App Password**, not your regular password
- Restart your development server after adding credentials

### Emails Not Sending
- Check your email provider's SMTP settings
- Verify 2-factor authentication is enabled (for Gmail)
- Check the server console for detailed error messages

### Still Not Working?
- The system will **simulate emails** in the console if credentials are missing
- You'll see `📧 [SIMULATED EMAIL]` messages with the full content
- This is perfect for development and testing

---

**🚨 Important**: Keep your `.env.local` file secure and never commit it to version control!
