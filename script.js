// Firebase Configuration
const firebaseConfig = {
    apiKey: "demo-api-key",
    authDomain: "nst-ask-demo.firebaseapp.com",
    projectId: "nst-ask-demo",
    storageBucket: "nst-ask-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id"
};

// Initialize Firebase
let db, auth;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
} catch (error) {
    console.log('Firebase not available, using localStorage fallback');
}

// Global variables
let currentPage = 'landing';
let studentData = {};
let mentorData = {};
let currentUser = {
    isMentor: false,
    xp: 0,
    doubtsAsked: 0,
    answersGiven: 0,
    helpfulAnswers: 0
};

// Advanced Content Moderation System with Supabase Integration
const SUPABASE_CONFIG = window.SUPABASE_CONFIG || {
    url: "https://YOUR_PROJECT.supabase.co", // Replace with your Supabase URL
    anonKey: "YOUR_ANON_PUBLIC_KEY" // Replace with your Supabase anon key
};

// Initialize Supabase client (optional - for advanced moderation)
let supabase = null;
try {
    if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url !== "https://YOUR_PROJECT.supabase.co") {
        supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('Supabase moderation enabled');
    } else {
        console.log('Supabase not configured - using local moderation only');
    }
} catch (error) {
    console.log('Supabase initialization failed - using local moderation only:', error);
}

// Enhanced Content Moderation System
const PROFANITY_FILTER = {
    // English profanity
    english: [
        'damn', 'hell', 'shit', 'fuck', 'bitch', 'bastard', 'asshole', 'porn', 'horny', 'dick', 'pussy', 'boobs', 'cock', 'slut', 'whore',
        'stupid', 'idiot', 'dumbass', 'moron', 'loser', 'fatass', 'ugly', 'retard', 'scumbag', 'jerk off', 'sex', 'nude', 'blowjob',
        'damn it', 'prick', 'dickhead', 'fucking', 'shitty', 'bitchy', 'bastardly', 'assholish', 'pornographic', 'horniness',
        'dickhead', 'pussies', 'boobies', 'cocks', 'sluts', 'whores', 'stupidity', 'idiocy', 'moronic', 'losers', 'ugliness'
    ],
    
    // Hindi profanity
    hindi: [
        'हरामजादा', 'कमीना', 'गधा', 'बेवकूफ', 'चूतिया', 'भोसड़ी', 'चूत', 'लंड', 'कमीना औरत', 'बटेर', 'रंडी', 'मूर्ख', 'घटिया', 'निकम्मा', 'बेशर्म',
        'हरामखोर', 'टिच्च', 'वाघीण', 'लांडू', 'मोफत', 'विजेता', 'तुरंत', 'आपकी', 'राशि', 'जमा', 'करें', 'लगेच', 'क्लिक', 'करा', 'तुमचे', 'खाते', 'तपासा',
        'टकटक्या', 'कमीण', 'haraamjaada', 'kameena', 'gadha', 'bewkoof', 'chutiya', 'bhosdi', 'chut', 'lund', 'randi', 'moorkh', 'ghatiya', 'nikamma', 'besharm',
        'haraamkhor', 'ticch', 'vaghin', 'landu', 'mofat', 'vijeta', 'turant', 'aapki', 'rashi', 'jama', 'karein', 'lagech', 'click', 'kara', 'tumche', 'khate', 'tapasa',
        'tak-takya', 'kameen'
    ],
    
    // Common variations and leetspeak
    variations: [
        'f*ck', 'f**k', 'f***', 'sh*t', 's**t', 'b*tch', 'b**ch', 'a**hole', 'a****le', 'd*ck', 'd**k', 'p*ssy', 'p***y',
        'c*ck', 'c**k', 'sl*t', 's**t', 'wh*re', 'w***e', 'st*pid', 'st**id', 'id*ot', 'i**ot', 'd*mbass', 'd**bass',
        'm*ron', 'm**on', 'l*ser', 'l**er', 'f*tass', 'f**ass', 'ug*y', 'u**y', 'r*tard', 'r**ard', 'sc*mbag', 'sc**bag'
    ],
    
    // Spam keywords
    spam: [
        'buy now', 'click here', 'free money', 'visit this', 'subscribe now', 'earn money', 'make money fast',
        'get rich quick', 'investment opportunity', 'crypto investment', 'bitcoin investment', 'forex trading',
        'work from home', 'online job', 'part time job', 'full time job', 'immediate hiring', 'urgent hiring',
        'lottery winner', 'congratulations', 'you have won', 'claim your prize', 'free gift', 'free offer',
        'limited time', 'act now', 'don\'t miss out', 'exclusive offer', 'special deal', 'discount code',
        'follow me', 'add me', 'dm me', 'message me', 'contact me', 'call me', 'whatsapp me',
        'telegram', 'signal', 'discord', 'join group', 'join channel', 'join server'
    ]
};

// Advanced text normalization for better detection
function normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text.toLowerCase()
               .normalize("NFKD") // Unicode normalization
               .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
               .replace(/\s+/g, " ") // Normalize whitespace
               .replace(/[^\w\s]/g, "") // Remove special characters
               .trim();
}

// Enhanced function to check for profanity and spam
function containsProfanity(text) {
    if (!text || typeof text !== 'string') return false;
    
    const normalizedText = normalizeText(text);
    const originalText = text.toLowerCase();
    
    // Check profanity with word boundaries
    const profanityWords = [
        ...PROFANITY_FILTER.english,
        ...PROFANITY_FILTER.hindi,
        ...PROFANITY_FILTER.variations
    ];
    
    const hasProfanity = profanityWords.some(word => {
        const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(originalText);
    });
    
    // Check spam keywords (phrase matching)
    const hasSpam = PROFANITY_FILTER.spam.some(phrase => {
        return originalText.includes(phrase.toLowerCase());
    });
    
    return hasProfanity || hasSpam;
}

// Advanced moderation with Supabase backend (optional)
async function moderateWithBackend(content) {
    if (!supabase) return { status: 'allowed' }; // Fallback to local moderation
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
            return { status: 'allowed' }; // No auth, use local moderation
        }
        
        const response = await fetch(`${SUPABASE_CONFIG.url}/functions/v1/moderate-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.log('Backend moderation failed, using local moderation:', error);
        return { status: 'allowed' }; // Fallback to local moderation
    }
}

// Function to reset user XP to zero
function resetUserXP() {
    if (currentUser.isMentor) {
        currentMentor.xp = 0;
        currentMentor.doubtsAsked = 0;
        currentMentor.answersGiven = 0;
        currentMentor.helpfulAnswers = 0;
        currentMentor.solutionsGiven = 0;
        currentMentor.studentsHelped = 0;
        currentMentor.helpfulSolutions = 0;
        
        // Save to localStorage
        localStorage.setItem('mentorData', JSON.stringify(currentMentor));
        
        // Save to cloud
        saveMentorToCloud(currentMentor);
    } else {
        studentData.xp = 0;
        studentData.doubtsAsked = 0;
        studentData.answersGiven = 0;
        studentData.helpfulAnswers = 0;
        
        // Save to localStorage
        localStorage.setItem('studentData', JSON.stringify(studentData));
        
        // Save to cloud
        saveStudentToCloud(studentData);
    }
    
    // Update current user object
    currentUser.xp = 0;
    currentUser.doubtsAsked = 0;
    currentUser.answersGiven = 0;
    currentUser.helpfulAnswers = 0;
    
    // Update UI
    loadProfileData();
    loadLeaderboard();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load mentors list on page load
    loadMentorsFromCloud();
    
    // Always show login page first, then check for existing session
        showLoginPage();
    
    // Check for existing login session after a short delay
    setTimeout(() => {
        checkExistingLogin();
    }, 1000);
});

// Dashboard functionality
let currentDashboardSection = 'dashboard-home';

// Dashboard navigation
function showDashboardSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to corresponding nav item
    const navItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    currentDashboardSection = sectionId;
    
    // Load section-specific content
    loadDashboardSectionContent(sectionId);
}

// Load content for specific dashboard sections
function loadDashboardSectionContent(sectionId) {
    switch(sectionId) {
        case 'dashboard-home':
            loadQuestionFeed();
            break;
        case 'my-doubts':
            loadMyDoubtsDashboard();
            break;
        case 'my-answers':
            loadMyAnswersDashboard();
            break;
        case 'mentors':
            loadMentorsDashboard();
            break;
        case 'leaderboard':
            loadLeaderboardDashboard();
            break;
        case 'profile':
            loadProfileDashboard();
            break;
    }
}

// Load question feed for dashboard
function loadQuestionFeed() {
    const questionsGrid = document.getElementById('questions-grid');
    if (!questionsGrid) return;
    
    // Use existing doubts data
    const allDoubts = [...doubtsData, ...userDoubts];
    
    questionsGrid.innerHTML = allDoubts.map(doubt => `
        <div class="question-card">
            <div class="question-header">
                <div class="question-author">
                    <div class="question-avatar">
                        <img src="placeholder-user.jpg" alt="User">
                    </div>
                    <div class="question-meta">
                        <span class="question-name">${doubt.authorName}</span>
                        <span class="question-time">${doubt.timestamp}</span>
                    </div>
                </div>
                <span class="question-status ${doubt.answers && doubt.answers.length > 0 ? 'answered' : 'pending'}">
                    ${doubt.answers && doubt.answers.length > 0 ? 'Answered' : 'Pending'}
                </span>
            </div>
            <h3 class="question-title">${doubt.title}</h3>
            <p class="question-description">${doubt.description}</p>
            <div class="question-tags">
                ${doubt.category ? `<span class="question-tag">${doubt.category}</span>` : ''}
                ${doubt.tags ? doubt.tags.map(tag => `<span class="question-tag">${tag}</span>`).join('') : ''}
            </div>
            <div class="question-stats">
                <div class="question-metrics">
                    <div class="question-metric">
                        <i class="fas fa-comments"></i>
                        <span>${doubt.answers ? doubt.answers.length : 0} answers</span>
                    </div>
                    <div class="question-metric">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${doubt.likes || 0} likes</span>
                    </div>
                    <div class="question-metric">
                        <i class="fas fa-eye"></i>
                        <span>${doubt.views || 0} views</span>
                    </div>
                </div>
                <div class="question-actions">
                    <button class="btn-outline" onclick="viewQuestionDetails(${doubt.id})">View Solutions</button>
                    <button class="btn-primary" onclick="answerQuestion(${doubt.id})">Answer</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load my doubts for dashboard
function loadMyDoubtsDashboard() {
    const doubtsList = document.getElementById('my-doubts-list');
    const totalDoubts = document.getElementById('total-doubts');
    const answeredDoubts = document.getElementById('answered-doubts');
    const pendingDoubts = document.getElementById('pending-doubts');
    
    if (!doubtsList) return;
    
    // Update stats
    const total = userDoubts.length;
    const answered = userDoubts.filter(d => d.answers && d.answers.length > 0).length;
    const pending = total - answered;
    
    if (totalDoubts) totalDoubts.textContent = total;
    if (answeredDoubts) answeredDoubts.textContent = answered;
    if (pendingDoubts) pendingDoubts.textContent = pending;
    
    // Load doubts
    doubtsList.innerHTML = userDoubts.map(doubt => `
        <div class="doubt-card">
            <div class="question-header">
                <div class="question-author">
                    <div class="question-avatar">
                        <img src="placeholder-user.jpg" alt="User">
                    </div>
                    <div class="question-meta">
                        <span class="question-name">You</span>
                        <span class="question-time">${doubt.timestamp}</span>
                    </div>
                </div>
                <span class="question-status ${doubt.answers && doubt.answers.length > 0 ? 'answered' : 'pending'}">
                    ${doubt.answers && doubt.answers.length > 0 ? 'Answered' : 'Pending'}
                </span>
            </div>
            <h3 class="question-title">${doubt.title}</h3>
            <p class="question-description">${doubt.description}</p>
            <div class="question-tags">
                ${doubt.category ? `<span class="question-tag">${doubt.category}</span>` : ''}
                ${doubt.tags ? doubt.tags.map(tag => `<span class="question-tag">${tag}</span>`).join('') : ''}
            </div>
            <div class="question-stats">
                <div class="question-metrics">
                    <div class="question-metric">
                        <i class="fas fa-comments"></i>
                        <span>${doubt.answers ? doubt.answers.length : 0} answers</span>
                    </div>
                    <div class="question-metric">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${doubt.likes || 0} likes</span>
                    </div>
                    <div class="question-metric">
                        <i class="fas fa-eye"></i>
                        <span>${doubt.views || 0} views</span>
                    </div>
                </div>
                <div class="question-actions">
                    <button class="btn-outline" onclick="viewQuestionDetails(${doubt.id})">View Details</button>
                    ${doubt.answers && doubt.answers.length === 0 ? `<button class="btn-primary" onclick="editQuestion(${doubt.id})">Edit</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Load my answers for dashboard
function loadMyAnswersDashboard() {
    const answersList = document.getElementById('my-answers-list');
    const totalAnswers = document.getElementById('total-answers');
    const acceptedAnswers = document.getElementById('accepted-answers');
    const totalLikes = document.getElementById('total-likes');
    
    if (!answersList) return;
    
    // Update stats
    const total = userAnswers.length;
    const accepted = userAnswers.filter(a => a.evaluated).length;
    const likes = userAnswers.reduce((sum, a) => sum + (a.likes || 0), 0);
    
    if (totalAnswers) totalAnswers.textContent = total;
    if (acceptedAnswers) acceptedAnswers.textContent = accepted;
    if (totalLikes) totalLikes.textContent = likes;
    
    // Load answers
    answersList.innerHTML = userAnswers.map(answer => `
        <div class="answer-card">
            <div class="question-header">
                <div class="question-author">
                    <div class="question-avatar">
                        <img src="placeholder-user.jpg" alt="User">
                    </div>
                    <div class="question-meta">
                        <span class="question-name">You</span>
                        <span class="question-time">${answer.timestamp}</span>
                    </div>
                </div>
                ${answer.evaluated ? '<span class="question-status answered">Accepted</span>' : ''}
            </div>
            <h3 class="question-title">${answer.doubtTitle}</h3>
            <p class="question-description">${answer.content}</p>
            <div class="question-stats">
                <div class="question-metrics">
                    <div class="question-metric">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${answer.likes || 0} likes</span>
                    </div>
                    <div class="question-metric">
                        <i class="fas fa-star"></i>
                        <span>${answer.xpAwarded || 0} XP</span>
                    </div>
                </div>
                <div class="question-actions">
                    <button class="btn-outline" onclick="viewQuestionDetails(${answer.doubtId})">View Question</button>
                    <button class="btn-primary" onclick="editAnswer(${answer.id})">Edit Answer</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load mentors for dashboard
function loadMentorsDashboard() {
    const mentorsGrid = document.getElementById('mentors-grid');
    if (!mentorsGrid) return;
    
    mentorsGrid.innerHTML = registeredMentors.map(mentor => `
        <div class="mentor-card">
            <div class="mentor-header">
                <div class="mentor-avatar">
                    <img src="placeholder-user.jpg" alt="${mentor.name}">
                    <div class="mentor-online"></div>
                </div>
                <div class="mentor-info">
                    <h3>${mentor.name}</h3>
                    <p class="mentor-title">${mentor.expertise || 'Expert'}</p>
                    <p class="mentor-company">Mentor</p>
                </div>
                <div class="mentor-rating">
                    <i class="fas fa-star"></i>
                    <span>4.8</span>
                </div>
            </div>
            <p class="mentor-bio">Experienced mentor with expertise in ${mentor.expertise || 'various fields'}.</p>
            <div class="mentor-expertise">
                ${mentor.expertise ? `<span class="expertise-tag">${mentor.expertise}</span>` : ''}
                <span class="expertise-tag">Mentor</span>
            </div>
            <div class="mentor-stats">
                <div class="mentor-stat">
                    <div class="mentor-stat-number">${mentor.studentsHelped || 0}</div>
                    <div class="mentor-stat-label">Students</div>
                </div>
                <div class="mentor-stat">
                    <div class="mentor-stat-number">${mentor.solutionsGiven || 0}</div>
                    <div class="mentor-stat-label">Solutions</div>
                </div>
                <div class="mentor-stat">
                    <div class="mentor-stat-number">${mentor.xp || 0}</div>
                    <div class="mentor-stat-label">XP</div>
                </div>
            </div>
            <div class="mentor-actions">
                <button class="mentor-btn primary" onclick="contactMentor('${mentor.id}')">
                    <i class="fas fa-comments"></i>
                    Ask for Help
                </button>
                <button class="mentor-btn" onclick="viewMentorProfile('${mentor.id}')">
                    <i class="fas fa-user"></i>
                    Profile
                </button>
            </div>
        </div>
    `).join('');
}

// Load leaderboard for dashboard
function loadLeaderboardDashboard() {
    const leaderboardContent = document.getElementById('leaderboard-content');
    if (!leaderboardContent) return;
    
    // Combine all users for leaderboard
    const allUsers = [
        ...registeredMentors.map(m => ({ ...m, type: 'mentor' })),
        ...registeredStudents.map(s => ({ ...s, type: 'student' }))
    ].sort((a, b) => (b.xp || 0) - (a.xp || 0));
    
    leaderboardContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-number">${allUsers.length}</div>
                    <div class="stat-label">Total Users</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-number">${registeredMentors.length}</div>
                    <div class="stat-label">Mentors</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon yellow">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-number">${registeredStudents.length}</div>
                    <div class="stat-label">Students</div>
                </div>
            </div>
        </div>
        <div class="questions-grid">
            ${allUsers.slice(0, 10).map((user, index) => `
                <div class="question-card">
                    <div class="question-header">
                        <div class="question-author">
                            <div class="question-avatar">
                                <img src="placeholder-user.jpg" alt="${user.name}">
                            </div>
                            <div class="question-meta">
                                <span class="question-name">${user.name}</span>
                                <span class="question-time">${user.type === 'mentor' ? 'Mentor' : 'Student'}</span>
                            </div>
                        </div>
                        <span class="question-status answered">#${index + 1}</span>
                    </div>
                    <div class="question-stats">
                        <div class="question-metrics">
                            <div class="question-metric">
                                <i class="fas fa-star"></i>
                                <span>${user.xp || 0} XP</span>
                            </div>
                            <div class="question-metric">
                                <i class="fas fa-comments"></i>
                                <span>${user.solutionsGiven || user.answersGiven || 0} answers</span>
                            </div>
                            <div class="question-metric">
                                <i class="fas fa-users"></i>
                                <span>${user.studentsHelped || 0} helped</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Load profile for dashboard
function loadProfileDashboard() {
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) return;
    
    const user = currentUser.isMentor ? currentMentor : studentData;
    
    profileContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue">
                    <i class="fas fa-star"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-number">${user.xp || 0}</div>
                    <div class="stat-label">Total XP</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">
                    <i class="fas fa-question-circle"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-number">${user.doubtsAsked || 0}</div>
                    <div class="stat-label">Questions Asked</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon yellow">
                    <i class="fas fa-comments"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-number">${user.answersGiven || user.solutionsGiven || 0}</div>
                    <div class="stat-label">Answers Given</div>
                </div>
            </div>
        </div>
        <div class="question-card">
            <h3>Profile Information</h3>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Type:</strong> ${currentUser.isMentor ? 'Mentor' : 'Student'}</p>
            ${user.expertise ? `<p><strong>Expertise:</strong> ${user.expertise}</p>` : ''}
            ${user.urn ? `<p><strong>URN:</strong> ${user.urn}</p>` : ''}
        </div>
    `;
}

// Dashboard navigation event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for dashboard navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                showDashboardSection(section);
            }
        });
    });
    
    // Add event listeners for filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // Implement filtering logic here
        });
    });
});

// Toggle sidebar for mobile
function toggleSidebar() {
    const sidebar = document.getElementById('dashboard-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Toggle theme
function toggleTheme() {
    // Implement theme toggle logic
    document.body.classList.toggle('dark-theme');
}

// Dashboard helper functions
function viewQuestionDetails(questionId) {
    // Find and show question details
    const doubt = [...doubtsData, ...userDoubts].find(d => d.id === questionId);
    if (doubt) {
        selectedDoubtForAnswer = doubt;
        openAnswerModal();
    }
}

function answerQuestion(questionId) {
    viewQuestionDetails(questionId);
}

function editQuestion(questionId) {
    // Implement edit question functionality
    showNotification('Edit question functionality coming soon!', 'info');
}

function editAnswer(answerId) {
    // Implement edit answer functionality
    showNotification('Edit answer functionality coming soon!', 'info');
}

function contactMentor(mentorId) {
    // Implement contact mentor functionality
    showNotification('Contact mentor functionality coming soon!', 'info');
}

function viewMentorProfile(mentorId) {
    // Implement view mentor profile functionality
    showNotification('View mentor profile functionality coming soon!', 'info');
}

// Check for existing login session
function checkExistingLogin() {
    const currentUserSession = localStorage.getItem('currentUser');
    if (currentUserSession) {
        const session = JSON.parse(currentUserSession);
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
        
        // Show notification about existing session instead of auto-login
        if (hoursSinceLogin < 24) {
            const userType = session.isMentor ? 'Mentor' : 'Student';
            const userName = session.isMentor ? 
                (JSON.parse(localStorage.getItem('mentorData') || '{}').name || 'Mentor') :
                (JSON.parse(localStorage.getItem('studentData') || '{}').name || 'Student');
            
            showNotification(`Welcome back, ${userName}! You have an active ${userType} session. Click "Continue Session" to resume or login with a different account.`, 'info');
            
            // Add continue session button to login page
            addContinueSessionButton(session);
            return;
        } else {
            // Session expired, clear it
            localStorage.removeItem('currentUser');
        }
    }
}

// Check if user is logged in
function isLoggedIn() {
    const currentUserSession = localStorage.getItem('currentUser');
    return currentUserSession !== null;
}

// Cloud Storage Functions
async function saveStudentToCloud(studentData) {
    if (db) {
        try {
            await db.collection('students').doc(studentData.email).set({
                ...studentData,
                lastUpdated: new Date().toISOString()
            });
            console.log('Student data saved to cloud');
        } catch (error) {
            console.log('Error saving student to cloud:', error);
        }
    }
    // Always save to localStorage as fallback
    localStorage.setItem('studentData', JSON.stringify(studentData));
}

async function saveMentorToCloud(mentorData) {
    if (db) {
        try {
            await db.collection('mentors').doc(mentorData.email).set({
                ...mentorData,
                lastUpdated: new Date().toISOString()
            });
            console.log('Mentor data saved to cloud');
        } catch (error) {
            console.log('Error saving mentor to cloud:', error);
        }
    }
    // Always save to localStorage as fallback
    localStorage.setItem('mentorData', JSON.stringify(mentorData));
}

async function loadMentorsFromCloud() {
    if (db) {
        try {
            const snapshot = await db.collection('mentors').get();
            const mentors = [];
            snapshot.forEach(doc => {
                mentors.push(doc.data());
            });
            registeredMentors = mentors;
            localStorage.setItem('registeredMentors', JSON.stringify(mentors));
            console.log('Mentors loaded from cloud');
            return mentors;
        } catch (error) {
            console.log('Error loading mentors from cloud:', error);
        }
    }
    
    // Fallback to localStorage
    const storedMentors = localStorage.getItem('registeredMentors');
    if (storedMentors) {
        registeredMentors = JSON.parse(storedMentors);
        return registeredMentors;
    }
    return [];
}

async function loadStudentFromCloud(email) {
    if (db) {
        try {
            const doc = await db.collection('students').doc(email).get();
            if (doc.exists) {
                const studentData = doc.data();
                localStorage.setItem('studentData', JSON.stringify(studentData));
                console.log('Student data loaded from cloud');
                return studentData;
            }
        } catch (error) {
            console.log('Error loading student from cloud:', error);
        }
    }
    
    // Fallback to localStorage
    const storedStudentData = localStorage.getItem('studentData');
    if (storedStudentData) {
        return JSON.parse(storedStudentData);
    }
    return null;
}

async function loadMentorFromCloud(email) {
    if (db) {
        try {
            const doc = await db.collection('mentors').doc(email).get();
            if (doc.exists) {
                const mentorData = doc.data();
                localStorage.setItem('mentorData', JSON.stringify(mentorData));
                console.log('Mentor data loaded from cloud');
                return mentorData;
            }
        } catch (error) {
            console.log('Error loading mentor from cloud:', error);
        }
    }
    
    // Fallback to localStorage
    const storedMentorData = localStorage.getItem('mentorData');
    if (storedMentorData) {
        return JSON.parse(storedMentorData);
    }
    return null;
}

// Page navigation functions
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id !== pageId) {
            page.classList.add('prev');
        }
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.classList.remove('prev');
    }
    
    currentPage = pageId;
}

function showLoginPage() {
    showPage('login-page');
    
    // Load mentors on login page
    loadLoginMentors();
    
    // Pre-fill email fields if available
    setTimeout(() => {
        const lastStudentEmail = localStorage.getItem('lastRegisteredEmail');
        const lastMentorEmail = localStorage.getItem('lastRegisteredMentorEmail');
        
        if (lastStudentEmail) {
            const studentEmailInput = document.querySelector('#student-login-form input[type="email"]');
            if (studentEmailInput) {
                studentEmailInput.value = lastStudentEmail;
            }
        }
        
        if (lastMentorEmail) {
            const mentorLoginForm = document.getElementById('mentor-login-form');
            if (mentorLoginForm) {
                const mentorEmailInput = mentorLoginForm.querySelector('input[type="email"]');
                if (mentorEmailInput) {
                    mentorEmailInput.value = lastMentorEmail;
                }
            }
        }
    }, 100);
}

function showLandingPage() {
    showPage('landing-page');
    // Reset animations
    resetLandingAnimations();
}

function resetLandingAnimations() {
    const newtonLogo = document.getElementById('newton-logo');
    const nstAskText = document.getElementById('nst-ask-text');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroFeatures = document.getElementById('hero-features');
    const getStartedBtn = document.getElementById('get-started-btn');
    
    // Reset all elements to initial state
    if (newtonLogo) {
        newtonLogo.style.opacity = '0';
        newtonLogo.style.animation = 'none';
        newtonLogo.offsetHeight; // Trigger reflow
        newtonLogo.style.animation = 'newtonLogoFadeIn 1s ease-out 0.2s forwards';
    }
    
    if (nstAskText) {
        nstAskText.style.opacity = '0';
        nstAskText.style.animation = 'none';
        nstAskText.offsetHeight; // Trigger reflow
        nstAskText.style.animation = 'nstAskJump 1.5s ease-out 0.5s forwards';
    }
    
    if (heroSubtitle) {
        heroSubtitle.style.opacity = '0';
        heroSubtitle.style.animation = 'none';
        heroSubtitle.offsetHeight;
        heroSubtitle.style.animation = 'fadeInUp 1s ease-out 2s forwards';
    }
    
    if (heroFeatures) {
        heroFeatures.style.opacity = '0';
        heroFeatures.style.animation = 'none';
        heroFeatures.offsetHeight;
        heroFeatures.style.animation = 'fadeInUp 1s ease-out 2.5s forwards';
    }
    
    if (getStartedBtn) {
        getStartedBtn.style.opacity = '0';
        getStartedBtn.style.animation = 'none';
        getStartedBtn.offsetHeight;
        getStartedBtn.style.animation = 'fadeInUp 1s ease-out 3s forwards';
    }
}

function startTransitionToSignup() {
    const newtonLogo = document.getElementById('newton-logo');
    const nstAskText = document.getElementById('nst-ask-text');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroFeatures = document.getElementById('hero-features');
    const getStartedBtn = document.getElementById('get-started-btn');
    
    // Hide all elements with fade out (except Newton logo which stays)
    if (nstAskText) nstAskText.style.opacity = '0';
    if (heroSubtitle) heroSubtitle.style.opacity = '0';
    if (heroFeatures) heroFeatures.style.opacity = '0';
    if (getStartedBtn) getStartedBtn.style.opacity = '0';
    
    // Transition to signup page after a short delay
    setTimeout(() => {
        showLoginPage();
    }, 500);
}

function showLoginPage() {
    showPage('login-page');
    // Add smooth transition class
    const loginPage = document.getElementById('login-page');
    if (loginPage) {
        loginPage.classList.add('page-transition');
    }
}

// Show dashboard page
function showDashboardPage() {
    showPage('dashboard-page');
    // Load the default section (dashboard-home)
    showDashboardSection('dashboard-home');
}

function addContinueSessionButton(session) {
    // Add continue session and logout buttons to the login page
    const loginPage = document.getElementById('login-page');
    if (loginPage) {
        // Check if buttons already exist
        let sessionContainer = document.getElementById('session-buttons-container');
        if (!sessionContainer) {
            sessionContainer = document.createElement('div');
            sessionContainer.id = 'session-buttons-container';
            sessionContainer.className = 'session-buttons-container';
            
            const continueBtn = document.createElement('button');
            continueBtn.id = 'continue-session-btn';
            continueBtn.className = 'continue-session-btn';
            continueBtn.innerHTML = `
                <i class="fas fa-play"></i>
                Continue Session
            `;
            continueBtn.onclick = () => continueExistingSession(session);
            
            sessionContainer.appendChild(continueBtn);
            
            // Insert at the top of the login page content
            const loginContent = loginPage.querySelector('.mx-auto');
            if (loginContent) {
                loginContent.insertBefore(sessionContainer, loginContent.firstChild);
            }
        }
    }
}

function continueExistingSession(session) {
    if (session.isMentor) {
        const storedMentorData = localStorage.getItem('mentorData');
        if (storedMentorData) {
            currentMentor = JSON.parse(storedMentorData);
            currentUser.isMentor = true;
            currentUser.xp = currentMentor.xp || 0;
            currentUser.doubtsAsked = currentMentor.doubtsAsked || 0;
            currentUser.answersGiven = currentMentor.answersGiven || 0;
            currentUser.helpfulAnswers = currentMentor.helpfulAnswers || 0;
            
            showMentorDashboard();
            return;
        }
    } else {
        const storedStudentData = localStorage.getItem('studentData');
        if (storedStudentData) {
            studentData = JSON.parse(storedStudentData);
            currentUser.isMentor = false;
            currentUser.xp = studentData.xp || 0;
            currentUser.doubtsAsked = studentData.doubtsAsked || 0;
            currentUser.answersGiven = studentData.answersGiven || 0;
            currentUser.helpfulAnswers = studentData.helpfulAnswers || 0;
            
            showDashboard();
            return;
        }
    }
    
    showNotification('Session data not found. Please login again.', 'error');
}

function logout() {
    // Clear all session data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('studentData');
    localStorage.removeItem('mentorData');
    localStorage.removeItem('lastRegisteredEmail');
    localStorage.removeItem('lastRegisteredMentorEmail');
    
    // Reset current user
    currentUser = {
        isMentor: false,
        xp: 0,
        doubtsAsked: 0,
        answersGiven: 0,
        helpfulAnswers: 0
    };
    
    // Remove session buttons container if it exists
    const sessionContainer = document.getElementById('session-buttons-container');
    if (sessionContainer) {
        sessionContainer.remove();
    }
    
    // Show login page
    showLoginPage();
    showNotification('Logged out successfully!', 'success');
}

function showSignupPage() {
    showPage('signup-page');
}

function showSuccessPage() {
    showPage('success-page');
}

// Login page functions
function showStudentLogin() {
    const studentForm = document.getElementById('student-login-form');
    const mentorForm = document.getElementById('mentor-login-form');
    
    // Show student form, hide mentor form
    if (studentForm) studentForm.classList.remove('hidden');
    if (mentorForm) mentorForm.classList.add('hidden');
    
    // Update button states
    const studentBtn = document.querySelector('button[onclick="showStudentLogin()"]');
    const mentorBtn = document.querySelector('button[onclick="showMentorLogin()"]');
    
    if (studentBtn) {
        studentBtn.className = 'flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-all duration-300';
    }
    if (mentorBtn) {
        mentorBtn.className = 'flex-1 py-2 px-4 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-300 hover:bg-secondary/80';
    }
}

function showMentorLogin() {
    const loginForm = document.getElementById('student-login-form');
    
    // Create mentor login form if it doesn't exist
    let mentorLoginForm = document.getElementById('mentor-login-form');
    
    if (!mentorLoginForm) {
        const loginContainer = document.querySelector('.login-container');
        
        mentorLoginForm = document.createElement('div');
        mentorLoginForm.className = 'login-form';
        mentorLoginForm.id = 'mentor-login-form';
        mentorLoginForm.innerHTML = `
            <h3>Mentor Login</h3>
            <p style="text-align: center; color: #666; margin-bottom: 1.5rem;">Access your mentor dashboard to help students</p>
            <form onsubmit="handleMentorLogin(event)">
                <div class="input-group">
                    <i class="fas fa-envelope"></i>
                    <input type="email" placeholder="NST Email" required>
                </div>
                <div class="input-group">
                    <i class="fas fa-lock"></i>
                    <input type="password" placeholder="Password" required>
                </div>
                <button type="submit" class="login-btn">Login as Mentor</button>
            </form>
            <div style="text-align: center; margin-top: 1.5rem;">
                <p style="color: #666; margin-bottom: 1rem;">Don't have a mentor account?</p>
                <button class="mentor-apply-btn" onclick="showMentorSignup()" style="width: 100%;">Become a Mentor</button>
            </div>
        `;
        
        loginContainer.appendChild(mentorLoginForm);
    }
    
    // Show mentor form, hide student form
    if (loginForm) loginForm.classList.add('hidden');
    if (mentorLoginForm) mentorLoginForm.classList.remove('hidden');
    
    // Update button states
    const studentBtn = document.querySelector('button[onclick="showStudentLogin()"]');
    const mentorBtn = document.querySelector('button[onclick="showMentorLogin()"]');
    
    if (studentBtn) {
        studentBtn.className = 'flex-1 py-2 px-4 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-300 hover:bg-secondary/80';
    }
    if (mentorBtn) {
        mentorBtn.className = 'flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-all duration-300';
    }
    
    // Refresh mentors list when switching to mentor login
    loadLoginMentors();
}

function showMentorSignup() {
    showPage('mentor-signup-page');
}

function goBackToMentorLogin() {
    showMentorLogin();
    // Refresh mentors list when returning to login
    loadLoginMentors();
}

function showSignup() {
    showSignupPage();
}

function goBackToLogin() {
    showLoginPage();
}

function goToLogin() {
    showLoginPage();
}

// Form handling functions
function handleStudentLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = event.target.querySelector('input[type="email"]').value;
    const password = event.target.querySelector('input[type="password"]').value;
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check if email is valid NST email
    if (!email.includes('@adypu.edu.in')) {
        showNotification('Please use a valid NST email address', 'error');
        return;
    }
    
    // Simulate login process
    showNotification('Login successful! Redirecting...', 'success');
    
    // In a real application, you would handle authentication here
    setTimeout(() => {
        // Redirect to main application
        console.log('Student logged in:', { email, password });
    }, 1500);
}

async function handleSignup(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = document.getElementById('name').value;
    const urn = document.getElementById('urn').value;
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;
    const password = document.getElementById('password').value;
    
    // Validate email domain
    if (!validateNSTEmail(email)) {
        showEmailError('Please use a valid NST email (@adypu.edu.in)');
        return;
    }
    
    // Clear any previous errors
    clearEmailError();
    
    // Validate all fields
    if (!name || !urn || !email || !mobile || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check for profanity and spam in name field
    if (containsProfanity(name)) {
        showNotification('Your name contains inappropriate language or spam. Please use a respectful name.', 'error');
        return;
    }
    
    // Validate mobile number
    if (!validateMobileNumber(mobile)) {
        showNotification('Please enter a valid mobile number', 'error');
        return;
    }
    
    // Store student data
    studentData = {
        name,
        urn,
        email,
        mobile,
        password,
        createdAt: new Date().toISOString()
    };
    
    // Save student data to cloud and localStorage
    await saveStudentToCloud(studentData);
    
    // Store email for pre-filling login form
    localStorage.setItem('lastRegisteredEmail', email);
    
    // Simulate account creation
    showNotification('Account created successfully! Redirecting to login...', 'success');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
        showLoginPage();
        // Pre-fill the email field and show student login form
        setTimeout(() => {
            showStudentLogin();
            const emailInput = document.querySelector('#student-login-form input[type="email"]');
            if (emailInput) {
                emailInput.value = email;
            }
        }, 100);
    }, 1500);
}

async function handleMentorSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('mentor-name').value;
    const email = document.getElementById('mentor-email').value;
    const expertise = document.getElementById('mentor-expertise').value;
    const experience = document.getElementById('mentor-experience').value;
    const password = document.getElementById('mentor-password').value;
    
    // Validate email domain
    if (!validateNSTEmail(email)) {
        showMentorEmailError('Please use a valid NST email (@adypu.edu.in)');
        return;
    }
    
    // Clear any previous errors
    clearMentorEmailError();
    
    // Validate all fields
    if (!name || !email || !expertise || !experience || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check for profanity and spam in name and expertise fields
    if (containsProfanity(name) || containsProfanity(expertise)) {
        showNotification('Your profile contains inappropriate language or spam. Please use respectful language.', 'error');
        return;
    }
    
    // Validate experience
    if (parseInt(experience) < 1) {
        showNotification('Please enter a valid experience (minimum 1 year)', 'error');
        return;
    }
    
    // Create mentor object
    const newMentor = {
        id: Date.now().toString(),
        name,
        email,
        expertise,
        experience: parseInt(experience),
        password,
        rating: 'New',
        studentsHelped: 0,
        createdAt: new Date().toISOString()
    };
    
    // Store mentor data locally
    mentorData = newMentor;
    
    // Add to registered mentors array
    registeredMentors.push(newMentor);
    
    // Save mentor data to cloud and localStorage
    await saveMentorToCloud(newMentor);
    
    // Save mentors list to localStorage
    localStorage.setItem('registeredMentors', JSON.stringify(registeredMentors));
    
    // Update login page mentors list if currently visible
    if (currentPage === 'login-page') {
        loadLoginMentors();
        showNotification(`New mentor ${name} has been added to the mentors list!`, 'info');
    }
    
    // Store email for pre-filling login form
    localStorage.setItem('lastRegisteredMentorEmail', email);
    
    // Automatically log in the mentor
    currentMentor = newMentor;
    currentUser.isMentor = true;
    currentUser.xp = 0;
    currentUser.doubtsAsked = 0;
    currentUser.answersGiven = 0;
    currentUser.helpfulAnswers = 0;
    
    // Save login session
    localStorage.setItem('currentUser', JSON.stringify({
        isLoggedIn: true,
        isMentor: true,
        email: email,
        loginTime: new Date().toISOString()
    }));
    
    // Simulate account creation
    showNotification(`Mentor ${name} registered successfully! You are now logged in with Mentor privileges. Redirecting to dashboard...`, 'success');
    
    // Redirect to mentor dashboard after a short delay
    setTimeout(() => {
        showMentorDashboard();
    }, 1500);
}

// Validation functions
function validateNSTEmail(email) {
    const nstEmailRegex = /^[a-zA-Z0-9._%+-]+@adypu\.edu\.in$/;
    return nstEmailRegex.test(email);
}

function validateMobileNumber(mobile) {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
}

function showEmailError(message) {
    const errorElement = document.getElementById('email-error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
    
    // Add error styling to input
    const emailInput = document.getElementById('email');
    emailInput.style.borderColor = '#e74c3c';
}

function clearEmailError() {
    const errorElement = document.getElementById('email-error');
    errorElement.classList.remove('show');
    
    // Remove error styling from input
    const emailInput = document.getElementById('email');
    emailInput.style.borderColor = '#e1e5e9';
}

function showMentorEmailError(message) {
    const errorElement = document.getElementById('mentor-email-error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
    
    // Add error styling to input
    const emailInput = document.getElementById('mentor-email');
    emailInput.style.borderColor = '#e74c3c';
}

function clearMentorEmailError() {
    const errorElement = document.getElementById('mentor-email-error');
    errorElement.classList.remove('show');
    
    // Remove error styling from input
    const emailInput = document.getElementById('mentor-email');
    emailInput.style.borderColor = '#e1e5e9';
}

// Real-time email validation
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const email = this.value;
            if (email && !validateNSTEmail(email)) {
                showEmailError('Please use a valid NST email (@adypu.edu.in)');
            } else {
                clearEmailError();
            }
        });
    }
});

// Mentor application function
function showMentorApplication() {
    showMentorLogin();
    showNotification('Please login with your NST email to become a mentor', 'info');
}


// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add special styling for different warning types
    if (message.includes('inappropriate language') || message.includes('XP has been reset')) {
        notification.classList.add('profanity-warning');
        if (message.includes('XP has been reset')) {
            notification.classList.add('xp-reset-notification');
        }
    } else if (message.includes('spam')) {
        notification.classList.add('spam-warning');
    } else if (message.includes('advanced moderation system')) {
        notification.classList.add('backend-moderation-warning');
    } else if (message.includes('close to being removed') || message.includes('Warning:')) {
        notification.classList.add('doubt-removal-warning');
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after different timeouts based on warning type
    let timeout = 3000; // Default 3 seconds
    if (message.includes('inappropriate language') || message.includes('XP has been reset')) {
        timeout = 8000; // 8 seconds for profanity warnings
    } else if (message.includes('spam')) {
        timeout = 6000; // 6 seconds for spam warnings
    } else if (message.includes('advanced moderation system')) {
        timeout = 7000; // 7 seconds for backend moderation warnings
    } else if (message.includes('close to being removed') || message.includes('Warning:')) {
        timeout = 5000; // 5 seconds for doubt removal warnings
    }
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, timeout);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
        case 'error': return 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
        case 'warning': return 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
        case 'info': return 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
        default: return 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
    }
}

// Add notification animations to CSS
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Smooth scrolling for better UX
document.documentElement.style.scrollBehavior = 'smooth';

// Add loading states for buttons
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text') || 'Submit';
    }
}

// Enhanced form validation with visual feedback
function addFormValidation() {
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldId = field.id;
    
    // Remove previous error styling
    field.classList.remove('error');
    
    // Validate based on field type
    let isValid = true;
    let errorMessage = '';
    
    if (!value) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (fieldType === 'email' && fieldId === 'email') {
        if (!validateNSTEmail(value)) {
            isValid = false;
            errorMessage = 'Please use a valid NST email (@adypu.edu.in)';
        }
    } else if (fieldType === 'tel' && fieldId === 'mobile') {
        if (!validateMobileNumber(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid 10-digit mobile number';
        }
    } else if (fieldType === 'password' && fieldId === 'password') {
        if (value.length < 6) {
            isValid = false;
            errorMessage = 'Password must be at least 6 characters long';
        }
    }
    
    if (!isValid) {
        field.classList.add('error');
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #e74c3c;
        font-size: 0.9rem;
        margin-top: 0.5rem;
        animation: fadeInUp 0.3s ease-out;
    `;
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Initialize form validation when signup page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add error styling for invalid fields
    const errorStyles = `
        .input-group input.error {
            border-color: #e74c3c !important;
            box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
        }
    `;
    
    const errorStyleSheet = document.createElement('style');
    errorStyleSheet.textContent = errorStyles;
    document.head.appendChild(errorStyleSheet);
});

// Add keyboard navigation support
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Close any open modals or go back
        if (currentPage === 'signup-page') {
            goBackToLogin();
        }
    }
});

// Add accessibility improvements
function addAccessibilityFeatures() {
    // Add ARIA labels
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
            button.setAttribute('aria-label', 'Button');
        }
    });
    
    // Add focus management
    const focusableElements = document.querySelectorAll('button, input, a');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #667eea';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', addAccessibilityFeatures);

// Dashboard functionality
let currentSection = 'feed';
let currentMentorSection = 'pending';
let doubtsData = [];
let userDoubts = [];
let userAnswers = [];
let mentorAnswers = [];
let leaderboardData = [];
let currentMentor = {
    xp: 0,
    solutionsGiven: 0,
    studentsHelped: 0,
    helpfulSolutions: 0
};
let selectedDoubtForAnswer = null;
let uploadedMedia = [];
let doubtUploadedMedia = [];

// Dashboard navigation
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to nav item
    const targetNavItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (targetNavItem) {
        targetNavItem.classList.add('active');
    }
    
    currentSection = sectionName;
    
    // Load section-specific data
    loadSectionData(sectionName);
}

function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'feed':
            loadDoubtsFeed();
            break;
        case 'my-doubts':
            loadMyDoubts();
            break;
        case 'my-answers':
            loadMyAnswers();
            break;
        case 'profile':
            loadProfileData();
            break;
        case 'leaderboard':
            loadLeaderboard();
            break;
    }
}

// Load doubts feed
function loadDoubtsFeed() {
    const feedContainer = document.getElementById('doubts-feed');
    
    // Sample doubts data
    const sampleDoubts = [
        {
            id: 1,
            title: "How to implement binary search in Python?",
            description: "I'm learning algorithms and need help understanding how to implement binary search efficiently in Python. Can someone explain the logic and provide a working example?",
            category: "programming",
            author: "Anonymous",
            authorIsMentor: false,
            timestamp: "2 hours ago",
            answers: 3,
            likes: 5,
            media: []
        },
        {
            id: 2,
            title: "What is the difference between AC and DC current?",
            description: "I'm studying electrical engineering and confused about the fundamental differences between alternating current and direct current. Need a clear explanation with examples.",
            category: "engineering",
            author: "Dr. Sarah Johnson",
            authorIsMentor: true,
            timestamp: "4 hours ago",
            answers: 2,
            likes: 8,
            media: []
        },
        {
            id: 3,
            title: "How to solve quadratic equations using the quadratic formula?",
            description: "I'm struggling with quadratic equations in my math class. Can someone walk me through the quadratic formula step by step with examples?",
            category: "mathematics",
            author: "Anonymous",
            authorIsMentor: false,
            timestamp: "6 hours ago",
            answers: 4,
            likes: 12,
            media: []
        },
        {
            id: 4,
            title: "Best practices for database normalization",
            description: "I'm designing a database for my project and want to understand normalization rules. What are the key principles and when should I apply them?",
            category: "programming",
            author: "Prof. Michael Chen",
            authorIsMentor: true,
            timestamp: "8 hours ago",
            answers: 1,
            likes: 6,
            media: []
        }
    ];
    
    doubtsData = sampleDoubts;
    
    // Add some sample answers
    const sampleAnswers = [
        {
            id: 1,
            doubtId: 1,
            doubtTitle: "How to implement binary search in Python?",
            content: "Here's a simple implementation of binary search in Python:\n\n```pythonndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    \n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    \n    return -1\n```\n\nThe time complexity is O(log n) which is much better than linear search.",
            authorId: 'student123',
            authorName: 'Alex Chen',
            isMentorAnswer: false,
            timestamp: '1 hour ago',
            likes: 3,
            evaluated: false,
            xpAwarded: 0,
            media: []
        },
        {
            id: 2,
            doubtId: 1,
            doubtTitle: "How to implement binary search in Python?",
            content: "Great question! Binary search is a fundamental algorithm. Here's a more detailed explanation with edge cases handled:\n\n```python\ndef binary_search(arr, target):\n    if not arr:\n        return -1\n    \n    left, right = 0, len(arr) - 1\n    \n    while left <= right:\n        mid = left + (right - left) // 2  # Prevents overflow\n        \n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    \n    return -1\n```\n\nKey points:\n- Array must be sorted\n- Time complexity: O(log n)\n- Space complexity: O(1)",
            authorId: 'mentor123',
            authorName: 'Dr. Sarah Johnson',
            isMentorAnswer: true,
            timestamp: '2 hours ago',
            likes: 8,
            evaluated: false,
            xpAwarded: 0,
            media: []
        },
        {
            id: 3,
            doubtId: 2,
            doubtTitle: "What is the difference between AC and DC current?",
            content: "AC (Alternating Current) and DC (Direct Current) are two different types of electrical current:\n\n**AC (Alternating Current):**\n- Current changes direction periodically\n- Voltage varies sinusoidally\n- Used in power transmission\n- Examples: Household electricity, power grids\n\n**DC (Direct Current):**\n- Current flows in one direction only\n- Voltage remains constant\n- Used in batteries and electronic devices\n- Examples: Car batteries, phone chargers\n\nThe main difference is the direction of current flow and voltage characteristics.",
            authorId: 'mentor123',
            authorName: 'Prof. Michael Chen',
            isMentorAnswer: true,
            timestamp: '3 hours ago',
            likes: 5,
            evaluated: false,
            xpAwarded: 0,
            media: []
        }
    ];
    
    // Add sample answers to the arrays
    userAnswers.push(sampleAnswers[0]);
    mentorAnswers.push(sampleAnswers[1], sampleAnswers[2]);
    
    // Update doubt answer counts
    doubtsData[0].answers = 2; // Binary search question
    doubtsData[1].answers = 1; // AC/DC question
    
    renderDoubtsFeed(sampleDoubts);
}

function renderDoubtsFeed(doubts) {
    const feedContainer = document.getElementById('doubts-feed');
    
    if (doubts.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <h3>No doubts found</h3>
                <p>Be the first to ask a question!</p>
            </div>
        `;
        return;
    }
    
    feedContainer.innerHTML = doubts.map(doubt => `
        <div class="doubt-card" data-id="${doubt.id}">
            <div class="doubt-header">
                <div>
                    <h3 class="doubt-title">${doubt.title}</h3>
                    <div class="doubt-meta">
                        <span class="doubt-category">${doubt.category}</span>
                        <span><i class="fas fa-user"></i> ${doubt.author}</span>
                        ${doubt.authorIsMentor ? '<span class="mentor-tag"><i class="fas fa-chalkboard-teacher"></i> Mentor</span>' : ''}
                        <span><i class="fas fa-clock"></i> ${doubt.timestamp}</span>
                    </div>
                </div>
            </div>
            <div class="doubt-description">${doubt.description}</div>
            ${doubt.media && doubt.media.length > 0 ? `
                <div class="doubt-media">
                    ${doubt.media.map(media => `
                        <div class="media-item-display">
                            ${media.type.startsWith('image/') 
                                ? `<img src="${media.data}" alt="${media.name}" onclick="openMediaModal('${media.data}', '${media.type}')">`
                                : `<video controls><source src="${media.data}" type="${media.type}"></video>`
                            }
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="doubt-actions">
                <button class="action-btn" onclick="viewDoubt(${doubt.id})">
                    <i class="fas fa-eye"></i>
                    <span>View</span>
                </button>
                <button class="action-btn" onclick="answerDoubt(${doubt.id})">
                    <i class="fas fa-reply"></i>
                    <span>Answer</span>
                </button>
                <button class="action-btn" onclick="likeDoubt(${doubt.id})">
                    <i class="fas fa-thumbs-up"></i>
                    <span>${doubt.likes}</span>
                </button>
                <button class="action-btn dislike-btn" onclick="dislikeDoubt(${doubt.id})">
                    <i class="fas fa-thumbs-down"></i>
                    <span>${doubt.dislikes || 0}</span>
                </button>
                <span class="answers-count" onclick="viewAllAnswers(${doubt.id})" style="cursor: pointer;">
                    <i class="fas fa-comments"></i>
                    ${doubt.answers} answers
                </span>
                ${currentUser.isMentor ? `<button class="action-btn mentor-eval-btn" onclick="evaluateAnswers(${doubt.id})">
                    <i class="fas fa-star"></i>
                    <span>Evaluate</span>
                </button>` : ''}
            </div>
        </div>
    `).join('');
}

// Submit doubt function
async function submitDoubt(event) {
    event.preventDefault();
    
    const title = document.getElementById('doubt-title').value;
    const category = document.getElementById('doubt-category').value;
    const description = document.getElementById('doubt-description').value;
    const isAnonymous = document.getElementById('anonymous-post').checked;
    
    if (!title || !category || !description) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Enhanced content moderation check
    const fullContent = `${title} ${description}`;
    
    // Local moderation check
    if (containsProfanity(fullContent)) {
        showNotification('Your doubt contains inappropriate language or spam. Please use respectful language.', 'error');
        
        // Reset user XP to zero as penalty
        resetUserXP();
        
        showNotification('Your XP has been reset to zero due to inappropriate content.', 'error');
        return;
    }
    
    // Optional: Backend moderation check (if Supabase is configured)
    try {
        const backendResult = await moderateWithBackend(fullContent);
        if (backendResult.status === 'blocked') {
            showNotification('Your doubt was blocked by our advanced moderation system.', 'error');
            
            // Reset user XP to zero as penalty
            resetUserXP();
            
            showNotification('Your XP has been reset to zero due to inappropriate content.', 'error');
            return;
        }
    } catch (error) {
        console.log('Backend moderation check failed, proceeding with local moderation only');
    }
    
    // Convert uploaded media to base64 for storage
    const mediaData = [];
    for (let i = 0; i < doubtUploadedMedia.length; i++) {
        const file = doubtUploadedMedia[i];
        const reader = new FileReader();
        await new Promise((resolve) => {
            reader.onload = function(e) {
                mediaData.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result
                });
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }
    
    const newDoubt = {
        id: Date.now(),
        title: title,
        description: description,
        category: category,
        author: isAnonymous ? 'Anonymous' : (currentUser.isMentor ? `${currentMentor.name} (Mentor)` : studentData.name),
        authorId: currentUser.isMentor ? 'mentor123' : (studentData.urn || 'student123'),
        authorIsMentor: currentUser.isMentor,
        timestamp: 'Just now',
        answers: 0,
        likes: 0,
        isAnonymous: !isAnonymous, // Store actual author for tracking
        needsAnswer: true,
        media: mediaData
    };
    
    // Add to doubts data
    doubtsData.unshift(newDoubt);
    userDoubts.unshift(newDoubt);
    
    // Award XP for asking a doubt (10 XP)
    await awardStudentXP(10, 'doubt');
    
    // Update UI
    renderDoubtsFeed(doubtsData);
    clearDoubtForm();
    
    // Update profile and leaderboard
    loadProfileData();
    loadLeaderboard();
    
    // Update current section if it's profile
    if (currentSection === 'profile') {
        loadProfileData();
    }
    
    showNotification('Doubt posted successfully! +10 XP earned!', 'success');
    
    // Switch to feed section to show the new doubt
    showSection('feed');
}

function clearDoubtForm() {
    document.getElementById('doubt-title').value = '';
    document.getElementById('doubt-category').value = '';
    document.getElementById('doubt-description').value = '';
    document.getElementById('anonymous-post').checked = false;
    document.getElementById('doubt-media').value = '';
    doubtUploadedMedia = [];
    document.getElementById('doubt-media-preview').innerHTML = '';
}

// Doubt actions
function viewDoubt(doubtId) {
    const doubt = doubtsData.find(d => d.id === doubtId);
    if (doubt) {
        showNotification(`Viewing doubt: ${doubt.title}`, 'info');
        // In a real app, this would open a detailed view
        console.log('Viewing doubt:', doubt);
    }
}

function answerDoubt(doubtId) {
    const doubt = doubtsData.find(d => d.id === doubtId);
    if (doubt) {
        openAnswerModal(doubtId);
    }
}

function likeDoubt(doubtId) {
    const doubt = doubtsData.find(d => d.id === doubtId);
    if (doubt) {
        doubt.likes++;
        renderDoubtsFeed(doubtsData);
        showNotification('Doubt liked!', 'success');
    }
}

function dislikeDoubt(doubtId) {
    const doubt = doubtsData.find(d => d.id === doubtId);
    if (doubt) {
        doubt.dislikes = (doubt.dislikes || 0) + 1;
        
        // Check if doubt should be removed (15+ dislikes)
        if (doubt.dislikes >= 15) {
            removeDoubt(doubtId);
            showNotification('Doubt has been removed due to excessive dislikes (15+).', 'error');
            return;
        }
        
        // Warning when close to removal (10+ dislikes)
        if (doubt.dislikes === 10) {
            showNotification('Warning: This doubt is close to being removed (10 dislikes).', 'warning');
        }
        
        renderDoubtsFeed(doubtsData);
        showNotification('Doubt disliked!', 'info');
    }
}

function removeDoubt(doubtId) {
    // Remove doubt from main doubts array
    const doubtIndex = doubtsData.findIndex(d => d.id === doubtId);
    if (doubtIndex !== -1) {
        doubtsData.splice(doubtIndex, 1);
        renderDoubtsFeed(doubtsData);
        loadMyDoubts(); // Refresh my doubts section
        showNotification('Doubt removed from platform.', 'info');
    }
}

// Load my doubts
function loadMyDoubts() {
    const container = document.getElementById('my-doubts-list');
    
    if (userDoubts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-question"></i>
                <h3>No doubts asked yet</h3>
                <p>Start asking questions to get help from the community!</p>
                <button class="btn-primary" onclick="showSection('ask')">Ask Your First Doubt</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userDoubts.map(doubt => `
        <div class="doubt-card">
            <div class="doubt-header">
                <h3 class="doubt-title">${doubt.title}</h3>
                <span class="doubt-category">${doubt.category}</span>
            </div>
            <div class="doubt-description">${doubt.description}</div>
            ${doubt.media && doubt.media.length > 0 ? `
                <div class="doubt-media">
                    ${doubt.media.map(media => `
                        <div class="media-item-display">
                            ${media.type.startsWith('image/') 
                                ? `<img src="${media.data}" alt="${media.name}" onclick="openMediaModal('${media.data}', '${media.type}')">`
                                : `<video controls><source src="${media.data}" type="${media.type}"></video>`
                            }
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="doubt-meta">
                <span><i class="fas fa-clock"></i> ${doubt.timestamp}</span>
                <span><i class="fas fa-comments"></i> ${doubt.answers} answers</span>
                <span><i class="fas fa-thumbs-up"></i> ${doubt.likes} likes</span>
                <span><i class="fas fa-thumbs-down"></i> ${doubt.dislikes || 0} dislikes</span>
            </div>
        </div>
    `).join('');
}

// Load my answers
function loadMyAnswers() {
    const container = document.getElementById('my-answers-list');
    
    if (userAnswers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>No answers given yet</h3>
                <p>Help others by answering their questions!</p>
                <button class="btn-primary" onclick="showSection('feed')">Browse Doubts</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userAnswers.map(answer => `
        <div class="answer-card">
            <div class="answer-header">
                <h4>Answer to: ${answer.doubtTitle}</h4>
                <div class="answer-meta">
                    <span class="answer-author">Solver</span>
                    <span class="answer-timestamp">${answer.timestamp}</span>
                </div>
            </div>
            <div class="answer-content">${answer.content}</div>
            ${answer.media && answer.media.length > 0 ? `
                <div class="answer-media">
                    ${answer.media.map(media => `
                        <div class="media-item-display">
                            ${media.type.startsWith('image/') 
                                ? `<img src="${media.data}" alt="${media.name}" onclick="openMediaModal('${media.data}', '${media.type}')">`
                                : `<video controls><source src="${media.data}" type="${media.type}"></video>`
                            }
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="answer-stats">
                <span><i class="fas fa-thumbs-up"></i> ${answer.likes} helpful</span>
                ${answer.evaluated ? `<span class="evaluated-badge"><i class="fas fa-check"></i> Evaluated (+${answer.xpAwarded} XP)</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Global mentors array to store registered mentors
let registeredMentors = [];

// Load mentors for login page
async function loadLoginMentors() {
    const container = document.getElementById('login-mentors-list');
    if (!container) return;
    
    // Load mentors from cloud or localStorage
    await loadMentorsFromCloud();
    
    if (registeredMentors.length === 0) {
        container.innerHTML = `
            <div class="empty-mentors">
                <i class="fas fa-chalkboard-teacher"></i>
                <p>No mentors available yet. <a href="#" onclick="showMentorSignup()">Become the first mentor!</a></p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = registeredMentors.map(mentor => `
        <div class="login-mentor-item">
            <div class="mentor-avatar-small">
                <i class="fas fa-user-tie"></i>
            </div>
            <div class="mentor-details">
                <span class="mentor-name">${mentor.name} <span class="mentor-tag-small">Mentor</span></span>
                <span class="mentor-expertise">${mentor.expertise}</span>
            </div>
        </div>
    `).join('');
}

// Load mentors from storage (for dashboard - now removed)
async function loadMentors() {
    // This function is kept for compatibility but mentors section is removed from dashboard
    return;
}

function connectMentor(mentorId) {
    const mentor = registeredMentors.find(m => m.id === mentorId);
    if (mentor) {
        showNotification(`Connecting to ${mentor.name}... Feature coming soon!`, 'info');
    } else {
    showNotification('Mentor connection feature coming soon!', 'info');
    }
}

// Load profile data
function loadProfileData() {
    if (studentData.name) {
        document.getElementById('profile-name').textContent = studentData.name;
        document.getElementById('profile-email').textContent = studentData.email;
        document.getElementById('profile-urn').textContent = `URN: ${studentData.urn}`;
        document.getElementById('user-name').textContent = studentData.name;
    }
    
    // Update stats with proper counts
    document.getElementById('total-xp').textContent = currentUser.xp || 0;
    document.getElementById('doubts-asked').textContent = userDoubts.length;
    document.getElementById('answers-given').textContent = userAnswers.length;
    document.getElementById('helpful-answers').textContent = userAnswers.filter(a => a.likes > 0).length;
}

// Search and filter functionality
function setupSearchAndFilter() {
    const searchInput = document.getElementById('doubt-search');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterDoubts();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterDoubts();
        });
    }
}

function filterDoubts() {
    const searchTerm = document.getElementById('doubt-search').value.toLowerCase();
    const selectedCategory = document.getElementById('category-filter').value;
    
    let filteredDoubts = doubtsData;
    
    if (searchTerm) {
        filteredDoubts = filteredDoubts.filter(doubt => 
            doubt.title.toLowerCase().includes(searchTerm) ||
            doubt.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (selectedCategory) {
        filteredDoubts = filteredDoubts.filter(doubt => 
            doubt.category === selectedCategory
        );
    }
    
    renderDoubtsFeed(filteredDoubts);
}

// Login function to show dashboard
function showDashboard() {
    showPage('dashboard-page');
    // Add smooth transition class
    const dashboardPage = document.getElementById('dashboard-page');
    if (dashboardPage) {
        dashboardPage.classList.add('page-transition');
    }
    
    // Load the default section (dashboard-home)
    showDashboardSection('dashboard-home');
    
    // Ensure mentors list is refreshed to show mentor tags
    if (typeof loadMentors === 'function') {
        loadMentors();
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            showLoginPage();
            // Clear user data and session
            studentData = {};
            userDoubts = [];
            userAnswers = [];
            localStorage.removeItem('currentUser');
        }, 1000);
    }
}

// Update login function to redirect to dashboard
async function handleStudentLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = event.target.querySelector('input[type="email"]').value;
    const password = event.target.querySelector('input[type="password"]').value;
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check if email is valid NST email
    if (!email.includes('@adypu.edu.in')) {
        showNotification('Please use a valid NST email address', 'error');
        return;
    }
    
    // Check for existing student data (try cloud first, then localStorage)
    const student = await loadStudentFromCloud(email);
    if (student && student.email === email && student.password === password) {
        // Load student data
        studentData = student;
    
    // Set current user as student
    currentUser.isMentor = false;
        currentUser.xp = student.xp || 0;
        currentUser.doubtsAsked = student.doubtsAsked || 0;
        currentUser.answersGiven = student.answersGiven || 0;
        currentUser.helpfulAnswers = student.helpfulAnswers || 0;
        
        // Save login session
        localStorage.setItem('currentUser', JSON.stringify({
            isLoggedIn: true,
            isMentor: false,
            email: email,
            loginTime: new Date().toISOString()
        }));
        
        showNotification(`Welcome back, ${student.name}! Redirecting to dashboard...`, 'success');
        
        // Clear pre-filled email
        localStorage.removeItem('lastRegisteredEmail');
    
    // Redirect to dashboard after successful login
    setTimeout(() => {
        showDashboard();
    }, 1500);
        return;
    }
    
    // If no matching account found
    showNotification('Invalid email or password. Please check your credentials or sign up.', 'error');
}

// Add empty state styles
const emptyStateStyles = `
    .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        color: #666;
    }
    
    .empty-state i {
        font-size: 4rem;
        color: #ccc;
        margin-bottom: 1rem;
    }
    
    .empty-state h3 {
        color: #333;
        margin-bottom: 0.5rem;
    }
    
    .empty-state p {
        margin-bottom: 1.5rem;
    }
    
    .mentor-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        text-align: center;
        transition: all 0.3s ease;
    }
    
    .mentor-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    }
    
    .mentor-avatar {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        margin: 0 auto 1rem;
    }
    
    .mentor-info h3 {
        color: #333;
        margin-bottom: 0.5rem;
    }
    
    .mentor-subject {
        color: #667eea;
        font-weight: 600;
        margin-bottom: 1rem;
    }
    
    .mentor-bio {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        line-height: 1.5;
    }
    
    .mentor-stats {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        color: #666;
    }
    
    .mentor-stats span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .mentor-tag {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-left: 0.5rem;
        display: inline-block;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .mentor-tag-small {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0.1rem 0.3rem;
        border-radius: 8px;
        font-size: 0.65rem;
        font-weight: 600;
        margin-left: 0.3rem;
        display: inline-block;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
    
    .available-mentors-section {
        margin-top: 2rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .available-mentors-section h3 {
        color: white;
        margin-bottom: 0.5rem;
        font-size: 1.2rem;
    }
    
    .available-mentors-section p {
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }
    
    .login-mentor-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        margin-bottom: 0.5rem;
        transition: all 0.3s ease;
    }
    
    .login-mentor-item:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateX(5px);
    }
    
    .mentor-avatar-small {
        width: 35px;
        height: 35px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.9rem;
    }
    
    .mentor-details {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }
    
    .mentor-name {
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
    }
    
    .mentor-expertise {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
    }
    
    .empty-mentors {
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
        padding: 1rem;
    }
    
    .empty-mentors i {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: rgba(255, 255, 255, 0.5);
    }
    
    .empty-mentors a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
    }
    
    .empty-mentors a:hover {
        text-decoration: underline;
    }
    
    .media-upload-container {
        margin-top: 0.5rem;
    }
    
    .media-upload-area {
        border: 2px dashed #667eea;
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(102, 126, 234, 0.05);
    }
    
    .media-upload-area:hover {
        border-color: #5a67d8;
        background: rgba(102, 126, 234, 0.1);
    }
    
    .media-upload-area i {
        font-size: 2rem;
        color: #667eea;
        margin-bottom: 0.5rem;
    }
    
    .media-upload-area p {
        margin: 0.5rem 0;
        color: #4a5568;
        font-weight: 500;
    }
    
    .media-upload-area small {
        color: #718096;
        font-size: 0.8rem;
    }
    
    .media-preview {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .media-item {
        position: relative;
        background: white;
        border-radius: 8px;
        padding: 0.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        max-width: 200px;
    }
    
    .media-content {
        position: relative;
    }
    
    .media-content img,
    .media-content video {
        width: 100%;
        height: auto;
        border-radius: 4px;
        max-height: 150px;
        object-fit: cover;
    }
    
    .remove-media {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #e53e3e;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
    }
    
    .remove-media:hover {
        background: #c53030;
    }
    
    .media-info {
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: #4a5568;
    }
    
    .media-name {
        display: block;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .media-size {
        color: #718096;
    }
    
    .doubt-media {
        margin: 1rem 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .media-item-display {
        max-width: 200px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .media-item-display img,
    .media-item-display video {
        width: 100%;
        height: auto;
        max-height: 200px;
        object-fit: cover;
        cursor: pointer;
        transition: transform 0.3s ease;
    }
    
    .media-item-display img:hover {
        transform: scale(1.05);
    }
    
    .profile-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
    }
    
    .stat-item {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem 1rem;
        border-radius: 12px;
        text-align: center;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .stat-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
    
    .stat-item.xp-highlight {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
        animation: xpPulse 2s infinite;
    }
    
    @keyframes xpPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .stat-icon {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        display: block;
    }
    
    .stat-number {
        font-size: 2rem;
        font-weight: bold;
        display: block;
        margin-bottom: 0.25rem;
    }
    
    .stat-label {
        font-size: 0.85rem;
        opacity: 0.9;
        font-weight: 500;
    }
    
    .section-controls {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .xp-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .xp-label {
        font-size: 1.1rem;
        font-weight: 600;
    }
    
    .xp-value {
        font-size: 1.5rem;
        font-weight: bold;
        background: rgba(255, 255, 255, 0.2);
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
    }
    
    .activity-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .activity-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        background: rgba(255, 255, 255, 0.1);
        padding: 0.5rem 0.75rem;
        border-radius: 20px;
        transition: all 0.3s ease;
    }
    
    .activity-item:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }
    
    .activity-item i {
        font-size: 0.9rem;
    }
    
    .mentors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    
    .answer-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        margin-bottom: 1rem;
    }
    
    .answer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .answer-header h4 {
        color: #333;
        font-size: 1.1rem;
    }
    
    .answer-timestamp {
        color: #666;
        font-size: 0.9rem;
    }
    
    .answer-content {
        color: #555;
        line-height: 1.6;
        margin-bottom: 1rem;
    }
    
    .answer-stats {
        color: #666;
        font-size: 0.9rem;
    }
`;

// Inject empty state styles
const emptyStateStyleSheet = document.createElement('style');
emptyStateStyleSheet.textContent = emptyStateStyles;
document.head.appendChild(emptyStateStyleSheet);

// XP System Functions
async function awardStudentXP(points, reason) {
    currentUser.xp += points;
    
    if (reason === 'doubt') {
        currentUser.doubtsAsked++;
    } else if (reason === 'answer') {
        currentUser.answersGiven++;
    } else if (reason === 'helpful') {
        currentUser.helpfulAnswers++;
    }
    
    // Update student data in cloud and localStorage
    if (studentData && studentData.email) {
        studentData.xp = currentUser.xp;
        studentData.doubtsAsked = currentUser.doubtsAsked;
        studentData.answersGiven = currentUser.answersGiven;
        studentData.helpfulAnswers = currentUser.helpfulAnswers;
        await saveStudentToCloud(studentData);
    }
    
    // Animate XP counter if visible
    const xpElement = document.getElementById('total-xp');
    if (xpElement) {
        xpElement.textContent = currentUser.xp;
        xpElement.classList.add('xp-animate');
        setTimeout(() => xpElement.classList.remove('xp-animate'), 600);
    }
    
    updateLeaderboard();
}

async function awardMentorXP(points, reason) {
    currentMentor.xp += points;
    
    if (reason === 'solution') {
        currentMentor.solutionsGiven++;
    } else if (reason === 'student') {
        currentMentor.studentsHelped++;
    } else if (reason === 'helpful') {
        currentMentor.helpfulSolutions++;
    }
    
    // Update mentor data in cloud and localStorage
    await saveMentorToCloud(currentMentor);
    
    // Update mentors list
    const mentorIndex = registeredMentors.findIndex(m => m.id === currentMentor.id);
    if (mentorIndex !== -1) {
        registeredMentors[mentorIndex] = currentMentor;
        localStorage.setItem('registeredMentors', JSON.stringify(registeredMentors));
    }
    
    // Animate XP counter if visible
    const xpElement = document.getElementById('mentor-xp');
    if (xpElement) {
        xpElement.textContent = currentMentor.xp;
        xpElement.classList.add('xp-animate');
        setTimeout(() => xpElement.classList.remove('xp-animate'), 600);
    }
}

// Leaderboard Functions
function loadLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    
    // Sample leaderboard data
    const sampleLeaderboard = [
        { rank: 1, name: "Alex Chen", xp: 150, doubts: 8, answers: 7, avatar: "A" },
        { rank: 2, name: "Sarah Johnson", xp: 130, doubts: 6, answers: 7, avatar: "S" },
        { rank: 3, name: "Mike Rodriguez", xp: 120, doubts: 5, answers: 7, avatar: "M" },
        { rank: 4, name: "Emily Davis", xp: 90, doubts: 4, answers: 5, avatar: "E" },
        { rank: 5, name: "David Wilson", xp: 80, doubts: 3, answers: 5, avatar: "D" },
        { rank: 6, name: "Student Name", xp: currentUser.xp || 0, doubts: currentUser.doubtsAsked || 0, answers: currentUser.answersGiven || 0, avatar: "S" }
    ];
    
    leaderboardData = sampleLeaderboard;
    renderLeaderboard(leaderboardData);
}

function renderLeaderboard(leaderboard) {
    const container = document.getElementById('leaderboard-list');
    
    container.innerHTML = leaderboard.map(student => {
        let rankClass = '';
        let isTop3 = false;
        
        if (student.rank <= 3) {
            rankClass = 'top-' + student.rank;
            isTop3 = true;
        }
        
        return `
            <div class="leaderboard-entry ${isTop3 ? 'top-' + student.rank : ''}">
                <div class="leaderboard-rank ${rankClass}">#${student.rank}</div>
                <div class="leaderboard-user">
                    <div class="leaderboard-avatar">${student.avatar}</div>
                    <div class="leaderboard-details">
                        <h4>${student.name}</h4>
                        <p><span class="xp-badge">${student.doubts}</span> doubts • <span class="xp-badge">${student.answers}</span> answers</p>
                    </div>
                </div>
                <div class="leaderboard-xp">${student.xp} XP</div>
            </div>
        `;
    }).join('');
}

function filterLeaderboard(period) {
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter logic would go here
    renderLeaderboard(leaderboardData);
}

function updateLeaderboard() {
    // Update leaderboard with current user's data
    const userEntry = leaderboardData.find(entry => entry.name === "Student Name");
    if (userEntry) {
        userEntry.xp = currentUser.xp;
        userEntry.doubts = currentUser.doubtsAsked;
        userEntry.answers = currentUser.answersGiven;
        
        // Re-sort leaderboard
        leaderboardData.sort((a, b) => b.xp - a.xp);
        leaderboardData.forEach((entry, index) => {
            entry.rank = index + 1;
        });
        
        renderLeaderboard(leaderboardData);
    }
}

// Mentor Functions
function showMentorSection(sectionName) {
    // Hide all mentor sections
    const sections = document.querySelectorAll('#mentor-dashboard-page .content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from mentor nav items
    const navItems = document.querySelectorAll('#mentor-dashboard-page .nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to nav item
    const targetNavItem = document.querySelector(`#mentor-dashboard-page [onclick="showMentorSection('${sectionName}')"]`);
    if (targetNavItem) {
        targetNavItem.classList.add('active');
    }
    
    currentMentorSection = sectionName;
    
    // Load section-specific data
    loadMentorSectionData(sectionName);
}

function loadMentorSectionData(sectionName) {
    switch (sectionName) {
        case 'pending':
            loadPendingDoubts();
            break;
        case 'answered':
            loadMentorAnswers();
            break;
        case 'profile':
            loadMentorProfile();
            break;
    }
}

function loadPendingDoubts() {
    const container = document.getElementById('mentor-doubts-list');
    
    // Get doubts that need answers
    const pendingDoubts = doubtsData.filter(doubt => doubt.needsAnswer);
    
    if (pendingDoubts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h3>No pending doubts</h3>
                <p>All doubts have been answered! Great work!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pendingDoubts.map(doubt => `
        <div class="mentor-doubt-card" data-id="${doubt.id}">
            <div class="mentor-doubt-header">
                <div>
                    <h3 class="mentor-doubt-title">${doubt.title}</h3>
                    <div class="mentor-doubt-meta">
                        <span class="doubt-category">${doubt.category}</span>
                        <span><i class="fas fa-user"></i> ${doubt.author}</span>
                        <span><i class="fas fa-clock"></i> ${doubt.timestamp}</span>
                    </div>
                </div>
            </div>
            <div class="mentor-doubt-description">${doubt.description}</div>
            <div class="mentor-doubt-actions">
                <button class="mentor-action-btn" onclick="openAnswerModal(${doubt.id})">
                    <i class="fas fa-reply"></i>
                    Provide Answer
                </button>
            </div>
        </div>
    `).join('');
}

function openAnswerModal(doubtId) {
    const doubt = doubtsData.find(d => d.id === doubtId);
    if (!doubt) return;
    
    selectedDoubtForAnswer = doubt;
    
    // Populate modal
    document.getElementById('modal-doubt-title').textContent = doubt.title;
    document.getElementById('modal-doubt-description').textContent = doubt.description;
    document.getElementById('modal-doubt-category').textContent = doubt.category;
    
    // Show modal
    document.getElementById('answer-modal').classList.add('active');
}

function closeAnswerModal() {
    document.getElementById('answer-modal').classList.remove('active');
    selectedDoubtForAnswer = null;
    document.getElementById('answer-content').value = '';
    document.getElementById('answer-media').value = '';
    uploadedMedia = [];
    document.getElementById('media-preview').innerHTML = '';
}

// Handle media upload for doubts
function handleDoubtMediaUpload(event) {
    const files = Array.from(event.target.files);
    const preview = document.getElementById('doubt-media-preview');
    
    // Clear previous previews
    preview.innerHTML = '';
    doubtUploadedMedia = [];
    
    files.forEach((file, index) => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.innerHTML = `
                    <div class="media-content">
                        ${file.type.startsWith('image/') 
                            ? `<img src="${e.target.result}" alt="Uploaded image">`
                            : `<video controls><source src="${e.target.result}" type="${file.type}"></video>`
                        }
                        <button type="button" class="remove-media" onclick="removeDoubtMedia(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="media-info">
                        <span class="media-name">${file.name}</span>
                        <span class="media-size">${formatFileSize(file.size)}</span>
                    </div>
                `;
                preview.appendChild(mediaItem);
            };
            reader.readAsDataURL(file);
            doubtUploadedMedia.push(file);
        } else {
            showNotification('Please select only image or video files', 'error');
        }
    });
}

function removeDoubtMedia(index) {
    doubtUploadedMedia.splice(index, 1);
    const preview = document.getElementById('doubt-media-preview');
    preview.innerHTML = '';
    
    // Re-render remaining media
    doubtUploadedMedia.forEach((file, newIndex) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.innerHTML = `
                <div class="media-content">
                    ${file.type.startsWith('image/') 
                        ? `<img src="${e.target.result}" alt="Uploaded image">`
                        : `<video controls><source src="${e.target.result}" type="${file.type}"></video>`
                    }
                    <button type="button" class="remove-media" onclick="removeDoubtMedia(${newIndex})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="media-info">
                    <span class="media-name">${file.name}</span>
                    <span class="media-size">${formatFileSize(file.size)}</span>
                </div>
            `;
            preview.appendChild(mediaItem);
        };
        reader.readAsDataURL(file);
    });
}

// Handle media upload
function handleMediaUpload(event) {
    const files = Array.from(event.target.files);
    const preview = document.getElementById('media-preview');
    
    // Clear previous previews
    preview.innerHTML = '';
    uploadedMedia = [];
    
    files.forEach((file, index) => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.innerHTML = `
                    <div class="media-content">
                        ${file.type.startsWith('image/') 
                            ? `<img src="${e.target.result}" alt="Uploaded image">`
                            : `<video controls><source src="${e.target.result}" type="${file.type}"></video>`
                        }
                        <button type="button" class="remove-media" onclick="removeMedia(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="media-info">
                        <span class="media-name">${file.name}</span>
                        <span class="media-size">${formatFileSize(file.size)}</span>
                    </div>
                `;
                preview.appendChild(mediaItem);
            };
            reader.readAsDataURL(file);
            uploadedMedia.push(file);
        } else {
            showNotification('Please select only image or video files', 'error');
        }
    });
}

function removeMedia(index) {
    uploadedMedia.splice(index, 1);
    const preview = document.getElementById('media-preview');
    preview.innerHTML = '';
    
    // Re-render remaining media
    uploadedMedia.forEach((file, newIndex) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.innerHTML = `
                <div class="media-content">
                    ${file.type.startsWith('image/') 
                        ? `<img src="${e.target.result}" alt="Uploaded image">`
                        : `<video controls><source src="${e.target.result}" type="${file.type}"></video>`
                    }
                    <button type="button" class="remove-media" onclick="removeMedia(${newIndex})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="media-info">
                    <span class="media-name">${file.name}</span>
                    <span class="media-size">${formatFileSize(file.size)}</span>
                </div>
            `;
            preview.appendChild(mediaItem);
        };
        reader.readAsDataURL(file);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function submitAnswer(event) {
    event.preventDefault();
    
    const content = document.getElementById('answer-content').value.trim();
    if (!content) {
        showNotification('Please provide a solution', 'error');
        return;
    }
    
    // Enhanced content moderation check
    if (containsProfanity(content)) {
        showNotification('Your answer contains inappropriate language or spam. Please use respectful language.', 'error');
        
        // Reset user XP to zero as penalty
        resetUserXP();
        
        showNotification('Your XP has been reset to zero due to inappropriate content.', 'error');
        return;
    }
    
    // Optional: Backend moderation check (if Supabase is configured)
    try {
        const backendResult = await moderateWithBackend(content);
        if (backendResult.status === 'blocked') {
            showNotification('Your answer was blocked by our advanced moderation system.', 'error');
            
            // Reset user XP to zero as penalty
            resetUserXP();
            
            showNotification('Your XP has been reset to zero due to inappropriate content.', 'error');
            return;
        }
    } catch (error) {
        console.log('Backend moderation check failed, proceeding with local moderation only');
    }
    
    if (!selectedDoubtForAnswer) {
        showNotification('No doubt selected', 'error');
        return;
    }
    
    // Convert uploaded media to base64 for storage
    const mediaData = [];
    uploadedMedia.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            mediaData.push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result
            });
        };
        reader.readAsDataURL(file);
    });

    const answer = {
        id: Date.now(),
        doubtId: selectedDoubtForAnswer.id,
        doubtTitle: selectedDoubtForAnswer.title,
        content: content,
        media: mediaData,
        authorId: currentUser.isMentor ? 'mentor123' : (studentData.urn || 'student123'),
        authorName: currentUser.isMentor ? currentMentor.name : studentData.name,
        isMentorAnswer: currentUser.isMentor,
        timestamp: 'Just now',
        likes: 0,
        evaluated: false,
        xpAwarded: 0
    };
    
    // Add to appropriate answers array
    if (currentUser.isMentor) {
        mentorAnswers.unshift(answer);
        // Award XP to mentor (10 XP)
        await awardMentorXP(10, 'solution');
        
        // Update mentor data
        currentMentor.solutionsGiven = (currentMentor.solutionsGiven || 0) + 1;
        currentMentor.studentsHelped = (currentMentor.studentsHelped || 0) + 1;
        
        // Save updated mentor data to cloud and localStorage
        await saveMentorToCloud(currentMentor);
        
        // Update mentors list
        const mentorIndex = registeredMentors.findIndex(m => m.id === currentMentor.id);
        if (mentorIndex !== -1) {
            registeredMentors[mentorIndex] = currentMentor;
            localStorage.setItem('registeredMentors', JSON.stringify(registeredMentors));
        }
        
        showNotification('Solution submitted successfully! +10 XP earned!', 'success');
    } else {
        userAnswers.unshift(answer);
        // Award XP to student (20 XP for answering)
        await awardStudentXP(20, 'answer');
        showNotification('Answer submitted successfully! +20 XP earned!', 'success');
    }
    
    // Update doubt status
    selectedDoubtForAnswer.needsAnswer = false;
    selectedDoubtForAnswer.answers++;
    
    // Update appropriate dashboard
    if (currentUser.isMentor) {
        loadPendingDoubts();
        loadMentorAnswers();
        loadMentorProfile();
    } else {
        loadMyAnswers();
        loadProfileData();
        
        // Update current section if it's profile
        if (currentSection === 'profile') {
        loadProfileData();
        }
    }
    
    closeAnswerModal();
}

function loadMentorAnswers() {
    const container = document.getElementById('mentor-answers-list');
    
    if (mentorAnswers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>No solutions provided yet</h3>
                <p>Start helping students by answering their doubts!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = mentorAnswers.map(answer => `
        <div class="mentor-answer-card">
            <div class="answer-header">
                <h4>Solution for: ${answer.doubtTitle}</h4>
                <div class="answer-meta">
                    <span class="answer-author">${answer.authorName} <span class="mentor-tag">Mentor</span></span>
                    <span class="answer-timestamp">${answer.timestamp}</span>
                </div>
            </div>
            <div class="answer-content">${answer.content}</div>
            ${answer.media && answer.media.length > 0 ? `
                <div class="answer-media">
                    ${answer.media.map(media => `
                        <div class="media-item-display">
                            ${media.type.startsWith('image/') 
                                ? `<img src="${media.data}" alt="${media.name}" onclick="openMediaModal('${media.data}', '${media.type}')">`
                                : `<video controls><source src="${media.data}" type="${media.type}"></video>`
                            }
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="answer-stats">
                <span><i class="fas fa-thumbs-up"></i> ${answer.likes} helpful</span>
            </div>
        </div>
    `).join('');
}

function loadMentorProfile() {
    // Update mentor profile name with mentor tag
    const mentorProfileName = document.getElementById('mentor-profile-name');
    if (mentorProfileName) {
        mentorProfileName.innerHTML = `${currentMentor.name || 'Dr. Mentor'} <span class="mentor-tag">Mentor</span>`;
    }
    
    // Update mentor profile email
    const mentorProfileEmail = document.getElementById('mentor-profile-email');
    if (mentorProfileEmail) {
        mentorProfileEmail.textContent = currentMentor.email || 'mentor@adypu.edu.in';
    }
    
    // Update mentor profile expertise
    const mentorProfileExpertise = document.getElementById('mentor-profile-expertise');
    if (mentorProfileExpertise) {
        mentorProfileExpertise.textContent = currentMentor.expertise || 'Programming & Mathematics';
    }
    
    // Update mentor stats with proper counts
    document.getElementById('mentor-xp').textContent = currentMentor.xp || 0;
    document.getElementById('solutions-given').textContent = userAnswers.length || 0;
    document.getElementById('students-helped').textContent = currentMentor.studentsHelped || 0;
    document.getElementById('helpful-solutions').textContent = userAnswers.filter(a => a.likes > 0).length || 0;
    
    // Show welcome message for new mentors
    if (currentMentor.xp === 0 && currentMentor.solutionsGiven === 0) {
        showNotification(`Welcome to your mentor profile, ${currentMentor.name}! Start helping students to build your reputation.`, 'info');
    }
}

// Evaluation function for mentors to give extra XP to students
function evaluateAnswers(doubtId) {
    const doubt = doubtsData.find(d => d.id === doubtId);
    if (!doubt) return;
    
    // Get all answers for this doubt
    const allAnswers = [...userAnswers, ...mentorAnswers].filter(a => a.doubtId === doubtId);
    
    if (allAnswers.length === 0) {
        showNotification('No answers to evaluate yet', 'info');
        return;
    }
    
    // Create evaluation modal
    const evaluationModal = document.createElement('div');
    evaluationModal.className = 'modal active';
    evaluationModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Evaluate Answers</h3>
                <button class="close-modal" onclick="closeEvaluationModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="doubt-info">
                    <h4>${doubt.title}</h4>
                    <p>${doubt.description}</p>
                </div>
                <div class="answers-to-evaluate">
                    ${allAnswers.map(answer => `
                        <div class="answer-evaluation-item" data-answer-id="${answer.id}">
                            <div class="answer-content">
                                <h5>Answer by ${answer.isMentorAnswer ? answer.authorName + ' <span class="mentor-tag">Mentor</span>' : 'Solver'}</h5>
                                <p>${answer.content}</p>
                                ${answer.media && answer.media.length > 0 ? `
                                    <div class="answer-media">
                                        ${answer.media.map(media => `
                                            <div class="media-item-display">
                                                ${media.type.startsWith('image/') 
                                                    ? `<img src="${media.data}" alt="${media.name}" onclick="openMediaModal('${media.data}', '${media.type}')">`
                                                    : `<video controls><source src="${media.data}" type="${media.type}"></video>`
                                                }
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                <div class="answer-meta">
                                    <span><i class="fas fa-clock"></i> ${answer.timestamp}</span>
                                    ${answer.evaluated ? '<span class="evaluated-badge"><i class="fas fa-check"></i> Evaluated</span>' : ''}
                                </div>
                            </div>
                            <div class="evaluation-actions">
                                <button class="btn-primary" onclick="awardStudentXP(${answer.id}, 10)" ${answer.evaluated ? 'disabled' : ''}>
                                    <i class="fas fa-star"></i>
                                    Award +10 XP
                                </button>
                                <button class="btn-secondary" onclick="markAsEvaluated(${answer.id})" ${answer.evaluated ? 'disabled' : ''}>
                                    <i class="fas fa-check"></i>
                                    Mark as Evaluated
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(evaluationModal);
}

function closeEvaluationModal() {
    const modal = document.querySelector('.modal.active');
    if (modal) {
        modal.remove();
    }
}

function awardStudentXP(answerId, xpAmount) {
    const answer = [...userAnswers, ...mentorAnswers].find(a => a.id === answerId);
    if (!answer) return;
    
    if (answer.evaluated) {
        showNotification('This answer has already been evaluated', 'warning');
        return;
    }
    
    // Award XP to the student who gave the answer
    if (!answer.isMentorAnswer) {
        // Find the student and award XP
        // In a real app, this would update the student's XP in the database
        showNotification(`Awarded +${xpAmount} XP to ${answer.authorName} for excellent answer!`, 'success');
        
        // Mark as evaluated
        answer.evaluated = true;
        answer.xpAwarded = xpAmount;
        
        // Update the UI
        const answerElement = document.querySelector(`[data-answer-id="${answerId}"]`);
        if (answerElement) {
            const evaluatedBadge = answerElement.querySelector('.evaluated-badge');
            if (!evaluatedBadge) {
                const meta = answerElement.querySelector('.answer-meta');
                meta.innerHTML += '<span class="evaluated-badge"><i class="fas fa-check"></i> Evaluated (+10 XP)</span>';
            }
            
            // Disable buttons
            const buttons = answerElement.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = true);
        }
    } else {
        showNotification('Cannot award XP to mentor answers', 'warning');
    }
}

function markAsEvaluated(answerId) {
    const answer = [...userAnswers, ...mentorAnswers].find(a => a.id === answerId);
    if (!answer) return;
    
    answer.evaluated = true;
    
    // Update the UI
    const answerElement = document.querySelector(`[data-answer-id="${answerId}"]`);
    if (answerElement) {
        const meta = answerElement.querySelector('.answer-meta');
        meta.innerHTML += '<span class="evaluated-badge"><i class="fas fa-check"></i> Evaluated</span>';
        
        // Disable buttons
        const buttons = answerElement.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
    }
    
    showNotification('Answer marked as evaluated', 'success');
}

// Media modal for viewing full-size images/videos
function openMediaModal(data, type) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content media-modal-content">
            <div class="modal-header">
                <h3>Media Preview</h3>
                <button class="close-modal" onclick="closeMediaModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="media-display">
                    ${type.startsWith('image/') 
                        ? `<img src="${data}" alt="Media preview" style="max-width: 100%; max-height: 80vh; object-fit: contain;">`
                        : `<video controls style="max-width: 100%; max-height: 80vh;"><source src="${data}" type="${type}"></video>`
                    }
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeMediaModal() {
    const modal = document.querySelector('.media-modal-content').closest('.modal');
    if (modal) {
        modal.remove();
    }
}

// View all answers for a specific doubt
function viewAllAnswers(doubtId) {
    const doubt = doubtsData.find(d => d.id === doubtId);
    if (!doubt) return;
    
    // Get all answers for this doubt
    const allAnswers = [...userAnswers, ...mentorAnswers].filter(a => a.doubtId === doubtId);
    
    // Create answers modal
    const answersModal = document.createElement('div');
    answersModal.className = 'modal active';
    answersModal.innerHTML = `
        <div class="modal-content answers-modal-content">
            <div class="modal-header">
                <h3>All Answers</h3>
                <button class="close-modal" onclick="closeAnswersModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="doubt-info">
                    <h4>${doubt.title}</h4>
                    <p>${doubt.description}</p>
                    <span class="doubt-category">${doubt.category}</span>
                </div>
                
                <div class="answers-list">
                    ${allAnswers.length === 0 ? `
                        <div class="empty-answers">
                            <i class="fas fa-comments"></i>
                            <h4>No answers yet</h4>
                            <p>Be the first to answer this doubt!</p>
                        </div>
                    ` : allAnswers.map(answer => `
                        <div class="answer-item" data-answer-id="${answer.id}">
                            <div class="answer-header">
                                <div class="answer-author">
                                    <div class="author-info">
                                        <div class="author-avatar">
                                            <i class="fas ${answer.isMentorAnswer ? 'fa-user-tie' : 'fa-user'}"></i>
                                        </div>
                                        <div class="author-details">
                                            <h5>${answer.isMentorAnswer ? answer.authorName : 'Solver'}</h5>
                                            ${answer.isMentorAnswer ? '<span class="mentor-tag">Mentor</span>' : ''}
                                        </div>
                                    </div>
                                    <div class="answer-timestamp">${answer.timestamp}</div>
                                </div>
                            </div>
                            
                            <div class="answer-content">
                                <p>${answer.content}</p>
                                ${answer.media && answer.media.length > 0 ? `
                                    <div class="answer-media">
                                        ${answer.media.map(media => `
                                            <div class="media-item-display">
                                                ${media.type.startsWith('image/') 
                                                    ? `<img src="${media.data}" alt="${media.name}" onclick="openMediaModal('${media.data}', '${media.type}')">`
                                                    : `<video controls><source src="${media.data}" type="${media.type}"></video>`
                                                }
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="answer-actions">
                                <button class="action-btn" onclick="likeAnswer(${answer.id})">
                                    <i class="fas fa-thumbs-up"></i>
                                    <span>${answer.likes}</span>
                                </button>
                                ${answer.evaluated ? `<span class="evaluated-badge"><i class="fas fa-check"></i> Evaluated (+${answer.xpAwarded} XP)</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(answersModal);
}

function closeAnswersModal() {
    const modal = document.querySelector('.answers-modal-content').closest('.modal');
    if (modal) {
        modal.remove();
    }
}

function likeAnswer(answerId) {
    const answer = [...userAnswers, ...mentorAnswers].find(a => a.id === answerId);
    if (answer) {
        answer.likes++;
        
        // Update the like count in the modal
        const answerElement = document.querySelector(`[data-answer-id="${answerId}"]`);
        if (answerElement) {
            const likeButton = answerElement.querySelector('.action-btn');
            const likeSpan = likeButton.querySelector('span');
            likeSpan.textContent = answer.likes;
        }
        
        showNotification('Answer liked!', 'success');
    }
}

function logoutMentor() {
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Mentor logged out successfully', 'success');
        setTimeout(() => {
            showLoginPage();
            // Clear mentor data and session
            currentMentor = {
                xp: 0,
                solutionsGiven: 0,
                studentsHelped: 0,
                helpfulSolutions: 0
            };
            mentorAnswers = [];
            selectedDoubtForAnswer = null;
            localStorage.removeItem('currentUser');
        }, 1000);
    }
}

// Mentor Login Functions

async function handleMentorLogin(event) {
    event.preventDefault();
    
    const email = event.target.querySelector('input[type="email"]').value;
    const password = event.target.querySelector('input[type="password"]').value;
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check if email is valid NST email
    if (!email.includes('@adypu.edu.in')) {
        showNotification('Please use a valid NST email address', 'error');
        return;
    }
    
    // Check for existing mentor data (try cloud first, then localStorage)
    const mentor = await loadMentorFromCloud(email);
    if (mentor && mentor.email === email && mentor.password === password) {
        // Load mentor data
        currentMentor = mentor;
    
    // Set current user as mentor
    currentUser.isMentor = true;
        currentUser.xp = mentor.xp || 0;
        currentUser.doubtsAsked = mentor.doubtsAsked || 0;
        currentUser.answersGiven = mentor.answersGiven || 0;
        currentUser.helpfulAnswers = mentor.helpfulAnswers || 0;
        
        // Save login session
        localStorage.setItem('currentUser', JSON.stringify({
            isLoggedIn: true,
            isMentor: true,
            email: email,
            loginTime: new Date().toISOString()
        }));
        
        showNotification(`Welcome back, ${mentor.name}! You are logged in as a Mentor. Redirecting to mentor dashboard...`, 'success');
        
        // Clear pre-filled email
        localStorage.removeItem('lastRegisteredMentorEmail');
    
    // Redirect to mentor dashboard
    setTimeout(() => {
        showMentorDashboard();
    }, 1500);
        return;
    }
    
    // If no matching account found
    showNotification('Invalid email or password. Please check your credentials or sign up as a mentor.', 'error');
}

function showMentorDashboard() {
    showPage('dashboard-page');
    // Add smooth transition class
    const dashboardPage = document.getElementById('dashboard-page');
    if (dashboardPage) {
        dashboardPage.classList.add('page-transition');
    }
    
    // Load the default section (dashboard-home)
    showDashboardSection('dashboard-home');
    
    // Update mentor name in header with mentor tag
    const mentorNameElement = document.getElementById('mentor-name');
    if (mentorNameElement) {
        mentorNameElement.innerHTML = `${currentMentor.name || 'Dr. Mentor'} <span class="mentor-tag">Mentor</span>`;
    }
    
    // Update mentor profile section with mentor tag
    loadMentorProfile();
    
    // Refresh mentors list in student dashboard if it exists
    if (typeof loadMentors === 'function') {
        loadMentors();
    }
}


// Enhanced profile loading with XP
function loadProfileData() {
    if (studentData.name) {
        document.getElementById('profile-name').textContent = studentData.name;
        document.getElementById('profile-email').textContent = studentData.email;
        document.getElementById('profile-urn').textContent = `URN: ${studentData.urn}`;
        document.getElementById('user-name').textContent = studentData.name;
    }
    
    // Update stats with proper counts
    document.getElementById('total-xp').textContent = currentUser.xp || 0;
    document.getElementById('doubts-asked').textContent = userDoubts.length || 0;
    document.getElementById('answers-given').textContent = userAnswers.length || 0;
    document.getElementById('helpful-answers').textContent = userAnswers.filter(a => a.likes > 0).length || 0;
    
    // Update section controls
    const sectionControls = `
        <div class="section-controls">
            <div class="xp-summary">
                <span class="xp-label">Total XP:</span>
                <span class="xp-value">${currentUser.xp || 0}</span>
            </div>
            <div class="activity-summary">
                <span class="activity-item">${userDoubts.length || 0} Doubts Asked</span>
                <span class="activity-item">${userAnswers.length || 0} Answers Given</span>
                <span class="activity-item">${userAnswers.filter(a => a.likes > 0).length || 0} Helpful Answers</span>
            </div>
        </div>
    `;
    
    // Add XP summary to profile section header
    const profileHeader = document.querySelector('#profile-section .section-header');
    const existingControls = profileHeader.querySelector('.section-controls');
    if (!existingControls) {
        profileHeader.innerHTML += sectionControls;
    } else {
        existingControls.outerHTML = sectionControls;
    }
}

// Update mentor application to redirect to mentor login
function showMentorApplication() {
    showMentorLogin();
    showNotification('Please login with your NST email to become a mentor', 'info');
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateNSTEmail,
        validateMobileNumber,
        showNotification,
        showPage,
        showDashboard,
        showSection,
        showMentorDashboard,
        awardStudentXP,
        awardMentorXP
    };
}
