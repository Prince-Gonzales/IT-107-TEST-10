// Christopher
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class Student {
    // Create a new student
    static async create(studentData) {
        const { student_id, password, first_name, last_name } = studentData;
        
        // Hash password with salt rounds of 10
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const query = `
            INSERT INTO students (student_id, password_hash, password_plain, first_name, last_name)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, student_id, first_name, last_name, created_at
        `;
        
        const values = [student_id, password_hash, password, first_name, last_name];
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Find student by student_id
    static async findByStudentId(student_id) {
        const query = 'SELECT * FROM students WHERE student_id = $1';
        
        try {
            const result = await pool.query(query, [student_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Find student by ID (includes registration info)
    static async findById(id) {
        const query = `
            SELECT s.id, s.student_id, s.first_login_date, s.created_at,
                   r.first_name, r.last_name, r.registration_date
            FROM students s
            LEFT JOIN registrations r ON s.registration_id = r.id
            WHERE s.id = $1
        `;
        
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    
    // Get all students (for admin purposes) with registration info
    static async getAll() {
        const query = `
            SELECT s.id, s.student_id, s.first_login_date, s.created_at,
                   r.first_name, r.last_name, r.registration_date
            FROM students s
            LEFT JOIN registrations r ON s.registration_id = r.id
            ORDER BY s.created_at DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Student;
