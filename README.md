# GuardianPath 🛡️

**Your AI-Powered Safety Companion**

GuardianPath is a comprehensive safety application inspired by the End Femicide campaign in Kenya. Built with Next.js and powered by Microsoft Azure services, it provides real-time safety features for people walking alone.

## ✨ Features

### 🚨 Emergency Panic Mode
- **One-tap activation** of emergency protocol
- **Photo capture** with AI-powered analysis using Azure Cognitive Services
- **Real-time location** tracking and sharing
- **Automatic emergency contact notification**

### 🧠 AI-Powered Analysis
- **Object detection** and scene understanding
- **Text extraction** from images (OCR)
- **Threat assessment** using Azure Computer Vision
- **Real-time situational analysis**

### 🗺️ Smart Route Planning
- **Safe route suggestions** using Azure Maps
- **Nearby safety locations** (hospitals, police stations)
- **Real-time traffic and safety data**
- **Alternative route options**

### 📱 Real-time Communication
- **SMS and email alerts** to emergency contacts
- **Live location sharing**
- **Automatic address resolution**
- **Multi-channel notifications**

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with Framer Motion animations
- **Database**: MongoDB Atlas
- **AI Services**: Azure Cognitive Services (Computer Vision)
- **Maps**: Azure Maps API
- **Authentication**: NextAuth.js (ready for implementation)
- **Notifications**: Twilio (SMS) + SendGrid (Email)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Azure account with Cognitive Services and Maps

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd guardianpath
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create `.env.local` file with your Azure and MongoDB credentials:
   ```env
   # Azure Services
   AZURE_MAPS_KEY=your-azure-maps-key
   AZURE_MAPS_CLIENT_ID=your-client-id
   AZURE_VISION_ENDPOINT=your-vision-endpoint
   AZURE_VISION_KEY=your-vision-key
   
   # Database
   MONGODB_URI=your-mongodb-connection-string
   
   # Notifications (Optional)
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   SENDGRID_API_KEY=your-sendgrid-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Azure Services Setup

### Azure Maps
1. Create an Azure Maps account in Azure Portal
2. Get your subscription key and client ID
3. Enable required APIs (Routing, Search, Reverse Geocoding)

### Azure Cognitive Services
1. Create a Computer Vision resource
2. Get your endpoint URL and API key
3. Enable Object Detection and OCR features

### MongoDB Atlas
1. Create a MongoDB Atlas cluster
2. Set up database user and network access
3. Get your connection string

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── panic/          # Emergency API endpoints
│   ├── dashboard/          # Safety dashboard
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx       # App providers
├── components/
│   ├── Header.tsx          # Navigation header
│   ├── PanicButton.tsx     # Emergency button
│   └── FeatureGrid.tsx     # Features display
└── lib/
    ├── azure.ts           # Azure services integration
    └── mongodb.ts         # Database connection
```

## 🔧 API Endpoints

### POST `/api/panic`
Activate emergency panic mode
- Captures location and photo
- Analyzes image with Azure AI
- Notifies emergency contacts
- Stores event in database

## 🎨 UI Features

- **Responsive design** for all devices
- **Dark mode support**
- **Smooth animations** with Framer Motion
- **Accessibility compliant**
- **Real-time notifications** with React Hot Toast

## 🔒 Security & Privacy

- **End-to-end encryption** for sensitive data
- **Secure API endpoints** with validation
- **Privacy-first design** - data only shared when necessary
- **Configurable privacy settings**

## 🌍 Impact & Purpose

GuardianPath was created with the mission to:
- **Reduce gender-based violence** and improve personal safety
- **Empower individuals** with AI-powered safety tools
- **Provide peace of mind** for people walking alone
- **Create safer communities** through technology

## 🏅 Recognition

This project was developed for the **Microsoft AI Agents Hackathon (May 2025)** and earned a **Microsoft Hackathon Participation Badge**.

## 🚀 Future Enhancements

- [ ] **Real-time tracking** for trusted contacts
- [ ] **Community safety reports** and crowdsourced data
- [ ] **Integration with local emergency services**
- [ ] **Wearable device support** (smartwatches)
- [ ] **Multilingual support**
- [ ] **Offline functionality** for areas with poor connectivity

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

## 📞 Support

For support or questions about GuardianPath, please contact our team or visit our documentation.

---

**Built with ❤️ for safety and powered by Microsoft Azure**

*Keeping you safe, one step at a time.*
