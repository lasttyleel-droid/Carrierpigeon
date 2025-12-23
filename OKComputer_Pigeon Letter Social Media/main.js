// Pigeon Post - Main JavaScript Functionality
// Carrier Pigeon Social Media Platform

// Global state management
const AppState = {
    currentUser: {
        name: 'You',
        avatar: 'resources/user-avatar-2.png',
        lettersSent: 47,
        lettersReceived: 32,
        connections: 12
    },
    letters: [],
    friends: [
        { id: 'elena', name: 'Elena Rodriguez', avatar: 'resources/user-avatar-1.png', online: true, lastLetter: '2 days ago' },
        { id: 'marcus', name: 'Marcus Chen', avatar: 'resources/user-avatar-2.png', online: false, lastLetter: '1 week ago' },
        { id: 'sophia', name: 'Sophia Williams', avatar: 'resources/user-avatar-1.png', online: true, lastLetter: '3 days ago' },
        { id: 'david', name: 'David Thompson', avatar: 'resources/user-avatar-2.png', online: false, lastLetter: '2 weeks ago' }
    ],
    writingPrompts: [
        "Write about a moment that made you smile today...",
        "Describe your perfect morning routine and how it sets the tone for your day.",
        "Share a song that holds special meaning and the story behind it.",
        "Write about something new you've learned recently and how it changed your perspective.",
        "Discuss a book that influenced your life and what you took from it.",
        "Share a dream you have and what steps you're taking to achieve it.",
        "Describe a place in nature that brings you peace and why it's special.",
        "Write about a tradition you cherish and why it matters to you.",
        "Share a challenge you overcame and what it taught you.",
        "Describe your ideal day from sunrise to sunset."
    ]
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupAnimations();
    setupPigeonBackground();
    setupScrollReveal();
    loadSampleData();
});

// Application initialization
function initializeApp() {
    // Initialize text splitting for animations
    if (typeof Splitting !== 'undefined') {
        Splitting();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize page-specific functionality
    const currentPage = getCurrentPage();
    switch(currentPage) {
        case 'index':
            initializeComposer();
            break;
        case 'profile':
            initializeProfile();
            break;
        case 'archive':
            initializeArchive();
            break;
    }
}

// Get current page identifier
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('profile.html')) return 'profile';
    if (path.includes('archive.html')) return 'archive';
    return 'index';
}

// Setup event listeners
function setupEventListeners() {
    // Auto-save functionality for letter composer
    const letterContent = document.getElementById('letter-content');
    if (letterContent) {
        letterContent.addEventListener('input', debounce(autoSave, 1000));
        letterContent.addEventListener('input', updateWordCount);
    }
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSearch, 300));
    }
    
    // Filter functionality
    const filterRecipient = document.getElementById('filter-recipient');
    const filterType = document.getElementById('filter-type');
    if (filterRecipient) filterRecipient.addEventListener('change', applyFilters);
    if (filterType) filterType.addEventListener('change', applyFilters);
}

// Initialize composer page functionality
function initializeComposer() {
    updateWordCount();
    displayWritingPrompt();
    loadRecentLetters();
}

// Initialize profile page functionality
function initializeProfile() {
    loadWritingStats();
    setupAchievements();
}

// Initialize archive page functionality
function initializeArchive() {
    setupActivityChart();
    loadLetterTimeline();
}

// Animation setup
function setupAnimations() {
    // Animate hero text on load
    if (typeof anime !== 'undefined') {
        anime({
            targets: '[data-splitting] .char',
            translateY: [100, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 1400,
            delay: anime.stagger(30)
        });
    }
}

// Setup scroll reveal animations
function setupScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

// Pigeon background animation using p5.js
function setupPigeonBackground() {
    if (typeof p5 === 'undefined') return;
    
    new p5((p) => {
        let pigeons = [];
        
        p.setup = function() {
            const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.parent('pigeon-canvas');
            
            // Create initial pigeons
            for (let i = 0; i < 5; i++) {
                pigeons.push(new Pigeon(p));
            }
        };
        
        p.draw = function() {
            p.clear();
            
            // Update and draw pigeons
            pigeons.forEach(pigeon => {
                pigeon.update();
                pigeon.display();
            });
        };
        
        p.windowResized = function() {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
        
        // Pigeon class
        class Pigeon {
            constructor(p) {
                this.p = p;
                this.x = p.random(p.width);
                this.y = p.random(p.height * 0.3);
                this.vx = p.random(-0.5, 0.5);
                this.vy = p.random(-0.2, 0.2);
                this.size = p.random(15, 25);
                this.wingPhase = p.random(p.TWO_PI);
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.wingPhase += 0.1;
                
                // Wrap around screen
                if (this.x > this.p.width + 50) this.x = -50;
                if (this.x < -50) this.x = this.p.width + 50;
                if (this.y > this.p.height * 0.5) this.y = -50;
                if (this.y < -50) this.y = this.p.height * 0.5;
            }
            
            display() {
                this.p.push();
                this.p.translate(this.x, this.y);
                this.p.fill(139, 69, 19, 100);
                this.p.noStroke();
                
                // Simple pigeon shape
                const wingFlap = this.p.sin(this.wingPhase) * 0.2;
                this.p.ellipse(0, 0, this.size, this.size * 0.8);
                this.p.ellipse(-this.size * 0.3, wingFlap * 5, this.size * 0.6, this.size * 0.4);
                this.p.ellipse(this.size * 0.3, -wingFlap * 5, this.size * 0.6, this.size * 0.4);
                
                this.p.pop();
            }
        }
    });
}

// Letter composer functionality
function scrollToComposer() {
    document.getElementById('composer').scrollIntoView({ behavior: 'smooth' });
}

function selectTemplate(templateType) {
    const content = document.getElementById('letter-content');
    if (!content) return;
    
    const templates = {
        formal: {
            greeting: "Dear [Name],",
            body: "I hope this letter finds you well. I am writing to...",
            closing: "Sincerely yours,\n[Your Name]"
        },
        personal: {
            greeting: "Dear friend,",
            body: "I was thinking about you today and...",
            closing: "With warm regards,\n[Your Name]"
        },
        poetry: {
            greeting: "To my dearest,",
            body: "Words flow like rivers when I think of you...",
            closing: "Forever in my thoughts,\n[Your Name]"
        }
    };
    
    const template = templates[templateType];
    if (template) {
        content.value = `${template.greeting}\n\n${template.body}\n\n${template.closing}`;
        updateWordCount();
        
        // Animate template selection
        if (typeof anime !== 'undefined') {
            anime({
                targets: content,
                scale: [0.98, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
        }
    }
}

function displayWritingPrompt() {
    const promptElement = document.getElementById('writing-prompt');
    if (!promptElement) return;
    
    const randomPrompt = AppState.writingPrompts[Math.floor(Math.random() * AppState.writingPrompts.length)];
    
    if (typeof Typed !== 'undefined') {
        new Typed('#writing-prompt', {
            strings: [randomPrompt],
            typeSpeed: 30,
            showCursor: false
        });
    } else {
        promptElement.textContent = randomPrompt;
    }
}

function newPrompt() {
    const promptElement = document.getElementById('writing-prompt');
    if (!promptElement) return;
    
    const randomPrompt = AppState.writingPrompts[Math.floor(Math.random() * AppState.writingPrompts.length)];
    
    if (typeof Typed !== 'undefined') {
        promptElement.textContent = '';
        new Typed('#writing-prompt', {
            strings: [randomPrompt],
            typeSpeed: 30,
            showCursor: false
        });
    } else {
        promptElement.textContent = randomPrompt;
    }
}

function updateWordCount() {
    const content = document.getElementById('letter-content');
    const wordCountElement = document.getElementById('word-count');
    
    if (content && wordCountElement) {
        const words = content.value.trim().split(/\s+/).filter(word => word.length > 0);
        wordCountElement.textContent = words.length;
    }
}

function autoSave() {
    const content = document.getElementById('letter-content');
    const recipient = document.getElementById('recipient');
    const subject = document.getElementById('subject');
    
    if (content) {
        const letterData = {
            content: content.value,
            recipient: recipient ? recipient.value : '',
            subject: subject ? subject.value : '',
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('pigeonPost_draft', JSON.stringify(letterData));
        
        const statusElement = document.getElementById('save-status');
        if (statusElement) {
            statusElement.textContent = 'Auto-saved';
            statusElement.className = 'text-green-600';
            
            setTimeout(() => {
                statusElement.textContent = 'Auto-saved';
            }, 2000);
        }
    }
}

function saveDraft() {
    autoSave();
    
    // Show confirmation
    const statusElement = document.getElementById('save-status');
    if (statusElement) {
        statusElement.textContent = 'Draft saved manually';
        statusElement.className = 'text-blue-600';
    }
    
    // Animate save button
    if (typeof anime !== 'undefined') {
        const saveBtn = event.target;
        anime({
            targets: saveBtn,
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeOutQuad'
        });
    }
}

function sendLetter() {
    const content = document.getElementById('letter-content');
    const recipient = document.getElementById('recipient');
    const subject = document.getElementById('subject');
    
    if (!content || !content.value.trim()) {
        alert('Please write a letter before sending!');
        return;
    }
    
    if (!recipient || !recipient.value) {
        alert('Please select a recipient!');
        return;
    }
    
    // Animate pigeon sending
    animatePigeonSending();
    
    // Simulate sending process
    setTimeout(() => {
        // Save letter to archive
        const letterData = {
            id: Date.now().toString(),
            to: recipient.options[recipient.selectedIndex].text,
            toId: recipient.value,
            subject: subject ? subject.value : 'No subject',
            content: content.value,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };
        
        saveLetterToArchive(letterData);
        
        // Clear form
        content.value = '';
        if (subject) subject.value = '';
        recipient.value = '';
        
        updateWordCount();
        
        // Show success message
        showNotification('Letter sent successfully! 🕊', 'success');
        
        // Clear draft
        localStorage.removeItem('pigeonPost_draft');
        
    }, 2000);
}

function animatePigeonSending() {
    // Create flying pigeon animation
    if (typeof anime !== 'undefined') {
        // Animate send button
        const sendBtn = document.querySelector('button[onclick="sendLetter()"]');
        if (sendBtn) {
            anime({
                targets: sendBtn,
                scale: [1, 1.1, 1],
                backgroundColor: ['#8B4513', '#A0522D', '#8B4513'],
                duration: 1000,
                easing: 'easeInOutQuad'
            });
        }
        
        // Create temporary flying pigeon
        const pigeon = document.createElement('div');
        pigeon.innerHTML = '🕊';
        pigeon.style.position = 'fixed';
        pigeon.style.fontSize = '2rem';
        pigeon.style.zIndex = '1000';
        pigeon.style.left = '50%';
        pigeon.style.top = '50%';
        document.body.appendChild(pigeon);
        
        anime({
            targets: pigeon,
            translateX: window.innerWidth,
            translateY: -200,
            rotate: 360,
            opacity: [1, 0],
            duration: 2000,
            easing: 'easeOutQuad',
            complete: () => {
                document.body.removeChild(pigeon);
            }
        });
    }
}

// Profile page functions
function editProfile() {
    showNotification('Profile editing coming soon! ✨', 'info');
}

function addFriend() {
    const friendName = prompt('Enter your friend\'s username or email:');
    if (friendName) {
        showNotification(`Friend request sent to ${friendName}! 💌`, 'success');
    }
}

function writeLetter(friendId) {
    // Navigate to composer and pre-select recipient
    window.location.href = 'index.html';
    setTimeout(() => {
        const recipientSelect = document.getElementById('recipient');
        if (recipientSelect) {
            recipientSelect.value = friendId;
            document.getElementById('composer').scrollIntoView({ behavior: 'smooth' });
        }
    }, 500);
}

function viewHistory(friendId) {
    // Navigate to archive with friend filter
    window.location.href = 'archive.html';
    setTimeout(() => {
        const recipientFilter = document.getElementById('filter-recipient');
        if (recipientFilter) {
            recipientFilter.value = friendId;
            applyFilters();
        }
    }, 500);
}

function usePrompt(promptType) {
    const prompts = {
        morning: "Describe your perfect morning routine and how it sets the tone for your day.",
        music: "Share a song that holds special meaning and the story behind it.",
        growth: "Write about something new you've learned recently and how it changed your perspective.",
        books: "Discuss a book that influenced your life and what you took from it.",
        dreams: "Share a dream you have and what steps you're taking to achieve it.",
        nature: "Describe a place in nature that brings you peace and why it's special."
    };
    
    const content = document.getElementById('letter-content');
    if (content && prompts[promptType]) {
        content.value = `Dear friend,\n\n${prompts[promptType]}\n\n`;
        updateWordCount();
        document.getElementById('composer').scrollIntoView({ behavior: 'smooth' });
    }
}

// Archive page functions
function setupActivityChart() {
    if (typeof echarts === 'undefined') return;
    
    const chartElement = document.getElementById('activity-chart');
    if (!chartElement) return;
    
    const chart = echarts.init(chartElement);
    
    const option = {
        color: ['#8B4513', '#F5F5DC'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            data: ['Letters Sent', 'Letters Received']
        },
        xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Letters Sent',
                type: 'line',
                data: [2, 3, 4, 3, 5, 4, 6, 5, 4, 3, 4, 3],
                smooth: true,
                lineStyle: {
                    width: 3
                }
            },
            {
                name: 'Letters Received',
                type: 'line',
                data: [1, 2, 3, 4, 3, 5, 4, 5, 6, 4, 3, 2],
                smooth: true,
                lineStyle: {
                    width: 3
                }
            }
        ]
    };
    
    chart.setOption(option);
    
    // Resize chart on window resize
    window.addEventListener('resize', () => {
        chart.resize();
    });
}

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (searchTerm === '' || text.includes(searchTerm)) {
            item.style.display = 'block';
            // Highlight search terms
            if (searchTerm) {
                highlightText(item, searchTerm);
            }
        } else {
            item.style.display = 'none';
        }
    });
}

function highlightText(element, searchTerm) {
    // Simple text highlighting (in a real app, you'd use a more sophisticated approach)
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        if (text.toLowerCase().includes(searchTerm.toLowerCase())) {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            const highlightedText = text.replace(regex, '<span class="search-highlight">$1</span>');
            const wrapper = document.createElement('span');
            wrapper.innerHTML = highlightedText;
            textNode.parentNode.replaceChild(wrapper, textNode);
        }
    });
}

function applyFilters() {
    const recipientFilter = document.getElementById('filter-recipient');
    const typeFilter = document.getElementById('filter-type');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        let show = true;
        
        if (recipientFilter && recipientFilter.value) {
            const recipientText = item.querySelector('p').textContent;
            if (!recipientText.includes(recipientFilter.options[recipientFilter.selectedIndex].text)) {
                show = false;
            }
        }
        
        if (show) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterByDate(period) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter logic would go here
    showNotification(`Filtered by: ${period}`, 'info');
}

function clearFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const searchInput = document.getElementById('search-input');
    const recipientFilter = document.getElementById('filter-recipient');
    const typeFilter = document.getElementById('filter-type');
    
    if (searchInput) searchInput.value = '';
    if (recipientFilter) recipientFilter.value = '';
    if (typeFilter) typeFilter.value = '';
    
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.style.display = 'block';
    });
    
    showNotification('Filters cleared', 'info');
}

function toggleView(viewType) {
    const timelineContainer = document.getElementById('timeline-container');
    const gridContainer = document.getElementById('grid-container');
    
    if (viewType === 'timeline') {
        timelineContainer.parentElement.style.display = 'block';
        gridContainer.classList.add('hidden');
    } else {
        timelineContainer.parentElement.style.display = 'none';
        gridContainer.classList.remove('hidden');
        populateGridView();
    }
}

function populateGridView() {
    // Grid view population logic
    showNotification('Grid view activated', 'info');
}

// Letter actions
function readLetter(letterId) {
    showNotification('Opening letter for reading... 📖', 'info');
}

function exportLetter(letterId) {
    showNotification('Exporting letter to PDF... 📄', 'info');
}

function favoriteLetter(letterId) {
    showNotification('Letter added to favorites! ⭐', 'success');
}

function trackLetter(letterId) {
    showNotification('Tracking letter delivery... 🕊', 'info');
}

function editLetter(letterId) {
    showNotification('Opening letter for editing... ✏️', 'info');
}

function replyToLetter(letterId) {
    window.location.href = 'index.html';
    setTimeout(() => {
        showNotification('Reply composer opened', 'info');
    }, 500);
}

function readFeatured(featuredId) {
    showNotification('Opening featured letter... ✨', 'info');
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
    
    // Set colors based on type
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-black'
    };
    
    notification.className += ` ${colors[type] || colors.info}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function saveLetterToArchive(letterData) {
    let archive = JSON.parse(localStorage.getItem('pigeonPost_archive') || '[]');
    archive.unshift(letterData);
    localStorage.setItem('pigeonPost_archive', JSON.stringify(archive));
}

function loadSampleData() {
    // Load sample letters and conversations
    const sampleLetters = [
        {
            id: '1',
            to: 'Elena Rodriguez',
            toId: 'elena',
            subject: 'Thoughts on the changing seasons',
            content: 'Dearest friend, as autumn paints the leaves in golden hues, I find myself reflecting on the passage of time and the beauty in each transition...',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'delivered'
        },
        {
            id: '2',
            to: 'Marcus Chen',
            toId: 'marcus',
            subject: 'Travel adventures and discoveries',
            content: 'My dear companion, the journey continues to surprise me. Yesterday I discovered a small café tucked away in an alley...',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'read'
        }
    ];
    
    // Save sample data if archive is empty
    const existingArchive = JSON.parse(localStorage.getItem('pigeonPost_archive') || '[]');
    if (existingArchive.length === 0) {
        localStorage.setItem('pigeonPost_archive', JSON.stringify(sampleLetters));
    }
}

function loadRecentLetters() {
    // This would load recent letters from localStorage
    // Implementation depends on specific UI requirements
}

function loadWritingStats() {
    // Update statistics on profile page
    const archive = JSON.parse(localStorage.getItem('pigeonPost_archive') || '[]');
    const sentLetters = archive.filter(letter => letter.status === 'sent').length;
    
    // Update UI elements with real data
    const statsElements = document.querySelectorAll('.font-display');
    // Implementation would update specific stat elements
}

function setupAchievements() {
    // Calculate and display achievements based on user activity
    const archive = JSON.parse(localStorage.getItem('pigeonPost_archive') || '[]');
    // Achievement calculation logic would go here
}

function loadLetterTimeline() {
    // Load and display letter timeline
    const archive = JSON.parse(localStorage.getItem('pigeonPost_archive') || '[]');
    // Timeline population logic would go here
}

// Export functions for global access
window.scrollToComposer = scrollToComposer;
window.selectTemplate = selectTemplate;
window.newPrompt = newPrompt;
window.saveDraft = saveDraft;
window.sendLetter = sendLetter;
window.editProfile = editProfile;
window.addFriend = addFriend;
window.writeLetter = writeLetter;
window.viewHistory = viewHistory;
window.usePrompt = usePrompt;
window.performSearch = performSearch;
window.applyFilters = applyFilters;
window.filterByDate = filterByDate;
window.clearFilters = clearFilters;
window.toggleView = toggleView;
window.readLetter = readLetter;
window.exportLetter = exportLetter;
window.favoriteLetter = favoriteLetter;
window.trackLetter = trackLetter;
window.editLetter = editLetter;
window.replyToLetter = replyToLetter;
window.readFeatured = readFeatured;