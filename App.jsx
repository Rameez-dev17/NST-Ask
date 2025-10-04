import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

// Mock data - replace with actual API calls
const mockMentors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    expertise: 'Programming & Algorithms',
    experience: 5,
    rating: '4.9'
  },
  {
    id: 2,
    name: 'Prof. Michael Chen',
    expertise: 'Mathematics & Statistics',
    experience: 8,
    rating: '4.8'
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    expertise: 'Engineering & Physics',
    experience: 6,
    rating: '4.7'
  }
];

const mockDoubts = [
  {
    id: 1,
    title: 'How to implement binary search in Python?',
    description: 'I\'m learning algorithms and need help understanding how to implement binary search efficiently in Python. Can someone explain the logic and provide a working example?',
    category: 'programming',
    author: 'Anonymous',
    authorIsMentor: false,
    timestamp: '2 hours ago',
    answers: 3,
    likes: 5,
    media: []
  },
  {
    id: 2,
    title: 'What is the difference between AC and DC current?',
    description: 'I\'m studying electrical engineering and confused about the fundamental differences between alternating current and direct current. Need a clear explanation with examples.',
    category: 'engineering',
    author: 'Dr. Sarah Johnson',
    authorIsMentor: true,
    timestamp: '4 hours ago',
    answers: 2,
    likes: 8,
    media: []
  },
  {
    id: 3,
    title: 'How to solve quadratic equations using the quadratic formula?',
    description: 'I\'m struggling with quadratic equations in my math class. Can someone walk me through the quadratic formula step by step with examples?',
    category: 'mathematics',
    author: 'Anonymous',
    authorIsMentor: false,
    timestamp: '6 hours ago',
    answers: 4,
    likes: 12,
    media: []
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [isMentor, setIsMentor] = useState(false);
  const [doubts, setDoubts] = useState(mockDoubts);
  const [mentors, setMentors] = useState(mockMentors);

  // Check for existing login session
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsMentor(userData.isMentor || false);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleStudentLogin = async (credentials) => {
    // Mock login - replace with actual authentication
    const mockUser = {
      name: 'John Doe',
      email: credentials.email,
      urn: '12345678',
      xp: 150,
      doubtsAsked: 5,
      answersGiven: 3,
      helpfulAnswers: 2,
      isMentor: false
    };
    
    setUser(mockUser);
    setIsMentor(false);
    setCurrentPage('dashboard');
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
  };

  const handleMentorLogin = async (credentials) => {
    // Mock login - replace with actual authentication
    const mockMentor = {
      name: 'Dr. Sarah Johnson',
      email: credentials.email,
      expertise: 'Programming & Algorithms',
      experience: 5,
      xp: 320,
      doubtsAsked: 0,
      answersGiven: 15,
      helpfulAnswers: 12,
      studentsHelped: 25,
      isMentor: true
    };
    
    setUser(mockMentor);
    setIsMentor(true);
    setCurrentPage('dashboard');
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(mockMentor));
  };

  const handleStudentSignup = () => {
    // Navigate to signup page or show signup modal
    console.log('Navigate to student signup');
  };

  const handleMentorSignup = () => {
    // Navigate to mentor signup page or show signup modal
    console.log('Navigate to mentor signup');
  };

  const handleAskDoubt = (doubtData) => {
    const newDoubt = {
      id: Date.now(),
      ...doubtData,
      author: doubtData.isAnonymous ? 'Anonymous' : user.name,
      authorIsMentor: isMentor,
      timestamp: 'Just now',
      answers: 0,
      likes: 0
    };
    
    setDoubts(prev => [newDoubt, ...prev]);
    
    // Update user stats
    setUser(prev => ({
      ...prev,
      doubtsAsked: (prev.doubtsAsked || 0) + 1,
      xp: (prev.xp || 0) + 10
    }));
    
    console.log('Doubt posted:', newDoubt);
  };

  const handleAnswerDoubt = (doubtId) => {
    console.log('Answer doubt:', doubtId);
    // Open answer modal or navigate to answer page
  };

  const handleViewDoubt = (doubtId) => {
    console.log('View doubt:', doubtId);
    // Navigate to doubt detail page
  };

  const handleLikeDoubt = (doubtId) => {
    setDoubts(prev => prev.map(doubt => 
      doubt.id === doubtId 
        ? { ...doubt, likes: doubt.likes + 1 }
        : doubt
    ));
  };

  const handleSearch = (query) => {
    console.log('Search:', query);
  };

  const handleFilter = (category) => {
    console.log('Filter:', category);
  };

  const handleLogout = () => {
    setUser(null);
    setIsMentor(false);
    setCurrentPage('login');
    localStorage.removeItem('currentUser');
  };

  if (currentPage === 'login') {
    return (
      <LoginPage
        onStudentLogin={handleStudentLogin}
        onMentorLogin={handleMentorLogin}
        onStudentSignup={handleStudentSignup}
        onMentorSignup={handleMentorSignup}
        mentors={mentors}
      />
    );
  }

  if (currentPage === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Profile user={user} isMentor={isMentor} />
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <Dashboard
      user={user}
      doubts={doubts}
      onAskDoubt={handleAskDoubt}
      onAnswerDoubt={handleAnswerDoubt}
      onViewDoubt={handleViewDoubt}
      onLikeDoubt={handleLikeDoubt}
      onSearch={handleSearch}
      onFilter={handleFilter}
    />
  );
}

export default App;
