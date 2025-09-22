// Prince

const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const student = await Student.findById(decoded.id);
        
        if (!student) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token - student not found' 
            });
        }
        
        req.user = student;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        }
        
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
};

// Generate JWT Token
const generateToken = (student) => {
    return jwt.sign(
        { 
            id: student.id, 
            student_id: student.student_id 
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: '24h' // Token expires in 24 hours
        }
    );
};

module.exports = {
    authenticateToken,
    generateToken
};
