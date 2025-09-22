// Christopher
const pool = require('../config/database');

class Note {
    // Create a new note
    static async create(noteData) {
        const { student_id, title, content, color = '#FFFFFF', is_pinned = false } = noteData;
        
        const query = `
            INSERT INTO notes (student_id, title, content, color, is_pinned)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [student_id, title, content, color, is_pinned];
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Get all notes for a specific student
    static async findByStudentId(student_id) {
        const query = `
            SELECT * FROM notes 
            WHERE student_id = $1 
            ORDER BY is_pinned DESC, updated_at DESC
        `;
        
        try {
            const result = await pool.query(query, [student_id]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
    
    // Find note by ID and student ID (for security)
    static async findById(id, student_id) {
        const query = 'SELECT * FROM notes WHERE id = $1 AND student_id = $2';
        
        try {
            const result = await pool.query(query, [id, student_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Update a note
    static async update(id, student_id, updateData) {
        const { title, content, color, is_pinned } = updateData;
        
        const query = `
            UPDATE notes 
            SET title = $1, content = $2, color = $3, is_pinned = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5 AND student_id = $6
            RETURNING *
        `;
        
        const values = [title, content, color, is_pinned, id, student_id];
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Delete a note
    static async delete(id, student_id) {
        const query = 'DELETE FROM notes WHERE id = $1 AND student_id = $2 RETURNING *';
        
        try {
            const result = await pool.query(query, [id, student_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Toggle pin status
    static async togglePin(id, student_id) {
        const query = `
            UPDATE notes 
            SET is_pinned = NOT is_pinned, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND student_id = $2
            RETURNING *
        `;
        
        try {
            const result = await pool.query(query, [id, student_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Note;
