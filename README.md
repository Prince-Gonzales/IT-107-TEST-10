# Student Note App Backend

A secure backend web application for student note management with PostgreSQL database integration, implementing the CIA Triad security principles.

## Features

- **Student Registration & Authentication**: Secure registration and login with JWT tokens
- **Note Management**: Create, read, update, delete, and pin notes (Google Keep-style)
- **CIA Triad Security Implementation**:
  - **Confidentiality**: JWT authentication, bcrypt password hashing, Helmet security headers
  - **Integrity**: Input validation, SQL injection protection, error handling
  - **Availability**: Rate limiting, CORS protection, health monitoring

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Security**: Helmet, express-rate-limit, express-validator
- **CORS**: cors middleware

## Database Setup

### Prerequisites
- PostgreSQL installed with pgAdmin4
- Database name: `student_note_app`
- Password: `12345678`

### Database Schema
Run the SQL commands in `database_schema.sql` in your PostgreSQL database to create the required tables.

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Update the `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=student_note_app
   DB_USER=postgres
   DB_PASSWORD=12345678
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   PORT=3000
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
Register a new student account.

**Request Body:**
```json
{
  "student_id": "2024001",
  "password": "securepassword",
  "email": "student@university.edu",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### POST `/api/auth/login`
Login with student credentials.

**Request Body:**
```json
{
  "student_id": "2024001",
  "password": "securepassword"
}
```

#### GET `/api/auth/profile`
Get current student profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### Notes Routes

#### GET `/api/notes`
Get all notes for the authenticated student.

#### POST `/api/notes`
Create a new note.

**Request Body:**
```json
{
  "title": "My Note Title",
  "content": "Note content here...",
  "color": "#FFEB3B",
  "is_pinned": false
}
```

#### PUT `/api/notes/:id`
Update an existing note.

#### DELETE `/api/notes/:id`
Delete a note.

#### PATCH `/api/notes/:id/toggle-pin`
Toggle the pin status of a note.

## Security Features (CIA Triad)

### Confidentiality
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **HTTPS Headers**: Helmet middleware for security headers
- **Environment Variables**: Sensitive data stored in environment variables

### Integrity
- **Input Validation**: express-validator for request validation
- **SQL Injection Protection**: Parameterized queries with pg library
- **Error Handling**: Comprehensive error handling without information leakage
- **Data Consistency**: Database constraints and triggers

### Availability
- **Rate Limiting**: Protection against DoS attacks
- **CORS Protection**: Controlled cross-origin requests
- **Health Monitoring**: Health check endpoint for system monitoring
- **Graceful Shutdown**: Proper cleanup on server shutdown

## Testing

Access the health check endpoint to verify the server is running:
```
GET http://localhost:3000/health
```

## Database Tables

### Students Table
- `id`: Primary key
- `student_id`: Unique student identifier
- `password_hash`: Hashed password
- `password_plain`: Plain password (for demo only - not recommended in production)
- `email`: Student email
- `first_name`: First name
- `last_name`: Last name
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Notes Table
- `id`: Primary key
- `student_id`: Foreign key to students table
- `title`: Note title
- `content`: Note content
- `color`: Hex color code for note display
- `is_pinned`: Boolean for pinned status
- `created_at`: Note creation timestamp
- `updated_at`: Last update timestamp

## Development Notes

- The application stores both hashed and plain passwords for demonstration purposes
- In production, only store hashed passwords
- JWT secret should be changed and kept secure in production
- Database credentials should be properly secured
- Consider implementing refresh tokens for enhanced security

## License

MIT License