module.exports = {
  // V0 configuration for NST Ask Platform
  name: 'NST Ask Platform',
  description: 'Anonymous doubt solving platform for students and mentors',
  
  // Component structure
  components: {
    'LoginPage': {
      path: './components/LoginPage.jsx',
      description: 'Authentication page with mentor directory',
      props: ['onStudentLogin', 'onMentorLogin', 'onStudentSignup', 'onMentorSignup', 'mentors']
    },
    'Dashboard': {
      path: './components/Dashboard.jsx',
      description: 'Main dashboard with doubt feed and management',
      props: ['user', 'doubts', 'onAskDoubt', 'onAnswerDoubt', 'onViewDoubt', 'onLikeDoubt', 'onSearch', 'onFilter']
    },
    'Profile': {
      path: './components/Profile.jsx',
      description: 'User profile with XP system and activity stats',
      props: ['user', 'isMentor']
    }
  },
  
  // Styling configuration
  styling: {
    framework: 'tailwindcss',
    customCSS: './index.css',
    theme: {
      colors: {
        primary: '#8B5CF6', // Purple
        secondary: '#EC4899', // Pink
        accent: '#3B82F6', // Blue
        background: '#F8FAFC', // Gray-50
        surface: '#FFFFFF',
        text: '#1F2937' // Gray-800
      },
      gradients: {
        primary: 'from-purple-600 to-pink-600',
        secondary: 'from-blue-600 to-purple-600',
        accent: 'from-purple-500 to-indigo-500'
      }
    }
  },
  
  // Features configuration
  features: {
    authentication: true,
    mediaUpload: true,
    realTimeUpdates: true,
    gamification: true,
    responsive: true,
    darkMode: false
  },
  
  // Data structure
  dataModels: {
    User: {
      name: 'string',
      email: 'string',
      urn: 'string?',
      xp: 'number',
      doubtsAsked: 'number',
      answersGiven: 'number',
      helpfulAnswers: 'number',
      isMentor: 'boolean'
    },
    Mentor: {
      name: 'string',
      email: 'string',
      expertise: 'string',
      experience: 'number',
      xp: 'number',
      solutionsGiven: 'number',
      studentsHelped: 'number',
      helpfulSolutions: 'number'
    },
    Doubt: {
      id: 'number',
      title: 'string',
      description: 'string',
      category: 'string',
      author: 'string',
      authorIsMentor: 'boolean',
      timestamp: 'string',
      answers: 'number',
      likes: 'number',
      media: 'Media[]'
    },
    Media: {
      name: 'string',
      type: 'string',
      size: 'number',
      data: 'string'
    }
  },
  
  // API endpoints (mock)
  api: {
    baseURL: '/api',
    endpoints: {
      login: 'POST /auth/login',
      signup: 'POST /auth/signup',
      doubts: 'GET /doubts',
      createDoubt: 'POST /doubts',
      answers: 'GET /answers',
      createAnswer: 'POST /answers',
      mentors: 'GET /mentors',
      profile: 'GET /profile',
      updateProfile: 'PUT /profile'
    }
  },
  
  // Deployment configuration
  deployment: {
    platform: 'vercel',
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    environmentVariables: [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ]
  }
};
