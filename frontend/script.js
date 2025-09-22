// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Global state
let currentUser = null;
let currentNoteId = null;
let currentNoteColor = '#FFFFFF';
let currentNotePinned = false;
let notes = [];

// DOM elements
const pages = {
    login: document.getElementById('loginPage'),
    register: document.getElementById('registerPage'),
    dashboard: document.getElementById('dashboardPage')
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    
    // Make functions globally accessible
    window.showLogin = showLogin;
    window.showRegister = showRegister;
    window.openNewNote = openNewNote;
    window.closeNoteModal = closeNoteModal;
    window.toggleNotePin = toggleNotePin;
    window.toggleColorPicker = toggleColorPicker;
    window.saveNote = saveNote;
    window.deleteNote = deleteNote;
    window.saveQuickNote = saveQuickNote;
    
    // Setup quick note input
    setupQuickNoteInput();
    
    console.log('App initialized, functions made global');
});

// Initialize application
function initializeApp() {
    const token = localStorage.getItem('studentToken');
    if (token) {
        validateToken(token);
    } else {
        showLogin();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Navigation links
    const registerLink = document.querySelector('a[onclick="showRegister()"]');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            showRegister();
        });
    }
    
    const loginLink = document.querySelector('a[onclick="showLogin()"]');
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLogin();
        });
    }
    
    // Color picker
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            selectColor(this.getAttribute('data-color'));
        });
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeNoteModal();
        }
    });
}

// Setup quick note input functionality
function setupQuickNoteInput() {
    const quickNoteTitle = document.getElementById('quickNoteTitle');
    const quickNoteDescription = document.getElementById('quickNoteDescription');
    
    if (quickNoteTitle && quickNoteDescription) {
        // Auto-resize textarea
        quickNoteDescription.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.max(60, this.scrollHeight) + 'px';
        });
        
        // Handle Enter key in title to move to description
        quickNoteTitle.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                quickNoteDescription.focus();
            }
        });
        
        // Handle Ctrl+Enter to save quickly
        quickNoteDescription.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                saveQuickNote();
            }
        });
    }
}

// Page navigation
function showPage(pageName) {
    Object.values(pages).forEach(page => page.classList.remove('active'));
    pages[pageName].classList.add('active');
}

function showLogin() {
    console.log('showLogin() called');
    showPage('login');
    clearAuthForms();
}

function showRegister() {
    console.log('showRegister() called');
    showPage('register');
    clearAuthForms();
}

function showDashboard() {
    showPage('dashboard');
    loadUserProfile();
    loadNotes();
}

function clearAuthForms() {
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    hideError('loginError');
    hideError('registerError');
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('loginStudentId').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!studentId || !password) {
        showError('loginError', 'Please fill in all fields');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                student_id: studentId,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('studentToken', data.data.token);
            currentUser = data.data.student;
            showMessage('Login successful!', 'success');
            showDashboard();
        } else {
            showError('loginError', data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('loginError', 'Connection error. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('registerStudentId').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!studentId || !password || !confirmPassword) {
        showError('registerError', 'Please fill in required fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('registerError', 'Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showError('registerError', 'Password must be at least 6 characters long');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                student_id: studentId,
                password: password,
                first_name: firstName || undefined,
                last_name: lastName || undefined
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Registration successful - can now login
            showMessage('Registration successful! You can now sign in with your credentials.', 'success');
            document.getElementById('registerForm').reset();
            showLogin(); // Redirect to login page
        } else {
            // Handle validation errors with detailed messages
            if (data.errors && data.errors.length > 0) {
                const errorMessages = data.errors.map(error => error.msg).join('<br>');
                showError('registerError', errorMessages);
            } else {
                showError('registerError', data.message || 'Registration failed');
            }
            console.log('Registration error details:', data);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('registerError', 'Connection error. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function validateToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.data.student;
            showDashboard();
        } else {
            localStorage.removeItem('studentToken');
            showLogin();
        }
    } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('studentToken');
        showLogin();
    }
}

function handleLogout() {
    localStorage.removeItem('studentToken');
    currentUser = null;
    notes = [];
    showMessage('Logged out successfully', 'success');
    showLogin();
}

// User profile functions
function loadUserProfile() {
    if (currentUser) {
        const userInfo = document.getElementById('userInfo');
        const displayName = currentUser.first_name && currentUser.last_name 
            ? `${currentUser.first_name} ${currentUser.last_name}` 
            : currentUser.student_id;
        userInfo.textContent = `Welcome, ${displayName}`;
    }
}

// Notes functions
async function loadNotes() {
    const token = localStorage.getItem('studentToken');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            notes = data.data.notes;
            displayNotes();
        } else {
            showMessage('Failed to load notes', 'error');
        }
    } catch (error) {
        console.error('Load notes error:', error);
        showMessage('Connection error while loading notes', 'error');
    }
}

function displayNotes() {
    const pinnedNotesContainer = document.getElementById('pinnedNotes');
    const regularNotesContainer = document.getElementById('regularNotes');
    const pinnedSection = document.getElementById('pinnedNotesSection');
    const regularSection = document.getElementById('regularNotesSection');
    const othersTitle = document.querySelector('.others-title');
    const emptyState = document.getElementById('emptyState');
    
    // Clear containers
    pinnedNotesContainer.innerHTML = '';
    regularNotesContainer.innerHTML = '';
    
    // Separate pinned and regular notes
    const pinnedNotes = notes.filter(note => note.is_pinned);
    const regularNotes = notes.filter(note => !note.is_pinned);
    
    // Display pinned notes
    if (pinnedNotes.length > 0) {
        pinnedSection.classList.remove('hidden');
        pinnedNotes.forEach(note => {
            pinnedNotesContainer.appendChild(createNoteElement(note));
        });
    } else {
        pinnedSection.classList.add('hidden');
    }
    
    // Display regular notes
    if (regularNotes.length > 0) {
        regularNotes.forEach(note => {
            regularNotesContainer.appendChild(createNoteElement(note));
        });
        
        // Show "Others" title if there are pinned notes
        if (pinnedNotes.length > 0) {
            othersTitle.classList.remove('hidden');
        } else {
            othersTitle.classList.add('hidden');
        }
    }
    
    // Show empty state if no notes
    if (notes.length === 0) {
        emptyState.classList.remove('hidden');
        regularSection.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        regularSection.classList.remove('hidden');
    }
}

function createNoteElement(note) {
    const noteDiv = document.createElement('div');
    noteDiv.className = `note-card${note.is_pinned ? ' pinned' : ''}`;
    noteDiv.style.backgroundColor = note.color || '#FFFFFF';
    noteDiv.onclick = () => openEditNote(note);
    
    const title = note.title || 'Untitled';
    const content = note.content || '';
    const date = new Date(note.updated_at).toLocaleDateString();
    
    noteDiv.innerHTML = `
        ${title ? `<div class="note-title">${escapeHtml(title)}</div>` : ''}
        ${content ? `<div class="note-content">${escapeHtml(content).replace(/\n/g, '<br>')}</div>` : ''}
        <div class="note-date">${date}</div>
    `;
    
    return noteDiv;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Note modal functions
function openNewNote() {
    currentNoteId = null;
    currentNoteColor = '#FFFFFF';
    currentNotePinned = false;
    
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    updateNoteModalColor('#FFFFFF');
    updatePinButton(false);
    
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('saveBtn').textContent = 'Save';
    
    document.getElementById('noteModal').classList.remove('hidden');
    
    // Set a small timeout to ensure the modal is visible before focusing
    setTimeout(() => {
        document.getElementById('noteTitle').focus();
    }, 10);
}

function openNewNoteWithContent(content) {
    currentNoteId = null;
    currentNoteColor = '#FFFFFF';
    currentNotePinned = false;
    
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = content;
    updateNoteModalColor('#FFFFFF');
    updatePinButton(false);
    
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('saveBtn').textContent = 'Save';
    
    document.getElementById('noteModal').classList.remove('hidden');
    
    // Focus on the content area since we already have content
    setTimeout(() => {
        document.getElementById('noteContent').focus();
        // Move cursor to end of content
        const textarea = document.getElementById('noteContent');
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }, 10);
}

function openEditNote(note) {
    currentNoteId = note.id;
    currentNoteColor = note.color || '#FFFFFF';
    currentNotePinned = note.is_pinned;
    
    document.getElementById('noteTitle').value = note.title || '';
    document.getElementById('noteContent').value = note.content || '';
    updateNoteModalColor(currentNoteColor);
    updatePinButton(currentNotePinned);
    
    document.getElementById('deleteBtn').style.display = 'block';
    document.getElementById('saveBtn').textContent = 'Update';
    
    document.getElementById('noteModal').classList.remove('hidden');
    document.getElementById('noteTitle').focus();
}

function closeNoteModal() {
    document.getElementById('noteModal').classList.add('hidden');
    document.getElementById('colorPalette').classList.add('hidden');
}

function updateNoteModalColor(color) {
    const modal = document.querySelector('.note-modal');
    modal.style.backgroundColor = color;
    currentNoteColor = color;
    
    // Update selected color option
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-color') === color) {
            option.classList.add('selected');
        }
    });
}

function updatePinButton(isPinned) {
    const pinBtn = document.getElementById('pinBtn');
    if (isPinned) {
        pinBtn.classList.add('active');
        pinBtn.querySelector('.material-icons').textContent = 'push_pin';
    } else {
        pinBtn.classList.remove('active');
        pinBtn.querySelector('.material-icons').textContent = 'push_pin';
    }
    currentNotePinned = isPinned;
}

function toggleNotePin() {
    updatePinButton(!currentNotePinned);
}

function toggleColorPicker() {
    const palette = document.getElementById('colorPalette');
    palette.classList.toggle('hidden');
}

function selectColor(color) {
    updateNoteModalColor(color);
    document.getElementById('colorPalette').classList.add('hidden');
}

async function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    
    if (!title && !content) {
        showMessage('Please add a title or content', 'error');
        return;
    }
    
    const token = localStorage.getItem('studentToken');
    if (!token) return;
    
    const noteData = {
        title: title || 'Untitled',
        content: content,
        color: currentNoteColor,
        is_pinned: currentNotePinned
    };
    
    showLoading(true);
    
    try {
        const url = currentNoteId 
            ? `${API_BASE_URL}/notes/${currentNoteId}`
            : `${API_BASE_URL}/notes`;
        
        const method = currentNoteId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(noteData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(currentNoteId ? 'Note updated!' : 'Note created!', 'success');
            closeNoteModal();
            loadNotes();
        } else {
            showMessage(data.message || 'Failed to save note', 'error');
        }
    } catch (error) {
        console.error('Save note error:', error);
        showMessage('Connection error while saving note', 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteNote() {
    if (!currentNoteId) return;
    
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    const token = localStorage.getItem('studentToken');
    if (!token) return;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/notes/${currentNoteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Note deleted!', 'success');
            closeNoteModal();
            loadNotes();
        } else {
            showMessage(data.message || 'Failed to delete note', 'error');
        }
    } catch (error) {
        console.error('Delete note error:', error);
        showMessage('Connection error while deleting note', 'error');
    } finally {
        showLoading(false);
    }
}

// Utility functions
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.innerHTML = message;
    errorElement.classList.remove('hidden');
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.classList.add('hidden');
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    container.appendChild(messageDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Quick note save function
async function saveQuickNote() {
    const title = document.getElementById('quickNoteTitle').value.trim();
    const content = document.getElementById('quickNoteDescription').value.trim();
    
    if (!title && !content) {
        showMessage('Please add a title or description', 'error');
        return;
    }
    
    const token = localStorage.getItem('studentToken');
    if (!token) {
        showMessage('Please log in to save notes', 'error');
        return;
    }
    
    const noteData = {
        title: title || 'Untitled',
        content: content,
        color: '#FFFFFF',
        is_pinned: false
    };
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(noteData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Note saved!', 'success');
            // Clear the form
            document.getElementById('quickNoteTitle').value = '';
            document.getElementById('quickNoteDescription').value = '';
            document.getElementById('quickNoteDescription').style.height = '60px';
            // Reload notes to show the new one
            loadNotes();
        } else {
            showMessage(data.message || 'Failed to save note', 'error');
        }
    } catch (error) {
        console.error('Save quick note error:', error);
        showMessage('Connection error while saving note', 'error');
    } finally {
        showLoading(false);
    }
}
