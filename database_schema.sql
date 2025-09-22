-- Prince

-- Database name: student_note_app
-- Password: 12345678

-- Registrations table (for new registrations)
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_plain VARCHAR(255) NOT NULL, -- For demonstration only (NOT recommended in production)
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table (for students who have logged in at least once)
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_plain VARCHAR(255) NOT NULL, -- For demonstration only (NOT recommended in production)
    registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
    first_login_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    color VARCHAR(7) DEFAULT '#FFFFFF', -- Hex color code
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_registrations_student_id ON registrations(student_id);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_notes_student_id ON notes(student_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update the updated_at column
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
