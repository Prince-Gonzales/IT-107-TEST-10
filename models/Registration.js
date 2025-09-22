// Christopher
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class Registration {
    // Create a new registration (direct save, no approval needed)
    static async create(registrationData) {
        const { student_id, password, first_name, last_name } = registrationData;
        
        // Hash password with salt rounds of 10
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const query = `
            INSERT INTO registrations (student_id, password_hash, password_plain, first_name, last_name)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, student_id, first_name, last_name, registration_date, created_at
        `;
        
        const values = [student_id, password_hash, password, first_name, last_name];
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Find registration by student_id
    static async findByStudentId(student_id) {
        const query = 'SELECT * FROM registrations WHERE student_id = $1';
        
        try {
            const result = await pool.query(query, [student_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Find registration by ID
    static async findById(id) {
        const query = 'SELECT id, student_id, first_name, last_name, registration_date, created_at FROM registrations WHERE id = $1';
        
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Move registration to students table on first login
    static async moveToStudents(registrationId) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Get registration data
            const regQuery = 'SELECT * FROM registrations WHERE id = $1';
            const regResult = await client.query(regQuery, [registrationId]);
            
            if (regResult.rows.length === 0) {
                throw new Error('Registration not found');
            }
            
            const registration = regResult.rows[0];
            
            // Check if student already exists in students table
            const existingQuery = 'SELECT id FROM students WHERE student_id = $1';
            const existingResult = await client.query(existingQuery, [registration.student_id]);
            
            if (existingResult.rows.length > 0) {
                throw new Error('Student already exists in students table');
            }
            
            // Insert into students table (only ID, password, and registration reference)
            const studentQuery = `
                INSERT INTO students (student_id, password_hash, password_plain, registration_id)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            
            const studentValues = [
                registration.student_id,
                registration.password_hash,
                registration.password_plain,
                registration.id
            ];
            
            const studentResult = await client.query(studentQuery, studentValues);
            
            await client.query('COMMIT');
            return studentResult.rows[0];
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = Registration;
