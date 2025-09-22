const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Registration = require('../models/Registration');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/validation');

// Student Registration (saves directly to registrations table)
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
    try {
        const { student_id, password, first_name, last_name } = req.body;
        
        console.log('Registration attempt:', { student_id, first_name, last_name, password_length: password?.length });
        
        // Check if student ID already exists in registrations table
        const existingRegistration = await Registration.findByStudentId(student_id);
        if (existingRegistration) {
            console.log('Registration already exists:', student_id);
            return res.status(409).json({
                success: false,
                message: 'Student ID already registered'
            });
        }
        
        // Create new registration
        const newRegistration = await Registration.create({
            student_id,
            password,
            first_name,
            last_name
        });
        
        console.log('Registration created successfully:', newRegistration.student_id);
        
        res.status(201).json({
            success: true,
            message: 'Registration successful! You can now sign in with your credentials.',
            data: {
                registration: {
                    id: newRegistration.id,
                    student_id: newRegistration.student_id,
                    first_name: newRegistration.first_name,
                    last_name: newRegistration.last_name,
                    registration_date: newRegistration.registration_date
                }
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// Student Login (moves from registrations to students table on first login)
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
    try {
        const { student_id, password } = req.body;
        
        // First check if student exists in students table (already logged in before)
        let student = await Student.findByStudentId(student_id);
        
        if (student) {
            // Student already exists in students table, verify password
            const isPasswordValid = await Student.verifyPassword(password, student.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid student ID or password'
                });
            }
            
            // Get full student info with registration data
            const fullStudentInfo = await Student.findById(student.id);
            
            // Generate JWT token
            const token = generateToken(student);
            
            return res.json({
                success: true,
                message: 'Login successful',
                data: {
                    student: {
                        id: student.id,
                        student_id: student.student_id,
                        first_name: fullStudentInfo.first_name,
                        last_name: fullStudentInfo.last_name,
                        first_login_date: fullStudentInfo.first_login_date
                    },
                    token
                }
            });
        }
        
        // Student not in students table, check registrations table
        const registration = await Registration.findByStudentId(student_id);
        if (!registration) {
            return res.status(401).json({
                success: false,
                message: 'Invalid student ID or password'
            });
        }
        
        // Verify password from registration
        const isPasswordValid = await Registration.verifyPassword(password, registration.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid student ID or password'
            });
        }
        
        // First successful login - move to students table
        const newStudent = await Registration.moveToStudents(registration.id);
        
        // Get full student info with registration data
        const fullStudentInfo = await Student.findById(newStudent.id);
        
        // Generate JWT token
        const token = generateToken(newStudent);
        
        res.json({
            success: true,
            message: 'First login successful - account activated!',
            data: {
                student: {
                    id: newStudent.id,
                    student_id: newStudent.student_id,
                    first_name: fullStudentInfo.first_name,
                    last_name: fullStudentInfo.last_name,
                    first_login_date: fullStudentInfo.first_login_date
                },
                token
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});

// Get current student profile (requires authentication)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                student: req.user
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify token endpoint
router.post('/verify-token', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Token is valid',
            data: {
                student: req.user
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
