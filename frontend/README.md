# Student Note App Frontend

A beautiful, Google Keep-inspired frontend for the Student Note App.

## Features

✅ **Clean, Modern Design**
- Google Keep-style interface
- Responsive design for all devices
- Material Design icons and colors

✅ **Student Authentication**
- Login and registration forms
- JWT token management
- Automatic session validation

✅ **Note Management**
- Create new notes with title and content
- Edit existing notes
- Delete notes
- Pin/unpin important notes
- Color coding for notes
- Grid layout with pinned notes on top

✅ **User Experience**
- Real-time updates
- Loading states
- Success/error messages
- Keyboard shortcuts (ESC to close modal)

## File Structure

```
frontend/
├── index.html    # Main HTML structure
├── styles.css    # CSS styles and responsive design
└── script.js     # JavaScript for API communication
```

## How to Use

1. **Start the Backend Server**:
   ```bash
   npm start
   ```

2. **Access the Frontend**:
   - Open your browser and go to: `http://localhost:3000`
   - The frontend is served automatically by the backend

3. **Register/Login**:
   - Create a new account with your student ID
   - Or login with existing credentials

4. **Manage Notes**:
   - Click "Take a note..." to create new notes
   - Click on existing notes to edit them
   - Use the pin button to pin important notes
   - Choose colors for better organization
   - Delete notes you no longer need

## API Integration

The frontend communicates with the backend API at `http://localhost:3000/api`:

- **Authentication**: `/auth/register`, `/auth/login`, `/auth/verify-token`
- **Notes**: `/notes` (GET, POST, PUT, DELETE)
- **Features**: Pin/unpin, color coding, real-time updates

## Responsive Design

The interface is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Browser Compatibility

Works on all modern browsers:
- Chrome, Firefox, Safari, Edge
- Requires JavaScript enabled