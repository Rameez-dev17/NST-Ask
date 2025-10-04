# Firebase Setup Instructions

## Overview
This application now includes cloud storage functionality using Firebase Firestore. The app will work with localStorage as a fallback if Firebase is not configured.

## Firebase Configuration

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `nst-ask` (or your preferred name)
4. Follow the setup wizard

### 2. Enable Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database

### 3. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) icon
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 4. Update Configuration in Code
Replace the demo configuration in `script.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

## Data Structure

### Students Collection
- Document ID: Student email
- Fields: name, urn, email, mobile, password, xp, doubtsAsked, answersGiven, helpfulAnswers, createdAt, lastUpdated

### Mentors Collection
- Document ID: Mentor email
- Fields: id, name, email, expertise, experience, password, rating, studentsHelped, solutionsGiven, xp, createdAt, lastUpdated

## Security Rules (Optional)
For production, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }
    match /mentors/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }
  }
}
```

## Features Implemented

### ✅ Dynamic Mentor System
- Mentors are automatically added to the mentors section when they sign up
- No hardcoded mentor data
- Real-time mentor information display

### ✅ Persistent Login
- Users stay logged in for 24 hours
- Session data stored in localStorage
- Auto-login on page refresh

### ✅ Cloud Storage
- Student and mentor data synced to Firebase Firestore
- localStorage fallback when Firebase is unavailable
- Real-time data updates

### ✅ Data Persistence
- XP points, doubts asked, answers given are all saved
- Mentor statistics (solutions given, students helped) are tracked
- All data persists across sessions

## Testing Without Firebase
The application will work perfectly with just localStorage if Firebase is not configured. All features will function normally, but data will only be stored locally.

## Production Considerations
1. Set up proper Firebase security rules
2. Enable Firebase Authentication for better security
3. Consider implementing proper password hashing
4. Add data validation and error handling
5. Set up Firebase hosting for deployment
