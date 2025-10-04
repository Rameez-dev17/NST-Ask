// Global variables
let currentPage = 'landing';
let studentData = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Start the landing page animation
    setTimeout(() => {
        showLoginPage();
    }, 3000); // Show login page after 3 seconds
});

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
}

function showSignupPage() {
    showPage('signup-page');
}

function showSuccessPage() {
    showPage('success-page');
}

// Login page functions
function showStudentLogin() {
    const loginForm = document.getElementById('student-login-form');
    const mentorInfo = document.getElementById('mentor-info');
    
    // Hide mentor info and show login form
    mentorInfo.classList.remove('active');
    loginForm.classList.add('active');
}

function showMentorOption() {
    const loginForm = document.getElementById('student-login-form');
    const mentorInfo = document.getElementById('mentor-info');
    
    // Hide login form and show mentor info
    loginForm.classList.remove('active');
    mentorInfo.classList.add('active');
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

function handleSignup(event) {
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
    
    // Simulate account creation
    showNotification('Account created successfully!', 'success');
    
    // Show success page after a short delay
    setTimeout(() => {
        showSuccessPage();
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
    showNotification('Mentor application feature coming soon!', 'info');
    
    // In a real application, this would redirect to mentor application form
    console.log('Mentor application requested');
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
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
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
let currentUser = {
    xp: 0,
    doubtsAsked: 0,
    answersGiven: 0,
    helpfulAnswers: 0
};
let currentMentor = {
    xp: 0,
    solutionsGiven: 0,
    studentsHelped: 0,
    helpfulSolutions: 0
};
let selectedDoubtForAnswer = null;

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
        case 'mentors':
            loadMentors();
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
            timestamp: "2 hours ago",
            answers: 3,
            likes: 5
        },
        {
            id: 2,
            title: "What is the difference between AC and DC current?",
            description: "I'm studying electrical engineering and confused about the fundamental differences between alternating current and direct current. Need a clear explanation with examples.",
            category: "engineering",
            author: "Anonymous",
            timestamp: "4 hours ago",
            answers: 2,
            likes: 8
        },
        {
            id: 3,
            title: "How to solve quadratic equations using the quadratic formula?",
            description: "I'm struggling with quadratic equations in my math class. Can someone walk me through the quadratic formula step by step with examples?",
            category: "mathematics",
            author: "Anonymous",
            timestamp: "6 hours ago",
            answers: 4,
            likes: 12
        },
        {
            id: 4,
            title: "Best practices for database normalization",
            description: "I'm designing a database for my project and want to understand normalization rules. What are the key principles and when should I apply them?",
            category: "programming",
            author: "Anonymous",
            timestamp: "8 hours ago",
            answers: 1,
            likes: 6
        }
    ];
    
    doubtsData = sampleDoubts;
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
                        <span><i class="fas fa-clock"></i> ${doubt.timestamp}</span>
                    </div>
                </div>
            </div>
            <div class="doubt-description">${doubt.description}</div>
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
                <span class="answers-count">
                    <i class="fas fa-comments"></i>
                    ${doubt.answers} answers
                </span>
            </div>
        </div>
    `).join('');
}

// Submit doubt function
function submitDoubt(event) {
    event.preventDefault();
    
    const title = document.getElementById('doubt-title').value;
    const category = document.getElementById('doubt-category').value;
    const description = document.getElementById('doubt-description').value;
    const isAnonymous = document.getElementById('anonymous-post').checked;
    
    if (!title || !category || !description) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    const newDoubt = {
        id: Date.now(),
        title: title,
        description: description,
        category: category,
        author: isAnonymous ? 'Anonymous' : studentData.name,
        authorId: studentData.urn || 'student123',
        timestamp: 'Just now',
        answers: 0,
        likes: 0,
        isAnonymous: !isAnonymous, // Store actual author for tracking
        needsAnswer: true
    };
    
    // Add to doubts data
    doubtsData.unshift(newDoubt);
    userDoubts.unshift(newDoubt);
    
    // Award XP for asking a doubt (10 XP)
    awardStudentXP(10, 'doubt');
    
    // Update UI
    renderDoubtsFeed(doubtsData);
    clearDoubtForm();
    
    loadProfileData();
    loadLeaderboard();
    
    showNotification('Doubt posted successfully! +10 XP earned!', 'success');
    
    // Switch to feed section to show the new doubt
    showSection('feed');
}

function clearDoubtForm() {
    document.getElementById('doubt-title').value = '';
    document.getElementById('doubt-category').value = '';
    document.getElementById('doubt-description').value = '';
    document.getElementById('anonymous-post').checked = false;
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
        showNotification(`Answering doubt: ${doubt.title}`, 'info');
        // In a real app, this would open an answer form
        console.log('Answering doubt:', doubt);
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
            <div class="doubt-meta">
                <span><i class="fas fa-clock"></i> ${doubt.timestamp}</span>
                <span><i class="fas fa-comments"></i> ${doubt.answers} answers</span>
                <span><i class="fas fa-thumbs-up"></i> ${doubt.likes} likes</span>
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
                <span class="answer-timestamp">${answer.timestamp}</span>
            </div>
            <div class="answer-content">${answer.content}</div>
            <div class="answer-stats">
                <span><i class="fas fa-thumbs-up"></i> ${answer.likes} helpful</span>
            </div>
        </div>
    `).join('');
}

// Load mentors
function loadMentors() {
    const container = document.getElementById('mentors-grid');
    
    const sampleMentors = [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            subject: "Computer Science",
            rating: 4.9,
            students: 150,
            bio: "Expert in algorithms and data structures with 10+ years of teaching experience."
        },
        {
            id: 2,
            name: "Prof. Michael Chen",
            subject: "Mathematics",
            rating: 4.8,
            students: 200,
            bio: "Specialized in calculus and linear algebra. Passionate about making math accessible."
        },
        {
            id: 3,
            name: "Dr. Emily Rodriguez",
            subject: "Engineering",
            rating: 4.7,
            students: 120,
            bio: "Mechanical engineering expert with industry experience in renewable energy."
        }
    ];
    
    container.innerHTML = sampleMentors.map(mentor => `
        <div class="mentor-card">
            <div class="mentor-avatar">
                <i class="fas fa-user-tie"></i>
            </div>
            <div class="mentor-info">
                <h3>${mentor.name}</h3>
                <p class="mentor-subject">${mentor.subject}</p>
                <p class="mentor-bio">${mentor.bio}</p>
                <div class="mentor-stats">
                    <span><i class="fas fa-star"></i> ${mentor.rating}</span>
                    <span><i class="fas fa-users"></i> ${mentor.students} students</span>
                </div>
                <button class="btn-primary" onclick="connectMentor(${mentor.id})">Connect</button>
            </div>
        </div>
    `).join('');
}

function connectMentor(mentorId) {
    showNotification('Mentor connection feature coming soon!', 'info');
}

// Load profile data
function loadProfileData() {
    if (studentData.name) {
        document.getElementById('profile-name').textContent = studentData.name;
        document.getElementById('profile-email').textContent = studentData.email;
        document.getElementById('profile-urn').textContent = `URN: ${studentData.urn}`;
        document.getElementById('user-name').textContent = studentData.name;
    }
    
    // Update stats
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
    loadSectionData('feed');
    setupSearchAndFilter();
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            showLoginPage();
            // Clear user data
            studentData = {};
            userDoubts = [];
            userAnswers = [];
        }, 1000);
    }
}

// Update login function to redirect to dashboard
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
    showNotification('Login successful! Redirecting to dashboard...', 'success');
    
    // Redirect to dashboard after successful login
    setTimeout(() => {
        showDashboard();
    }, 1500);
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
function awardStudentXP(points, reason) {
    currentUser.xp += points;
    
    if (reason === 'doubt') {
        currentUser.doubtsAsked++;
    } else if (reason === 'answer') {
        currentUser.answersGiven++;
    } else if (reason === 'helpful') {
        currentUser.helpfulAnswers++;
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

function awardMentorXP(points, reason) {
    currentMentor.xp += points;
    
    if (reason === 'solution') {
        currentMentor.solutionsGiven++;
    } else if (reason === 'student') {
        currentMentor.studentsHelped++;
    } else if (reason === 'helpful') {
        currentMentor.helpfulSolutions++;
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
}

function submitAnswer(event) {
    event.preventDefault();
    
    const content = document.getElementById('answer-content').value.trim();
    if (!content) {
        showNotification('Please provide a solution', 'error');
        return;
    }
    
    if (!selectedDoubtForAnswer) {
        showNotification('No doubt selected', 'error');
        return;
    }
    
    const answer = {
        id: Date.now(),
        doubtId: selectedDoubtForAnswer.id,
        doubtTitle: selectedDoubtForAnswer.title,
        content: content,
        mentorId: 'mentor123',
        mentorName: 'Dr. Mentor',
        timestamp: 'Just now',
        likes: 0
    };
    
    // Add to mentor answers
    mentorAnswers.unshift(answer);
    
    // Update doubt status
    selectedDoubtForAnswer.needsAnswer = false;
    selectedDoubtForAnswer.answers++;
    
    // Award XP to mentor (10 XP)
    awardMentorXP(10, 'solution');
    
    // Update mentor dashboard
    loadPendingDoubts();
    loadMentorAnswers();
    loadMentorProfile();
    
    closeAnswerModal();
    
    showNotification('Solution submitted successfully! +10 XP earned!', 'success');
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
                <span class="answer-timestamp">${answer.timestamp}</span>
            </div>
            <div class="answer-content">${answer.content}</div>
            <div class="answer-stats">
                <span><i class="fas fa-thumbs-up"></i> ${answer.likes} helpful</span>
            </div>
        </div>
    `).join('');
}

function loadMentorProfile() {
    // Update mentor stats
    document.getElementById('mentor-xp').textContent = currentMentor.xp;
    document.getElementById('solutions-given').textContent = currentMentor.solutionsGiven;
    document.getElementById('students-helped').textContent = currentMentor.studentsHelped;
    document.getElementById('helpful-solutions').textContent = currentMentor.helpfulSolutions;
}

function logoutMentor() {
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Mentor logged out successfully', 'success');
        setTimeout(() => {
            showLoginPage();
            // Clear mentor data
            currentMentor = {
                xp: 0,
                solutionsGiven: 0,
                studentsHelped: 0,
                tagged: 0
            };
            mentorAnswers = [];
            selectedDoubtForAnswer = null;
        }, 1000);
    }
}

// Mentor Login Functions
function showMentorLogin() {
    const loginForm = document.getElementById('student-login-form');
    const mentorInfo = document.getElementById('mentor-info');
    
    // Create mentor login form if it doesn't exist
    let mentorLoginForm = document.getElementById('mentor-login-form');
    
    if (!mentorLoginForm) {
        const loginContainer = document.querySelector('.login-container');
        
        mentorLoginForm = document.createElement('div');
        mentorLoginForm.className = 'login-form';
        mentorLoginForm.id = 'mentor-login-form';
        mentorLoginForm.innerHTML = `
            <h3>Mentor Login</h3>
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
            <button class="btn-secondary" onclick="goBackToMain()" style="width: 100%; margin-top: 1rem;">Back to Student Login</button>
        `;
        
        loginContainer.appendChild(mentorLoginForm);
    }
    
    // Hide student login and show mentor login
    loginForm.classList.remove('active');
    mentorInfo.classList.remove('active');
    mentorLoginForm.classList.add('active');
}

function handleMentorLogin(event) {
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
    
    // Simulate mentor login
    showNotification('Mentor login successful! Redirecting to mentor dashboard...', 'success');
    
    // Store mentor data
    currentMentor = {
        name: email.split('@')[0].replace('.', ' '),
        email: email,
        xp: 0,
        solutionsGiven: 0,
        studentsHelped: 0,
        helpfulSolutions: 0
    };
    
    // Redirect to mentor dashboard
    setTimeout(() => {
        showMentorDashboard();
    }, 1500);
}

function showMentorDashboard() {
    showPage('mentor-dashboard-page');
    loadMentorSectionData('pending');
    
    // Update mentor name in header
    document.getElementById('mentor-name').textContent = currentMentor.name || 'Dr. Mentor';
}

function goBackToMain() {
    const loginForm = document.getElementById('student-login-form');
    const mentorLoginForm = document.getElementById('mentor-login-form');
    
    loginForm.classList.add('active');
    mentorLoginForm.classList.remove('active');
}

// Enhanced profile loading with XP
function loadProfileData() {
    if (studentData.name) {
        document.getElementById('profile-name').textContent = studentData.name;
        document.getElementById('profile-email').textContent = studentData.email;
        document.getElementById('profile-urn').textContent = `URN: ${studentData.urn}`;
        document.getElementById('user-name').textContent = studentData.name;
    }
    
    // Update stats with XP
    document.getElementById('total-xp').textContent = currentUser.xp || 0;
    document.getElementById('doubts-asked').textContent = currentUser.doubtsAsked || 0;
    document.getElementById('answers-given').textContent = currentUser.answersGiven || 0;
    document.getElementById('helpful-answers').textContent = currentUser.helpfulAnswers || 0;
    
    // Update section controls
    const sectionControls = `
        <div class="section-controls">
            <div class="xp-summary">
                <span class="xp-label">Total XP:</span>
                <span class="xp-value">${currentUser.xp}</span>
            </div>
            <div class="activity-summary">
                <span class="activity-item">${currentUser.doubtsAsked} Doubts Asked</span>
                <span class="activity-item">${currentUser.answersGiven} Answers Given</span>
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
