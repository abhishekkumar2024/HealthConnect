# HealthConnect Frontend

A modern, responsive React frontend for the HealthConnect healthcare appointment booking system.

## Features

- 🔐 **Authentication**: Login, Register, Password Reset
- 👨‍⚕️ **Doctor Discovery**: Search and browse doctors by specialty
- 📅 **Appointment Booking**: Easy appointment scheduling
- 📊 **Dashboard**: Overview of appointments and statistics
- 👤 **Profile Management**: Update personal information and profile picture
- 💳 **Payment Integration**: Stripe payment processing (ready for integration)
- 📱 **Responsive Design**: Works on all devices
- 🎨 **Modern UI**: Built with Tailwind CSS

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Date-fns** - Date formatting

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   └── layout/       # Layout components (Navbar, Footer)
│   ├── context/          # React Context (AuthContext)
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   └── ...           # Other pages
│   ├── services/         # API service layer
│   ├── config/           # Configuration files
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/                # Static assets
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json          # Dependencies
```

## API Integration

The frontend is fully integrated with the backend API. All API calls are handled through service files in `src/services/`:

- `auth.service.js` - Authentication endpoints
- `appointment.service.js` - Appointment management
- `doctor.service.js` - Doctor listing and details
- `profile.service.js` - User profile management
- `search.service.js` - Search functionality

## Features in Detail

### Authentication
- User registration (Patient/Doctor)
- Login with email and password
- Password reset via email
- JWT token management with automatic refresh
- Protected routes

### Doctor Discovery
- Browse all doctors
- Search by name or specialty
- Filter by specialty
- View doctor profiles with ratings and reviews

### Appointment Management
- Request appointments
- View appointment history
- Filter appointments by status
- Cancel appointments
- Track appointment status

### Dashboard
- Overview of upcoming appointments
- Statistics (upcoming, pending, completed)
- Quick actions
- Role-based views (Patient/Doctor)

## Environment Variables

Create a `.env` file with:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Development

The frontend uses Vite for fast development with HMR (Hot Module Replacement). The dev server proxies API requests to the backend.

## Backend Integration

### Important: Connection Setup

The frontend and backend are now properly configured to work together:

1. **Development Mode** (Vite Proxy):
   - Frontend uses relative URLs (`/api/v1`)
   - Vite proxy automatically forwards requests to `http://localhost:3000`
   - No CORS issues in development

2. **Production Mode**:
   - Set `VITE_API_URL` environment variable
   - Backend must have `ALLOWED_ORIGINS` configured

### Starting Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server should start on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Server should start on http://localhost:5173
```

### Testing the Connection

1. Open browser DevTools (F12) → Console tab
2. Navigate to the frontend app
3. Check console for: `🔧 API Configuration: { baseURL: '/api/v1', ... }`
4. Try to login or make any API call
5. Check Network tab to see if requests are going to `/api/v1/...`

### Troubleshooting

**If requests are not reaching the backend:**

1. **Verify Backend is Running:**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```
   Should return: `{"success":true,"message":"API is running",...}`

2. **Check CORS Configuration:**
   - Backend now allows `http://localhost:5173` by default
   - In development, all origins are allowed

3. **Verify Vite Proxy:**
   - Check `vite.config.js` has proxy configuration
   - Restart Vite dev server after changes

4. **Check Browser Console:**
   - Look for CORS errors
   - Check Network tab for failed requests
   - Verify request URLs are `/api/v1/...` (not full URLs)

5. **Common Issues:**
   - **CORS Error**: Backend CORS is configured, restart backend if needed
   - **404 Error**: Verify backend routes are at `/api/v1/*`
   - **Connection Refused**: Make sure backend is running on port 3000
   - **Network Error**: Check firewall/antivirus blocking port 3000

See `CONNECTION_GUIDE.md` in the root directory for detailed troubleshooting.

## License

MIT
