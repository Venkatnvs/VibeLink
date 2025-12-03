# VibeLink Installation Guide

This guide will help you set up and run the VibeLink project on your local machine. VibeLink is a full-stack social networking application with a Django REST API backend and a React + TypeScript frontend.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Python 3.11+**
   - Download from [python.org](https://www.python.org/downloads/)
   - Verify installation: `python --version` or `python3 --version`

2. **Node.js 18+ and npm**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

3. **Git** (optional, for cloning the repository)
   - Download from [git-scm.com](https://git-scm.com/downloads)

### Optional but Recommended

- **Code Editor**: VS Code, PyCharm, or any IDE of your choice
- **Postman** or **Thunder Client**: For testing API endpoints

## Project Structure

```
VibeLinkUI/
├── vibeLink_backend/          # Django REST API backend
│   ├── accounts/              # User authentication & management
│   ├── chat/                  # Chat functionality
│   ├── core/                  # Core utilities
│   ├── notifications/         # Notification system
│   ├── posts/                 # Post management
│   ├── settings/              # User settings
│   ├── social/                # Social features & AI matchmaking
│   ├── manage.py              # Django management script
│   ├── requirements.txt       # Python dependencies
│   └── db.sqlite3             # SQLite database (created after migrations)
│
└── vibe-link/                 # React + TypeScript frontend
    ├── src/                   # Source code
    ├── public/                # Static assets
    ├── package.json           # Node.js dependencies
    └── vite.config.ts         # Vite configuration
```

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd vibeLink_backend
```

### Step 2: Create Python Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

> **Note:** If you already have a virtual environment in the root directory, you can use that instead. The project structure shows a `venv/` folder at the root level.

### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install all required packages including:
- Django
- Django REST Framework
- Django CORS Headers
- JWT Authentication
- LangChain (for AI features)
- Pillow (for image processing)
- And other dependencies

### Step 4: Create Environment File

Create a `.env` file in the `vibeLink_backend` directory with the following variables:

```env
# Email Configuration (Required for email functionality)
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_PORT=587
EMAIL_TLS=True
EMAIL_FROM_EMAIL=your-email@gmail.com

# AI Configuration (Optional - has default value)
GEMINI_API_KEY=your-gemini-api-key
```

> **Note:** For Gmail, you'll need to generate an "App Password" instead of using your regular password. Go to your Google Account settings > Security > 2-Step Verification > App passwords.

### Step 5: Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

This will create the SQLite database and all necessary tables.

### Step 6: Create Superuser (Optional)

Create an admin user to access the Django admin panel:

```bash
python manage.py createsuperuser
```

Follow the prompts to set up your admin credentials.

### Step 7: Collect Static Files (Optional)

```bash
python manage.py collectstatic
```

This is mainly needed for production deployments.

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd vibe-link
```

### Step 2: Install Node Dependencies

```bash
npm install
```

This will install all required packages including:
- React 19
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS
- Radix UI components
- And other dependencies

### Step 3: Verify Frontend Configuration

The frontend is configured to connect to the backend at `http://127.0.0.1:8000`. This is set in:
- `src/apis/axios.ts` (base URL: `http://127.0.0.1:8000`)
- `src/constants/base.tsx` (API base URL: `http://127.0.0.1:8000/api`)

If your backend runs on a different port, update these files accordingly.

## Environment Configuration

### Backend Environment Variables

The backend requires the following environment variables (stored in `.env` file):

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `EMAIL_HOST` | SMTP server hostname | Yes | - |
| `EMAIL_HOST_USER` | SMTP username/email | Yes | - |
| `EMAIL_HOST_PASSWORD` | SMTP password/app password | Yes | - |
| `EMAIL_PORT` | SMTP port (usually 587 for TLS) | Yes | - |
| `EMAIL_TLS` | Use TLS encryption (True/False) | Yes | - |
| `EMAIL_FROM_EMAIL` | Default sender email | Yes | - |
| `GEMINI_API_KEY` | Google Gemini API key for AI features | No | Has default value |

### Frontend Configuration

The frontend doesn't require environment variables by default. The API base URL is hardcoded in the source files. If you need to change it:

1. Update `vibe-link/src/apis/axios.ts`:
   ```typescript
   const BASE_URL = "http://your-backend-url:port";
   ```

2. Update `vibe-link/src/constants/base.tsx`:
   ```typescript
   const BASE_URL = "http://your-backend-url:port/api";
   ```

## Running the Application

### Start the Backend Server

1. Navigate to the backend directory:
   ```bash
   cd vibeLink_backend
   ```

2. Activate your virtual environment (if not already activated):
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. Run the Django development server:
   ```bash
   python manage.py runserver
   ```

   The backend will start on `http://127.0.0.1:8000`

   - API endpoints: `http://127.0.0.1:8000/api/`
   - Admin panel: `http://127.0.0.1:8000/admin/`
   - API documentation (Swagger): `http://127.0.0.1:8000/swagger/`

### Start the Frontend Server

1. Open a new terminal window/tab

2. Navigate to the frontend directory:
   ```bash
   cd vibe-link
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` (or the next available port)

### Access the Application

- **Frontend**: Open your browser and navigate to `http://localhost:5173`
- **Backend API**: `http://127.0.0.1:8000/api/`
- **API Documentation**: `http://127.0.0.1:8000/swagger/`
- **Admin Panel**: `http://127.0.0.1:8000/admin/`

## Development Commands

### Backend Commands

```bash
# Run development server
python manage.py runserver

# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run Django shell
python manage.py shell

# Collect static files
python manage.py collectstatic
```

### Frontend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Troubleshooting

### Backend Issues

**Issue: ModuleNotFoundError**
- **Solution**: Ensure your virtual environment is activated and all dependencies are installed with `pip install -r requirements.txt`

**Issue: Database errors**
- **Solution**: Run `python manage.py migrate` to apply all migrations

**Issue: Email configuration errors**
- **Solution**: Verify your `.env` file exists and contains all required email configuration variables

**Issue: CORS errors**
- **Solution**: The backend has `CORS_ALLOW_ALL_ORIGINS = True` in settings, which should allow all origins. If issues persist, check that `django-cors-headers` is installed.

**Issue: Port 8000 already in use**
- **Solution**: Run the server on a different port: `python manage.py runserver 8001`

### Frontend Issues

**Issue: npm install fails**
- **Solution**: 
  - Clear npm cache: `npm cache clean --force`
  - Delete `node_modules` and `package-lock.json`, then run `npm install` again
  - Ensure you're using Node.js 18 or higher

**Issue: Cannot connect to backend**
- **Solution**: 
  - Verify the backend server is running on `http://127.0.0.1:8000`
  - Check that the API base URL in `src/apis/axios.ts` matches your backend URL
  - Check browser console for CORS errors

**Issue: TypeScript errors**
- **Solution**: Run `npm install` to ensure all type definitions are installed

**Issue: Port 5173 already in use**
- **Solution**: Vite will automatically use the next available port, or you can specify one: `npm run dev -- --port 3000`

### General Issues

**Issue: Changes not reflecting**
- **Solution**: 
  - For backend: Restart the Django server
  - For frontend: Vite has hot module replacement (HMR), changes should reflect automatically. If not, refresh the browser

**Issue: Database locked (SQLite)**
- **Solution**: Ensure only one Django server instance is running. SQLite doesn't handle concurrent writes well.

## Additional Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **React Documentation**: https://react.dev/
- **Vite Documentation**: https://vitejs.dev/
- **TypeScript Documentation**: https://www.typescriptlang.org/

## Production Deployment Notes

For production deployment, consider:

1. **Backend**:
   - Set `DEBUG = False` in settings
   - Use a production database (PostgreSQL, MySQL)
   - Set up proper `ALLOWED_HOSTS`
   - Use environment variables for sensitive data
   - Set up proper static file serving (WhiteNoise is already configured)
   - Use Gunicorn or uWSGI as WSGI server
   - Set up proper logging and monitoring

2. **Frontend**:
   - Build the production bundle: `npm run build`
   - Serve the `dist/` folder using a web server (Nginx, Apache)
   - Update API base URLs to point to production backend
   - Configure environment variables if needed

## Support

If you encounter any issues not covered in this guide, please:
1. Check the error messages in the console/terminal
2. Review the Django logs in `vibeLink_backend/logs/django.log`
3. Check browser console for frontend errors
4. Verify all prerequisites are installed correctly

---

**Happy Coding! 🚀**

