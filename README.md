# NST Ask - Anonymous Doubt Solving Platform

A modern, AI-powered doubt solving platform for NST students and mentors with real-time collaboration, media support, and gamification features.

## 🚀 Features

### For Students
- **Anonymous Doubt Posting** - Ask questions without revealing identity
- **Media Support** - Upload images and videos with doubts
- **Real-time Answers** - Get instant responses from mentors
- **XP System** - Earn points for asking questions and providing answers
- **My Doubts Tracking** - Keep track of all your posted questions
- **Profile Management** - Comprehensive profile with activity stats

### For Mentors
- **Expert Dashboard** - Dedicated interface for mentors
- **Doubt Management** - View and answer pending doubts
- **Media Support** - Respond with images and videos
- **Student Tracking** - Monitor students helped
- **XP Rewards** - Earn points for providing solutions
- **Mentor Directory** - Public listing of available mentors

### Platform Features
- **Real-time Updates** - Live notifications and updates
- **Cloud Storage** - Firebase integration for data persistence
- **Responsive Design** - Works on all devices
- **Modern UI** - Beautiful, intuitive interface
- **Search & Filter** - Find relevant doubts and answers
- **Leaderboard** - Gamified ranking system

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with modern gradients and animations
- **Backend**: Firebase (Firestore, Authentication)
- **Storage**: LocalStorage + Cloud sync
- **Build Tool**: Vite
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Firebase project setup
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nst-ask-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Firestore and Authentication
   - Update `firebaseConfig` in `script.js`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:3000`

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Update the configuration in `script.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Environment Variables
Create a `.env` file for sensitive configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 📱 Usage

### For Students
1. **Sign Up** - Create account with NST email
2. **Ask Doubts** - Post questions with optional media
3. **Get Answers** - Receive responses from mentors
4. **Track Progress** - Monitor XP and activity in profile

### For Mentors
1. **Register** - Sign up as mentor with expertise
2. **Answer Doubts** - Help students with solutions
3. **Build Reputation** - Earn XP and recognition
4. **Manage Profile** - Update expertise and settings

## 🎨 UI Components

### Pages
- **Login Page** - Authentication with mentor directory
- **Dashboard** - Main interface for students
- **Mentor Dashboard** - Specialized interface for mentors
- **Profile** - User statistics and settings

### Components
- **Doubt Cards** - Display questions with media
- **Answer Modals** - Respond to doubts
- **Media Upload** - Image/video upload interface
- **XP System** - Gamification elements
- **Navigation** - Sidebar navigation

## 🔒 Security

- **Email Validation** - NST email domain verification
- **Anonymous Posting** - Optional anonymity
- **Data Encryption** - Secure data transmission
- **Input Validation** - XSS and injection protection

## 📊 Data Structure

### Student Data
```javascript
{
  name: string,
  urn: string,
  email: string,
  mobile: string,
  xp: number,
  doubtsAsked: number,
  answersGiven: number,
  helpfulAnswers: number
}
```

### Mentor Data
```javascript
{
  name: string,
  email: string,
  expertise: string,
  experience: number,
  xp: number,
  solutionsGiven: number,
  studentsHelped: number,
  helpfulSolutions: number
}
```

### Doubt Data
```javascript
{
  id: number,
  title: string,
  description: string,
  category: string,
  author: string,
  media: array,
  timestamp: string,
  answers: number,
  likes: number
}
```

## 🚀 Deployment

### Vercel Deployment
1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Configure Environment Variables**
   - Add Firebase configuration
   - Set production URLs

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment
1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy dist folder**
   - Upload to any static hosting service
   - Configure Firebase for production

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NST (Noida School of Technology) for inspiration
- Firebase for backend services
- Vercel for deployment platform
- Open source community for tools and libraries

## 📞 Support

For support and questions:
- Email: support@nstask.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [Wiki](https://github.com/your-repo/wiki)

---

**Made with ❤️ for NST Students and Mentors**
