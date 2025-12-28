# ProSentry Industrial Safety Intelligence Dashboard - How to Use

## 🛡️ Overview
ProSentry is an AI-powered industrial safety intelligence system that detects dangerous operational windows before accidents occur. The system uses real-time data analysis and Gemini AI to predict high-risk situations and provide preventive recommendations.

## ⚡ Quick Start (2 Minutes)
**New to ProSentry? Follow these simple steps:**

1. **Click "Sample Data (Google Drive)"** → Opens sample files in new tab
2. **Download any CSV file** → Save to your computer  
3. **Click "Connect Operational Data"** → Upload the downloaded CSV
4. **Click "Start Live Risk Analysis"** → Watch AI detect risks in real-time!

*That's it! The system will analyze the data and show risk progression with AI recommendations.*

---

## 🚀 Getting Started

### 1. **System Requirements**
- Node.js 18+ installed
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for AI analysis
- CSV data files (optional)

### 2. **Installation & Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000 (or next available port)
```

### 3. **Environment Configuration**
Create `.env.local` file with:
```env
# Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (Optional)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📊 Dashboard Components

### **1. Risk Overview**
- **Real-time risk score** (0-100 scale)
- **Risk level indicator** (Low/Medium/High)
- **Visual risk gauge** with color coding
- **View Details** button for comprehensive analysis

### **2. AI Recommendations**
- **AI-powered safety insights** based on current risk patterns
- **Preventive actions** with priority levels
- **Expected impact** percentages for each recommendation
- **Scrollable interface** for multiple recommendations
- **Auto-refresh** when risk levels change

### **3. Risk Timeline**
- **Live risk progression** chart during analysis
- **Historical data visualization** 
- **Work hours tracking** over time
- **Near-miss incident** correlation
- **Interactive timeline** with hover details

### **4. Operational Controls**
- **Sample Data Access** - Click the blinking "Click Here" to access sample CSV files
- **CSV Data Upload** - Upload your operational data files
- **Shift Context Selection** (Day/Night shift)
- **Start/Stop Analysis** controls
- **Real-time status** indicators

## 🔄 How to Run Analysis

### **Method 1: Using Sample Data (Recommended for First Time)**
**Step-by-Step Instructions:**

1. **Access Sample Data**
   - Click on **"Sample Data (Google Drive)"** button (with blinking green "Click Here" text)
   - This will open Google Drive in a new tab with sample CSV files

2. **Download Sample Data**
   - Download any CSV file from the Google Drive folder
   - Save it to your computer (e.g., Downloads folder)

3. **Upload Sample Data**
   - Go back to the ProSentry dashboard
   - Click **"Connect Operational Data"** button
   - Select the CSV file you just downloaded from Google Drive
   - You'll see "Data Connected" confirmation with the filename

4. **Start Analysis**
   - Select appropriate **shift context** (Day/Night)
   - Click **"Start Live Risk Analysis"**
   - Watch the AI analyze the data in real-time!

### **Method 2: Using Your Own Data**
1. Prepare CSV file with required columns:
   - `continuous_work_hours` (number)
   - `near_miss_count` (number) 
   - `machine_usage_level` (low/normal/high)
   - `shift_type` (day/night)
   - `timestamp` (time or step identifier)

2. Click **"Connect Operational Data"** 
3. Upload your CSV file
4. Click **"Start Live Risk Analysis"**

### **Method 3: Demo Mode**
1. Click **"Start Live Risk Analysis"** without uploading data
2. System runs with built-in demo data
3. Shows progression from low to high risk scenarios

## 🤖 AI Analysis Features

### **Risk Detection**
- **Fatigue Analysis** - Monitors continuous work hours
- **Incident Pattern Recognition** - Tracks near-miss events
- **Equipment Stress Assessment** - Evaluates machine usage levels
- **Circadian Risk Factors** - Considers shift timing effects
- **Trend Analysis** - Uses historical data for predictions

### **AI Recommendations**
- **Immediate Actions** - High priority interventions
- **Preventive Measures** - Medium priority precautions
- **Expected Impact** - Quantified risk reduction percentages
- **Timeframe Guidance** - When to implement actions
- **Reasoning** - AI explanation for each recommendation

## 🚨 Alert System

### **High-Risk Alerts**
- **Automatic Detection** - Triggers when risk score ≥ 70
- **Critical Safety Alerts** - Prominent visual and audio warnings
- **Preventive Intervention** - Recommends immediate action
- **Alert Acknowledgment** - Track response to alerts
- **Database Logging** - All alerts stored for compliance

### **Audio Feedback**
- **Scanning Beeps** - During active analysis
- **Risk Level Changes** - Audio notification for risk escalation
- **Critical Alerts** - Urgent sound for high-risk situations
- **Button Clicks** - Confirmation sounds for user actions
- **Sound Toggle** - Enable/disable audio in header

## 📱 Mobile Responsiveness

### **Device Support**
- **Mobile Phones** - Optimized for small screens
- **Tablets** - Adapted layout for medium screens  
- **Desktops** - Full feature experience
- **Touch Interface** - Mobile-friendly interactions

### **Mobile Layout**
- **Single Column** - Components stack vertically on mobile
- **Compact Header** - Reduced size elements for mobile
- **Scrollable Sections** - AI recommendations scroll on mobile
- **Touch-Friendly** - Larger buttons and touch targets

## 🔥 Database Integration

### **Firebase Firestore Storage**
- **Analysis Sessions** - Complete session tracking
- **Risk Results** - Every analysis step stored
- **Safety Alerts** - Alert history and acknowledgments
- **Historical Data** - Long-term trend analysis
- **Offline Mode** - System works without database

### **Data Collections**
- `analysis_sessions` - Session metadata and status
- `risk_analysis_results` - Detailed analysis data
- `safety_alerts` - Alert records and responses

## 🛠️ Troubleshooting

### **Common Issues**

**1. Analysis Not Starting**
- Ensure CSV data is uploaded or use demo mode
- Check that Gemini API key is configured
- Verify internet connection for AI analysis

**2. No AI Recommendations**
- Check risk level (recommendations appear for Medium/High risk)
- Verify Gemini API key in environment variables
- Try refreshing recommendations manually

**3. Audio Not Working**
- Click "Test" button in header to initialize audio
- Check browser audio permissions
- Use sound toggle to enable/disable audio

**4. Mobile Display Issues**
- Refresh page to apply responsive layout
- Check browser zoom level (100% recommended)
- Clear browser cache if layout appears broken

### **Performance Tips**
- **Close unused browser tabs** for better performance
- **Use latest browser version** for optimal experience
- **Stable internet connection** for real-time AI analysis
- **CSV file size** - Keep under 1MB for best performance

## 📈 Data Format Requirements

### **CSV File Structure**
```csv
continuous_work_hours,near_miss_count,machine_usage_level,shift_type,timestamp
2,0,low,day,08:00
4,1,normal,day,09:00
6,2,normal,day,10:00
8,3,high,day,11:00
10,4,high,night,12:00
```

### **Column Descriptions**
- **continuous_work_hours** - Hours worked without break (0-24)
- **near_miss_count** - Number of near-miss incidents (0+)
- **machine_usage_level** - Equipment stress (low/normal/high)
- **shift_type** - Work shift timing (day/night)
- **timestamp** - Time identifier (HH:MM or step number)

## 🎯 Best Practices

### **For Optimal Results**
1. **Regular Data Updates** - Upload fresh operational data frequently
2. **Monitor Trends** - Watch risk progression over time
3. **Act on Recommendations** - Implement AI-suggested preventive actions
4. **Acknowledge Alerts** - Respond to high-risk notifications promptly
5. **Review Historical Data** - Use Firebase data for trend analysis

### **Safety Guidelines**
- **Never ignore high-risk alerts** - Take immediate preventive action
- **Implement recommended breaks** - Follow AI fatigue management advice
- **Monitor near-miss patterns** - Address recurring incident types
- **Adjust shift schedules** - Consider circadian risk factors
- **Regular system checks** - Ensure continuous monitoring capability

## 📞 Support & Resources

### **Sample Data**
- Access sample CSV files via the **"Sample Data (Google Drive)"** button
- Multiple scenarios included (low to high risk progressions)
- Real industrial data patterns for testing

### **Technical Support**
- Check browser console for error messages
- Verify environment variable configuration
- Test with sample data before using production data
- Monitor Firebase console for database issues

---

**ProSentry Industrial Safety Intelligence Dashboard**  
*Detect dangerous operational windows before accidents occur*

🛡️ **Stay Safe. Stay Informed. Stay Ahead.**