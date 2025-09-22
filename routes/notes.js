const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { authenticateToken } = require('../middleware/auth');
const { validateNote, handleValidationErrors } = require('../middleware/validation');

// Get all notes for the authenticated student
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notes = await Note.findByStudentId(req.user.id);
        
        res.json({
            success: true,
            message: 'Notes retrieved successfully',
            data: {
                notes,
                count: notes.length
            }
        });
        
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving notes'
        });
    }
});

// Get a specific note by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        
        if (isNaN(noteId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid note ID'
            });
        }
        
        const note = await Note.findById(noteId, req.user.id);
        
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Note retrieved successfully',
            data: {
                note
            }
        });
        
    } catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving note'
        });
    }
});

// Create a new note
router.post('/', authenticateToken, validateNote, handleValidationErrors, async (req, res) => {
    try {
        const { title, content, color, is_pinned } = req.body;
        
        const newNote = await Note.create({
            student_id: req.user.id,
            title,
            content,
            color,
            is_pinned
        });
        
        res.status(201).json({
            success: true,
            message: 'Note created successfully',
            data: {
                note: newNote
            }
        });
        
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating note'
        });
    }
});

// Update a note
router.put('/:id', authenticateToken, validateNote, handleValidationErrors, async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        
        if (isNaN(noteId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid note ID'
            });
        }
        
        const { title, content, color, is_pinned } = req.body;
        
        // Check if note exists and belongs to the user
        const existingNote = await Note.findById(noteId, req.user.id);
        if (!existingNote) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }
        
        const updatedNote = await Note.update(noteId, req.user.id, {
            title,
            content,
            color,
            is_pinned
        });
        
        res.json({
            success: true,
            message: 'Note updated successfully',
            data: {
                note: updatedNote
            }
        });
        
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating note'
        });
    }
});

// Delete a note
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        
        if (isNaN(noteId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid note ID'
            });
        }
        
        const deletedNote = await Note.delete(noteId, req.user.id);
        
        if (!deletedNote) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Note deleted successfully',
            data: {
                note: deletedNote
            }
        });
        
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting note'
        });
    }
});

// Toggle pin status of a note
router.patch('/:id/toggle-pin', authenticateToken, async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        
        if (isNaN(noteId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid note ID'
            });
        }
        
        // Check if note exists and belongs to the user
        const existingNote = await Note.findById(noteId, req.user.id);
        if (!existingNote) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }
        
        const updatedNote = await Note.togglePin(noteId, req.user.id);
        
        res.json({
            success: true,
            message: `Note ${updatedNote.is_pinned ? 'pinned' : 'unpinned'} successfully`,
            data: {
                note: updatedNote
            }
        });
        
    } catch (error) {
        console.error('Toggle pin error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while toggling pin status'
        });
    }
});

module.exports = router;
