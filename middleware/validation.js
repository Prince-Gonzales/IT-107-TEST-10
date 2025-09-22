// Prince

const { body, validationResult } = require('express-validator');

// Validation rules for student registration
const validateRegistration = [
    body('student_id')
        .trim()
        .isLength({ min: 3, max: 20 })
        .matches(/^[a-zA-Z0-9\-\_]+$/)
        .withMessage('Student ID must be 3-20 characters and can contain letters, numbers, hyphens, and underscores'),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    
    body('first_name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name must contain only letters and spaces'),
    
    body('last_name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name must contain only letters and spaces')
];

// Validation rules for student login
const validateLogin = [
    body('student_id')
        .trim()
        .notEmpty()
        .withMessage('Student ID is required'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Validation rules for note creation/update
const validateNote = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Title is required and must be less than 255 characters'),
    
    body('content')
        .optional()
        .trim()
        .isLength({ max: 10000 })
        .withMessage('Content must be less than 10000 characters'),
    
    body('color')
        .optional()
        .matches(/^#[0-9A-Fa-f]{6}$/)
        .withMessage('Color must be a valid hex color code'),
    
    body('is_pinned')
        .optional()
        .isBoolean()
        .withMessage('is_pinned must be a boolean value')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateNote,
    handleValidationErrors
};
